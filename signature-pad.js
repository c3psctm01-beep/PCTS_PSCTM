/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: signature-pad.js - Digital Signature Pad Engine (3-Party Signatures)
 * ==============================================================================
 */

(function () {
    'use strict';

    const pads = {
        supervisor: null,
        contractor: null,
        committee: null
    };

    class SimpleSignaturePad {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.isDrawing = false;
            this.hasContent = false;
            this.lastX = 0;
            this.lastY = 0;

            this.initCanvasSize();
            this.attachEvents();
        }

        initCanvasSize() {
            if (!this.canvas) return;
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // ตั้งค่า Resolution จริงของ Canvas
            const displayWidth = rect.width > 0 ? rect.width : 280;
            const displayHeight = rect.height > 0 ? rect.height : 110;

            this.canvas.width = displayWidth * dpr;
            this.canvas.height = displayHeight * dpr;

            this.ctx.scale(dpr, dpr);
            this.ctx.strokeStyle = '#0F172A'; // น้ำเงินเข้มเกือบดำเหมือนหมึกปากกา
            this.ctx.lineWidth = 2.2;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
        }

        getPoint(e) {
            const rect = this.canvas.getBoundingClientRect();
            let clientX = e.clientX;
            let clientY = e.clientY;

            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }

            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        attachEvents() {
            const startDraw = (e) => {
                e.preventDefault();
                this.isDrawing = true;
                const pt = this.getPoint(e);
                this.lastX = pt.x;
                this.lastY = pt.y;

                // จุดแรกเริ่ม
                this.ctx.beginPath();
                this.ctx.arc(this.lastX, this.lastY, this.ctx.lineWidth / 2, 0, Math.PI * 2);
                this.ctx.fillStyle = this.ctx.strokeStyle;
                this.ctx.fill();
                this.hasContent = true;
                this.updateBadge();
            };

            const moveDraw = (e) => {
                if (!this.isDrawing) return;
                e.preventDefault();
                const pt = this.getPoint(e);

                this.ctx.beginPath();
                this.ctx.moveTo(this.lastX, this.lastY);
                this.ctx.lineTo(pt.x, pt.y);
                this.ctx.stroke();

                this.lastX = pt.x;
                this.lastY = pt.y;
                this.hasContent = true;
                this.updateBadge();
            };

            const stopDraw = (e) => {
                if (this.isDrawing) {
                    this.isDrawing = false;
                }
            };

            // Pointer Events (Mouse, Touch, Stylus)
            this.canvas.addEventListener('mousedown', startDraw);
            this.canvas.addEventListener('mousemove', moveDraw);
            window.addEventListener('mouseup', stopDraw);

            this.canvas.addEventListener('touchstart', startDraw, { passive: false });
            this.canvas.addEventListener('touchmove', moveDraw, { passive: false });
            window.addEventListener('touchend', stopDraw);
        }

        clear() {
            if (!this.canvas) return;
            const dpr = window.devicePixelRatio || 1;
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
            this.hasContent = false;
            this.updateBadge();
        }

        isEmpty() {
            return !this.hasContent;
        }

        toDataURL() {
            if (this.isEmpty()) return null;
            return this.canvas.toDataURL('image/png');
        }

        updateBadge() {
            const badgeId = this.canvas.id + '-status';
            const badge = document.getElementById(badgeId);
            if (badge) {
                if (this.hasContent) {
                    badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> ลงนามแล้ว';
                    badge.style.backgroundColor = 'rgba(46, 204, 113, 0.15)';
                    badge.style.color = '#27ae60';
                } else {
                    badge.innerHTML = '<i class="fa-solid fa-pen"></i> ยังไม่ได้ลงนาม';
                    badge.style.backgroundColor = 'rgba(148, 163, 184, 0.15)';
                    badge.style.color = '#64748b';
                }
            }
        }
    }

    /**
     * เริ่มต้น Signature Pad ทั้ง 3 ช่อง
     */
    window.initPctsSignaturePads = function () {
        pads.supervisor = new SimpleSignaturePad('sigCanvasSupervisor');
        pads.contractor = new SimpleSignaturePad('sigCanvasContractor');
        pads.committee = new SimpleSignaturePad('sigCanvasCommittee');
    };

    /**
     * ล้างลายเซ็นของแต่ละตำแหน่ง
     */
    window.clearPctsSignature = function (role) {
        if (pads[role]) {
            pads[role].clear();
        }
    };

    /**
     * ล้างลายเซ็นทั้งหมด
     */
    window.clearAllPctsSignatures = function () {
        Object.keys(pads).forEach(k => {
            if (pads[k]) pads[k].clear();
        });
    };

    /**
     * ดึงรูปลายเซ็นทั้งหมด (Base64 PNG หรือ null หากยังไม่ได้เซ็น)
     */
    window.getPctsSignatures = function () {
        return {
            supervisor: pads.supervisor ? pads.supervisor.toDataURL() : null,
            contractor: pads.contractor ? pads.contractor.toDataURL() : null,
            committee: pads.committee ? pads.committee.toDataURL() : null
        };
    };

})();
