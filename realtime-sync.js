/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: realtime-sync.js - Supabase Realtime Database Synchronization
 * ==============================================================================
 */

(function () {
    'use strict';

    let realtimeChannel = null;

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
     * เริ่มต้น Realtime Subscription กับ Supabase
     */
    window.initPctsRealtimeSync = function () {
        if (!window.supabase || !window.db) {
            console.warn('[Realtime] ไม่พบคอนฟิก Supabase DB ข้ามการซิงค์เรียลไทม์');
            return;
        }

        if (realtimeChannel) {
            realtimeChannel.unsubscribe();
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
                        }

                        showRealtimeToast(`🔄 โครงการ "${newRecord.name || 'โครงการ'}" มีการอัปเดตข้อมูลสด`, 'info');
                    } else if (eventType === 'INSERT' && newRecord) {
                        showRealtimeToast(`✨ มีการเพิ่มโครงการใหม่: "${newRecord.name}"`, 'success');
                        if (typeof window.loadProjects === 'function') {
                            await window.loadProjects();
                        }
                    } else if (eventType === 'DELETE' && oldRecord) {
                        window.projects = window.projects.filter(p => p.id !== oldRecord.id);
                        showRealtimeToast(`🗑️ มีการลบโครงการออกจากระบบ`, 'info');
                    }

                    // รีเฟรชมุมมองปัจจุบันเบาๆ
                    if (typeof window.renderTables === 'function') window.renderTables();
                    if (typeof window.renderAdminProjects === 'function') window.renderAdminProjects();
                    if (typeof window.renderGisMap === 'function' && window.currentProjectViewMode === 'gis') {
                        window.renderGisMap();
                    }
                    if (window.currentProjectViewData && (newRecord && window.currentProjectViewData.id === newRecord.id)) {
                        if (typeof window.renderPunchListTab === 'function') window.renderPunchListTab(window.projects[idx]);
                        if (typeof window.renderBeforeAfterTab === 'function') window.renderBeforeAfterTab(window.projects[idx]);
                    }
                }
            )
            .subscribe((status) => {
                console.log('[Realtime] สถานะการเชื่อมต่อ:', status);
            });
    };

})();
