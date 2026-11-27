/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: lazy-libs.js - Non-Blocking On-Demand Loader for Heavy Export Libraries
 * ==============================================================================
 * Removes ~1.8 MB of synchronous blocking scripts (SheetJS, html2pdf, JSZip) from
 * initial page load while guaranteeing on-demand loading + idle background warmup.
 */

(function () {
    'use strict';

    const LIB_URLS = {
        XLSX: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
        html2pdf: 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
        JSZip: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
        pdfjsLib: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
        pdfjsWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    };

    const pendingPromises = {};

    function loadExternalScript(key, globalCheckFn, url) {
        try {
            if (globalCheckFn()) return Promise.resolve(true);
        } catch (_) { }

        if (pendingPromises[key]) return pendingPromises[key];

        pendingPromises[key] = new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[data-lazy-lib="${key}"]`);
            if (existing) {
                existing.addEventListener('load', () => resolve(true), { once: true });
                existing.addEventListener('error', () => {
                    delete pendingPromises[key];
                    reject(new Error(`ไม่สามารถโหลดไลบรารี ${key} ได้ กรุณาตรวจสอบอินเทอร์เน็ต`));
                }, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.dataset.lazyLib = key;
            script.onload = () => resolve(true);
            script.onerror = () => {
                script.remove();
                delete pendingPromises[key];
                reject(new Error(`ไม่สามารถโหลดไลบรารี ${key} ได้ กรุณาตรวจสอบอินเทอร์เน็ต`));
            };
            document.head.appendChild(script);
        });

        return pendingPromises[key];
    }

    window.ensureXLSX = function () {
        return loadExternalScript('XLSX', () => typeof window.XLSX !== 'undefined', LIB_URLS.XLSX);
    };

    window.ensureHtml2Pdf = function () {
        return loadExternalScript('html2pdf', () => typeof window.html2pdf !== 'undefined', LIB_URLS.html2pdf);
    };

    window.ensureJSZip = function () {
        return loadExternalScript('JSZip', () => typeof window.JSZip !== 'undefined', LIB_URLS.JSZip);
    };

    window.ensurePdfJs = function () {
        return loadExternalScript('pdfjsLib', () => typeof window.pdfjsLib !== 'undefined', LIB_URLS.pdfjsLib).then(() => {
            if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = LIB_URLS.pdfjsWorker;
            }
            return true;
        });
    };

    // Warm up heavy libraries quietly during idle time after initial render is complete
    // so field engineers going offline later still have them ready in cache.
    window.addEventListener('load', () => {
        const warmup = () => {
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (conn && conn.saveData) return;
            window.ensureHtml2Pdf().catch(() => { });
            setTimeout(() => window.ensureXLSX().catch(() => { }), 1500);
            setTimeout(() => window.ensureJSZip().catch(() => { }), 3000);
        };
        if (typeof window.requestIdleCallback === 'function') {
            setTimeout(() => window.requestIdleCallback(warmup, { timeout: 5000 }), 3500);
        } else {
            setTimeout(warmup, 5000);
        }
    });
})();
