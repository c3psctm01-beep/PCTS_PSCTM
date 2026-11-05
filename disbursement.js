/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: disbursement.js - Budget & Disbursement (ZBUDR092 & Monthly Plan) Engine
 * ==============================================================================
 */

(function () {
    'use strict';

    function calcDisbursementPlanComparison(disb, targetMonth) {
        if (!disb || !disb.plan || !Array.isArray(disb.plan) || disb.plan.length === 0) {
            return {
                hasPlan: false,
                percent: null,
                percentStr: '-',
                diffPct: null,
                accPlan: 0,
                actual: 0,
                monthLabel: '',
                status: 'no_plan',
                badgeText: 'ยังไม่มีแผนเบิกจ่าย',
                color: '#94a3b8'
            };
        }

        const monthToUse = targetMonth || disb.currentViewMonth || '';
        let targetMonthStr = '';
        let targetYearStr = '';
        if (monthToUse) {
            const parts = monthToUse.trim().split(' ');
            targetMonthStr = parts[0] || '';
            targetYearStr = parts[1] || '';
        }

        let foundIdx = -1;
        // 1. Try matching month and year
        if (targetMonthStr && targetYearStr) {
            foundIdx = disb.plan.findIndex(pl => pl.month.includes(targetMonthStr) && (pl.year ? pl.year.includes(targetYearStr) : true));
        }
        // 2. Try matching month only
        if (foundIdx === -1 && targetMonthStr) {
            foundIdx = disb.plan.findIndex(pl => pl.month.includes(targetMonthStr));
        }
        // 3. Fallback to last plan month
        if (foundIdx === -1) {
            foundIdx = disb.plan.length - 1;
        }

        let accPlan = 0;
        for (let i = 0; i <= foundIdx; i++) {
            accPlan += (parseFloat(disb.plan[i].amount) || 0);
        }

        const planItem = disb.plan[foundIdx];
        const monthLabel = planItem ? `${planItem.month} ${planItem.year || ''}`.trim() : (monthToUse || 'ล่าสุด');

        // Get actual disbursement for target month
        let actual = 0;
        if (monthToUse && disb.monthlyData && disb.monthlyData[monthToUse]) {
            const mData = disb.monthlyData[monthToUse];
            actual = (mData.paidCurrentYear !== undefined && mData.paidCurrentYear !== null && mData.paidCurrentYear > 0)
                ? parseFloat(mData.paidCurrentYear)
                : (parseFloat(mData.totalPaid) || 0);
        } else if (disb.paidCurrentYear !== undefined && disb.paidCurrentYear !== null && disb.paidCurrentYear > 0) {
            actual = parseFloat(disb.paidCurrentYear);
        } else {
            actual = parseFloat(disb.totalPaid) || 0;
        }

        if (accPlan <= 0) {
            return {
                hasPlan: true,
                percent: actual > 0 ? 100 : 0,
                percentStr: actual > 0 ? '100.00%' : '0.00%',
                diffPct: 0,
                accPlan: 0,
                actual: actual,
                monthLabel: monthLabel,
                status: 'zero_plan',
                badgeText: 'ไม่มีแผนในเดือนนี้',
                color: '#64748b'
            };
        }

        const pct = (actual / accPlan) * 100;
        const diff = pct - 100;
        let status = 'ontrack';
        let color = '#0284c7';
        let badgeText = '';

        if (pct >= 100) {
            status = 'ahead';
            color = '#10b981';
            badgeText = `+${diff.toFixed(2)}% เร็วกว่าแผน`;
        } else if (pct >= 90) {
            status = 'ontrack';
            color = '#0284c7';
            badgeText = `${diff.toFixed(2)}% ตามแผน`;
        } else if (pct >= 75) {
            status = 'behind';
            color = '#f59e0b';
            badgeText = `${diff.toFixed(2)}% ช้ากว่าแผน`;
        } else {
            status = 'delayed';
            color = '#ef4444';
            badgeText = `${diff.toFixed(2)}% ต่ำกว่าเป้าหมาย`;
        }

        return {
            hasPlan: true,
            percent: pct,
            percentStr: `${pct.toFixed(2)}%`,
            diffPct: diff,
            accPlan: accPlan,
            actual: actual,
            monthLabel: monthLabel,
            status: status,
            badgeText: badgeText,
            color: color
        };
    }
    window.calcDisbursementPlanComparison = calcDisbursementPlanComparison;

    let currentDisbUploadType = 'actual';
    let currentDisbWorkbook = null;

    window.openDisbursementUploadModal = function (type) {
        currentDisbUploadType = type;
        document.getElementById('disbUploadTitle').innerHTML = type === 'actual' ? '<i class="fa-solid fa-upload"></i> นำเข้าข้อมูลเบิกจ่าย (092)' : '<i class="fa-solid fa-upload"></i> นำเข้าแผนเบิกจ่าย';
        document.getElementById('disbFileType').value = type;
        document.getElementById('disbFileType').disabled = true;

        const yearSelect = document.getElementById('disbUploadYear');
        if (yearSelect.options.length === 0) {
            const currentYear = new Date().getFullYear() + 543;
            for (let i = currentYear - 3; i <= currentYear + 3; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = i;
                if (i === currentYear) opt.selected = true;
                yearSelect.appendChild(opt);
            }
        }

        const updateMonthTicks = () => {
            const y = yearSelect.value;
            const mData = window.currentProjectViewData?.disbursement?.monthlyData || {};
            const monthSelect = document.getElementById('disbUploadMonth');
            Array.from(monthSelect.options).forEach(opt => {
                const cleanText = opt.textContent.replace(' ✅', '');
                if (mData[`${opt.value} ${y}`]) {
                    opt.textContent = cleanText + ' ✅';
                } else {
                    opt.textContent = cleanText;
                }
            });
        };

        yearSelect.onchange = updateMonthTicks;
        updateMonthTicks();

        // Default upload month to currently viewed month if available
        const monthSelect = document.getElementById('disbUploadMonth');
        if (window.currentProjectViewData?.disbursement?.currentViewMonth) {
            const viewedM = window.currentProjectViewData.disbursement.currentViewMonth.split(' ')[0];
            if (viewedM) monthSelect.value = viewedM;
        }

        document.getElementById('disbMonthGroup').style.display = type === 'actual' ? 'flex' : 'none';
        document.getElementById('disbFileInput').value = '';
        document.getElementById('disbSheetSelector').style.display = 'none';
        currentDisbWorkbook = null;
        document.getElementById('disbursementUploadModal').style.display = 'flex';
    };

    window.closeDisbursementUploadModal = function () {
        document.getElementById('disbursementUploadModal').style.display = 'none';
    };

    function bindDisbursementUploadEvents() {
        const fileInput = document.getElementById('disbFileInput');
        if (fileInput && !fileInput._pctsBound) {
            fileInput._pctsBound = true;
            fileInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (ev) {
                    const data = new Uint8Array(ev.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    currentDisbWorkbook = workbook;

                    const sheetSelect = document.getElementById('disbSheetSelect');
                    sheetSelect.innerHTML = '';

                    workbook.SheetNames.forEach(name => {
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = name;
                        sheetSelect.appendChild(option);
                    });

                    if (currentDisbUploadType === 'actual') {
                        const zbudr = workbook.SheetNames.find(n => n.toLowerCase().includes('zbudr092'));
                        if (zbudr) sheetSelect.value = zbudr;
                    } else {
                        sheetSelect.value = workbook.SheetNames[0];
                    }

                    document.getElementById('disbSheetSelector').style.display = 'block';
                };
                reader.readAsArrayBuffer(file);
            });
        }

        const uploadForm = document.getElementById('disbursementUploadForm');
        if (uploadForm && !uploadForm._pctsBound) {
            uploadForm._pctsBound = true;
            uploadForm.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!currentDisbWorkbook) {
                    alert('กรุณาเลือกไฟล์ Excel');
                    return;
                }

                const sheetName = document.getElementById('disbSheetSelect').value;
                const worksheet = currentDisbWorkbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

                if (currentDisbUploadType === 'actual') {
                    const monthStr = document.getElementById('disbUploadMonth').value;
                    const yearStr = document.getElementById('disbUploadYear').value;
                    parseDisbursement092(data, `${monthStr} ${yearStr}`);
                } else {
                    parseDisbursementPlan(data);
                }

                window.closeDisbursementUploadModal();
                if (typeof window.saveProjects === 'function') {
                    window.saveProjects(window.currentProjectViewData?.id || null);
                }
                if (window.currentProjectViewData) {
                    window.renderDisbursementTab(window.currentProjectViewData);
                }
                alert('นำเข้าข้อมูลสำเร็จ');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindDisbursementUploadEvents);
    } else {
        bindDisbursementUploadEvents();
    }

    function parseDisbursement092(data, month) {
        if (!window.currentProjectViewData) return;
        const p = window.currentProjectViewData;

        if (!p.disbursement) p.disbursement = { items: [], plan: [], actual: [], monthlyData: {}, budget: 0, paidPrevYear: 0, paidCurrentYear: 0, totalPaid: 0, remaining: 0 };
        if (!p.disbursement.monthlyData) p.disbursement.monthlyData = {};

        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(20, data.length); i++) {
            if (data[i] && data[i].some(cell => cell && typeof cell === 'string' && (cell.includes('WBS') || cell.includes('วงเงินงบประมาณ')))) {
                headerRowIdx = i;
                break;
            }
        }

        if (headerRowIdx === -1) {
            alert('ไม่พบหัวตาราง WBS หรือ วงเงินงบประมาณ ใน Sheet นี้');
            return;
        }

        const headers = data[headerRowIdx];
        const colWbs = headers.findIndex(h => typeof h === 'string' && h.includes('WBS'));
        const colName = headers.findIndex(h => typeof h === 'string' && h.includes('รายการ'));
        const colBudget = headers.findIndex(h => typeof h === 'string' && h.includes('วงเงินงบประมาณ'));
        const colPaidPrev = headers.findIndex(h => typeof h === 'string' && h.includes('รวมจ่ายจริงถึงสิ้นปีก่อนหน้า'));
        const colPaidCurr = headers.findIndex(h => typeof h === 'string' && h.includes('รวมจ่ายจริงปีปัจจุบัน'));
        const colPaidTotal = headers.findIndex(h => typeof h === 'string' && h === 'รวมจ่ายจริง');
        const colCommitment = headers.findIndex(h => typeof h === 'string' && h.includes('ภาระผูกพัน'));
        const colRemaining = headers.findIndex(h => typeof h === 'string' && h.includes('วงเงินคงเหลือยังไม่ดำเนินการ'));
        const colStatus = headers.findIndex(h => typeof h === 'string' && h.includes('สถานะ'));

        let colPR = -1, colPO = -1, colGR = -1, colIR = -1;
        for (let i = headerRowIdx; i <= headerRowIdx + 2 && i < data.length; i++) {
            const r = data[i];
            if (!r) continue;
            if (colPR === -1) colPR = r.findIndex(h => typeof h === 'string' && (h.toUpperCase().includes('PR') || h.includes('พีอาร์') || h.includes('ใบขอซื้อ')));
            if (colPO === -1) colPO = r.findIndex(h => typeof h === 'string' && (h.toUpperCase().includes('PO') || h.includes('พีโอ') || h.includes('ใบสั่งซื้อ') || h.includes('ใบสั่งจ้าง')));
            if (colGR === -1) colGR = r.findIndex(h => typeof h === 'string' && (h.toUpperCase().includes('GR') || h.includes('จีอาร์') || h.includes('ตรวจรับ')));
            if (colIR === -1) colIR = r.findIndex(h => typeof h === 'string' && (h.toUpperCase().includes('IR') || h.includes('ไออาร์') || h.includes('ตั้งหนี้')));
        }

        const monthData = {
            items: [],
            budget: 0, paidPrevYear: 0, paidCurrentYear: 0, totalPaid: 0, commitment: 0, remaining: 0
        };

        for (let i = headerRowIdx + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const wbs = row[colWbs];
            if (!wbs || typeof wbs !== 'string' || !wbs.includes('I-')) continue;
            if (row[colName] && typeof row[colName] === 'string' && row[colName].startsWith('รวม')) continue;

            const b = parseFloat(row[colBudget]) || 0;
            const pp = parseFloat(row[colPaidPrev]) || 0;
            const pc = parseFloat(row[colPaidCurr]) || 0;
            let tp = parseFloat(row[colPaidTotal]);
            if (isNaN(tp)) tp = pp + pc;
            const pr = colPR !== -1 ? (parseFloat(row[colPR]) || 0) : 0;
            const po = colPO !== -1 ? (parseFloat(row[colPO]) || 0) : 0;
            const gr = colGR !== -1 ? (parseFloat(row[colGR]) || 0) : 0;
            const ir = colIR !== -1 ? (parseFloat(row[colIR]) || 0) : 0;
            const cmt = colCommitment !== -1 ? (parseFloat(row[colCommitment]) || 0) : (pr + po + gr + ir);
            const rm = parseFloat(row[colRemaining]) || 0;

            monthData.items.push({
                name: (row[colName] || '-').toString().trim(),
                wbs: wbs.trim(),
                budget: b,
                paidPrev: pp,
                paidCurr: pc,
                totalPaid: tp,
                commitment: cmt,
                pr: pr,
                po: po,
                gr: gr,
                ir: ir,
                remaining: rm,
                status: (row[colStatus] || '').toString().trim()
            });
        }

        monthData.budget = monthData.items.reduce((sum, item) => sum + item.budget, 0);
        monthData.paidPrevYear = monthData.items.reduce((sum, item) => sum + item.paidPrev, 0);
        monthData.paidCurrentYear = monthData.items.reduce((sum, item) => sum + item.paidCurr, 0);
        monthData.totalPaid = monthData.items.reduce((sum, item) => sum + item.totalPaid, 0);
        monthData.commitment = monthData.items.reduce((sum, item) => sum + (item.commitment || 0), 0);
        monthData.remaining = monthData.items.reduce((sum, item) => sum + item.remaining, 0);

        p.disbursement.monthlyData[month] = monthData;

        updateActualFromMonthly(p.disbursement);

        // Set to view this month automatically
        p.disbursement.currentViewMonth = month;
        applyDisbursementMonthView(p.disbursement);
    }

    function updateActualFromMonthly(disb) {
        if (!disb.plan || disb.plan.length === 0) {
            const displayMonths = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
            disb.plan = displayMonths.map(m => ({ month: m, year: '', amount: 0 }));
        }

        disb.actual = disb.plan.map(pItem => {
            const planMonthCode = pItem.month.replace(/[\.\s]/g, '').trim();
            const targetMonths = ['ตค', 'พย', 'ธค', 'มค', 'กพ', 'มีค', 'เมย', 'พค', 'มิย', 'กค', 'สค', 'กย'];
            const displayMonths = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
            const mIndex = targetMonths.indexOf(planMonthCode);
            if (mIndex !== -1) {
                let lookupKey = displayMonths[mIndex] + ' ' + (pItem.year || '');
                lookupKey = lookupKey.trim();
                if (disb.monthlyData && disb.monthlyData[lookupKey]) {
                    return disb.monthlyData[lookupKey].totalPaid;
                }

                const keys = Object.keys(disb.monthlyData || {});
                const fallbackKey = keys.find(k => {
                    if (!pItem.year) return k.startsWith(displayMonths[mIndex]);
                    return k.trim() === displayMonths[mIndex];
                });
                if (fallbackKey && disb.monthlyData[fallbackKey]) {
                    return disb.monthlyData[fallbackKey].totalPaid;
                }
            }
            return 0;
        });
    }

    function applyDisbursementMonthView(disb) {
        if (!disb.monthlyData) return;
        const m = disb.currentViewMonth;
        const data = disb.monthlyData[m];
        if (!data) return;

        disb.items = data.items;
        disb.budget = data.budget;
        disb.paidPrevYear = data.paidPrevYear;
        disb.paidCurrentYear = data.paidCurrentYear;
        disb.totalPaid = data.totalPaid;
        disb.commitment = data.commitment;
        disb.remaining = data.remaining;
    }

    window.changeDisbursementViewMonth = function () {
        if (!window.currentProjectViewData || !window.currentProjectViewData.disbursement) return;
        const disb = window.currentProjectViewData.disbursement;
        const select = document.getElementById('disbViewMonthSelect');
        if (select.value === 'latest') return;

        disb.currentViewMonth = select.value;
        applyDisbursementMonthView(disb);
        window.renderDisbursementTab(window.currentProjectViewData);
    };

    window.deleteCurrentDisbursementMonth = async function () {
        if (window.currentRole !== 'admin') {
            alert('ฟังก์ชันนี้สามารถใช้งานได้เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น');
            return;
        }
        if (!window.currentProjectViewData || !window.currentProjectViewData.disbursement) return;
        const p = window.currentProjectViewData;
        const disb = p.disbursement;

        const select = document.getElementById('disbViewMonthSelect');
        const monthToDelete = (select && select.value && select.value !== 'latest') ? select.value : disb.currentViewMonth;

        if (!monthToDelete || !disb.monthlyData || !disb.monthlyData[monthToDelete]) {
            alert('ไม่พบข้อมูลเดือนที่ต้องการลบ');
            return;
        }

        const confirmMsg = `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลเบิกจ่ายประจำเดือน "${monthToDelete}" ของโครงการนี้?\n\n(ยอดและรายการเบิกจ่ายของเดือนนี้จะถูกลบออก และกราฟจะถูกคำนวณใหม่)`;
        if (!confirm(confirmMsg)) return;

        delete disb.monthlyData[monthToDelete];

        const remainingKeys = Object.keys(disb.monthlyData);
        if (remainingKeys.length > 0) {
            const monthOrder = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            remainingKeys.sort((a, b) => {
                const partsA = a.split(' ');
                const partsB = b.split(' ');
                const mA = partsA[0];
                const yA = partsA[1] || '0';
                const mB = partsB[0];
                const yB = partsB[1] || '0';
                if (yA !== yB) return parseInt(yA) - parseInt(yB);
                return monthOrder.indexOf(mA) - monthOrder.indexOf(mB);
            });
            disb.currentViewMonth = remainingKeys[remainingKeys.length - 1];
            applyDisbursementMonthView(disb);
        } else {
            disb.currentViewMonth = null;
            disb.items = [];
            disb.paidPrevYear = 0;
            disb.paidCurrentYear = 0;
            disb.totalPaid = 0;
            disb.commitment = 0;
            disb.remaining = disb.budget || 0;
        }

        updateActualFromMonthly(disb);

        const saved = (typeof window.saveProjects === 'function') ? await window.saveProjects(p.id) : false;
        if (saved) {
            window.renderDisbursementTab(p);
            alert(`ลบข้อมูลเบิกจ่ายประจำเดือน "${monthToDelete}" เรียบร้อยแล้ว`);
        } else {
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    function parseDisbursementPlan(data) {
        if (!window.currentProjectViewData) return;
        const p = window.currentProjectViewData;

        if (!p.disbursement) p.disbursement = { items: [], plan: [], actual: [], budget: 0, paidPrevYear: 0, paidCurrentYear: 0, totalPaid: 0, remaining: 0 };

        // Normalize string by removing dots and spaces
        const normalizeMonth = (m) => m.replace(/[\.\s]/g, '').trim();
        const targetMonths = ['ตค', 'พย', 'ธค', 'มค', 'กพ', 'มีค', 'เมย', 'พค', 'มิย', 'กค', 'สค', 'กย'];
        const displayMonths = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];

        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(20, data.length); i++) {
            if (data[i] && data[i].some(cell => {
                if (typeof cell !== 'string') return false;
                const norm = normalizeMonth(cell);
                return norm === 'ตค' || norm === 'พย';
            })) {
                headerRowIdx = i;
                break;
            }
        }

        if (headerRowIdx === -1) {
            alert('ไม่พบแถวเดือน (ต.ค., พ.ย.) ใน Sheet นี้');
            return;
        }

        const monthRow = data[headerRowIdx];
        const yearRow = data[headerRowIdx - 1] || [];
        const planCols = [];
        let currentYear = '';

        for (let j = 0; j < monthRow.length; j++) {
            if (yearRow[j] && typeof yearRow[j] === 'string' && yearRow[j].includes('ปี')) {
                const match = yearRow[j].match(/\d{4}/);
                if (match) currentYear = match[0];
            }

            const cell = monthRow[j];
            if (typeof cell === 'string') {
                const norm = normalizeMonth(cell);
                const mIndex = targetMonths.findIndex(m => norm.includes(m));
                if (mIndex !== -1) {
                    planCols.push({ col: j, month: displayMonths[mIndex], year: currentYear });
                }
            }
        }

        p.disbursement.plan = planCols.map(c => ({ month: c.month, year: c.year, amount: 0 }));

        const colWbs = monthRow.findIndex(h => typeof h === 'string' && h.toUpperCase().includes('WBS'));

        for (let i = headerRowIdx + 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const hasWbs = colWbs >= 0 && row[colWbs] && typeof row[colWbs] === 'string' && row[colWbs].includes('I-');

            if (hasWbs) {
                planCols.forEach((c, idx) => {
                    const val = parseFloat(row[c.col]);
                    if (!isNaN(val)) {
                        p.disbursement.plan[idx].amount += val;
                    }
                });
            }
        }

        updateActualFromMonthly(p.disbursement);
    }

    window.renderDisbursementTab = function (p) {
        const d = p.disbursement;
        const fmt = (num) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(num || 0);

        if (!d) {
            document.getElementById('disbBudget').textContent = '-';
            document.getElementById('disbPaid').textContent = '-';
            document.getElementById('disbCommitment').textContent = '-';
            document.getElementById('disbRemaining').textContent = '-';
            document.getElementById('disbPercent').textContent = '-';
            const planVal = document.getElementById('disbPlanPercent');
            if (planVal) { planVal.textContent = '-'; planVal.style.color = '#0284c7'; }
            const planSub = document.getElementById('disbPlanSub');
            if (planSub) { planSub.textContent = ''; planSub.style.display = 'none'; }
            const planCard = document.getElementById('disbPlanCard');
            if (planCard) planCard.style.borderColor = '#0284c7';
            const planLabel = document.getElementById('disbPlanLabel');
            if (planLabel) planLabel.textContent = 'เบิกจ่ายเทียบแผนสะสม (ล่าสุด)';
            document.getElementById('disbursementTableBody').innerHTML = '<tr><td colspan="14" style="text-align:center; color: #999;">ยังไม่มีข้อมูลเบิกจ่าย — กรุณานำเข้าไฟล์ Excel</td></tr>';
            if (window.disbChartInstance) window.disbChartInstance.destroy();
            document.getElementById('disbViewMonthSelect').style.display = 'none';
            const deleteBtn = document.getElementById('btnDeleteDisbMonth');
            if (deleteBtn) deleteBtn.style.display = 'none';
            return;
        }

        const monthSelect = document.getElementById('disbViewMonthSelect');
        const deleteBtn = document.getElementById('btnDeleteDisbMonth');
        if (d.monthlyData) {
            Object.keys(d.monthlyData).forEach(k => {
                if (!k.includes(' ')) {
                    delete d.monthlyData[k];
                }
            });
        }

        if (d.monthlyData && Object.keys(d.monthlyData).length > 0) {
            monthSelect.style.display = 'inline-block';
            if (deleteBtn) deleteBtn.style.display = (window.currentRole === 'admin') ? 'inline-flex' : 'none';
            monthSelect.innerHTML = '';

            const keys = Object.keys(d.monthlyData);
            const monthOrder = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            keys.sort((a, b) => {
                const partsA = a.split(' ');
                const partsB = b.split(' ');
                const mA = partsA[0];
                const yA = partsA[1] || '0';
                const mB = partsB[0];
                const yB = partsB[1] || '0';
                if (yA !== yB) return parseInt(yA) - parseInt(yB);
                return monthOrder.indexOf(mA) - monthOrder.indexOf(mB);
            });

            if (!d.currentViewMonth || !keys.includes(d.currentViewMonth)) {
                d.currentViewMonth = keys[keys.length - 1];
                applyDisbursementMonthView(d);
            }

            keys.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = `ข้อมูลเดือน: ${m}`;
                if (m === d.currentViewMonth) opt.selected = true;
                monthSelect.appendChild(opt);
            });
        } else {
            monthSelect.style.display = 'none';
            if (deleteBtn) deleteBtn.style.display = 'none';
        }

        document.getElementById('disbBudget').textContent = fmt(d.budget);
        document.getElementById('disbPaid').textContent = fmt(d.totalPaid);
        document.getElementById('disbCommitment').textContent = fmt(d.commitment || 0);
        document.getElementById('disbRemaining').textContent = fmt(d.remaining);

        const percent = d.budget ? ((d.totalPaid / d.budget) * 100).toFixed(2) : 0;
        document.getElementById('disbPercent').textContent = `${percent}%`;

        // Render Actual vs Latest Monthly Cumulative Plan Comparison Card
        const planComp = calcDisbursementPlanComparison(d, d.currentViewMonth);
        const planVal = document.getElementById('disbPlanPercent');
        const planSub = document.getElementById('disbPlanSub');
        const planCard = document.getElementById('disbPlanCard');
        const planLabel = document.getElementById('disbPlanLabel');

        if (planVal) {
            planVal.textContent = planComp.percentStr;
            planVal.style.color = planComp.color;
        }
        if (planCard) {
            planCard.style.borderColor = planComp.color;
        }
        if (planLabel) {
            planLabel.textContent = `เบิกจ่ายเทียบแผนสะสม (${planComp.monthLabel || 'ล่าสุด'})`;
        }
        if (planSub) {
            if (!planComp.hasPlan) {
                planSub.style.display = 'block';
                planSub.innerHTML = '<span style="color: #94a3b8; font-size: 10px;"><i class="fa-solid fa-cloud-arrow-up"></i> ยังไม่ได้นำเข้าแผนเบิกจ่าย</span>';
            } else if (planComp.accPlan > 0) {
                planSub.style.display = 'block';
                let badgeClass = 'badge-ontrack';
                let icon = 'fa-check';
                if (planComp.status === 'ahead') { badgeClass = 'badge-ahead'; icon = 'fa-arrow-trend-up'; }
                else if (planComp.status === 'behind') { badgeClass = 'badge-behind'; icon = 'fa-arrow-trend-down'; }
                else if (planComp.status === 'delayed') { badgeClass = 'badge-delayed'; icon = 'fa-triangle-exclamation'; }

                planSub.innerHTML = `
                    <div style="font-size: 10.5px; color: #64748b; margin-bottom: 2px;">
                        จ่ายจริง: <strong>${fmt(planComp.actual)}</strong><br>
                        แผนสะสม: <strong>${fmt(planComp.accPlan)}</strong>
                    </div>
                    <div class="disb-card-badge ${badgeClass}"><i class="fa-solid ${icon}"></i> ${planComp.badgeText}</div>
                `;
            } else {
                planSub.style.display = 'block';
                planSub.innerHTML = `<span style="color: #94a3b8; font-size: 10px;">แผนสะสม ${planComp.monthLabel}: 0 บาท</span>`;
            }
        }

        const tbody = document.getElementById('disbursementTableBody');
        if (d.items && d.items.length > 0) {
            tbody.innerHTML = '';
            let sumBudget = 0, sumTotalPaid = 0, sumBudgetRemaining = 0, sumTotalCommitment = 0;
            let sumPr = 0, sumPo = 0, sumGr = 0, sumIr = 0, sumRemaining = 0;

            d.items.forEach((item, idx) => {
                let statusClass = 'disb-status-open';
                if (item.status.includes('CLSD')) statusClass = 'disb-status-clsd';
                if (item.status.includes('PREL')) statusClass = 'disb-status-prel';

                let pct = 0;
                if (item.budget && item.budget > 0) {
                    pct = ((item.totalPaid / item.budget) * 100).toFixed(2);
                }

                let budgetRemaining = (item.budget || 0) - (item.totalPaid || 0);
                let totalCommitment = (item.pr || 0) + (item.po || 0) + (item.gr || 0) + (item.ir || 0);

                sumBudget += item.budget || 0;
                sumTotalPaid += item.totalPaid || 0;
                sumBudgetRemaining += budgetRemaining;
                sumTotalCommitment += totalCommitment;
                sumPr += item.pr || 0;
                sumPo += item.po || 0;
                sumGr += item.gr || 0;
                sumIr += item.ir || 0;
                sumRemaining += item.remaining || 0;

                tbody.innerHTML += `
                    <tr>
                        <td style="text-align: center;">${idx + 1}</td>
                        <td>${item.name}</td>
                        <td><code>${item.wbs}</code></td>
                        <td style="text-align: right;">${fmt(item.budget)}</td>
                        <td style="text-align: right;">${fmt(item.totalPaid)}</td>
                        <td style="text-align: right; color: #2980b9; font-weight: 500;">${fmt(budgetRemaining)}</td>
                        <td style="text-align: right; color: #e74c3c; font-weight: 500;">${fmt(totalCommitment)}</td>
                        <td style="text-align: right;">${fmt(item.pr || 0)}</td>
                        <td style="text-align: right;">${fmt(item.po || 0)}</td>
                        <td style="text-align: right;">${fmt(item.gr || 0)}</td>
                        <td style="text-align: right;">${fmt(item.ir || 0)}</td>
                        <td style="text-align: right;">${fmt(item.remaining)}</td>
                        <td style="text-align: right;">${pct}%</td>
                        <td style="text-align: center;"><span class="disb-status-tag ${statusClass}">${item.status || '-'}</span></td>
                    </tr>
                `;
            });

            let sumPct = sumBudget > 0 ? ((sumTotalPaid / sumBudget) * 100).toFixed(2) : 0;
            tbody.innerHTML += `
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td colspan="3" style="text-align: right;">รวมทั้งหมด:</td>
                    <td style="text-align: right;">${fmt(sumBudget)}</td>
                    <td style="text-align: right;">${fmt(sumTotalPaid)}</td>
                    <td style="text-align: right; color: #2980b9;">${fmt(sumBudgetRemaining)}</td>
                    <td style="text-align: right; color: #e74c3c;">${fmt(sumTotalCommitment)}</td>
                    <td style="text-align: right;">${fmt(sumPr)}</td>
                    <td style="text-align: right;">${fmt(sumPo)}</td>
                    <td style="text-align: right;">${fmt(sumGr)}</td>
                    <td style="text-align: right;">${fmt(sumIr)}</td>
                    <td style="text-align: right;">${fmt(sumRemaining)}</td>
                    <td style="text-align: right;">${sumPct}%</td>
                    <td></td>
                </tr>
            `;
        } else {
            tbody.innerHTML = '<tr><td colspan="14" style="text-align:center; color: #999;">ยังไม่มีข้อมูลรายการเบิกจ่าย</td></tr>';
        }

        window.renderDisbursementChart(p);
    };

    window.disbChartInstance = null;
    window.renderDisbursementChart = function (p) {
        const ctx = document.getElementById('disbursementChart');
        if (!ctx) return;

        if (window.disbChartInstance) {
            window.disbChartInstance.destroy();
        }

        const d = p.disbursement;
        if (!d || (!d.plan?.length && !d.items?.length)) return;

        const labels = [];
        const planData = [];
        const actualData = [];

        if (d.plan && d.plan.length > 0) {
            let accPlan = 0;
            let accPlanUpToViewedMonth = 0;

            let targetMonthStr = '';
            if (d.currentViewMonth) {
                targetMonthStr = d.currentViewMonth.split(' ')[0]; // Extract "ม.ค." from "ม.ค. 2567"
            }

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

        window.disbChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'แผนเบิกจ่าย',
                        data: planData,
                        backgroundColor: 'rgba(41, 128, 185, 0.7)',
                        borderColor: 'rgba(41, 128, 185, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'จ่ายจริง',
                        data: actualData,
                        backgroundColor: 'rgba(46, 204, 113, 0.7)',
                        borderColor: 'rgba(39, 174, 96, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return new Intl.NumberFormat('th-TH', { notation: "compact", compactDisplay: "short" }).format(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' + new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(context.raw);
                            }
                        }
                    }
                }
            }
        });
    };
})();

