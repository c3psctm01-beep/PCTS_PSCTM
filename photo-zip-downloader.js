/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: photo-zip-downloader.js - Batch Site Photos ZIP Downloader by Period
 * ==============================================================================
 */

(function () {
    'use strict';

    window.currentZipProjectId = null;

    /**
     * เปิดหน้าต่างดาวน์โหลดภาพถ่ายหน้างานเป็น ZIP
     * @param {number} projectId 
     */
    window.openPhotoZipModal = function (projectId = null) {
        let p = null;
        if (projectId && window.projects) {
            p = window.projects.find(proj => proj.id === projectId);
        } else if (window.currentProjectViewData) {
            p = window.currentProjectViewData;
        } else if (window.projects && window.projects.length > 0) {
            p = window.projects[0];
        }

        if (!p) {
            alert('ไม่พบข้อมูลโครงการสำหรับส่งออกรูปภาพ');
            return;
        }

        window.currentZipProjectId = p.id;

        const modal = document.getElementById('photoZipModal');
        if (!modal) {
            console.error('photoZipModal element not found');
            return;
        }

        document.getElementById('zipModalProjectTitle').textContent = p.name;

        // รวบรวมหมวดงาน WBS และเดือนที่มีภาพ
        const gallery = Array.isArray(p.gallery) ? p.gallery.filter(g => g && g.url) : [];
        const punchList = Array.isArray(p.punchList) ? p.punchList : [];
        const punchPhotoCount = punchList.filter(pl => pl.beforePhoto || pl.afterPhoto).length * 2;
        const totalPhotos = gallery.length + punchList.filter(pl => pl.beforePhoto).length + punchList.filter(pl => pl.afterPhoto).length;

        // แสดงสถิติจำนวนภาพ
        document.getElementById('zipTotalPhotoBadge').textContent = `${totalPhotos} รูปภาพในระบบ`;

        // Populate WBS task options
        const taskSelect = document.getElementById('zipFilterTaskSelect');
        if (taskSelect) {
            taskSelect.innerHTML = '<option value="all">-- ทุกหมวดงาน WBS --</option>';
            const tasksMap = new Map();
            gallery.forEach(g => {
                if (g.taskId && g.taskName) {
                    tasksMap.set(g.taskId, g.taskName);
                }
            });
            tasksMap.forEach((name, id) => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = name;
                taskSelect.appendChild(opt);
            });
        }

        // Populate Month options
        const monthSelect = document.getElementById('zipFilterMonthSelect');
        if (monthSelect) {
            monthSelect.innerHTML = '<option value="all">-- ทุกงวดเดือน --</option>';
            const monthsSet = new Set();
            gallery.forEach(g => {
                if (g.date) {
                    const m = g.date.substring(0, 7); // YYYY-MM
                    monthsSet.add(m);
                }
            });
            Array.from(monthsSet).sort().reverse().forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = `งวดเดือน ${m}`;
                monthSelect.appendChild(opt);
            });
        }

        // Reset progress bar
        const progressBox = document.getElementById('zipProgressBox');
        if (progressBox) progressBox.style.display = 'none';
        const btnStart = document.getElementById('btnStartZipDownload');
        if (btnStart) {
            btnStart.disabled = false;
            btnStart.innerHTML = '<i class="fa-solid fa-file-zipper"></i> สร้างและดาวน์โหลดไฟล์ ZIP';
        }

        modal.style.display = 'flex';
    };

    /**
     * ปิดหน้าต่างดาวน์โหลด ZIP
     */
    window.closePhotoZipModal = function () {
        const modal = document.getElementById('photoZipModal');
        if (modal) modal.style.display = 'none';
    };

    /**
     * เปลี่ยนตัวเลือกขอบเขตภาพ
     */
    window.onZipScopeChange = function (scope) {
        const rowTask = document.getElementById('zipRowTaskSelect');
        const rowMonth = document.getElementById('zipRowMonthSelect');

        if (rowTask) rowTask.style.display = (scope === 'wbs') ? 'block' : 'none';
        if (rowMonth) rowMonth.style.display = (scope === 'month') ? 'block' : 'none';
    };

    /**
     * แปลง URL รูปภาพเป็น Image Object
     */
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(new Error('ไม่สามารถโหลดรูปภาพได้: ' + src));
            img.src = src;
        });
    }

    /**
     * ประทับลายน้ำลงบนรูปภาพแล้วคืนค่าเป็น Blob (JPEG)
     */
    async function getWatermarkedBlob(imgSrc, options = {}) {
        try {
            const img = await loadImage(imgSrc);
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 1280;
            canvas.height = img.naturalHeight || img.height || 720;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // ใช้ฟังก์ชันลายน้ำมาตรฐานของ กฟภ.
            if (typeof window.applyGpsWatermark === 'function') {
                await window.applyGpsWatermark(canvas, options);
            }

            return new Promise((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.90);
            });
        } catch (e) {
            console.warn('[ZIP] Watermark failed, fallback to raw fetch:', e.message);
            // Fallback: ดึงเป็น raw blob ตรงๆ
            const resp = await fetch(imgSrc);
            return await resp.blob();
        }
    }

    /**
     * เริ่มกระบวนการสร้างและดาวน์โหลดไฟล์ ZIP
     */
    window.executePhotoZipDownload = async function () {
        if (typeof JSZip === 'undefined') {
            alert('กำลังโหลดไลบรารี JSZip กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
            return;
        }

        const p = window.projects ? window.projects.find(proj => proj.id === window.currentZipProjectId) : window.currentProjectViewData;
        if (!p) return;

        const scope = document.querySelector('input[name="zipScope"]:checked')?.value || 'all';
        const selectedTaskId = document.getElementById('zipFilterTaskSelect')?.value || 'all';
        const selectedMonth = document.getElementById('zipFilterMonthSelect')?.value || 'all';
        const stampWatermark = document.getElementById('chkZipStampWatermark')?.checked ?? true;
        const includeManifest = document.getElementById('chkZipIncludeManifest')?.checked ?? true;

        const btnStart = document.getElementById('btnStartZipDownload');
        const progressBox = document.getElementById('zipProgressBox');
        const progressFill = document.getElementById('zipProgressFill');
        const progressText = document.getElementById('zipProgressText');

        if (btnStart) {
            btnStart.disabled = true;
            btnStart.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบีบอัดรูปภาพ...';
        }
        if (progressBox) progressBox.style.display = 'block';

        const updateProgress = (current, total, statusText) => {
            const pct = Math.round((current / total) * 100);
            if (progressFill) progressFill.style.width = `${pct}%`;
            if (progressText) progressText.textContent = `${statusText} (${current}/${total} - ${pct}%)`;
        };

        try {
            const zip = new JSZip();
            const manifestRows = [
                ['ลำดับ', 'หมวดหมู่/งวดงาน', 'โฟลเดอร์', 'ชื่อไฟล์', 'วันที่ถ่าย', 'พิกัด GPS', 'คำอธิบาย']
            ];

            let photoQueue = [];

            // 1. รวบรวมภาพจาก Gallery
            if (scope === 'all' || scope === 'wbs' || scope === 'month') {
                const gallery = Array.isArray(p.gallery) ? p.gallery.filter(g => g && g.url) : [];
                gallery.forEach((g, idx) => {
                    if (scope === 'wbs' && selectedTaskId !== 'all' && String(g.taskId) !== String(selectedTaskId)) {
                        return;
                    }
                    if (scope === 'month' && selectedMonth !== 'all' && (!g.date || !g.date.startsWith(selectedMonth))) {
                        return;
                    }

                    const folderName = g.taskName ? `01_งวดงาน_${g.taskName.replace(/[\\/:*?"<>|]/g, '_')}` : '01_ความก้าวหน้าทั่วไป';
                    const fileDate = g.date ? g.date.replace(/-/g, '') : 'nodate';
                    const fileName = `IMG_${fileDate}_${String(idx + 1).padStart(3, '0')}.jpg`;

                    photoQueue.push({
                        type: 'gallery',
                        url: g.url,
                        folder: folderName,
                        fileName: fileName,
                        date: g.date || '-',
                        taskName: g.taskName || 'ความก้าวหน้าโครงการ',
                        desc: g.desc || '',
                        coords: { lat: p.latitude, lng: p.longitude }
                    });
                });
            }

            // 2. รวบรวมภาพจาก Punch List
            if (scope === 'all' || scope === 'punch') {
                const punchList = Array.isArray(p.punchList) ? p.punchList : [];
                punchList.forEach((pl, idx) => {
                    const plCode = `PL-${String(idx + 1).padStart(3, '0')}`;
                    const safeTitle = (pl.title || 'defect').replace(/[\\/:*?"<>|]/g, '_').substring(0, 30);

                    if (pl.beforePhoto) {
                        photoQueue.push({
                            type: 'punch_before',
                            url: pl.beforePhoto,
                            folder: '02_PunchList_ก่อนแก้ไข_Before',
                            fileName: `${plCode}_Before_${safeTitle}.jpg`,
                            date: pl.createdDate || '-',
                            taskName: `Punch List ก่อนแก้ไข: ${pl.title}`,
                            desc: `${pl.title} (${pl.location || 'หน้างาน'})`,
                            coords: { lat: p.latitude, lng: p.longitude }
                        });
                    }

                    if (pl.afterPhoto) {
                        photoQueue.push({
                            type: 'punch_after',
                            url: pl.afterPhoto,
                            folder: '02_PunchList_หลังแก้ไขเสร็จ_After',
                            fileName: `${plCode}_After_${safeTitle}.jpg`,
                            date: pl.resolvedDate || pl.createdDate || '-',
                            taskName: `Punch List แก้ไขเสร็จ: ${pl.title}`,
                            desc: `ตรวจรับเรียบร้อย: ${pl.title}`,
                            coords: { lat: p.latitude, lng: p.longitude }
                        });
                    }
                });
            }

            if (photoQueue.length === 0) {
                alert('ไม่พบรูปภาพตามเงื่อนไขที่เลือก');
                if (btnStart) {
                    btnStart.disabled = false;
                    btnStart.innerHTML = '<i class="fa-solid fa-file-zipper"></i> สร้างและดาวน์โหลดไฟล์ ZIP';
                }
                if (progressBox) progressBox.style.display = 'none';
                return;
            }

            // 3. ประมวลผลรูปภาพทีละรูป
            for (let i = 0; i < photoQueue.length; i++) {
                const item = photoQueue[i];
                updateProgress(i + 1, photoQueue.length, `กำลังประมวลผล ${item.fileName}`);

                try {
                    let blob = null;
                    if (stampWatermark) {
                        const userInfo = (typeof window.getCurrentUserInfo === 'function') ? window.getCurrentUserInfo() : {};
                        blob = await getWatermarkedBlob(item.url, {
                            projectName: p.name,
                            taskName: item.taskName,
                            empId: item.uploaderEmpId || userInfo.employee_id || '500744',
                            uploaderName: item.uploaderName || userInfo.name || '',
                            uploaderPosition: item.uploaderPosition || userInfo.position || '',
                            coords: item.coords
                        });
                    } else {
                        const resp = await fetch(item.url);
                        blob = await resp.blob();
                    }

                    // ใส่ลงใน Folder ของ ZIP
                    zip.folder(item.folder).file(item.fileName, blob);

                    // บันทึก Manifest CSV
                    const gpsStr = (item.coords && item.coords.lat) ? `${item.coords.lat.toFixed(6)}, ${item.coords.lng.toFixed(6)}` : '-';
                    manifestRows.push([
                        i + 1,
                        item.taskName,
                        item.folder,
                        item.fileName,
                        item.date,
                        `"${gpsStr}"`,
                        `"${(item.desc || '').replace(/"/g, '""')}"`
                    ]);
                } catch (imgErr) {
                    console.error('Error packaging photo:', item.fileName, imgErr);
                }
            }

            // 4. สร้าง Manifest CSV & README TXT
            if (includeManifest) {
                const csvContent = '\uFEFF' + manifestRows.map(r => r.join(',')).join('\n');
                zip.file('Photo_Manifest.csv', csvContent);

                const summaryText = `================================================================================
  การไฟฟ้าส่วนภูมิภาค (PROVINCIAL ELECTRICITY AUTHORITY)
  ระบบติดตามงานก่อสร้าง (PEA Construction Tracking System - PCTS Ver 4.0)
  สรุปรายการภาพถ่ายหน้างานส่งมอบงานงวด / งานตรวจรับ
================================================================================
โครงการ: ${p.name}
ผู้รับจ้าง: ${p.contractor || 'กฟภ.'}
ผู้ควบคุมงาน: ${p.supervisor || '-'}
วันที่ส่งออกไฟล์: ${new Date().toLocaleString('th-TH')}
จำนวนรูปภาพทั้งหมดในชุด: ${photoQueue.length} รูปภาพ
การประทับลายน้ำ GPS: ${stampWatermark ? 'ประทับลายน้ำดิจิทัล กฟภ. พร้อมพิกัด GPS เรียบร้อย' : 'ภาพต้นฉบับ'}

โครงสร้างโฟลเดอร์:
- โฟลเดอร์แยกตามงวดงาน WBS และรายการ Punch List ก่อน/หลัง
- ไฟล์ Photo_Manifest.csv สามารถเปิดด้วย Microsoft Excel เพื่อตรวจนับรายการภาพถ่ายได้ทันที
================================================================================`;
                zip.file('สรุปรายการภาพถ่ายส่งงวด.txt', summaryText);
            }

            // 5. Build ZIP Blob
            if (progressText) progressText.textContent = 'กำลังบีบอัดและสร้างไฟล์ ZIP...';
            const zipBlob = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            }, (meta) => {
                if (progressFill) progressFill.style.width = `${Math.round(meta.percent)}%`;
                if (progressText) progressText.textContent = `กำลังบีบอัดไฟล์: ${Math.round(meta.percent)}%`;
            });

            // 6. Trigger Download
            const cleanProjName = p.name.replace(/[\\/:*?"<>|]/g, '_').substring(0, 35);
            const dateStr = new Date().toISOString().split('T')[0];
            const zipFileName = `PCTS_Photos_${cleanProjName}_${dateStr}.zip`;

            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(zipBlob);
            downloadLink.download = zipFileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadLink.href);

            if (typeof Toastify === 'function') {
                Toastify({
                    text: `ดาวน์โหลดไฟล์ภาพถ่าย ZIP (${(zipBlob.size / 1024 / 1024).toFixed(1)} MB) สำเร็จแล้ว`,
                    duration: 4000,
                    style: { background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px' }
                }).showToast();
            }

            window.closePhotoZipModal();
        } catch (err) {
            console.error('Error generating zip:', err);
            alert('เกิดข้อผิดพลาดในการสร้างไฟล์ ZIP: ' + err.message);
        } finally {
            if (btnStart) {
                btnStart.disabled = false;
                btnStart.innerHTML = '<i class="fa-solid fa-file-zipper"></i> สร้างและดาวน์โหลดไฟล์ ZIP';
            }
            if (progressBox) progressBox.style.display = 'none';
        }
    };

    /**
     * ดาวน์โหลดเฉพาะภาพ Punch List เป็น ZIP แบบด่วน
     */
    window.downloadPunchListZip = function (projectId = null) {
        window.openPhotoZipModal(projectId);
        const radioPunch = document.getElementById('zipScope_punch');
        if (radioPunch) {
            radioPunch.checked = true;
            window.onZipScopeChange('punch');
        }
    };

})();
