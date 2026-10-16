/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: contract-eot.js - Contract Countdown & Extension of Time (EOT) Engine
 * ==============================================================================
 */

(function () {
    'use strict';

    /**
     * คำนวณวันสิ้นสุดสัญญาใหม่หลังรวมการขยายเวลา (EOT) และจำนวนวันคงเหลือ
     * @param {Object} project
     * @returns {Object} { originalEndDate, revisedEndDate, totalEotDays, daysRemaining, statusType, statusText, badgeHtml }
     */
    window.calculateProjectContractInfo = function (project) {
        if (!project) return null;

        const originalEndDateStr = project.endDate || '';
        const eotList = Array.isArray(project.eot) ? project.eot : [];

        // รวมจำนวนวันที่ได้รับการขยายสัญญา
        const totalEotDays = eotList.reduce((sum, item) => sum + (parseInt(item.days, 10) || 0), 0);

        if (!originalEndDateStr) {
            return {
                originalEndDate: '-',
                revisedEndDate: '-',
                totalEotDays: 0,
                daysRemaining: null,
                statusType: 'unknown',
                statusText: 'ไม่ระบุวันสิ้นสุด',
                badgeHtml: ''
            };
        }

        const origDate = new Date(originalEndDateStr);
        let revisedDate = new Date(origDate.getTime());
        if (totalEotDays > 0) {
            revisedDate.setDate(revisedDate.getDate() + totalEotDays);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkDate = new Date(revisedDate.getTime());
        checkDate.setHours(0, 0, 0, 0);

        const diffTime = checkDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const formatThaiDate = (d) => {
            if (!d || isNaN(d.getTime())) return '-';
            const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
        };

        const origThai = formatThaiDate(origDate);
        const revisedThai = formatThaiDate(revisedDate);

        let statusType = 'normal'; // normal, warning, danger, completed
        let statusText = '';
        let badgeClass = 'badge-contract-normal';

        if (project.status === 'แล้วเสร็จ') {
            statusType = 'completed';
            statusText = `ก่อสร้างแล้วเสร็จ (สิ้นสุดสัญญา: ${revisedThai})`;
            badgeClass = 'badge-contract-completed';
        } else if (daysRemaining < 0) {
            statusType = 'danger';
            const overdueDays = Math.abs(daysRemaining);
            statusText = `เกินกำหนดสัญญา ${overdueDays} วัน (สิ้นสุด ${revisedThai})`;
            badgeClass = 'badge-contract-danger';
        } else if (daysRemaining <= 30) {
            statusType = 'warning';
            statusText = `ใกล้สิ้นสุดสัญญา เหลือ ${daysRemaining} วัน (สิ้นสุด ${revisedThai})`;
            badgeClass = 'badge-contract-warning';
        } else {
            statusType = 'normal';
            statusText = `เหลือเวลาตามสัญญา ${daysRemaining} วัน (สิ้นสุด ${revisedThai})`;
            badgeClass = 'badge-contract-normal';
        }

        let eotTagHtml = '';
        if (totalEotDays > 0) {
            eotTagHtml = `<span class="eot-tag-pill" title="ขยายเวลาสัญญาแล้ว ${eotList.length} ครั้ง (+${totalEotDays} วัน)"><i class="fa-solid fa-clock-rotate-left"></i> EOT +${totalEotDays} วัน</span>`;
        }

        const badgeHtml = `
            <div class="contract-countdown-badge ${badgeClass}" onclick="window.openEotModal(${project.id})" title="คลิกเพื่อดูและจัดการประวัติการขยายเวลาสัญญา (EOT)">
                <i class="fa-solid ${daysRemaining < 0 ? 'fa-triangle-exclamation' : (daysRemaining <= 30 ? 'fa-hourglass-half' : 'fa-calendar-check')}"></i>
                <span class="countdown-text">${statusText}</span>
                ${eotTagHtml}
                <button type="button" class="btn-eot-quick" onclick="event.stopPropagation(); window.openEotModal(${project.id});" title="จัดการ EOT">
                    <i class="fa-solid fa-pen-to-square"></i> EOT
                </button>
            </div>
        `;

        return {
            originalEndDate: origThai,
            revisedEndDate: revisedThai,
            totalEotDays,
            daysRemaining,
            statusType,
            statusText,
            badgeHtml
        };
    };

    /**
     * เปิดหน้าต่างจัดการการขยายเวลาสัญญา (EOT Modal)
     */
    window.openEotModal = function (projectId) {
        const targetProj = window.projects ? window.projects.find(p => p.id === projectId) : null;
        if (!targetProj) return;

        window.currentEotProjectId = projectId;
        const modal = document.getElementById('eotModal');
        if (!modal) return;

        const titleEl = document.getElementById('eotProjectTitle');
        if (titleEl) titleEl.textContent = targetProj.name;

        window.renderEotTable(targetProj);
        modal.style.display = 'flex';
    };

    /**
     * ปิดหน้าต่าง EOT Modal
     */
    window.closeEotModal = function () {
        const modal = document.getElementById('eotModal');
        if (modal) modal.style.display = 'none';
    };

    /**
     * เรนเดอร์ตารางประวัติ EOT และสรุปวันสิ้นสุดสัญญา
     */
    window.renderEotTable = function (project) {
        const tbody = document.getElementById('eotTableBody');
        const summaryBox = document.getElementById('eotSummaryBox');
        if (!tbody) return;

        const info = window.calculateProjectContractInfo(project);
        const eotList = Array.isArray(project.eot) ? project.eot : [];

        if (summaryBox) {
            summaryBox.innerHTML = `
                <div class="eot-summary-grid">
                    <div class="eot-sum-item">
                        <span class="label">วันสิ้นสุดสัญญาเดิม:</span>
                        <strong class="val">${info.originalEndDate}</strong>
                    </div>
                    <div class="eot-sum-item">
                        <span class="label">รวมขยายเวลา (EOT):</span>
                        <strong class="val" style="color: var(--pea-purple);">${info.totalEotDays > 0 ? `+${info.totalEotDays} วัน (${eotList.length} ครั้ง)` : 'ยังไม่มีการขยายเวลา'}</strong>
                    </div>
                    <div class="eot-sum-item">
                        <span class="label">วันสิ้นสุดสัญญาใหม่:</span>
                        <strong class="val" style="color: ${info.statusType === 'danger' ? '#ef4444' : '#10b981'};">${info.revisedEndDate}</strong>
                    </div>
                    <div class="eot-sum-item">
                        <span class="label">สถานะคงเหลือ:</span>
                        <strong class="val">${info.daysRemaining !== null ? (info.daysRemaining < 0 ? `<span style="color:#ef4444;">เกิน ${Math.abs(info.daysRemaining)} วัน</span>` : `<span style="color:#10b981;">เหลือ ${info.daysRemaining} วัน</span>`) : '-'}</strong>
                    </div>
                </div>
            `;
        }

        tbody.innerHTML = '';
        if (eotList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #94a3b8; padding: 25px;">
                        <i class="fa-regular fa-clock" style="font-size: 24px; display: block; margin-bottom: 8px;"></i>
                        ยังไม่มีประวัติการขอขยายระยะเวลาสัญญา (EOT)
                    </td>
                </tr>
            `;
            return;
        }

        eotList.forEach((item, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center; font-weight: 600;">ครั้งที่ ${idx + 1}</td>
                <td style="color: var(--pea-purple); font-weight: 700; text-align: center;">+${item.days} วัน</td>
                <td><strong>${item.reason || '-'}</strong></td>
                <td><span style="font-size: 11.5px; color: #64748b;">${item.docNo || '-'}</span></td>
                <td>${item.approvedDate || '-'}</td>
                <td style="text-align: center;">
                    <button type="button" class="btn-icon-danger role-editor" onclick="window.deleteEotRecord(${idx})" title="ลบรายการนี้">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    /**
     * เพิ่มบันทึกการขอขยายระยะเวลาสัญญา (EOT)
     */
    window.saveNewEotRecord = async function (event) {
        if (event) event.preventDefault();
        const projId = window.currentEotProjectId;
        const project = window.projects ? window.projects.find(p => p.id === projId) : null;
        if (!project) return;

        const daysInput = document.getElementById('eotDaysInput');
        const reasonInput = document.getElementById('eotReasonInput');
        const docNoInput = document.getElementById('eotDocNoInput');
        const approveDateInput = document.getElementById('eotApproveDateInput');

        const days = parseInt(daysInput ? daysInput.value : 0, 10);
        if (!days || days <= 0) {
            alert('กรุณาระบุจำนวนวันที่ขอขยายสัญญาเป็นตัวเลขมากกว่า 0 วัน');
            return;
        }

        const reason = reasonInput ? reasonInput.value.trim() : '';
        const docNo = docNoInput ? docNoInput.value.trim() : '';
        const approvedDate = approveDateInput ? approveDateInput.value : new Date().toISOString().split('T')[0];

        if (!Array.isArray(project.eot)) project.eot = [];

        project.eot.push({
            id: Date.now(),
            days,
            reason: reason || 'ขอขยายสัญญาตามมติ กฟภ.',
            docNo,
            approvedDate
        });

        // บันทึกลงฐานข้อมูลและ localStorage
        try {
            if (typeof window.saveProjects === 'function') {
                await window.saveProjects(project.id);
            }
            if (typeof Toastify === 'function') {
                Toastify({
                    text: `บันทึกการขอขยายเวลาสัญญา (+${days} วัน) เรียบร้อยแล้ว`,
                    duration: 3500,
                    style: { background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px' }
                }).showToast();
            }

            // ล้างฟอร์ม
            if (daysInput) daysInput.value = '';
            if (reasonInput) reasonInput.value = '';
            if (docNoInput) docNoInput.value = '';

            // อัปเดตตารางและ Header โครงการ
            window.renderEotTable(project);
            if (window.currentProjectViewData && window.currentProjectViewData.id === project.id) {
                if (typeof window.openProjectDetail === 'function') {
                    window.openProjectDetail(project.id);
                }
            }
        } catch (err) {
            console.error('Error saving EOT:', err);
            alert('เกิดข้อผิดพลาดในการบันทึก EOT: ' + err.message);
        }
    };

    /**
     * ลบบันทึก EOT
     */
    window.deleteEotRecord = async function (index) {
        const projId = window.currentEotProjectId;
        const project = window.projects ? window.projects.find(p => p.id === projId) : null;
        if (!project || !Array.isArray(project.eot) || !project.eot[index]) return;

        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการขอขยายสัญญาครั้งที่ ${index + 1}?`)) {
            return;
        }

        project.eot.splice(index, 1);

        try {
            if (typeof window.saveProjects === 'function') {
                await window.saveProjects(project.id);
            }
            window.renderEotTable(project);
            if (window.currentProjectViewData && window.currentProjectViewData.id === project.id) {
                if (typeof window.openProjectDetail === 'function') {
                    window.openProjectDetail(project.id);
                }
            }
        } catch (err) {
            console.error('Error deleting EOT:', err);
            alert('เกิดข้อผิดพลาดในการลบ EOT: ' + err.message);
        }
    };

})();
