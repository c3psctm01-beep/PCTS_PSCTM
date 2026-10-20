/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: before-after.js - Interactive Before & After Image Comparison Slider
 * ==============================================================================
 */

(function () {
    'use strict';

    let activeSliderIndex = 0;
    let isSplitMode = true; // true = Split slider, false = Side-by-side

    /**
     * เรนเดอร์แท็บเปรียบเทียบภาพ ก่อน-หลัง (Before & After)
     */
    window.renderBeforeAfterTab = function (project) {
        const p = project || window.currentProjectViewData;
        if (!p) return;

        const pairs = Array.isArray(p.beforeAfter) ? p.beforeAfter : [];
        const container = document.getElementById('beforeAfterTabContainer');
        if (!container) return;

        if (pairs.length === 0) {
            container.innerHTML = `
                <div class="empty-punch-card" style="margin-top: 15px;">
                    <i class="fa-solid fa-code-compare" style="font-size: 42px; color: #cbd5e1; margin-bottom: 12px;"></i>
                    <h4 style="font-size: 15px; color: var(--text-secondary); margin-bottom: 4px;">ยังไม่มีคู่ภาพเปรียบเทียบ ก่อน-หลัง</h4>
                    <p style="font-size: 12px; color: #94a3b8; margin-bottom: 15px;">
                        สามารถเพิ่มภาพเปรียบเทียบพื้นที่เดิมก่อนเริ่มงาน vs ผลงานปัจจุบัน เพื่อใช้ในการนำเสนอผู้บริหาร
                    </p>
                    <button type="button" class="btn btn-primary role-editor" onclick="window.openAddBeforeAfterModal()" style="margin: 0 auto;">
                        <i class="fa-solid fa-plus"></i> เพิ่มคู่ภาพเปรียบเทียบแรก
                    </button>
                </div>
            `;
            return;
        }

        if (activeSliderIndex >= pairs.length) {
            activeSliderIndex = 0;
        }

        const currentPair = pairs[activeSliderIndex];

        container.innerHTML = `
            <div class="before-after-wrapper card mt-4">
                <!-- Toolbar: Select pair & mode toggle -->
                <div class="before-after-toolbar">
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <label style="font-weight: 600; font-size: 12.5px; color: #334155;">
                            <i class="fa-solid fa-layer-group" style="color: var(--pea-purple);"></i> เลือกจุดเปรียบเทียบ:
                        </label>
                        <select id="beforeAfterSelectPair" onchange="window.switchBeforeAfterPair(this.value)" class="pea-select-sm">
                            ${pairs.map((pr, idx) => `
                                <option value="${idx}" ${idx === activeSliderIndex ? 'selected' : ''}>
                                    ${idx + 1}. ${pr.title || 'จุดเปรียบเทียบที่ ' + (idx + 1)}
                                </option>
                            `).join('')}
                        </select>
                        <span class="status-badge" style="background: rgba(116, 44, 129, 0.1); color: var(--pea-purple); font-size: 11px;">
                            ${pairs.length} จุดเปรียบเทียบ
                        </span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <div class="view-mode-toggle">
                            <button type="button" class="btn-toggle-mode ${isSplitMode ? 'active' : ''}" onclick="window.setBeforeAfterViewMode(true)" title="มุมมองสไลเดอร์เปรียบเทียบ">
                                <i class="fa-solid fa-arrows-left-right"></i> สไลเดอร์
                            </button>
                            <button type="button" class="btn-toggle-mode ${!isSplitMode ? 'active' : ''}" onclick="window.setBeforeAfterViewMode(false)" title="มุมมองเคียงข้างกัน">
                                <i class="fa-solid fa-table-columns"></i> เคียงข้าง
                            </button>
                        </div>
                        <button type="button" class="btn btn-sm btn-primary role-editor" onclick="window.openAddBeforeAfterModal()">
                            <i class="fa-solid fa-plus"></i> เพิ่มจุดเปรียบเทียบ
                        </button>
                        <button type="button" class="btn-icon-danger role-admin" onclick="window.deleteBeforeAfterPair(${activeSliderIndex})" title="ลบจุดเปรียบเทียบนี้">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>

                <!-- Info description -->
                <div class="before-after-info-card">
                    <h3 style="margin: 0 0 4px 0; font-size: 15px; color: #1e293b;">${currentPair.title || 'จุดเปรียบเทียบความก้าวหน้า'}</h3>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">${currentPair.desc || 'ลากเส้นแบ่งตรงกลางเพื่อดูความเปลี่ยนแปลงเปรียบเทียบระหว่างสภาพพื้นที่เดิมและสถานีไฟฟ้าปัจจุบัน'}</p>
                </div>

                <!-- Comparison View Container -->
                <div class="before-after-display-area">
                    ${isSplitMode ? `
                        <!-- Split Slider View -->
                        <div class="ba-split-container" id="baSplitContainer">
                            <!-- After Image (Background Base) -->
                            <img src="${currentPair.afterUrl}" alt="After" class="ba-img ba-img-after">
                            <span class="ba-label ba-label-after"><i class="fa-solid fa-circle-check"></i> ปัจจุบัน/แล้วเสร็จ (${currentPair.afterDate || 'ปัจจุบัน'})</span>

                            <!-- Before Image (Clipped Overlay) -->
                            <div class="ba-before-overlay" id="baBeforeOverlay" style="width: 50%;">
                                <img src="${currentPair.beforeUrl}" alt="Before" class="ba-img ba-img-before" id="baBeforeImg">
                                <span class="ba-label ba-label-before"><i class="fa-regular fa-clock"></i> ก่อนเริ่มงาน (${currentPair.beforeDate || 'เดิม'})</span>
                            </div>

                            <!-- Draggable Split Handle -->
                            <div class="ba-handle" id="baSliderHandle" style="left: 50%;">
                                <div class="ba-handle-line"></div>
                                <div class="ba-handle-button">
                                    <i class="fa-solid fa-chevron-left"></i>
                                    <i class="fa-solid fa-chevron-right"></i>
                                </div>
                                <div class="ba-handle-line"></div>
                            </div>
                        </div>
                    ` : `
                        <!-- Side-by-Side View -->
                        <div class="ba-side-container">
                            <div class="ba-side-item">
                                <div class="ba-side-header before">
                                    <i class="fa-regular fa-clock"></i> สภาพพื้นที่ก่อนเริ่มงาน (${currentPair.beforeDate || 'เดิม'})
                                </div>
                                <img src="${currentPair.beforeUrl}" alt="Before" class="ba-side-img" onclick="window.viewPunchImage('${currentPair.beforeUrl}', 'ก่อนเริ่มงาน')">
                            </div>
                            <div class="ba-side-item">
                                <div class="ba-side-header after">
                                    <i class="fa-solid fa-circle-check"></i> ความก้าวหน้าปัจจุบัน/แล้วเสร็จ (${currentPair.afterDate || 'ปัจจุบัน'})
                                </div>
                                <img src="${currentPair.afterUrl}" alt="After" class="ba-side-img" onclick="window.viewPunchImage('${currentPair.afterUrl}', 'ปัจจุบัน/แล้วเสร็จ')">
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;

        // Initialize drag events if in split mode
        if (isSplitMode) {
            setTimeout(initSplitSliderEvents, 80);
        }
    };

    /**
     * สลับคู่ภาพเปรียบเทียบ
     */
    window.switchBeforeAfterPair = function (index) {
        activeSliderIndex = parseInt(index, 10);
        window.renderBeforeAfterTab();
    };

    /**
     * สลับโหมดมุมมอง (สไลเดอร์ vs เคียงข้าง)
     */
    window.setBeforeAfterViewMode = function (splitMode) {
        isSplitMode = splitMode;
        window.renderBeforeAfterTab();
    };

    /**
     * จัดการ Drag Interaction สำหรับ Split Slider
     */
    function initSplitSliderEvents() {
        const container = document.getElementById('baSplitContainer');
        const overlay = document.getElementById('baBeforeOverlay');
        const handle = document.getElementById('baSliderHandle');
        const beforeImg = document.getElementById('baBeforeImg');

        if (!container || !overlay || !handle || !beforeImg) return;

        let isDragging = false;

        const updateSliderPosition = (clientX) => {
            const rect = container.getBoundingClientRect();
            let offsetX = clientX - rect.left;
            if (offsetX < 0) offsetX = 0;
            if (offsetX > rect.width) offsetX = rect.width;

            const percentage = (offsetX / rect.width) * 100;
            overlay.style.width = percentage + '%';
            handle.style.left = percentage + '%';
            beforeImg.style.width = rect.width + 'px';
        };

        const onStart = (e) => {
            isDragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            updateSliderPosition(clientX);
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            updateSliderPosition(clientX);
        };

        const onEnd = () => {
            isDragging = false;
        };

        container.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        container.addEventListener('touchstart', onStart, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd);

        // Responsive resize
        const resizeObserver = new ResizeObserver(() => {
            if (container && beforeImg) {
                beforeImg.style.width = container.offsetWidth + 'px';
            }
        });
        resizeObserver.observe(container);
    }

    /**
     * เปิดหน้าต่างเพิ่มจุดเปรียบเทียบ Before & After ใหม่
     */
    window.openAddBeforeAfterModal = function () {
        const modal = document.getElementById('beforeAfterModal');
        if (!modal) return;

        document.getElementById('baAddForm')?.reset();
        document.getElementById('baBeforePreview').innerHTML = '';
        document.getElementById('baAfterPreview').innerHTML = '';
        modal.style.display = 'flex';
    };

    /**
     * ปิดหน้าต่างเพิ่มจุดเปรียบเทียบ
     */
    window.closeAddBeforeAfterModal = function () {
        const modal = document.getElementById('beforeAfterModal');
        if (modal) modal.style.display = 'none';
    };

    /**
     * บันทึกคู่ภาพ Before & After ใหม่
     */
    window.saveNewBeforeAfterPair = async function (event) {
        if (event) event.preventDefault();
        const p = window.currentProjectViewData;
        if (!p) return;

        const title = document.getElementById('baTitleInput')?.value.trim();
        const desc = document.getElementById('baDescInput')?.value.trim();
        const beforeDate = document.getElementById('baBeforeDateInput')?.value || '';
        const afterDate = document.getElementById('baAfterDateInput')?.value || '';

        const beforeFile = document.getElementById('baBeforeFileInput')?.files[0];
        const afterFile = document.getElementById('baAfterFileInput')?.files[0];

        if (!title) {
            alert('กรุณาระบุชื่อจุดเปรียบเทียบ เช่น "ลานหม้อแปลง T1"');
            return;
        }

        if (!beforeFile || !afterFile) {
            alert('กรุณาเลือกรูปภาพให้ครบทั้งภาพก่อนเริ่มงาน (Before) และภาพปัจจุบัน (After)');
            return;
        }

        const submitBtn = document.querySelector('#baAddForm button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังอัปโหลดภาพ...';
            submitBtn.disabled = true;
        }

        try {
            const beforeUrl = await window.processAndUploadPunchImage(beforeFile, p, title, 'สภาพเดิม Before');
            const afterUrl = await window.processAndUploadPunchImage(afterFile, p, title, 'ผลงาน After');

            if (!Array.isArray(p.beforeAfter)) p.beforeAfter = [];

            p.beforeAfter.push({
                id: Date.now(),
                title,
                desc,
                beforeUrl,
                beforeDate,
                afterUrl,
                afterDate: afterDate || new Date().toISOString().split('T')[0]
            });

            await window.saveProjects(p.id);

            activeSliderIndex = p.beforeAfter.length - 1;
            window.closeAddBeforeAfterModal();
            window.renderBeforeAfterTab(p);

            if (typeof Toastify === 'function') {
                Toastify({
                    text: `บันทึกภาพเปรียบเทียบก่อน-หลัง "${title}" สำเร็จ!`,
                    duration: 3500,
                    style: { background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px' }
                }).showToast();
            }
        } catch (err) {
            console.error('Error saving before-after pair:', err);
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = origText;
                submitBtn.disabled = false;
            }
        }
    };

    /**
     * ลบคู่ภาพเปรียบเทียบ
     */
    window.deleteBeforeAfterPair = async function (index) {
        const p = window.currentProjectViewData;
        if (!p || !p.beforeAfter || !p.beforeAfter[index]) return;

        const pair = p.beforeAfter[index];
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบจุดเปรียบเทียบ "${pair.title || ''}"?`)) return;

        p.beforeAfter.splice(index, 1);
        if (activeSliderIndex >= p.beforeAfter.length) {
            activeSliderIndex = Math.max(0, p.beforeAfter.length - 1);
        }

        // Synchronize immediately to window.projects
        if (Array.isArray(window.projects)) {
            const match = window.projects.find(proj => String(proj.id) === String(p.id));
            if (match) match.beforeAfter = p.beforeAfter;
        }

        try {
            const saved = await window.saveProjects(p.id);
            window.renderBeforeAfterTab(p);
            if (typeof Toastify === 'function') {
                if (saved === false) {
                    Toastify({
                        text: 'ลบจุดเปรียบเทียบในเครื่องแล้ว แต่การซิงค์ข้อมูลกับคลาวด์ขัดข้อง',
                        duration: 4000,
                        style: { background: 'linear-gradient(135deg, #d97706, #b45309)', borderRadius: '8px' }
                    }).showToast();
                } else {
                    Toastify({
                        text: '🗑️ ลบจุดเปรียบเทียบภาพเรียบร้อยแล้ว',
                        duration: 3000,
                        style: { background: 'linear-gradient(135deg, #ef4444, #b91c1c)', borderRadius: '8px' }
                    }).showToast();
                }
            }
        } catch (err) {
            console.error('Error deleting before-after pair:', err);
            window.renderBeforeAfterTab(p);
        }
    };

})();
