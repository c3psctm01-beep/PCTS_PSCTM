/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: pdf-report.js - Project Progress Print & A4 PDF Export Engine
 * ==============================================================================
 */

(function () {
    'use strict';

// --- Print Report Modal ---
window.openPrintModal = function () {
    document.getElementById('printModal').style.display = 'flex';
};

window.closePrintModal = function () {
    document.getElementById('printModal').style.display = 'none';
};

window.toggleAllPrintSections = function (checked) {
    document.querySelectorAll('input[name="printSection"]').forEach(cb => {
        cb.checked = checked;
    });
};

// Sync "select all" checkbox when individual checkboxes change
document.addEventListener('change', function (e) {
    if (e.target.name === 'printSection') {
        const all = document.querySelectorAll('input[name="printSection"]');
        const allChecked = Array.from(all).every(cb => cb.checked);
        const selectAllCb = document.getElementById('printSelectAll');
        if (selectAllCb) selectAllCb.checked = allChecked;
    }
});

window.buildReportPayload = function (selected) {
    if (!selected || selected.length === 0) {
        selected = Array.from(document.querySelectorAll('input[name="printSection"]:checked')).map(cb => cb.value);
    }

    if (selected.length === 0) {
        alert('กรุณาเลือกอย่างน้อย 1 หัวข้อเพื่อสร้างรายงาน');
        return null;
    }

    const p = window.currentProjectViewData;
    if (!p) {
        alert('ไม่พบข้อมูลโครงการ');
        return null;
    }

    const progress = (typeof window.calculateProjectProgress === 'function')
        ? window.calculateProjectProgress(p)
        : { plan: 0, actual: 0 };
    const planVal = parseFloat(progress.plan) || 0;
    const actualVal = parseFloat(progress.actual) || 0;
    const varianceVal = (actualVal - planVal).toFixed(2);
    const isAhead = parseFloat(varianceVal) >= 0;
    const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const printTimestamp = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // --- TEMPORARY RENDER TRICK FOR HIDDEN TABS ---
    const tabSCurve = document.getElementById('tabSCurve');
    const tabGantt = document.getElementById('tabGantt');
    const tabDisbursement = document.getElementById('tabDisbursement');
    let origSCurveStyle = '', origGanttStyle = '', origDisbStyle = '';

    if (tabSCurve) {
        origSCurveStyle = tabSCurve.getAttribute('style') || '';
        tabSCurve.style.display = 'block';
        tabSCurve.style.position = 'absolute';
        tabSCurve.style.visibility = 'hidden';
        tabSCurve.style.zIndex = '-9999';
        tabSCurve.style.width = '1200px';
        tabSCurve.style.height = '520px';
        if (typeof window.updateSCurve === 'function') {
            window.updateSCurve(p);
        }
        if (window.sChart) {
            const oldAnim = window.sChart.options.animation;
            window.sChart.options.animation = false;
            window.sChart.resize();
            window.sChart.update();
            window.sChart.options.animation = oldAnim;
        }
    }

    if (tabGantt) {
        origGanttStyle = tabGantt.getAttribute('style') || '';
        tabGantt.style.display = 'block';
        tabGantt.style.position = 'absolute';
        tabGantt.style.visibility = 'hidden';
        tabGantt.style.zIndex = '-9999';
        if (window.currentGantt) {
            window.currentGantt.render();
        }
    }

    if (tabDisbursement && selected.includes('disbursement')) {
        origDisbStyle = tabDisbursement.getAttribute('style') || '';
        tabDisbursement.style.display = 'block';
        tabDisbursement.style.position = 'absolute';
        tabDisbursement.style.visibility = 'hidden';
        tabDisbursement.style.zIndex = '-9999';
        tabDisbursement.style.width = '1200px';
        tabDisbursement.style.height = '500px';
        if (window.disbChartInstance) {
            const oldAnim = window.disbChartInstance.options.animation;
            window.disbChartInstance.options.animation = false;
            window.disbChartInstance.resize();
            window.disbChartInstance.update();
            window.disbChartInstance.options.animation = oldAnim;
        }
    }

    // Helper to generate guaranteed high-resolution S-Curve chart image
    function getSCurvePrintImage(proj) {
        if (typeof Chart === 'undefined') return '';
        try {
            let labels = window.sChart?.data?.labels || [];
            let planData = window.sChart?.data?.datasets?.[0]?.data || [];
            let actualData = window.sChart?.data?.datasets?.[1]?.data || [];

            // If sChart data is missing or empty, calculate directly from proj.tasks
            if (labels.length === 0 && proj && proj.tasks && proj.tasks.length > 0) {
                let minDate = new Date("2099-01-01");
                let maxDate = new Date("2000-01-01");
                proj.tasks.forEach(t => {
                    if (t.startDate) {
                        let d = new Date(t.startDate);
                        if (d < minDate) minDate = d;
                    }
                    if (t.endDate) {
                        let d = new Date(t.endDate);
                        if (d > maxDate) maxDate = d;
                    }
                });

                if (minDate <= maxDate) {
                    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
                    const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
                    const now = new Date();
                    let totalWeight = 0;
                    proj.tasks.forEach(t => totalWeight += parseFloat(t.weight) || 0);
                    if (totalWeight === 0) totalWeight = 100;

                    let currentActualProj = 0;
                    proj.tasks.forEach(t => currentActualProj += ((parseFloat(t.actual) || 0) * (parseFloat(t.weight) || 0)) / 100);
                    currentActualProj = (currentActualProj / totalWeight) * 100;

                    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                    let isPastOrCurrentMonth = true;

                    while (current <= endMonth) {
                        labels.push(thaiMonths[current.getMonth()] + " " + (current.getFullYear() + 543).toString().substring(2));
                        let eom = new Date(current.getFullYear(), current.getMonth() + 1, 0);
                        let monthPlan = 0;
                        proj.tasks.forEach(t => {
                            if (!t.startDate || !t.endDate) return;
                            let start = new Date(t.startDate);
                            let end = new Date(t.endDate);
                            let w = parseFloat(t.weight) || 0;
                            if (eom >= end) monthPlan += w;
                            else if (eom > start) monthPlan += ((eom - start) / (end - start)) * w;
                        });

                        planData.push(((monthPlan / totalWeight) * 100).toFixed(2));

                        if (isPastOrCurrentMonth) {
                            if (current.getFullYear() === now.getFullYear() && current.getMonth() === now.getMonth()) {
                                actualData.push(currentActualProj.toFixed(2));
                                isPastOrCurrentMonth = false;
                            } else if (current > now) {
                                isPastOrCurrentMonth = false;
                                actualData.push(null);
                            } else {
                                let nowPlan = 0;
                                proj.tasks.forEach(t => {
                                    if (!t.startDate || !t.endDate) return;
                                    let start = new Date(t.startDate);
                                    let end = new Date(t.endDate);
                                    let w = parseFloat(t.weight) || 0;
                                    if (now >= end) nowPlan += w;
                                    else if (now > start) nowPlan += ((now - start) / (end - start)) * w;
                                });
                                nowPlan = (nowPlan / totalWeight) * 100;
                                let ratio = nowPlan > 0 ? currentActualProj / nowPlan : 0;
                                let estimatedActual = ((monthPlan / totalWeight) * 100) * ratio;
                                if (estimatedActual > currentActualProj) estimatedActual = currentActualProj;
                                actualData.push(estimatedActual.toFixed(2));
                            }
                        } else {
                            actualData.push(null);
                        }
                        current.setMonth(current.getMonth() + 1);
                    }

                    if (proj.status === "แล้วเสร็จ") {
                        actualData = planData.map(d => d);
                    }
                }
            }

            if (labels.length === 0) return '';

            const offCanvas = document.createElement('canvas');
            offCanvas.width = 1100;
            offCanvas.height = 430;
            const ctx = offCanvas.getContext('2d');

            // White background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 1100, 430);

            // Gradients
            const gradPurple = ctx.createLinearGradient(0, 0, 0, 390);
            gradPurple.addColorStop(0, 'rgba(116, 44, 129, 0.35)');
            gradPurple.addColorStop(0.7, 'rgba(116, 44, 129, 0.06)');
            gradPurple.addColorStop(1, 'rgba(116, 44, 129, 0.0)');

            const gradGold = ctx.createLinearGradient(0, 0, 0, 390);
            gradGold.addColorStop(0, 'rgba(243, 156, 18, 0.22)');
            gradGold.addColorStop(0.7, 'rgba(243, 156, 18, 0.04)');
            gradGold.addColorStop(1, 'rgba(243, 156, 18, 0.0)');

            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'แผนงาน (Plan) %',
                            data: planData,
                            borderColor: '#F39C12',
                            backgroundColor: gradGold,
                            borderWidth: 3,
                            borderDash: [6, 4],
                            fill: true,
                            tension: 0.38,
                            pointRadius: 4.5,
                            pointBackgroundColor: '#F39C12',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2
                        },
                        {
                            label: 'ผลงานจริง (Actual) %',
                            data: actualData,
                            borderColor: '#742C81',
                            backgroundColor: gradPurple,
                            borderWidth: 3.5,
                            fill: true,
                            tension: 0.38,
                            pointRadius: 5,
                            pointBackgroundColor: '#742C81',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: false,
                    animation: false,
                    layout: {
                        padding: { top: 15, right: 30, bottom: 15, left: 15 }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: v => v + '%',
                                font: { family: 'Prompt, sans-serif', size: 12, weight: '600' },
                                color: '#64748B'
                            },
                            grid: { color: '#E2E8F0' }
                        },
                        x: {
                            ticks: {
                                font: { family: 'Prompt, sans-serif', size: 12, weight: '600' },
                                color: '#334155'
                            },
                            grid: { color: '#F1F5F9' }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { family: 'Prompt, sans-serif', size: 13, weight: '600' },
                                color: '#1E293B',
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    }
                }
            });

            const imgData = offCanvas.toDataURL('image/png', 1.0);
            chart.destroy();
            return imgData;
        } catch (err) {
            console.error('Error generating print S-Curve image:', err);
            return '';
        }
    }

    // Helper to generate guaranteed high-resolution Disbursement chart image
    function getDisbursementPrintImage(proj) {
        if (typeof Chart === 'undefined') return '';
        try {
            let labels = window.disbChartInstance?.data?.labels || [];
            let planData = window.disbChartInstance?.data?.datasets?.[0]?.data || [];
            let actualData = window.disbChartInstance?.data?.datasets?.[1]?.data || [];

            const d = proj.disbursement;
            if (labels.length === 0 && d) {
                if (d.plan && d.plan.length > 0) {
                    let accPlan = 0;
                    let accPlanUpToViewedMonth = 0;
                    let targetMonthStr = d.currentViewMonth ? d.currentViewMonth.split(' ')[0] : '';
                    let foundViewMonthIndex = d.plan.length - 1;
                    if (targetMonthStr) {
                        const idx = d.plan.findIndex(pl => pl.month.includes(targetMonthStr));
                        if (idx !== -1) foundViewMonthIndex = idx;
                    }

                    d.plan.forEach((pl, idx) => {
                        labels.push(`${pl.month} ${pl.year || ''}`.trim());
                        accPlan += pl.amount;
                        planData.push(accPlan);
                        if (idx <= foundViewMonthIndex) {
                            actualData.push(d.actual && d.actual[idx] ? d.actual[idx] : 0);
                            accPlanUpToViewedMonth += pl.amount;
                        } else {
                            actualData.push(0);
                        }
                    });

                    const barLabel = targetMonthStr ? `สะสมถึง ${targetMonthStr}` : 'แผนรวม / จ่ายจริงปีนี้';
                    labels.push(barLabel);
                    planData.push(accPlanUpToViewedMonth);
                    actualData.push(d.paidCurrentYear || 0);
                } else if (d.items && d.items.length > 0) {
                    labels.push('แผนรวม', 'จ่ายจริงสะสม');
                    planData.push(d.budget || 0, 0);
                    actualData.push(0, d.totalPaid || 0);
                }
            }

            if (labels.length === 0) return '';

            const offCanvas = document.createElement('canvas');
            offCanvas.width = 1100;
            offCanvas.height = 360;
            const ctx = offCanvas.getContext('2d');

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 1100, 360);

            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'แผนเบิกจ่าย',
                            data: planData,
                            backgroundColor: 'rgba(41, 128, 185, 0.75)',
                            borderColor: 'rgba(41, 128, 185, 1)',
                            borderWidth: 1.5,
                            borderRadius: 4
                        },
                        {
                            label: 'จ่ายจริง',
                            data: actualData,
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 1.5,
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: false,
                    animation: false,
                    layout: {
                        padding: { top: 15, right: 25, bottom: 15, left: 15 }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (val) {
                                    if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M';
                                    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
                                    return val;
                                },
                                font: { family: 'Prompt, sans-serif', size: 11 },
                                color: '#64748B'
                            },
                            grid: { color: '#E2E8F0' }
                        },
                        x: {
                            ticks: {
                                font: { family: 'Prompt, sans-serif', size: 11, weight: '600' },
                                color: '#334155'
                            },
                            grid: { color: '#F1F5F9' }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { family: 'Prompt, sans-serif', size: 12, weight: '600' },
                                color: '#1E293B',
                                usePointStyle: true,
                                padding: 15
                            }
                        }
                    }
                }
            });

            const imgData = offCanvas.toDataURL('image/png', 1.0);
            chart.destroy();
            return imgData;
        } catch (err) {
            console.error('Error generating print disbursement image:', err);
            return '';
        }
    }

    // Capture S-Curve and Disbursement images with guaranteed offscreen render
    let sCurveImg = '';
    if (selected.includes('scurve')) {
        const sCurveCanvas = document.getElementById('sCurveChart');
        if (sCurveCanvas && sCurveCanvas.width > 50 && sCurveCanvas.height > 50) {
            try {
                sCurveImg = sCurveCanvas.toDataURL('image/png', 1.0);
            } catch (e) { }
        }
        if (!sCurveImg || sCurveImg === 'data:,' || sCurveImg.length < 100) {
            sCurveImg = getSCurvePrintImage(p);
        }
    }

    let disbImg = '';
    if (selected.includes('disbursement')) {
        const disbCanvas = document.getElementById('disbursementChart');
        if (disbCanvas && disbCanvas.width > 50 && disbCanvas.height > 50) {
            try {
                disbImg = disbCanvas.toDataURL('image/png', 1.0);
            } catch (e) { }
        }
        if (!disbImg || disbImg === 'data:,' || disbImg.length < 100) {
            disbImg = getDisbursementPrintImage(p);
        }
    }

    // Build print sections HTML
    let printContent = '';

    // --- 1. Executive Summary Ribbon (Always included at top of report) ---
    printContent += `
    <div class="print-kpi-ribbon">
        <div class="print-kpi-card">
            <span class="print-kpi-label">แผนงานสะสม (Plan)</span>
            <span class="print-kpi-value text-plan">${planVal.toFixed(2)}%</span>
            <span class="print-kpi-sub">ตามแผนงานหลัก WBS</span>
        </div>
        <div class="print-kpi-card">
            <span class="print-kpi-label">ผลงานจริงสะสม (Actual)</span>
            <span class="print-kpi-value text-actual">${actualVal.toFixed(2)}%</span>
            <span class="print-kpi-sub">ผลดำเนินงานล่าสุด</span>
        </div>
        <div class="print-kpi-card">
            <span class="print-kpi-label">ส่วนต่าง (Variance)</span>
            <span class="print-kpi-value ${isAhead ? 'text-success' : 'text-danger'}">${isAhead ? '+' : ''}${varianceVal}%</span>
            <span class="print-kpi-sub">${isAhead ? '● เร็วกว่า / ตามแผน' : '▲ ล่าช้ากว่าแผน'}</span>
        </div>
        <div class="print-kpi-card">
            <span class="print-kpi-label">สถานะโครงการ</span>
            <span class="print-kpi-value text-status">${p.status || 'อยู่ระหว่างก่อสร้าง'}</span>
            <span class="print-kpi-sub">${p.duration || 'ระยะเวลาตามสัญญา'}</span>
        </div>
    </div>`;

    // --- 2. Project Information Section ---
    if (selected.includes('projectInfo')) {
        printContent += `
        <div class="print-section">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-circle-info"></i></span>
                <h2 class="print-section-title">ข้อมูลโครงการ (Project Overview)</h2>
            </div>
            <table class="info-table">
                <tr>
                    <td class="label-cell">ชื่อโครงการ</td>
                    <td class="value-cell" colspan="3"><strong>${p.name}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">ประเภทการดำเนินงาน</td>
                    <td class="value-cell">${p.type || 'ดำเนินการเอง'}</td>
                    <td class="label-cell">ผู้รับจ้าง / หน่วยงาน</td>
                    <td class="value-cell">${p.contractor || 'การไฟฟ้าส่วนภูมิภาค'}</td>
                </tr>
                <tr>
                    <td class="label-cell">ผู้ควบคุมงาน กฟภ.</td>
                    <td class="value-cell">${p.supervisor || '-'}</td>
                    <td class="label-cell">คณะกรรมการตรวจรับ</td>
                    <td class="value-cell">${p.committee || '-'}</td>
                </tr>
                <tr>
                    <td class="label-cell">ระยะเวลาโครงการ</td>
                    <td class="value-cell">${p.duration || '-'} (${p.startDate || '-'} ถึง ${p.endDate || '-'})</td>
                    <td class="label-cell">สถานะปัจจุบัน</td>
                    <td class="value-cell"><span class="badge-status">${p.status}</span></td>
                </tr>
                ${(() => {
                const cleanDesc = window.cleanProjectDetails(p.details);
                return cleanDesc ? `
                <tr>
                    <td class="label-cell">รายละเอียดเพิ่มเติม</td>
                    <td class="value-cell" colspan="3">${window.escapeHtmlForReport(cleanDesc)}</td>
                </tr>` : '';
            })()}
            </table>
        </div>`;
    }

    // --- 3. WBS Work Breakdown Structure Table Section ---
    if (selected.includes('wbs') && p.tasks && p.tasks.length > 0) {
        let wbsRows = '';
        let totalW = 0;
        p.tasks.forEach((t, idx) => {
            const w = parseFloat(t.weight) || 0;
            const act = parseFloat(t.actual) || 0;
            totalW += w;
            const barColor = act >= 100 ? '#10B981' : (act > 0 ? '#742C81' : '#CBD5E1');
            wbsRows += `
                <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>
                        <strong>${t.name}</strong>
                        ${t.description ? `<div class="task-desc-sub">${t.description}</div>` : ''}
                    </td>
                    <td class="text-center">${t.startDate || '-'}</td>
                    <td class="text-center">${t.endDate || '-'}</td>
                    <td class="text-center font-bold">${w.toFixed(2)}%</td>
                    <td>
                        <div class="prog-cell-content">
                            <span class="prog-num font-bold ${act >= 100 ? 'text-success' : ''}">${act.toFixed(2)}%</span>
                            <div class="print-prog-bar">
                                <div class="print-prog-fill" style="width: ${Math.min(act, 100)}%; background-color: ${barColor};"></div>
                            </div>
                        </div>
                    </td>
                </tr>`;
        });

        printContent += `
        <div class="print-section">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-list-check"></i></span>
                <h2 class="print-section-title">แผนงานก่อสร้างและผลงานจริง (Work Breakdown Structure - WBS)</h2>
            </div>
            <table class="wbs-table">
                <thead>
                    <tr>
                        <th style="width: 45px;">ลำดับ</th>
                        <th>แผนงานย่อย (Task Name)</th>
                        <th style="width: 105px;">วันที่เริ่มต้น</th>
                        <th style="width: 105px;">วันที่สิ้นสุด</th>
                        <th style="width: 95px;">น้ำหนักงาน</th>
                        <th style="width: 150px;">ผลงานสะสม</th>
                    </tr>
                </thead>
                <tbody>
                    ${wbsRows}
                </tbody>
                <tfoot>
                    <tr class="wbs-total-row">
                        <td colspan="4" style="text-align: right; font-weight: bold; padding-right: 15px;">รวมแผนงานทั้งหมด (Total)</td>
                        <td class="text-center font-bold text-plan">${totalW.toFixed(2)}%</td>
                        <td>
                            <div class="prog-cell-content">
                                <span class="prog-num font-bold text-actual">${actualVal.toFixed(2)}%</span>
                                <div class="print-prog-bar">
                                    <div class="print-prog-fill" style="width: ${Math.min(actualVal, 100)}%; background-color: #742C81;"></div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>`;
    }

    // --- 4. S-Curve Chart Section ---
    if (selected.includes('scurve')) {
        printContent += `
        <div class="print-section pdf-page-break-before">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-chart-line"></i></span>
                <h2 class="print-section-title">กราฟ S-Curve เปรียบเทียบแผนงานกับผลงานจริง (Plan vs Actual Progress)</h2>
            </div>
            <div class="chart-box-print">
                ${sCurveImg ? `<img src="${sCurveImg}" alt="S-Curve Chart" class="print-chart-img">` : '<p class="no-data-msg">ไม่สามารถประมวลผลกราฟ S-Curve ได้</p>'}
            </div>
        </div>`;
    }

    // --- 5. Monthly S-Curve Numerical Table (Plan vs Actual) ---
    if (selected.includes('scurveTable')) {
        let scurveTableRows = '';
        const sLabels = window.sChart?.data?.labels || [];
        const sPlans = window.sChart?.data?.datasets?.[0]?.data || [];
        const sActuals = window.sChart?.data?.datasets?.[1]?.data || [];

        if (sLabels.length > 0) {
            sLabels.forEach((lbl, idx) => {
                const pVal = sPlans[idx] !== undefined && sPlans[idx] !== null ? parseFloat(sPlans[idx]).toFixed(2) : '-';
                const hasAct = sActuals[idx] !== undefined && sActuals[idx] !== null && sActuals[idx] !== '';
                const aVal = hasAct ? parseFloat(sActuals[idx]).toFixed(2) : '-';

                let diffVal = '-';
                let statusLabel = '<span class="badge-pending">รอรายงาน</span>';
                if (hasAct && pVal !== '-') {
                    const diff = (parseFloat(aVal) - parseFloat(pVal)).toFixed(2);
                    const diffNum = parseFloat(diff);
                    if (diffNum >= 0) {
                        diffVal = `<span class="text-success font-bold">+${diff}%</span>`;
                        statusLabel = '<span class="badge-success">ตามแผน / เร็วกว่า</span>';
                    } else {
                        diffVal = `<span class="text-danger font-bold">${diff}%</span>`;
                        statusLabel = '<span class="badge-danger">ล่าช้ากว่าแผน</span>';
                    }
                }

                scurveTableRows += `
                    <tr>
                        <td class="text-center">${idx + 1}</td>
                        <td class="font-bold text-center">${lbl}</td>
                        <td class="text-center text-plan font-bold">${pVal !== '-' ? pVal + '%' : '-'}</td>
                        <td class="text-center text-actual font-bold">${aVal !== '-' ? aVal + '%' : '-'}</td>
                        <td class="text-center">${diffVal}</td>
                        <td class="text-center">${statusLabel}</td>
                    </tr>`;
            });

            printContent += `
            <div class="print-section">
                <div class="print-section-header">
                    <span class="section-icon"><i class="fa-solid fa-table-cells"></i></span>
                    <h2 class="print-section-title">ตารางตัวเลขความก้าวหน้าสะสมรายเดือน (S-Curve Monthly Performance)</h2>
                </div>
                <table class="wbs-table monthly-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">เดือนที่</th>
                            <th>งวดเดือน (Month)</th>
                            <th style="width: 140px;">แผนงานสะสม (Plan %)</th>
                            <th style="width: 140px;">ผลงานจริงสะสม (Actual %)</th>
                            <th style="width: 130px;">ส่วนต่าง (Variance %)</th>
                            <th style="width: 150px;">สถานะการดำเนินงาน</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scurveTableRows}
                    </tbody>
                </table>
            </div>`;
        }
    }

    // --- 6. Gantt Chart Section ---
    if (selected.includes('gantt')) {
        let ganttContent = '';
        const allTasks = p.tasks || [];

        // Ensure window.currentGantt is stretched to full printable width (~1440px)
        if (window.currentGantt) {
            try {
                const numCols = (window.currentGantt.dates && window.currentGantt.dates.length > 0) ? window.currentGantt.dates.length : 8;
                const targetColWidth = Math.max(160, Math.floor(1440 / numCols));
                window.currentGantt.options.column_width = targetColWidth;
                window.currentGantt.render();
            } catch (err) {
                console.warn('Gantt render error before print:', err);
            }
        }

        const ganttSvg = document.querySelector('#ganttChart');
        if (ganttSvg && ganttSvg.innerHTML.trim()) {
            const svgClone = ganttSvg.cloneNode(true);
            const gridBg = ganttSvg.querySelector('.grid-background');
            const w = gridBg ? parseFloat(gridBg.getAttribute('width')) : (parseFloat(ganttSvg.getAttribute('width')) || 1440);
            const h = parseFloat(ganttSvg.getAttribute('height')) || 690;

            svgClone.setAttribute('viewBox', `0 0 ${w} ${h}`);
            svgClone.removeAttribute('width');
            svgClone.removeAttribute('height');
            svgClone.style.width = '100%';
            svgClone.style.height = 'auto';
            svgClone.style.display = 'block';

            // Explicitly set presentation fill and stroke attributes on elements so print engines render colors
            svgClone.querySelectorAll('.grid-background').forEach(el => el.setAttribute('fill', '#ffffff'));
            svgClone.querySelectorAll('.grid-header').forEach(el => {
                el.setAttribute('fill', '#f8fafc');
                el.setAttribute('stroke', '#e2e8f0');
            });
            svgClone.querySelectorAll('.grid-row').forEach((el, i) => {
                el.setAttribute('fill', i % 2 === 0 ? '#ffffff' : '#f8fafc');
            });
            svgClone.querySelectorAll('.row-line').forEach(el => el.setAttribute('stroke', '#f1f5f9'));
            svgClone.querySelectorAll('.tick').forEach(el => el.setAttribute('stroke', '#e2e8f0'));
            svgClone.querySelectorAll('.bar-wrapper .bar').forEach(el => {
                el.setAttribute('fill', '#E2E8F0');
                el.setAttribute('rx', '6');
                el.setAttribute('ry', '6');
            });
            svgClone.querySelectorAll('.bar-wrapper .bar-progress').forEach(el => {
                el.setAttribute('fill', '#742C81');
                el.setAttribute('rx', '6');
                el.setAttribute('ry', '6');
            });
            svgClone.querySelectorAll('.bar-label').forEach(el => {
                el.setAttribute('fill', '#1E293B');
                el.setAttribute('font-weight', '600');
                el.setAttribute('font-family', 'Prompt, sans-serif');
                el.setAttribute('font-size', '11px');
            });
            svgClone.querySelectorAll('text').forEach(el => {
                if (!el.getAttribute('fill')) el.setAttribute('fill', '#64748B');
                el.setAttribute('font-family', 'Prompt, Sarabun, sans-serif');
            });
            svgClone.querySelectorAll('.upper-text').forEach(el => {
                el.setAttribute('fill', '#475569');
                el.setAttribute('font-weight', '600');
            });
            svgClone.querySelectorAll('.lower-text').forEach(el => {
                el.setAttribute('fill', '#64748B');
            });

            ganttContent = svgClone.outerHTML;
        }

        printContent += `
        <div class="print-section pdf-page-break-before">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-chart-gantt"></i></span>
                <h2 class="print-section-title">แผนผังการดำเนินงานแกนต์ชาร์ต (Gantt Chart Timeline)</h2>
            </div>
            <div class="gantt-print-header-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="font-size: 11.5px; color: #475569;">
                    <i class="fa-solid fa-list-check" style="color: #742C81;"></i> แผนงานย่อยทั้งหมด: <strong>${allTasks.length} รายการ</strong>
                </div>
                <div style="display: flex; gap: 14px; font-size: 11px;">
                    <span style="display: inline-flex; align-items: center; gap: 5px;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #742C81; display: inline-block;"></span> ผลงานจริงสะสม (Actual)</span>
                    <span style="display: inline-flex; align-items: center; gap: 5px;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #E2E8F0; display: inline-block;"></span> แผนงานตามกำหนดการ (Plan)</span>
                </div>
            </div>
            <div class="gantt-box-print">
                ${ganttContent || '<p class="no-data-msg">ไม่มีข้อมูลผังแกนต์ชาร์ต</p>'}
            </div>
        </div>`;
    }

    // --- 7. Progress Photo Gallery (Grouped by Sub-Tasks) ---
    if (selected.includes('gallery') && p.gallery && p.gallery.length > 0) {
        const validGallery = p.gallery.filter(item => item.url);
        if (validGallery.length > 0) {
            // Group photos by taskId / taskName
            const taskGroups = {};
            const tasksList = p.tasks || [];

            tasksList.forEach(t => {
                taskGroups[t.id] = {
                    id: t.id,
                    name: t.name,
                    actual: t.actual || 0,
                    photos: []
                };
            });

            const unassignedPhotos = [];

            validGallery.forEach(item => {
                let matched = false;
                if (item.taskId && taskGroups[item.taskId]) {
                    taskGroups[item.taskId].photos.push(item);
                    matched = true;
                } else if (item.taskName) {
                    const found = tasksList.find(t => t.name === item.taskName);
                    if (found && taskGroups[found.id]) {
                        taskGroups[found.id].photos.push(item);
                        matched = true;
                    }
                } else if (item.desc) {
                    const found = tasksList.find(t => item.desc.includes(t.name));
                    if (found && taskGroups[found.id]) {
                        taskGroups[found.id].photos.push(item);
                        matched = true;
                    }
                }
                if (!matched) {
                    unassignedPhotos.push(item);
                }
            });

            let galleryHtml = '';

            // Render each task group that has photos
            Object.values(taskGroups).forEach(group => {
                if (group.photos.length > 0) {
                    let photoCards = '';
                    group.photos.forEach(item => {
                        photoCards += `
                            <div class="gallery-print-card">
                                <div class="gallery-print-img-wrapper">
                                    <img src="${item.url}" onerror="this.src='mascot.jpg'" alt="${item.desc || 'ภาพความก้าวหน้า'}">
                                    <span class="gallery-print-date-badge">${item.date || '-'}</span>
                                </div>
                                <div class="gallery-print-caption">
                                    <strong>${item.desc || group.name}</strong>
                                </div>
                            </div>`;
                    });

                    galleryHtml += `
                    <div class="gallery-print-task-block">
                        <div class="gallery-print-task-header">
                            <span class="gallery-print-task-title">
                                <i class="fa-solid fa-folder-open" style="color: #742C81; margin-right: 6px;"></i> ${group.name}
                            </span>
                            <div class="gallery-print-task-meta">
                                <span class="badge-task-progress">ความก้าวหน้างาน: ${group.actual}%</span>
                                <span class="badge-photo-count">${group.photos.length} รูป</span>
                            </div>
                        </div>
                        <div class="gallery-print-grid">
                            ${photoCards}
                        </div>
                    </div>`;
                }
            });

            // Render unassigned photos if any
            if (unassignedPhotos.length > 0) {
                let generalCards = '';
                unassignedPhotos.forEach(item => {
                    generalCards += `
                        <div class="gallery-print-card">
                            <div class="gallery-print-img-wrapper">
                                <img src="${item.url}" onerror="this.src='mascot.jpg'" alt="${item.desc || 'ภาพความก้าวหน้า'}">
                                <span class="gallery-print-date-badge">${item.date || '-'}</span>
                            </div>
                            <div class="gallery-print-caption">
                                <strong>${item.desc || 'ภาพหน้างานทั่วไป'}</strong>
                            </div>
                        </div>`;
                });

                galleryHtml += `
                <div class="gallery-print-task-block">
                    <div class="gallery-print-task-header">
                        <span class="gallery-print-task-title">
                            <i class="fa-regular fa-images" style="color: #64748B; margin-right: 6px;"></i> ภาพหน้างานทั่วไป / ไม่ระบุแผนงานย่อย
                        </span>
                        <div class="gallery-print-task-meta">
                            <span class="badge-photo-count">${unassignedPhotos.length} รูป</span>
                        </div>
                    </div>
                    <div class="gallery-print-grid">
                        ${generalCards}
                    </div>
                </div>`;
            }

            printContent += `
            <div class="print-section pdf-page-break-before">
                <div class="print-section-header">
                    <span class="section-icon"><i class="fa-solid fa-camera-retro"></i></span>
                    <h2 class="print-section-title">รูปภาพความก้าวหน้าหน้างานก่อสร้าง (จัดกลุ่มตามแผนงานย่อย)</h2>
                </div>
                ${galleryHtml}
            </div>`;
        }
    }

    // --- 8. Disbursement Section ---
    if (selected.includes('disbursement') && p.disbursement) {
        const d = p.disbursement;
        const fmt = (num) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(num || 0);

        let disbRows = '';
        let sumBudget = 0, sumTotalPaid = 0, sumTotalCommitment = 0;
        let sumPr = 0, sumPo = 0, sumGr = 0, sumIr = 0, sumRemaining = 0;

        if (d.items && d.items.length > 0) {
            d.items.forEach((item, idx) => {
                const b = parseFloat(item.budget) || 0;
                const tp = parseFloat(item.totalPaid) || 0;
                const pr = parseFloat(item.pr) || 0;
                const po = parseFloat(item.po) || 0;
                const gr = parseFloat(item.gr) || 0;
                const ir = parseFloat(item.ir) || 0;
                const cmt = item.commitment !== undefined && item.commitment !== null && !isNaN(parseFloat(item.commitment))
                    ? parseFloat(item.commitment)
                    : (pr + po + gr + ir);
                const rm = parseFloat(item.remaining) || 0;
                const pct = b > 0 ? ((tp / b) * 100).toFixed(2) : '0.00';

                sumBudget += b;
                sumTotalPaid += tp;
                sumTotalCommitment += cmt;
                sumPr += pr;
                sumPo += po;
                sumGr += gr;
                sumIr += ir;
                sumRemaining += rm;

                let statusClass = 'badge-pending';
                if (item.status && item.status.includes('CLSD')) statusClass = 'badge-success';
                else if (item.status && (item.status.includes('REL') || item.status.includes('PREL'))) statusClass = 'badge-status';

                disbRows += `
                    <tr>
                        <td class="text-center">${idx + 1}</td>
                        <td><strong>${item.name}</strong></td>
                        <td class="text-center"><code>${item.wbs || '-'}</code></td>
                        <td class="text-right">${fmt(b)}</td>
                        <td class="text-right text-success font-bold">${fmt(tp)}</td>
                        <td class="text-right text-amber font-bold">${fmt(cmt)}</td>
                        <td class="text-right">${fmt(pr)}</td>
                        <td class="text-right">${fmt(po)}</td>
                        <td class="text-right">${fmt(gr)}</td>
                        <td class="text-right">${fmt(ir)}</td>
                        <td class="text-right text-danger">${fmt(rm)}</td>
                        <td class="text-center font-bold">${pct}%</td>
                        <td class="text-center"><span class="${statusClass}">${item.status || '-'}</span></td>
                    </tr>`;
            });
        } else {
            disbRows = '<tr><td colspan="13" class="text-center" style="color: #94A3B8; padding: 20px;">ยังไม่มีข้อมูลรายการเบิกจ่ายงบประมาณ</td></tr>';
        }

        const overallBudget = parseFloat(d.budget) || sumBudget;
        const overallPaid = parseFloat(d.totalPaid) || sumTotalPaid;
        const overallCommitment = (d.commitment !== undefined && d.commitment !== null && !isNaN(parseFloat(d.commitment)) && parseFloat(d.commitment) > 0)
            ? parseFloat(d.commitment)
            : sumTotalCommitment;
        const overallRemaining = parseFloat(d.remaining) || sumRemaining;
        const overallPct = overallBudget > 0 ? ((overallPaid / overallBudget) * 100).toFixed(2) : '0.00';

        const printPlanComp = (typeof window.calcDisbursementPlanComparison === 'function')
            ? window.calcDisbursementPlanComparison(d, d.currentViewMonth)
            : { hasPlan: false, percentStr: '-', accPlan: 0, actual: 0, status: 'no_plan', color: '#94a3b8' };
        const printPlanColor = printPlanComp.color;
        const printPlanLabel = printPlanComp.monthLabel ? ` (${printPlanComp.monthLabel})` : '';
        let printPlanSub = '';
        if (printPlanComp.hasPlan && printPlanComp.accPlan > 0) {
            printPlanSub = `จ่ายจริง ${fmt(printPlanComp.actual)} / แผน ${fmt(printPlanComp.accPlan)}`;
        }

        printContent += `
        <div class="print-section pdf-page-break-before">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-coins"></i></span>
                <h2 class="print-section-title">ข้อมูลการเบิกจ่ายงบประมาณโครงการและภาระผูกพัน (Disbursement & Commitments)</h2>
            </div>
            
            <div class="print-disb-kpi-grid">
                <div class="print-disb-kpi-card" style="border-left: 4px solid #2563EB;">
                    <span class="kpi-label">วงเงินงบประมาณทั้งสิ้น</span>
                    <span class="kpi-val" style="color: #2563EB;">${fmt(overallBudget)}</span>
                </div>
                <div class="print-disb-kpi-card" style="border-left: 4px solid #10B981;">
                    <span class="kpi-label">เบิกจ่ายจริงสะสม</span>
                    <span class="kpi-val" style="color: #10B981;">${fmt(overallPaid)}</span>
                </div>
                <div class="print-disb-kpi-card" style="border-left: 4px solid #D97706; background: #FFFBEB;">
                    <span class="kpi-label">ผลรวมภาระผูกพัน (Commitment)</span>
                    <span class="kpi-val" style="color: #D97706;">${fmt(overallCommitment)}</span>
                    <span style="font-size: 9px; color: #B45309; display: block; margin-top: 2px;">PR + PO + GR + IR</span>
                </div>
                <div class="print-disb-kpi-card" style="border-left: 4px solid #EF4444;">
                    <span class="kpi-label">งบประมาณคงเหลือ</span>
                    <span class="kpi-val" style="color: #EF4444;">${fmt(overallRemaining)}</span>
                </div>
                <div class="print-disb-kpi-card" style="border-left: 4px solid #742C81;">
                    <span class="kpi-label">ร้อยละเบิกจ่าย (งบรวม)</span>
                    <span class="kpi-val" style="color: #742C81;">${overallPct}%</span>
                </div>
                <div class="print-disb-kpi-card" style="border-left: 4px solid ${printPlanColor};">
                    <span class="kpi-label">เบิกจ่ายเทียบแผนสะสม${printPlanLabel}</span>
                    <span class="kpi-val" style="color: ${printPlanColor};">${printPlanComp.percentStr}</span>
                    ${printPlanSub ? `<span style="font-size: 8.5px; color: #64748B; display: block; margin-top: 2px;">${printPlanSub}</span>` : ''}
                </div>
            </div>

            ${disbImg ? `
            <div class="chart-box-print" style="margin-bottom: 20px;">
                <img src="${disbImg}" alt="Disbursement Chart" class="print-chart-img" style="max-height: 380px;">
            </div>` : ''}
            
            <table class="wbs-table" style="font-size: 10.5px;">
                <thead>
                    <tr>
                        <th style="width: 30px;">#</th>
                        <th>รายการเบิกจ่าย</th>
                        <th style="width: 80px; text-align: center;">WBS</th>
                        <th style="width: 100px; text-align: right;">งบประมาณ</th>
                        <th style="width: 100px; text-align: right;">จ่ายจริงสะสม</th>
                        <th style="width: 105px; text-align: right; background: #5a1e66;">รวมภาระผูกพัน</th>
                        <th style="width: 75px; text-align: right;">PR</th>
                        <th style="width: 75px; text-align: right;">PO</th>
                        <th style="width: 75px; text-align: right;">GR</th>
                        <th style="width: 75px; text-align: right;">IR</th>
                        <th style="width: 95px; text-align: right;">งบคงเหลือ</th>
                        <th style="width: 55px; text-align: center;">% เบิก</th>
                        <th style="width: 75px; text-align: center;">สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    ${disbRows}
                </tbody>
                <tfoot>
                    <tr class="wbs-total-row" style="background: #F1F5F9; font-weight: bold; border-top: 2px solid #CBD5E1;">
                        <td colspan="3" style="text-align: right; font-weight: bold; padding-right: 8px;">ผลรวมทั้งหมด (Total Summary)</td>
                        <td class="text-right font-bold text-plan">${fmt(sumBudget)}</td>
                        <td class="text-right font-bold text-success">${fmt(sumTotalPaid)}</td>
                        <td class="text-right font-bold text-amber" style="background: #FEF3C7;">${fmt(sumTotalCommitment)}</td>
                        <td class="text-right font-bold">${fmt(sumPr)}</td>
                        <td class="text-right font-bold">${fmt(sumPo)}</td>
                        <td class="text-right font-bold">${fmt(sumGr)}</td>
                        <td class="text-right font-bold">${fmt(sumIr)}</td>
                        <td class="text-right font-bold text-danger">${fmt(sumRemaining)}</td>
                        <td class="text-center font-bold text-actual">${overallPct}%</td>
                        <td class="text-center">-</td>
                    </tr>
                </tfoot>
            </table>
        </div>`;
    }

    // --- 9. Official 3-Party Signatures Block ---
    if (selected.includes('signatures')) {
        const digitalSigs = (typeof window.getPctsSignatures === 'function')
            ? window.getPctsSignatures()
            : { supervisor: null, contractor: null, committee: null };

        const sigImgSupervisor = digitalSigs.supervisor
            ? `<div style="height: 44px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px;"><img src="${digitalSigs.supervisor}" alt="Supervisor Signature" style="max-height: 42px; max-width: 140px; object-fit: contain;"></div>`
            : `<div class="sig-space"></div>`;

        const sigImgContractor = digitalSigs.contractor
            ? `<div style="height: 44px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px;"><img src="${digitalSigs.contractor}" alt="Contractor Signature" style="max-height: 42px; max-width: 140px; object-fit: contain;"></div>`
            : `<div class="sig-space"></div>`;

        const sigImgCommittee = digitalSigs.committee
            ? `<div style="height: 44px; display: flex; align-items: center; justify-content: center; margin-bottom: 2px;"><img src="${digitalSigs.committee}" alt="Committee Signature" style="max-height: 42px; max-width: 140px; object-fit: contain;"></div>`
            : `<div class="sig-space"></div>`;

        printContent += `
        <div class="print-section signatures-section">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-file-signature"></i></span>
                <h2 class="print-section-title">การตรวจรับและรับรองรายงานความก้าวหน้าโครงการ</h2>
            </div>
            <div class="signatures-grid">
                <div class="signature-card">
                    <div class="sig-title">ผู้ควบคุมงาน</div>
                    ${sigImgSupervisor}
                    <div class="sig-dots">..................................................................</div>
                    <div class="sig-name">( ${p.supervisor || '......................................................'} )</div>
                    <div class="sig-position">ผู้ควบคุมงาน การไฟฟ้าส่วนภูมิภาค</div>
                    <div class="sig-date">${digitalSigs.supervisor ? `วันที่ ${today}` : 'วันที่ ......... / ......... / .................'}</div>
                </div>
                <div class="signature-card">
                    <div class="sig-title">${p.type === 'ดำเนินการเอง' ? 'หัวหน้าชุดงาน / ผู้ปฏิบัติงาน' : 'ผู้รับจ้าง / ผู้แทนผู้รับจ้าง'}</div>
                    ${sigImgContractor}
                    <div class="sig-dots">..................................................................</div>
                    <div class="sig-name">( ${p.contractor || '......................................................'} )</div>
                    <div class="sig-position">${p.type === 'ดำเนินการเอง' ? 'การไฟฟ้าส่วนภูมิภาค' : 'ผู้รับจ้างตามสัญญา'}</div>
                    <div class="sig-date">${digitalSigs.contractor ? `วันที่ ${today}` : 'วันที่ ......... / ......... / .................'}</div>
                </div>
                <div class="signature-card">
                    <div class="sig-title">ประธานกรรมการตรวจรับพัสดุ</div>
                    ${sigImgCommittee}
                    <div class="sig-dots">..................................................................</div>
                    <div class="sig-name">( ${p.committee1 || p.committee || '......................................................'} )</div>
                    <div class="sig-position">ประธานกรรมการตรวจรับพัสดุ</div>
                    <div class="sig-date">${digitalSigs.committee ? `วันที่ ${today}` : 'วันที่ ......... / ......... / .................'}</div>
                </div>
            </div>
        </div>`;
    }

    // --- RESTORE ORIGINAL TAB STYLES ---
    if (tabSCurve) tabSCurve.setAttribute('style', origSCurveStyle);
    if (tabGantt) tabGantt.setAttribute('style', origGanttStyle);
    if (tabDisbursement && selected.includes('disbursement')) tabDisbursement.setAttribute('style', origDisbStyle);

    const reportStyles = `
        @page {
            size: A4 landscape;
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

        /* Screen Action Toolbar */
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
            transition: all 0.2s;
        }
        .btn-print-confirm {
            background: #F59E0B;
            color: #1E1E2D;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
        }
        .btn-print-confirm:hover {
            background: #D97706;
            transform: translateY(-1px);
        }
        .btn-print-dl {
            background: #E67E22;
            color: #FFFFFF;
            box-shadow: 0 2px 8px rgba(230, 126, 34, 0.4);
        }
        .btn-print-dl:hover {
            background: #D35400;
            transform: translateY(-1px);
        }
        .btn-print-close {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .btn-print-close:hover {
            background: rgba(255, 255, 255, 0.25);
        }

        /* Document Container */
        .report-page-container {
            max-width: 1140px;
            margin: 0 auto;
            padding: 20px 0;
        }

        /* Official PEA Header */
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #742C81;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }
        .report-header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .pea-emblem-badge {
            width: 48px;
            height: 48px;
            background: #742C81;
            color: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 3px 8px rgba(116, 44, 129, 0.3);
        }
        .report-title-block h1 {
            font-size: 18px;
            color: #742C81;
            font-weight: 700;
            line-height: 1.3;
            margin-bottom: 3px;
        }
        .report-title-block .doc-subtitle {
            font-size: 11.5px;
            color: #64748B;
        }
        .report-header-right {
            text-align: right;
        }
        .brand-pcts {
            font-family: 'Prompt', sans-serif;
            font-size: 22px;
            font-weight: 700;
            color: #742C81;
            letter-spacing: 0.5px;
        }
        .brand-sub {
            font-size: 9.5px;
            color: #94A3B8;
            letter-spacing: 0.3px;
        }
        .report-meta-tag {
            display: inline-block;
            margin-top: 4px;
            font-size: 10.5px;
            color: #64748B;
            background: #F8FAFC;
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid #E2E8F0;
        }

        /* Executive KPI Ribbon */
        .print-kpi-ribbon {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }
        .print-kpi-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 10px 14px;
            text-align: center;
        }
        .print-kpi-label {
            display: block;
            font-size: 10.5px;
            color: #64748B;
            margin-bottom: 3px;
            font-family: 'Prompt', sans-serif;
            font-weight: 500;
        }
        .print-kpi-value {
            display: block;
            font-family: 'Prompt', sans-serif;
            font-size: 20px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 2px;
        }
        .print-kpi-sub {
            font-size: 9.5px;
            color: #94A3B8;
        }

        /* Sections */
        .print-section {
            margin-bottom: 22px;
            /* Allow page-break inside large sections (tables, galleries) to avoid huge blank areas */
            page-break-inside: auto;
            break-inside: auto;
            orphans: 3;
            widows: 3;
        }
        .print-section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 6px;
            margin-bottom: 12px;
            /* Prevent section header from being orphaned at page bottom */
            page-break-after: avoid;
            break-after: avoid;
        }
        .section-icon {
            color: #742C81;
            font-size: 14px;
        }
        .print-section-title {
            font-size: 14px;
            color: #742C81;
            font-weight: 600;
        }

        /* Tables */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            overflow: hidden;
            font-size: 11.5px;
        }
        .info-table td {
            padding: 7px 12px;
            border-bottom: 1px solid #E2E8F0;
            border-right: 1px solid #E2E8F0;
        }
        .info-table .label-cell {
            width: 160px;
            background: #F8FAFC;
            color: #475569;
            font-weight: 600;
        }
        .info-table .value-cell {
            color: #1E293B;
        }

        .wbs-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            overflow: hidden;
        }
        .wbs-table thead th {
            background: #742C81;
            color: white;
            padding: 8px 8px;
            font-family: 'Prompt', sans-serif;
            font-weight: 600;
            font-size: 11px;
            text-align: left;
            border-right: 1px solid rgba(255,255,255,0.15);
        }
        .wbs-table tbody td {
            padding: 6px 8px;
            border-bottom: 1px solid #E2E8F0;
            border-right: 1px solid #F1F5F9;
            vertical-align: middle;
        }
        .wbs-table tbody tr:nth-child(even) {
            background-color: #F8FAFC;
        }
        .wbs-total-row td {
            background: #F1F5F9;
            font-family: 'Prompt', sans-serif;
            padding: 8px;
            border-top: 2px solid #CBD5E1;
        }
        .task-desc-sub {
            font-size: 9.5px;
            color: #64748B;
            margin-top: 1px;
        }

        /* Progress Bars */
        .prog-cell-content {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .prog-num {
            width: 48px;
            text-align: right;
            font-size: 10.5px;
        }
        .print-prog-bar {
            flex: 1;
            height: 6px;
            background: #E2E8F0;
            border-radius: 4px;
            overflow: hidden;
        }
        .print-prog-fill {
            height: 100%;
            border-radius: 4px;
        }

        /* Chart Images */
        .chart-box-print {
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 12px;
            background: white;
            text-align: center;
        }
        .print-chart-img {
            max-width: 100%;
            max-height: 480px;
            object-fit: contain;
            display: block;
            margin: 0 auto;
        }
        .gantt-box-print {
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 12px;
            background: white;
            width: 100%;
            box-sizing: border-box;
            overflow: visible;
        }
        .gantt-box-print svg {
            width: 100% !important;
            height: auto !important;
            display: block !important;
            background: white;
            box-sizing: border-box;
        }
        .gantt .grid-background { fill: #ffffff !important; }
        .gantt .grid-header { fill: #f8fafc !important; stroke: #e2e8f0 !important; }
        .gantt .grid-row { fill: #ffffff !important; }
        .gantt .grid-row:nth-child(even) { fill: #f8fafc !important; }
        .gantt .row-line { stroke: #f1f5f9 !important; }
        .gantt .tick { stroke: #e2e8f0 !important; }
        .gantt .today-highlight { fill: rgba(245, 158, 11, 0.15) !important; }
        .gantt .bar-wrapper .bar {
            fill: #E2E8F0 !important;
            rx: 6px !important;
            ry: 6px !important;
        }
        .gantt .bar-wrapper .bar-progress {
            fill: #742C81 !important;
            rx: 6px !important;
            ry: 6px !important;
        }
        .gantt .bar-label {
            fill: #1e293b !important;
            font-weight: 600 !important;
            font-size: 11px !important;
            font-family: 'Prompt', sans-serif !important;
        }
        .gantt text {
            font-family: 'Prompt', 'Sarabun', sans-serif !important;
            font-size: 10px !important;
            fill: #64748b !important;
        }
        .gantt .upper-text {
            fill: #475569 !important;
            font-weight: 600 !important;
        }
        .gantt .lower-text {
            fill: #64748b !important;
        }

        /* Grouped Progress Gallery */
        .gallery-print-task-block {
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            margin-bottom: 16px;
            overflow: hidden;
            background: white;
            /* Allow page break inside task blocks with many photos */
            page-break-inside: auto;
            break-inside: auto;
        }
        .gallery-print-task-header {
            background: #F8FAFC;
            padding: 8px 14px;
            border-bottom: 1px solid #E2E8F0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .gallery-print-task-title {
            font-family: 'Prompt', sans-serif;
            font-weight: 600;
            font-size: 12px;
            color: #1E293B;
        }
        .gallery-print-task-meta {
            display: flex;
            gap: 8px;
        }
        .badge-task-progress {
            background: #EAE0F0;
            color: #742C81;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
        }
        .badge-photo-count {
            background: #E2E8F0;
            color: #475569;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
        }
        .gallery-print-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 12px;
        }
        .gallery-print-card {
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            overflow: hidden;
            background: #FFFFFF;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .gallery-print-task-header {
            page-break-after: avoid;
            break-after: avoid;
        }
        .gallery-print-img-wrapper {
            position: relative;
            width: 100%;
            height: 160px;
            background: #F1F5F9;
        }
        .gallery-print-img-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .gallery-print-date-badge {
            position: absolute;
            bottom: 6px;
            right: 6px;
            background: rgba(15, 23, 42, 0.75);
            color: white;
            font-size: 9.5px;
            padding: 2px 6px;
            border-radius: 4px;
        }
        .gallery-print-caption {
            padding: 8px 10px;
            background: #FAFAFA;
            font-size: 10.5px;
            color: #334155;
            line-height: 1.4;
            min-height: 38px;
        }

        /* Disbursement KPIs */
        .print-disb-kpi-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 8px;
            margin-bottom: 14px;
        }
        .print-disb-kpi-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            padding: 10px 14px;
            text-align: center;
        }
        .print-disb-kpi-card .kpi-label {
            display: block;
            font-size: 10.5px;
            color: #64748B;
            margin-bottom: 2px;
        }
        .print-disb-kpi-card .kpi-val {
            font-family: 'Prompt', sans-serif;
            font-size: 17px;
            font-weight: 700;
        }

        /* Signatures Section */
        .signatures-section {
            margin-top: 24px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .signatures-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-top: 10px;
        }
        .signature-card {
            border: 1px solid #CBD5E1;
            border-radius: 8px;
            padding: 16px 12px 14px;
            text-align: center;
            background: #FFFFFF;
        }
        .sig-title {
            font-family: 'Prompt', sans-serif;
            font-weight: 600;
            font-size: 11.5px;
            color: #334155;
            margin-bottom: 30px;
        }
        .sig-space {
            height: 30px;
        }
        .sig-dots {
            font-size: 11px;
            color: #94A3B8;
            margin-bottom: 6px;
            letter-spacing: 1px;
        }
        .sig-name {
            font-size: 11.5px;
            font-weight: 600;
            color: #1E293B;
            margin-bottom: 4px;
        }
        .sig-position {
            font-size: 10px;
            color: #64748B;
            margin-bottom: 12px;
        }
        .sig-date {
            font-size: 10px;
            color: #94A3B8;
        }

        /* Badges & Utility Colors */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-plan { color: #D97706; }
        .text-amber { color: #D97706; }
        .text-actual { color: #742C81; }
        .text-success { color: #10B981; }
        .text-danger { color: #EF4444; }
        .badge-status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10.5px;
            font-weight: 600;
            background: #EAE0F0;
            color: #742C81;
        }
        .badge-success {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9.5px;
            font-weight: 600;
            background: #D1FAE5;
            color: #065F46;
        }
        .badge-danger {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9.5px;
            font-weight: 600;
            background: #FEE2E2;
            color: #991B1B;
        }
        .badge-pending {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9.5px;
            font-weight: 600;
            background: #F1F5F9;
            color: #64748B;
        }
        .no-data-msg {
            color: #94A3B8;
            font-style: italic;
            padding: 24px;
            text-align: center;
        }

        /* Footer */
        .report-footer {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px solid #E2E8F0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9.5px;
            color: #94A3B8;
        }

        /* Print Media Queries */
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
            /* Let large sections flow naturally across pages */
            .print-section {
                page-break-inside: auto;
                break-inside: auto;
            }
            /* Section headers should never be orphaned at page bottom */
            .print-section-header {
                page-break-after: avoid !important;
                break-after: avoid !important;
            }
            /* Tables: allow page breaks between rows but not within a row */
            .wbs-table {
                page-break-inside: auto;
            }
            .wbs-table tr {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .wbs-table thead {
                display: table-header-group;
            }
            .wbs-table tfoot {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            /* Info table: keep together since it's small */
            .info-table {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            /* Gallery: allow page breaks between task blocks */
            .gallery-print-task-block {
                page-break-inside: auto;
                break-inside: auto;
            }
            /* Individual gallery cards should not break */
            .gallery-print-card {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            /* Gallery task header stays with its photos */
            .gallery-print-task-header {
                page-break-after: avoid !important;
                break-after: avoid !important;
            }
            /* Charts and images: keep together */
            .chart-box-print {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .gantt-box-print {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            /* KPI ribbons: keep together */
            .print-kpi-ribbon {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .print-disb-kpi-grid {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            /* Signatures section must stay together */
            .signatures-section {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            /* Footer stays at page bottom */
            .report-footer {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .pdf-page-break-before {
                page-break-before: always;
                break-before: page;
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
                margin-top: 20px;
                margin-bottom: 30px;
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
                    <h1>${p.name}</h1>
                    <div class="doc-subtitle">รายงานติดตามและประเมินผลความก้าวหน้าโครงการก่อสร้าง &bull; ข้อมูล ณ วันที่ ${today}</div>
                </div>
            </div>
            <div class="report-header-right">
                <div class="brand-pcts">PCTS</div>
                <div class="brand-sub">PEA Construction Tracking System</div>
                <span class="report-meta-tag">พิมพ์เมื่อ: ${printTimestamp}</span>
            </div>
        </div>

        ${printContent}

        <!-- Footer -->
        <div class="report-footer">
            <span>ระบบติดตามและบริหารโครงการก่อสร้าง การไฟฟ้าส่วนภูมิภาค (PCTS)</span>
            <span>เอกสารนี้สร้างขึ้นโดยระบบอัตโนมัติ &bull; วันที่ ${today}</span>
        </div>
    `;

    const cleanProjectNameForPopup = (p.name || 'Project').replace(/[\\/:*?"<>|]/g, '_').trim();

    const fullDocHtml = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>รายงานความก้าวหน้าโครงการ - ${p.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/frappe-gantt/0.6.1/frappe-gantt.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
    <style>
        ${reportStyles}
    </style>
</head>
<body>
    <!-- Screen Action Bar -->
    <div class="print-action-bar">
        <div class="print-action-info">
            <strong><i class="fa-solid fa-file-lines"></i> รายงานความก้าวหน้าโครงการก่อสร้าง (PCTS)</strong>
            <span>${p.name}</span>
        </div>
        <div class="print-action-buttons">
            <button id="btnPopupDownloadPdf" class="btn-print-action btn-print-dl" onclick="downloadDirectPdfFromPopup()">
                <i class="fa-solid fa-file-arrow-down"></i> ดาวน์โหลดไฟล์ PDF
            </button>
            <button class="btn-print-action btn-print-confirm" onclick="window.print()">
                <i class="fa-solid fa-print"></i> สั่งพิมพ์ / บันทึก PDF (Print)
            </button>
            <button class="btn-print-action btn-print-close" onclick="window.close()">
                <i class="fa-solid fa-xmark"></i> ปิดหน้านี้
            </button>
        </div>
    </div>

    <!-- Main Printable Content Container -->
    <div class="report-page-container" id="reportMainContainer">
        ${bodyContainerHtml}
    </div>

    <script>
        function downloadDirectPdfFromPopup() {
            var btn = document.getElementById('btnPopupDownloadPdf');
            var el = document.getElementById('reportMainContainer');
            if (!el || typeof html2pdf === 'undefined') {
                window.print();
                return;
            }
            var origText = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังสร้าง PDF...';
            }
            window.scrollTo(0, 0);
            var opt = {
                margin: [10, 10, 10, 10],
                filename: 'รายงาน_${cleanProjectNameForPopup}.pdf',
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scrollY: 0,
                    scrollX: 0,
                    windowWidth: 1200
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
                pagebreak: {
                    mode: ['css', 'legacy'],
                    before: '.pdf-page-break-before',
                    after: '.pdf-page-break-after',
                    avoid: ['.print-kpi-ribbon', '.print-disb-kpi-grid', '.chart-box-print', '.gantt-box-print', '.info-table', '.signatures-section', '.gallery-print-card', '.signature-card']
                }
            };
            html2pdf().set(opt).from(el).save().then(function() {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = origText;
                }
            }).catch(function(err) {
                console.error(err);
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = origText;
                }
                window.print();
            });
        }
        window.addEventListener('load', function() {
            setTimeout(function() {
                window.print();
            }, 500);
        });
    <\/script>
