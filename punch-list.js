/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: punch-list.js - Substation Punch List & Defect Management Engine
 * ==============================================================================
 */

(function () {
    'use strict';

    let currentFilterStatus = 'all';
    let currentFilterCategory = 'all';

    /**
     * เรนเดอร์แท็บรายการตรวจรับ/แก้ไข (Punch List) ของโครงการที่เลือก
     */
    window.renderPunchListTab = function (project) {
        const p = project || window.currentProjectViewData;
        if (!p) return;

        const punchList = Array.isArray(p.punchList) ? p.punchList : [];

        // คำนวณสรุปจำนวนตามสถานะ
        const totalCount = punchList.length;
        const pendingCount = punchList.filter(item => item.status === 'pending' || !item.status).length;
        const resolvedCount = punchList.filter(item => item.status === 'resolved').length;
        const closedCount = punchList.filter(item => item.status === 'closed').length;

        // อัปเดตการ์ด KPI ด้านบน
        const elTotal = document.getElementById('punchTotalKpi');
        const elPending = document.getElementById('punchPendingKpi');
        const elResolved = document.getElementById('punchResolvedKpi');
        const elClosed = document.getElementById('punchClosedKpi');

        if (elTotal) elTotal.innerText = totalCount;
        if (elPending) elPending.innerText = pendingCount;
        if (elResolved) elResolved.innerText = resolvedCount;
        if (elClosed) elClosed.innerText = closedCount;

        // กรองรายการตามสถานะและหมวดหมู่
        let filtered = punchList;
        if (currentFilterStatus !== 'all') {
            filtered = filtered.filter(item => (item.status || 'pending') === currentFilterStatus);
        }
        if (currentFilterCategory !== 'all') {
            filtered = filtered.filter(item => item.category === currentFilterCategory);
        }

        const container = document.getElementById('punchListItemsContainer');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-punch-card">
                    <i class="fa-solid fa-clipboard-check" style="font-size: 42px; color: #cbd5e1; margin-bottom: 12px;"></i>
                    <h4 style="font-size: 15px; color: var(--text-secondary); margin-bottom: 4px;">ไม่พบรายการข้อบกพร่อง/ตรวจรับ</h4>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">ไม่มีรายการค้างตรวจรับตามเงื่อนไขที่เลือก หรือยังไม่มีการบันทึกรายการ</p>
                </div>
            `;
            return;
        }

        const categoryLabels = {
            civil: { text: 'งานโยธา/โครงสร้าง', color: '#8e44ad', bg: '#fbf5fd' },
            electrical: { text: 'งานไฟฟ้า 115 kV', color: '#e67e22', bg: '#fef5e7' },
            control: { text: 'งานควบคุม/CSCS', color: '#2980b9', bg: '#eff6ff' },
            safety: { text: 'ความปลอดภัย/SHE', color: '#27ae60', bg: '#f0fdf4' }
        };

        const statusBadges = {
            pending: { text: 'รอดำเนินการแก้ไข', class: 'punch-badge-pending', icon: 'fa-clock' },
            resolved: { text: 'แก้ไขแล้ว (รอตรวจซ้ำ)', class: 'punch-badge-resolved', icon: 'fa-circle-check' },
            closed: { text: 'ตรวจรับเรียบร้อย', class: 'punch-badge-closed', icon: 'fa-square-check' }
        };

        container.innerHTML = filtered.map((item, idx) => {
            const cat = categoryLabels[item.category] || { text: item.category || 'ทั่วไป', color: '#64748b', bg: '#f1f5f9' };
            const stat = statusBadges[item.status || 'pending'] || statusBadges.pending;
            const originalIdx = punchList.indexOf(item);

            const resolveNoteText = item.resolveNote || (item.description && item.description.match(/\[บันทึกแก้ไข\]:\s*([\s\S]*)$/)?.[1]?.trim()) || '';
            const cleanDesc = (item.description || '-').replace(/\[บันทึกแก้ไข\]:[\s\S]*$/g, '').trim() || (item.description || '-');

            return `
                <div class="punch-item-card ${item.status || 'pending'}">
                    <div class="punch-card-header">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span class="punch-id-badge">#PL-${String(originalIdx + 1).padStart(3, '0')}</span>
                            <span class="punch-category-chip" style="color: ${cat.color}; background: ${cat.bg}; border-color: ${cat.color}30;">
                                ${cat.text}
                            </span>
                            ${item.priority === 'high' ? '<span class="punch-priority-high"><i class="fa-solid fa-fire"></i> สำคัญเร่งด่วน</span>' : ''}
                        </div>
                        <span class="punch-status-badge ${stat.class}">
                            <i class="fa-solid ${stat.icon}"></i> ${stat.text}
                        </span>
                    </div>

                    <div class="punch-card-body">
                        <h3 class="punch-item-title">${item.title}</h3>
                        <div class="punch-item-location"><i class="fa-solid fa-location-dot"></i> ตำแหน่ง: ${item.location || 'บริเวณสถานีไฟฟ้า'}</div>
                        <p class="punch-item-desc" style="white-space: pre-line; margin-bottom: 8px;">${cleanDesc}</p>

                        ${resolveNoteText ? `
                            <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10b981; border-radius: 6px; padding: 7px 10px; margin-bottom: 10px; font-size: 12.5px; color: #065f46;">
                                <strong style="display: flex; align-items: center; gap: 5px; margin-bottom: 2px; color: #047857;">
                                    <i class="fa-solid fa-clipboard-check"></i> บันทึกผลการแก้ไข (Resolution Note):
                                </strong>
                                <span style="white-space: pre-line;">${resolveNoteText}</span>
                            </div>
                        ` : ''}

                        <!-- Before & After Photos -->
                        <div class="punch-photos-wrap">
                            <div class="punch-photo-box">
                                <div class="punch-photo-label"><i class="fa-solid fa-camera"></i> ภาพก่อนแก้ไข (Before)</div>
                                ${item.beforePhoto ? `
                                    <img src="${item.beforePhoto}" alt="Before" class="punch-img-thumb" onclick="window.viewPunchImage('${item.beforePhoto}', 'ก่อนแก้ไข: ${item.title}')">
                                ` : `
                                    <div class="punch-no-photo"><i class="fa-regular fa-image"></i> ไม่มีรูปภาพ</div>
                                `}
                            </div>
                            <div class="punch-photo-box">
                                <div class="punch-photo-label" style="color: #10b981;"><i class="fa-solid fa-circle-check"></i> ภาพหลังแก้ไข (After)</div>
                                ${item.afterPhoto ? `
                                    <img src="${item.afterPhoto}" alt="After" class="punch-img-thumb" onclick="window.viewPunchImage('${item.afterPhoto}', 'หลังแก้ไข: ${item.title}')">
                                ` : `
                                    <div class="punch-no-photo" style="background: rgba(16, 185, 129, 0.05); color: #94a3b8;">
                                        <i class="fa-solid fa-clock-rotate-left"></i> ยังไม่ส่งมอบงานแก้ไข
                                    </div>
                                `}
                            </div>
                        </div>

                        <div class="punch-meta-row">
                            <span><i class="fa-solid fa-building"></i> <strong>ผู้รับผิดชอบ:</strong> ${item.contractor || p.contractor || '-'}</span>
                            <span><i class="fa-regular fa-calendar"></i> <strong>กำหนดเสร็จ:</strong> ${item.dueDate || '-'}</span>
                            ${item.resolvedDate ? `<span style="color: #10b981;"><i class="fa-solid fa-check"></i> แก้ไขเมื่อ: ${item.resolvedDate}</span>` : ''}
                        </div>
                    </div>

                    <div class="punch-card-actions">
                        ${item.status !== 'closed' ? `
                            <button type="button" class="btn btn-sm btn-secondary role-editor" onclick="window.openResolvePunchModal(${originalIdx})">
                                <i class="fa-solid fa-cloud-arrow-up"></i> ${item.status === 'resolved' ? 'อัปเดตรูปหลังทำซ้ำ' : 'อัปเดตงานแก้ไขเสร็จ'}
                            </button>
                        ` : ''}

                        ${(item.status === 'resolved' || item.status === 'pending') ? `
                            <button type="button" class="btn btn-sm role-admin" style="background: #10b981; color: white;" onclick="window.approvePunchItem(${originalIdx})">
                                <i class="fa-solid fa-check-double"></i> กรรมการตรวจรับผ่าน
                            </button>
                        ` : `
                            <button type="button" class="btn btn-sm btn-secondary role-admin" onclick="window.reopenPunchItem(${originalIdx})" title="เปิดตรวจซ้ำ">
                                <i class="fa-solid fa-rotate-left"></i> เปิดตรวจซ้ำ
                            </button>
                        `}

                        <button type="button" class="btn-icon-danger role-admin" onclick="window.deletePunchItem(${originalIdx})" title="ลบรายการ">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    };

    /**
     * เปลี่ยนตัวกรองสถานะ
     */
    window.setPunchFilterStatus = function (status) {
        currentFilterStatus = status;
        document.querySelectorAll('.btn-punch-filter').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-status') === status);
        });
        window.renderPunchListTab();
    };

    /**
     * เปลี่ยนตัวกรองหมวดหมู่
     */
    window.setPunchFilterCategory = function (category) {
        currentFilterCategory = category;
        window.renderPunchListTab();
    };

    /**
     * เปิดหน้าต่างเพิ่มรายการตรวจรับ/ข้อบกพร่องใหม่
     */
    window.openAddPunchModal = function () {
        const modal = document.getElementById('punchAddModal');
        if (!modal) return;

        const p = window.currentProjectViewData;
        const contractorInput = document.getElementById('punchContractorInput');
        if (contractorInput && p) contractorInput.value = p.contractor || '';

        const dueDateInput = document.getElementById('punchDueDateInput');
        if (dueDateInput) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            dueDateInput.value = nextWeek.toISOString().split('T')[0];
        }

        document.getElementById('punchAddForm')?.reset();
        if (typeof window.clearPunchPhotoInput === 'function') {
            window.clearPunchPhotoInput('punchBeforePhotoInput', 'punchBeforePhotoPreview');
        } else {
            const prev = document.getElementById('punchBeforePhotoPreview');
            if (prev) prev.innerHTML = '';
        }
        modal.style.display = 'flex';
    };

    /**
     * ปิดหน้าต่างเพิ่มรายการ
     */
    window.closeAddPunchModal = function () {
        const modal = document.getElementById('punchAddModal');
        if (modal) modal.style.display = 'none';
    };

    /**
     * บันทึกรายการ Punch List ใหม่
     */
    window.saveNewPunchItem = async function (event) {
        if (event) event.preventDefault();
        const p = window.currentProjectViewData;
        if (!p) return;

        const title = document.getElementById('punchTitleInput')?.value.trim();
        const location = document.getElementById('punchLocationInput')?.value.trim();
        const category = document.getElementById('punchCategorySelect')?.value || 'civil';
        const priority = document.getElementById('punchPrioritySelect')?.value || 'normal';
        const description = document.getElementById('punchDescInput')?.value.trim();
        const contractor = document.getElementById('punchContractorInput')?.value.trim();
        const dueDate = document.getElementById('punchDueDateInput')?.value;

        if (!title) {
            alert('กรุณาระบุหัวข้อข้อบกพร่อง/สิ่งที่ต้องแก้ไข');
            return;
        }

        // อ่านภาพถ่ายก่อนแก้ไข (Before Photo)
        const photoInput = document.getElementById('punchBeforePhotoInput');
        let beforePhotoUrl = '';

        const submitBtn = document.querySelector('#punchAddForm button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...';
            submitBtn.disabled = true;
        }

        try {
            if (photoInput && photoInput.files && photoInput.files.length > 0) {
                const file = photoInput.files[0];
                beforePhotoUrl = await window.processAndUploadPunchImage(file, p, title, 'ก่อนแก้ไข');
            }

            if (!Array.isArray(p.punchList)) p.punchList = [];

            p.punchList.push({
                id: Date.now(),
                title,
                location: location || 'ลานสถานีไฟฟ้า',
                category,
                priority,
                description,
                contractor: contractor || p.contractor || '',
                dueDate,
                status: 'pending',
                createdDate: new Date().toISOString().split('T')[0],
                beforePhoto: beforePhotoUrl,
                afterPhoto: '',
                resolvedDate: null
            });

            await window.saveProjects(p.id);

            window.closeAddPunchModal();
            window.renderPunchListTab(p);

            if (typeof Toastify === 'function') {
                Toastify({
                    text: `บันทึกรายการตรวจรับข้อบกพร่อง "${title}" เรียบร้อยแล้ว`,
                    duration: 3500,
                    style: { background: 'linear-gradient(135deg, #742C81, #5B2166)', borderRadius: '8px' }
                }).showToast();
            }
        } catch (err) {
            console.error('Error saving punch item:', err);
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = origText;
                submitBtn.disabled = false;
            }
        }
    };

    /**
     * เปิดหน้าต่างอัปเดตงานแก้ไขเสร็จ (แนบภาพ After และกรอกบันทึกการแก้ไข)
     */
    window.openResolvePunchModal = function (index) {
        const p = window.currentProjectViewData;
        if (!p || !p.punchList || !p.punchList[index]) return;

        window.currentResolvePunchIndex = index;
        const item = p.punchList[index];

        const modal = document.getElementById('punchResolveModal');
        if (!modal) return;

        document.getElementById('punchResolveTitle').innerText = item.title;
        document.getElementById('punchResolveLocation').innerText = item.location || '-';

        // 1. จัดการช่องพิมพ์บันทึกการดำเนินการแก้ไข (ดึงบันทึกเดิมขึ้นมาให้พิมพ์แก้ไขต่อได้)
        const noteInput = document.getElementById('punchResolveNoteInput');
        if (noteInput) {
            const existingNote = item.resolveNote || (item.description && item.description.match(/\[บันทึกแก้ไข\]:\s*([\s\S]*)$/)?.[1]?.trim()) || '';
            noteInput.value = existingNote;
            noteInput.readOnly = false;
            noteInput.disabled = false;
        }

        // 2. ล้าง file input และ preview ของรูปใหม่ที่ยังไม่ได้เลือก
        if (typeof window.clearPunchPhotoInput === 'function') {
            window.clearPunchPhotoInput('punchAfterPhotoInput', 'punchAfterPhotoPreview');
        } else {
            const fileInp = document.getElementById('punchAfterPhotoInput');
            if (fileInp) fileInp.value = '';
            const prev = document.getElementById('punchAfterPhotoPreview');
            if (prev) prev.innerHTML = '';
        }

        // 3. แสดงรูปภาพ Before (ถ้ามี)
        const beforeContainer = document.getElementById('punchResolveBeforePhotoContainer');
        const beforeBox = document.getElementById('punchResolveBeforePhotoBox');
        if (beforeContainer && beforeBox) {
            if (item.beforePhoto) {
                beforeBox.innerHTML = `
                    <div style="text-align: center;">
                        <img src="${item.beforePhoto}" alt="Before" style="max-height: 140px; max-width: 100%; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.12); cursor: pointer; object-fit: contain; border: 1px solid #cbd5e1;" onclick="window.viewPunchImage('${item.beforePhoto}', 'ก่อนแก้ไข: ${item.title}')">
                        <div style="font-size: 11px; color: #64748b; margin-top: 4px;"><i class="fa-solid fa-magnifying-glass-plus"></i> คลิกเพื่อดูรูปก่อนแก้ไขขนาดเต็ม</div>
                    </div>
                `;
                beforeContainer.style.display = 'block';
            } else {
                beforeContainer.style.display = 'none';
                beforeBox.innerHTML = '';
            }
        }

        // 4. แสดงภาพหลังแก้ไขเดิม (ถ้าเคยส่งมอบงานไปแล้ว) เพื่อไม่ให้ผู้ใช้ต้องอัปโหลดซ้ำหากต้องการแก้เฉพาะข้อความ
        const currentAfterContainer = document.getElementById('punchResolveCurrentAfterContainer');
        const currentAfterBox = document.getElementById('punchResolveCurrentAfterBox');
        if (currentAfterContainer && currentAfterBox) {
            if (item.afterPhoto) {
                currentAfterBox.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px;">
                        <img src="${item.afterPhoto}" alt="Current After" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px; border: 1px solid #10b981; cursor: pointer; flex-shrink: 0;" onclick="window.viewPunchImage('${item.afterPhoto}', 'หลังแก้ไขปัจจุบัน: ${item.title}')" title="คลิกเพื่อดูรูปขยาย">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 13px; font-weight: 600; color: #065f46;"><i class="fa-solid fa-circle-check"></i> มีภาพหลังแก้ไขที่บันทึกไว้เดิมแล้ว</div>
                            <div style="font-size: 11px; color: #047857; margin-top: 3px;">หากไม่ต้องการเปลี่ยนภาพ สามารถใช้ภาพเดิมและพิมพ์บันทึกได้ทันที หรือเลือกไฟล์ใหม่ด้านล่างเพื่อแทนที่ภาพเดิม</div>
                        </div>
                    </div>
                `;
                currentAfterContainer.style.display = 'block';
            } else {
                currentAfterContainer.style.display = 'none';
                currentAfterBox.innerHTML = '';
            }
        }

        modal.style.display = 'flex';

        // โฟกัสไปที่ช่องพิมพ์ข้อความทันที
        setTimeout(() => {
            if (noteInput) noteInput.focus();
        }, 150);
    };

    /**
     * ปิดหน้าต่างอัปเดตงานแก้ไข
     */
    window.closeResolvePunchModal = function () {
        const modal = document.getElementById('punchResolveModal');
        if (modal) modal.style.display = 'none';
    };

    /**
     * บันทึกการแก้ไขเสร็จ (ส่งภาพ After และบันทึกผลการแก้ไข)
     */
    window.saveResolvePunchItem = async function (event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const p = window.currentProjectViewData;
        const idx = window.currentResolvePunchIndex;
        if (!p || !p.punchList || p.punchList[idx] === undefined) {
            alert('ไม่พบข้อมูลรายการข้อบกพร่องที่ต้องการบันทึก');
            return false;
        }

        const item = p.punchList[idx];
        const note = document.getElementById('punchResolveNoteInput')?.value.trim() || '';
        const photoInput = document.getElementById('punchAfterPhotoInput');

        const hasNewPhoto = Boolean(photoInput && photoInput.files && photoInput.files.length > 0);
        const hasExistingPhoto = Boolean(item.afterPhoto);

        // ตรวจสอบว่ามีภาพถ่ายหลังแก้ไขอย่างน้อย 1 ภาพ (ภาพเดิมหรือเลือกใหม่)
        if (!hasNewPhoto && !hasExistingPhoto) {
            alert('กรุณาเลือกไฟล์แนบภาพถ่ายหลังแก้ไข (After Photo) เพื่อส่งมอบงาน');
            photoInput?.focus();
            return false;
        }

        const submitBtn = document.querySelector('#punchResolveForm button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังประมวลผลและบันทึก...';
            submitBtn.disabled = true;
        }

        try {
            if (hasNewPhoto) {
                const file = photoInput.files[0];
                const uploadedUrl = await window.processAndUploadPunchImage(file, p, item.title, 'หลังแก้ไขเรียบร้อย');
                if (uploadedUrl) {
                    item.afterPhoto = uploadedUrl;
                }
            }

            item.status = 'resolved';
            item.resolvedDate = new Date().toISOString().split('T')[0];
            item.resolveNote = note;

            if (note) {
                let baseDesc = (item.description || '').replace(/\[บันทึกแก้ไข\]:[\s\S]*$/g, '').trim();
                item.description = baseDesc ? `${baseDesc}\n[บันทึกแก้ไข]: ${note}` : `[บันทึกแก้ไข]: ${note}`;
            }

            if (typeof window.saveProjects === 'function') {
                await window.saveProjects(p.id);
            }

            window.closeResolvePunchModal();
            window.renderPunchListTab(p);

            if (typeof Toastify === 'function') {
                Toastify({
                    text: `บันทึกงานแก้ไข "${item.title}" เรียบร้อยแล้ว (สถานะ: แก้ไขแล้ว รอตรวจซ้ำ)`,
                    duration: 3500,
                    style: { background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px' }
                }).showToast();
            }
        } catch (err) {
            console.error('Error resolving punch item:', err);
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
        } finally {
            if (submitBtn) {
                submitBtn.innerHTML = origText;
                submitBtn.disabled = false;
            }
        }
        return false;
    };

    /**
     * คณะกรรมการตรวจรับพัสดุอนุมัติผ่าน (Close Punch Item)
     */
    window.approvePunchItem = async function (index) {
        const p = window.currentProjectViewData;
        if (!p || !p.punchList || !p.punchList[index]) return;

        const item = p.punchList[index];
        if (!confirm(`ยืนยันการตรวจรับผ่านสำหรับรายการ:\n"${item.title}"?`)) return;

        item.status = 'closed';
        item.closedDate = new Date().toISOString().split('T')[0];

        try {
            await window.saveProjects(p.id);
            window.renderPunchListTab(p);

            if (typeof Toastify === 'function') {
                Toastify({
                    text: `✅ กรรมการตรวจรับอนุมัติปิดรายการข้อบกพร่อง "${item.title}" เรียบร้อยแล้ว`,
                    duration: 3500,
                    style: { background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '8px' }
                }).showToast();
            }
        } catch (err) {
            console.error('Error approving punch item:', err);
            alert('เกิดข้อผิดพลาด: ' + err.message);
        }
    };

    /**
     * เปิดรายการตรวจซ้ำ (Reopen)
     */
    window.reopenPunchItem = async function (index) {
        const p = window.currentProjectViewData;
        if (!p || !p.punchList || !p.punchList[index]) return;

        const item = p.punchList[index];
        item.status = 'pending';

        try {
            await window.saveProjects(p.id);
            window.renderPunchListTab(p);
        } catch (err) {
            console.error('Error reopening punch item:', err);
        }
    };

    /**
     * ลบรายการข้อบกพร่อง
     */
    window.deletePunchItem = async function (index) {
        const p = window.currentProjectViewData;
        if (!p || !p.punchList || !p.punchList[index]) return;

        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการข้อบกพร่องนี้?`)) return;

        p.punchList.splice(index, 1);

        try {
            await window.saveProjects(p.id);
            window.renderPunchListTab(p);
        } catch (err) {
            console.error('Error deleting punch item:', err);
        }
    };

    /**
     * อรรถประโยชน์ประมวลผล บีบอัด และประทับลายน้ำภาพ Punch List พร้อมอัปโหลด
     */
    window.processAndUploadPunchImage = function (file, project, title, phase) {
        return new Promise((resolve) => {
            if (!file) return resolve('');

            const reader = new FileReader();
            reader.onerror = (err) => {
                console.error('[PunchList] FileReader error:', err);
                resolve('');
            };

            reader.onload = (e) => {
                const img = new Image();
                img.onerror = (err) => {
                    console.error('[PunchList] Image decode error:', err);
                    resolve(e.target?.result || '');
                };

                img.onload = async () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 900;
                        const MAX_HEIGHT = 900;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) { height = Math.round(height * (MAX_WIDTH / width)); width = MAX_WIDTH; }
                        } else {
                            if (height > MAX_HEIGHT) { width = Math.round(width * (MAX_HEIGHT / height)); height = MAX_HEIGHT; }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        // ประทับลายน้ำ GPS อัตโนมัติถ้ามีฟังก์ชัน
                        if (typeof window.applyGpsWatermark === 'function') {
                            try {
                                let coords = null;
                                if (typeof window.getCurrentGpsCoordinates === 'function') {
                                    coords = await window.getCurrentGpsCoordinates(3000);
                                }
                                const userInfo = (typeof window.getCurrentUserInfo === 'function') ? window.getCurrentUserInfo() : {};
                                await window.applyGpsWatermark(canvas, {
                                    projectName: project ? project.name : '',
                                    taskName: `[Punch List: ${phase}] ${title}`,
                                    empId: userInfo.employee_id,
                                    uploaderName: userInfo.name,
                                    uploaderPosition: userInfo.position,
                                    coords
                                });
                            } catch (watermarkErr) {
                                console.warn('[PunchList] Watermark apply skipped or error:', watermarkErr);
                            }
                        }

                        // อัปโหลดเข้า Storage หรือ Fallback dataURL (ขนาดกะทัดรัด ~35-45 KB ปลอดภัยต่อ payload & localStorage)
                        const fallbackDataUrl = canvas.toDataURL('image/jpeg', 0.68);
                        if (!window.db || !window.db.storage) {
                            return resolve(fallbackDataUrl);
                        }

                        try {
                            canvas.toBlob(async (blob) => {
                                if (!blob) return resolve(fallbackDataUrl);
                                try {
                                    const fileName = `punch_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
                                    const folderDate = new Date().toISOString().split('T')[0];
                                    const filePath = `punch/${folderDate}/${fileName}`;

                                    const { data, error } = await window.db.storage.from('project-images').upload(filePath, blob, { contentType: 'image/jpeg' });
                                    if (error) {
                                        console.warn('[PunchList] Storage upload failed, falling back to dataURL:', error.message);
                                        return resolve(fallbackDataUrl);
                                    }

                                    const { data: { publicUrl } } = window.db.storage.from('project-images').getPublicUrl(filePath);
                                    resolve(publicUrl || fallbackDataUrl);
                                } catch (uploadErr) {
                                    console.warn('[PunchList] Storage upload exception, falling back to dataURL:', uploadErr);
                                    resolve(fallbackDataUrl);
                                }
                            }, 'image/jpeg', 0.70);
                        } catch (blobErr) {
                            console.warn('[PunchList] toBlob error, falling back to dataURL:', blobErr);
                            resolve(fallbackDataUrl);
                        }
                    } catch (procErr) {
                        console.error('[PunchList] Image processing error:', procErr);
                        resolve(e.target?.result || '');
                    }
                };

                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        });
    };

    /**
     * ตั้งค่าพรีวิวรูปภาพก่อนบันทึก พร้อมปุ่มลบรูป
     */
    window.setupPunchPhotoPreview = function (inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (!input || !preview) return;

        // ป้องกันผูก event ซ้ำ
        if (input.dataset.previewBound === 'true') return;
        input.dataset.previewBound = 'true';

        input.addEventListener('change', function () {
            if (!this.files || this.files.length === 0) {
                preview.innerHTML = '';
                return;
            }
            const file = this.files[0];
            const fileSizeKb = Math.round(file.size / 1024);
            const reader = new FileReader();

            reader.onload = function (e) {
                preview.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 10px;">
                        <img src="${e.target.result}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0; cursor: pointer; flex-shrink: 0;" onclick="window.viewPunchImage('${e.target.result}', 'ภาพพรีวิว')" title="คลิกเพื่อดูรูปขยาย">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 13px; font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name}</div>
                            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
                                ขนาด: ${fileSizeKb > 1024 ? (fileSizeKb / 1024).toFixed(1) + ' MB' : fileSizeKb + ' KB'}
                                <span style="color: #10b981; margin-left: 6px; font-weight: 500;"><i class="fa-solid fa-camera"></i> พร้อมประทับพิกัด GPS อัตโนมัติ</span>
                            </div>
                        </div>
                        <button type="button" class="btn btn-sm btn-secondary" onclick="window.clearPunchPhotoInput('${inputId}', '${previewId}')" style="color: #ef4444; border-color: #fecaca; background: #fff5f5; flex-shrink: 0;" title="ยกเลิกรูปนี้">
                            <i class="fa-solid fa-trash-can"></i> ลบรูป
                        </button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        });
    };

    /**
     * ล้างข้อมูลไฟล์ภาพและกล่องพรีวิว
     */
    window.clearPunchPhotoInput = function (inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (input) input.value = '';
        if (preview) preview.innerHTML = '';
    };

    /**
     * ดูรูปภาพขนาดขยาย
     */
    window.viewPunchImage = function (url, title) {
        if (!url) return;
        const modal = document.getElementById('imageViewerModal');
        const img = document.getElementById('imageViewerSrc');
        if (modal && img) {
            img.src = url;
            img.title = title || 'ภาพข้อบกพร่อง/ตรวจรับ';
            modal.style.display = 'flex';
        }
    };

    // ผูก Event Listener เมื่อ DOM โหลดเสร็จ
    function initPunchEventListeners() {
        window.setupPunchPhotoPreview('punchBeforePhotoInput', 'punchBeforePhotoPreview');
        window.setupPunchPhotoPreview('punchAfterPhotoInput', 'punchAfterPhotoPreview');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPunchEventListeners);
    } else {
        initPunchEventListeners();
    }

})();
