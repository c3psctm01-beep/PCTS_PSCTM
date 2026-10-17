/**
 * PCTS - Construction Project Calendar Manager
 * FullCalendar v5 Integration with Thai Localization, Category Filtering,
 * WBS Tasks, Site Photos, Contract EOT, and Defect Due Dates.
 * Version: 4.0
 */

(function () {
    // Calendar filter states (all enabled by default)
    window.calFilters = {
        task: true,
        gallery: true,
        contract: true,
        punch: true
    };

    /**
     * Helper: format Thai date string
     */
    function formatThaiDate(dateStr) {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            const day = d.getDate();
            const month = months[d.getMonth()];
            const year = d.getFullYear() + 543;
            return `${day} ${month} ${year}`;
        } catch (_) {
            return dateStr;
        }
    }

    /**
     * Calculate days difference between two YYYY-MM-DD dates
     */
    function getDaysDiff(d1Str, d2Str) {
        if (!d1Str || !d2Str) return null;
        try {
            const d1 = new Date(d1Str);
            const d2 = new Date(d2Str);
            const diffTime = d2.getTime() - d1.getTime();
            return Math.round(diffTime / (1000 * 3600 * 24)) + 1;
        } catch (_) {
            return null;
        }
    }

    /**
     * Build dynamic events list from project data
     */
    function buildProjectCalendarEvents(proj) {
        const events = [];
        let countTask = 0;
        let countGallery = 0;
        let countContract = 0;
        let countPunch = 0;

        if (!proj) return { events, counts: { task: 0, gallery: 0, contract: 0, punch: 0 } };

        // 1. WBS Tasks
        if (Array.isArray(proj.tasks)) {
            proj.tasks.forEach(t => {
                if (t.startDate && t.endDate) {
                    countTask++;
                    if (window.calFilters.task) {
                        const ed = new Date(t.endDate);
                        ed.setDate(ed.getDate() + 1); // FullCalendar allDay end is exclusive
                        const edStr = ed.toISOString().split('T')[0];

                        const isDone = (parseFloat(t.actual) || 0) >= 100;
                        const isStarted = (parseFloat(t.actual) || 0) > 0;

                        let color = '#d97706'; // default amber
                        if (isDone) color = '#10b981'; // green for completed
                        else if (isStarted) color = '#3b82f6'; // blue for in progress

                        events.push({
                            id: 'task_' + (t.id || t.name),
                            title: `🏗️ ${t.name}`,
                            start: t.startDate,
                            end: edStr,
                            allDay: true,
                            backgroundColor: color,
                            borderColor: color,
                            textColor: '#ffffff',
                            classNames: ['cal-event-task', isDone ? 'cal-task-done' : 'cal-task-active'],
                            extendedProps: {
                                category: 'task',
                                categoryLabel: 'แผนงานก่อสร้าง (WBS)',
                                icon: 'fa-solid fa-list-check',
                                taskName: t.name,
                                startDate: t.startDate,
                                endDate: t.endDate,
                                weight: t.weight || 0,
                                actual: t.actual || 0,
                                duration: getDaysDiff(t.startDate, t.endDate),
                                isDone: isDone
                            }
                        });
                    }
                }
            });
        }

        // 2. Daily Gallery / Site Updates
        if (Array.isArray(proj.gallery)) {
            const groupedGallery = {};
            proj.gallery.forEach(g => {
                if (!g.date) return;
                if (!groupedGallery[g.date]) {
                    groupedGallery[g.date] = {
                        date: g.date,
                        descriptions: [],
                        imageUrls: []
                    };
                }
                if (g.desc && !groupedGallery[g.date].descriptions.includes(g.desc)) {
                    groupedGallery[g.date].descriptions.push(g.desc);
                }
                if (g.url) {
                    groupedGallery[g.date].imageUrls.push(g.url);
                }
            });

            Object.values(groupedGallery).forEach(item => {
                countGallery++;
                if (window.calFilters.gallery) {
                    events.push({
                        id: 'gallery_' + item.date,
                        title: `📸 ภาพหน้างาน (${item.imageUrls.length} รูป)`,
                        start: item.date,
                        allDay: true,
                        backgroundColor: '#742C81', // PEA Purple
                        borderColor: '#742C81',
                        textColor: '#ffffff',
                        classNames: ['cal-event-gallery'],
                        extendedProps: {
                            category: 'gallery',
                            categoryLabel: 'ภาพอัปเดตหน้างานประจำวัน',
                            icon: 'fa-solid fa-camera',
                            date: item.date,
                            description: item.descriptions.join('<br>') || 'ภาพบันทึกความก้าวหน้าหน้างาน',
                            imageUrls: item.imageUrls
                        }
                    });
                }
            });
        }

        // 3. Contract Start / End & EOT Milestones
        if (proj.startDate) {
            countContract++;
            if (window.calFilters.contract) {
                events.push({
                    id: 'contract_start',
                    title: `🚀 เริ่มสัญญาตามแบบ (${proj.startDate})`,
                    start: proj.startDate,
                    allDay: true,
                    backgroundColor: '#2563eb',
                    borderColor: '#1d4ed8',
                    textColor: '#ffffff',
                    classNames: ['cal-event-milestone', 'cal-contract-start'],
                    extendedProps: {
                        category: 'contract',
                        categoryLabel: 'วันเริ่มต้นสัญญา',
                        icon: 'fa-solid fa-plane-departure',
                        title: 'วันเริ่มต้นโครงการ / สัญญา',
                        date: proj.startDate,
                        description: `วันเริ่มปฏิบัติงานตามสัญญาโครงการ: ${proj.name || ''}`
                    }
                });
            }
        }

        if (proj.endDate) {
            countContract++;
            if (window.calFilters.contract) {
                // Check if project has EOT extended date
                let finalEndDate = proj.endDate;
                let hasEot = false;
                let eotTotalDays = 0;

                if (Array.isArray(proj.eot) && proj.eot.length > 0) {
                    hasEot = true;
                    eotTotalDays = proj.eot.reduce((sum, item) => sum + (parseInt(item.days, 10) || 0), 0);
                    if (window.getAdjustedContractEndDate) {
                        finalEndDate = window.getAdjustedContractEndDate(proj);
                    }
                }

                // Original end date
                events.push({
                    id: 'contract_orig_end',
                    title: hasEot ? `🚩 สิ้นสุดสัญญาเดิม (${proj.endDate})` : `🏁 สิ้นสุดสัญญา (${proj.endDate})`,
                    start: proj.endDate,
                    allDay: true,
                    backgroundColor: hasEot ? '#94a3b8' : '#e11d48',
                    borderColor: hasEot ? '#64748b' : '#be123c',
                    textColor: '#ffffff',
                    classNames: ['cal-event-milestone', 'cal-contract-end'],
                    extendedProps: {
                        category: 'contract',
                        categoryLabel: hasEot ? 'วันสิ้นสุดสัญญาเดิม (ก่อน EOT)' : 'วันสิ้นสุดสัญญาตามแบบ',
                        icon: 'fa-solid fa-flag-checkered',
                        title: hasEot ? 'วันสิ้นสุดสัญญาเดิม' : 'วันสิ้นสุดสัญญาโครงการ',
                        date: proj.endDate,
                        description: hasEot
                            ? `สัญญาเดิมสิ้นสุดวันที่ ${formatThaiDate(proj.endDate)} (มีการอนุมัติขยายระยะเวลา EOT รวม +${eotTotalDays} วัน)`
                            : `วันครบกำหนดส่งมอบงานตามสัญญาโครงการ: ${proj.name || ''}`
                    }
                });

                // If EOT extended date exists and differs
                if (hasEot && finalEndDate && finalEndDate !== proj.endDate) {
                    events.push({
                        id: 'contract_eot_end',
                        title: `✨ สิ้นสุดสัญญาใหม่ (EOT +${eotTotalDays} วัน)`,
                        start: finalEndDate,
                        allDay: true,
                        backgroundColor: '#7c3aed',
                        borderColor: '#6d28d9',
                        textColor: '#ffffff',
                        classNames: ['cal-event-milestone', 'cal-contract-eot'],
                        extendedProps: {
                            category: 'contract',
                            categoryLabel: 'วันสิ้นสุดสัญญาใหม่หลังขยายเวลา (EOT)',
                            icon: 'fa-solid fa-hourglass-half',
                            title: 'วันสิ้นสุดสัญญาใหม่ (หลังอนุมัติ EOT)',
                            date: finalEndDate,
                            description: `ขยายระยะเวลาก่อสร้างตามมติ กฟภ. รวม +${eotTotalDays} วัน สิ้นสุดใหม่วันที่ ${formatThaiDate(finalEndDate)}`
                        }
                    });
                }
            }
        }

        // 4. Punch List / Defect Due Dates
        if (Array.isArray(proj.punchList)) {
            proj.punchList.forEach((item, idx) => {
                const targetDate = item.dueDate || item.date;
                if (!targetDate) return;
                countPunch++;
                if (window.calFilters.punch) {
                    const isClosed = item.status === 'closed';
                    const isResolved = item.status === 'resolved';

                    let color = '#ef4444'; // red: pending
                    let statusLabel = 'รอแก้ไข';
                    if (isClosed) {
                        color = '#10b981';
                        statusLabel = 'ปิดงานแล้ว';
                    } else if (isResolved) {
                        color = '#f59e0b';
                        statusLabel = 'รอตรวจรับ';
                    }

                    events.push({
                        id: 'punch_' + (item.id || idx),
                        title: `📋 [${item.category || 'ข้อบกพร่อง'}] ${item.title || 'รายการตรวจ'} (${statusLabel})`,
                        start: targetDate,
                        allDay: true,
                        backgroundColor: color,
                        borderColor: color,
                        textColor: '#ffffff',
                        classNames: ['cal-event-punch'],
                        extendedProps: {
                            category: 'punch',
                            categoryLabel: `Punch List (${statusLabel})`,
                            icon: 'fa-solid fa-clipboard-check',
                            item: item,
                            date: targetDate
                        }
                    });
                }
            });
        }

        return {
            events,
            counts: {
                task: countTask,
                gallery: countGallery,
                contract: countContract,
                punch: countPunch
            }
        };
    }

    /**
     * Update filter counters in UI
     */
    function updateFilterCounters(counts) {
        const elTask = document.getElementById('calCountTask');
        const elGallery = document.getElementById('calCountGallery');
        const elContract = document.getElementById('calCountContract');
        const elPunch = document.getElementById('calCountPunch');

        if (elTask) elTask.innerText = counts.task || 0;
        if (elGallery) elGallery.innerText = counts.gallery || 0;
        if (elContract) elContract.innerText = counts.contract || 0;
        if (elPunch) elPunch.innerText = counts.punch || 0;
    }

    /**
     * Initialize or re-create projectCalendar instance
     */
    window.initProjectCalendar = function () {
        const pcEl = document.getElementById('projectCalendar');
        if (!pcEl) return;

        // Destroy previous instance if exists
        if (window.peaCalendar && typeof window.peaCalendar.destroy === 'function') {
            try {
                window.peaCalendar.destroy();
            } catch (_) {}
        }

        const proj = window.currentProjectViewData || (window.projects && window.projects[0]);
        let initDate = undefined;
        if (proj && proj.startDate) {
            initDate = proj.startDate;
        }

        const cal = new FullCalendar.Calendar(pcEl, {
            initialView: 'dayGridMonth',
            initialDate: initDate,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,listMonth'
            },
            buttonText: {
                today: 'วันนี้',
                month: 'รายเดือน',
                week: 'รายสัปดาห์',
                list: '📋 รายการ (Agenda)'
            },
            allDayText: 'ตลอดวัน',
            dayHeaderContent: function (arg) {
                const thDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
                return thDays[arg.date.getDay()];
            },
            titleFormat: function (dateInfo) {
                const thMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
                const d = dateInfo.date;
                const yearBE = d.year + 543;
                return `${thMonths[d.month]} ${yearBE}`;
            },
            views: {
                dayGridMonth: {
                    dayMaxEventRows: 4
                },
                listMonth: {
                    buttonText: '📋 รายการ (Agenda)',
                    noEventsContent: 'ไม่มีกิจกรรมหรือแผนงานในเดือนนี้'
                }
            },
            navLinks: true,
            editable: false,
            dayMaxEvents: true,
            eventDisplay: 'block',
            events: function (fetchInfo, successCallback, failureCallback) {
                const currentProj = window.currentProjectViewData || (window.projects && window.projects[0]);
                const { events, counts } = buildProjectCalendarEvents(currentProj);
                updateFilterCounters(counts);
                successCallback(events);
            },
            eventClick: function (info) {
                window.showCalendarEventModal(info.event);
            }
        });

        cal.render();
        window.peaCalendar = cal;
        window.projectCalendar = cal;
    };

    /**
     * Refresh project calendar when project detail view changes
     */
    window.refreshProjectCalendar = function (proj) {
        if (proj) {
            window.currentProjectViewData = proj;
        }
        const activeProj = window.currentProjectViewData;
        const cal = window.peaCalendar;
        if (cal && typeof cal.refetchEvents === 'function') {
            cal.refetchEvents();
            if (activeProj?.startDate) {
                cal.gotoDate(activeProj.startDate);
            }
            setTimeout(() => {
                if (typeof cal.updateSize === 'function') {
                    cal.updateSize();
                }
            }, 60);
        } else if (typeof window.initProjectCalendar === 'function') {
            window.initProjectCalendar();
        }
    };

    /**
     * Show enriched Modal on event click
     */
    window.showCalendarEventModal = function (event) {
        const modal = document.getElementById('calendarModal');
        const modalTitle = document.getElementById('modalDate');
        const modalContent = document.getElementById('modalContent');
        if (!modal || !modalContent) return;

        const props = event.extendedProps || {};
        const cat = props.category;

        // 1. Task (WBS)
        if (cat === 'task') {
            modalTitle.innerHTML = `<i class="fa-solid fa-list-check" style="color: #d97706;"></i> ข้อมูลแผนงาน (WBS)`;
            const actual = parseFloat(props.actual) || 0;
            const progressColor = actual >= 100 ? '#10b981' : (actual > 0 ? '#3b82f6' : '#94a3b8');

            modalContent.innerHTML = `
                <div class="cal-modal-header" style="margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <span class="cal-modal-badge" style="background: rgba(217, 119, 6, 0.15); color: #d97706; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                            ${props.categoryLabel}
                        </span>
                        <span style="font-size: 12px; color: var(--text-secondary);">
                            <i class="fa-regular fa-clock"></i> ระยะเวลา ${props.duration || '-'} วัน
                        </span>
                    </div>
                    <h3 style="margin: 10px 0 6px 0; font-size: 1.2rem; color: var(--text-primary);">${props.taskName}</h3>
                </div>

                <div style="background: var(--bg-hover, #f8fafc); border-radius: 10px; padding: 14px; margin-bottom: 16px; border: 1px solid var(--border-color);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
                        <div>
                            <span class="text-muted"><i class="fa-regular fa-calendar-check" style="color: #2563eb;"></i> วันที่เริ่มต้น:</span><br>
                            <strong>${formatThaiDate(props.startDate)}</strong>
                        </div>
                        <div>
                            <span class="text-muted"><i class="fa-solid fa-flag" style="color: #ef4444;"></i> วันที่สิ้นสุด:</span><br>
                            <strong>${formatThaiDate(props.endDate)}</strong>
                        </div>
                    </div>

                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 13px;">
                            <span><strong>ความก้าวหน้าจริง:</strong></span>
                            <strong style="color: ${progressColor}; font-size: 15px;">${actual}%</strong>
                        </div>
                        <div style="background: #e2e8f0; height: 10px; border-radius: 5px; overflow: hidden;">
                            <div style="background: ${progressColor}; width: ${Math.min(actual, 100)}%; height: 100%; transition: width 0.4s ease;"></div>
                        </div>
                        <div style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; text-align: right;">
                            น้ำหนักงาน: ${props.weight || 0}%
                        </div>
                    </div>
                </div>

                <div style="text-align: right;">
                    <button type="button" class="btn btn-primary" onclick="window.closeCalendarModal(); openProjectTab(null, 'tabWBS');" style="font-size: 13px;">
                        <i class="fa-solid fa-table-list"></i> ดูในตาราง WBS
                    </button>
                </div>
            `;
        }
        // 2. Gallery / Photos
        else if (cat === 'gallery') {
            modalTitle.innerHTML = `<i class="fa-solid fa-camera" style="color: var(--pea-purple);"></i> ภาพอัปเดตหน้างาน`;
            window.currentCalendarImages = props.imageUrls || [];

            let photoHtml = '';
            if (props.imageUrls && props.imageUrls.length > 0) {
                photoHtml = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; margin-top: 14px; max-height: 280px; overflow-y: auto; padding: 4px;">
                        ${props.imageUrls.map((url, idx) => `
                            <div style="position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 4/3; box-shadow: 0 2px 6px rgba(0,0,0,0.12); cursor: pointer;" onclick="window.openLightbox(${idx})">
                                <img src="${url}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                <span style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.6); color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">#${idx + 1}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            modalContent.innerHTML = `
                <div class="cal-modal-header" style="margin-bottom: 12px;">
                    <span class="cal-modal-badge" style="background: rgba(116, 44, 129, 0.12); color: var(--pea-purple); padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                        <i class="fa-regular fa-calendar-day"></i> ประจำวันที่ ${formatThaiDate(props.date)}
                    </span>
                    <p style="margin: 10px 0 0 0; color: var(--text-primary); font-size: 14px; line-height: 1.5;">
                        ${props.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                    </p>
                </div>
                ${photoHtml}
                <div style="text-align: right; margin-top: 16px;">
                    <button type="button" class="btn btn-secondary" onclick="window.closeCalendarModal(); openProjectTab(null, 'tabGallery');" style="font-size: 13px;">
                        <i class="fa-regular fa-images"></i> ไปยังแกลเลอรีภาพ
                    </button>
                </div>
            `;
        }
        // 3. Contract & EOT Milestone
        else if (cat === 'contract') {
            modalTitle.innerHTML = `<i class="${props.icon || 'fa-solid fa-flag-checkered'}" style="color: #7c3aed;"></i> ${props.title}`;
            modalContent.innerHTML = `
                <div style="background: var(--bg-hover, #f8fafc); border-radius: 10px; padding: 18px; margin-bottom: 16px; border: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                        <span style="background: rgba(124, 58, 237, 0.12); color: #7c3aed; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                            ${props.categoryLabel}
                        </span>
                    </div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                        📅 กำหนดวัน: <span style="color: var(--pea-purple);">${formatThaiDate(props.date)}</span>
                    </div>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
                        ${props.description || '-'}
                    </p>
                </div>
                <div style="text-align: right;">
                    <button type="button" class="btn btn-primary" onclick="window.closeCalendarModal(); window.openEotModal();" style="font-size: 13px;">
                        <i class="fa-solid fa-hourglass-half"></i> จัดการข้อมูลสัญญา (EOT)
                    </button>
                </div>
            `;
        }
        // 4. Punch List / Defect
        else if (cat === 'punch') {
            const item = props.item || {};
            modalTitle.innerHTML = `<i class="fa-solid fa-clipboard-check" style="color: #ef4444;"></i> ข้อบกพร่องตรวจรับงาน (Punch List)`;
            modalContent.innerHTML = `
                <div style="background: var(--bg-hover, #f8fafc); border-radius: 10px; padding: 16px; margin-bottom: 16px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="background: rgba(239, 68, 68, 0.12); color: #ef4444; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                            ${item.category || 'ข้อบกพร่อง'}
                        </span>
                        <span style="font-size: 13px; font-weight: 600; color: ${item.status === 'closed' ? '#10b981' : (item.status === 'resolved' ? '#f59e0b' : '#ef4444')};">
                            ${item.status === 'closed' ? '✔ ปิดงานแล้ว' : (item.status === 'resolved' ? '⏳ รอตรวจรับ' : '❗ รอแก้ไข')}
                        </span>
                    </div>
                    <h4 style="margin: 8px 0; font-size: 1.1rem; color: var(--text-primary);">${item.title || '-'}</h4>
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: var(--text-secondary);">${item.description || '-'}</p>
                    <div style="font-size: 13px; color: var(--text-muted);">
                        <i class="fa-regular fa-calendar"></i> <strong>กำหนดแก้ไขเสร็จ:</strong> ${formatThaiDate(props.date)}
                    </div>
                </div>
                <div style="text-align: right;">
                    <button type="button" class="btn btn-primary" onclick="window.closeCalendarModal(); openProjectTab(null, 'tabPunchList');" style="font-size: 13px;">
                        <i class="fa-solid fa-list-check"></i> ไปยังรายการ Punch List
                    </button>
                </div>
            `;
        }

        modal.style.display = 'flex';
    };

    /**
     * Close modal helper
     */
    window.closeCalendarModal = function () {
        const modal = document.getElementById('calendarModal');
        if (modal) modal.style.display = 'none';
    };

    /**
     * Toggle filter category
     */
    window.toggleCalendarFilter = function (category) {
        if (!category) return;
        window.calFilters[category] = !window.calFilters[category];

        const btn = document.getElementById(`calFilter${category.charAt(0).toUpperCase() + category.slice(1)}`);
        if (btn) {
            btn.classList.toggle('active', window.calFilters[category]);
        }

        if (window.projectCalendar && typeof window.projectCalendar.refetchEvents === 'function') {
            window.projectCalendar.refetchEvents();
        }
    };

    /**
     * Jump calendar to a specific milestone
     */
    window.jumpCalendarTo = function (target) {
        if (!window.projectCalendar || !window.currentProjectViewData) return;
        const p = window.currentProjectViewData;

        let targetDate = null;
        if (target === 'start' && p.startDate) {
            targetDate = p.startDate;
        } else if (target === 'today') {
            targetDate = new Date();
        } else if (target === 'end') {
            if (window.getAdjustedContractEndDate) {
                targetDate = window.getAdjustedContractEndDate(p) || p.endDate;
            } else {
                targetDate = p.endDate;
            }
        }

        if (targetDate) {
            window.projectCalendar.gotoDate(targetDate);
        }
    };

    // Auto-sync when theme changes
    const observer = new MutationObserver(() => {
        if (window.projectCalendar && typeof window.projectCalendar.updateSize === 'function') {
            window.projectCalendar.updateSize();
        }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

})();
