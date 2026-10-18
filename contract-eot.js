/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: contract-eot.js - Contract Countdown, Extension of Time (EOT) & Penalty Engine
 * ==============================================================================
 */

(function () {
    'use strict';

    window.currentEotActiveTab = 'records';
    window.currentSimulatedEotDays = 0;

    /**
     * คำนวณวันสิ้นสุดสัญญาใหม่หลังรวมการขยายเวลา (EOT), ค่าปรับ และจำนวนวันคงเหลือ
     * @param {Object} project
     * @param {number} simulatedEotDays - จำนวนวันขยายสัญญาจำลอง (สำหรับ Simulator)
     * @returns {Object}
     */
    window.calculateProjectContractInfo = function (project, simulatedEotDays = 0) {
        if (!project) return null;

        const originalEndDateStr = project.endDate || '';
        const eotList = Array.isArray(project.eot) ? project.eot : [];

        // รวมจำนวนวันที่ได้รับการขยายสัญญาจริง
        const approvedEotDays = eotList.reduce((sum, item) => sum + (parseInt(item.days, 10) || 0), 0);
        const totalEotDays = approvedEotDays + (parseInt(simulatedEotDays, 10) || 0);

        // วงเงินสัญญา (Contract Value)
        const contractValue = parseFloat(project.contractValue) || 
                              parseFloat(project.budget) || 
                              (project.disbursement && project.disbursement.budget ? parseFloat(project.disbursement.budget) : 50000000);

        // อัตราค่าปรับตามสัญญา (PEA Regulation / พ.ร.บ. จัดซื้อจัดจ้างฯ ม.103: งานก่อสร้างปกติ 0.05% - 0.10% ต่อวัน)
        const penaltyRatePercent = parseFloat(project.penaltyRatePercent) || 0.05;
        const penaltyRateType = project.penaltyRateType || 'percent'; // 'percent' หรือ 'fixed'
        const dailyPenaltyFixed = parseFloat(project.dailyPenaltyFixed) || 0;

        // คำนวณค่าปรับรายวัน (Daily Penalty Rate)
        const dailyPenalty = (penaltyRateType === 'fixed' && dailyPenaltyFixed > 0)
            ? dailyPenaltyFixed
            : Math.round(contractValue * (penaltyRatePercent / 100));

        if (!originalEndDateStr) {
            return {
                originalEndDate: '-',
                revisedEndDate: '-',
                approvedEotDays: 0,
                totalEotDays: 0,
                daysRemaining: null,
                overdueDays: 0,
                contractValue,
                penaltyRatePercent,
                dailyPenalty,
                totalPenalty: 0,
                penaltyPercentage: 0,
                isCriticalPenalty: false,
                penaltySaved: 0,
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

        // คำนวณวันสิ้นสุดหลังอนุมัติจริง (Approved Only)
        let approvedRevisedDate = new Date(origDate.getTime());
        if (approvedEotDays > 0) {
            approvedRevisedDate.setDate(approvedRevisedDate.getDate() + approvedEotDays);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkDate = new Date(revisedDate.getTime());
        checkDate.setHours(0, 0, 0, 0);

        const diffTime = checkDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // คำนวณวันคงเหลือตาม EOT ที่อนุมัติจริง (Base Days Remaining)
        const approvedCheckDate = new Date(approvedRevisedDate.getTime());
        approvedCheckDate.setHours(0, 0, 0, 0);
        const approvedDiffTime = approvedCheckDate.getTime() - today.getTime();
        const approvedDaysRemaining = Math.ceil(approvedDiffTime / (1000 * 60 * 60 * 24));

        // จำนวนวันที่เกินกำหนดสัญญา
        const overdueDays = (project.status === 'แล้วเสร็จ') ? 0 : Math.max(0, -daysRemaining);
        const approvedOverdueDays = (project.status === 'แล้วเสร็จ') ? 0 : Math.max(0, -approvedDaysRemaining);

        // คำนวณยอดค่าปรับสะสม (Total Accumulated Penalty)
        const totalPenalty = overdueDays * dailyPenalty;
        const basePenalty = approvedOverdueDays * dailyPenalty;
        const penaltySaved = Math.max(0, basePenalty - totalPenalty);

        // สัดส่วนค่าปรับเทียบกับมูลค่าสัญญา
        const penaltyPercentage = contractValue > 0 ? ((totalPenalty / contractValue) * 100) : 0;
        const isCriticalPenalty = penaltyPercentage >= 10.0; // ค่าปรับเกิน 10% ตามระเบียบ กฟภ.

        const formatThaiDate = (d) => {
            if (!d || isNaN(d.getTime())) return '-';
            const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            return `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
        };

        const origThai = formatThaiDate(origDate);
        const revisedThai = formatThaiDate(revisedDate);
        const approvedRevisedThai = formatThaiDate(approvedRevisedDate);

        let statusType = 'normal'; // normal, warning, danger, completed
        let statusText = '';
        let badgeClass = 'badge-contract-normal';

        if (project.status === 'แล้วเสร็จ') {
            statusType = 'completed';
            statusText = `ก่อสร้างแล้วเสร็จ (สิ้นสุดสัญญา: ${revisedThai})`;
            badgeClass = 'badge-contract-completed';
        } else if (daysRemaining < 0) {
            statusType = 'danger';
            const penaltyText = totalPenalty > 0 ? ` (ค่าปรับ: ฿${totalPenalty.toLocaleString()})` : '';
            statusText = `เกินสัญญา ${overdueDays} วัน${penaltyText}`;
            badgeClass = isCriticalPenalty ? 'badge-contract-critical' : 'badge-contract-danger';
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
        if (approvedEotDays > 0) {
            eotTagHtml = `<span class="eot-tag-pill" title="ขยายเวลาสัญญาแล้ว ${eotList.length} ครั้ง (+${approvedEotDays} วัน)"><i class="fa-solid fa-clock-rotate-left"></i> EOT +${approvedEotDays} วัน</span>`;
        }

        let penaltyTagHtml = '';
        if (overdueDays > 0) {
            penaltyTagHtml = `
                <span class="penalty-tag-pill ${isCriticalPenalty ? 'penalty-critical' : ''}" title="ค่าปรับรายวัน ฿${dailyPenalty.toLocaleString()}/วัน สะสม ${overdueDays} วัน">
                    <i class="fa-solid fa-triangle-exclamation"></i> ค่าปรับ ฿${totalPenalty.toLocaleString()} (${penaltyPercentage.toFixed(2)}%)
                </span>
            `;
        }

        const badgeHtml = `
            <div class="contract-countdown-badge ${badgeClass}" onclick="window.openEotModal('${project.id}')" title="คลิกเพื่อจัดการ EOT และคำนวณค่าปรับสัญญา">
                <i class="fa-solid ${daysRemaining < 0 ? (isCriticalPenalty ? 'fa-circle-radiation' : 'fa-triangle-exclamation') : (daysRemaining <= 30 ? 'fa-hourglass-half' : 'fa-calendar-check')}"></i>
                <span class="countdown-text">${statusText}</span>
                ${eotTagHtml}
                ${penaltyTagHtml}
                <button type="button" class="btn-eot-quick" onclick="event.stopPropagation(); window.openEotModal('${project.id}');" title="จัดการ EOT และคำนวณค่าปรับ">
                    <i class="fa-solid fa-calculator"></i> EOT & ค่าปรับ
                </button>
            </div>
        `;

        return {
            originalEndDate: origThai,
            revisedEndDate: revisedThai,
            approvedRevisedEndDate: approvedRevisedThai,
            approvedEotDays,
            totalEotDays,
            simulatedEotDays,
            daysRemaining,
            overdueDays,
            contractValue,
            penaltyRatePercent,
            dailyPenalty,
            totalPenalty,
            penaltyPercentage,
            isCriticalPenalty,
            penaltySaved,
            statusType,
            statusText,
            badgeHtml
        };
    };

    /**
     * เปิดหน้าต่างจัดการ EOT และคำนวณค่าปรับสัญญา (Modal)
     */
    window.openEotModal = function (projectId, initialTab = 'records') {
        const targetProj = window.projects ? window.projects.find(p => p.id === projectId) : null;
        if (!targetProj) return;

        window.currentEotProjectId = projectId;
        window.currentSimulatedEotDays = 0;
        window.currentEotActiveTab = initialTab;

        const modal = document.getElementById('eotModal');
        if (!modal) return;

        const titleEl = document.getElementById('eotProjectTitle');
        if (titleEl) {
            titleEl.textContent = `${targetProj.name} (${targetProj.contractor || 'กฟภ.'})`;
        }

        window.switchEotModalTab(initialTab);
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
     * สลับแท็บในหน้าต่าง EOT Modal
     */
    window.switchEotModalTab = function (tabName) {
        window.currentEotActiveTab = tabName;
        const targetProj = window.projects ? window.projects.find(p => p.id === window.currentEotProjectId) : null;
        if (!targetProj) return;

        // ปรับปุ่ม Tab Navigation
        const tabs = ['records', 'penalty', 'summary'];
        tabs.forEach(t => {
            const btn = document.getElementById(`btnEotTab_${t}`);
            const pane = document.getElementById(`eotPane_${t}`);
            if (btn) btn.classList.toggle('active', t === tabName);
            if (pane) pane.style.display = (t === tabName) ? 'block' : 'none';
        });

        if (tabName === 'records') {
            window.renderEotRecordsTab(targetProj);
        } else if (tabName === 'penalty') {
            window.renderEotPenaltyTab(targetProj);
        } else if (tabName === 'summary') {
            window.renderEotSummaryTab(targetProj);
        }
    };

    /**
     * แท็บ 1: เรนเดอร์ตารางประวัติ EOT
     */
    window.renderEotRecordsTab = function (project) {
        const tbody = document.getElementById('eotTableBody');
        const summaryBox = document.getElementById('eotSummaryBox');
        if (!tbody) return;

        const info = window.calculateProjectContractInfo(project, 0);
        const eotList = Array.isArray(project.eot) ? project.eot : [];

        if (summaryBox) {
            summaryBox.innerHTML = `
                <div class="eot-summary-grid">
                    <div class="eot-sum-item">
                        <span class="label"><i class="fa-regular fa-calendar"></i> สิ้นสุดสัญญาเดิม:</span>
                        <strong class="val">${info.originalEndDate}</strong>
                    </div>
                    <div class="eot-sum-item">
                        <span class="label"><i class="fa-solid fa-clock-rotate-left"></i> ขยายเวลาที่อนุมัติแล้ว:</span>
                        <strong class="val" style="color: var(--pea-purple);">${info.approvedEotDays > 0 ? `+${info.approvedEotDays} วัน (${eotList.length} ครั้ง)` : 'ยังไม่มีการขยายเวลา'}</strong>
                    </div>
                    <div class="eot-sum-item">
                        <span class="label"><i class="fa-solid fa-calendar-check"></i> วันสิ้นสุดสัญญาใหม่:</span>
                        <strong class="val" style="color: ${info.statusType === 'danger' ? '#ef4444' : '#10b981'};">${info.approvedRevisedEndDate}</strong>
                    </div>
                    <div class="eot-sum-item">
                        <span class="label"><i class="fa-solid fa-hourglass-half"></i> สถานะเวลาสัญญา:</span>
                        <strong class="val">
                            ${info.daysRemaining !== null ? (info.daysRemaining < 0 ? `<span style="color:#ef4444;">เกิน ${info.overdueDays} วัน</span>` : `<span style="color:#10b981;">เหลือ ${info.daysRemaining} วัน</span>`) : '-'}
                        </strong>
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
     * แท็บ 2: เรนเดอร์เครื่องมือคำนวณค่าปรับ & จำลอง EOT (Penalty & Simulator)
     */
    window.renderEotPenaltyTab = function (project) {
        const container = document.getElementById('eotPenaltyContainer');
        if (!container) return;

        const simDays = parseInt(window.currentSimulatedEotDays, 10) || 0;
        const info = window.calculateProjectContractInfo(project, simDays);
        const baseInfo = window.calculateProjectContractInfo(project, 0);

        const isOverdue = baseInfo.overdueDays > 0;
        const isSimOverdue = info.overdueDays > 0;

        container.innerHTML = `
            <!-- Penalty Dashboard Cards -->
            <div class="penalty-dashboard-grid">
                <div class="penalty-card ${baseInfo.overdueDays > 0 ? (baseInfo.isCriticalPenalty ? 'card-critical' : 'card-warning') : 'card-success'}">
                    <div class="card-icon"><i class="fa-solid fa-scale-unbalanced-flip"></i></div>
                    <div class="card-content">
                        <span class="card-title">สถานะค่าปรับสัญญาปัจจุบัน</span>
                        <div class="card-main-val">
                            ${baseInfo.overdueDays > 0 ? `฿${baseInfo.totalPenalty.toLocaleString()}` : '฿0 (ไม่มีค่าปรับ)'}
                        </div>
                        <span class="card-sub-text">
                            ${baseInfo.overdueDays > 0 ? `เกินสัญญา ${baseInfo.overdueDays} วัน (คิดอัตรา ${baseInfo.penaltyRatePercent}%/วัน = ฿${baseInfo.dailyPenalty.toLocaleString()}/วัน)` : 'ยังอยู่ภายในกำหนดสัญญา'}
                        </span>
                    </div>
                </div>

                <div class="penalty-card card-info">
                    <div class="card-icon"><i class="fa-solid fa-file-invoice-dollar"></i></div>
                    <div class="card-content">
                        <span class="card-title">วงเงินสัญญา & ค่าปรับต่อวัน</span>
                        <div class="card-main-val">฿${baseInfo.contractValue.toLocaleString()}</div>
                        <span class="card-sub-text">
                            ค่าปรับวันละ <strong>฿${baseInfo.dailyPenalty.toLocaleString()}</strong> (${baseInfo.penaltyRatePercent}% ต่อวัน)
                        </span>
                    </div>
                </div>

                <div class="penalty-card ${baseInfo.isCriticalPenalty ? 'card-critical' : 'card-neutral'}">
                    <div class="card-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="card-content">
                        <span class="card-title">สัดส่วนค่าปรับต่อมูลค่าสัญญา</span>
                        <div class="card-main-val" style="color: ${baseInfo.isCriticalPenalty ? '#dc2626' : (baseInfo.penaltyPercentage > 0 ? '#d97706' : '#10b981')};">
                            ${baseInfo.penaltyPercentage.toFixed(2)}%
                        </div>
                        <span class="card-sub-text">
                            ${baseInfo.isCriticalPenalty ? '⚠️ เกินเกณฑ์ 10% (พิจารณาบอกเลิกสัญญาตาม ม.103)' : 'เกณฑ์สูงสุดตามระเบียบ กฟภ. ไม่เกิน 10.00%'}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Progress Bar of Penalty Ratio -->
            <div class="penalty-meter-box">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px;">
                    <span><strong>ระดับความเสี่ยงค่าปรับสะสม:</strong> ${baseInfo.penaltyPercentage.toFixed(2)}% ของมูลค่าสัญญา</span>
                    <span style="color: ${baseInfo.isCriticalPenalty ? '#dc2626' : '#64748b'}; font-weight: 600;">เกณฑ์วิกฤต: 10.00%</span>
                </div>
                <div class="penalty-progress-track">
                    <div class="penalty-progress-fill ${baseInfo.isCriticalPenalty ? 'fill-critical' : (baseInfo.penaltyPercentage > 5 ? 'fill-warning' : 'fill-normal')}" 
                         style="width: ${Math.min(100, (baseInfo.penaltyPercentage / 10) * 100)}%;"></div>
                </div>
            </div>

            <!-- Interactive EOT & Penalty Reduction Simulator -->
            <div class="eot-simulator-box">
                <div class="sim-header">
                    <h4><i class="fa-solid fa-wand-magic-sparkles"></i> เครื่องมือจำลองสถานการณ์ EOT & ลดค่าปรับ (Interactive Simulator)</h4>
                    <span class="sim-tag">ทดลองคำนวณแบบ Real-time</span>
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 2px;">
                    ทดลองปรับเพิ่มจำนวนวันขอขยายสัญญา (EOT) เพื่อดูวันสิ้นสุดสัญญาใหม่และมูลค่าค่าปรับที่สามารถลดหย่อนหรือปลดเปลื้องได้
                </p>

                <div class="sim-control-row">
                    <div style="flex: 2;">
                        <label style="font-size: 12.5px; font-weight: 600; display: block; margin-bottom: 6px;">
                            ขยายเวลาสัญญาเพิ่มจำลอง: <span id="simDaysDisplay" style="color: var(--pea-purple); font-size: 16px; font-weight: 700;">+${simDays} วัน</span>
                        </label>
                        <input type="range" min="0" max="180" step="1" value="${simDays}" id="simDaysSlider" 
                               oninput="window.onSimulatedEotSliderChange(this.value)" style="width: 100%; accent-color: var(--pea-purple);">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-top: 3px;">
                            <span>+0 วัน</span>
                            <span>+30 วัน</span>
                            <span>+60 วัน</span>
                            <span>+90 วัน</span>
                            <span>+180 วัน</span>
                        </div>
                    </div>

                    <div style="flex: 1; min-width: 130px;">
                        <label style="font-size: 11.5px; color: #64748b;">หรือระบุจำนวนวัน:</label>
                        <input type="number" min="0" max="365" value="${simDays}" id="simDaysNumberInput" 
                               onchange="window.onSimulatedEotSliderChange(this.value)" 
                               style="font-size: 14px; font-weight: 700; text-align: center; width: 100%; padding: 6px; border: 1px solid var(--border-color); border-radius: 6px;">
                    </div>
                </div>

                <!-- Simulator Impact Cards -->
                <div class="sim-impact-grid">
                    <div class="sim-impact-card">
                        <span class="impact-label">วันสิ้นสุดสัญญาใหม่หลังจำลอง:</span>
                        <strong class="impact-val" style="color: var(--pea-purple);">${info.revisedEndDate}</strong>
                    </div>
                    <div class="sim-impact-card">
                        <span class="impact-label">จำนวนวันที่เกินสัญญาใหม่:</span>
                        <strong class="impact-val" style="color: ${info.overdueDays > 0 ? '#ef4444' : '#10b981'};">
                            ${info.overdueDays > 0 ? `เกิน ${info.overdueDays} วัน` : 'ไม่เกินสัญญา (0 วัน)'}
                        </strong>
                    </div>
                    <div class="sim-impact-card highlight-green">
                        <span class="impact-label">ค่าปรับที่ประหยัดได้ (Saved):</span>
                        <strong class="impact-val" style="color: #059669; font-size: 16px;">
                            ฿${info.penaltySaved.toLocaleString()}
                        </strong>
                    </div>
                    <div class="sim-impact-card">
                        <span class="impact-label">ค่าปรับสะสมหลังได้รับ EOT:</span>
                        <strong class="impact-val" style="color: ${info.totalPenalty > 0 ? '#ef4444' : '#10b981'};">
                            ฿${info.totalPenalty.toLocaleString()} (${info.penaltyPercentage.toFixed(2)}%)
                        </strong>
                    </div>
                </div>

                ${simDays > 0 ? `
                    <div style="margin-top: 12px; text-align: right;">
                        <button type="button" class="btn btn-sm btn-primary" onclick="window.applySimulatedDaysToForm(${simDays})" title="นำจำนวนวันนี้ไปกรอกในฟอร์มขออนุมัติ EOT ทันที">
                            <i class="fa-solid fa-arrow-down-long"></i> นำ ${simDays} วันนี้ไปกรอกในคำขอขยายสัญญา
                        </button>
                    </div>
                ` : ''}
            </div>

            <!-- Contract Penalty Settings Accordion (Admin/Editor) -->
            <div class="role-editor contract-settings-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h5 style="margin: 0; font-size: 13px; color: #334155;">
                        <i class="fa-solid fa-sliders"></i> ตั้งค่าวงเงินสัญญาและอัตราค่าปรับเฉพาะโครงการนี้
                    </h5>
                    <span style="font-size: 11px; color: #94a3b8;">(เฉพาะผู้ดูแลระบบ/ผู้ควบคุมงาน)</span>
                </div>
                <form id="contractSettingsForm" onsubmit="window.saveContractSettings(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; align-items: flex-end;">
                    <div class="form-group" style="margin: 0;">
                        <label style="font-size: 11px;">วงเงินสัญญา (บาท):</label>
                        <input type="number" min="0" step="1" id="cfgContractValue" value="${baseInfo.contractValue}" required style="font-size: 12.5px; padding: 6px;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label style="font-size: 11px;">อัตราค่าปรับ (% ต่อวัน):</label>
                        <select id="cfgPenaltyRatePercent" style="font-size: 12.5px; padding: 6px;">
                            <option value="0.05" ${baseInfo.penaltyRatePercent === 0.05 ? 'selected' : ''}>0.05% ต่อวัน (งานก่อสร้างทั่วไป)</option>
                            <option value="0.10" ${baseInfo.penaltyRatePercent === 0.10 ? 'selected' : ''}>0.10% ต่อวัน (งานก่อสร้างมีผลกระทบจราจร/ระบบไฟฟ้า)</option>
                            <option value="0.01" ${baseInfo.penaltyRatePercent === 0.01 ? 'selected' : ''}>0.01% ต่อวัน</option>
                            <option value="0.02" ${baseInfo.penaltyRatePercent === 0.02 ? 'selected' : ''}>0.02% ต่อวัน</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-secondary" style="padding: 7px 12px; font-size: 12px; height: 35px;">
                        <i class="fa-solid fa-save"></i> บันทึกค่าสัญญา
                    </button>
                </form>
            </div>
        `;
    };

    /**
     * เปลี่ยนค่าใน Slider จำลอง EOT
     */
    window.onSimulatedEotSliderChange = function (val) {
        window.currentSimulatedEotDays = parseInt(val, 10) || 0;
        const targetProj = window.projects ? window.projects.find(p => p.id === window.currentEotProjectId) : null;
        if (!targetProj) return;

        window.renderEotPenaltyTab(targetProj);
    };

    /**
     * นำค่าจำลองไปใส่ในฟอร์มบันทึก EOT
     */
    window.applySimulatedDaysToForm = function (days) {
        window.switchEotModalTab('records');
        const daysInput = document.getElementById('eotDaysInput');
        if (daysInput) {
            daysInput.value = days;
            daysInput.focus();
        }
    };

    /**
     * บันทึกการตั้งค่าวงเงินสัญญาและอัตราค่าปรับ
     */
    window.saveContractSettings = async function (e) {
        if (e) e.preventDefault();
        const projId = window.currentEotProjectId;
        const project = window.projects ? window.projects.find(p => p.id === projId) : null;
        if (!project) return;

        const valInput = document.getElementById('cfgContractValue');
        const rateSelect = document.getElementById('cfgPenaltyRatePercent');

        project.contractValue = parseFloat(valInput?.value) || project.contractValue;
        project.penaltyRatePercent = parseFloat(rateSelect?.value) || 0.05;

        try {
            if (typeof window.saveProjects === 'function') {
                await window.saveProjects(project.id);
            }
            if (typeof Toastify === 'function') {
                Toastify({
                    text: 'บันทึกการตั้งค่าสัญญาและอัตราค่าปรับเรียบร้อยแล้ว',
                    duration: 3000,
                    style: { background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px' }
                }).showToast();
            }
            window.renderEotPenaltyTab(project);
            if (typeof window.openProjectDetail === 'function') {
                window.openProjectDetail(project.id);
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        }
    };

    /**
     * แท็บ 3: เอกสารสรุปข้อสัญญาและการคำนวณทางการ (Contract Summary Sheet)
     */
    window.renderEotSummaryTab = function (project) {
        const container = document.getElementById('eotSummaryContainer');
        if (!container) return;

        const info = window.calculateProjectContractInfo(project, 0);
        const eotList = Array.isArray(project.eot) ? project.eot : [];

        let eotRowsHtml = '';
        if (eotList.length > 0) {
            eotRowsHtml = eotList.map((item, idx) => `
                <tr>
                    <td style="text-align: center;">ครั้งที่ ${idx + 1}</td>
                    <td style="text-align: center; font-weight: 700; color: #742C81;">+${item.days} วัน</td>
                    <td>${item.reason || '-'}</td>
                    <td>${item.docNo || '-'}</td>
                    <td>${item.approvedDate || '-'}</td>
                </tr>
            `).join('');
        } else {
            eotRowsHtml = '<tr><td colspan="5" style="text-align: center; color: #94a3b8;">ยังไม่มีประวัติการขยายระยะเวลาสัญญา</td></tr>';
        }

        container.innerHTML = `
            <div class="contract-official-sheet" id="printableContractSheet">
                <div class="sheet-header">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="assets/pea-logo.png" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/9/91/Provincial_Electricity_Authority_Logo.svg'" alt="PEA Logo" style="height: 48px;">
                        <div>
                            <h3 style="margin: 0; font-size: 15px; color: #742C81;">การไฟฟ้าส่วนภูมิภาค (PROVINCIAL ELECTRICITY AUTHORITY)</h3>
                            <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">บันทึกสรุปสถานะสัญญา การขยายระยะเวลา (EOT) และการคำนวณค่าปรับ</p>
                        </div>
                    </div>
                    <div style="text-align: right; font-size: 11px; color: #64748b;">
                        วันที่ออกรายงาน: ${new Date().toLocaleDateString('th-TH')}<br>
                        ระบบ PCTS Version 4.0
                    </div>
                </div>

                <div class="sheet-body" style="margin-top: 15px;">
                    <table class="sheet-table">
                        <tr>
                            <td class="col-head" style="width: 25%;">ชื่อโครงการ:</td>
                            <td colspan="3"><strong>${project.name}</strong></td>
                        </tr>
                        <tr>
                            <td class="col-head">ผู้รับจ้าง / ผู้ดำเนินงาน:</td>
                            <td>${project.contractor || 'กฟภ.'}</td>
                            <td class="col-head" style="width: 20%;">วงเงินสัญญา:</td>
                            <td><strong>฿${info.contractValue.toLocaleString()} บาท</strong></td>
                        </tr>
                        <tr>
                            <td class="col-head">วันเริ่มสัญญา:</td>
                            <td>${project.startDate || '-'}</td>
                            <td class="col-head">วันสิ้นสุดสัญญาเดิม:</td>
                            <td><strong>${info.originalEndDate}</strong></td>
                        </tr>
                        <tr>
                            <td class="col-head">รวมระยะเวลาขยายสัญญา (EOT):</td>
                            <td style="color: #742C81; font-weight: 700;">+${info.approvedEotDays} วัน (${eotList.length} ครั้ง)</td>
                            <td class="col-head">วันสิ้นสุดสัญญาใหม่:</td>
                            <td style="color: ${info.statusType === 'danger' ? '#dc2626' : '#059669'}; font-weight: 700;"><strong>${info.approvedRevisedEndDate}</strong></td>
                        </tr>
                        <tr>
                            <td class="col-head">สถานะการส่งมอบงาน:</td>
                            <td><span class="sheet-badge ${info.statusType}">${info.statusText}</span></td>
                            <td class="col-head">อัตราค่าปรับต่อวัน:</td>
                            <td>฿${info.dailyPenalty.toLocaleString()} บาท/วัน (${info.penaltyRatePercent}% ต่อวัน)</td>
                        </tr>
                        <tr>
                            <td class="col-head">จำนวนวันเกินสัญญา:</td>
                            <td style="color: ${info.overdueDays > 0 ? '#dc2626' : '#10b981'}; font-weight: 700;">${info.overdueDays} วัน</td>
                            <td class="col-head">ยอดค่าปรับสะสมทั้งสิ้น:</td>
                            <td style="color: ${info.totalPenalty > 0 ? '#dc2626' : '#10b981'}; font-weight: 700; font-size: 15px;">
                                ฿${info.totalPenalty.toLocaleString()} บาท (${info.penaltyPercentage.toFixed(2)}%)
                            </td>
                        </tr>
                    </table>

                    <h5 style="margin: 15px 0 6px 0; font-size: 12.5px; color: #334155;"><i class="fa-solid fa-list-check"></i> ประวัติการขอขยายระยะเวลาสัญญา (EOT)</h5>
                    <table class="pea-table" style="font-size: 11.5px; margin-bottom: 12px;">
                        <thead>
                            <tr>
                                <th style="width: 60px; text-align: center;">ครั้งที่</th>
                                <th style="width: 90px; text-align: center;">จำนวนวัน</th>
                                <th>เหตุผลการขอขยายสัญญา</th>
                                <th>หนังสือ/มติอ้างอิง</th>
                                <th style="width: 100px;">วันที่อนุมัติ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${eotRowsHtml}
                        </tbody>
                    </table>

                    ${info.isCriticalPenalty ? `
                        <div class="sheet-alert-critical">
                            <i class="fa-solid fa-triangle-exclamation"></i> <strong>ข้อสังเกตทางสัญญา:</strong> ค่าปรับสะสมเกินร้อยละ 10 ของมูลค่าสัญญาแล้ว เข้าเกณฑ์ที่ กฟภ. มีสิทธิพิจารณาบอกเลิกสัญญาตามมาตรา 103 แห่ง พ.ร.บ. การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560
                        </div>
                    ` : ''}

                    <div class="sheet-signatures-grid" style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center; font-size: 12px;">
                        <div>
                            ลงชื่อ............................................................<br>
                            (${project.supervisor || 'ผู้ควบคุมงาน กฟภ.'})<br>
                            ผู้ควบคุมงาน
                        </div>
                        <div>
                            ลงชื่อ............................................................<br>
                            (${project.committee1 || 'ประธานกรรมการตรวจรับพัสดุ'})<br>
                            ประธานกรรมการตรวจรับพัสดุ
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin-top: 15px; display: flex; justify-content: flex-end; gap: 8px;">
                <button type="button" class="btn btn-secondary" onclick="window.copyEotPenaltySummary()" title="คัดลอกสรุปข้อความ">
                    <i class="fa-solid fa-copy"></i> คัดลอกสรุปข้อความ
                </button>
                <button type="button" class="btn btn-primary" onclick="window.printEotPenaltyReport()" title="พิมพ์หรือบันทึกเป็น PDF">
                    <i class="fa-solid fa-print"></i> พิมพ์เอกสารสรุป (Print / PDF)
                </button>
            </div>
        `;
    };

    /**
     * คัดลอกสรุป EOT & ค่าปรับ ไปยัง Clipboard
     */
    window.copyEotPenaltySummary = function () {
        const targetProj = window.projects ? window.projects.find(p => p.id === window.currentEotProjectId) : null;
        if (!targetProj) return;

        const info = window.calculateProjectContractInfo(targetProj, 0);
        const text = `[สรุปสถานะสัญญา & ค่าปรับ PCTS 4.0]
โครงการ: ${targetProj.name}
ผู้รับจ้าง: ${targetProj.contractor || 'กฟภ.'}
วงเงินสัญญา: ฿${info.contractValue.toLocaleString()} บาท
วันสิ้นสุดสัญญาเดิม: ${info.originalEndDate}
รวมขยายสัญญา (EOT): +${info.approvedEotDays} วัน
วันสิ้นสุดสัญญาใหม่: ${info.approvedRevisedEndDate}
สถานะ: ${info.statusText}
อัตราค่าปรับต่อวัน: ฿${info.dailyPenalty.toLocaleString()} บาท/วัน (${info.penaltyRatePercent}%/วัน)
จำนวนวันเกินกำหนด: ${info.overdueDays} วัน
ยอดค่าปรับสะสม: ฿${info.totalPenalty.toLocaleString()} บาท (${info.penaltyPercentage.toFixed(2)}% ของมูลค่าสัญญา)`;

        navigator.clipboard.writeText(text).then(() => {
            if (typeof Toastify === 'function') {
                Toastify({
                    text: 'คัดลอกสรุปข้อมูลสัญญาไปยัง Clipboard เรียบร้อยแล้ว',
                    duration: 3000,
                    style: { background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px' }
                }).showToast();
            } else {
                alert('คัดลอกเรียบร้อยแล้ว');
            }
        });
    };

    /**
     * พิมพ์รายงานสรุปสัญญา EOT
     */
    window.printEotPenaltyReport = function () {
        const sheet = document.getElementById('printableContractSheet');
        if (!sheet) return;

        const printWin = window.open('', '', 'width=900,height=700');
        printWin.document.write(`
            <html>
                <head>
                    <title>รายงานสรุปสัญญาและค่าปรับ - PCTS PEA</title>
                    <link rel="stylesheet" href="style.css">
                    <style>
                        body { font-family: 'Sarabun', sans-serif; padding: 25px; color: #1e293b; background: white; }
                        .sheet-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px; }
                        .sheet-table td { border: 1px solid #cbd5e1; padding: 8px 12px; }
                        .sheet-table .col-head { background: #f8fafc; font-weight: 600; color: #475569; }
                        .pea-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                        .pea-table th, .pea-table td { border: 1px solid #cbd5e1; padding: 6px 10px; }
                        .pea-table th { background: #f1f5f9; }
                        @media print {
                            body { padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${sheet.innerHTML}
                </body>
            </html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
            printWin.print();
            printWin.close();
        }, 500);
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
            window.renderEotRecordsTab(project);
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
            window.renderEotRecordsTab(project);
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
