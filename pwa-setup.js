/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: pwa-setup.js - Progressive Web App Registration & Install Manager
 * ==============================================================================
 */

(function () {
    'use strict';

    let deferredPrompt = null;

    // ลงทะเบียน Service Worker เมื่อโหลดหน้าเว็บเสร็จ
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then((reg) => {
                    console.log('[PWA] Service Worker ลงทะเบียนสำเร็จ: Scope คือ', reg.scope);
                })
                .catch((err) => {
                    console.warn('[PWA] ลงทะเบียน Service Worker ไม่สำเร็จ:', err);
                });
        });
    }

    // ดักจับ Event ก่อนแสดง Install Prompt ของเบราว์เซอร์
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        // แสดงปุ่มหรือแบนเนอร์ติดตั้งแอป (ถ้ามี)
        const pwaBtn = document.getElementById('btnPwaInstall');
        if (pwaBtn) {
            pwaBtn.style.display = 'inline-flex';
        }
    });

    /**
     * สั่งเปิดหน้าต่างติดตั้ง PWA บนอุปกรณ์
     */
    window.installPwaApp = function () {
        if (!deferredPrompt) {
            alert('ระบบพร้อมใช้งานผ่านหน้าจอหลักแล้ว คุณสามารถกดเมนูของเบราว์เซอร์และเลือก "เพิ่มลงในหน้าจอหลัก" (Add to Home Screen)');
            return;
        }

        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('[PWA] ผู้ใช้ยอมรับการติดตั้งแอป');
            } else {
                console.log('[PWA] ผู้ใช้ปฏิเสธการติดตั้ง');
            }
            deferredPrompt = null;
            const pwaBtn = document.getElementById('btnPwaInstall');
            if (pwaBtn) pwaBtn.style.display = 'none';
        });
    };

    window.addEventListener('appinstalled', () => {
        console.log('[PWA] ติดตั้งแอป PCTS เรียบร้อยแล้ว');
        deferredPrompt = null;
        const pwaBtn = document.getElementById('btnPwaInstall');
        if (pwaBtn) pwaBtn.style.display = 'none';
    });

})();