</body>
</html>`;

    return {
        p,
        selected,
        today,
        printTimestamp,
        stylesCss: reportStyles,
        bodyContainerHtml,
        fullDocHtml
    };
};

window.printSelectedSections = function () {
    const selected = Array.from(document.querySelectorAll('input[name="printSection"]:checked')).map(cb => cb.value);

    if (selected.length === 0) {
        alert('กรุณาเลือกอย่างน้อย 1 หัวข้อเพื่อพิมพ์รายงาน');
        return;
    }

    const p = window.currentProjectViewData;
    if (!p) {
        alert('ไม่พบข้อมูลโครงการ');
        return;
    }

    window.closePrintModal();

    const report = window.buildReportPayload(selected);
    if (!report) return;

    // Open popup print window
    const printWindow = window.open('', '_blank', 'width=1200,height=880');
    if (!printWindow) {
        // Fallback for mobile popup blocker: offer immediate direct PDF download!
        if (confirm('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป (Popup Blocker)\n\nต้องการให้ระบบดาวน์โหลดรายงานเป็นไฟล์ PDF ให้โดยตรงหรือไม่?')) {
            window.downloadSelectedReportPDF();
        }
        return;
    }

    printWindow.document.write(report.fullDocHtml);
    printWindow.document.close();
};

window.downloadSelectedReportPDF = function () {
    const selected = Array.from(document.querySelectorAll('input[name="printSection"]:checked')).map(cb => cb.value);

    if (selected.length === 0) {
        alert('กรุณาเลือกอย่างน้อย 1 หัวข้อเพื่อดาวน์โหลดรายงาน PDF');
        return;
    }

    const p = window.currentProjectViewData;
    if (!p) {
        alert('ไม่พบข้อมูลโครงการ');
        return;
    }

    window.closePrintModal();

    const loadingModal = document.getElementById('pdfLoadingModal');
    if (loadingModal) loadingModal.style.display = 'flex';

    setTimeout(async () => {
        try {
            if (typeof window.ensureHtml2Pdf === 'function') {
                await window.ensureHtml2Pdf();
            }
            if (typeof html2pdf === 'undefined') {
                throw new Error('ไม่สามารถโหลดไลบรารีสร้าง PDF ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่');
            }
            const report = window.buildReportPayload(selected);
            if (!report) {
                if (loadingModal) loadingModal.style.display = 'none';
                return;
            }

            // Create off-screen sandbox wrapper (keep inner target opacity: 1 so html2canvas renders full color, never blank!)
            const container = document.createElement('div');
            container.id = 'pdf-render-sandbox';
            container.style.position = 'fixed';
            container.style.left = '-15000px';
            container.style.top = '0';
            container.style.width = '1140px';
            container.style.zIndex = '-1';
            container.style.pointerEvents = 'none';
            container.style.backgroundColor = '#ffffff';
            container.style.overflow = 'visible';

            container.innerHTML = `
                <style>
                    ${report.stylesCss}
                    #pdf-render-target.report-page-container {
                        max-width: 1120px !important;
                        width: 1120px !important;
                        padding: 12px 16px !important;
                        margin: 0 !important;
                        background: #ffffff !important;
                        color: #1e293b !important;
                        box-shadow: none !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                    }
                </style>
                <div id="pdf-render-target" class="report-page-container">
                    ${report.bodyContainerHtml}
                </div>
            `;
            document.body.appendChild(container);

            const targetEl = container.querySelector('#pdf-render-target') || container;

            // Wait for any remote images to load
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

            const cleanProjectName = (p.name || 'Project').replace(/[\\/:*?"<>|]/g, '_').trim();
            const opt = {
                margin: [10, 10, 10, 10],
                filename: `รายงาน_${cleanProjectName}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scrollY: 0,
                    scrollX: 0,
                    windowWidth: 1160
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'landscape'
                },
                pagebreak: {
                    mode: ['css', 'legacy'],
                    before: '.pdf-page-break-before',
                    after: '.pdf-page-break-after',
                    avoid: ['.print-kpi-ribbon', '.print-disb-kpi-grid', '.chart-box-print', '.gantt-box-print', '.info-table', '.signatures-section', '.gallery-print-card', '.signature-card', '.wbs-table tr']
                }
            };

            await html2pdf().set(opt).from(targetEl).save();
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF: ' + (err.message || err));
        } finally {
            const container = document.getElementById('pdf-render-sandbox');
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            if (loadingModal) loadingModal.style.display = 'none';
        }
    }, 150);
};

})();
