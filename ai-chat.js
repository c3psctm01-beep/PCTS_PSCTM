/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: ai-chat.js - AI Assistant Chatbox (Gemini Proxy Integration)
 * ==============================================================================
 */

(function () {
    'use strict';

    const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
    const INVALID_OR_LEGACY_MODELS = ['gemini-3.6-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

    function escapeHtmlSafe(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatSafeBotMarkdown(rawText) {
        let safe = escapeHtmlSafe(rawText);
        // Bold **text**
        safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Inline code `code`
        safe = safe.replace(/`([^`\n]+)`/g, '<code>$1</code>');
        // Line breaks
        safe = safe.replace(/\r?\n/g, '<br>');
        return safe;
    }

    async function resolveImageInlineData(url) {
        if (!url || typeof url !== 'string') return null;
        try {
            if (url.startsWith('data:image/')) {
                const semiIdx = url.indexOf(';');
                const commaIdx = url.indexOf(',');
                if (semiIdx === -1 || commaIdx === -1) return null;
                return {
                    inline_data: {
                        mime_type: url.substring(5, semiIdx),
                        data: url.substring(commaIdx + 1)
                    }
                };
            }

            // Support Supabase Storage URLs and local image assets (skip placeholder mascot)
            if (url.endsWith('mascot.jpg') || url.endsWith('mascot.webp')) return null;

            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 4000);
            const resp = await fetch(url, { mode: 'cors', signal: controller.signal });
            clearTimeout(timer);
            if (!resp.ok) return null;

            const blob = await resp.blob();
            if (!blob || !blob.type.startsWith('image/') || blob.size > 4 * 1024 * 1024) return null;

            const dataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
                reader.onerror = () => resolve('');
                reader.readAsDataURL(blob);
            });
            if (!dataUrl) return null;
            const semiIdx = dataUrl.indexOf(';');
            const commaIdx = dataUrl.indexOf(',');
            if (semiIdx === -1 || commaIdx === -1) return null;
            return {
                inline_data: {
                    mime_type: dataUrl.substring(5, semiIdx),
                    data: dataUrl.substring(commaIdx + 1)
                }
            };
        } catch (_) {
            return null;
        }
    }

    window.populateChatboxProjects = function () {
        const select = document.getElementById('chatProjectSelect');
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = '<option value="all" style="color: black;">พูดคุยทั่วไป (ไม่เจาะจงโครงการ)</option>';

        const projList = window.projects || [];
        projList.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.style.color = 'black';
            opt.text = p.name;
            select.appendChild(opt);
        });

        if (currentVal && select.querySelector(`option[value="${CSS.escape(String(currentVal))}"]`)) {
            select.value = currentVal;
        }
    };

    window.toggleChatbox = function () {
        const chatbox = document.getElementById('chatboxPanel');
        if (!chatbox) return;
        if (chatbox.style.display === 'none' || !chatbox.style.display) {
            window.populateChatboxProjects();
            chatbox.style.display = 'flex';
            document.getElementById('chatInput')?.focus();
        } else {
            chatbox.style.display = 'none';
        }
    };

    window.handleChatKeyPress = function (event) {
        if (event.key === 'Enter') {
            window.sendChatMessage();
        }
    };

    window.sendChatMessage = function () {
        const input = document.getElementById('chatInput');
        if (!input) return;
        const msg = input.value.trim();
        if (!msg) return;

        appendMessage(msg, 'user');
        input.value = '';

        setTimeout(() => {
            botReply(msg);
        }, 300);
    };

    function appendMessage(text, sender) {
        const msgContainer = document.getElementById('chatboxMessages');
        if (!msgContainer) return;
        const div = document.createElement('div');
        div.className = 'chat-message ' + sender;
        div.textContent = text;
        msgContainer.appendChild(div);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    async function botReply(userMsg) {
        const msgContainer = document.getElementById('chatboxMessages');
        if (!msgContainer) return;
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message bot';
        loadingDiv.id = 'chatLoadingIndicator';
        loadingDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังคิด...';
        msgContainer.appendChild(loadingDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;

        let modelName = localStorage.getItem('geminiModel') || DEFAULT_GEMINI_MODEL;
        if (!modelName || INVALID_OR_LEGACY_MODELS.includes(modelName)) {
            modelName = DEFAULT_GEMINI_MODEL;
            try { localStorage.setItem('geminiModel', DEFAULT_GEMINI_MODEL); } catch (_) { }
        }

        const select = document.getElementById('chatProjectSelect');
        const selectedProjectId = select ? select.value : 'all';
        const projList = window.projects || [];

        let contextText = '';
        let imageParts = [];

        if (selectedProjectId !== 'all' && projList.length > 0) {
            const p = projList.find(proj => String(proj.id) === String(selectedProjectId));
            if (p) {
                const prog = (typeof window.calculateProjectProgress === 'function')
                    ? window.calculateProjectProgress(p)
                    : { plan: '-', actual: '-' };
                contextText = `ข้อมูลโครงการที่กำลังพูดถึง:\nชื่อ: ${p.name}\nประเภทงาน: ${p.workType || '-'}\nสถานะ: ${p.status}\nความก้าวหน้าสะสมรวม: แผน ${prog.plan}% | ทำได้จริง ${prog.actual}%\nผู้รับเหมา: ${p.contractor || '-'}\nผู้ควบคุมงาน: ${p.supervisor || '-'}\nระยะเวลา: ${p.duration || '-'} (เริ่ม: ${p.startDate || '-'} สิ้นสุด: ${p.endDate || '-'})\nงบประมาณ: ${p.budget || '-'}\n`;

                if (p.tasks && p.tasks.length > 0) {
                    contextText += 'แผนงานย่อย (รายละเอียดแต่ละงาน):\n' + p.tasks.map(t => {
                        const s = t.startDate || 'ไม่ระบุ';
                        const e = t.endDate || 'ไม่ระบุ';
                        return `- ${t.name}: ค่าน้ำหนักความสำคัญ ${t.weight}% (ค่าน้ำหนักงานรวม ไม่ใช่ % แผน), ความก้าวหน้าจริงทำได้ ${t.actual}%, กำหนดการ: เริ่ม ${s} ถึง ${e}`;
                    }).join('\n') + '\n';
                }

                if (Array.isArray(p.punchList) && p.punchList.length > 0) {
                    const pendingPl = p.punchList.filter(pl => pl.status !== 'closed').length;
                    contextText += `รายการตรวจรับ/ข้อบกพร่อง (Punch List): ทั้งหมด ${p.punchList.length} รายการ (ค้างแก้ไข/รอตรวจรับ ${pendingPl} รายการ)\n`;
                }

                if (p.disbursement) {
                    const d = p.disbursement;
                    contextText += 'ข้อมูลการเบิกจ่าย (Disbursement):\n';
                    if (d.budget) contextText += `- งบประมาณอนุมัติ (WBS): ${d.budget} บาท\n`;
                    if (d.totalPaid) contextText += `- จ่ายแล้วสะสมรวม: ${d.totalPaid} บาท\n`;
                    if (d.paidPrevYear) contextText += `- จ่ายแล้วปีก่อน: ${d.paidPrevYear} บาท\n`;
                    if (d.paidCurrentYear) contextText += `- จ่ายแล้วปีนี้: ${d.paidCurrentYear} บาท\n`;
                    if (d.remaining) contextText += `- คงเหลือ: ${d.remaining} บาท\n`;
                    if (d.budget > 0 && d.totalPaid > 0) {
                        contextText += `- เปอร์เซ็นต์เบิกจ่าย: ${((d.totalPaid / d.budget) * 100).toFixed(2)}%\n`;
                    }
                }

                if (Array.isArray(p.gallery) && p.gallery.length > 0) {
                    const recentCandidates = p.gallery
                        .filter(g => g && g.url && !String(g.url).endsWith('mascot.jpg') && !String(g.url).endsWith('mascot.webp'))
                        .slice(-3);
                    if (recentCandidates.length > 0) {
                        const resolvedImgs = await Promise.all(recentCandidates.map(g => resolveImageInlineData(g.url)));
                        imageParts = resolvedImgs.filter(Boolean);
                        if (imageParts.length > 0) {
                            contextText += `\nมีรูปภาพความก้าวหน้าล่าสุดแนบมาด้วยจำนวน ${imageParts.length} รูป (ให้วิเคราะห์ภาพประกอบด้วย)\n`;
                        }
                    }
                }
            }
        } else if (selectedProjectId === 'all' && projList.length > 0) {
            contextText = 'ข้อมูลภาพรวมของทุกโครงการที่มีในระบบ:\n\n';
            projList.forEach(p => {
                const prog = (typeof window.calculateProjectProgress === 'function')
                    ? window.calculateProjectProgress(p)
                    : { plan: '-', actual: '-' };
                contextText += `--- โครงการ: ${p.name} ---\nสถานะ: ${p.status} | แผนสะสม: ${prog.plan}% | ผลงานจริง: ${prog.actual}%\nผู้รับเหมา: ${p.contractor || '-'}\n`;
                if (p.tasks && p.tasks.length > 0) {
                    contextText += 'แผนงานย่อย:\n' + p.tasks.map(t => {
                        const s = t.startDate || 'ไม่ระบุ';
                        const e = t.endDate || 'ไม่ระบุ';
                        return `- ${t.name}: น้ำหนักงาน ${t.weight}%, ทำได้จริง ${t.actual}%, เริ่ม ${s} ถึง ${e}`;
                    }).join('\n') + '\n';
                }
                contextText += '\n';
            });
        }

        const now = new Date();
        const currentTime = `วันที่ ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear() + 543} (ค.ศ. ${now.getFullYear()}) เวลา ${now.toLocaleTimeString('th-TH')}`;
        const systemInstruction = `คุณคือ PCTS Assistant ผู้ช่วย AI สำหรับระบบติดตามโครงการก่อสร้าง PEA ตอบคำถามเป็นภาษาไทยอย่างเป็นมิตร สุภาพ และกระชับ หากมีข้อมูลโครงการหรือรูปภาพแนบมา ให้วิเคราะห์จากข้อมูลนั้นเป็นหลัก\nข้อมูลวันและเวลาปัจจุบันของระบบคือ: ${currentTime}`;

        let parts = [{ text: `[คำสั่งระบบ: ${systemInstruction}]\n\n` }];
        if (contextText) {
            parts.push({ text: contextText });
        }
        parts = parts.concat(imageParts);
        parts.push({ text: 'คำถาม: ' + userMsg });

        const requestBody = {
            model: modelName,
            contents: [{ parts: parts }]
        };

        try {
            const { data, error } = await window.db.functions.invoke('gemini-proxy', {
                body: requestBody
            });

            const loadingEl = document.getElementById('chatLoadingIndicator');
            if (loadingEl) loadingEl.remove();

            if (error) {
                console.error('Supabase Error:', error);
                let errMsg = error.message;
                if (error.context && typeof error.context.json === 'function') {
                    try {
                        const errData = await error.context.json();
                        if (errData && errData.error) errMsg = errData.error;
                    } catch (_) {
                        try {
                            const errText = await error.context.text();
                            if (errText) errMsg = errText;
                        } catch (__) { }
                    }
                }
                appendMessage(`เกิดข้อผิดพลาดในการเชื่อมต่อ: ${errMsg}`, 'bot');
            } else if (data && data.error) {
                console.error('Gemini API Error:', data.error);
                appendMessage(`เกิดข้อผิดพลาดจาก API: ${data.error}`, 'bot');
            } else if (data && data.candidates && data.candidates.length > 0) {
                const respParts = data.candidates[0]?.content?.parts || [];
                const textPart = respParts.find(p => p.text);
                if (textPart && textPart.text) {
                    const div = document.createElement('div');
                    div.className = 'chat-message bot';
                    div.innerHTML = formatSafeBotMarkdown(textPart.text);
                    msgContainer.appendChild(div);
                    msgContainer.scrollTop = msgContainer.scrollHeight;
                } else {
                    appendMessage('ไม่สามารถประมวลผลคำตอบได้ กรุณาลองใหม่อีกครั้งครับ', 'bot');
                }
            } else {
                appendMessage('ไม่สามารถประมวลผลคำตอบได้ กรุณาลองใหม่อีกครั้งครับ', 'bot');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            const loadingEl = document.getElementById('chatLoadingIndicator');
            if (loadingEl) loadingEl.remove();
            appendMessage('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้งครับ', 'bot');
        }
    }
})();
