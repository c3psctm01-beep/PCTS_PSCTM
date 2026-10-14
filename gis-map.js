/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: gis-map.js - Substation GIS Map View (Leaflet.js)
 * Displays Substation Positions Directly with Permanent Tooltips, Quick Jump Chips,
 * and Dedicated Project Detail Map
 * ==============================================================================
 */

(function () {
    'use strict';

    let map = null;
    let markersLayer = null;
    let detailMap = null;
    let detailMarkerLayer = null;
    const stationMarkersMap = {};
    const stationCoordsMap = {};

    // พิกัดจริง/แม่นยำสำหรับสถานีไฟฟ้าในระบบ PCTS
    const fallbackCoordinates = {
        1: { lat: 13.547530, lng: 100.274410 }, // สถานีไฟฟ้าสมุทรสาคร 18 (ชั่วคราว)
        2: { lat: 14.022780, lng: 99.532810 },  // สถานีไฟฟ้ากาญจนบุรี 5 (ชั่วคราว)
        3: { lat: 14.020500, lng: 100.170600 }, // งานติดตั้ง LBS 115 kV สฟ.บางเลน จ.นครปฐม
        4: { lat: 13.819600, lng: 100.044300 }, // สถานีไฟฟ้านครปฐม 5 (ชั่วคราว)
        7: { lat: 14.053200, lng: 99.498100 }   // สถานีไฟฟ้ากาญจนบุรี 6 (ชั่วคราว)
    };

    /**
     * ประมาณการพิกัดตำแหน่งสถานีไฟฟ้าจากชื่อหรือจังหวัดกรณีไม่มีในระบบ
     */
    function estimateCoordinatesByName(name) {
        if (!name) return null;
        const n = name.trim();
        if (n.includes('สมุทรสาคร') || n.includes('กระทุ่มแบน') || n.includes('บ้านแพ้ว')) {
            return { lat: 13.547530, lng: 100.274410, province: 'สมุทรสาคร' };
        }
        if (n.includes('กาญจนบุรี') || n.includes('ท่าม่วง') || n.includes('พนมทวน') || n.includes('ไทรโยค')) {
            return { lat: 14.022780, lng: 99.532810, province: 'กาญจนบุรี' };
        }
        if (n.includes('บางเลน')) {
            return { lat: 14.020500, lng: 100.170600, province: 'นครปฐม' };
        }
        if (n.includes('นครปฐม') || n.includes('กำแพงแสน') || n.includes('นครชัยศรี') || n.includes('สามพราน')) {
            return { lat: 13.819600, lng: 100.044300, province: 'นครปฐม' };
        }
        if (n.includes('ราชบุรี') || n.includes('บ้านโป่ง') || n.includes('โพธาราม')) {
            return { lat: 13.535800, lng: 99.816400, province: 'ราชบุรี' };
        }
        if (n.includes('สุพรรณบุรี') || n.includes('สองพี่น้อง') || n.includes('อู่ทอง')) {
            return { lat: 14.474500, lng: 100.117700, province: 'สุพรรณบุรี' };
        }
        if (n.includes('เพชรบุรี') || n.includes('ชะอำ') || n.includes('ท่ายาง')) {
            return { lat: 13.111900, lng: 99.939200, province: 'เพชรบุรี' };
        }
        if (n.includes('ประจวบ') || n.includes('หัวหิน') || n.includes('ปราณบุรี')) {
            return { lat: 11.812400, lng: 99.797200, province: 'ประจวบคีรีขันธ์' };
        }
        if (n.includes('นนทบุรี') || n.includes('บางบัวทอง') || n.includes('ปากเกร็ด')) {
            return { lat: 13.862100, lng: 100.514400, province: 'นนทบุรี' };
        }
        if (n.includes('ปทุมธานี') || n.includes('คลองหลวง') || n.includes('ธัญบุรี')) {
            return { lat: 14.020800, lng: 100.525000, province: 'ปทุมธานี' };
        }
        if (n.includes('อยุธยา') || n.includes('เสนา') || n.includes('บางปะอิน')) {
            return { lat: 14.353200, lng: 100.568400, province: 'พระนครศรีอยุธยา' };
        }
        return null;
    }

    /**
     * แปลงพิกัดโครงการโดยลำดับความสำคัญ (Database > Fallback > Name Estimation > Deterministic default)
     */
    function resolveProjectCoordinates(p, index = 0) {
        let lat = p.latitude ? parseFloat(p.latitude) : null;
        let lng = p.longitude ? parseFloat(p.longitude) : null;

        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            return { lat, lng, source: 'database' };
        }
        if (fallbackCoordinates[p.id]) {
            return { ...fallbackCoordinates[p.id], source: 'known' };
        }
        const est = estimateCoordinatesByName(p.name);
        if (est) {
            const jitterLat = ((index % 5) - 2) * 0.012;
            const jitterLng = (((index * 3) % 5) - 2) * 0.012;
            return { lat: est.lat + jitterLat, lng: est.lng + jitterLng, source: 'estimated' };
        }
        return {
            lat: 13.7563 + ((index * 0.035) - 0.05),
            lng: 100.5018 + ((index * 0.045) - 0.03),
            source: 'default'
        };
    }

    /**
     * แปลงชื่อสถานีให้กระชับสำหรับแสดงเป็นป้ายชื่อบนแผนที่
     */
    function cleanStationShortName(fullName) {
        if (!fullName) return 'สถานีไฟฟ้า';
        let n = fullName.trim();
        n = n.replace(/^โครงการก่อสร้าง\s*/i, '');
        n = n.replace(/^งาน\s*/i, '');
        if (n.includes('สถานีไฟฟ้า')) {
            n = n.replace(/สถานีไฟฟ้า/g, 'สฟ.');
        } else if (!n.startsWith('สฟ.')) {
            n = 'สฟ. ' + n;
        }
        if (n.length > 34) {
            return n.substring(0, 32) + '...';
        }
        return n;
    }

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
    function createCustomMarkerIcon(statusColor, isCompleted, isSelected = false) {
        if (typeof L === 'undefined') return null;

        const size = isSelected ? 42 : 36;
        const height = isSelected ? 50 : 44;

        const iconHtml = `
            <div class="gis-marker-pin ${isSelected ? 'is-selected' : ''}" style="
                position: relative;
                width: ${size}px;
                height: ${height}px;
                display: flex;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));
                cursor: pointer;
                transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            ">
                <svg viewBox="0 0 36 44" width="${size}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 0C8.05888 0 0 8.05888 0 18C0 27.5 14.5 41.5 17.15 43.85C17.65 44.25 18.35 44.25 18.85 43.85C21.5 41.5 36 27.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="${statusColor}"/>
                    <circle cx="18" cy="18" r="13" fill="#FFFFFF"/>
                </svg>
                <div style="
                    position: absolute;
                    top: ${isSelected ? 10 : 8}px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: ${statusColor};
                    font-size: ${isSelected ? 16 : 13}px;
                    font-weight: bold;
                ">
                    <i class="fa-solid ${isCompleted ? 'fa-check' : 'fa-bolt'}"></i>
                </div>
            </div>
        `;

        return L.divIcon({
            html: iconHtml,
            className: 'gis-custom-div-icon',
            iconSize: [size, height],
            iconAnchor: [size / 2, height],
            popupAnchor: [0, -height + 2]
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
     * บินไปยังสถานีไฟฟ้าที่ต้องการบนแผนที่ พร้อมเปิด Popup รายละเอียด
     */
    window.flyToStationOnMap = function (projectId) {
        if (!map) return;
        const entry = stationCoordsMap[projectId];
        if (!entry) return;

        map.flyTo([entry.lat, entry.lng], 15, {
            duration: 1.0,
            easeLinearity: 0.25
        });

        // เปิด Popup ของ Marker
        const marker = stationMarkersMap[projectId];
        if (marker) {
            setTimeout(() => {
                marker.openPopup();
            }, 700);
        }

        // Active State บนแถบชิป
        document.querySelectorAll('.gis-station-chip').forEach(chip => {
            if (chip.getAttribute('data-project-id') == projectId) {
                chip.classList.add('active');
                chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            } else {
                chip.classList.remove('active');
            }
        });
    };

    /**
     * จัดมุมมองให้เห็นสถานีทั้งหมด (Fit Bounds)
     */
    window.fitAllStationsOnMap = function () {
        if (!map) return;
        const coords = Object.values(stationCoordsMap).map(e => [e.lat, e.lng]);
        if (coords.length > 0) {
            map.fitBounds(coords, { padding: [50, 50], maxZoom: 14 });
        }
        document.querySelectorAll('.gis-station-chip').forEach(chip => chip.classList.remove('active'));
        const allBtn = document.getElementById('chipStationAll');
        if (allBtn) allBtn.classList.add('active');
    };

    /**
     * เรนเดอร์แถบเลือกสถานีไฟฟ้าแบบ Quick-Jump
     */
    function renderStationChips(projs) {
        const chipsBar = document.getElementById('gisStationChips');
        if (!chipsBar) return;

        let html = `
            <button id="chipStationAll" class="gis-station-chip active" onclick="fitAllStationsOnMap()" title="แสดงทุกสถานีพร้อมกัน">
                <i class="fa-solid fa-map"></i> ทุกสถานี (${projs.length})
            </button>
        `;

        projs.forEach(p => {
            const shortName = cleanStationShortName(p.name);
            const { color } = getProjectStatusColor(p);
            const prog = typeof calculateProjectProgress === 'function' ? calculateProjectProgress(p) : { plan: 0, actual: 0 };
            
            html += `
                <button class="gis-station-chip" data-project-id="${p.id}" onclick="flyToStationOnMap(${p.id})" title="${p.name}">
                    <span class="chip-status-dot" style="background: ${color};"></span>
                    <span class="chip-name">${shortName}</span>
                    <span class="chip-pct" style="color: ${color};">${prog.actual}%</span>
                </button>
            `;
        });

        chipsBar.innerHTML = html;
    }

    /**
     * เริ่มต้นหรือเรนเดอร์แผนที่ GIS รวมทุกสถานี
     */
    window.renderGisMap = function () {
        const container = document.getElementById('gisMapContainer');
        if (!container || typeof L === 'undefined') return;

        // ถ้ายังไม่ได้สร้าง Instance แผนที่
        if (!map) {
            map = L.map('gisMapContainer', {
                center: [13.7563, 100.5018],
                zoom: 9,
                zoomControl: true
            });

            // เลเยอร์แผนที่ OpenStreetMap คมชัด
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | PEA PCTS GIS'
            }).addTo(map);

            markersLayer = L.layerGroup().addTo(map);
        }

        // ล้าง Marker และ Map แคชเดิม
        markersLayer.clearLayers();
        Object.keys(stationMarkersMap).forEach(k => delete stationMarkersMap[k]);
        Object.keys(stationCoordsMap).forEach(k => delete stationCoordsMap[k]);

        const projs = (window.projects && window.projects.length > 0) ? window.projects : (window.defaultProjects || []);
        const bounds = [];

        // เรนเดอร์แถบสถานีไฟฟ้าด้านบน
        renderStationChips(projs);

        projs.forEach((p, idx) => {
            const { lat, lng } = resolveProjectCoordinates(p, idx);
            const { color, isCompleted, label } = getProjectStatusColor(p);
            const prog = typeof calculateProjectProgress === 'function' ? calculateProjectProgress(p) : { plan: 0, actual: 0 };
            const shortName = cleanStationShortName(p.name);

            stationCoordsMap[p.id] = { lat, lng, project: p };

            const icon = createCustomMarkerIcon(color, isCompleted);

            // 1. ป้ายระบุชื่อสถานีบนแผนที่โดยตรง (ไม่ต้องคลิกก็เห็นทันที)
            const tooltipHtml = `
                <div class="gis-station-badge" style="border-left: 3.5px solid ${color};">
                    <div class="gis-badge-title">
                        <i class="fa-solid fa-bolt" style="color: ${color}; margin-right: 4px;"></i>
                        <strong>${shortName}</strong>
                    </div>
                    <div class="gis-badge-meta">
                        <span class="gis-badge-pill" style="background: ${color}20; color: ${color};">
                            ${prog.actual}%
                        </span>
                        <span class="gis-badge-status">${label}</span>
                    </div>
                </div>
            `;

            // 2. ป๊อปอัปรายละเอียดเต็มเมื่อคลิกที่สถานี
            const googleNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            const popupContent = `
                <div style="font-family: 'Sarabun', sans-serif; min-width: 260px; padding: 2px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
                        <span style="font-size: 10px; font-weight: bold; background: ${color}20; color: ${color}; padding: 2px 7px; border-radius: 4px;">
                            ${label}
                        </span>
                        <span style="font-size: 11px; color: #64748b;">
                            <i class="fa-solid fa-tag"></i> ${p.type || 'จ้างเหมา'}
                        </span>
                    </div>
                    <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #1e293b; font-family: 'Prompt', sans-serif;">
                        ${p.name}
                    </h3>
                    <div style="font-size: 11.5px; color: #475569; margin-bottom: 8px; line-height: 1.6;">
                        <div><i class="fa-solid fa-location-dot" style="color: #64748b; width: 14px;"></i> <strong>พิกัด:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
                        <div><i class="fa-solid fa-user-gear" style="color: #64748b; width: 14px;"></i> <strong>ผู้ควบคุม:</strong> ${p.supervisor || '-'}</div>
                        <div><i class="fa-solid fa-helmet-safety" style="color: #64748b; width: 14px;"></i> <strong>ผู้รับเหมา:</strong> ${p.contractor || '-'}</div>
                    </div>
                    
                    <!-- แถบความก้าวหน้า -->
                    <div style="background: #f1f5f9; padding: 8px 10px; border-radius: 6px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                            <span>ผลงานจริง: <strong style="color: ${color}; font-size: 12px;">${prog.actual}%</strong></span>
                            <span style="color: #64748b;">แผนงาน: ${prog.plan}%</span>
                        </div>
                        <div style="height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; position: relative;">
                            <div style="height: 100%; width: ${prog.plan}%; background: #94a3b8; position: absolute; top:0; left:0;"></div>
                            <div style="height: 100%; width: ${prog.actual}%; background: ${color}; position: absolute; top:0; left:0;"></div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                        <button type="button" class="btn btn-primary" onclick="viewProjectDetails(${p.id})" style="padding: 7px 10px; font-size: 11.5px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 5px;">
                            <i class="fa-solid fa-eye"></i> รายละเอียด
                        </button>
                        <a href="${googleNavUrl}" target="_blank" class="btn" style="padding: 7px 10px; font-size: 11.5px; font-weight: 600; background: #10B981; color: white; display: flex; align-items: center; justify-content: center; gap: 5px; text-decoration: none; border-radius: 6px;">
                            <i class="fa-solid fa-diamond-turn-right"></i> นำทาง GPS
                        </a>
                    </div>
                </div>
            `;

            const marker = L.marker([lat, lng], { icon: icon });

            // ผูกป้ายชื่อถาวรให้แสดงทันทีบนแผนที่
            marker.bindTooltip(tooltipHtml, {
                permanent: true,
                direction: 'bottom',
                offset: [0, 6],
                className: 'gis-station-tooltip'
            });

            marker.bindPopup(popupContent, {
                maxWidth: 320,
                className: 'gis-pea-popup'
            });

            markersLayer.addLayer(marker);
            stationMarkersMap[p.id] = marker;
            bounds.push([lat, lng]);
        });

        // จัดมุมมองแผนที่ให้ครอบคลุมทุกสถานี
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 50);

        if (bounds.length > 0) {
            setTimeout(() => {
                if (map) {
                    map.invalidateSize();
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
                }
            }, 200);
        } else {
            setTimeout(() => {
                if (map) map.invalidateSize();
            }, 200);
        }
    };

    /**
     * คัดลอกพิกัด GPS ไปยังคลิปบอร์ด
     */
    window.copyStationCoordinates = function (coordsText) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(coordsText).then(() => {
                alert(`คัดลอกพิกัด "${coordsText}" เรียบร้อยแล้ว`);
            }).catch(() => {
                prompt('คัดลอกพิกัด GPS:', coordsText);
            });
        } else {
            prompt('คัดลอกพิกัด GPS:', coordsText);
        }
    };

    /**
     * เรนเดอร์แผนที่ตำแหน่งสถานีเฉพาะโครงการ ในหน้า Project Details (Tab: ตำแหน่งสถานี)
     */
    window.renderProjectDetailMap = function (project = null) {
        const p = project || window.currentProjectViewData;
        const container = document.getElementById('projectDetailMapContainer');
        if (!container || !p || typeof L === 'undefined') return;

        const { lat, lng } = resolveProjectCoordinates(p, 0);
        const { color, isCompleted, label } = getProjectStatusColor(p);
        const shortName = cleanStationShortName(p.name);
        const googleNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

        // อัปเดตข้อมูลการ์ดตำแหน่งสถานี
        const titleEl = document.getElementById('detailMapStationTitle');
        const coordsEl = document.getElementById('detailMapStationCoords');
        const statusEl = document.getElementById('detailMapStationStatus');
        const navBtn = document.getElementById('detailMapNavBtn');
        const copyBtn = document.getElementById('detailMapCopyBtn');

        if (titleEl) titleEl.textContent = p.name;
        if (coordsEl) coordsEl.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        if (statusEl) {
            statusEl.innerHTML = `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color}; margin-right: 5px;"></span>${label}`;
        }
        if (navBtn) navBtn.href = googleNavUrl;
        if (copyBtn) copyBtn.setAttribute('onclick', `copyStationCoordinates('${lat.toFixed(6)}, ${lng.toFixed(6)}')`);

        // ถ้ายังไม่ได้สร้าง Instance แผนที่ของหน้ารายละเอียด
        if (!detailMap) {
            detailMap = L.map('projectDetailMapContainer', {
                center: [lat, lng],
                zoom: 15,
                zoomControl: true
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap | PEA PCTS'
            }).addTo(detailMap);

            detailMarkerLayer = L.layerGroup().addTo(detailMap);
        } else {
            detailMarkerLayer.clearLayers();
            detailMap.setView([lat, lng], 15);
        }

        const icon = createCustomMarkerIcon(color, isCompleted, true);
        const marker = L.marker([lat, lng], { icon: icon });

        // ป้ายชื่อถาวรบนแผนที่
        marker.bindTooltip(`
            <div class="gis-station-badge" style="border-left: 3.5px solid ${color};">
                <div class="gis-badge-title">
                    <i class="fa-solid fa-bolt" style="color: ${color}; margin-right: 4px;"></i>
                    <strong>${shortName}</strong>
                </div>
                <div class="gis-badge-meta">
                    <span style="color: #64748b;">${lat.toFixed(5)}, ${lng.toFixed(5)}</span>
                </div>
            </div>
        `, {
            permanent: true,
            direction: 'bottom',
            offset: [0, 8],
            className: 'gis-station-tooltip'
        });

        // วงรัศมีจำลองสถานีไฟฟ้า 300 เมตร
        const circle = L.circle([lat, lng], {
            radius: 300,
            color: color,
            fillColor: color,
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '4, 4'
        });

        detailMarkerLayer.addLayer(circle);
        detailMarkerLayer.addLayer(marker);

        setTimeout(() => {
            detailMap.invalidateSize();
            detailMap.setView([lat, lng], 15);
        }, 120);
    };

    /**
     * ฟิลเตอร์ Marker บนแผนที่ตามคำค้นหา
     */
    window.filterGisMapByQuery = function (query = '') {
        window.renderGisMap();
    };

})();
