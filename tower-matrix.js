/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: tower-matrix.js - Transmission Line 115 kV Pole-by-Pole Matrix Engine
 * ==============================================================================
 */

(function () {
    'use strict';

    window.currentTowerFilterStatus = 'all';
    window.currentTowerSearch = '';
    window.currentEditingTowerId = null;

    /**
     * สร้างชุดข้อมูลเริ่มต้นสำหรับต้นเสาสายส่ง 115 kV (หากโครงการยังไม่มีข้อมูล)
     * @param {Object} project 
     */
    window.initProjectTowers = function (project) {
        if (!project) return [];
        if (Array.isArray(project.towers) && project.towers.length > 0) {
            // ปรับปรุงหมายเลขเสาเดิมที่เคยใช้ T นำหน้า ให้เป็น P นำหน้าทั้งหมดอัตโนมัติ
            project.towers.forEach(t => {
                if (t.towerNo && /^[Tt]\d+/.test(t.towerNo)) {
                    t.towerNo = 'P' + t.towerNo.substring(1);
                }
                if (t.id && /^[Tt]\d+/.test(t.id)) {
                    t.id = 'P' + t.id.substring(1);
                }
            });
            return project.towers;
        }

        const baseLat = project.latitude || 13.547530;
        const baseLng = project.longitude || 100.274410;
        const totalTowers = 24; // มาตรฐานช่วงสายส่ง 115 kV เข้าสถานีไฟฟ้า ~6-8 กม.

        const towerTypes = ['Terminal', 'Tension', 'Suspension', 'Suspension', 'Angle', 'Suspension', 'Suspension', 'Tension'];
        const towers = [];

        for (let i = 1; i <= totalTowers; i++) {
            const towerNo = `P${String(i).padStart(2, '0')}`;
            const typeIndex = (i - 1) % towerTypes.length;
            const type = (i === 1 || i === totalTowers) ? 'Terminal' : towerTypes[typeIndex];

            // จำลองความคืบหน้าตามลำดับหน้างานจริง (หัวแถวเสร็จก่อน ท้ายแถวกำลังทำ)
            let foundation = 'pending';
            let erection = 'pending';
            let stringing = 'pending';
            let testing = 'pending';
            let obstacle = '';

            if (i <= 18) {
                foundation = 'done';
            } else if (i <= 21) {
                foundation = 'in_progress';
            } else {
                foundation = 'pending';
            }

            if (i <= 14) {
                erection = 'done';
            } else if (i <= 17) {
                erection = 'in_progress';
            }

            if (i <= 10) {
                stringing = 'done';
            } else if (i <= 13) {
                stringing = 'in_progress';
            }

            if (i <= 8) {
                testing = 'done';
            }

            // จำลองคอขวดงานก่อสร้าง (Bottlenecks / ROW Issues) จุดสำคัญ
            if (i === 8) {
                erection = 'done';
                stringing = 'blocked';
                obstacle = 'ติดปัญหาสายสื่อสารและแนวเสาเดิมรอสับเปลี่ยนวงจร (Hot Line Work)';
            } else if (i === 15) {
                foundation = 'done';
                erection = 'blocked';
                obstacle = 'ติดปัญหาเจรจาพื้นที่กรรมสิทธิ์ที่ดินชาวบ้าน (Right of Way / ROW) กม. 3+200';
            } else if (i === 22) {
                foundation = 'blocked';
                obstacle = 'ติดแนวท่อประปาภูมิภาคใต้ดิน รอประสานงานเปิดหน้าดิน';
            }

            // คำนวณพิกัด GPS จำลองทอดยาวตามแนวเส้นทางสายส่ง
            const offset = (i - 1) * 0.0025;
            const lat = parseFloat((baseLat + offset * 0.8).toFixed(6));
            const lng = parseFloat((baseLng + offset * 1.1).toFixed(6));

            towers.push({
                id: towerNo,
                towerNo: towerNo,
                type: type,
                span: `กม. ${((i - 1) * 0.35).toFixed(2)} - ${(i * 0.35).toFixed(2)}`,
                latitude: lat,
                longitude: lng,
                foundation: foundation,
                erection: erection,
                stringing: stringing,
                testing: testing,
                obstacle: obstacle,
                updatedAt: '2026-10-15'
            });
        }

        project.towers = towers;
        return towers;
    };

    /**
     * เรนเดอร์แท็บ Tower-by-Tower Matrix ของสายส่ง 115 kV
     */
    window.renderTowerMatrixTab = function (project = null) {
        const p = project || window.currentProjectViewData;
        if (!p) return;

        const towers = window.initProjectTowers(p);
        const container = document.getElementById('towerMatrixContainer');
        if (!container) return;

        // คำนวณสถิติความคืบหน้ารายเฟส
        const total = towers.length;
        const countPhase = (phase, status) => towers.filter(t => t[phase] === status).length;

        const foundDone = countPhase('foundation', 'done');
        const erectDone = countPhase('erection', 'done');
        const stringDone = countPhase('stringing', 'done');
        const testDone = countPhase('testing', 'done');

        const blockedTowers = towers.filter(t => 
            t.foundation === 'blocked' || t.erection === 'blocked' || 
            t.stringing === 'blocked' || t.testing === 'blocked' || (t.obstacle && t.obstacle.trim().length > 0)
        );

        // Header & KPI Summary Ribbon
        let html = `
            <!-- Top Action Toolbar -->
            <div class="tower-toolbar card" style="margin-bottom: 15px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="margin: 0; font-size: 16px; color: var(--pea-purple); display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-tower-broadcast"></i> แดชบอร์ดความคืบหน้ารายต้นเสา สายส่ง 115 kV (Pole-by-Pole Matrix)
                    </h3>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: var(--text-secondary);">
                        เจาะลึก 4 ขั้นตอนก่อสร้างรายต้น (ฐานราก ➔ ตั้งเสา ➔ พาดสาย ➔ ตรวจรับ) จัดการคอขวดและกรรมสิทธิ์ที่ดิน (ROW)
                    </p>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="window.exportTowerMatrixExcel()" title="ส่งออกตารางเป็นไฟล์ Excel (.xlsx)">
                        <i class="fa-solid fa-file-excel" style="color: #10b981;"></i> ส่งออก Excel
                    </button>
                    <button type="button" class="btn btn-primary btn-sm role-editor" onclick="window.openAddNewTowerModal()" title="เพิ่มข้อมูลต้นเสาใหม่ (Add Pole)">
                        <i class="fa-solid fa-plus"></i> เพิ่มต้นเสา (Add Pole)
                    </button>
                </div>
            </div>

            <!-- KPI Ribbon -->
            <div class="tower-kpi-grid">
                <div class="tower-kpi-card">
                    <div class="kpi-icon" style="background: rgba(116, 44, 129, 0.1); color: var(--pea-purple);"><i class="fa-solid fa-tower-broadcast"></i></div>
                    <div class="kpi-info">
                        <span class="label">จำนวนเสาทั้งหมด</span>
                        <strong class="val">${total} <span class="unit">ต้น</span></strong>
                        <span class="sub">สายส่ง 115 kV</span>
                    </div>
                </div>

                <div class="tower-kpi-card">
                    <div class="kpi-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;"><i class="fa-solid fa-cubes-stacked"></i></div>
                    <div class="kpi-info">
                        <span class="label">1. งานฐานราก</span>
                        <strong class="val">${foundDone}/${total} <span class="unit">ต้น</span></strong>
                        <span class="sub" style="color: #10b981;">${((foundDone / total) * 100).toFixed(1)}% แล้วเสร็จ</span>
                    </div>
                </div>

                <div class="tower-kpi-card">
                    <div class="kpi-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;"><i class="fa-solid fa-arrows-up-to-line"></i></div>
                    <div class="kpi-info">
                        <span class="label">2. งานตั้งเสา</span>
                        <strong class="val">${erectDone}/${total} <span class="unit">ต้น</span></strong>
                        <span class="sub" style="color: #3b82f6;">${((erectDone / total) * 100).toFixed(1)}% แล้วเสร็จ</span>
                    </div>
                </div>

                <div class="tower-kpi-card">
                    <div class="kpi-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;"><i class="fa-solid fa-bolt"></i></div>
                    <div class="kpi-info">
                        <span class="label">3. งานพาดสาย</span>
                        <strong class="val">${stringDone}/${total} <span class="unit">ต้น</span></strong>
                        <span class="sub" style="color: #f59e0b;">${((stringDone / total) * 100).toFixed(1)}% แล้วเสร็จ</span>
                    </div>
                </div>

                <div class="tower-kpi-card ${blockedTowers.length > 0 ? 'kpi-blocked' : ''}">
                    <div class="kpi-icon" style="background: rgba(239, 68, 68, 0.1); color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <div class="kpi-info">
                        <span class="label">จุดติดปัญหา/คอขวด</span>
                        <strong class="val" style="color: ${blockedTowers.length > 0 ? '#ef4444' : '#10b981'};">${blockedTowers.length} <span class="unit">จุด</span></strong>
                        <span class="sub">${blockedTowers.length > 0 ? '⚠️ ต้องเร่งรัดแก้ ROW' : 'ราบรื่นทุกจุด'}</span>
                    </div>
                </div>
            </div>
        `;

        // Bottlenecks Spotlight Banner (หากมีจุดติดปัญหา)
        if (blockedTowers.length > 0) {
            html += `
                <div class="tower-bottleneck-banner card">
                    <div class="banner-title">
                        <i class="fa-solid fa-circle-exclamation"></i> 
                        <strong>จุดเฝ้าระวังคอขวดงานก่อสร้าง & กรรมสิทธิ์ที่ดิน (Bottleneck & ROW Action Required)</strong>
                    </div>
                    <div class="banner-items-list">
                        ${blockedTowers.map(t => `
                            <div class="bottleneck-pill" onclick="window.openEditTowerModal('${t.id}')">
                                <span class="t-badge">${t.towerNo}</span>
                                <span class="t-obs">${t.obstacle || 'ติดปัญหาคอขวดในขั้นตอนก่อสร้าง'}</span>
                                <button type="button" class="btn-quick-view"><i class="fa-solid fa-pen-to-square"></i> แก้ไข</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Search & Filter Bar
        html += `
            <div class="tower-filter-bar card" style="margin-bottom: 12px; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                    <span style="font-size: 12px; color: var(--text-secondary); margin-right: 4px;">ตัวกรอง:</span>
                    <button type="button" class="btn-tower-chip ${window.currentTowerFilterStatus === 'all' ? 'active' : ''}" onclick="window.filterTowerMatrix('all')">ทั้งหมด (${total})</button>
                    <button type="button" class="btn-tower-chip chip-blocked ${window.currentTowerFilterStatus === 'blocked' ? 'active' : ''}" onclick="window.filterTowerMatrix('blocked')">
                        <i class="fa-solid fa-triangle-exclamation"></i> ติดปัญหา (${blockedTowers.length})
                    </button>
                    <button type="button" class="btn-tower-chip ${window.currentTowerFilterStatus === 'in_progress' ? 'active' : ''}" onclick="window.filterTowerMatrix('in_progress')">
                        <i class="fa-solid fa-spinner"></i> กำลังก่อสร้าง
                    </button>
                    <button type="button" class="btn-tower-chip ${window.currentTowerFilterStatus === 'done' ? 'active' : ''}" onclick="window.filterTowerMatrix('done')">
                        <i class="fa-solid fa-circle-check"></i> เสร็จสมบูรณ์ (${testDone})
                    </button>
                </div>

                <div style="display: flex; gap: 8px; align-items: center;">
                    <div class="search-input-wrap" style="position: relative;">
                        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 10px; top: 9px; font-size: 12px; color: #94a3b8;"></i>
                        <input type="text" id="towerSearchInput" placeholder="ค้นหาเบอร์เสา เช่น P05..." 
                               value="${window.currentTowerSearch}" 
                               oninput="window.onTowerSearchChange(this.value)"
                               style="padding: 6px 10px 6px 30px; font-size: 12px; border: 1px solid var(--border-color); border-radius: 6px; width: 170px;">
                    </div>
                </div>
            </div>
        `;

        // Filter and Search logic
        let filteredTowers = towers;
        if (window.currentTowerFilterStatus === 'blocked') {
            filteredTowers = filteredTowers.filter(t => 
                t.foundation === 'blocked' || t.erection === 'blocked' || 
                t.stringing === 'blocked' || t.testing === 'blocked' || (t.obstacle && t.obstacle.trim().length > 0)
            );
        } else if (window.currentTowerFilterStatus === 'in_progress') {
            filteredTowers = filteredTowers.filter(t => 
                (t.foundation === 'in_progress' || t.erection === 'in_progress' || t.stringing === 'in_progress' || t.testing === 'in_progress') &&
                t.testing !== 'done'
            );
        } else if (window.currentTowerFilterStatus === 'done') {
            filteredTowers = filteredTowers.filter(t => t.testing === 'done');
        }

        const q = (window.currentTowerSearch || '').toLowerCase().trim();
        if (q) {
            filteredTowers = filteredTowers.filter(t => 
                t.towerNo.toLowerCase().includes(q) || 
                t.type.toLowerCase().includes(q) || 
                (t.obstacle && t.obstacle.toLowerCase().includes(q))
            );
        }

        // Matrix Table View
        html += `
            <div class="table-responsive card" style="padding: 0; overflow: hidden; border-radius: 10px; margin-bottom: 25px;">
                <table class="pea-table tower-matrix-table" style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
                    <thead>
                        <tr>
                            <th style="width: 80px; text-align: center;">ต้นที่ (Pole No.)</th>
                            <th style="width: 110px;">ประเภทเสา (Pole Type)</th>
                            <th style="width: 130px;">ช่วงสแปน / พิกัด</th>
                            <th style="width: 140px; text-align: center;">1. ฐานราก (Foundation)</th>
                            <th style="width: 140px; text-align: center;">2. ตั้งเสา (Erection)</th>
                            <th style="width: 140px; text-align: center;">3. พาดสาย (Stringing)</th>
                            <th style="width: 140px; text-align: center;">4. ตรวจรับ (Testing)</th>
                            <th>ข้อสังเกต / คอขวด (ROW)</th>
                            <th style="width: 80px; text-align: center;">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (filteredTowers.length === 0) {
            html += `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 35px 20px; color: var(--text-secondary);">
                        <i class="fa-solid fa-tower-observation" style="font-size: 28px; opacity: 0.4; margin-bottom: 8px;"></i><br>
                        ไม่พบข้อมูลต้นเสาตามเงื่อนไขที่เลือก
                    </td>
                </tr>
            `;
        } else {
            const badgeMap = {
                done: { label: 'แล้วเสร็จ', class: 'status-done', icon: 'fa-check' },
                in_progress: { label: 'กำลังทำ', class: 'status-progress', icon: 'fa-spinner fa-spin' },
                pending: { label: 'รอดำเนินการ', class: 'status-pending', icon: 'fa-clock' },
                blocked: { label: 'ติดปัญหา', class: 'status-blocked', icon: 'fa-triangle-exclamation' }
            };

            const renderBadge = (phaseStatus, towerId, phaseName) => {
                const b = badgeMap[phaseStatus] || badgeMap.pending;
                return `
                    <span class="tower-phase-badge ${b.class} role-editor" 
                          onclick="window.cycleTowerPhaseStatus('${towerId}', '${phaseName}')" 
                          title="คลิกเพื่อเปลี่ยนสถานะด่วน">
                        <i class="fa-solid ${b.icon}"></i> ${b.label}
                    </span>
                `;
            };

            filteredTowers.forEach(t => {
                const hasBlock = (t.foundation === 'blocked' || t.erection === 'blocked' || t.stringing === 'blocked' || t.testing === 'blocked');
                const rowClass = hasBlock ? 'row-blocked' : (t.testing === 'done' ? 'row-completed' : '');

                html += `
                    <tr class="${rowClass}">
                        <td style="text-align: center; font-weight: 700;">
                            <span class="tower-code-pill">${t.towerNo}</span>
                        </td>
                        <td>
                            <span class="tower-type-pill ${t.type.toLowerCase()}">${t.type}</span>
                        </td>
                        <td>
                            <div style="font-size: 11.5px; color: #475569;">${t.span || '-'}</div>
                            <a href="javascript:void(0)" onclick="window.viewTowerGis(${t.latitude}, ${t.longitude}, '${t.towerNo}')" class="tower-gis-link" title="ดูตำแหน่งบนแผนที่ GIS">
                                <i class="fa-solid fa-location-dot"></i> ${t.latitude ? `${t.latitude.toFixed(4)}, ${t.longitude.toFixed(4)}` : 'แผนที่'}
                            </a>
                        </td>
                        <td style="text-align: center;">${renderBadge(t.foundation, t.id, 'foundation')}</td>
                        <td style="text-align: center;">${renderBadge(t.erection, t.id, 'erection')}</td>
                        <td style="text-align: center;">${renderBadge(t.stringing, t.id, 'stringing')}</td>
                        <td style="text-align: center;">${renderBadge(t.testing, t.id, 'testing')}</td>
                        <td>
                            ${t.obstacle ? `
                                <div class="obstacle-text-box">
                                    <i class="fa-solid fa-triangle-exclamation"></i> ${t.obstacle}
                                </div>
                            ` : '<span style="color: #94a3b8; font-size: 11.5px;">- ปกติ -</span>'}
                        </td>
                        <td style="text-align: center;">
                            <div style="display: flex; gap: 4px; justify-content: center;">
                                <button type="button" class="btn-icon-edit role-editor" onclick="window.openEditTowerModal('${t.id}')" title="แก้ไขข้อมูลต้นนี้">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button type="button" class="btn-icon-danger role-admin" onclick="window.deleteTowerItem('${t.id}')" title="ลบต้นนี้">
                                    <i class="fa-solid fa-trash-can"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    };

    /**
     * เปลี่ยนตัวกรองสถานะต้นเสา
     */
    window.filterTowerMatrix = function (status) {
        window.currentTowerFilterStatus = status;
        window.renderTowerMatrixTab();
    };

    /**
     * ค้นหาต้นเสา
     */
    window.onTowerSearchChange = function (val) {
        window.currentTowerSearch = val;
        window.renderTowerMatrixTab();
    };

    /**
     * เปลี่ยนสถานะแบบคลิกเดียววนรอบ (Cycle: pending -> in_progress -> done -> blocked -> pending)
     */
    window.cycleTowerPhaseStatus = async function (towerId, phase) {
        const p = window.currentProjectViewData;
        if (!p || !Array.isArray(p.towers)) return;

        const tower = p.towers.find(t => t.id === towerId);
        if (!tower) return;

        const cycleOrder = ['pending', 'in_progress', 'done', 'blocked'];
        const currentIdx = cycleOrder.indexOf(tower[phase] || 'pending');
        const nextStatus = cycleOrder[(currentIdx + 1) % cycleOrder.length];

        tower[phase] = nextStatus;
        tower.updatedAt = new Date().toISOString().split('T')[0];

        try {
            if (typeof window.saveProjects === 'function') {
                await window.saveProjects(p.id);
            }
            window.renderTowerMatrixTab(p);
        } catch (e) {
            console.error('Error updating tower status:', e);
        }
    };

    /**
     * เปิดหน้าต่างแก้ไขต้นเสาแบบละเอียด
     */
    window.openEditTowerModal = function (towerId) {
        const p = window.currentProjectViewData;
        if (!p || !Array.isArray(p.towers)) return;

        const tower = p.towers.find(t => t.id === towerId);
        if (!tower) return;

        window.currentEditingTowerId = towerId;
        const modal = document.getElementById('editTowerModal');
        if (!modal) return;

        document.getElementById('editTowerModalTitle').textContent = `แก้ไขข้อมูลต้นเสาสายส่ง (Pole): ${tower.towerNo}`;
        document.getElementById('towerNoInput').value = tower.towerNo || '';
        document.getElementById('towerTypeSelect').value = tower.type || 'Suspension';
        document.getElementById('towerSpanInput').value = tower.span || '';
        document.getElementById('towerLatInput').value = tower.latitude || '';
        document.getElementById('towerLngInput').value = tower.longitude || '';

        document.getElementById('towerPhaseFoundation').value = tower.foundation || 'pending';
        document.getElementById('towerPhaseErection').value = tower.erection || 'pending';
        document.getElementById('towerPhaseStringing').value = tower.stringing || 'pending';
        document.getElementById('towerPhaseTesting').value = tower.testing || 'pending';

        document.getElementById('towerObstacleInput').value = tower.obstacle || '';

        modal.style.display = 'flex';
    };

    /**
     * เปิดหน้าต่างเพิ่มต้นเสาใหม่
     */
    window.openAddNewTowerModal = function () {
        const p = window.currentProjectViewData;
        if (!p) return;

        window.currentEditingTowerId = null;
        const modal = document.getElementById('editTowerModal');
        if (!modal) return;

        const nextNum = (p.towers && p.towers.length > 0) ? p.towers.length + 1 : 1;
        document.getElementById('editTowerModalTitle').textContent = 'เพิ่มต้นเสาสายส่ง 115 kV ใหม่ (Add Pole)';
        document.getElementById('towerNoInput').value = `P${String(nextNum).padStart(2, '0')}`;
        document.getElementById('towerTypeSelect').value = 'Suspension';
        document.getElementById('towerSpanInput').value = `กม. ${((nextNum - 1) * 0.35).toFixed(2)} - ${(nextNum * 0.35).toFixed(2)}`;
        document.getElementById('towerLatInput').value = p.latitude || '';
        document.getElementById('towerLngInput').value = p.longitude || '';

        document.getElementById('towerPhaseFoundation').value = 'pending';
        document.getElementById('towerPhaseErection').value = 'pending';
        document.getElementById('towerPhaseStringing').value = 'pending';
        document.getElementById('towerPhaseTesting').value = 'pending';

        document.getElementById('towerObstacleInput').value = '';

        modal.style.display = 'flex';
    };

    /**
     * ปิดหน้าต่างแก้ไขต้นเสา
     */
    window.closeEditTowerModal = function () {
        const modal = document.getElementById('editTowerModal');
        if (modal) modal.style.display = 'none';
    };

    /**
     * บันทึกข้อมูลต้นเสา
     */
    window.saveTowerFormData = async function (e) {
        if (e) e.preventDefault();
        const p = window.currentProjectViewData;
        if (!p) return;

        if (!Array.isArray(p.towers)) p.towers = [];

        let towerNo = document.getElementById('towerNoInput').value.trim();
        if (/^[Tt]\d+/.test(towerNo)) {
            towerNo = 'P' + towerNo.substring(1);
        }
        const type = document.getElementById('towerTypeSelect').value;
        const span = document.getElementById('towerSpanInput').value.trim();
        const lat = parseFloat(document.getElementById('towerLatInput').value) || p.latitude;
        const lng = parseFloat(document.getElementById('towerLngInput').value) || p.longitude;

        const foundation = document.getElementById('towerPhaseFoundation').value;
        const erection = document.getElementById('towerPhaseErection').value;
        const stringing = document.getElementById('towerPhaseStringing').value;
        const testing = document.getElementById('towerPhaseTesting').value;
        const obstacle = document.getElementById('towerObstacleInput').value.trim();

        if (window.currentEditingTowerId) {
            // Edit existing
            const target = p.towers.find(t => t.id === window.currentEditingTowerId);
            if (target) {
                target.towerNo = towerNo;
                target.type = type;
                target.span = span;
                target.latitude = lat;
                target.longitude = lng;
                target.foundation = foundation;
                target.erection = erection;
                target.stringing = stringing;
                target.testing = testing;
                target.obstacle = obstacle;
                target.updatedAt = new Date().toISOString().split('T')[0];
            }
        } else {
            // Add new
            p.towers.push({
                id: towerNo,
                towerNo: towerNo,
                type: type,
                span: span,
                latitude: lat,
                longitude: lng,
                foundation: foundation,
                erection: erection,
                stringing: stringing,
                testing: testing,
                obstacle: obstacle,
                updatedAt: new Date().toISOString().split('T')[0]
            });
        }

        try {
            if (typeof window.saveProjects === 'function') {
                await window.saveProjects(p.id);
            }
            if (typeof Toastify === 'function') {
                Toastify({
                    text: `บันทึกข้อมูลต้นเสา ${towerNo} เรียบร้อยแล้ว`,
                    duration: 3000,
                    style: { background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px' }
                }).showToast();
            }
            window.closeEditTowerModal();
            window.renderTowerMatrixTab(p);
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
        }
    };

    /**
     * ลบต้นเสา
     */
    window.deleteTowerItem = async function (towerId) {
        const p = window.currentProjectViewData;
        if (!p || !Array.isArray(p.towers)) return;

        const idx = p.towers.findIndex(t => t.id === towerId);
        if (idx === -1) return;

        if (!confirm(`ยืนยันการลบต้นเสา ${p.towers[idx].towerNo}?`)) return;

        p.towers.splice(idx, 1);

        try {
            if (typeof window.saveProjects === 'function') {
                await window.saveProjects(p.id);
            }
            window.renderTowerMatrixTab(p);
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        }
    };

    /**
     * ดูพิกัดต้นเสาบนแผนที่ GIS
     */
    window.viewTowerGis = function (lat, lng, towerNo) {
        if (!lat || !lng) {
            alert(`ไม่พบพิกัด GPS ของต้นเสา ${towerNo}`);
            return;
        }

        // สลับไปแท็บแผนที่ GIS
        if (typeof window.openProjectTab === 'function') {
            const btnMap = document.querySelector('button[onclick*="tabMap"]');
            if (btnMap) {
                window.openProjectTab({ currentTarget: btnMap }, 'tabMap');
            }
        }

        // Center Leaflet map if available
        setTimeout(() => {
            if (window.projectMap && typeof window.projectMap.setView === 'function') {
                window.projectMap.setView([lat, lng], 17);
                if (typeof L !== 'undefined') {
                    L.popup()
                        .setLatLng([lat, lng])
                        .setContent(`<strong>เสาสายส่ง ${towerNo}</strong><br>พิกัด: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
                        .openOn(window.projectMap);
                }
            }
        }, 300);
    };

    /**
     * ส่งออกข้อมูล Pole-by-Pole Matrix เป็นไฟล์ Excel (.xlsx) ผ่าน SheetJS
     */
    window.exportTowerMatrixExcel = function () {
        const p = window.currentProjectViewData;
        if (!p || !Array.isArray(p.towers)) return;

        if (typeof XLSX === 'undefined') {
            alert('กำลังโหลดไลบรารี Excel กรุณารอสักครู่');
            return;
        }

        const statusText = {
            done: 'แล้วเสร็จ (Done)',
            in_progress: 'กำลังก่อสร้าง (In Progress)',
            pending: 'รอดำเนินการ (Pending)',
            blocked: 'ติดปัญหา (Blocked)'
        };

        const rows = [
            ['รายงานความคืบหน้ารายต้นเสา สายส่ง 115 kV (Pole-by-Pole Matrix)'],
            [`โครงการ: ${p.name}`],
            [`ผู้รับจ้าง: ${p.contractor || 'กฟภ.'} | วันที่ส่งออก: ${new Date().toLocaleDateString('th-TH')}`],
            [],
            ['ลำดับ', 'เบอร์ต้นเสา (Pole No.)', 'ประเภทเสา (Pole Type)', 'ช่วงสแปน', 'ละติจูด (Lat)', 'ลองจิจูด (Lng)', '1. ฐานราก (Foundation)', '2. ตั้งเสา (Erection)', '3. พาดสาย (Stringing)', '4. ตรวจรับ (Testing)', 'ข้อสังเกต / คอขวด (ROW)']
        ];

        p.towers.forEach((t, i) => {
            rows.push([
                i + 1,
                t.towerNo,
                t.type,
                t.span || '-',
                t.latitude || '-',
                t.longitude || '-',
                statusText[t.foundation] || t.foundation,
                statusText[t.erection] || t.erection,
                statusText[t.stringing] || t.stringing,
                statusText[t.testing] || t.testing,
                t.obstacle || '-'
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pole_Matrix_115kV');

        const cleanProj = p.name.replace(/[\\/:*?"<>|]/g, '_').substring(0, 30);
        XLSX.writeFile(wb, `PCTS_Pole_Matrix_${cleanProj}.xlsx`);

        if (typeof Toastify === 'function') {
            Toastify({
                text: 'ส่งออกไฟล์ Excel Pole-by-Pole Matrix สำเร็จแล้ว',
                duration: 3500,
                style: { background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px' }
            }).showToast();
        }
    };

})();
