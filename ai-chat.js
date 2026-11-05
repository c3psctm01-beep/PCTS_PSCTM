/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: ai-chat.js - AI Assistant Chatbox (Gemini Proxy Integration)
 * ==============================================================================
 */

(function () {
    'use strict';

    window.populateChatboxProjects = function () {
        const select = document.getElementById('chatProjectSelect');
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = '<option value="all" style="color: black;">พูดคุยทั่วไป (ไม่เจาะจงโครงการ)</option>';

        const projList = window.projects || [];
        projList.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.style.color = "black";
            opt.text = p.name;
            select.appendChild(opt);
        });

        if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
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

        // Simulate bot thinking and replying
        setTimeout(() => {
            botReply(msg);
        }, 600);
    };

    function appendMessage(text, sender) {
        const msgContainer = document.getElementById('chatboxMessages');
        if (!msgContainer) return;
        const div = document.createElement('div');
        div.className = 'chat-message ' + sender;
        div.innerText = text;
        msgContainer.appendChild(div);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    function botReply(userMsg) {
        const msgContainer = document.getElementById('chatboxMessages');
        if (!msgContainer) return;
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message bot';
        loadingDiv.id = 'chatLoadingIndicator';
        loadingDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังคิด...';
        msgContainer.appendChild(loadingDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;

        let modelName = localStorage.getItem('geminiModel') || 'gemini-3.6-flash';
        if (!modelName || ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash'].includes(modelName)) {
            modelName = 'gemini-3.6-flash';
            localStorage.setItem('geminiModel', 'gemini-3.6-flash');
        }

        const select = document.getElementById('chatProjectSelect');
        const selectedProjectId = select ? select.value : 'all';
        const projList = window.projects || [];

        let contextText = "";
        let imageParts = [];

        if (selectedProjectId !== 'all' && projList.length > 0) {
            const p = projList.find(proj => String(proj.id) === String(selectedProjectId));
            if (p) {
                contextText = `ข้อมูลโครงการที่กำลังพูดถึง:\nชื่อ: ${p.name}\nสถานะ: ${p.status}\nผู้รับเหมา: ${p.contractor || '-'}\nระยะเวลา: ${p.duration || '-'} (เริ่ม: ${p.startDate || '-'} สิ้นสุด: ${p.endDate || '-'})\nงบประมาณ: ${p.budget || '-'}\n`;

                if (p.tasks && p.tasks.length > 0) {
                    contextText += "แผนงานย่อย (รายละเอียดแต่ละงาน):\n" + p.tasks.map(t => {
                        const s = t.startDate || 'ไม่ระบุ';
                        const e = t.endDate || 'ไม่ระบุ';
                        return `- ${t.name}: ค่าน้ำหนักความสำคัญ ${t.weight}% (หมายเหตุ: นี่คือค่าน้ำหนักงาน ไม่ใช่ % ความก้าวหน้าตามแผน), ความก้าวหน้าจริงทำได้ ${t.actual}%, กำหนดการ: เริ่ม ${s} ถึง ${e}`;
                    }).join('\n') + "\n";
                }

                if (p.disbursement) {
                    const d = p.disbursement;
                    contextText += `ข้อมูลการเบิกจ่าย (Disbursement):\n`;
                    if (d.budget) contextText += `- งบประมาณอนุมัติ (WBS): ${d.budget} บาท\n`;
                    if (d.totalPaid) contextText += `- จ่ายแล้วสะสมรวม: ${d.totalPaid} บาท\n`;
                    if (d.paidPrevYear) contextText += `- จ่ายแล้วปีก่อน: ${d.paidPrevYear} บาท\n`;
                    if (d.paidCurrentYear) contextText += `- จ่ายแล้วปีนี้: ${d.paidCurrentYear} บาท\n`;
                    if (d.remaining) contextText += `- คงเหลือ: ${d.remaining} บาท\n`;
                    if (d.budget > 0 && d.totalPaid > 0) {
                        contextText += `- เปอร์เซ็นต์เบิกจ่าย: ${((d.totalPaid / d.budget) * 100).toFixed(2)}%\n`;
                    }
                }

                if (p.gallery && p.gallery.length > 0) {
                    let validImages = p.gallery.filter(g => g.url && g.url.startsWith('data:image'));
                    if (validImages.length > 0) {
                        contextText += `\nมีรูปภาพแนบมาด้วยจำนวน ${validImages.length} รูป (ให้วิเคราะห์ภาพประกอบด้วย)\n`;
                        // Limit to max 3 images to save payload size and token limit
                        validImages.slice(0, 3).forEach(g => {
                            const mimeType = g.url.substring(g.url.indexOf(':') + 1, g.url.indexOf(';'));
                            const base64Data = g.url.substring(g.url.indexOf(',') + 1);
                            imageParts.push({
                                "inline_data": {
                                    "mime_type": mimeType,
                                    "data": base64Data
                                }
                            });
                        });
                    }
                }
            }
        } else if (selectedProjectId === 'all' && projList.length > 0) {
            contextText = "ข้อมูลภาพรวมของทุกโครงการที่มีในระบบ:\n\n";
            projList.forEach(p => {
                contextText += `--- โครงการ: ${p.name} ---\nสถานะ: ${p.status}\nผู้รับเหมา: ${p.contractor || '-'}\n`;
                if (p.tasks && p.tasks.length > 0) {
                    contextText += "แผนงานย่อย (รายละเอียดแต่ละงาน):\n" + p.tasks.map(t => {
                        const s = t.startDate || 'ไม่ระบุ';
                        const e = t.endDate || 'ไม่ระบุ';
                        return `- ${t.name}: ค่าน้ำหนักความสำคัญ ${t.weight}% (หมายเหตุ: นี่คือค่าน้ำหนักงาน ไม่ใช่ % ความก้าวหน้าตามแผน), ความก้าวหน้าจริงทำได้ ${t.actual}%, กำหนดการ: เริ่ม ${s} ถึง ${e}`;
                    }).join('\n') + "\n";
                }
                contextText += "\n";
            });
        }

        const now = new Date();
        const currentTime = `วันที่ ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear() + 543} (ค.ศ. ${now.getFullYear()}) เวลา ${now.toLocaleTimeString('th-TH')}`;
        const systemInstruction = `คุณคือ PCTS Assistant ผู้ช่วย AI สำหรับระบบติดตามโครงการก่อสร้าง PEA ตอบคำถามเป็นภาษาไทยอย่างเป็นมิตร สุภาพ และกระชับ หากมีข้อมูลโครงการหรือรูปภาพแนบมา ให้วิเคราะห์จากข้อมูลนั้นเป็นหลัก\nข้อมูลวันและเวลาปัจจุบันของระบบคือ: ${currentTime}`;

        let parts = [];
        parts.push({ "text": `[คำสั่งระบบ: ${systemInstruction}]\n\n` });
        if (contextText) {
            parts.push({ "text": contextText });
        }

        // Add images
        parts = parts.concat(imageParts);

        // Add user message
        parts.push({ "text": "คำถาม: " + userMsg });

        const requestBody = {
            model: modelName,
            contents: [{
                parts: parts
            }]
        };

        window.db.functions.invoke('gemini-proxy', {
            body: requestBody
        }).then(async ({ data, error }) => {
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
                    let replyText = textPart.text;

                    // Format basic markdown if present (e.g. bold, line breaks)
                    replyText = replyText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    replyText = replyText.replace(/\n/g, '<br>');

                    // Create HTML message
                    const div = document.createElement('div');
                    div.className = 'chat-message bot';
                    div.innerHTML = replyText;
                    msgContainer.appendChild(div);
                    msgContainer.scrollTop = msgContainer.scrollHeight;
                } else {
                    appendMessage("ไม่สามารถประมวลผลคำตอบได้ กรุณาลองใหม่อีกครั้งครับ", 'bot');
                }
            } else {
                appendMessage("ไม่สามารถประมวลผลคำตอบได้ กรุณาลองใหม่อีกครั้งครับ", 'bot');
            }
        }).catch(error => {
            console.error('Fetch Error:', error);
            const loadingEl = document.getElementById('chatLoadingIndicator');
            if (loadingEl) loadingEl.remove();
            appendMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้งครับ", 'bot');
        });
    }
})();

