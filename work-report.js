/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: work-report.js - Work Operations & Photo Report Generator (Print/PDF)
 * ==============================================================================
 */

(function () {
    'use strict';

    // Store currently filtered report items for preview & export
    window.currentWorkReportItems = [];

    // Helper: Format Thai Date
    function formatThaiDateString(dateStr, isShort = false) {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: isShort ? 'short' : 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    }

    // Helper: Escape HTML
    function escapeHtmlForReport(str) {
        return typeof window.escapeHtmlForReport === 'function' ? window.escapeHtmlForReport(str) : String(str || '');
    }

    window.openWorkReportModal = function (targetProjectId = null) {
        const modal = document.getElementById('workReportModal');
        if (!modal) return;

        const projList = window.projects || [];
        const projSelect = document.getElementById('workReportProjectSelect');
        if (projSelect) {
            projSelect.innerHTML = '';
            projList.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                projSelect.appendChild(opt);
            });

            // Determine which project to select
            if (targetProjectId) {
                projSelect.value = targetProjectId;
            } else if (window.currentProjectViewData && window.currentProjectViewData.id) {
                projSelect.value = window.currentProjectViewData.id;
            } else {
                const edSelect = document.getElementById('editorProjectSelect');
                if (edSelect && edSelect.value) {
                    projSelect.value = edSelect.value;
                } else if (projList.length > 0) {
                    projSelect.value = projList[0].id;
                }
            }
        }

        // Populate Tasks for selected project
        window.onWorkReportProjectChange(false);

        // Set intelligent default date range based on project's recorded dates
        const selProjId = parseInt(projSelect ? projSelect.value : (projList[0]?.id || 1));
        const p = projList.find(item => item.id === selProjId);
        const validGallery = (p && p.gallery) ? p.gallery.filter(g => g.date) : [];

        const startInput = document.getElementById('workReportStartDate');
        const endInput = document.getElementById('workReportEndDate');

        if (validGallery.length > 0) {
            const sortedDates = validGallery.map(g => g.date).sort();
            const latestDate = sortedDates[sortedDates.length - 1];
            const earliestDate = sortedDates[0];
            if (startInput) startInput.value = earliestDate;
            if (endInput) endInput.value = latestDate;
        } else {
            const todayStr = new Date().toISOString().split('T')[0];
            if (startInput) startInput.value = todayStr;
            if (endInput) endInput.value = todayStr;
        }

        // Highlight 'all' or active date preset if matching
        document.querySelectorAll('.btn-preset-chip').forEach(btn => btn.classList.remove('active'));

        // Generate initial preview
        window.generateWorkReportPreview();

        // Show modal
        modal.style.display = 'flex';

        // Initialize Digital Signature pads
        setTimeout(() => {
            if (typeof window.initPctsSignaturePads === 'function') {
                window.initPctsSignaturePads();
            }
            if (p) {
                const supEl = document.getElementById('sigSupervisorNameText');
                const conEl = document.getElementById('sigContractorNameText');
                const comEl = document.getElementById('sigCommitteeNameText');
                if (supEl) supEl.textContent = p.supervisor ? `(${p.supervisor})` : '-';
                if (conEl) conEl.textContent = p.contractor ? `(${p.contractor})` : '-';
                if (comEl) comEl.textContent = (p.committee1 || p.committee) ? `(${p.committee1 || p.committee})` : '-';
            }
        }, 120);
    };

    window.closeWorkReportModal = function () {
        const modal = document.getElementById('workReportModal');
        if (modal) modal.style.display = 'none';
    };

    window.onWorkReportProjectChange = function (refreshPreview = true) {
        const projSelect = document.getElementById('workReportProjectSelect');
        const taskSelect = document.getElementById('workReportTaskSelect');
        if (!projSelect || !taskSelect) return;

        const projList = window.projects || [];
        const projId = parseInt(projSelect.value);
        const p = projList.find(item => item.id === projId);

        taskSelect.innerHTML = '<option value="all">ทุกแผนงานย่อย</option>';
        if (p && p.tasks) {
            p.tasks.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = `${t.name} (ความก้าวหน้า: ${t.actual || 0}%)`;
                taskSelect.appendChild(opt);
            });
        }

        // Update signer names below signature pads
        if (p) {
            const supEl = document.getElementById('sigSupervisorNameText');
            const conEl = document.getElementById('sigContractorNameText');
            const comEl = document.getElementById('sigCommitteeNameText');
            if (supEl) supEl.textContent = p.supervisor ? `(${p.supervisor})` : '-';
            if (conEl) conEl.textContent = p.contractor ? `(${p.contractor})` : '-';
            if (comEl) comEl.textContent = (p.committee1 || p.committee) ? `(${p.committee1 || p.committee})` : '-';
        }

        if (refreshPreview) {
            window.generateWorkReportPreview();
        }
    };

    window.setWorkReportDatePreset = function (preset) {
        const startInput = document.getElementById('workReportStartDate');
        const endInput = document.getElementById('workReportEndDate');
        if (!startInput || !endInput) return;

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        document.querySelectorAll('.btn-preset-chip').forEach(btn => btn.classList.remove('active'));
        if (window.event && window.event.target && window.event.target.classList.contains('btn-preset-chip')) {
            window.event.target.classList.add('active');
        }

        if (preset === 'today') {
            startInput.value = todayStr;
            endInput.value = todayStr;
        } else if (preset === 'yesterday') {
            const yest = new Date(now);
            yest.setDate(now.getDate() - 1);
            const yestStr = yest.toISOString().split('T')[0];
            startInput.value = yestStr;
            endInput.value = yestStr;
        } else if (preset === 'last7') {
            const d7 = new Date(now);
            d7.setDate(now.getDate() - 6);
            startInput.value = d7.toISOString().split('T')[0];
            endInput.value = todayStr;
        } else if (preset === 'thisMonth') {
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            startInput.value = `${year}-${month}-01`;
            endInput.value = todayStr;
        } else if (preset === 'all') {
            startInput.value = '';
            endInput.value = '';
        }

        window.generateWorkReportPreview();
    };

    window.generateWorkReportPreview = function () {
        const projSelect = document.getElementById('workReportProjectSelect');
        const taskSelect = document.getElementById('workReportTaskSelect');
        const startInput = document.getElementById('workReportStartDate');
        const endInput = document.getElementById('workReportEndDate');
        const photosOnlyCb = document.getElementById('workReportPhotosOnly');
        const container = document.getElementById('workReportPreviewList');
        const countBadge = document.getElementById('workReportResultBadge');

        if (!projSelect || !container) return;

        const projList = window.projects || [];
        const projId = parseInt(projSelect.value);
        const p = projList.find(item => item.id === projId);

        if (!p) {
            container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 30px;">ไม่พบข้อมูลโครงการ</div>';
            if (countBadge) countBadge.textContent = '0 รายการ';
            window.currentWorkReportItems = [];
            return;
        }

        const startDate = startInput ? startInput.value : '';
        const endDate = endInput ? endInput.value : '';
        const selectedTask = taskSelect ? taskSelect.value : 'all';
        const photosOnly = photosOnlyCb ? photosOnlyCb.checked : false;

        const rawGallery = p.gallery || [];

        // Filter items
        const filtered = rawGallery.filter((item) => {
            // Date filter
            if (item.date) {
                if (startDate && item.date < startDate) return false;
                if (endDate && item.date > endDate) return false;
            } else {
                if (startDate || endDate) return false;
            }

            // Task filter
            if (selectedTask !== 'all') {
                const taskIdNum = parseInt(selectedTask);
                const taskObj = p.tasks ? p.tasks.find(t => t.id === taskIdNum) : null;
                const matchesId = item.taskId === taskIdNum;
                const matchesName = taskObj && item.taskName === taskObj.name;
                if (!matchesId && !matchesName) return false;
            }

            // Photos only
            if (photosOnly && !item.url) {
                return false;
            }

            return true;
        });

        // Sort by date descending (newest first)
        filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        // Store in global window for printing
        window.currentWorkReportItems = filtered;

        const photoCount = filtered.filter(item => item.url).length;
        if (countBadge) {
            countBadge.textContent = `${filtered.length} รายการ (มีรูป ${photoCount} ภาพ)`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 35px 20px; color: #64748b;">
                    <i class="fa-regular fa-folder-open" style="font-size: 38px; color: #cbd5e1; margin-bottom: 12px; display: block;"></i>
                    <div style="font-size: 13.5px; font-weight: 600; color: #475569; margin-bottom: 4px;">ไม่พบข้อมูลผลงาน/ภาพถ่ายในช่วงวันที่ที่เลือก</div>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0 0 14px 0;">ลองปรับเปลี่ยนช่วงวันที่ หรือเลือก "ทุกช่วงเวลา" เพื่อดูรายการผลงานทั้งหมดที่มีในระบบ</p>
                    <button type="button" class="btn btn-secondary" style="font-size: 11.5px; padding: 5px 12px;" onclick="setWorkReportDatePreset('all')">
                        <i class="fa-solid fa-arrows-rotate"></i> แสดงทุกช่วงเวลา
                    </button>
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach((item, index) => {
            const thaiDate = formatThaiDateString(item.date);
            const taskName = item.taskName || (p.tasks?.find(t => t.id === item.taskId)?.name) || 'งานทั่วไป';
            const hasPhoto = Boolean(item.url);

            html += `
                <div class="work-report-preview-card">
                    <input type="checkbox" class="work-report-item-cb" data-index="${index}" checked style="margin-top: 6px; cursor: pointer; accent-color: var(--pea-purple); width: 16px; height: 16px;">
                    ${hasPhoto ? `
                        <img src="${item.url}" class="work-report-preview-thumb" alt="Photo" onclick="openImageModal('${item.url}')" title="คลิกเพื่อดูรูปภาพขนาดใหญ่" onerror="this.src='mascot.jpg'">
                    ` : `
                        <div class="work-report-preview-noimg" title="ไม่มีรูปภาพแนบ">
                            <i class="fa-solid fa-file-lines"></i>
                        </div>
                    `}
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                            <span style="font-size: 12px; font-weight: 700; color: #742C81; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-calendar-day"></i> ${thaiDate}
                            </span>
                            <span class="status-badge" style="background: #e2e8f0; color: #334155; font-size: 10.5px; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                <i class="fa-solid fa-tag" style="color: #64748b;"></i> ${escapeHtmlForReport(taskName)}
                            </span>
                        </div>
                        <div style="font-size: 12px; color: #1e293b; line-height: 1.5; word-break: break-word;">
                            ${escapeHtmlForReport(item.desc || 'ไม่มีคำอธิบาย')}
                        </div>
                        ${hasPhoto ? `
                            <div style="margin-top: 4px; font-size: 10.5px; color: #10B981; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-camera"></i> มีรูปภาพแนบ
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    };

    window.toggleWorkReportSelectAll = function (selectAll) {
        const cbs = document.querySelectorAll('.work-report-item-cb');
        cbs.forEach(cb => cb.checked = selectAll);
    };

    window.buildWorkReportPayload = function () {
        const projSelect = document.getElementById('workReportProjectSelect');
        if (!projSelect) return null;

        const projList = window.projects || [];
        const projId = parseInt(projSelect.value);
        const p = projList.find(item => item.id === projId);
        if (!p) {
            alert('ไม่พบข้อมูลโครงการ');
            return null;
        }

        const startInput = document.getElementById('workReportStartDate');
        const endInput = document.getElementById('workReportEndDate');
        const includeSignatures = document.getElementById('workReportIncludeSignatures')?.checked ?? true;
        const orientation = document.getElementById('workReportOrientation')?.value || 'portrait';

        // Get checked indices
        const checkedBoxes = Array.from(document.querySelectorAll('.work-report-item-cb:checked'));
        if (checkedBoxes.length === 0) {
            alert('กรุณาเลือกอย่างน้อย 1 รายการเพื่อออกรายงาน');
            return null;
        }

        const selectedItems = checkedBoxes.map(cb => {
            const idx = parseInt(cb.dataset.index);
            return window.currentWorkReportItems[idx];
        }).filter(Boolean);

        const todayThai = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
        const printTimestamp = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

        const startDateVal = startInput ? startInput.value : '';
        const endDateVal = endInput ? endInput.value : '';

        let datePeriodText = 'ข้อมูลการปฏิบัติงานทั้งหมด';
        if (startDateVal && endDateVal) {
            if (startDateVal === endDateVal) {
                datePeriodText = `ประจำวันที่ ${formatThaiDateString(startDateVal)}`;
            } else {
                datePeriodText = `ระหว่างวันที่ ${formatThaiDateString(startDateVal)} ถึง ${formatThaiDateString(endDateVal)}`;
            }
        } else if (startDateVal) {
            datePeriodText = `ตั้งแต่วันที่ ${formatThaiDateString(startDateVal)} เป็นต้นไป`;
        } else if (endDateVal) {
            datePeriodText = `จนถึงวันที่ ${formatThaiDateString(endDateVal)}`;
        }

        const photoCount = selectedItems.filter(item => item.url).length;
        const uniqueTasks = Array.from(new Set(selectedItems.map(item => item.taskName || 'งานทั่วไป')));

        // Build Cards HTML
        let itemsHtml = '';
        selectedItems.forEach((item, index) => {
            const thaiDate = formatThaiDateString(item.date);
            const taskName = item.taskName || (p.tasks?.find(t => t.id === item.taskId)?.name) || 'งานทั่วไป';
            const taskObj = p.tasks?.find(t => t.name === taskName || t.id === item.taskId);
            const taskActual = taskObj ? taskObj.actual : null;

            const hasPhoto = Boolean(item.url);

            itemsHtml += `
                <div class="work-report-item-card">
                    <div class="work-report-item-header">
                        <div class="work-report-item-header-left">
                            <span class="report-item-num">#${index + 1}</span>
                            <span class="report-item-date"><i class="fa-solid fa-calendar-day"></i> วันที่ดำเนินงาน: <strong>${thaiDate}</strong></span>
                        </div>
                        <div class="work-report-item-header-right">
                            <span class="badge-report-task"><i class="fa-solid fa-tag"></i> แผนงาน: ${escapeHtmlForReport(taskName)}</span>
                            ${taskActual !== null ? `<span class="badge-report-actual">ความก้าวหน้าสะสม: ${taskActual}%</span>` : ''}
                        </div>
                    </div>
                    <div class="work-report-item-body">
                        ${hasPhoto ? `
                            <div class="work-report-photo-col">
                                <div class="work-report-img-wrapper">
                                    <img src="${item.url}" alt="ภาพถ่ายหน้างาน" onerror="this.src='mascot.jpg'">
                                </div>
                                <div class="work-report-img-caption">
                                    <i class="fa-solid fa-camera"></i> ภาพถ่ายความก้าวหน้าหน้างานจริง
                                </div>
                            </div>
                            <div class="work-report-desc-col">
                                <div class="desc-title"><i class="fa-solid fa-file-pen"></i> รายละเอียดงานที่ปฏิบัติและคำอธิบาย:</div>
                                <div class="desc-box">
                                    ${escapeHtmlForReport(item.desc || 'ไม่มีคำอธิบาย')}
                                </div>
                                <div class="desc-meta">
                                    <span><i class="fa-solid fa-circle-check" style="color: #10B981;"></i> บันทึกรายงานผ่านระบบ PCTS</span>
                                    <span>วันที่บันทึก: ${thaiDate}</span>
                                </div>
                            </div>
                        ` : `
                            <div class="work-report-desc-col" style="width: 100%;">
                                <div class="desc-title" style="color: #2563EB;"><i class="fa-solid fa-clipboard-list"></i> รายละเอียดการปฏิบัติงาน (ไม่มีภาพถ่ายแนบ):</div>
                                <div class="desc-box" style="border-left-color: #2563EB;">
                                    ${escapeHtmlForReport(item.desc || 'ไม่มีคำอธิบาย')}
                                </div>
                                <div class="desc-meta">
                                    <span><i class="fa-solid fa-circle-check" style="color: #10B981;"></i> บันทึกรายงานผ่านระบบ PCTS</span>
                                    <span>วันที่บันทึก: ${thaiDate}</span>
                                </div>
                            </div>
                        `}
                    </div>
                </div>
            `;
        });

        // 3-Party Signatures HTML
        let signaturesHtml = '';
        if (includeSignatures) {
            const digitalSigs = (typeof window.getPctsSignatures === 'function')
                ? window.getPctsSignatures()
                : { supervisor: null, contractor: null, committee: null };

            const sigImgSupervisor = digitalSigs.supervisor
                ? `<div style="height: 52px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px;"><img src="${digitalSigs.supervisor}" alt="Supervisor Signature" style="max-height: 48px; max-width: 140px; object-fit: contain;"></div>`
                : `<div class="sig-space"></div>`;

            const sigImgContractor = digitalSigs.contractor
                ? `<div style="height: 52px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px;"><img src="${digitalSigs.contractor}" alt="Contractor Signature" style="max-height: 48px; max-width: 140px; object-fit: contain;"></div>`
                : `<div class="sig-space"></div>`;

            const sigImgCommittee = digitalSigs.committee
                ? `<div style="height: 52px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px;"><img src="${digitalSigs.committee}" alt="Committee Signature" style="max-height: 48px; max-width: 140px; object-fit: contain;"></div>`
                : `<div class="sig-space"></div>`;

            signaturesHtml = `
                <div class="signatures-section" style="page-break-inside: avoid; break-inside: avoid; margin-top: 25px;">
                    <div class="print-section-header">
                        <span class="section-icon"><i class="fa-solid fa-file-signature"></i></span>
                        <h2 class="print-section-title">การตรวจรับและรับรองผลการปฏิบัติงานก่อสร้าง</h2>
                    </div>
                    <div style="font-size: 11px; color: #64748B; margin-bottom: 14px; font-style: italic;">
                        ขอรับรองว่าการปฏิบัติงาน คำอธิบาย และภาพถ่ายประกอบข้างต้น เป็นผลการดำเนินงานจริง ณ สถานที่ก่อสร้างโครงการ
                    </div>
                    <div class="signatures-grid">
                        <div class="signature-card">
                            <div class="sig-title">ผู้ควบคุมงาน</div>
                            ${sigImgSupervisor}
                            <div class="sig-dots">..................................................................</div>
                            <div class="sig-name">( ${p.supervisor || '......................................................'} )</div>
                            <div class="sig-position">ผู้ควบคุมงาน การไฟฟ้าส่วนภูมิภาค</div>
                            <div class="sig-date">${digitalSigs.supervisor ? `วันที่ ${todayThai}` : 'วันที่ ......... / ......... / .................'}</div>
                        </div>
                        <div class="signature-card">
                            <div class="sig-title">${p.type === 'ดำเนินการเอง' ? 'หัวหน้าชุดงาน / ผู้ปฏิบัติงาน' : 'ผู้รับจ้าง / ผู้แทนผู้รับจ้าง'}</div>
                            ${sigImgContractor}
                            <div class="sig-dots">..................................................................</div>
                            <div class="sig-name">( ${p.contractor || '......................................................'} )</div>
                            <div class="sig-position">${p.type === 'ดำเนินการเอง' ? 'การไฟฟ้าส่วนภูมิภาค' : 'ผู้รับจ้างตามสัญญา'}</div>
                            <div class="sig-date">${digitalSigs.contractor ? `วันที่ ${todayThai}` : 'วันที่ ......... / ......... / .................'}</div>
                        </div>
                        <div class="signature-card">
                            <div class="sig-title">ประธานกรรมการตรวจรับพัสดุ</div>
                            ${sigImgCommittee}
                            <div class="sig-dots">..................................................................</div>
                            <div class="sig-name">( ${p.committee1 || p.committee || '......................................................'} )</div>
                            <div class="sig-position">ประธานกรรมการตรวจรับพัสดุ</div>
                            <div class="sig-date">${digitalSigs.committee ? `วันที่ ${todayThai}` : 'วันที่ ......... / ......... / .................'}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Styles for Report
        const reportStyles = `
            @page {
                size: A4 ${orientation};
                margin: 10mm 12mm 12mm 12mm;
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: 'Sarabun', sans-serif;
                color: #1E293B;
                background-color: #FFFFFF;
                font-size: 11.5px;
                line-height: 1.5;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            h1, h2, h3, h4, .font-prompt {
                font-family: 'Prompt', sans-serif;
            }

            .print-action-bar {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #742C81 0%, #531B5E 100%);
                padding: 12px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 9999;
                box-shadow: 0 4px 15px rgba(0,0,0,0.25);
            }
            .print-action-info {
                color: white;
                font-size: 13px;
            }
            .print-action-info strong {
                font-family: 'Prompt', sans-serif;
                font-size: 15px;
                margin-right: 8px;
            }
            .print-action-buttons {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .btn-print-action {
                padding: 8px 18px;
                border-radius: 6px;
                font-family: 'Prompt', sans-serif;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
            }
            .btn-print-primary {
                background: white;
                color: #742C81;
            }
            .btn-print-primary:hover {
                background: #F8FAFC;
            }
            .btn-print-dl {
                background: #10B981;
                color: #FFFFFF;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
            }
            .btn-print-dl:hover {
                background: #059669;
            }
            .btn-print-close {
                background: rgba(255,255,255,0.2);
                color: white;
                border: 1px solid rgba(255,255,255,0.3);
            }
            .btn-print-close:hover {
                background: rgba(255,255,255,0.3);
            }

            .report-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 12px;
                border-bottom: 3px solid #742C81;
                margin-bottom: 14px;
            }
            .report-header-left {
                display: flex;
                align-items: center;
                gap: 14px;
            }
            .pea-emblem-badge {
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #742C81 0%, #531B5E 100%);
                color: #FBBF24;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
                box-shadow: 0 2px 6px rgba(116,44,129,0.3);
                flex-shrink: 0;
            }
            .report-title-block h1 {
                font-size: 16px;
                color: #742C81;
                font-weight: 700;
                line-height: 1.25;
                margin: 0;
            }
            .report-title-block .doc-subtitle {
                font-size: 11px;
                color: #64748B;
                margin-top: 2px;
            }
            .report-header-right {
                text-align: right;
            }
            .brand-pcts {
                font-family: 'Prompt', sans-serif;
                font-size: 16px;
                font-weight: 800;
                color: #742C81;
                letter-spacing: 1px;
            }
            .brand-sub {
                font-size: 9.5px;
                color: #64748B;
            }
            .report-meta-tag {
                display: inline-block;
                background: #F1F5F9;
                color: #475569;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 9.5px;
                margin-top: 4px;
            }

            .info-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #E2E8F0;
                border-radius: 6px;
                overflow: hidden;
                font-size: 11px;
                margin-bottom: 14px;
            }
            .info-table td {
                padding: 6px 10px;
                border-bottom: 1px solid #E2E8F0;
                border-right: 1px solid #E2E8F0;
            }
            .info-table .label-cell {
                background: #F8FAFC;
                color: #475569;
                font-weight: 600;
                width: 140px;
            }
            .info-table .value-cell {
                color: #1E293B;
            }

            .kpi-summary-strip {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 18px;
            }
            .kpi-summary-box {
                background: #F8FAFC;
                border: 1px solid #E2E8F0;
                border-left: 4px solid #742C81;
                border-radius: 6px;
                padding: 8px 12px;
            }
            .kpi-summary-box .kpi-label {
                font-size: 10px;
                color: #64748B;
                font-weight: 500;
                display: block;
            }
            .kpi-summary-box .kpi-val {
                font-family: 'Prompt', sans-serif;
                font-size: 17px;
                font-weight: 700;
                color: #742C81;
            }

            .work-report-item-card {
                border: 1px solid #CBD5E1;
                border-radius: 8px;
                margin-bottom: 16px;
                overflow: hidden;
                background: #FFFFFF;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .work-report-item-header {
                background: #F8FAFC;
                padding: 7px 12px;
                border-bottom: 1px solid #E2E8F0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11.5px;
                page-break-after: avoid;
                break-after: avoid;
            }
            .work-report-item-header-left {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .report-item-num {
                background: #742C81;
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 1px 6px;
                border-radius: 4px;
            }
            .report-item-date {
                color: #1E293B;
            }
            .work-report-item-header-right {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .badge-report-task {
                background: #EAE0F0;
                color: #742C81;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 600;
            }
            .badge-report-actual {
                background: #E0F2FE;
                color: #0369A1;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: 600;
            }

            .work-report-item-body {
                display: flex;
                gap: 14px;
                padding: 12px;
                align-items: flex-start;
            }
            .work-report-photo-col {
                width: 250px;
                flex-shrink: 0;
                text-align: center;
            }
            .work-report-img-wrapper {
                width: 250px;
                height: 180px;
                background: #F1F5F9;
                border-radius: 6px;
                overflow: hidden;
                border: 1px solid #E2E8F0;
            }
            .work-report-img-wrapper img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            .work-report-img-caption {
                font-size: 9.5px;
                color: #64748B;
                margin-top: 4px;
            }
            .work-report-desc-col {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .desc-title {
                font-weight: 600;
                color: #742C81;
                font-size: 12px;
                margin-bottom: 6px;
            }
            .desc-box {
                background: #F8FAFC;
                border: 1px solid #E2E8F0;
                border-left: 3px solid #742C81;
                border-radius: 6px;
                padding: 10px 14px;
                font-size: 12px;
                color: #1E293B;
                line-height: 1.6;
                min-height: 110px;
                white-space: pre-wrap;
            }
            .desc-meta {
                margin-top: 8px;
                font-size: 10px;
                color: #64748B;
                display: flex;
                justify-content: space-between;
            }

            .signatures-section {
                page-break-inside: avoid;
                break-inside: avoid;
                margin-top: 24px;
            }
            .print-section-header {
                display: flex;
                align-items: center;
                gap: 8px;
                border-bottom: 2px solid #E2E8F0;
                padding-bottom: 6px;
                margin-bottom: 12px;
                page-break-after: avoid;
                break-after: avoid;
            }
            .section-icon {
                color: #742C81;
                font-size: 14px;
            }
            .print-section-title {
                font-size: 13.5px;
                color: #742C81;
                font-weight: 600;
            }
            .signatures-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
            }
            .signature-card {
                border: 1px solid #CBD5E1;
                border-radius: 8px;
                padding: 16px 14px;
                text-align: center;
                background: #FFFFFF;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .sig-title {
                font-weight: 600;
                color: #742C81;
                font-size: 12px;
                border-bottom: 1px solid #E2E8F0;
                padding-bottom: 6px;
                margin-bottom: 14px;
            }
            .sig-space {
                height: 48px;
            }
            .sig-dots {
                color: #CBD5E1;
                letter-spacing: 2px;
                font-size: 11px;
                margin-bottom: 4px;
            }
            .sig-name {
                font-size: 11.5px;
                font-weight: 500;
                color: #1E293B;
                margin-bottom: 4px;
            }
            .sig-position {
                font-size: 10px;
                color: #64748B;
                margin-bottom: 4px;
            }
            .sig-date {
                font-size: 10px;
                color: #94A3B8;
            }

            .report-footer {
                margin-top: 24px;
                padding-top: 10px;
                border-top: 1px solid #E2E8F0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 9.5px;
                color: #94A3B8;
                page-break-inside: avoid;
                break-inside: avoid;
            }

            @media print {
                .print-action-bar {
                    display: none !important;
                }
                body {
                    padding-top: 0 !important;
                    background: white !important;
                }
                .report-page-container {
                    max-width: 100% !important;
                    padding: 0 !important;
                }
            }

            @media screen {
                body {
                    padding-top: 60px;
                    background-color: #F1F5F9;
                }
                .report-page-container {
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    margin: 20px auto 30px auto;
                    max-width: ${orientation === 'portrait' ? '860px' : '1140px'};
                }
            }
        `;

        const bodyContainerHtml = `
            <!-- Header -->
            <div class="report-header">
                <div class="report-header-left">
                    <div class="pea-emblem-badge">
                        <i class="fa-solid fa-bolt"></i>
                    </div>
                    <div class="report-title-block">
                        <h1>รายงานผลการปฏิบัติงานก่อสร้างและภาพถ่ายประกอบ</h1>
                        <div class="doc-subtitle">การไฟฟ้าส่วนภูมิภาค &bull; PROVINCIAL ELECTRICITY AUTHORITY &bull; ${datePeriodText}</div>
                    </div>
                </div>
                <div class="report-header-right">
                    <div class="brand-pcts">PCTS</div>
                    <div class="brand-sub">PEA Construction Tracking System</div>
                    <span class="report-meta-tag">ออกเอกสารเมื่อ: ${printTimestamp}</span>
                </div>
            </div>

            <!-- Project Info Table -->
            <table class="info-table">
                <tr>
                    <td class="label-cell">โครงการ:</td>
                    <td class="value-cell" colspan="3"><strong>${escapeHtmlForReport(p.name)}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">ประเภทงาน:</td>
                    <td class="value-cell"><strong>${p.type || '-'}</strong></td>
                    <td class="label-cell">ระยะเวลาตามสัญญา:</td>
                    <td class="value-cell">${p.duration || '-'}</td>
                </tr>
                <tr>
                    <td class="label-cell">ผู้ควบคุมงาน (PEA):</td>
                    <td class="value-cell">${p.supervisor || '-'}</td>
                    <td class="label-cell">ผู้รับจ้าง/ผู้ปฏิบัติงาน:</td>
                    <td class="value-cell">${p.contractor || '-'}</td>
                </tr>
                <tr>
                    <td class="label-cell">ประธานกรรมการตรวจรับ:</td>
                    <td class="value-cell">${p.committee1 || p.committee || '-'}</td>
                    <td class="label-cell">ช่วงเวลาที่รายงาน:</td>
                    <td class="value-cell"><strong style="color: #742C81;">${datePeriodText}</strong></td>
                </tr>
            </table>

            <!-- Summary Strip -->
            <div class="kpi-summary-strip">
                <div class="kpi-summary-box">
                    <span class="kpi-label">จำนวนรายการปฏิบัติงาน</span>
                    <span class="kpi-val">${selectedItems.length} รายการ</span>
                </div>
                <div class="kpi-summary-box" style="border-left-color: #2563EB;">
                    <span class="kpi-label">จำนวนภาพถ่ายแนบประกอบ</span>
                    <span class="kpi-val" style="color: #2563EB;">${photoCount} ภาพ</span>
                </div>
                <div class="kpi-summary-box" style="border-left-color: #10B981;">
                    <span class="kpi-label">แผนงานย่อยที่รายงาน</span>
                    <span class="kpi-val" style="color: #10B981;">${uniqueTasks.length} แผนงาน</span>
                </div>
            </div>

            <!-- Detail Items -->
            <div class="work-report-items-section">
                <div class="print-section-header">
                    <span class="section-icon"><i class="fa-solid fa-camera-retro"></i></span>
                    <h2 class="print-section-title">บันทึกผลการปฏิบัติงาน คำอธิบาย และภาพถ่ายหน้างาน</h2>
                </div>
                ${itemsHtml}
            </div>

            <!-- 3-Party Signatures -->
            ${signaturesHtml}

            <!-- Footer -->
            <div class="report-footer">
                <span>ระบบติดตามและบริหารโครงการก่อสร้าง การไฟฟ้าส่วนภูมิภาค (PCTS) &bull; เอกสารประกอบการปฏิบัติงาน</span>
                <span>วันที่พิมพ์: ${todayThai} &bull; ข้อมูลจากระบบอัตโนมัติ</span>
            </div>
        `;

        const cleanProjectNameForPopup = (p.name || 'Project').replace(/[\\/:*?"<>|]/g, '_').trim();
        const dateTagForPopup = new Date().toISOString().split('T')[0];

        const fullDocHtml = `
            <!DOCTYPE html>
            <html lang="th">
            <head>
                <meta charset="UTF-8">
                <title>รายงานผลการปฏิบัติงาน_${p.name}_${datePeriodText}</title>
                <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
                <style>
                    ${reportStyles}
                </style>
            </head>
            <body>
                <!-- Floating Action Bar for Preview Window -->
                <div class="print-action-bar">
                    <div class="print-action-info">
                        <strong>รายงานผลการปฏิบัติงาน (${p.name})</strong>
                        <span>ช่วงเวลา: ${datePeriodText} &bull; ${selectedItems.length} รายการ</span>
                    </div>
                    <div class="print-action-buttons">
                        <button id="btnWorkPopupPdf" class="btn-print-action btn-print-dl" onclick="downloadWorkPdfFromPopup()">
                            <i class="fa-solid fa-file-pdf"></i> ดาวน์โหลดไฟล์ PDF
                        </button>
                        <button class="btn-print-action btn-print-primary" onclick="window.print()">
                            <i class="fa-solid fa-print"></i> สั่งพิมพ์เอกสาร (Print)
                        </button>
                        <button class="btn-print-action btn-print-close" onclick="window.close()">
                            <i class="fa-solid fa-xmark"></i> ปิดหน้าต่าง
                        </button>
                    </div>
                </div>

                <div class="report-page-container" id="workReportMainContainer">
                    ${bodyContainerHtml}
                </div>

                <script>
                    function downloadWorkPdfFromPopup() {
                        var btn = document.getElementById('btnWorkPopupPdf');
                        var el = document.getElementById('workReportMainContainer');
                        if (!el || typeof html2pdf === 'undefined') {
                            window.print();
                            return;
                        }
                        var origHtml = btn ? btn.innerHTML : '';
                        if (btn) {
                            btn.disabled = true;
                            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังสร้าง PDF...';
                        }
                        window.scrollTo(0, 0);
                        var opt = {
                            margin: [8, 10, 8, 10],
                            filename: 'รายงานผลการปฏิบัติงาน_${cleanProjectNameForPopup}_${dateTagForPopup}.pdf',
                            image: { type: 'jpeg', quality: 0.95 },
                            html2canvas: {
                                scale: 2,
                                useCORS: true,
                                allowTaint: true,
                                backgroundColor: '#ffffff',
                                scrollY: 0,
                                scrollX: 0,
                                windowWidth: '${orientation}' === 'portrait' ? 860 : 1180
                            },
                            jsPDF: {
                                unit: 'mm',
                                format: 'a4',
                                orientation: '${orientation}'
                            },
                            pagebreak: {
                                mode: ['css', 'legacy'],
                                before: '.pdf-page-break-before',
                                after: '.pdf-page-break-after',
                                avoid: ['.work-report-item-card', '.signatures-section', '.info-table', '.signature-card', '.kpi-summary-strip']
                            }
                        };
                        html2pdf().set(opt).from(el).save().then(function() {
                            if (btn) {
                                btn.disabled = false;
                                btn.innerHTML = origHtml;
                            }
                        }).catch(function(err) {
                            console.error(err);
                            if (btn) {
                                btn.disabled = false;
                                btn.innerHTML = origHtml;
                            }
                            window.print();
                        });
                    }
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 450);
                    };
                <\/script>
            </body>
            </html>
        `;

        return {
            project: p,
            datePeriodText,
            orientation,
            stylesCss: reportStyles,
            bodyContainerHtml,
            fullDocHtml
        };
    };

    window.printWorkReport = function () {
        const payload = window.buildWorkReportPayload();
        if (!payload) return;

        const printWindow = window.open('', '_blank', 'width=1100,height=880');
        if (!printWindow) {
            if (confirm('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป (Popup Blocker)\n\nต้องการให้ระบบดาวน์โหลดรายงานเป็นไฟล์ PDF ให้โดยตรงหรือไม่?')) {
                window.downloadWorkReportPDF();
            }
            return;
        }

        printWindow.document.write(payload.fullDocHtml);
        printWindow.document.close();
    };

    window.downloadWorkReportPDF = function () {
        const payload = window.buildWorkReportPayload();
        if (!payload) return;

        if (typeof html2pdf === 'undefined') {
            alert('กำลังโหลดไลบรารีสร้าง PDF กรุณารอสักครู่แล้วลองใหม่');
            return;
        }

        const loadingModal = document.getElementById('pdfLoadingModal');
        if (loadingModal) loadingModal.style.display = 'flex';

        setTimeout(async () => {
            try {
                const isPortrait = payload.orientation === 'portrait';
                const containerWidth = isPortrait ? 800 : 1120;

                const container = document.createElement('div');
                container.id = 'work-report-pdf-sandbox';
                container.style.position = 'fixed';
                container.style.left = '-15000px';
                container.style.top = '0';
                container.style.width = `${containerWidth}px`;
                container.style.zIndex = '-1';
                container.style.pointerEvents = 'none';
                container.style.backgroundColor = '#ffffff';
                container.style.overflow = 'visible';

                container.innerHTML = `
                    <style>
                        ${payload.stylesCss}
                        #work-report-pdf-target.report-page-container {
                            max-width: ${containerWidth}px !important;
                            width: ${containerWidth}px !important;
                            padding: 12px 16px !important;
                            margin: 0 !important;
                            background: #ffffff !important;
                            color: #1e293b !important;
                            box-shadow: none !important;
                            opacity: 1 !important;
                            visibility: visible !important;
                        }
                    </style>
                    <div id="work-report-pdf-target" class="report-page-container">
                        ${payload.bodyContainerHtml}
                    </div>
                `;
                document.body.appendChild(container);

                const targetEl = container.querySelector('#work-report-pdf-target') || container;

                // Wait for images to load
                const images = targetEl.querySelectorAll('img');
                if (images.length > 0) {
                    const imgPromises = Array.from(images).map(img => {
                        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                        return new Promise(resolve => {
                            img.onload = resolve;
                            img.onerror = () => {
                                if (!img.src.endsWith('mascot.jpg')) {
                                    img.src = 'mascot.jpg';
                                }
                                resolve();
                            };
                            setTimeout(resolve, 3000);
                        });
                    });
                    await Promise.all(imgPromises);
                }

                const cleanProjectName = (payload.project.name || 'Project').replace(/[\\/:*?"<>|]/g, '_').trim();
                const dateTag = new Date().toISOString().split('T')[0];

                const opt = {
                    margin: [8, 10, 8, 10],
                    filename: `รายงานผลการปฏิบัติงาน_${cleanProjectName}_${dateTag}.pdf`,
                    image: { type: 'jpeg', quality: 0.95 },
                    html2canvas: {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        scrollY: 0,
                        scrollX: 0,
                        windowWidth: isPortrait ? 840 : 1160
                    },
                    jsPDF: {
                        unit: 'mm',
                        format: 'a4',
                        orientation: payload.orientation
                    },
                    pagebreak: {
                        mode: ['css', 'legacy'],
                        before: '.pdf-page-break-before',
                        after: '.pdf-page-break-after',
                        avoid: ['.work-report-item-card', '.signatures-section', '.info-table', '.signature-card', '.kpi-summary-strip']
                    }
                };

                await html2pdf().set(opt).from(targetEl).save();
            } catch (err) {
                console.error('Error generating PDF:', err);
                alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF: ' + (err.message || err));
            } finally {
                const container = document.getElementById('work-report-pdf-sandbox');
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
                if (loadingModal) loadingModal.style.display = 'none';
            }
        }, 150);
    };
})();

