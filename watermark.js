/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: watermark.js - Photo Timestamp & GPS Watermarking Engine
 * ==============================================================================
 */

(function () {
    'use strict';

    /**
     * ดึงพิกัด GPS ปัจจุบันผ่าน Geolocation API
     * @returns {Promise<{lat: number, lng: number, accuracy: number}|null>}
     */
    window.getCurrentGpsCoordinates = function (timeoutMs = 5000) {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.warn('[Watermark] Geolocation API ไม่รองรับในเบราว์เซอร์นี้');
                return resolve(null);
            }

            const options = {
                enableHighAccuracy: true,
                timeout: timeoutMs,
                maximumAge: 10000
            };

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: pos.coords.accuracy
                    };
                    console.log('[Watermark] ได้รับพิกัด GPS:', coords);
                    resolve(coords);
                },
                (err) => {
                    console.warn('[Watermark] ดึงพิกัด GPS ไม่สำเร็จ (' + err.code + '): ' + err.message);
                    resolve(null);
                },
                options
            );
        });
    };

    /**
     * ฟอร์แมตวันที่และเวลาไทยแบบเป็นทางการสำหรับประทับบนภาพ
     * @param {Date} date
     */
    function formatThaiTimestamp(date = new Date()) {
        const thaiMonths = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        const day = date.getDate();
        const month = thaiMonths[date.getMonth()];
        const year = date.getFullYear() + 543;
        const timeStr = date.toTimeString().split(' ')[0]; // HH:MM:SS
        return `${day} ${month} ${year} เวลา ${timeStr} น.`;
    }

    /**
     * ประทับลายน้ำ (Watermark) ทางการ กฟภ. ลงบน Canvas ภาพถ่าย
     * @param {HTMLCanvasElement} canvas - Canvas ที่มีภาพวาดอยู่แล้ว
     * @param {Object} options - ข้อมูลประกอบลายน้ำ
     * @param {string} options.projectName - ชื่อโครงการ/สถานีไฟฟ้า
     * @param {string} options.taskName - ชื่องานย่อย
     * @param {string} options.reportDate - วันที่รายงาน
     * @param {string} options.empId - รหัสพนักงานผู้ตรวจงาน
     * @param {Object|null} options.coords - { lat, lng }
     */
    window.applyGpsWatermark = async function (canvas, options = {}) {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // ดึงข้อมูลตัวตนผู้ตรวจงาน (รหัสพนักงาน, ชื่อ-นามสกุล, ตำแหน่ง)
        let empId = options.empId;
        let uploaderName = options.uploaderName;
        let uploaderPosition = options.uploaderPosition;

        if (!empId || !uploaderName || !uploaderPosition) {
            const userInfo = (typeof window.getCurrentUserInfo === 'function') ? window.getCurrentUserInfo() : {};
            if (!empId) empId = userInfo.employee_id || window.currentUserEmpId || (window.currentRole === 'admin' ? '500744' : '515883');
            if (!uploaderName) uploaderName = userInfo.name || window.currentUserName || (window.currentRole === 'admin' ? 'ภูวดล สุขศรี' : 'จิรพล ภัทรเสรี');
            if (!uploaderPosition) uploaderPosition = userInfo.position || window.currentUserPosition || (window.currentRole === 'admin' ? 'วิศวกร (Admin กบส.)' : 'ผู้ควบคุมงาน (Editor)');
        }

        const timestampText = formatThaiTimestamp(new Date());

        let gpsText = 'GPS: ไม่พบสัญญาณพิกัดหน้างาน';
        if (options.coords && options.coords.lat && options.coords.lng) {
            const latFixed = options.coords.lat.toFixed(6);
            const lngFixed = options.coords.lng.toFixed(6);
            gpsText = `GPS: ${latFixed}, ${lngFixed}`;
        }

        // คำนวณความสูงของแถบลายน้ำตามสัดส่วนภาพ (3 บรรทัดชัดเจน)
        const bannerHeight = Math.max(88, Math.round(height * 0.165));
        const bannerY = height - bannerHeight;

        ctx.save();

        // 1. วาด Gradient แถบพื้นหลังลายน้ำ (PEA Dark Purple -> Black)
        const gradient = ctx.createLinearGradient(0, bannerY, 0, height);
        gradient.addColorStop(0, 'rgba(25, 10, 35, 0.0)');
        gradient.addColorStop(0.18, 'rgba(32, 12, 42, 0.90)');
        gradient.addColorStop(1, 'rgba(12, 4, 18, 0.98)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, bannerY, width, bannerHeight);

        // เส้นขอบบนสีม่วงประกายทอง (PEA Gold accent)
        ctx.strokeStyle = '#F39C12'; // PEA Gold
        ctx.lineWidth = Math.max(2, Math.round(width * 0.0035));
        ctx.beginPath();
        ctx.moveTo(0, bannerY + (bannerHeight * 0.18));
        ctx.lineTo(width, bannerY + (bannerHeight * 0.18));
        ctx.stroke();

        // คำนวณขนาดตัวอักษร
        const baseFontSize = Math.max(11, Math.round(width * 0.023));
        const smallFontSize = Math.max(9.5, Math.round(width * 0.0185));
        const paddingX = Math.max(14, Math.round(width * 0.025));

        ctx.textBaseline = 'middle';

        // 2. ป้ายสัญลักษณ์ PEA (Tag Badge ด้านซ้าย)
        const badgeY = bannerY + (bannerHeight * 0.36);
        ctx.fillStyle = '#742C81'; // PEA Purple
        const badgeWidth = Math.max(50, Math.round(width * 0.11));
        const badgeHeight = Math.max(16, Math.round(bannerHeight * 0.24));
        const radius = 3;

        // วาดสี่เหลี่ยมมน
        ctx.beginPath();
        ctx.roundRect(paddingX, badgeY - (badgeHeight / 2), badgeWidth, badgeHeight, radius);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(baseFontSize * 0.9)}px 'Prompt', 'Sarabun', sans-serif`;
        ctx.fillText('⚡ PEA', paddingX + 6, badgeY);

        // 3. ชื่อโครงการ (ด้านซ้ายแถวที่ 1)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${baseFontSize}px 'Prompt', 'Sarabun', sans-serif`;
        const projectTextX = paddingX + badgeWidth + 8;
        const halfWidth = Math.round(width * 0.54);
        const maxProjectWidth = halfWidth - projectTextX;
        
        let displayProject = projectName;
        if (ctx.measureText(displayProject).width > maxProjectWidth) {
            while (ctx.measureText(displayProject + '...').width > maxProjectWidth && displayProject.length > 0) {
                displayProject = displayProject.slice(0, -1);
            }
            displayProject += '...';
        }
        ctx.fillText(displayProject, projectTextX, badgeY);

        // วันที่-เวลา (ด้านขวาแถวที่ 1)
        ctx.font = `500 ${smallFontSize}px 'Sarabun', sans-serif`;
        ctx.fillStyle = '#E2E8F0';
        ctx.textAlign = 'right';
        ctx.fillText(`🕒 ${timestampText}`, width - paddingX, badgeY);

        // 4. แถวกลาง: ชื่องานย่อย (ซ้าย) vs ชื่อ-นามสกุล และ รหัสพนักงาน (ขวา)
        const line2Y = bannerY + (bannerHeight * 0.64);
        ctx.textAlign = 'left';
        ctx.font = `500 ${smallFontSize}px 'Sarabun', sans-serif`;
        ctx.fillStyle = '#E2E8F0';

        let displayTask = `งาน: ${taskName}`;
        if (ctx.measureText(displayTask).width > (halfWidth - paddingX)) {
            while (ctx.measureText(displayTask + '...').width > (halfWidth - paddingX) && displayTask.length > 5) {
                displayTask = displayTask.slice(0, -1);
            }
            displayTask += '...';
        }
        ctx.fillText(displayTask, paddingX, line2Y);

        // ขวาแถว 2: ชื่อ-นามสกุล + รหัสพนักงาน
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `600 ${smallFontSize}px 'Sarabun', sans-serif`;
        ctx.fillText(`👤 ${uploaderName} (รหัส: ${empId})`, width - paddingX, line2Y);

        // 5. แถวล่าง: พิกัด GPS (ซ้าย) vs ตำแหน่ง/สังกัด (ขวา)
        const line3Y = bannerY + (bannerHeight * 0.86);
        ctx.textAlign = 'left';
        ctx.font = `500 ${smallFontSize}px 'Sarabun', sans-serif`;
        ctx.fillStyle = '#FCD34D'; // สีเหลืองทองเด่นชัด
        ctx.fillText(`📍 ${gpsText}`, paddingX, line3Y);

        // ขวาแถว 3: ตำแหน่ง/หน้าที่
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FCD34D'; // สีเหลืองทองเด่นชัด
        ctx.font = `600 ${smallFontSize}px 'Sarabun', sans-serif`;
        ctx.fillText(`💼 ตำแหน่ง: ${uploaderPosition}`, width - paddingX, line3Y);

        ctx.restore();
    };

})();
