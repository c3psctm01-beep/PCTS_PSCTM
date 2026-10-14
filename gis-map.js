/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: gis-map.js - Substation GIS Map View (Leaflet.js)
 * ==============================================================================
 */

(function () {
    'use strict';

    let map = null;
    let markersLayer = null;

    // พิกัดเริ่มต้นจำลองสำหรับสถานีไฟฟ้าตัวอย่าง (กรณีไม่มีพิกัดในฐานข้อมูล)
    const fallbackCoordinates = {
        1: { lat: 13.547530, lng: 100.274410 }, // สถานีไฟฟ้าสมุทรสาคร 18 (ชั่วคราว)
        2: { lat: 13.568210, lng: 100.298530 }  // สถานีไฟฟ้าสมุทรสาคร 10 (ชั่วคราว)
    };

    /**
     * ดึงพิกัดปัจจุบันใส่ในฟอร์มแก้ไขโครงการ
     */
    window.getCurrentLocationForProject = async function () {
        const btn = event?.currentTarget;
        const origText = btn ? btn.innerHTML : '';
        if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังดึงพิกัด...';

        try {
            if (typeof window.getCurrentGpsCoordinates === 'function') {
                const coords = await window.getCurrentGpsCoordinates(6000);
                if (coords && coords.lat && coords.lng) {
                    const latInput = document.getElementById('projectLatInput');
                    const lngInput = document.getElementById('projectLngInput');
                    if (latInput) latInput.value = coords.lat.toFixed(6);
                    if (lngInput) lngInput.value = coords.lng.toFixed(6);
                    alert(`ดึงพิกัดสำเร็จ:\nละติจูด: ${coords.lat.toFixed(6)}\nลองจิจูด: ${coords.lng.toFixed(6)}`);
                } else {
                    alert('ไม่สามารถดึงพิกัด GPS ได้ โปรดตรวจสอบว่าเบราว์เซอร์อนุญาตการเข้าถึงตำแหน่งหรือไม่');
                }
            } else {
                alert('โมดูลระบุพิกัดไม่พร้อมทำงาน');
            }
        } catch (e) {
            alert('เกิดข้อผิดพลาดในการดึงพิกัด: ' + e.message);
        } finally {
            if (btn) btn.innerHTML = origText;
        }
    };

    /**
     * สร้าง Custom SVG Marker Pin ตามสถานะโครงการ
     */
    function createCustomMarkerIcon(statusColor, isCompleted) {
        if (typeof L === 'undefined') return null;

        const iconHtml = `
            <div class="gis-marker-pin" style="
                position: relative;
                width: 36px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
                cursor: pointer;
                transition: transform 0.2s ease;
            ">
                <svg viewBox="0 0 36 44" width="36" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 0C8.05888 0 0 8.05888 0 18C0 27.5 14.5 41.5 17.15 43.85C17.65 44.25 18.35 44.25 18.85 43.85C21.5 41.5 36 27.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="${statusColor}"/>
                    <circle cx="18" cy="18" r="13" fill="#FFFFFF"/>
                </svg>
                <div style="
                    position: absolute;
                    top: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: ${statusColor};
                    font-size: 14px;
                    font-weight: bold;
                ">
                    <i class="fa-solid ${isCompleted ? 'fa-check' : 'fa-bolt'}"></i>
                </div>
            </div>
        `;

        return L.divIcon({
            html: iconHtml,
            className: 'gis-custom-div-icon',
            iconSize: [36, 44],
            iconAnchor: [18, 44],
            popupAnchor: [0, -42]
        });
    }

    /**
     * กำหนดสีของโครงการบนแผนที่ตามความก้าวหน้า
     */
    function getProjectStatusColor(p) {
        if (p.status === 'แล้วเสร็จ') return { color: '#27ae60', isCompleted: true, label: 'แล้วเสร็จ' };
        if (p.status === 'อยู่ระหว่างออกแบบประมาณการ') return { color: '#8e44ad', isCompleted: false, label: 'ออกแบบประมาณการ' };
        if (p.status === 'อยู่ระหว่างรองบประมาณ' || p.status === 'อยู่ระหว่างจัดจ้าง') return { color: '#f39c12', isCompleted: false, label: p.status };

        // โครงการอยู่ระหว่างก่อสร้าง: เช็คความล่าช้า
        const prog = typeof calculateProjectProgress === 'function' ? calculateProjectProgress(p) : { plan: 0, actual: 0 };
        const diff = parseFloat(prog.plan) - parseFloat(prog.actual);

        if (diff >= 10) {
            return { color: '#e74c3c', isCompleted: false, label: 'ล่าช้ากว่าแผน (>10%)' };
        } else if (diff > 0) {
            return { color: '#f39c12', isCompleted: false, label: 'ช้ากว่าแผนเล็กน้อย' };
        } else {
            return { color: '#2980b9', isCompleted: false, label: 'เป็นไปตามแผนงาน' };
        }
    }

    /**
     * เริ่มต้นหรือเรนเดอร์แผนที่ GIS
     */
    window.renderGisMap = function () {
        const container = document.getElementById('gisMapContainer');
        if (!container || typeof L === 'undefined') return;

        // ถ้ายังไม่ได้สร้าง Instance แผนที่
        if (!map) {
            map = L.map('gisMapContainer', {
                center: [13.7563, 100.5018], // จุดศูนย์กลางประเทศไทย (กทม./ปริมณฑล)
                zoom: 9,
                zoomControl: true
            });

            // แผนที่ OpenStreetMap แบบคลีน
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | PEA PCTS GIS'
            }).addTo(map);

            markersLayer = L.layerGroup().addTo(map);
        }

        // ล้าง Marker เดิม
        markersLayer.clearLayers();

        const projs = window.projects || [];
        const bounds = [];

        projs.forEach((p, idx) => {
            // ดึงพิกัดจากโครงการ หรือ fallback
            let lat = p.latitude ? parseFloat(p.latitude) : null;
            let lng = p.longitude ? parseFloat(p.longitude) : null;

            if ((!lat || !lng) && fallbackCoordinates[p.id]) {
                lat = fallbackCoordinates[p.id].lat;
                lng = fallbackCoordinates[p.id].lng;
            }

            // ถ้าโครงการยังไม่มีพิกัด ให้สุ่มกระจายรอบๆ สมุทรสาคร/กทม. เพื่อให้เห็นบนแผนที่
            if (!lat || !lng) {
                lat = 13.547530 + ((idx * 0.035) - 0.05);
                lng = 100.274410 + ((idx * 0.045) - 0.03);
            }

            const { color, isCompleted, label } = getProjectStatusColor(p);
            const prog = typeof calculateProjectProgress === 'function' ? calculateProjectProgress(p) : { plan: 0, actual: 0 };
            const icon = createCustomMarkerIcon(color, isCompleted);

            const popupContent = `
                <div style="font-family: 'Sarabun', sans-serif; min-width: 240px; padding: 4px 2px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
                        <span style="font-size: 10px; font-weight: bold; background: ${color}20; color: ${color}; padding: 2px 7px; border-radius: 4px;">
                            ${label}
                        </span>
                        <span style="font-size: 11px; color: #64748b;">
                            <i class="fa-solid fa-tag"></i> ${p.type || 'จ้างเหมา'}
                        </span>
                    </div>
                    <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #1e293b; font-family: 'Prompt', sans-serif;">
                        ${p.name}
                    </h3>
                    <div style="font-size: 11.5px; color: #475569; margin-bottom: 8px; line-height: 1.5;">
                        <div><i class="fa-solid fa-user-gear" style="color: #64748b; width: 14px;"></i> <strong>ผู้ควบคุม:</strong> ${p.supervisor || '-'}</div>
                        <div><i class="fa-solid fa-helmet-safety" style="color: #64748b; width: 14px;"></i> <strong>ผู้รับเหมา:</strong> ${p.contractor || '-'}</div>
                    </div>
                    
                    <!-- Progress Strip -->
                    <div style="background: #f1f5f9; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                            <span>ความก้าวหน้าจริง: <strong style="color: ${color};">${prog.actual}%</strong></span>
                            <span style="color: #64748b;">แผน: ${prog.plan}%</span>
                        </div>
                        <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; position: relative;">
                            <div style="height: 100%; width: ${prog.plan}%; background: #94a3b8; position: absolute; top:0; left:0;"></div>
                            <div style="height: 100%; width: ${prog.actual}%; background: ${color}; position: absolute; top:0; left:0;"></div>
                        </div>
                    </div>

                    <button type="button" class="btn btn-primary" onclick="viewProjectDetails(${p.id})" style="width: 100%; padding: 6px 10px; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <i class="fa-solid fa-eye"></i> ดูรายละเอียดโครงการ
                    </button>
                </div>
            `;

            const marker = L.marker([lat, lng], { icon: icon }).bindPopup(popupContent, {
                maxWidth: 320,
                className: 'gis-pea-popup'
            });

            markersLayer.addLayer(marker);
            bounds.push([lat, lng]);
        });

        // จัดมุมมองแผนที่ให้ครอบคลุมทุก Marker
        if (bounds.length > 0) {
            setTimeout(() => {
                map.invalidateSize();
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
            }, 200);
        }
    };

    /**
     * ฟิลเตอร์ Marker บนแผนที่ตามคำค้นหา
     */
    window.filterGisMapByQuery = function (query = '') {
        if (!markersLayer) return;
        window.renderGisMap();
    };

})();
