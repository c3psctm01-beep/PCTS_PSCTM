/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: scurve-export.js - High-Resolution S-Curve PNG Export & Clipboard Engine
 * ==============================================================================
 */

(function () {
    'use strict';

    /**
     * ส่งออกภาพกราฟ S-Curve ความละเอียดสูง พร้อมหัวกระดาษทางการ กฟภ.
     * @param {'download'|'copy'} action - เลือกว่าจะดาวน์โหลดเป็นไฟล์ PNG หรือคัดลอกลงคลิปบอร์ด
     */
    window.exportSCurveHD = async function (action = 'download') {
        const chartCanvas = document.getElementById('sCurveChart');
        if (!chartCanvas) {
            alert('ไม่พบกราฟ S-Curve ในหน้านี้');
            return;
        }

        const project = window.currentProjectViewData;
        const projectName = project ? project.name : 'โครงการสถานีไฟฟ้า กฟภ.';
        const planKpi = document.getElementById('scurvePlanKpi')?.innerText || '0.00%';
        const actualKpi = document.getElementById('scurveActualKpi')?.innerText || '0.00%';
        const varianceKpi = document.getElementById('scurveVarianceKpi')?.innerText || '0.00%';
        const healthKpi = document.getElementById('scurveHealthKpi')?.innerText || 'ปกติ';

        // สร้าง High-Res Canvas 2400 x 1400 px สำหรับนำเสนอ A4 / PowerPoint
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 2400;
        exportCanvas.height = 1450;
        const ctx = exportCanvas.getContext('2d');

        // 1. วาดพื้นหลังสีขาวสะอาด
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // 2. แถบ Header สีม่วง PEA Gradient
        const headerGradient = ctx.createLinearGradient(0, 0, exportCanvas.width, 0);
        headerGradient.addColorStop(0, '#742C81');
        headerGradient.addColorStop(0.5, '#5B2166');
        headerGradient.addColorStop(1, '#3F1247');
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, exportCanvas.width, 160);

        // แถบไฮไลต์ทอง PEA ด้านล่าง
        ctx.fillStyle = '#F39C12';
        ctx.fillRect(0, 160, exportCanvas.width, 8);

        // 3. ข้อความหัวเรื่องทางการ
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 44px "Prompt", sans-serif';
        ctx.fillText('⚡ การไฟฟ้าส่วนภูมิภาค (PEA) - ฝ่ายก่อสร้างสถานีไฟฟ้า', 70, 70);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '500 30px "Prompt", sans-serif';
        ctx.fillText(`กราฟ S-Curve ติดตามความก้าวหน้าโครงการ: ${projectName}`, 70, 125);

        // วันที่จัดพิมพ์มุมขวา
        const now = new Date();
        const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        const printDateText = `ข้อมูล ณ วันที่ ${now.getDate()} ${thaiMonths[now.getMonth()]} พ.ศ. ${now.getFullYear() + 543}`;
        ctx.font = '300 24px "Sarabun", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(printDateText, exportCanvas.width - 70, 100);
        ctx.textAlign = 'left';

        // 4. วาดการ์ด KPI Ribbon 4 ใบ
        const kpiBoxY = 195;
        const kpiBoxH = 110;
        const kpiBoxW = 530;
        const gap = 33;
        const startX = 70;

        const kpis = [
            { label: 'แผนงานสะสมตามสัญญา', val: planKpi, color: '#e67e22', bg: '#fef5e7' },
            { label: 'ผลงานจริงสะสมปัจจุบัน', val: actualKpi, color: '#742C81', bg: '#fbf5fd' },
            { label: 'ผลต่างเทียบแผน (Variance)', val: varianceKpi, color: parseFloat(varianceKpi) < -10 ? '#ef4444' : '#10b981', bg: '#f0fdf4' },
            { label: 'การประเมินสถานะโครงการ', val: healthKpi, color: '#2563eb', bg: '#eff6ff' }
        ];

        kpis.forEach((kpi, i) => {
            const bx = startX + i * (kpiBoxW + gap);
            // กล่อง
            ctx.fillStyle = kpi.bg;
            ctx.strokeStyle = kpi.color + '40';
            ctx.lineWidth = 2;
            roundRect(ctx, bx, kpiBoxY, kpiBoxW, kpiBoxH, 16, true, true);

            // ขีดสีนำหน้า
            ctx.fillStyle = kpi.color;
            roundRect(ctx, bx + 16, kpiBoxY + 20, 8, kpiBoxH - 40, 4, true, false);

            // Label
            ctx.fillStyle = '#64748b';
            ctx.font = '500 22px "Prompt", sans-serif';
            ctx.fillText(kpi.label, bx + 38, kpiBoxY + 45);

            // Value
            ctx.fillStyle = kpi.color;
            ctx.font = 'bold 36px "Prompt", sans-serif';
            ctx.fillText(kpi.val, bx + 38, kpiBoxY + 90);
        });

        // 5. วาดกราฟ Chart.js ลงบนพื้นที่หลัก
        const chartY = 335;
        const chartW = exportCanvas.width - 140;
        const chartH = exportCanvas.height - chartY - 75;

        // พื้นหลังการ์ดกราฟ
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        roundRect(ctx, 70, chartY, chartW, chartH, 20, true, true);

        // วาดภาพจาก Canvas ของ Chart.js
        ctx.drawImage(chartCanvas, 90, chartY + 20, chartW - 40, chartH - 40);

        // 6. Footer ลิขสิทธิ์
        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 20px "Sarabun", sans-serif';
        ctx.fillText('ระบบติดตามงานก่อสร้างสถานีไฟฟ้า (PEA Construction Tracking System - PCTS VER 4.0) • การไฟฟ้าส่วนภูมิภาค', 70, exportCanvas.height - 30);

        // ฟังก์ชันช่วยวาดสี่เหลี่ยมมุมมน
        function roundRect(context, x, y, width, height, radius, fill, stroke) {
            context.beginPath();
            context.moveTo(x + radius, y);
            context.lineTo(x + width - radius, y);
            context.quadraticCurveTo(x + width, y, x + width, y + radius);
            context.lineTo(x + width, y + height - radius);
            context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            context.lineTo(x + radius, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - radius);
            context.lineTo(x, y + radius);
            context.quadraticCurveTo(x, y, x + radius, y);
            context.closePath();
            if (fill) context.fill();
            if (stroke) context.stroke();
        }

        // 7. จัดการผลลัพธ์: Download หรือ Clipboard
        const cleanName = (projectName || 'Station').replace(/[^\wก-๙]/g, '_');
        const fileName = `SCurve_PEA_${cleanName}_${now.toISOString().split('T')[0]}.png`;

        if (action === 'download') {
            const link = document.createElement('a');
            link.download = fileName;
            link.href = exportCanvas.toDataURL('image/png');
            link.click();

            if (typeof Toastify === 'function') {
                Toastify({
                    text: `📊 ดาวน์โหลดภาพกราฟ S-Curve HD สำเร็จแล้ว!`,
                    duration: 3500,
                    style: { background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px' }
                }).showToast();
            }
        } else if (action === 'copy') {
            try {
                exportCanvas.toBlob(async (blob) => {
                    if (navigator.clipboard && window.ClipboardItem) {
                        await navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                        if (typeof Toastify === 'function') {
                            Toastify({
                                text: `📋 คัดลอกภาพกราฟ S-Curve HD ลงคลิปบอร์ดแล้ว! พร้อมวางใน PowerPoint หรือ Word`,
                                duration: 4000,
                                style: { background: 'linear-gradient(135deg, #742C81, #5B2166)', borderRadius: '8px' }
                            }).showToast();
                        }
                    } else {
                        // Fallback ถ้าเบราว์เซอร์ไม่รองรับ ClipboardItem
                        const link = document.createElement('a');
                        link.download = fileName;
                        link.href = exportCanvas.toDataURL('image/png');
                        link.click();
                        alert('เบราว์เซอร์ไม่รองรับการคัดลอกรูปภาพลงคลิปบอร์ดโดยตรง จึงดาวน์โหลดเป็นไฟล์รูปภาพให้แทนครับ');
                    }
                }, 'image/png');
            } catch (copyErr) {
                console.error('Clipboard copy error:', copyErr);
                alert('เกิดข้อผิดพลาดในการคัดลอกรูปภาพ: ' + copyErr.message);
            }
        }
    };

})();
