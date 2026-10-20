/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: realtime-sync.js - Supabase Realtime Database Synchronization
 * ==============================================================================
 */

(function () {
    'use strict';

    let realtimeChannel = null;
    let toastDebounceTimer = null;
    let pendingToastNames = new Set();
    let renderDebounceTimer = null;

    /**
     * แสดง Toastify Notification สไตล์ PEA
     */
    function showRealtimeToast(message, type = 'info') {
        if (typeof Toastify === 'function') {
            const bgGradient = type === 'success' 
                ? 'linear-gradient(135deg, #10B981, #059669)' 
                : 'linear-gradient(135deg, #742C81, #5B2166)';

            Toastify({
                text: message,
                duration: 4000,
                close: true,
                gravity: 'top',
                position: 'right',
                style: {
                    background: bgGradient,
                    borderRadius: '8px',
                    fontFamily: "'Prompt', 'Sarabun', sans-serif",
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
            }).showToast();
        } else {
            console.log('[Realtime Notification]', message);
        }
    }

    /**
     * ดีบาวน์และรวบกลุ่มการแจ้งเตือน Realtime เพื่อป้องกันไม่ให้ Toast เด้งซ้อนกันรัวๆ
     */
    function scheduleRealtimeToast(projectName, type = 'info') {
        if (projectName) pendingToastNames.add(projectName);

        clearTimeout(toastDebounceTimer);
        toastDebounceTimer = setTimeout(() => {
            if (pendingToastNames.size === 0) return;
            if (pendingToastNames.size === 1) {
                const name = Array.from(pendingToastNames)[0];
                showRealtimeToast(`🔄 โครงการ "${name}" มีการอัปเดตข้อมูลสด`, type);
            } else {
                showRealtimeToast(`🔄 มีการอัปเดตข้อมูลสด ${pendingToastNames.size} โครงการ`, type);
            }
            pendingToastNames.clear();
        }, 700);
    }

    /**
     * เริ่มต้น Realtime Subscription กับ Supabase
     */
    window.initPctsRealtimeSync = function () {
        if (!window.supabase || !window.db) {
            console.warn('[Realtime] ไม่พบคอนฟิก Supabase DB ข้ามการซิงค์เรียลไทม์');
            return;
        }

        if (realtimeChannel) {
            try {
                realtimeChannel.unsubscribe();
                if (typeof window.db.removeChannel === 'function') {
                    window.db.removeChannel(realtimeChannel);
                }
            } catch (_) {}
        }

        realtimeChannel = window.db.channel('pcts-projects-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'projects' },
                async (payload) => {
                    console.log('[Realtime] ตรวจพบการเปลี่ยนแปลงใน projects:', payload);
                    const eventType = payload.eventType; // 'INSERT', 'UPDATE', 'DELETE'
                    const newRecord = payload.new;
                    const oldRecord = payload.old;

                    let updatedProject = null;

                    if (eventType === 'UPDATE' && newRecord) {
                        const idx = window.projects.findIndex(p => p.id === newRecord.id);
                        if (idx !== -1) {
                            // อัปเดตข้อมูลโครงการในหน่วยความจำ
                            window.projects[idx].name = newRecord.name || window.projects[idx].name;
                            window.projects[idx].status = newRecord.status || window.projects[idx].status;
                            window.projects[idx].tasks = newRecord.tasks || window.projects[idx].tasks;
                            window.projects[idx].gallery = newRecord.gallery || window.projects[idx].gallery;
                            window.projects[idx].disbursement = newRecord.disbursement || window.projects[idx].disbursement;
                            if (newRecord.eot) window.projects[idx].eot = newRecord.eot;
                            if (newRecord.punch_list) window.projects[idx].punchList = newRecord.punch_list;
                            if (newRecord.before_after) window.projects[idx].beforeAfter = newRecord.before_after;
                            if (newRecord.latitude) window.projects[idx].latitude = parseFloat(newRecord.latitude);
                            if (newRecord.longitude) window.projects[idx].longitude = parseFloat(newRecord.longitude);
                            if (newRecord.details) {
                                const latM = newRecord.details.match(/\[LAT:(.*?)\]/);
                                if (latM && latM[1]) window.projects[idx].latitude = parseFloat(latM[1]);
                                const lngM = newRecord.details.match(/\[LNG:(.*?)\]/);
                                if (lngM && lngM[1]) window.projects[idx].longitude = parseFloat(lngM[1]);
                            }
                            updatedProject = window.projects[idx];
                        }

                        // ตรวจสอบว่าเป็นการบันทึกจากอุปกรณ์/แท็บนี้เองหรือไม่
                        const lastSave = window._pctsLastLocalSave;
                        const isSelfSave = lastSave &&
                            (lastSave.projectId === newRecord.id || lastSave.projectId === null) &&
                            (Date.now() - lastSave.timestamp < 5000);

                        // หากไม่ใช่การเซฟจากตนเอง จึงจะแจ้งเตือนการอัปเดตข้อมูลสด
                        if (!isSelfSave) {
                            scheduleRealtimeToast(newRecord.name || 'โครงการ', 'info');
                        }
                    } else if (eventType === 'INSERT' && newRecord) {
                        const lastSave = window._pctsLastLocalSave;
                        const isSelfSave = lastSave && (Date.now() - lastSave.timestamp < 5000);
                        if (!isSelfSave) {
                            showRealtimeToast(`✨ มีการเพิ่มโครงการใหม่: "${newRecord.name}"`, 'success');
                        }
                        if (typeof window.loadProjects === 'function') {
                            await window.loadProjects();
                        }
                    } else if (eventType === 'DELETE' && oldRecord) {
                        window.projects = window.projects.filter(p => p.id !== oldRecord.id);
                        showRealtimeToast(`🗑️ มีการลบโครงการออกจากระบบ`, 'info');
                    }

                    // ดีบาวน์การรีเฟรชมุมมองเพื่อประสิทธิภาพ ไม่กระตุกหรือทำงานซ้ำซ้อน
                    clearTimeout(renderDebounceTimer);
                    renderDebounceTimer = setTimeout(() => {
                        if (typeof window.renderTables === 'function') window.renderTables();
                        if (typeof window.renderAdminProjects === 'function') window.renderAdminProjects();
                        if (typeof window.renderGisMap === 'function' && window.currentProjectViewMode === 'gis') {
                            window.renderGisMap();
                        }
                        if (window.currentProjectViewData && newRecord && window.currentProjectViewData.id === newRecord.id) {
                            const currentTarget = updatedProject || window.projects.find(p => p.id === newRecord.id) || window.currentProjectViewData;
                            if (typeof window.renderPunchListTab === 'function') window.renderPunchListTab(currentTarget);
                            if (typeof window.renderBeforeAfterTab === 'function') window.renderBeforeAfterTab(currentTarget);
                            if (typeof window.renderGalleryTab === 'function') {
                                window.renderGalleryTab(currentTarget, window.currentGalleryFilterTaskId || 'all');
                            }
                        }
                    }, 200);
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] สถานะการเชื่อมต่อ:', status);
            });
    };

})();
