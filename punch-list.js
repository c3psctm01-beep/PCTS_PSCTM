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
                        <p class="punch-item-desc">${item.description || '-'}</p>

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
        document.getElementById('punchBeforePhotoPreview').innerHTML = '';
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
     * เปิดหน้าต่างอัปเดตงานแก้ไขเสร็จ (แนบภาพ After)
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
        document.getElementById('punchAfterPhotoPreview').innerHTML = '';
        document.getElementById('punchResolveNoteInput').value = '';

        modal.style.display = 'flex';
    };

    /**
     * ปิดหน้าต่างอัปเดตงานแก้ไข
     */
    window.closeResolvePunchModal = function () {
        const modal = document.getElementById('punchResolveModal');
        if (modal) modal.style.display = 'none';
    };

    /**
     * บันทึกการแก้ไขเสร็จ (ส่งภาพ After)
     */
    window.saveResolvePunchItem = async function (event) {
        if (event) event.preventDefault();
        const p = window.currentProjectViewData;
        const idx = window.currentResolvePunchIndex;
        if (!p || !p.punchList || p.punchList[idx] === undefined) return;

        const item = p.punchList[idx];
        const note = document.getElementById('punchResolveNoteInput')?.value.trim();
        const photoInput = document.getElementById('punchAfterPhotoInput');

        const submitBtn = document.querySelector('#punchResolveForm button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังอัปโหลด...';
            submitBtn.disabled = true;
        }

        try {
            if (photoInput && photoInput.files && photoInput.files.length > 0) {
                const file = photoInput.files[0];
                item.afterPhoto = await window.processAndUploadPunchImage(file, p, item.title, 'หลังแก้ไขเรียบร้อย');
            }

            item.status = 'resolved';
            item.resolvedDate = new Date().toISOString().split('T')[0];
            if (note) {
                item.description = (item.description ? item.description + '\n' : '') + `[บันทึกแก้ไข]: ${note}`;
            }

            await window.saveProjects(p.id);

            window.closeResolvePunchModal();
            window.renderPunchListTab(p);

            if (typeof Toastify === 'function') {
                Toastify({
                    text: `อัปเดตงานแก้ไข "${item.title}" เรียบร้อยแล้ว (สถานะ: รอตรวจซ้ำ)`,
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
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1000;
                    const MAX_HEIGHT = 1000;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // ประทับลายน้ำถ้ามีฟังก์ชัน
                    if (typeof window.applyGpsWatermark === 'function') {
                        try {
                            let coords = null;
                            if (typeof window.getCurrentGpsCoordinates === 'function') {
                                coords = await window.getCurrentGpsCoordinates(3000);
                            }
                            await window.applyGpsWatermark(canvas, {
                                projectName: project.name,
                                taskName: `[Punch List: ${phase}] ${title}`,
                                coords
                            });
                        } catch (_) { }
                    }

                    // อัปโหลดเข้า Storage หรือ Fallback dataURL
                    canvas.toBlob(async (blob) => {
                        const fallbackDataUrl = canvas.toDataURL('image/jpeg', 0.65);
                        if (!window.db || !window.db.storage) {
                            return resolve(fallbackDataUrl);
                        }

                        try {
                            const fileName = `punch_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
                            const folderDate = new Date().toISOString().split('T')[0];
                            const filePath = `punch/${folderDate}/${fileName}`;

                            const { data, error } = await window.db.storage.from('project-images').upload(filePath, blob, { contentType: 'image/jpeg' });
                            if (error) {
                                console.warn('[PunchList] Storage upload failed, falling back to compressed dataURL:', error.message);
                                return resolve(fallbackDataUrl);
                            }

                            const { data: { publicUrl } } = window.db.storage.from('project-images').getPublicUrl(filePath);
                            resolve(publicUrl || fallbackDataUrl);
                        } catch (uploadErr) {
                            console.warn('[PunchList] Storage upload exception, falling back to compressed dataURL:', uploadErr);
                            resolve(fallbackDataUrl);
                        }
                    }, 'image/jpeg', 0.65);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
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

})();
