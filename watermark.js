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

        const projectName = options.projectName || 'สถานีไฟฟ้า กฟภ.';
        const taskName = options.taskName || 'บันทึกความก้าวหน้าโครงการ';
        const empId = options.empId ? `รหัสพนักงาน: ${options.empId}` : (options.userEmail || 'ผู้ควบคุมงาน กฟภ.');
        const timestampText = formatThaiTimestamp(new Date());

        let gpsText = 'GPS: ไม่พบสัญญาณพิกัดหน้างาน';
        if (options.coords && options.coords.lat && options.coords.lng) {
            const latFixed = options.coords.lat.toFixed(6);
            const lngFixed = options.coords.lng.toFixed(6);
            gpsText = `GPS: ${latFixed}, ${lngFixed}`;
        }

        // คำนวณความสูงของแถบลายน้ำตามสัดส่วนภาพ
        const bannerHeight = Math.max(70, Math.round(height * 0.14));
        const bannerY = height - bannerHeight;

        ctx.save();

        // 1. วาด Gradient แถบพื้นหลังลายน้ำ (PEA Dark Purple -> Black)
        const gradient = ctx.createLinearGradient(0, bannerY, 0, height);
        gradient.addColorStop(0, 'rgba(25, 10, 35, 0.0)');
        gradient.addColorStop(0.2, 'rgba(35, 15, 45, 0.88)');
        gradient.addColorStop(1, 'rgba(15, 5, 20, 0.96)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, bannerY, width, bannerHeight);

        // เส้นขอบบนสีม่วงประกายทอง (PEA Purple & Gold accent)
        ctx.strokeStyle = '#F39C12'; // PEA Gold
        ctx.lineWidth = Math.max(2, Math.round(width * 0.003));
        ctx.beginPath();
        ctx.moveTo(0, bannerY + (bannerHeight * 0.2));
        ctx.lineTo(width, bannerY + (bannerHeight * 0.2));
        ctx.stroke();

        // คำนวณขนาดตัวอักษร
        const baseFontSize = Math.max(11, Math.round(width * 0.024));
        const smallFontSize = Math.max(9, Math.round(width * 0.019));
        const paddingX = Math.max(14, Math.round(width * 0.025));

        ctx.textBaseline = 'middle';

        // 2. ป้ายสัญลักษณ์ PEA (Tag Badge ด้านซ้าย)
        const badgeY = bannerY + (bannerHeight * 0.38);
        ctx.fillStyle = '#742C81'; // PEA Purple
        const badgeWidth = Math.max(50, Math.round(width * 0.12));
        const badgeHeight = Math.max(16, Math.round(bannerHeight * 0.28));
        const radius = 3;

        // วาดสี่เหลี่ยมมน
        ctx.beginPath();
        ctx.roundRect(paddingX, badgeY - (badgeHeight / 2), badgeWidth, badgeHeight, radius);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(baseFontSize * 0.9)}px 'Prompt', 'Sarabun', sans-serif`;
        ctx.fillText('⚡ PEA', paddingX + 6, badgeY);

        // 3. ชื่อโครงการ
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${baseFontSize}px 'Prompt', 'Sarabun', sans-serif`;
        const projectTextX = paddingX + badgeWidth + 8;
        const maxProjectWidth = width - projectTextX - paddingX;
        
        let displayProject = projectName;
        if (ctx.measureText(displayProject).width > maxProjectWidth) {
            while (ctx.measureText(displayProject + '...').width > maxProjectWidth && displayProject.length > 0) {
                displayProject = displayProject.slice(0, -1);
            }
            displayProject += '...';
        }
        ctx.fillText(displayProject, projectTextX, badgeY);

        // 4. แถวล่าง: ชื่องานย่อย, พิกัด GPS, วันที่-เวลา, และผู้รายงาน
        const line2Y = bannerY + (bannerHeight * 0.68);
        const line3Y = bannerY + (bannerHeight * 0.88);

        ctx.font = `500 ${smallFontSize}px 'Sarabun', sans-serif`;
        ctx.fillStyle = '#E2E8F0';

        // งานย่อย
        ctx.fillText(`งาน: ${taskName}`, paddingX, line2Y);

        // พิกัด GPS (ตัวหนังสือสีเหลืองทองเพื่อให้อ่านง่าย)
        ctx.fillStyle = '#FCD34D';
        ctx.fillText(`📍 ${gpsText}`, paddingX, line3Y);

        // ด้านขวา: วันที่ และ รหัสพนักงาน
        ctx.fillStyle = '#CBD5E1';
        ctx.textAlign = 'right';
        ctx.fillText(`🕒 ${timestampText}`, width - paddingX, line2Y);
        ctx.fillText(`👤 ${empId}`, width - paddingX, line3Y);

        ctx.restore();
    };

})();
