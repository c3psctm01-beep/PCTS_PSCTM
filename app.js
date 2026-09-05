// Default Data
const defaultProjects = [
    {
        id: 1,
        name: "สถานีไฟฟ้าสมุทรสาคร 18 (ชั่วคราว)",
        type: "ดำเนินการเอง",
        contractor: "กฟภ.",
        supervisor: "นายสมชาย ใจดี",
        committee: "คณะกรรมการชุดที่ 2",
        duration: "7 เดือน",
        status: "อยู่ระหว่างก่อสร้าง",
        tasks: [
            { id: 101, name: "รื้อถอนสถานีไฟฟ้าสมุทรสาคร 16 (ชั่วคราว)", startDate: "2026-06-01", endDate: "2026-06-15", weight: 10, actual: 100 },
            { id: 102, name: "ปรับปรุงที่ดิน", startDate: "2026-06-16", endDate: "2026-06-30", weight: 5, actual: 100 },
            { id: 103, name: "ขนย้ายติดตั้งฐานราก", startDate: "2026-07-01", endDate: "2026-07-15", weight: 5, actual: 10 },
            { id: 104, name: "ขนย้ายอุปกรณ์ป้องกัน 115 kV และหม้อแปลงไฟฟ้ากำลัง", startDate: "2026-07-16", endDate: "2026-07-31", weight: 5, actual: 0 },
            { id: 105, name: "ติดตั้งอุปกรณ์ป้องกัน 115 kV และหม้อแปลงไฟฟ้ากำลัง", startDate: "2026-08-01", endDate: "2026-08-15", weight: 5, actual: 0 },
            { id: 106, name: "ปักเสาภายในสถานีไฟฟ้า", startDate: "2026-08-16", endDate: "2026-08-31", weight: 5, actual: 0 },
            { id: 107, name: "ติดตั้งระบบกราวด์กริด", startDate: "2026-09-01", endDate: "2026-09-15", weight: 5, actual: 0 },
            { id: 108, name: "ลงหินเบอร์ 2", startDate: "2026-09-16", endDate: "2026-09-30", weight: 5, actual: 0 },
            { id: 109, name: "ติดตั้ง Ladder", startDate: "2026-10-01", endDate: "2026-10-15", weight: 5, actual: 0 },
            { id: 110, name: "ลากสายและติดตั้งสาย Control cable", startDate: "2026-10-16", endDate: "2026-10-31", weight: 10, actual: 0 },
            { id: 111, name: "ลากสายและติดตั้งสาย Power cable", startDate: "2026-11-01", endDate: "2026-11-15", weight: 10, actual: 0 },
            { id: 112, name: "CSCS", startDate: "2026-11-16", endDate: "2026-11-30", weight: 10, actual: 0 },
            { id: 113, name: "Individual Test", startDate: "2026-12-01", endDate: "2026-12-07", weight: 5, actual: 0 },
            { id: 114, name: "Commisioning Test", startDate: "2026-12-08", endDate: "2026-12-14", weight: 5, actual: 0 },
            { id: 115, name: "Settind Relay / End to End Test", startDate: "2026-12-15", endDate: "2026-12-21", weight: 5, actual: 0 },
            { id: 116, name: "AC Withstand Test", startDate: "2026-12-22", endDate: "2026-12-31", weight: 5, actual: 0 }
        ],
        gallery: [
            {
                url: "mascot.jpg",
                date: "2026-06-10",
                desc: "งานรื้อถอนโครงสร้างเหล็กและฐานรากสถานีเดิมแล้วเสร็จ 80%",
                taskId: 101,
                taskName: "รื้อถอนสถานีไฟฟ้าสมุทรสาคร 16 (ชั่วคราว)"
            },
            {
                url: "mascot.jpg",
                date: "2026-06-14",
                desc: "ตรวจสอบพื้นที่รื้อถอนเรียบร้อย พร้อมส่งมอบงานรื้อถอน 100%",
                taskId: 101,
                taskName: "รื้อถอนสถานีไฟฟ้าสมุทรสาคร 16 (ชั่วคราว)"
            },
            {
                url: "mascot.jpg",
                date: "2026-06-25",
                desc: "งานบดอัดและปรับระดับดินบริเวณลานหม้อแปลงไฟฟ้า",
                taskId: 102,
                taskName: "ปรับปรุงที่ดิน"
            },
            {
                url: "mascot.jpg",
                date: "2026-07-05",
                desc: "งานขนย้ายชิ้นส่วนฐานรากสำเร็จรูปเข้าพื้นที่โครงการ",
                taskId: 103,
                taskName: "ขนย้ายติดตั้งฐานราก"
            }
        ],
        disbursement: {
            budget: 45000000,
            paidPrevYear: 12000000,
            paidCurrentYear: 8500000,
            totalPaid: 20500000,
            commitment: 14200000,
            remaining: 10300000,
            currentViewMonth: "ก.ค. 2569",
            monthlyData: {
                "ก.ค. 2569": {
                    budget: 45000000,
                    totalPaid: 20500000,
                    commitment: 14200000,
                    remaining: 10300000
                }
            },
            items: [
                {
                    name: "งานจัดซื้อที่ดินและปรับปรุงพื้นที่",
                    wbs: "I-260101-01",
                    budget: 15000000,
                    totalPaid: 12000000,
                    commitment: 2500000,
                    pr: 0,
                    po: 2500000,
                    gr: 0,
                    ir: 0,
                    remaining: 500000,
                    status: "CLSD"
                },
                {
                    name: "งานก่อสร้างสถานีไฟฟ้าและฐานรากอุปกรณ์",
                    wbs: "I-260101-02",
                    budget: 18000000,
                    totalPaid: 6500000,
                    commitment: 8200000,
                    pr: 1200000,
                    po: 5000000,
                    gr: 1500000,
                    ir: 500000,
                    remaining: 3300000,
                    status: "REL"
                },
                {
                    name: "งานจัดหาและติดตั้งหม้อแปลงและอุปกรณ์ไฟฟ้า 115 kV",
                    wbs: "I-260101-03",
                    budget: 12000000,
                    totalPaid: 2000000,
                    commitment: 3500000,
                    pr: 500000,
                    po: 2000000,
                    gr: 800000,
                    ir: 200000,
                    remaining: 6500000,
                    status: "PREL"
                }
            ]
        }
    },
    {
        id: 2,
        name: "สถานีไฟฟ้ากาญจนบุรี 5 (ชั่วคราว)",
        type: "จ้างเหมา",
        contractor: "บริษัท รับเหมาไฟฟ้า จำกัด",
        supervisor: "นายสมชาย ใจดี",
        committee: "คณะกรรมการชุดที่ 2",
        duration: "7 เดือน",
        status: "อยู่ระหว่างก่อสร้าง",
        tasks: [
            { id: 201, name: "รื้อถอนสถานีไฟฟ้าสมุทรสาคร 10 (ชั่วคราว)", startDate: "2026-06-01", endDate: "2026-06-15", weight: 10, actual: 80 },
            { id: 202, name: "ปรับปรุงที่ดิน", startDate: "2026-06-16", endDate: "2026-06-30", weight: 5, actual: 10 },
            { id: 203, name: "ขนย้ายติดตั้งฐานราก", startDate: "2026-07-01", endDate: "2026-07-15", weight: 5, actual: 0 },
            { id: 204, name: "ขนย้ายอุปกรณ์ป้องกัน 115 kV และหม้อแปลงไฟฟ้ากำลัง", startDate: "2026-07-16", endDate: "2026-07-31", weight: 5, actual: 0 },
            { id: 205, name: "ติดตั้งอุปกรณ์ป้องกัน 115 kV และหม้อแปลงไฟฟ้ากำลัง", startDate: "2026-08-01", endDate: "2026-08-15", weight: 5, actual: 0 },
            { id: 206, name: "ปักเสาภายในสถานีไฟฟ้า", startDate: "2026-08-16", endDate: "2026-08-31", weight: 5, actual: 0 },
            { id: 207, name: "ติดตั้งระบบกราวด์กริด", startDate: "2026-09-01", endDate: "2026-09-15", weight: 5, actual: 0 },
            { id: 208, name: "ลงหินเบอร์ 2", startDate: "2026-09-16", endDate: "2026-09-30", weight: 5, actual: 0 },
            { id: 209, name: "ติดตั้ง Ladder", startDate: "2026-10-01", endDate: "2026-10-15", weight: 5, actual: 0 },
            { id: 210, name: "ลากสายและติดตั้งสาย Control cable", startDate: "2026-10-16", endDate: "2026-10-31", weight: 10, actual: 0 },
            { id: 211, name: "ลากสายและติดตั้งสาย Power cable", startDate: "2026-11-01", endDate: "2026-11-15", weight: 10, actual: 0 },
            { id: 212, name: "CSCS", startDate: "2026-11-16", endDate: "2026-11-30", weight: 10, actual: 0 },
            { id: 213, name: "Individual Test", startDate: "2026-12-01", endDate: "2026-12-07", weight: 5, actual: 0 },
            { id: 214, name: "Commisioning Test", startDate: "2026-12-08", endDate: "2026-12-14", weight: 5, actual: 0 },
            { id: 215, name: "Settind Relay / End to End Test", startDate: "2026-12-15", endDate: "2026-12-21", weight: 5, actual: 0 },
            { id: 216, name: "AC Withstand Test", startDate: "2026-12-22", endDate: "2026-12-31", weight: 5, actual: 0 }
        ],
        gallery: []
    }
];
// --- SUPABASE CONFIG ---
const SUPABASE_URL = 'https://maefwoecoortrvgbpmyp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZWZ3b2Vjb29ydHJ2Z2JwbXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjAwMTUsImV4cCI6MjEwMjE5NjAxNX0.oPDRRSfAo93CE4vHBErcxbBItJuN2OzWQrT3Yj6zmJo';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- GEMINI API KEY ---
// ไม่ควรนำ API Key มาใส่ใน Source Code เนื่องจากไม่ปลอดภัย ให้ผู้ใช้กรอกผ่านหน้าตั้งค่าแทน

let projects = [];

window.loadProjects = async function () {
    try {
        const { data, error } = await db.from('projects').select('*').order('id', { ascending: true });
        if (error) throw error;

        if (data && data.length > 0) {
            projects = data.map(dbProj => {
                let pType = 'จ้างเหมา';
                let pSupervisor = '';
                let pCommittee = '';
                let pDetails = dbProj.details || '';

                if (pDetails.includes('[TYPE:')) {
                    const match = pDetails.match(/\[TYPE:(.*?)\]/);
                    if (match) { pType = match[1]; pDetails = pDetails.replace(match[0], ''); }
                }
                if (pDetails.includes('[SUP:')) {
                    const match = pDetails.match(/\[SUP:(.*?)\]/);
                    if (match) { pSupervisor = match[1]; pDetails = pDetails.replace(match[0], ''); }
                }
                if (pDetails.includes('[COM:')) {
                    const match = pDetails.match(/\[COM:(.*?)\]/);
                    if (match) { pCommittee = match[1]; pDetails = pDetails.replace(match[0], ''); }
                }

                return {
                    id: dbProj.id,
                    name: dbProj.name,
                    status: dbProj.status,
                    budget: dbProj.budget,
                    duration: dbProj.duration,
                    startDate: dbProj.start_date,
                    endDate: dbProj.end_date,
                    contractor: dbProj.contractor,
                    supervisor: pSupervisor,
                    committee: pCommittee,
                    details: pDetails,
                    type: pType,
                    tasks: dbProj.tasks || [],
                    gallery: (dbProj.gallery && dbProj.gallery.length > 0) ? dbProj.gallery : (defaultProjects.find(dp => dp.id === dbProj.id)?.gallery || []),
                    disbursement: (dbProj.disbursement && dbProj.disbursement.items && dbProj.disbursement.items.length > 0) ? dbProj.disbursement : (defaultProjects.find(dp => dp.id === dbProj.id)?.disbursement || dbProj.disbursement || null)
                };
            });
        } else {
            projects = defaultProjects;
            const { data: sessionData } = await db.auth.getSession();
            if (sessionData && sessionData.session) {
                await saveProjects();
            } else {
                console.log('ไม่พบข้อมูลโครงการในฐานข้อมูล และยังไม่ได้เข้าสู่ระบบ ระบบจะใช้ข้อมูลจำลองแสดงผลชั่วคราว');
            }
        }
    } catch (e) {
        console.error('Supabase Load Error:', e);
        alert('โหลดข้อมูลจาก Supabase ไม่สำเร็จ: ' + (e.message || ''));
        renderAdminProjects();
    }
};

// --- User Management (Admin) ---
window.loadPendingUsers = async function () {
    try {
        const { data, error } = await db.from('user_roles').select('*').eq('role', 'pending');
        if (error) throw error;

        const tbody = document.getElementById('adminUserTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (data && data.length > 0) {
            data.forEach(user => {
                let tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.email || '-'}</td>
                    <td>${user.employee_id || '-'}</td>
                    <td><span class="status-badge" style="background-color: #FFF3E0; color: #E65100;">รออนุมัติ</span></td>
                    <td>
                        <button class="btn btn-primary" style="padding: 5px 10px; font-size: 12px;" onclick="approveUser('${user.id}')"><i class="fa-solid fa-check"></i> อนุมัติ (Editor)</button>
                        <button class="btn" style="background-color: #E74C3C; color: white; padding: 5px 10px; font-size: 12px;" onclick="rejectUser('${user.id}')"><i class="fa-solid fa-xmark"></i> ปฏิเสธ</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">ไม่มีผู้ใช้งานที่รออนุมัติ</td></tr>';
        }
    } catch (err) {
        console.error('Error loading pending users:', err);
    }
};

window.approveUser = async function (userId) {
    if (!confirm('ยืนยันการอนุมัติสิทธิ์เป็น Editor ให้ผู้ใชেন্ডนี้?')) return;
    try {
        const { error } = await db.from('user_roles').update({ role: 'editor' }).eq('id', userId);
        if (error) throw error;
        alert('อนุมัติสิทธิ์เรียบร้อยแล้ว');
        window.loadPendingUsers();
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }
};

window.rejectUser = async function (userId) {
    if (!confirm('ยืนยันการปฏิเสธและลบคำขอนี้?')) return;
    try {
        const { error } = await db.from('user_roles').delete().eq('id', userId);
        if (error) throw error;
        alert('ปฏิเสธคำขอเรียบร้อยแล้ว');
        window.loadPendingUsers();
    } catch (err) {
        alert('เกิดข้อผิดพลาด: ' + err.message);
    }
};

window.saveProjects = async function (projectId = null) {
    try {
        let targetProjects = projects;
        if (projectId) {
            targetProjects = projects.filter(p => p.id === projectId);
        }

        const dbProjects = targetProjects.map(p => ({
            id: p.id,
            name: p.name,
            status: p.status,
            budget: p.budget || '',
            duration: p.duration || '',
            start_date: p.startDate || null,
            end_date: p.endDate || null,
            contractor: p.contractor || '',
            details: `[TYPE:${p.type || 'จ้างเหมา'}][SUP:${p.supervisor || ''}][COM:${p.committee || ''}]${p.details || ''}`,
            tasks: p.tasks || [],
            gallery: p.gallery || [],
            disbursement: p.disbursement || null
        }));

        let err = null;
        if (projectId && dbProjects.length > 0) {
            const { error } = await db.from('projects').update(dbProjects[0]).eq('id', projectId);
            err = error;
        } else {
            const { error } = await db.from('projects').upsert(dbProjects);
            err = error;
        }

        if (err) throw err;
        return true;
    } catch (e) {
        console.error('Supabase Save Error:', e);
        alert('บันทึกข้อมูลไม่สำเร็จ: ' + (e.message || 'โปรดตรวจสอบการตั้งค่าฐานข้อมูล (RLS) หรือการเชื่อมต่ออินเทอร์เน็ต'));
        return false;
    }
}

function calculateProjectProgress(p) {
    if (!p.tasks || p.tasks.length === 0) return { plan: 0, actual: 0 };
    let totalWeight = 0;
    let totalActualWeighted = 0;
    let totalPlanWeighted = 0;
    const now = new Date();

    p.tasks.forEach(t => {
        const w = parseFloat(t.weight) || 0;
        totalWeight += w;
        totalActualWeighted += ((parseFloat(t.actual) || 0) * w) / 100;

        let planPercent = 0;
        if (t.startDate && t.endDate) {
            const start = new Date(t.startDate);
            const end = new Date(t.endDate);
            if (now >= end) {
                planPercent = 100;
            } else if (now > start) {
                const totalDuration = end - start;
                const elapsed = now - start;
                planPercent = (elapsed / totalDuration) * 100;
            }
        }
        totalPlanWeighted += (planPercent * w) / 100;
    });

    if (totalWeight === 0) return { plan: 0, actual: 0 };
    let actualProg = (totalActualWeighted / totalWeight) * 100;
    let planProg = (totalPlanWeighted / totalWeight) * 100;
    if (p.status === "แล้วเสร็จ") { planProg = 100; actualProg = 100; }
    // DELAY CHECK NOTIFICATION
    if ((planProg - actualProg) >= 10 && p.status !== "แล้วเสร็จ") {
        const lastWarn = sessionStorage.getItem(`warn_${p.id}`);
        const nowTime = new Date().getTime();
        if (!lastWarn || (nowTime - parseInt(lastWarn)) > 60000) { // warn once per minute max per project
            addAppNotification(`⚠️ แจ้งเตือน: โครงการ "${p.name}" ล่าช้ากว่าแผนงานเกิน 10% (Plan: ${planProg.toFixed(2)}%, Actual: ${actualProg.toFixed(2)}%)`, 'danger');
            sessionStorage.setItem(`warn_${p.id}`, nowTime);
        }
    }

    return { plan: planProg.toFixed(2), actual: actualProg.toFixed(2) };
}

const sCurveData = {
    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
    plan: [5, 10, 18, 28, 40, 55, 68, 78, 85, 92, 98, 100],
    actual: [5, 12, 17, 25, 38, 52, 65, 75, null, null, null, null]
};



document.addEventListener('DOMContentLoaded', async () => {

    // --- Mobile Menu Logic ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    // We moved nav to top, so on mobile we can just toggle top-nav display or let it be.
    // For now, we will just hide the mobile menu btn since we use top nav.
    if (mobileMenuBtn) {
        mobileMenuBtn.style.display = 'none';
    }

    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.top-nav li');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {

            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Hide all sections
            viewSections.forEach(section => section.classList.remove('active'));

            // Show target section
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Resize Chart and Calendar if their views are opened
            if (targetId === 'project-detail-view') {
                if (window.sChart) window.sChart.resize();
                if (window.projectCalendar) {
                    window.projectCalendar.refetchEvents();
                    window.projectCalendar.render();
                    window.projectCalendar.updateSize();
                }
            }
            if (targetId === 'calendar-view' && calendar) {
                calendar.refetchEvents();
                calendar.render();
            }
        });
    });

    // --- Role & Authentication Logic ---
    const roleAdminItems = document.querySelectorAll('.role-admin');
    const roleEditorItems = document.querySelectorAll('.role-editor');
    const currentUserRoleText = document.getElementById('currentUserRole');

    window.updateRole = function (role) {
        window.currentRole = role;

        if (role === 'viewer') {
            roleAdminItems.forEach(el => el.style.display = 'none');
            roleEditorItems.forEach(el => el.style.display = 'none');
            currentUserRoleText.textContent = 'Viewer (บุคคลทั่วไป)';
        } else if (role === 'editor') {
            roleAdminItems.forEach(el => el.style.display = 'none');
            roleEditorItems.forEach(el => el.style.display = '');
            currentUserRoleText.textContent = 'Editor (ผู้ควบคุมงาน)';
        } else if (role === 'admin') {
            roleAdminItems.forEach(el => el.style.display = '');
            roleEditorItems.forEach(el => el.style.display = '');
            currentUserRoleText.textContent = 'Admin (ผู้ดูแลระบบ)';
        }

        // If currently in Project Details Gallery view, refresh gallery to update Admin buttons
        if (document.getElementById('project-detail-view')?.classList.contains('active') && window.currentProjectViewData) {
            window.renderGalleryTab(window.currentProjectViewData, window.currentGalleryFilterTaskId || 'all');
        }
    };

    if (currentUserRoleText) {
        currentUserRoleText.style.cursor = 'pointer';
        currentUserRoleText.title = 'คลิกเพื่อสลับสิทธิ์ทดสอบ (Viewer / Editor / Admin)';
        currentUserRoleText.onclick = function () {
            const roles = ['viewer', 'editor', 'admin'];
            const nextRole = roles[(roles.indexOf(window.currentRole || 'viewer') + 1) % roles.length];
            window.updateRole(nextRole);
        };
    }

    window.switchAuthTab = function (tab) {
        const loginSec = document.getElementById('loginSection');
        const regSec = document.getElementById('registerSection');
        const forgotSec = document.getElementById('forgotPasswordSection');
        const resetSec = document.getElementById('resetPasswordSection');
        const btnLogin = document.getElementById('tabLogin');
        const btnReg = document.getElementById('tabRegister');

        loginSec.style.display = 'none';
        regSec.style.display = 'none';
        if (forgotSec) forgotSec.style.display = 'none';
        if (resetSec) resetSec.style.display = 'none';

        if (tab === 'login') {
            loginSec.style.display = 'block';
            btnLogin.style.background = 'var(--pea-purple)';
            btnLogin.style.color = 'white';
            btnReg.style.background = 'transparent';
            btnReg.style.color = 'var(--text-secondary)';
        } else if (tab === 'register') {
            regSec.style.display = 'block';
            btnReg.style.background = 'var(--pea-purple)';
            btnReg.style.color = 'white';
            btnLogin.style.background = 'transparent';
            btnLogin.style.color = 'var(--text-secondary)';
        } else if (tab === 'forgot' && forgotSec) {
            forgotSec.style.display = 'block';
            btnLogin.style.background = 'transparent';
            btnLogin.style.color = 'var(--text-secondary)';
            btnReg.style.background = 'transparent';
            btnReg.style.color = 'var(--text-secondary)';
        } else if (tab === 'reset' && resetSec) {
            resetSec.style.display = 'block';
            btnLogin.style.background = 'transparent';
            btnLogin.style.color = 'var(--text-secondary)';
            btnReg.style.background = 'transparent';
            btnReg.style.color = 'var(--text-secondary)';
        }
    };

    // Auth Form Listener
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginBtnSpinner');
        btn.textContent = 'กำลังเข้าสู่ระบบ...';
        btn.disabled = true;

        const { data, error } = await db.auth.signInWithPassword({ email, password });

        btn.textContent = 'เข้าสู่ระบบ';
        btn.disabled = false;

        if (error) {
            alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
            console.error('Login Error:', error);
        } else {
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('loginForm').reset();
            alert('เข้าสู่ระบบสำเร็จ!');
        }
    });

    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const empId = document.getElementById('regEmpId').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const btn = document.getElementById('regBtnSpinner');

        btn.textContent = 'กำลังสมัคร...';
        btn.disabled = true;

        // 1. Sign up user
        const { data, error } = await db.auth.signUp({ email, password });

        if (error) {
            alert('สมัครใช้งานไม่สำเร็จ: ' + error.message);
            console.error('Signup Error:', error);
            btn.textContent = 'สมัครใช้งาน';
            btn.disabled = false;
            return;
        }

        // 2. Insert into user_roles with pending status
        if (data && data.user) {
            const { error: insertError } = await db.from('user_roles').insert([
                { id: data.user.id, email: email, employee_id: empId, role: 'pending' }
            ]);

            if (insertError) {
                console.error('Error inserting user_roles:', insertError);
                alert('สมัครสำเร็จ แต่เกิดข้อผิดพลาดในการบันทึกข้อมูลคำขอ: ' + (insertError.message || JSON.stringify(insertError)));
            } else {
                alert('สมัครใช้งานสำเร็จ! กรุณารอ Admin อนุมัติสิทธิ์การใช้งาน (Pending Approval)');
                document.getElementById('loginModal').style.display = 'none';
                document.getElementById('registerForm').reset();
                window.logout(); // Ensure they are logged out until approved (optional, but good practice if email verification is off)
            }
        }

        btn.textContent = 'สมัครใช้งาน';
        btn.disabled = false;
    });

    // Forgot Password Form Listener
    document.getElementById('forgotPasswordForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        const btn = document.getElementById('forgotBtnSpinner');
        btn.textContent = 'กำลังส่ง...';
        btn.disabled = true;

        const { data, error } = await db.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname,
        });

        btn.textContent = 'ส่งลิงก์รีเซ็ตรหัสผ่าน';
        btn.disabled = false;

        if (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } else {
            alert('ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบกล่องข้อความ');
            window.switchAuthTab('login');
        }
    });

    // Reset Password Form Listener
    document.getElementById('resetPasswordForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const btn = document.getElementById('resetBtnSpinner');
        btn.textContent = 'กำลังบันทึก...';
        btn.disabled = true;

        const { data, error } = await db.auth.updateUser({ password: newPassword });

        btn.textContent = 'ยืนยันรหัสผ่านใหม่';
        btn.disabled = false;

        if (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } else {
            alert('ตั้งรหัสผ่านใหม่สำเร็จแล้ว');
            window.switchAuthTab('login');
        }
    });

    window.logout = async function () {
        await db.auth.signOut();
    };

    // Listen to Auth State Changes
    db.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event, session);
        if (event === 'PASSWORD_RECOVERY') {
            document.getElementById('loginModal').style.display = 'flex';
            window.switchAuthTab('reset');
            return;
        }

        if (session) {
            document.getElementById('btnLogin').style.display = 'none';
            document.getElementById('userInfo').style.display = 'block';
            document.getElementById('userEmailDisplay').textContent = session.user.email;

            // Get role from DB
            const { data, error } = await db.from('user_roles').select('role, employee_id').eq('id', session.user.id).single();
            console.log('Role fetch:', data, error);
            if (data && data.role) {
                window.currentUserEmpId = data.employee_id || '';
                const userRole = data.role.toLowerCase();

                if (userRole === 'pending') {
                    alert('บัญชีของคุณอยู่ระหว่างรอการอนุมัติ (Pending) จาก Admin ครับ');
                    await window.logout();
                    return;
                }

                window.updateRole(userRole);
                if (userRole === 'admin') {
                    console.log('เข้าสู่ระบบสำเร็จ! คุณได้รับสิทธิ์ระดับ Admin');
                    window.loadPendingUsers(); // Load users for admin
                } else if (userRole === 'editor') {
                    console.log('เข้าสู่ระบบสำเร็จ! คุณได้รับสิทธิ์ระดับ Editor');
                }
            } else {
                console.warn('Role not found or error, falling back to viewer');
                window.updateRole('viewer'); // fallback
            }
        } else {
            document.getElementById('btnLogin').style.display = 'block';
            document.getElementById('userInfo').style.display = 'none';
            if (typeof window.updateRole === 'function') {
                window.updateRole('viewer');
            }
        }
    });

    // --- Project View Mode & Search State ---
    window.currentProjectViewMode = localStorage.getItem('pcts_project_view_mode') || 'cards';
    window.dashboardSearchQuery = '';

    window.switchProjectView = function (mode) {
        window.currentProjectViewMode = mode;
        localStorage.setItem('pcts_project_view_mode', mode);

        const cardsSection = document.getElementById('projectCardsContainer');
        const tableContainer = document.getElementById('projectTableContainer');
        const btnCards = document.getElementById('btnViewCards');
        const btnTable = document.getElementById('btnViewTable');

        if (mode === 'cards') {
            if (cardsSection) cardsSection.style.display = 'block';
            if (tableContainer) tableContainer.style.display = 'none';
            if (btnCards) btnCards.classList.add('active');
            if (btnTable) btnTable.classList.remove('active');
        } else {
            if (cardsSection) cardsSection.style.display = 'none';
            if (tableContainer) tableContainer.style.display = 'flex';
            if (btnCards) btnCards.classList.remove('active');
            if (btnTable) btnTable.classList.add('active');
        }
    };

    window.handleDashboardSearch = function (query) {
        window.dashboardSearchQuery = (query || '').trim().toLowerCase();
        const clearBtn = document.getElementById('clearSearchBtn');
        if (clearBtn) {
            clearBtn.style.display = window.dashboardSearchQuery ? 'block' : 'none';
        }
        renderTables();
    };

    window.clearDashboardSearch = function () {
        const input = document.getElementById('dashboardSearchInput');
        if (input) input.value = '';
        window.handleDashboardSearch('');
    };

    window.currentDashboardFilter = 'all';
    window.currentStatusFilter = 'all';

    window.filterByStatus = function (status) {
        window.currentStatusFilter = status;
        const title = document.getElementById('dashboardTableTitle');
        if (title) {
            if (status === 'all') {
                title.innerText = window.currentDashboardFilter === 'all' ? 'รายการโครงการทั้งหมด' : 'รายการโครงการ: ' + window.currentDashboardFilter;
            } else {
                title.innerText = `รายการโครงการ (สถานะ: ${status})`;
            }
        }
        renderTables();
    };

    window.filterDashboard = function (type, event) {
        window.currentDashboardFilter = type;

        // Handle tab styles
        if (event && event.currentTarget) {
            const tabs = event.currentTarget.parentElement.getElementsByClassName("tablinks");
            for (let i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove("active");
            }
            event.currentTarget.classList.add("active");
        }

        // Update Title
        const title = document.getElementById('dashboardTableTitle');
        if (title) {
            if (type === 'all') title.innerText = 'รายการโครงการทั้งหมด';
            else title.innerText = 'รายการโครงการ: ' + type;
        }

        renderTables();
    };

    // --- Render Tables & Cards ---
    window.renderTables = function () {
        // Update Stats
        let total = projects.length;
        let completed = projects.filter(p => p.status === 'แล้วเสร็จ').length;
        let active = projects.filter(p => p.status === 'อยู่ระหว่างก่อสร้าง').length;
        let design = projects.filter(p => p.status === 'อยู่ระหว่างออกแบบประมาณการ').length;
        let budget = projects.filter(p => p.status === 'รองบประมาณ').length;
        let procurement = projects.filter(p => p.status === 'อยู่ระหว่างจัดจ้าง').length;

        const elTotal = document.getElementById('statTotalProjects');
        const elActive = document.getElementById('statActiveProjects');
        const elDesign = document.getElementById('statDesignProjects');
        const elBudget = document.getElementById('statBudgetProjects');
        const elProcurement = document.getElementById('statProcurementProjects');
        const elCompleted = document.getElementById('statCompletedProjects');

        if (elTotal) elTotal.innerText = `${total} โครงการ`;
        if (elActive) elActive.innerText = `${active} โครงการ`;
        if (elDesign) elDesign.innerText = `${design} โครงการ`;
        if (elBudget) elBudget.innerText = `${budget} โครงการ`;
        if (elProcurement) elProcurement.innerText = `${procurement} โครงการ`;
        if (elCompleted) elCompleted.innerText = `${completed} โครงการ`;

        // Filter projects by type
        let filteredProjects = projects;
        if (window.currentDashboardFilter && window.currentDashboardFilter !== 'all') {
            filteredProjects = filteredProjects.filter(p => (p.type || 'จ้างเหมา') === window.currentDashboardFilter);
        }

        // Filter projects by status (from stat cards)
        if (window.currentStatusFilter && window.currentStatusFilter !== 'all') {
            filteredProjects = filteredProjects.filter(p => p.status === window.currentStatusFilter);
        }

        // Instant Search filter
        if (window.dashboardSearchQuery) {
            const q = window.dashboardSearchQuery;
            filteredProjects = filteredProjects.filter(p => {
                const name = (p.name || '').toLowerCase();
                const contractor = (p.contractor || '').toLowerCase();
                const supervisor = (p.supervisor || '').toLowerCase();
                const committee = (p.committee || '').toLowerCase();
                const status = (p.status || '').toLowerCase();
                const type = (p.type || '').toLowerCase();
                return name.includes(q) || contractor.includes(q) || supervisor.includes(q) || committee.includes(q) || status.includes(q) || type.includes(q);
            });
        }

        // Render Project Cards Grid
        const cardsGrid = document.getElementById('projectCardsGrid');
        const noFoundMsg = document.getElementById('noProjectFoundMessage');
        if (cardsGrid) cardsGrid.innerHTML = '';
        if (noFoundMsg) noFoundMsg.style.display = filteredProjects.length === 0 ? 'block' : 'none';

        // Render Dashboard Table
        const dashboardTbody = document.getElementById('projectTableBody');
        if (dashboardTbody) dashboardTbody.innerHTML = '';

        filteredProjects.forEach(p => {
            const progress = calculateProjectProgress(p);
            p.plan = progress.plan;
            p.actual = progress.actual;

            let disbPct = 0;
            let budgetFormatted = '-';
            let paidFormatted = '-';
            if (p.disbursement && p.disbursement.budget > 0) {
                disbPct = ((p.disbursement.totalPaid / p.disbursement.budget) * 100).toFixed(1);
                budgetFormatted = Number(p.disbursement.budget).toLocaleString();
                paidFormatted = Number(p.disbursement.totalPaid).toLocaleString();
            }

            const statusClass = window.getStatusBadgeClass(p.status);
            const projectType = p.type || 'จ้างเหมา';
            const typeClass = projectType === 'ดำเนินการเอง' ? 'project-type-self' : 'project-type-contract';
            const typeIcon = projectType === 'ดำเนินการเอง' ? 'fa-solid fa-users-gear' : 'fa-solid fa-file-contract';

            // Variance Calculation
            const planNum = parseFloat(p.plan) || 0;
            const actNum = parseFloat(p.actual) || 0;
            const diff = (actNum - planNum).toFixed(1);

            let varianceClass = 'variance-ontrack';
            let varianceIcon = 'fa-solid fa-check';
            let varianceText = 'ตรงตามแผนงาน';

            if (p.status === 'แล้วเสร็จ') {
                varianceClass = 'variance-ahead';
                varianceIcon = 'fa-solid fa-circle-check';
                varianceText = 'แล้วเสร็จ 100%';
            } else if (diff > 0) {
                varianceClass = 'variance-ahead';
                varianceIcon = 'fa-solid fa-arrow-trend-up';
                varianceText = `+${diff}% เร็วกว่าแผน`;
            } else if (diff < 0) {
                varianceClass = 'variance-behind';
                varianceIcon = 'fa-solid fa-arrow-trend-down';
                varianceText = `${diff}% ช้ากว่าแผน`;
            }

            const taskCount = p.tasks ? p.tasks.length : 0;
            const photoCount = p.gallery ? p.gallery.length : 0;
            const durationText = p.duration || (p.startDate && p.endDate ? `${p.startDate} ถึง ${p.endDate}` : '-');

            // 1. Build & Append Card
            if (cardsGrid) {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.innerHTML = `
                    <div class="project-card-header">
                        <span class="project-type-badge ${typeClass}">
                            <i class="${typeIcon}"></i> ${projectType}
                        </span>
                        <span class="project-status-pill status-badge ${statusClass}">
                            <span class="status-dot" style="background: currentColor;"></span>
                            ${p.status}
                        </span>
                    </div>
                    <div class="project-card-body">
                        <h3 class="project-card-title" onclick="viewProjectDetails(${p.id})" title="${p.name}">
                            ${p.name}
                        </h3>
                        <div class="project-meta-grid">
                            <div class="meta-item">
                                <span class="meta-item-label"><i class="fa-solid fa-building"></i> ผู้รับเหมา</span>
                                <span class="meta-item-value" title="${p.contractor || '-'}">${p.contractor || '-'}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-item-label"><i class="fa-solid fa-user-tie"></i> ผู้ควบคุมงาน</span>
                                <span class="meta-item-value" title="${p.supervisor || '-'}">${p.supervisor || '-'}</span>
                            </div>
                            <div class="meta-item" style="grid-column: span 2;">
                                <span class="meta-item-label"><i class="fa-regular fa-calendar"></i> ระยะเวลา</span>
                                <span class="meta-item-value">${durationText}</span>
                            </div>
                        </div>
                        <div class="card-progress-section">
                            <div class="card-progress-header">
                                <span class="progress-title">ความก้าวหน้าโครงการ</span>
                                <span class="variance-badge ${varianceClass}">
                                    <i class="${varianceIcon}"></i> ${varianceText}
                                </span>
                            </div>
                            <div class="card-dual-progress" title="แผนงาน: ${p.plan}% | ผลงานจริง: ${p.actual}%">
                                <div class="card-progress-plan" style="width: ${Math.min(100, planNum)}%;"></div>
                                <div class="card-progress-actual" style="width: ${Math.min(100, actNum)}%;"></div>
                            </div>
                            <div class="card-progress-labels">
                                <span><span class="chip-dash" style="width:8px;height:8px;border-radius:2px;background:#f59e0b;display:inline-block;vertical-align:middle;margin-right:4px;"></span> แผนงาน: <strong>${p.plan}%</strong></span>
                                <span><span class="chip-dot" style="width:8px;height:8px;border-radius:50%;background:var(--pea-purple);display:inline-block;vertical-align:middle;margin-right:4px;"></span> ผลจริง: <strong style="color:var(--pea-purple);">${p.actual}%</strong></span>
                            </div>
                            <div class="card-disb-wrapper">
                                <div class="card-disb-header">
                                    <span style="color:#64748b;"><i class="fa-solid fa-coins" style="color:#10b981;"></i> เบิกจ่าย: <strong>${disbPct}%</strong></span>
                                    <span style="font-size:10px;color:#94a3b8;">${budgetFormatted !== '-' ? budgetFormatted + ' บาท' : 'ไม่มีข้อมูลงบ'}</span>
                                </div>
                                <div class="card-disb-track">
                                    <div class="card-disb-fill" style="width: ${Math.min(100, parseFloat(disbPct) || 0)}%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="project-card-footer">
                        <div class="footer-meta-chips">
                            <span><i class="fa-solid fa-list-check"></i> ${taskCount} งาน</span>
                            <span><i class="fa-regular fa-images"></i> ${photoCount} รูป</span>
                        </div>
                        <button class="btn-card-details" onclick="viewProjectDetails(${p.id})">
                            ดูรายละเอียด <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                `;
                cardsGrid.appendChild(card);
            }

            // 2. Build & Append Table Row
            if (dashboardTbody) {
                const tr = document.createElement('tr');
                const tableTypeClass = projectType === 'ดำเนินการเอง' ? 'color: #2980b9; font-weight: 600;' : 'color: #e67e22; font-weight: 600;';
                tr.innerHTML = `
                    <td><strong>${p.name}</strong></td>
                    <td><span style="${tableTypeClass}">${projectType}</span></td>
                    <td>${p.contractor}</td>
                    <td>${p.supervisor || '-'}</td>
                    <td><span class="status-badge ${statusClass}">${p.status}</span></td>
                    <td style="min-width: 180px;">
                        <div style="display:flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                            <span style="color: #7f8c8d;">แผน: ${p.plan}%</span>
                            <span style="color: #3498db; font-weight: 600;">ทำได้: ${p.actual}%</span>
                        </div>
                        <div class="progress-bar-container" style="margin-bottom: 6px;">
                            <div class="progress-bar-plan" style="width: ${p.plan}%;"></div>
                            <div class="progress-bar-actual" style="width: ${p.actual}%;"></div>
                        </div>
                        
                        <div style="display:flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                            <span style="color: #27ae60; font-weight: 600;">เบิกจ่าย: ${disbPct}%</span>
                        </div>
                        <div class="progress-bar-container" style="background-color: #ecf0f1; height: 5px;">
                            <div class="progress-bar-actual" style="width: ${disbPct}%; background-color: #2ecc71;"></div>
                        </div>
                    </td>
                    <td><button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="viewProjectDetails(${p.id})">ดูรายละเอียด</button></td>
                `;
                dashboardTbody.appendChild(tr);
            }
        });

        // Apply active view mode
        window.switchProjectView(window.currentProjectViewMode);

        // Render Admin Table
        const adminTbody = document.getElementById('adminProjectTableBody');
        if (adminTbody) {
            adminTbody.innerHTML = '';
            projects.forEach(p => {
                const tr = document.createElement('tr');
                const statusClass = window.getStatusBadgeClass(p.status);
                const projectType = p.type || 'จ้างเหมา';
                const typeClass = projectType === 'ดำเนินการเอง' ? 'color: #2980b9; font-weight: 600;' : 'color: #e67e22; font-weight: 600;';
                tr.innerHTML = `
                    <td><strong>${p.name}</strong></td>
                    <td><span style="${typeClass}">${projectType}</span></td>
                    <td>${p.contractor}</td>
                    <td>${p.supervisor || '-'}</td>
                    <td><span class="status-badge ${statusClass}">${p.status}</span></td>
                    <td>
                        <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;" onclick="openProjectModal(${p.id})"><i class="fa-solid fa-edit"></i></button>
                        <button class="btn btn-primary" style="padding: 5px 10px; font-size: 12px; background-color: #E74C3C;" onclick="deleteProject(${p.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                adminTbody.appendChild(tr);
            });
        }

        // Populate Project Selects
        const adminSelect = document.getElementById('adminProjectSelect');
        const editorSelect = document.getElementById('editorProjectSelect');
        if (adminSelect && editorSelect) {
            adminSelect.innerHTML = '<option value="" disabled selected>-- เลือกโครงการ --</option>';
            editorSelect.innerHTML = '<option value="" disabled selected>-- เลือกโครงการ --</option>';
            projects.forEach(p => {
                const opt1 = document.createElement('option');
                opt1.value = p.id;
                opt1.text = p.name;
                adminSelect.appendChild(opt1);

                const opt2 = document.createElement('option');
                opt2.value = p.id;
                opt2.text = p.name;
                editorSelect.appendChild(opt2);
            });
        }
    };

    // Load projects from Supabase before rendering
    await window.loadProjects();
    renderTables();

    // --- S-Curve Chart.js Initialization (Modern Gradient & Enhanced Tooltips) ---
    const sCanvas = document.getElementById('sCurveChart');
    const ctx = sCanvas.getContext('2d');

    // Create Linear Gradients
    const gradPurple = ctx.createLinearGradient(0, 0, 0, 420);
    gradPurple.addColorStop(0, 'rgba(116, 44, 129, 0.35)');
    gradPurple.addColorStop(0.7, 'rgba(116, 44, 129, 0.06)');
    gradPurple.addColorStop(1, 'rgba(116, 44, 129, 0.0)');

    const gradGold = ctx.createLinearGradient(0, 0, 0, 420);
    gradGold.addColorStop(0, 'rgba(243, 156, 18, 0.22)');
    gradGold.addColorStop(0.7, 'rgba(243, 156, 18, 0.04)');
    gradGold.addColorStop(1, 'rgba(243, 156, 18, 0.0)');

    window.sChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sCurveData.labels,
            datasets: [
                {
                    label: 'แผนงาน (Plan) %',
                    data: sCurveData.plan,
                    borderColor: '#F39C12', // PEA Gold
                    backgroundColor: gradGold,
                    borderWidth: 2.8,
                    borderDash: [5, 4],
                    fill: true,
                    tension: 0.38,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#F39C12',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                },
                {
                    label: 'ผลงานจริง (Actual) %',
                    data: sCurveData.actual,
                    borderColor: '#742C81', // PEA Purple
                    backgroundColor: gradPurple,
                    borderWidth: 3.2,
                    fill: true,
                    tension: 0.38,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#742C81',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(226, 232, 240, 0.7)',
                        borderDash: [3, 3]
                    },
                    ticks: {
                        callback: function (val) { return val + '%'; },
                        font: { family: 'Prompt', size: 11 }
                    },
                    title: { display: true, text: 'ความก้าวหน้าสะสม (%)', font: { family: 'Prompt', weight: '500', size: 12 } }
                },
                x: {
                    grid: {
                        color: 'rgba(226, 232, 240, 0.4)'
                    },
                    ticks: {
                        font: { family: 'Prompt', size: 11 }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // We use our custom modern chips ribbon
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.92)',
                    titleFont: { family: 'Prompt', size: 13, weight: '600' },
                    bodyFont: { family: 'Sarabun', size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    boxPadding: 4,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2) + '%';
                            }
                            return label;
                        },
                        afterBody: function (contexts) {
                            if (contexts.length >= 2) {
                                const planVal = contexts[0].parsed.y;
                                const actVal = contexts[1].parsed.y;
                                if (actVal !== null && !isNaN(actVal)) {
                                    const diff = (actVal - planVal).toFixed(2);
                                    const icon = diff >= 0 ? '▲ +' : '▼ ';
                                    const status = diff >= 0 ? 'เร็วกว่าแผน' : 'ล่าช้ากว่าแผน';
                                    return `ผลต่าง: ${icon}${diff}% (${status})`;
                                }
                            }
                            return '';
                        }
                    }
                }
            }
        }
    });



    // --- FullCalendar Initialization ---
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: function (fetchInfo, successCallback, failureCallback) {
            let dynamicEvents = [];
            projects.forEach(p => {
                if (p.gallery) {
                    let grouped = {};
                    p.gallery.forEach(g => {
                        if (!grouped[g.date]) {
                            grouped[g.date] = {
                                title: `อัปเดต: ${p.name}`,
                                start: g.date,
                                description: g.desc,
                                color: '#742C81',
                                imageUrls: []
                            };
                        } else {
                            if (g.desc && grouped[g.date].description !== g.desc) {
                                grouped[g.date].description += '<br>' + g.desc;
                            }
                        }
                        if (g.url) {
                            grouped[g.date].imageUrls.push(g.url);
                        }
                    });
                    Object.values(grouped).forEach(ev => dynamicEvents.push(ev));
                }
            });
            successCallback(dynamicEvents);
        },
        themeSystem: 'standard',
        eventClick: function (info) {
            // Show modal with details
            const props = info.event.extendedProps;
            window.currentCalendarImages = props.imageUrls || [];

            document.getElementById('modalDate').innerText = 'ข้อมูลวันที่: ' + info.event.startStr.split('T')[0];

            let html = `
                <p><strong>หัวข้อ:</strong> ${info.event.title}</p>
                <p><strong>รายละเอียด:</strong> ${props.description || '-'}</p>
            `;

            if (props.imageUrls && props.imageUrls.length > 0) {
                html += `<div style="display: flex; gap: 10px; overflow-x: auto; margin-top: 15px; padding-bottom: 10px;">`;
                props.imageUrls.forEach((url, idx) => {
                    html += `<img src="${url}" style="height: 200px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" onclick="window.openLightbox(${idx})">`;
                });
                html += `</div>`;
            }

            document.getElementById('modalContent').innerHTML = html;
            document.getElementById('calendarModal').style.display = 'flex';
        }
    });
    // --- Project-Specific Calendar Initialization ---
    const pcEl = document.getElementById('projectCalendar');
    window.projectCalendar = new FullCalendar.Calendar(pcEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: function (fetchInfo, successCallback, failureCallback) {
            let dynamicEvents = [];
            if (window.currentProjectViewData) {
                // Add WBS Tasks
                if (window.currentProjectViewData.tasks) {
                    window.currentProjectViewData.tasks.forEach(t => {
                        if (t.startDate && t.endDate) {
                            let ed = new Date(t.endDate);
                            ed.setDate(ed.getDate() + 1);
                            let edStr = ed.toISOString().split('T')[0];

                            dynamicEvents.push({
                                title: `แผนงาน: ${t.name}`,
                                start: t.startDate,
                                end: edStr,
                                color: '#F39C12', // Gold color for tasks
                                description: `ความก้าวหน้าจริง: ${t.actual || 0}%`,
                                isTask: true
                            });
                        }
                    });
                }

                // Add Gallery Updates
                if (window.currentProjectViewData.gallery) {
                    let grouped = {};
                    window.currentProjectViewData.gallery.forEach(g => {
                        if (!grouped[g.date]) {
                            grouped[g.date] = {
                                title: `อัปเดต: ${window.currentProjectViewData.name}`,
                                start: g.date,
                                description: g.desc,
                                color: '#742C81',
                                imageUrls: []
                            };
                        } else {
                            if (g.desc && grouped[g.date].description !== g.desc) {
                                grouped[g.date].description += '<br>' + g.desc;
                            }
                        }
                        if (g.url) {
                            grouped[g.date].imageUrls.push(g.url);
                        }
                    });
                    Object.values(grouped).forEach(ev => dynamicEvents.push(ev));
                }
            }
            successCallback(dynamicEvents);
        },
        themeSystem: 'standard',
        eventClick: function (info) {
            const props = info.event.extendedProps;

            if (props.isTask) {
                document.getElementById('modalDate').innerText = 'ข้อมูลแผนงาน: ' + info.event.title.replace('แผนงาน: ', '');
                let html = `<p><strong>รายละเอียด:</strong> ${props.description || '-'}</p>`;
                html += `<p><strong>วันที่เริ่ม:</strong> ${info.event.startStr.split('T')[0]}</p>`;
                let endD = info.event.end ? new Date(info.event.end) : null;
                if (endD) {
                    endD.setDate(endD.getDate() - 1);
                    html += `<p><strong>วันที่สิ้นสุด:</strong> ${endD.toISOString().split('T')[0]}</p>`;
                }
                document.getElementById('modalContent').innerHTML = html;
                document.getElementById('calendarModal').style.display = 'flex';
                return;
            }

            window.currentCalendarImages = props.imageUrls || [];
            document.getElementById('modalDate').innerText = 'ข้อมูลวันที่: ' + info.event.startStr.split('T')[0];
            let html = `<p><strong>หัวข้อ:</strong> ${info.event.title}</p><p><strong>รายละเอียด:</strong> ${props.description || '-'}</p>`;
            if (props.imageUrls && props.imageUrls.length > 0) {
                html += `<div style="display: flex; gap: 10px; overflow-x: auto; margin-top: 15px; padding-bottom: 10px;">`;
                props.imageUrls.forEach((url, idx) => {
                    html += `<img src="${url}" style="height: 200px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" onclick="window.openLightbox(${idx})">`;
                });
                html += `</div>`;
            }
            document.getElementById('modalContent').innerHTML = html;
            document.getElementById('calendarModal').style.display = 'flex';
        }
    });
    // Render initially even if hidden, will be resized later
    if (window.projectCalendar) window.projectCalendar.render();

    window.openLightbox = function (startIndex) {
        if (!window.currentCalendarImages || window.currentCalendarImages.length === 0) return;
        const w = window.open("");
        const imagesJson = JSON.stringify(window.currentCalendarImages);
        w.document.write(`
            <html>
                <head>
                    <title>Image Viewer</title>
                    <style>
                        body { margin:0; background:#2c3e50; display:flex; justify-content:center; align-items:center; height:100vh; overflow:hidden; font-family: sans-serif; color: white; }
                        img { max-width:90%; max-height:90%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); user-select: none; }
                        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; padding: 20px 15px; cursor: pointer; font-size: 24px; border-radius: 4px; transition: 0.2s; }
                        .nav-btn:hover { background: rgba(0,0,0,0.8); }
                        .nav-prev { left: 20px; }
                        .nav-next { right: 20px; }
                        .counter { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.5); padding: 5px 15px; border-radius: 20px; font-size: 14px; }
                        .close-btn { position: absolute; top: 20px; right: 20px; background: rgba(231, 76, 60, 0.8); color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 16px; transition: 0.2s; }
                        .close-btn:hover { background: rgba(231, 76, 60, 1); }
                    </style>
                </head>
                <body>
                    <div class="counter" id="counter"></div>
                    <button class="close-btn" onclick="window.close()">ปิดหน้าต่าง (Esc)</button>
                    <button class="nav-btn nav-prev" onclick="changeImage(-1)">&#10094;</button>
                    <img id="mainImage" src="">
                    <button class="nav-btn nav-next" onclick="changeImage(1)">&#10095;</button>
                    
                    <script>
                        const images = ${imagesJson};
                        let currentIndex = ${startIndex};
                        const imgEl = document.getElementById('mainImage');
                        const counterEl = document.getElementById('counter');
                        
                        function updateImage() {
                            imgEl.src = images[currentIndex];
                            counterEl.innerText = (currentIndex + 1) + " / " + images.length;
                        }
                        
                        function changeImage(dir) {
                            currentIndex += dir;
                            if (currentIndex < 0) currentIndex = images.length - 1;
                            if (currentIndex >= images.length) currentIndex = 0;
                            updateImage();
                        }
                        
                        document.addEventListener('keydown', function(e) {
                            if (e.key === 'ArrowLeft') changeImage(-1);
                            if (e.key === 'ArrowRight') changeImage(1);
                            if (e.key === 'Escape') window.close();
                        });
                        
                        updateImage();
                    </script>
                </body>
            </html>
        `);
    };

    // --- Modal Logic ---
    const calModal = document.getElementById('calendarModal');
    const projModal = document.getElementById('projectModal');

    // Close calendar modal
    const calClose = calModal ? calModal.querySelector('.close-modal') : null;
    if (calClose) {
        calClose.onclick = function () {
            calModal.style.display = "none";
        }
    }

    // Global click outside to close
    window.onclick = function (event) {
        if (event.target === calModal) {
            calModal.style.display = "none";
        }
        if (event.target === projModal) {
            projModal.style.display = "none";
        }
        const printModal = document.getElementById('printModal');
        if (event.target === printModal) {
            printModal.style.display = "none";
        }
    }

    // --- Image Upload Preview (Editor View) ---
    const fileInput = document.querySelector('.file-input');
    const previewArea = document.getElementById('imagePreviewArea');

    fileInput.addEventListener('change', function () {
        previewArea.innerHTML = ''; // clear existing
        if (this.files) {
            Array.from(this.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'preview-img';
                    previewArea.appendChild(img);
                }
                reader.readAsDataURL(file);
            });
        }
    });

});

window.updateSCurve = function (p) {
    if (!window.sChart) return;

    // S-Curve KPI Elements
    const elPlanKpi = document.getElementById('scurvePlanKpi');
    const elActualKpi = document.getElementById('scurveActualKpi');
    const elVarKpi = document.getElementById('scurveVarianceKpi');
    const elHealthKpi = document.getElementById('scurveHealthKpi');
    const elVarIcon = document.getElementById('scurveVarianceIcon');
    const elHealthIcon = document.getElementById('scurveHealthIcon');

    // Find min and max dates
    let minDate = new Date("2099-01-01");
    let maxDate = new Date("2000-01-01");

    if (!p.tasks || p.tasks.length === 0) {
        window.sChart.data.labels = [];
        window.sChart.data.datasets[0].data = [];
        window.sChart.data.datasets[1].data = [];
        window.sChart.update();
        if (elPlanKpi) elPlanKpi.innerText = '0.00%';
        if (elActualKpi) elActualKpi.innerText = '0.00%';
        if (elVarKpi) elVarKpi.innerText = '0.00%';
        if (elHealthKpi) elHealthKpi.innerText = 'ไม่มีข้อมูลแผนงาน';
        return;
    }

    p.tasks.forEach(t => {
        if (t.startDate) {
            let d = new Date(t.startDate);
            if (d < minDate) minDate = d;
        }
        if (t.endDate) {
            let d = new Date(t.endDate);
            if (d > maxDate) maxDate = d;
        }
    });

    if (minDate > maxDate) {
        window.sChart.data.labels = [];
        window.sChart.data.datasets[0].data = [];
        window.sChart.data.datasets[1].data = [];
        window.sChart.update();
        return;
    }

    // Generate months
    let labels = [];
    let planData = [];
    let actualData = [];

    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    const now = new Date();

    let totalWeight = 0;
    p.tasks.forEach(t => totalWeight += parseFloat(t.weight) || 0);
    if (totalWeight === 0) totalWeight = 100;

    let currentActualProj = 0;
    p.tasks.forEach(t => currentActualProj += ((parseFloat(t.actual) || 0) * (parseFloat(t.weight) || 0)) / 100);
    currentActualProj = (currentActualProj / totalWeight) * 100;

    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    let isPastOrCurrentMonth = true;

    while (current <= endMonth) {
        labels.push(thaiMonths[current.getMonth()] + " " + (current.getFullYear() + 543).toString().substring(2));
        let eom = new Date(current.getFullYear(), current.getMonth() + 1, 0);

        let monthPlan = 0;
        p.tasks.forEach(t => {
            if (!t.startDate || !t.endDate) return;
            let start = new Date(t.startDate);
            let end = new Date(t.endDate);
            let w = parseFloat(t.weight) || 0;

            if (eom >= end) monthPlan += w;
            else if (eom > start) monthPlan += ((eom - start) / (end - start)) * w;
        });

        planData.push(((monthPlan / totalWeight) * 100).toFixed(2));

        if (isPastOrCurrentMonth) {
            if (current.getFullYear() === now.getFullYear() && current.getMonth() === now.getMonth()) {
                actualData.push(currentActualProj.toFixed(2));
                isPastOrCurrentMonth = false;
            } else if (current > now) {
                isPastOrCurrentMonth = false;
                actualData.push(null);
            } else {
                let nowPlan = 0;
                p.tasks.forEach(t => {
                    if (!t.startDate || !t.endDate) return;
                    let start = new Date(t.startDate);
                    let end = new Date(t.endDate);
                    let w = parseFloat(t.weight) || 0;
                    if (now >= end) nowPlan += w;
                    else if (now > start) nowPlan += ((now - start) / (end - start)) * w;
                });
                nowPlan = (nowPlan / totalWeight) * 100;
                let ratio = nowPlan > 0 ? currentActualProj / nowPlan : 0;
                let estimatedActual = ((monthPlan / totalWeight) * 100) * ratio;
                if (estimatedActual > currentActualProj) estimatedActual = currentActualProj;
                actualData.push(estimatedActual.toFixed(2));
            }
        } else {
            actualData.push(null);
        }
        current.setMonth(current.getMonth() + 1);
    }

    if (p.status === "แล้วเสร็จ") {
        actualData = planData.map(d => d);
    }

    // Update Chart datasets
    window.sChart.data.labels = labels;
    window.sChart.data.datasets[0].data = planData;
    window.sChart.data.datasets[1].data = actualData;
    window.sChart.update();

    // Update S-Curve KPI Ribbon
    const prog = calculateProjectProgress(p);
    const planVal = parseFloat(prog.plan) || 0;
    const actVal = parseFloat(prog.actual) || 0;
    const diff = (actVal - planVal).toFixed(2);

    if (elPlanKpi) elPlanKpi.innerText = `${planVal.toFixed(2)}%`;
    if (elActualKpi) elActualKpi.innerText = `${actVal.toFixed(2)}%`;
    if (elVarKpi) {
        if (p.status === 'แล้วเสร็จ') {
            elVarKpi.innerText = '100% (แล้วเสร็จ)';
            elVarKpi.style.color = '#27ae60';
        } else if (diff > 0) {
            elVarKpi.innerText = `+${diff}% เร็วกว่าแผน`;
            elVarKpi.style.color = '#27ae60';
        } else if (diff < 0) {
            elVarKpi.innerText = `${diff}% ช้ากว่าแผน`;
            elVarKpi.style.color = '#e74c3c';
        } else {
            elVarKpi.innerText = '0.00% ตรงตามแผน';
            elVarKpi.style.color = '#2980b9';
        }
    }

    if (elHealthKpi) {
        if (p.status === 'แล้วเสร็จ') {
            elHealthKpi.innerText = 'แล้วเสร็จสมบูรณ์';
            elHealthKpi.style.color = '#27ae60';
            if (elHealthIcon) { elHealthIcon.style.background = 'rgba(46, 204, 113, 0.15)'; elHealthIcon.style.color = '#27ae60'; }
            if (elVarIcon) { elVarIcon.style.background = 'rgba(46, 204, 113, 0.15)'; elVarIcon.style.color = '#27ae60'; }
        } else if (diff >= 0) {
            elHealthKpi.innerText = 'ปกติ (ตาม/เร็วกว่าแผน)';
            elHealthKpi.style.color = '#27ae60';
            if (elHealthIcon) { elHealthIcon.style.background = 'rgba(46, 204, 113, 0.15)'; elHealthIcon.style.color = '#27ae60'; }
            if (elVarIcon) { elVarIcon.style.background = 'rgba(46, 204, 113, 0.15)'; elVarIcon.style.color = '#27ae60'; }
        } else if (diff >= -10) {
            elHealthKpi.innerText = 'เฝ้าระวัง (ล่าช้า < 10%)';
            elHealthKpi.style.color = '#f39c12';
            if (elHealthIcon) { elHealthIcon.style.background = 'rgba(243, 156, 18, 0.15)'; elHealthIcon.style.color = '#f39c12'; }
            if (elVarIcon) { elVarIcon.style.background = 'rgba(243, 156, 18, 0.15)'; elVarIcon.style.color = '#f39c12'; }
        } else {
            elHealthKpi.innerText = 'วิกฤต (ล่าช้า > 10%)';
            elHealthKpi.style.color = '#e74c3c';
            if (elHealthIcon) { elHealthIcon.style.background = 'rgba(231, 76, 60, 0.15)'; elHealthIcon.style.color = '#e74c3c'; }
            if (elVarIcon) { elVarIcon.style.background = 'rgba(231, 76, 60, 0.15)'; elVarIcon.style.color = '#e74c3c'; }
        }
    }
};

// Global function to navigate from card/table button
window.viewProjectDetails = function (projectId) {
    const p = projects.find(proj => proj.id === projectId);
    if (p) {
        document.getElementById('detailProjectTitle').innerText = p.name;
        document.getElementById('detailProjectInfo').innerHTML = `
            <strong>ผู้รับเหมา:</strong> ${p.contractor} | 
            <strong>ผู้ควบคุมงาน:</strong> ${p.supervisor || '-'} | 
            <strong>กรรมการตรวจรับ:</strong> ${p.committee || '-'} | 
            <strong>ระยะเวลา:</strong> ${p.duration || '-'} | 
            <strong>สถานะ:</strong> ${p.status}
        `;

        const tbody = document.getElementById('detailTaskTableBody');
        tbody.innerHTML = '';
        if (p.tasks && p.tasks.length > 0) {
            p.tasks.forEach(t => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${t.name}</strong>${t.description ? `<br><span style="font-size: 12px; color: #7f8c8d;">${t.description}</span>` : ''}</td>
                    <td>${t.startDate} ถึง ${t.endDate}</td>
                    <td>${t.weight}%</td>
                    <td>
                        <div style="font-size: 12px; margin-bottom: 3px;">${t.actual}%</div>
                        <div class="progress-bar-container" style="height: 6px;">
                            <div class="progress-bar-actual" style="width: ${t.actual}%;"></div>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">ยังไม่มีข้อมูลแผนงานย่อย</td></tr>';
        }

        // --- Render Gantt Chart & KPI Ribbon ---
        const allTasks = p.tasks || [];
        const completedTasks = allTasks.filter(t => (parseFloat(t.actual) || 0) >= 100).length;
        const inProgressTasks = allTasks.filter(t => (parseFloat(t.actual) || 0) > 0 && (parseFloat(t.actual) || 0) < 100).length;
        const pendingTasks = allTasks.filter(t => (parseFloat(t.actual) || 0) <= 0).length;

        const elGanttTotal = document.getElementById('ganttTotalTasks');
        const elGanttCompleted = document.getElementById('ganttCompletedTasks');
        const elGanttInProgress = document.getElementById('ganttInProgressTasks');
        const elGanttPending = document.getElementById('ganttPendingTasks');

        if (elGanttTotal) elGanttTotal.innerText = allTasks.length;
        if (elGanttCompleted) elGanttCompleted.innerText = completedTasks;
        if (elGanttInProgress) elGanttInProgress.innerText = inProgressTasks;
        if (elGanttPending) elGanttPending.innerText = pendingTasks;

        const ganttContainer = document.getElementById('ganttChart');
        if (allTasks.length > 0) {
            const ganttTasks = allTasks.filter(t => t.startDate && t.endDate).map(t => ({
                id: `Task_${t.id}`,
                name: t.name,
                start: t.startDate,
                end: t.endDate,
                progress: t.actual || 0
            }));

            if (ganttTasks.length > 0) {
                try {
                    ganttContainer.innerHTML = '';
                    window.currentGantt = new Gantt("#ganttChart", ganttTasks, {
                        header_height: 50,
                        view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                        bar_height: 28,
                        bar_corner_radius: 6,
                        arrow_curve: 5,
                        padding: 18,
                        view_mode: 'Month',
                        date_format: 'YYYY-MM-DD',
                        language: 'en',
                        custom_popup_html: function (task) {
                            const sDate = new Date(task.start);
                            const eDate = new Date(task.end);
                            const durationDays = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);
                            const progressColor = task.progress >= 100 ? '#10b981' : (task.progress > 0 ? '#742C81' : '#94a3b8');
                            const statusText = task.progress >= 100 ? 'เสร็จสิ้น 100%' : (task.progress > 0 ? `กำลังทำ (${task.progress}%)` : 'ยังไม่เริ่ม');
                            return `
                                <div style="padding: 12px 14px; border-radius: 10px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.12); font-family: 'Prompt', sans-serif; min-width: 220px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                        <span style="font-size: 10.5px; font-weight: 700; color: ${progressColor}; background: ${progressColor}18; padding: 2px 8px; border-radius: 10px;">${statusText}</span>
                                        <span style="font-size: 11px; color: #64748b;"><i class="fa-regular fa-clock"></i> ${durationDays} วัน</span>
                                    </div>
                                    <strong style="display: block; font-size: 13px; color: #1e293b; margin-bottom: 8px; line-height: 1.35;">${task.name}</strong>
                                    <div style="font-size: 11.5px; color: #64748b; margin-bottom: 8px;">
                                        <div><i class="fa-regular fa-calendar-check" style="color: #3b82f6;"></i> <strong>เริ่ม:</strong> ${task.start}</div>
                                        <div><i class="fa-regular fa-calendar-xmark" style="color: #ef4444;"></i> <strong>สิ้นสุด:</strong> ${task.end}</div>
                                    </div>
                                    <div style="background: #e2e8f0; height: 6px; border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${task.progress}%; height: 100%; background: ${progressColor}; border-radius: 4px;"></div>
                                    </div>
                                </div>
                            `;
                        }
                    });

                    window.currentGanttTasks = ganttTasks;
                    if (typeof adjustGanttDates === 'function') {
                        adjustGanttDates(window.currentGantt, ganttTasks);
                    }
                    if (typeof stretchGanttNative === 'function') {
                        stretchGanttNative(window.currentGantt);
                    }

                } catch (e) {
                    console.error("Gantt Chart Error:", e);
                }
            } else {
                ganttContainer.innerHTML = '<text x="20" y="40" fill="#7f8c8d">ต้องระบุวันที่เริ่มต้นและสิ้นสุดของแผนงานย่อย เพื่อแสดงผลในรูปแบบ Gantt Chart</text>';
            }
        } else {
            ganttContainer.innerHTML = '<text x="20" y="40" fill="#7f8c8d">ยังไม่มีแผนงานย่อย</text>';
        }

        // --- Render Progress Gallery (Grouped by Sub-Task) ---
        window.renderGalleryTab(p);

        // Update S-Curve
        window.updateSCurve(p);

        window.currentProjectViewData = p;
        if (typeof window.renderDisbursementTab === 'function') {
            window.renderDisbursementTab(p);
        }
    }

    // Switch the view manually since the dummy nav item is gone
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('project-detail-view').classList.add('active');
    document.querySelectorAll('.top-nav li').forEach(nav => nav.classList.remove('active'));

    // The calendar is initialized globally in DOMContentLoaded.
    // We just refetch and update size. The nav listener already does this, but doing it here again is safe.
    if (window.projectCalendar) {
        window.projectCalendar.refetchEvents();
        setTimeout(() => {
            window.projectCalendar.updateSize();
        }, 150);
    }
}

// --- Grouped Progress Gallery Logic ---
window.currentGalleryFilterTaskId = 'all';

window.filterGalleryByTask = function (taskId) {
    window.currentGalleryFilterTaskId = taskId;
    if (window.currentProjectViewData) {
        window.renderGalleryTab(window.currentProjectViewData, taskId);
    }
};

window.renderGalleryTab = function (p, selectedTaskId = 'all') {
    const container = document.getElementById('progressGalleryContainer');
    const filterSelect = document.getElementById('galleryTaskFilterSelect');
    const countBadge = document.getElementById('galleryTotalCountBadge');
    if (!container) return;

    container.innerHTML = '';

    const projGallery = (p.gallery || []).filter(item => item && item.url);
    if (countBadge) countBadge.innerText = `${projGallery.length} รูปภาพ`;

    if (projGallery.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; background: #f8fafc; border-radius: 12px; border: 1px dashed var(--border-color);">
                <i class="fa-regular fa-image" style="font-size: 40px; color: #cbd5e1; margin-bottom: 12px;"></i>
                <h3 style="font-size: 15px; color: var(--text-secondary); margin-bottom: 5px;">ยังไม่มีรูปภาพความก้าวหน้า</h3>
                <p style="font-size: 12px; color: #94a3b8;">ผู้ควบคุมงานสามารถอัปโหลดภาพรายงานความก้าวหน้าประจำวันได้ที่เมนู "รายงานความก้าวหน้า (Editor)"</p>
            </div>
        `;
        if (filterSelect) filterSelect.innerHTML = '<option value="all">แสดงทุกแผนงานย่อย (0 ภาพ)</option>';
        return;
    }

    // Associate photos with task
    const taskMap = new Map();
    if (p.tasks) {
        p.tasks.forEach(t => {
            taskMap.set(t.id, {
                taskId: t.id,
                taskName: t.name,
                actual: t.actual || 0,
                photos: []
            });
        });
    }

    const generalBucket = {
        taskId: 0,
        taskName: "ภาพหน้างานทั่วไป / ไม่ระบุแผนงานย่อย",
        actual: null,
        photos: []
    };

    projGallery.forEach(item => {
        let assigned = false;
        if (item.taskId && taskMap.has(parseInt(item.taskId))) {
            taskMap.get(parseInt(item.taskId)).photos.push(item);
            assigned = true;
        } else if (p.tasks) {
            // Try to match task name in desc
            const matched = p.tasks.find(t => item.desc && item.desc.toLowerCase().includes(t.name.toLowerCase()));
            if (matched) {
                taskMap.get(matched.id).photos.push(item);
                assigned = true;
            }
        }
        if (!assigned) {
            generalBucket.photos.push(item);
        }
    });

    // Populate filterSelect
    if (filterSelect) {
        let opts = `<option value="all" ${selectedTaskId === 'all' ? 'selected' : ''}>แสดงทุกแผนงานย่อย (${projGallery.length} ภาพ)</option>`;
        taskMap.forEach(grp => {
            if (grp.photos.length > 0) {
                opts += `<option value="${grp.taskId}" ${String(selectedTaskId) === String(grp.taskId) ? 'selected' : ''}>${grp.taskName} (${grp.photos.length} ภาพ)</option>`;
            }
        });
        if (generalBucket.photos.length > 0) {
            opts += `<option value="0" ${String(selectedTaskId) === '0' ? 'selected' : ''}>${generalBucket.taskName} (${generalBucket.photos.length} ภาพ)</option>`;
        }
        filterSelect.innerHTML = opts;
    }

    // Render grouped task sections
    let groupsToRender = [];
    taskMap.forEach(grp => {
        if (grp.photos.length > 0) {
            if (selectedTaskId === 'all' || String(selectedTaskId) === String(grp.taskId)) {
                groupsToRender.push(grp);
            }
        }
    });
    if (generalBucket.photos.length > 0 && (selectedTaskId === 'all' || String(selectedTaskId) === '0')) {
        groupsToRender.push(generalBucket);
    }

    if (groupsToRender.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
                <p>ไม่พบรูปภาพในแผนงานย่อยที่เลือก</p>
            </div>
        `;
        return;
    }

    groupsToRender.forEach(grp => {
        const sec = document.createElement('div');
        sec.className = 'gallery-task-section';

        let progressBadgeHTML = '';
        if (grp.actual !== null && grp.actual !== undefined) {
            const isDone = grp.actual >= 100;
            const bg = isDone ? '#ecfdf5' : '#f5f3ff';
            const color = isDone ? '#059669' : '#7c3aed';
            progressBadgeHTML = `<span class="gallery-task-progress-badge" style="background: ${bg}; color: ${color};"><i class="${isDone ? 'fa-solid fa-check-circle' : 'fa-solid fa-spinner'}"></i> ความก้าวหน้า: ${grp.actual}%</span>`;
        }

        let photosHTML = '';
        grp.photos.forEach((item) => {
            const realIndex = (p.gallery || []).indexOf(item);
            const deleteBtnHTML = (window.currentRole === 'admin') ? `
                <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 5px; z-index: 10;">
                    <button class="btn btn-secondary role-admin" style="background: rgba(52, 152, 219, 0.95); color: white; padding: 5px 9px; border-radius: 6px; font-size: 11px; cursor: pointer; border: none; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" onclick="openEditGalleryModal(${p.id}, ${realIndex})" title="แก้ไขรูปภาพ / เลือกแผนงานย่อย">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-secondary role-admin" style="background: rgba(231, 76, 60, 0.95); color: white; padding: 5px 9px; border-radius: 6px; font-size: 11px; cursor: pointer; border: none; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" onclick="deleteGalleryItem(${p.id}, ${realIndex})" title="ลบรูปภาพ">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            ` : '';

            photosHTML += `
                <div class="gallery-card">
                    ${deleteBtnHTML}
                    <div class="gallery-card-img-wrapper" onclick="openImageModal('${item.url}')">
                        <img src="${item.url}" alt="${item.desc || 'progress photo'}" loading="lazy" onerror="this.src='mascot.jpg'">
                        <div class="gallery-card-date-badge">
                            <i class="fa-regular fa-calendar"></i> ${item.date || '-'}
                        </div>
                    </div>
                    <div class="gallery-card-body">
                        <p class="gallery-card-desc" title="${item.desc || '-'}">${item.desc || 'ไม่มีคำบรรยาย'}</p>
                        <span class="gallery-card-task-tag"><i class="fa-solid fa-tag"></i> ${grp.taskName}</span>
                    </div>
                </div>
            `;
        });

        sec.innerHTML = `
            <div class="gallery-task-header">
                <div class="gallery-task-title">
                    <i class="fa-solid fa-layer-group" style="color: var(--pea-purple);"></i>
                    <span>${grp.taskName}</span>
                </div>
                <div class="gallery-task-meta">
                    ${progressBadgeHTML}
                    <span class="status-badge" style="background: #f1f5f9; color: #475569; font-size: 11px;">
                        <i class="fa-regular fa-image"></i> ${grp.photos.length} รูปภาพ
                    </span>
                </div>
            </div>
            <div class="gallery-task-grid">
                ${photosHTML}
            </div>
        `;
        container.appendChild(sec);
    });
};

// --- Admin Edit Gallery Photo Modal Logic ---
window.openEditGalleryModal = function (projectId, photoIndex) {
    const p = projects.find(proj => proj.id === projectId) || window.currentProjectViewData;
    if (!p || !p.gallery || !p.gallery[photoIndex]) {
        alert('ไม่พบข้อมูลรูปภาพที่ต้องการแก้ไข');
        return;
    }

    const photo = p.gallery[photoIndex];
    document.getElementById('editGalleryProjectId').value = projectId;
    document.getElementById('editGalleryPhotoIndex').value = photoIndex;

    const imgPreview = document.getElementById('editGalleryImgPreview');
    if (imgPreview) {
        imgPreview.src = photo.url || 'mascot.jpg';
    }

    // Populate sub-tasks dropdown
    const taskSelect = document.getElementById('editGalleryTaskSelect');
    if (taskSelect) {
        let opts = `<option value="">-- ภาพหน้างานทั่วไป / ไม่ระบุแผนงานย่อย --</option>`;
        if (p.tasks && p.tasks.length > 0) {
            p.tasks.forEach(t => {
                let isSelected = false;
                if (photo.taskId && String(photo.taskId) === String(t.id)) {
                    isSelected = true;
                } else if (!photo.taskId && photo.desc && photo.desc.toLowerCase().includes(t.name.toLowerCase())) {
                    isSelected = true;
                }
                opts += `<option value="${t.id}" ${isSelected ? 'selected' : ''}>${t.id}: ${t.name} (ความก้าวหน้า ${t.actual || 0}%)</option>`;
            });
        }
        taskSelect.innerHTML = opts;
    }

    const descInput = document.getElementById('editGalleryDescInput');
    if (descInput) {
        descInput.value = photo.desc || '';
    }

    const dateInput = document.getElementById('editGalleryDateInput');
    if (dateInput) {
        dateInput.value = photo.date || '';
    }

    const modal = document.getElementById('editGalleryModal');
    if (modal) {
        modal.style.display = 'flex';
    }
};

window.closeEditGalleryModal = function () {
    const modal = document.getElementById('editGalleryModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.saveEditGalleryPhoto = async function () {
    const projectId = parseInt(document.getElementById('editGalleryProjectId').value);
    const photoIndex = parseInt(document.getElementById('editGalleryPhotoIndex').value);
    const p = projects.find(proj => proj.id === projectId) || window.currentProjectViewData;

    if (!p || !p.gallery || !p.gallery[photoIndex]) {
        alert('ไม่พบข้อมูลรูปภาพในระบบ');
        return;
    }

    const selectedTaskId = document.getElementById('editGalleryTaskSelect').value;
    const newDesc = document.getElementById('editGalleryDescInput').value.trim();
    const newDate = document.getElementById('editGalleryDateInput').value;

    if (selectedTaskId) {
        const t = p.tasks ? p.tasks.find(tk => String(tk.id) === String(selectedTaskId)) : null;
        p.gallery[photoIndex].taskId = parseInt(selectedTaskId);
        p.gallery[photoIndex].taskName = t ? t.name : '';
    } else {
        p.gallery[photoIndex].taskId = null;
        p.gallery[photoIndex].taskName = null;
    }

    p.gallery[photoIndex].desc = newDesc;
    if (newDate) {
        p.gallery[photoIndex].date = newDate;
    }

    // Save changes to database / localStorage
    await saveProjects();

    closeEditGalleryModal();

    // Re-render gallery view with updated task grouping
    window.renderGalleryTab(p, window.currentGalleryFilterTaskId || 'all');

    alert('บันทึกการแก้ไขรูปภาพและจัดเข้าแผนงานย่อยเรียบร้อยแล้ว');
};

window.editGalleryItemDesc = function (projectId, date, desc) {
    const p = projects.find(proj => proj.id === projectId);
    if (p && p.gallery) {
        const index = p.gallery.findIndex(g => g.date === date && g.desc === desc);
        if (index !== -1) {
            window.openEditGalleryModal(projectId, index);
        }
    }
};

window.deleteGalleryItem = async function (projectId, photoIndexOrDate, desc) {
    if (confirm('คุณต้องการลบรูปภาพความก้าวหน้านี้ใช่หรือไม่?')) {
        const p = projects.find(proj => proj.id === projectId) || window.currentProjectViewData;
        if (p && p.gallery) {
            let index = -1;
            if (typeof photoIndexOrDate === 'number') {
                index = photoIndexOrDate;
            } else {
                index = p.gallery.findIndex(g => g.date === photoIndexOrDate && g.desc === desc);
            }
            if (index !== -1 && index < p.gallery.length) {
                p.gallery.splice(index, 1);
                await saveProjects();
                window.renderGalleryTab(p, window.currentGalleryFilterTaskId || 'all');
                if (window.calendar) {
                    window.calendar.refetchEvents();
                }
            }
        }
    }
};

window.changeGanttMode = function (mode) {
    if (window.currentGantt) {
        window.currentGantt.change_view_mode(mode);
        if (typeof adjustGanttDates === 'function' && window.currentGanttTasks) {
            adjustGanttDates(window.currentGantt, window.currentGanttTasks);
        }
        if (typeof stretchGanttNative === 'function') {
            stretchGanttNative(window.currentGantt);
        }
    }

    // Update active button state
    ['Day', 'Week', 'Month'].forEach(m => {
        const btn = document.getElementById(`btnGantt${m}`);
        if (btn) {
            if (m === mode) btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });
};

window.stretchGanttNative = function (gantt) {
    if (!gantt || !gantt.dates || gantt.dates.length === 0) return;

    const wrapper = document.querySelector('#ganttChart').parentElement;
    if (!wrapper) return;

    // The width of the area we have available
    const containerWidth = wrapper.clientWidth;
    const totalColumns = gantt.dates.length;

    if (totalColumns > 0) {
        // Calculate needed column width to fill the container exactly
        // Subtract a little padding (e.g., 30px) so it doesn't overflow scrollbars
        const minRequiredWidth = (containerWidth - 30) / totalColumns;

        // We restore original column width based on mode first in case it was stretched previously
        let baseWidth = 120; // default for Month/Year
        if (gantt.options.view_mode === 'Day') baseWidth = 38;
        if (gantt.options.view_mode === 'Week') baseWidth = 140;

        // Stretch only if we have empty space
        if (minRequiredWidth > baseWidth) {
            gantt.options.column_width = minRequiredWidth;
        } else {
            gantt.options.column_width = baseWidth;
        }
        gantt.render();
    }
};

window.adjustGanttDates = function (gantt, tasks) {
    if (!tasks || tasks.length === 0) return;

    let minDate = new Date("2099-01-01");
    let maxDate = new Date("2000-01-01");

    tasks.forEach(t => {
        let sd = new Date(t.start);
        let ed = new Date(t.end);
        if (sd < minDate) minDate = sd;
        if (ed > maxDate) maxDate = ed;
    });

    if (gantt.options.view_mode === 'Month') {
        minDate.setDate(1); // Start of month
        maxDate.setMonth(maxDate.getMonth() + 1);
        maxDate.setDate(0); // End of month
    } else {
        minDate.setDate(minDate.getDate() - 3);
        maxDate.setDate(maxDate.getDate() + 3);
    }

    gantt.gantt_start = minDate;
    gantt.gantt_end = maxDate;

    if (typeof gantt.setup_date_values === 'function') {
        gantt.setup_date_values();
        gantt.render();
    }
};

// --- Project CRUD Logic ---
window.openProjectModal = function (id = null) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectModalTitle');
    const copyGroup = document.getElementById('copyTemplateProjectGroup');
    const copySelect = document.getElementById('copyTemplateProjectSelect');

    form.reset();
    document.getElementById('projectId').value = '';

    if (copySelect) {
        copySelect.innerHTML = '<option value="">-- ไม่คัดลอก (สร้างโครงการเปล่า) --</option>';
        projects.forEach(p => {
            if (p.tasks && p.tasks.length > 0) {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.name} (${p.tasks.length} รายการแผนงาน)`;
                copySelect.appendChild(opt);
            }
        });
    }

    if (id !== null) {
        title.innerText = 'แก้ไขโครงการ';
        if (copyGroup) copyGroup.style.display = 'none';
        const project = projects.find(p => p.id === id);
        if (project) {
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectNameInput').value = project.name;
            document.getElementById('projectTypeInput').value = project.type || 'จ้างเหมา';
            document.getElementById('projectContractorInput').value = project.contractor;
            document.getElementById('projectSupervisorInput').value = project.supervisor || '';
            document.getElementById('projectCommitteeInput').value = project.committee || '';
            document.getElementById('projectDurationInput').value = project.duration || '';
            document.getElementById('projectStatusInput').value = project.status;
        }
    } else {
        title.innerText = 'เพิ่มโครงการใหม่';
        if (copyGroup) copyGroup.style.display = 'block';
    }

    modal.style.display = 'flex';
};

window.closeProjectModal = function () {
    document.getElementById('projectModal').style.display = 'none';
};

window.deleteProject = async function (id) {
    if (confirm('คุณต้องการลบโครงการนี้ใช่หรือไม่?')) {
        try {
            const { error } = await db.from('projects').delete().eq('id', id);
            if (error) throw error;

            projects = projects.filter(p => p.id !== id);
            window.renderTables();
        } catch (e) {
            console.error('Delete Error:', e);
            alert('ลบโครงการไม่สำเร็จ: ' + (e.message || ''));
        }
    }
};

document.getElementById('projectForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const idVal = document.getElementById('projectId').value;
    const name = document.getElementById('projectNameInput').value;
    const type = document.getElementById('projectTypeInput').value;
    const contractor = document.getElementById('projectContractorInput').value;
    const supervisor = document.getElementById('projectSupervisorInput').value;
    const committee = document.getElementById('projectCommitteeInput').value;
    const duration = document.getElementById('projectDurationInput').value;
    const status = document.getElementById('projectStatusInput').value;

    if (idVal) {
        // Edit
        const project = projects.find(p => p.id === parseInt(idVal));
        if (project) {
            project.name = name;
            project.type = type;
            project.contractor = contractor;
            project.supervisor = supervisor;
            project.committee = committee;
            project.duration = duration;
            project.status = status;
        }
    } else {
        // Add
        const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
        let initialTasks = [];
        const templateId = document.getElementById('copyTemplateProjectSelect')?.value;
        if (templateId) {
            const templateProj = projects.find(p => p.id === parseInt(templateId));
            if (templateProj && templateProj.tasks) {
                let startTaskId = 101;
                initialTasks = templateProj.tasks.map(t => ({
                    id: startTaskId++,
                    name: t.name,
                    desc: t.desc || '',
                    startDate: t.startDate || '',
                    endDate: t.endDate || '',
                    weight: parseFloat(t.weight) || 0,
                    actual: 0
                }));
            }
        }
        projects.push({
            id: newId,
            name: name,
            type: type,
            contractor: contractor,
            supervisor: supervisor,
            committee: committee,
            duration: duration,
            status: status,
            tasks: initialTasks
        });
    }

    saveProjects();
    window.closeProjectModal();
    window.renderTables();
});

// Copy Tasks (WBS) Modal Functions
window.openCopyTasksModal = function (defaultTargetId = null) {
    const modal = document.getElementById('copyTasksModal');
    const sourceSelect = document.getElementById('copySourceProjectSelect');
    const targetSelect = document.getElementById('copyTargetProjectSelect');
    if (!modal || !sourceSelect || !targetSelect) return;

    sourceSelect.innerHTML = '<option value="" disabled selected>-- เลือกโครงการต้นทาง --</option>';
    targetSelect.innerHTML = '<option value="" disabled selected>-- เลือกโครงการปลายทาง --</option>';

    let activeDetailId = window.currentProjectViewData ? window.currentProjectViewData.id : null;
    let adminWbsSelectId = document.getElementById('adminProjectSelect')?.value;
    let autoTargetId = defaultTargetId || activeDetailId || (adminWbsSelectId ? parseInt(adminWbsSelectId) : null);

    projects.forEach(p => {
        const taskCount = (p.tasks && p.tasks.length) ? p.tasks.length : 0;

        if (taskCount > 0) {
            const optS = document.createElement('option');
            optS.value = p.id;
            optS.textContent = `${p.name} (${taskCount} รายการแผนงาน)`;
            sourceSelect.appendChild(optS);
        }

        const optT = document.createElement('option');
        optT.value = p.id;
        optT.textContent = `${p.name} (${taskCount} รายการแผนงาน)`;
        if (autoTargetId && p.id === autoTargetId) {
            optT.selected = true;
        }
        targetSelect.appendChild(optT);
    });

    modal.style.display = 'flex';
};

window.closeCopyTasksModal = function () {
    const modal = document.getElementById('copyTasksModal');
    if (modal) modal.style.display = 'none';
};

document.getElementById('copyTasksForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const sourceId = parseInt(document.getElementById('copySourceProjectSelect').value);
    const targetId = parseInt(document.getElementById('copyTargetProjectSelect').value);
    const mode = document.getElementById('copyModeSelect').value;
    const resetActual = document.getElementById('resetActualProgressCheck').checked;

    if (!sourceId || !targetId) {
        alert('กรุณาเลือกโครงการต้นทางและปลายทางให้ถูกต้อง');
        return;
    }

    if (sourceId === targetId) {
        alert('โครงการต้นทางและปลายทางต้องไม่เป็นโครงการเดียวกัน');
        return;
    }

    const sourceProj = projects.find(p => p.id === sourceId);
    const targetProj = projects.find(p => p.id === targetId);

    if (!sourceProj || !sourceProj.tasks || sourceProj.tasks.length === 0) {
        alert('โครงการต้นทางไม่มีรายการแผนงานย่อยให้คัดลอก');
        return;
    }

    if (!targetProj) {
        alert('ไม่พบโครงการปลายทาง');
        return;
    }

    let startTaskId = (targetProj.tasks && targetProj.tasks.length > 0)
        ? Math.max(...targetProj.tasks.map(t => t.id)) + 1
        : 101;

    const clonedTasks = sourceProj.tasks.map(t => ({
        id: startTaskId++,
        name: t.name,
        desc: t.desc || '',
        startDate: t.startDate || '',
        endDate: t.endDate || '',
        weight: parseFloat(t.weight) || 0,
        actual: resetActual ? 0 : (parseFloat(t.actual) || 0)
    }));

    if (mode === 'replace') {
        targetProj.tasks = clonedTasks;
    } else {
        targetProj.tasks = (targetProj.tasks || []).concat(clonedTasks);
    }

    await saveProjects(targetProj.id);
    closeCopyTasksModal();
    alert(`คัดลอกแผนงานย่อย ${clonedTasks.length} รายการไปยังโครงการ "${targetProj.name}" เรียบร้อยแล้ว!`);

    window.renderTables();
    if (window.currentProjectViewData && window.currentProjectViewData.id === targetProj.id) {
        window.viewProjectDetails(targetProj.id);
    }
    const adminSelect = document.getElementById('adminProjectSelect');
    if (adminSelect && parseInt(adminSelect.value) === targetProj.id) {
        adminSelect.dispatchEvent(new Event('change'));
    }
});

// Dynamic task loading for Editor
document.getElementById('editorProjectSelect')?.addEventListener('change', function (e) {
    const projectId = parseInt(this.value);
    const p = projects.find(proj => proj.id === projectId);
    const taskSelect = document.getElementById('editorTaskSelect');
    taskSelect.innerHTML = '<option value="" disabled selected>-- เลือกแผนงานย่อย --</option>';
    if (p && p.tasks) {
        p.tasks.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.text = t.name;
            taskSelect.appendChild(opt);
        });
    }
});

// Update weight hint and WBS table when admin project is selected
function renderAdminWbsTable(projectId) {
    const tbody = document.getElementById('adminWbsTableBody');
    if (!tbody) return;
    const p = projects.find(proj => proj.id === projectId);
    if (!p || !p.tasks || p.tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">ยังไม่มีแผนงานย่อย</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    p.tasks.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.name}</td>
            <td>${t.startDate}</td>
            <td>${t.endDate}</td>
            <td>${t.weight}%</td>
            <td>${t.actual || 0}%</td>
            <td style="display:flex; gap:5px;">
                <button class="btn btn-secondary" style="color:var(--primary-color); padding: 5px 10px;" onclick="editWbsTask(${p.id}, ${t.id})">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-secondary" style="color:var(--danger-color); padding: 5px 10px;" onclick="deleteWbsTask(${p.id}, ${t.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editWbsTask = function (projectId, taskId) {
    const p = projects.find(proj => proj.id === projectId);
    if (!p || !p.tasks) return;
    const t = p.tasks.find(tk => tk.id === taskId);
    if (!t) return;

    document.getElementById('taskNameInput').value = t.name || '';
    document.getElementById('taskDescInput').value = t.description || '';
    document.getElementById('taskStartDate').value = t.startDate || '';
    document.getElementById('taskEndDate').value = t.endDate || '';
    document.getElementById('taskWeightInput').value = t.weight || '';
    document.getElementById('taskActualAdminInput').value = t.actual || 0;

    document.getElementById('adminForm').scrollIntoView({ behavior: 'smooth' });
}

window.deleteWbsTask = function (projectId, taskId) {
    if (confirm('คุณต้องการลบแผนงานย่อยนี้ใช่หรือไม่? (ความก้าวหน้าของงานนี้จะถูกลบด้วย)')) {
        const p = projects.find(proj => proj.id === projectId);
        if (p) {
            p.tasks = p.tasks.filter(t => t.id !== taskId);
            saveProjects();
            renderAdminWbsTable(projectId);
            // Trigger change event to update weight hint
            document.getElementById('adminProjectSelect').dispatchEvent(new Event('change'));
            window.renderTables(); // Update dashboard
        }
    }
};

document.getElementById('adminProjectSelect')?.addEventListener('change', function (e) {
    const projectId = parseInt(this.value);
    const p = projects.find(proj => proj.id === projectId);
    const hint = document.getElementById('weightHint');
    if (p && hint) {
        let total = 0;
        if (p.tasks) {
            total = p.tasks.reduce((sum, t) => sum + (parseFloat(t.weight) || 0), 0);
        }
        let remain = Math.max(0, 100 - total);
        hint.innerText = `(รวมแล้ว ${total.toFixed(2)}% เหลือ ${remain.toFixed(2)}%)`;
        hint.style.color = remain === 0 ? 'red' : 'var(--primary-color)';
    }

    const datalist = document.getElementById('existingTasksList');
    if (datalist) {
        datalist.innerHTML = '';
        if (p && p.tasks) {
            p.tasks.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.name;
                datalist.appendChild(opt);
            });
        }
    }

    renderAdminWbsTable(projectId);
});

document.getElementById('taskNameInput')?.addEventListener('input', function (e) {
    const projectId = parseInt(document.getElementById('adminProjectSelect').value);
    const p = projects.find(proj => proj.id === projectId);
    if (p && p.tasks) {
        const existingTask = p.tasks.find(t => t.name === this.value);
        if (existingTask) {
            document.getElementById('taskDescInput').value = existingTask.description || '';
            document.getElementById('taskStartDate').value = existingTask.startDate || '';
            document.getElementById('taskEndDate').value = existingTask.endDate || '';
            document.getElementById('taskWeightInput').value = existingTask.weight || '';
        }
    }
});

// Admin Form (WBS Entry)
document.getElementById('adminForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const projectId = document.getElementById('adminProjectSelect').value;
    const taskName = document.getElementById('taskNameInput').value;
    const taskDesc = document.getElementById('taskDescInput')?.value || '';
    const startDate = document.getElementById('taskStartDate').value;
    const endDate = document.getElementById('taskEndDate').value;
    const weight = parseFloat(document.getElementById('taskWeightInput').value);
    const actualVal = document.getElementById('taskActualAdminInput').value;
    const actual = actualVal !== "" ? parseFloat(actualVal) : 0;

    if (new Date(endDate) < new Date(startDate)) {
        alert("ข้อผิดพลาด: วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น");
        return;
    }

    if (projectId && taskName && startDate && endDate && weight) {
        const p = projects.find(proj => proj.id === parseInt(projectId));
        if (p) {
            const existingTaskIndex = p.tasks ? p.tasks.findIndex(t => t.name === taskName) : -1;

            let currentTotal = 0;
            if (p.tasks) {
                currentTotal = p.tasks.reduce((sum, t, idx) => {
                    // If editing, exclude the old weight of this task from the check
                    if (idx === existingTaskIndex) return sum;
                    return sum + (parseFloat(t.weight) || 0);
                }, 0);
            }

            if (currentTotal + weight > 100.01) {
                alert(`ข้อผิดพลาด: ค่าน้ำหนักรวมจะเกิน 100% (ปัจจุบัน ${currentTotal}%, ใส่เพิ่มได้อีก ${Math.max(0, 100 - currentTotal).toFixed(2)}%)`);
                return;
            }

            if (existingTaskIndex !== -1) {
                // Update existing task
                p.tasks[existingTaskIndex].description = taskDesc;
                p.tasks[existingTaskIndex].startDate = startDate;
                p.tasks[existingTaskIndex].endDate = endDate;
                p.tasks[existingTaskIndex].weight = weight;
                p.tasks[existingTaskIndex].actual = actual;
                alert(`แก้ไขข้อมูลแผนงานย่อย "${taskName}" เรียบร้อยแล้ว!`);
            } else {
                // Add new task
                if (!p.tasks) p.tasks = [];
                const newTaskId = p.tasks.length > 0 ? Math.max(...p.tasks.map(t => t.id)) + 1 : 1;
                p.tasks.push({
                    id: newTaskId, name: taskName, description: taskDesc, startDate: startDate, endDate: endDate, weight: weight, actual: actual
                });
                alert(`เพิ่มแผนงานย่อย "${taskName}" ให้โครงการ "${p.name}" เรียบร้อยแล้ว!`);
            }

            await saveProjects();
            window.renderTables();
            this.reset();
            document.getElementById('weightHint').innerText = '';
            renderAdminWbsTable(p.id);
        }
    } else {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
});

// Editor Form (Actual Progress Entry)
document.getElementById('editorForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const projectId = document.getElementById('editorProjectSelect').value;
    const taskId = document.getElementById('editorTaskSelect').value;
    const actualVal = document.getElementById('taskActualInput').value;
    const reportDate = document.getElementById('reportDate').value;
    const desc = document.querySelector('#editorForm textarea').value;
    const fileInput = document.querySelector('#editorForm .file-input');
    const submitBtn = document.querySelector('#editorForm button[type="submit"]');

    if (projectId && taskId && reportDate) {
        const p = projects.find(proj => proj.id === parseInt(projectId));
        if (p) {
            const t = p.tasks.find(tk => tk.id === parseInt(taskId));
            if (t) {
                // Show loading state
                const originalBtnText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...';
                submitBtn.disabled = true;

                if (actualVal !== "") {
                    t.actual = parseFloat(actualVal);
                }

                if (!p.gallery) p.gallery = [];

                const processUpdate = async () => {
                    p.gallery.sort((a, b) => new Date(b.date) - new Date(a.date));
                    try {
                        const success = await saveProjects(p.id);
                        if (success !== false) {
                            window.renderTables();
                            alert(`บันทึกรายงานความก้าวหน้าแผนงาน "${t.name}" เรียบร้อยแล้ว!`);
                            // NOTIFICATION
                            addAppNotification(`🔔 มีการรายงานความก้าวหน้าโครงการ "${p.name}" แผนงาน "${t.name}" (Actual: ${t.actual}%)`, 'success');

                            document.getElementById('imagePreviewArea').innerHTML = ''; // Clear preview
                            document.getElementById('editorForm').reset();
                        } else {
                            p.gallery.pop(); // Revert the last push if save failed
                        }
                    } catch (e) {
                        console.error(e);
                        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + e.message);
                        p.gallery.pop(); // Revert the last push
                    } finally {
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }
                };

                const files = fileInput.files;
                if (files && files.length > 0) {
                    let filesProcessed = 0;

                    const getCanvasBlob = (canvas) => new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.6));

                    Array.from(files).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const img = new Image();
                            img.onload = async () => {
                                const canvas = document.createElement('canvas');
                                const MAX_WIDTH = 800;
                                const MAX_HEIGHT = 800;
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

                                const blob = await getCanvasBlob(canvas);

                                const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
                                const folderDate = new Date().toISOString().split('T')[0];
                                const filePath = `${folderDate}/${fileName}`;

                                const { data: uploadData, error: uploadError } = await db
                                    .storage
                                    .from('project-images')
                                    .upload(filePath, blob, { contentType: 'image/jpeg' });

                                if (uploadError) {
                                    console.error('Upload Error:', uploadError);
                                    alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + uploadError.message);
                                } else {
                                    const { data: { publicUrl } } = db
                                        .storage
                                        .from('project-images')
                                        .getPublicUrl(filePath);

                                    p.gallery.push({
                                        url: publicUrl,
                                        date: reportDate,
                                        desc: (desc || `อัปเดตงาน: ${t.name}`) + (window.currentUserEmpId ? ` (รหัสพนักงาน: ${window.currentUserEmpId})` : ''),
                                        taskId: t.id,
                                        taskName: t.name
                                    });
                                }

                                filesProcessed++;
                                if (filesProcessed === files.length) {
                                    processUpdate();
                                }
                            };
                            img.src = event.target.result;
                        };
                        reader.readAsDataURL(file);
                    });
                } else {
                    if (desc || actualVal !== "") {
                        p.gallery.push({
                            url: null,
                            date: reportDate,
                            desc: (desc || (actualVal !== "" ? `อัปเดตความก้าวหน้าเป็น ${actualVal}%` : `อัปเดตงาน: ${t.name}`)) + (window.currentUserEmpId ? ` (รหัสพนักงาน: ${window.currentUserEmpId})` : ''),
                            taskId: t.id,
                            taskName: t.name
                        });
                    }
                    processUpdate();
                }
            }
        }
    } else {
        alert('กรุณาเลือกโครงการ, แผนงานย่อย และวันที่รายงานให้ครบถ้วน');
    }
});

// --- Data Import ---
document.getElementById('importExcelInput')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    if (typeof XLSX === 'undefined') {
        alert('ไม่พบไลบรารี SheetJS กรุณารีเฟรชหน้าเว็บ');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const importedData = XLSX.utils.sheet_to_json(worksheet);

            if (importedData && importedData.length > 0) {
                const formattedProjects = importedData.map(row => {
                    let tasks = [];
                    let gallery = [];

                    try { if (row.tasks_json) tasks = JSON.parse(row.tasks_json); } catch (e) { }
                    try { if (row.gallery_json) gallery = JSON.parse(row.gallery_json); } catch (e) { }

                    // Allow both Thai and English column names
                    return {
                        id: row.id || row.ID || row['รหัส'] || (Math.floor(Math.random() * 1000000)),
                        name: row.name || row.Name || row['ชื่อโครงการ'] || 'ไม่ระบุชื่อ',
                        contractor: row.contractor || row.Contractor || row['ผู้รับเหมา'] || '',
                        supervisor: row.supervisor || row.Supervisor || row['ผู้ควบคุมงาน'] || '',
                        committee: row.committee || row.Committee || row['กรรมการตรวจรับ'] || '',
                        duration: row.duration || row.Duration || row['ระยะเวลา'] || '',
                        status: row.status || row.Status || row['สถานะ'] || 'อยู่ระหว่างก่อสร้าง',
                        tasks: tasks,
                        gallery: gallery
                    };
                });

                projects = formattedProjects;
                saveProjects();
                alert('นำเข้าข้อมูล Excel เรียบร้อยแล้ว ระบบจะโหลดหน้าจอใหม่');
                location.reload();
            } else {
                alert('ไม่พบข้อมูลในไฟล์ Excel หรือรูปแบบไม่ถูกต้อง');
            }
        } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel');
        }

        // Reset file input so same file can be selected again
        e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
});

// Optimize Gantt Chart for printing by setting viewBox right before print
window.addEventListener('beforeprint', () => {
    const svg = document.querySelector('#ganttChart');
    if (svg) {
        const w = svg.getAttribute('width');
        const h = svg.getAttribute('height');
        if (w && h && !svg.getAttribute('viewBox')) {
            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        }
    }
});

// --- Report Export Functions ---
window.downloadPDFReport = function () {
    if (typeof html2pdf === 'undefined') {
        alert('กำลังโหลดไลบรารีสำหรับสร้าง PDF กรุณารอสักครู่');
        return;
    }
    const element = document.getElementById('project-detail-view');
    // Hide buttons during export
    const buttons = element.querySelectorAll('button');
    buttons.forEach(btn => btn.style.display = 'none');

    // Force solid black text and white backgrounds
    element.classList.add('pdf-export-mode');

    // Fix width to prevent the PDF from scaling down too much on large screens (which causes faint/tiny text)
    const originalWidth = element.style.width;
    const originalMargin = element.style.margin;
    element.style.width = '1200px';
    element.style.margin = '0 auto';

    const projectName = document.getElementById('detailProjectTitle').innerText;

    const opt = {
        margin: 10,
        filename: `${projectName.replace(/ /g, '_')}_Report.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 4, backgroundColor: '#ffffff', useCORS: true, windowWidth: 1200 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        buttons.forEach(btn => btn.style.display = '');
        element.classList.remove('pdf-export-mode');
        element.style.width = originalWidth;
        element.style.margin = originalMargin;
    });
};

window.downloadExcelReport = function () {
    if (typeof XLSX === 'undefined') {
        alert('กำลังโหลดไลบรารีสำหรับสร้าง Excel กรุณารอสักครู่');
        return;
    }

    const activeProjectName = document.getElementById('detailProjectTitle').innerText;
    // Find project by matching name exactly
    const p = projects.find(proj => activeProjectName === proj.name) || projects[0];

    if (!p) {
        alert("ไม่พบข้อมูลโครงการ");
        return;
    }

    const { plan, actual } = calculateProjectProgress(p);

    // Create Summary Data
    const summaryData = [
        { "A": "ชื่อโครงการ", "B": p.name },
        { "A": "ผู้รับเหมา", "B": p.contractor || "-" },
        { "A": "ผู้ควบคุมงาน", "B": p.supervisor || "-" },
        { "A": "แผนงานสะสม (%)", "B": plan + "%" },
        { "A": "ผลงานจริงสะสม (%)", "B": actual + "%" },
        { "A": "สถานะ", "B": p.status },
        { "A": "", "B": "" } // Blank row
    ];

    // Create Task Data
    const taskData = (p.tasks || []).map(t => ({
        "ชื่องาน (Task)": t.name,
        "วันที่เริ่ม": t.startDate,
        "วันที่สิ้นสุด": t.endDate,
        "น้ำหนัก (%)": t.weight,
        "ความก้าวหน้าจริง (%)": t.actual
    }));

    const wb = XLSX.utils.book_new();

    // Insert into worksheet
    const ws = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true });
    XLSX.utils.sheet_add_json(ws, taskData, { origin: "A8" });

    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${p.name}_WBS_Report.xlsx`);
};

// --- App Notifications System ---
let appNotifications = JSON.parse(localStorage.getItem('pcts_notifications')) || [];

function addAppNotification(msg, type = 'info') {
    appNotifications.unshift({ msg, type, date: new Date().toISOString(), read: false });
    if (appNotifications.length > 30) appNotifications.pop();
    localStorage.setItem('pcts_notifications', JSON.stringify(appNotifications));
    if (typeof renderAppNotifications === 'function') renderAppNotifications();
}

window.renderAppNotifications = function () {
    const list = document.getElementById('notifList');
    const badge = document.getElementById('notifBadge');
    if (!list || !badge) return;

    list.innerHTML = '';
    let unreadCount = 0;

    if (appNotifications.length === 0) {
        list.innerHTML = '<div style="padding: 15px; text-align: center; color: #777;">ไม่มีการแจ้งเตือน</div>';
    } else {
        appNotifications.forEach((n, idx) => {
            if (!n.read) unreadCount++;
            const item = document.createElement('div');
            item.style.padding = '10px 15px';
            item.style.borderBottom = '1px solid var(--border-color)';
            item.style.fontSize = '13px';
            item.style.backgroundColor = n.read ? '#fff' : '#fef9e7';
            item.style.cursor = 'pointer';
            item.innerHTML = `
                <div style="color: ${n.type === 'danger' ? '#e74c3c' : '#27ae60'}">${n.msg}</div>
                <div style="font-size: 11px; color: #999; margin-top: 5px;">${new Date(n.date).toLocaleString('th-TH')}</div>
            `;
            item.onclick = (e) => {
                e.stopPropagation();
                if (!n.read) {
                    n.read = true;
                    localStorage.setItem('pcts_notifications', JSON.stringify(appNotifications));
                    renderAppNotifications();
                }
            };
            list.appendChild(item);
        });
    }

    if (unreadCount > 0) {
        badge.innerText = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

window.toggleNotifications = function () {
    const dd = document.getElementById('notifDropdown');
    if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
};

window.clearNotifications = function (e) {
    if (e) e.stopPropagation();
    appNotifications = [];
    localStorage.removeItem('pcts_notifications');
    renderAppNotifications();
};

document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.notification-wrapper');
    const dd = document.getElementById('notifDropdown');
    if (wrapper && dd && !wrapper.contains(e.target)) {
        dd.style.display = 'none';
    }
});

// --- Project Tabs ---
window.openProjectTab = function (evt, tabName) {
    let i, tabcontent, tablinks;

    // Hide all tab content
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }

    // Remove active class from all tab links
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show current tab, add active class to button
    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.style.display = "block";
        activeTab.classList.add("active");
    }

    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }

    // Fix FullCalendar and Chart rendering issues when tab becomes visible
    if (tabName === 'tabCalendar' && window.projectCalendar) {
        setTimeout(() => {
            window.projectCalendar.updateSize();
        }, 50);
    }

    if (tabName === 'tabGantt' && window.currentGantt) {
        setTimeout(() => {
            changeGanttMode('Month');
            window.currentGantt.render();
        }, 50);
    }
};

// --- Admin Tabs ---
window.openAdminTab = function (evt, tabName) {
    let i, tabcontent, tablinks;

    // Hide all tab content
    tabcontent = document.getElementsByClassName("admin-tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove active class from all admin tab links
    tablinks = document.getElementsByClassName("admin-tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    // Show current tab, add active class to button
    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.style.display = "flex";
        activeTab.style.flexDirection = "column";
        activeTab.style.flex = "1";
        activeTab.style.overflow = "hidden";
    }

    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }
};

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    renderAppNotifications();

    // Load Settings
    const savedKey = localStorage.getItem('geminiApiKey');
    if (savedKey && document.getElementById('geminiApiKey')) {
        document.getElementById('geminiApiKey').value = savedKey;
    }

    let savedModel = localStorage.getItem('geminiModel');
    if (!savedModel || ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash'].includes(savedModel)) {
        savedModel = 'gemini-3.6-flash';
        localStorage.setItem('geminiModel', 'gemini-3.6-flash');
    }
    if (document.getElementById('geminiModelSelect')) {
        document.getElementById('geminiModelSelect').value = savedModel;
    }
});

// --- Settings ---
// --- AI Analysis Logic ---
window.aiBase64Image = null;

const aiImageInput = document.getElementById('aiImageInput');
if (aiImageInput) {
    aiImageInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) {
            window.aiBase64Image = null;
            document.getElementById('btnAnalyzeAI').style.display = 'none';
            document.getElementById('aiImagePreview').innerHTML = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            window.aiBase64Image = event.target.result;
            document.getElementById('aiImagePreview').innerHTML = `<img src="${window.aiBase64Image}" style="max-width:100%; max-height:300px; border-radius:8px; margin-top:15px; display:block;">`;
            document.getElementById('btnAnalyzeAI').style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

window.analyzeImageWithAI = async function () {
    if (!window.aiBase64Image) {
        alert('กรุณาอัปโหลดรูปภาพก่อน');
        return;
    }

    const projectId = document.getElementById('editorProjectSelect').value;
    if (!projectId) {
        alert('กรุณาเลือกโครงการในหน้ารายงานความก้าวหน้า (Editor) ก่อนใช้ AI ประเมิน');
        document.getElementById('aiModal').style.display = 'none';
        return;
    }

    document.getElementById('aiLoading').style.display = 'block';
    document.getElementById('btnAnalyzeAI').disabled = true;

    try {
        const base64Data = window.aiBase64Image.split(',')[1];
        const mimeType = window.aiBase64Image.split(';')[0].split(':')[1];

        let modelName = localStorage.getItem('geminiModel') || 'gemini-3.6-flash';
        if (!modelName || ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash'].includes(modelName)) {
            modelName = 'gemini-3.6-flash';
            localStorage.setItem('geminiModel', 'gemini-3.6-flash');
        }

        const payload = {
            model: modelName,
            contents: [{
                parts: [
                    {
                        text: `นี่คือภาพหน้างานก่อสร้างสถานีไฟฟ้าย่อย (PEA Substation)
กรุณาวิเคราะห์ภาพนี้และประเมินเปอร์เซ็นต์ความก้าวหน้าของงาน (เฉพาะงานที่เห็นในภาพเทียบกับความสมบูรณ์ของงานนั้นๆ) 
และอธิบายว่ากำลังทำอะไรอยู่ มีปัญหาอะไรที่สังเกตเห็นหรือไม่

ให้ตอบกลับมาเป็น JSON format ตามโครงสร้างนี้เท่านั้น (ห้ามใส่ Markdown หรือตัวอักษรอื่น):
{
  "percent": number,
  "details": "string"
}`
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }]
        };

        const { data, error } = await db.functions.invoke('gemini-proxy', {
            body: payload
        });

        if (error) {
            let errMsg = error.message;
            if (error.context && typeof error.context.json === 'function') {
                try {
                    const errData = await error.context.json();
                    if (errData && errData.error) errMsg = errData.error;
                } catch (_) { }
            }
            throw new Error(errMsg);
        }
        if (data && data.error) throw new Error(data.error);

        let aiText = data.candidates[0].content.parts[0].text;

        // Clean up markdown block if API returned it
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

        const result = JSON.parse(aiText);

        // Populate the editor form
        if (result.percent) {
            document.getElementById('taskActualInput').value = result.percent;
        }
        if (result.details) {
            document.querySelector('#editorForm textarea').value = result.details;
        }

        // Transfer the file to the editor form so it saves properly
        const editorFileInput = document.querySelector('#editorForm input[type="file"]');
        const aiFileInput = document.getElementById('aiImageInput');
        if (editorFileInput && aiFileInput && aiFileInput.files.length > 0) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(aiFileInput.files[0]);
            editorFileInput.files = dataTransfer.files;

            // Trigger change event to show preview in editor
            const event = new Event('change', { bubbles: true });
            editorFileInput.dispatchEvent(event);
        }

        alert('AI ประเมินผลสำเร็จ! ตรวจสอบข้อมูลในแบบฟอร์มและกด "ส่งรายงาน" เพื่อยืนยัน');
        document.getElementById('aiModal').style.display = 'none';

    } catch (error) {
        console.error("AI Analysis Error:", error);
        alert('เกิดข้อผิดพลาดในการวิเคราะห์ (ตรวจสอบ API Key หรืออินเทอร์เน็ต): ' + error.message);
    } finally {
        document.getElementById('aiLoading').style.display = 'none';
        document.getElementById('btnAnalyzeAI').disabled = false;
    }
};

// --- Home Navigation ---
window.goHome = function () {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('dashboard-view').classList.add('active');
    document.querySelectorAll('.top-nav li').forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-target="dashboard-view"]').classList.add('active');
};

// --- Print Report Modal ---
window.openPrintModal = function () {
    document.getElementById('printModal').style.display = 'flex';
};

window.closePrintModal = function () {
    document.getElementById('printModal').style.display = 'none';
};

window.toggleAllPrintSections = function (checked) {
    document.querySelectorAll('input[name="printSection"]').forEach(cb => {
        cb.checked = checked;
    });
};

// Sync "select all" checkbox when individual checkboxes change
document.addEventListener('change', function (e) {
    if (e.target.name === 'printSection') {
        const all = document.querySelectorAll('input[name="printSection"]');
        const allChecked = Array.from(all).every(cb => cb.checked);
        const selectAllCb = document.getElementById('printSelectAll');
        if (selectAllCb) selectAllCb.checked = allChecked;
    }
});

window.printSelectedSections = function () {
    const selected = Array.from(document.querySelectorAll('input[name="printSection"]:checked')).map(cb => cb.value);

    if (selected.length === 0) {
        alert('กรุณาเลือกอย่างน้อย 1 หัวข้อเพื่อพิมพ์รายงาน');
        return;
    }

    const p = window.currentProjectViewData;
    if (!p) {
        alert('ไม่พบข้อมูลโครงการ');
        return;
    }

    closePrintModal();

    const progress = calculateProjectProgress(p);
    const planVal = parseFloat(progress.plan) || 0;
    const actualVal = parseFloat(progress.actual) || 0;
    const varianceVal = (actualVal - planVal).toFixed(2);
    const isAhead = parseFloat(varianceVal) >= 0;
    const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const printTimestamp = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // --- TEMPORARY RENDER TRICK FOR HIDDEN TABS ---
    const tabSCurve = document.getElementById('tabSCurve');
    const tabGantt = document.getElementById('tabGantt');
    const tabDisbursement = document.getElementById('tabDisbursement');
    let origSCurveStyle = '', origGanttStyle = '', origDisbStyle = '';

    if (tabSCurve) {
        origSCurveStyle = tabSCurve.getAttribute('style') || '';
        tabSCurve.style.display = 'block';
        tabSCurve.style.position = 'absolute';
        tabSCurve.style.visibility = 'hidden';
        tabSCurve.style.zIndex = '-9999';
        tabSCurve.style.width = '1200px';
        tabSCurve.style.height = '520px';
        if (typeof window.updateSCurve === 'function') {
            window.updateSCurve(p);
        }
        if (window.sChart) {
            const oldAnim = window.sChart.options.animation;
            window.sChart.options.animation = false;
            window.sChart.resize();
            window.sChart.update();
            window.sChart.options.animation = oldAnim;
        }
    }

    if (tabGantt) {
        origGanttStyle = tabGantt.getAttribute('style') || '';
        tabGantt.style.display = 'block';
        tabGantt.style.position = 'absolute';
        tabGantt.style.visibility = 'hidden';
        tabGantt.style.zIndex = '-9999';
        if (window.currentGantt) {
            window.currentGantt.render();
        }
    }

    if (tabDisbursement && selected.includes('disbursement')) {
        origDisbStyle = tabDisbursement.getAttribute('style') || '';
        tabDisbursement.style.display = 'block';
        tabDisbursement.style.position = 'absolute';
        tabDisbursement.style.visibility = 'hidden';
        tabDisbursement.style.zIndex = '-9999';
        tabDisbursement.style.width = '1200px';
        tabDisbursement.style.height = '500px';
        if (window.disbChartInstance) {
            const oldAnim = window.disbChartInstance.options.animation;
            window.disbChartInstance.options.animation = false;
            window.disbChartInstance.resize();
            window.disbChartInstance.update();
            window.disbChartInstance.options.animation = oldAnim;
        }
    }

    // Helper to generate guaranteed high-resolution S-Curve chart image
    function getSCurvePrintImage(proj) {
        if (typeof Chart === 'undefined') return '';
        try {
            let labels = window.sChart?.data?.labels || [];
            let planData = window.sChart?.data?.datasets?.[0]?.data || [];
            let actualData = window.sChart?.data?.datasets?.[1]?.data || [];

            // If sChart data is missing or empty, calculate directly from proj.tasks
            if (labels.length === 0 && proj && proj.tasks && proj.tasks.length > 0) {
                let minDate = new Date("2099-01-01");
                let maxDate = new Date("2000-01-01");
                proj.tasks.forEach(t => {
                    if (t.startDate) {
                        let d = new Date(t.startDate);
                        if (d < minDate) minDate = d;
                    }
                    if (t.endDate) {
                        let d = new Date(t.endDate);
                        if (d > maxDate) maxDate = d;
                    }
                });

                if (minDate <= maxDate) {
                    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
                    const endMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
                    const now = new Date();
                    let totalWeight = 0;
                    proj.tasks.forEach(t => totalWeight += parseFloat(t.weight) || 0);
                    if (totalWeight === 0) totalWeight = 100;

                    let currentActualProj = 0;
                    proj.tasks.forEach(t => currentActualProj += ((parseFloat(t.actual) || 0) * (parseFloat(t.weight) || 0)) / 100);
                    currentActualProj = (currentActualProj / totalWeight) * 100;

                    const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                    let isPastOrCurrentMonth = true;

                    while (current <= endMonth) {
                        labels.push(thaiMonths[current.getMonth()] + " " + (current.getFullYear() + 543).toString().substring(2));
                        let eom = new Date(current.getFullYear(), current.getMonth() + 1, 0);
                        let monthPlan = 0;
                        proj.tasks.forEach(t => {
                            if (!t.startDate || !t.endDate) return;
                            let start = new Date(t.startDate);
                            let end = new Date(t.endDate);
                            let w = parseFloat(t.weight) || 0;
                            if (eom >= end) monthPlan += w;
                            else if (eom > start) monthPlan += ((eom - start) / (end - start)) * w;
                        });

                        planData.push(((monthPlan / totalWeight) * 100).toFixed(2));

                        if (isPastOrCurrentMonth) {
                            if (current.getFullYear() === now.getFullYear() && current.getMonth() === now.getMonth()) {
                                actualData.push(currentActualProj.toFixed(2));
                                isPastOrCurrentMonth = false;
                            } else if (current > now) {
                                isPastOrCurrentMonth = false;
                                actualData.push(null);
                            } else {
                                let nowPlan = 0;
                                proj.tasks.forEach(t => {
                                    if (!t.startDate || !t.endDate) return;
                                    let start = new Date(t.startDate);
                                    let end = new Date(t.endDate);
                                    let w = parseFloat(t.weight) || 0;
                                    if (now >= end) nowPlan += w;
                                    else if (now > start) nowPlan += ((now - start) / (end - start)) * w;
                                });
                                nowPlan = (nowPlan / totalWeight) * 100;
                                let ratio = nowPlan > 0 ? currentActualProj / nowPlan : 0;
                                let estimatedActual = ((monthPlan / totalWeight) * 100) * ratio;
                                if (estimatedActual > currentActualProj) estimatedActual = currentActualProj;
                                actualData.push(estimatedActual.toFixed(2));
                            }
                        } else {
                            actualData.push(null);
                        }
                        current.setMonth(current.getMonth() + 1);
                    }

                    if (proj.status === "แล้วเสร็จ") {
                        actualData = planData.map(d => d);
                    }
                }
            }

            if (labels.length === 0) return '';

            const offCanvas = document.createElement('canvas');
            offCanvas.width = 1100;
            offCanvas.height = 430;
            const ctx = offCanvas.getContext('2d');

            // White background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 1100, 430);

            // Gradients
            const gradPurple = ctx.createLinearGradient(0, 0, 0, 390);
            gradPurple.addColorStop(0, 'rgba(116, 44, 129, 0.35)');
            gradPurple.addColorStop(0.7, 'rgba(116, 44, 129, 0.06)');
            gradPurple.addColorStop(1, 'rgba(116, 44, 129, 0.0)');

            const gradGold = ctx.createLinearGradient(0, 0, 0, 390);
            gradGold.addColorStop(0, 'rgba(243, 156, 18, 0.22)');
            gradGold.addColorStop(0.7, 'rgba(243, 156, 18, 0.04)');
            gradGold.addColorStop(1, 'rgba(243, 156, 18, 0.0)');

            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'แผนงาน (Plan) %',
                            data: planData,
                            borderColor: '#F39C12',
                            backgroundColor: gradGold,
                            borderWidth: 3,
                            borderDash: [6, 4],
                            fill: true,
                            tension: 0.38,
                            pointRadius: 4.5,
                            pointBackgroundColor: '#F39C12',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2
                        },
                        {
                            label: 'ผลงานจริง (Actual) %',
                            data: actualData,
                            borderColor: '#742C81',
                            backgroundColor: gradPurple,
                            borderWidth: 3.5,
                            fill: true,
                            tension: 0.38,
                            pointRadius: 5,
                            pointBackgroundColor: '#742C81',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: false,
                    animation: false,
                    layout: {
                        padding: { top: 15, right: 30, bottom: 15, left: 15 }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                callback: v => v + '%',
                                font: { family: 'Prompt, sans-serif', size: 12, weight: '600' },
                                color: '#64748B'
                            },
                            grid: { color: '#E2E8F0' }
                        },
                        x: {
                            ticks: {
                                font: { family: 'Prompt, sans-serif', size: 12, weight: '600' },
                                color: '#334155'
                            },
                            grid: { color: '#F1F5F9' }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { family: 'Prompt, sans-serif', size: 13, weight: '600' },
                                color: '#1E293B',
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    }
                }
            });

            const imgData = offCanvas.toDataURL('image/png', 1.0);
            chart.destroy();
            return imgData;
        } catch (err) {
            console.error('Error generating print S-Curve image:', err);
            return '';
        }
    }

    // Helper to generate guaranteed high-resolution Disbursement chart image
    function getDisbursementPrintImage(proj) {
        if (typeof Chart === 'undefined') return '';
        try {
            let labels = window.disbChartInstance?.data?.labels || [];
            let planData = window.disbChartInstance?.data?.datasets?.[0]?.data || [];
            let actualData = window.disbChartInstance?.data?.datasets?.[1]?.data || [];

            const d = proj.disbursement;
            if (labels.length === 0 && d) {
                if (d.plan && d.plan.length > 0) {
                    let accPlan = 0;
                    let accPlanUpToViewedMonth = 0;
                    let targetMonthStr = d.currentViewMonth ? d.currentViewMonth.split(' ')[0] : '';
                    let foundViewMonthIndex = d.plan.length - 1;
                    if (targetMonthStr) {
                        const idx = d.plan.findIndex(pl => pl.month.includes(targetMonthStr));
                        if (idx !== -1) foundViewMonthIndex = idx;
                    }

                    d.plan.forEach((pl, idx) => {
                        labels.push(`${pl.month} ${pl.year || ''}`.trim());
                        accPlan += pl.amount;
                        planData.push(accPlan);
                        if (idx <= foundViewMonthIndex) {
                            actualData.push(d.actual && d.actual[idx] ? d.actual[idx] : 0);
                            accPlanUpToViewedMonth += pl.amount;
                        } else {
                            actualData.push(0);
                        }
                    });

                    const barLabel = targetMonthStr ? `สะสมถึง ${targetMonthStr}` : 'แผนรวม / จ่ายจริงปีนี้';
                    labels.push(barLabel);
                    planData.push(accPlanUpToViewedMonth);
                    actualData.push(d.paidCurrentYear || 0);
                } else if (d.items && d.items.length > 0) {
                    labels.push('แผนรวม', 'จ่ายจริงสะสม');
                    planData.push(d.budget || 0, 0);
                    actualData.push(0, d.totalPaid || 0);
                }
            }

            if (labels.length === 0) return '';

            const offCanvas = document.createElement('canvas');
            offCanvas.width = 1100;
            offCanvas.height = 360;
            const ctx = offCanvas.getContext('2d');

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 1100, 360);

            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'แผนเบิกจ่าย',
                            data: planData,
                            backgroundColor: 'rgba(41, 128, 185, 0.75)',
                            borderColor: 'rgba(41, 128, 185, 1)',
                            borderWidth: 1.5,
                            borderRadius: 4
                        },
                        {
                            label: 'จ่ายจริง',
                            data: actualData,
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 1.5,
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: false,
                    animation: false,
                    layout: {
                        padding: { top: 15, right: 25, bottom: 15, left: 15 }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (val) {
                                    if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M';
                                    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
                                    return val;
                                },
                                font: { family: 'Prompt, sans-serif', size: 11 },
                                color: '#64748B'
                            },
                            grid: { color: '#E2E8F0' }
                        },
                        x: {
                            ticks: {
                                font: { family: 'Prompt, sans-serif', size: 11, weight: '600' },
                                color: '#334155'
                            },
                            grid: { color: '#F1F5F9' }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { family: 'Prompt, sans-serif', size: 12, weight: '600' },
                                color: '#1E293B',
                                usePointStyle: true,
                                padding: 15
                            }
                        }
                    }
                }
            });

            const imgData = offCanvas.toDataURL('image/png', 1.0);
            chart.destroy();
            return imgData;
        } catch (err) {
            console.error('Error generating print disbursement image:', err);
            return '';
        }
    }

    // Capture S-Curve and Disbursement images with guaranteed offscreen render
    let sCurveImg = '';
    if (selected.includes('scurve')) {
        const sCurveCanvas = document.getElementById('sCurveChart');
        if (sCurveCanvas && sCurveCanvas.width > 50 && sCurveCanvas.height > 50) {
            try {
                sCurveImg = sCurveCanvas.toDataURL('image/png', 1.0);
            } catch (e) {}
        }
        if (!sCurveImg || sCurveImg === 'data:,' || sCurveImg.length < 100) {
            sCurveImg = getSCurvePrintImage(p);
        }
    }

    let disbImg = '';
    if (selected.includes('disbursement')) {
        const disbCanvas = document.getElementById('disbursementChart');
        if (disbCanvas && disbCanvas.width > 50 && disbCanvas.height > 50) {
            try {
                disbImg = disbCanvas.toDataURL('image/png', 1.0);
            } catch (e) {}
        }
        if (!disbImg || disbImg === 'data:,' || disbImg.length < 100) {
            disbImg = getDisbursementPrintImage(p);
        }
    }

    // Build print sections HTML
    let printContent = '';

    // --- 1. Executive Summary Ribbon (Always included at top of report) ---
    printContent += `
    <div class="print-kpi-ribbon">
        <div class="print-kpi-card">
            <span class="print-kpi-label">แผนงานสะสม (Plan)</span>
            <span class="print-kpi-value text-plan">${planVal.toFixed(2)}%</span>
            <span class="print-kpi-sub">ตามแผนงานหลัก WBS</span>
        </div>
        <div class="print-kpi-card">
            <span class="print-kpi-label">ผลงานจริงสะสม (Actual)</span>
            <span class="print-kpi-value text-actual">${actualVal.toFixed(2)}%</span>
            <span class="print-kpi-sub">ผลดำเนินงานล่าสุด</span>
        </div>
        <div class="print-kpi-card">
            <span class="print-kpi-label">ส่วนต่าง (Variance)</span>
            <span class="print-kpi-value ${isAhead ? 'text-success' : 'text-danger'}">${isAhead ? '+' : ''}${varianceVal}%</span>
            <span class="print-kpi-sub">${isAhead ? '● เร็วกว่า / ตามแผน' : '▲ ล่าช้ากว่าแผน'}</span>
        </div>
        <div class="print-kpi-card">
            <span class="print-kpi-label">สถานะโครงการ</span>
            <span class="print-kpi-value text-status">${p.status || 'อยู่ระหว่างก่อสร้าง'}</span>
            <span class="print-kpi-sub">${p.duration || 'ระยะเวลาตามสัญญา'}</span>
        </div>
    </div>`;

    // --- 2. Project Information Section ---
    if (selected.includes('projectInfo')) {
        printContent += `
        <div class="print-section">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-circle-info"></i></span>
                <h2 class="print-section-title">ข้อมูลโครงการ (Project Overview)</h2>
            </div>
            <table class="info-table">
                <tr>
                    <td class="label-cell">ชื่อโครงการ</td>
                    <td class="value-cell" colspan="3"><strong>${p.name}</strong></td>
                </tr>
                <tr>
                    <td class="label-cell">ประเภทการดำเนินงาน</td>
                    <td class="value-cell">${p.type || 'ดำเนินการเอง'}</td>
                    <td class="label-cell">ผู้รับจ้าง / หน่วยงาน</td>
                    <td class="value-cell">${p.contractor || 'การไฟฟ้าส่วนภูมิภาค'}</td>
                </tr>
                <tr>
                    <td class="label-cell">ผู้ควบคุมงาน กฟภ.</td>
                    <td class="value-cell">${p.supervisor || '-'}</td>
                    <td class="label-cell">คณะกรรมการตรวจรับ</td>
                    <td class="value-cell">${p.committee || '-'}</td>
                </tr>
                <tr>
                    <td class="label-cell">ระยะเวลาโครงการ</td>
                    <td class="value-cell">${p.duration || '-'} (${p.startDate || '-'} ถึง ${p.endDate || '-'})</td>
                    <td class="label-cell">สถานะปัจจุบัน</td>
                    <td class="value-cell"><span class="badge-status">${p.status}</span></td>
                </tr>
                ${p.details ? `
                <tr>
                    <td class="label-cell">รายละเอียดเพิ่มเติม</td>
                    <td class="value-cell" colspan="3">${p.details}</td>
                </tr>` : ''}
            </table>
        </div>`;
    }

    // --- 3. WBS Work Breakdown Structure Table Section ---
    if (selected.includes('wbs') && p.tasks && p.tasks.length > 0) {
        let wbsRows = '';
        let totalW = 0;
        p.tasks.forEach((t, idx) => {
            const w = parseFloat(t.weight) || 0;
            const act = parseFloat(t.actual) || 0;
            totalW += w;
            const barColor = act >= 100 ? '#10B981' : (act > 0 ? '#742C81' : '#CBD5E1');
            wbsRows += `
                <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>
                        <strong>${t.name}</strong>
                        ${t.description ? `<div class="task-desc-sub">${t.description}</div>` : ''}
                    </td>
                    <td class="text-center">${t.startDate || '-'}</td>
                    <td class="text-center">${t.endDate || '-'}</td>
                    <td class="text-center font-bold">${w.toFixed(2)}%</td>
                    <td>
                        <div class="prog-cell-content">
                            <span class="prog-num font-bold ${act >= 100 ? 'text-success' : ''}">${act.toFixed(2)}%</span>
                            <div class="print-prog-bar">
                                <div class="print-prog-fill" style="width: ${Math.min(act, 100)}%; background-color: ${barColor};"></div>
                            </div>
                        </div>
                    </td>
                </tr>`;
        });

        printContent += `
        <div class="print-section">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-list-check"></i></span>
                <h2 class="print-section-title">แผนงานก่อสร้างและผลงานจริง (Work Breakdown Structure - WBS)</h2>
            </div>
            <table class="wbs-table">
                <thead>
                    <tr>
                        <th style="width: 45px;">ลำดับ</th>
                        <th>แผนงานย่อย (Task Name)</th>
                        <th style="width: 105px;">วันที่เริ่มต้น</th>
                        <th style="width: 105px;">วันที่สิ้นสุด</th>
                        <th style="width: 95px;">น้ำหนักงาน</th>
                        <th style="width: 150px;">ผลงานสะสม</th>
                    </tr>
                </thead>
                <tbody>
                    ${wbsRows}
                </tbody>
                <tfoot>
                    <tr class="wbs-total-row">
                        <td colspan="4" style="text-align: right; font-weight: bold; padding-right: 15px;">รวมแผนงานทั้งหมด (Total)</td>
                        <td class="text-center font-bold text-plan">${totalW.toFixed(2)}%</td>
                        <td>
                            <div class="prog-cell-content">
                                <span class="prog-num font-bold text-actual">${actualVal.toFixed(2)}%</span>
                                <div class="print-prog-bar">
                                    <div class="print-prog-fill" style="width: ${Math.min(actualVal, 100)}%; background-color: #742C81;"></div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>`;
    }

    // --- 4. S-Curve Chart Section ---
    if (selected.includes('scurve')) {
        printContent += `
        <div class="print-section" style="page-break-before: always;">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-chart-line"></i></span>
                <h2 class="print-section-title">กราฟ S-Curve เปรียบเทียบแผนงานกับผลงานจริง (Plan vs Actual Progress)</h2>
            </div>
            <div class="chart-box-print">
                ${sCurveImg ? `<img src="${sCurveImg}" alt="S-Curve Chart" class="print-chart-img">` : '<p class="no-data-msg">ไม่สามารถประมวลผลกราฟ S-Curve ได้</p>'}
            </div>
        </div>`;
    }

    // --- 5. Monthly S-Curve Numerical Table (Plan vs Actual) ---
    if (selected.includes('scurveTable')) {
        let scurveTableRows = '';
        const sLabels = window.sChart?.data?.labels || [];
        const sPlans = window.sChart?.data?.datasets?.[0]?.data || [];
        const sActuals = window.sChart?.data?.datasets?.[1]?.data || [];

        if (sLabels.length > 0) {
            sLabels.forEach((lbl, idx) => {
                const pVal = sPlans[idx] !== undefined && sPlans[idx] !== null ? parseFloat(sPlans[idx]).toFixed(2) : '-';
                const hasAct = sActuals[idx] !== undefined && sActuals[idx] !== null && sActuals[idx] !== '';
                const aVal = hasAct ? parseFloat(sActuals[idx]).toFixed(2) : '-';
                
                let diffVal = '-';
                let statusLabel = '<span class="badge-pending">รอรายงาน</span>';
                if (hasAct && pVal !== '-') {
                    const diff = (parseFloat(aVal) - parseFloat(pVal)).toFixed(2);
                    const diffNum = parseFloat(diff);
                    if (diffNum >= 0) {
                        diffVal = `<span class="text-success font-bold">+${diff}%</span>`;
                        statusLabel = '<span class="badge-success">ตามแผน / เร็วกว่า</span>';
                    } else {
                        diffVal = `<span class="text-danger font-bold">${diff}%</span>`;
                        statusLabel = '<span class="badge-danger">ล่าช้ากว่าแผน</span>';
                    }
                }

                scurveTableRows += `
                    <tr>
                        <td class="text-center">${idx + 1}</td>
                        <td class="font-bold text-center">${lbl}</td>
                        <td class="text-center text-plan font-bold">${pVal !== '-' ? pVal + '%' : '-'}</td>
                        <td class="text-center text-actual font-bold">${aVal !== '-' ? aVal + '%' : '-'}</td>
                        <td class="text-center">${diffVal}</td>
                        <td class="text-center">${statusLabel}</td>
                    </tr>`;
            });

            printContent += `
            <div class="print-section">
                <div class="print-section-header">
                    <span class="section-icon"><i class="fa-solid fa-table-cells"></i></span>
                    <h2 class="print-section-title">ตารางตัวเลขความก้าวหน้าสะสมรายเดือน (S-Curve Monthly Performance)</h2>
                </div>
                <table class="wbs-table monthly-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">เดือนที่</th>
                            <th>งวดเดือน (Month)</th>
                            <th style="width: 140px;">แผนงานสะสม (Plan %)</th>
                            <th style="width: 140px;">ผลงานจริงสะสม (Actual %)</th>
                            <th style="width: 130px;">ส่วนต่าง (Variance %)</th>
                            <th style="width: 150px;">สถานะการดำเนินงาน</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${scurveTableRows}
                    </tbody>
                </table>
            </div>`;
        }
    }

    // --- 6. Gantt Chart Section ---
    if (selected.includes('gantt')) {
        let ganttContent = '';
        const allTasks = p.tasks || [];

        // Ensure window.currentGantt is stretched to full printable width (~1440px)
        if (window.currentGantt) {
            try {
                const numCols = (window.currentGantt.dates && window.currentGantt.dates.length > 0) ? window.currentGantt.dates.length : 8;
                const targetColWidth = Math.max(160, Math.floor(1440 / numCols));
                window.currentGantt.options.column_width = targetColWidth;
                window.currentGantt.render();
            } catch (err) {
                console.warn('Gantt render error before print:', err);
            }
        }

        const ganttSvg = document.querySelector('#ganttChart');
        if (ganttSvg && ganttSvg.innerHTML.trim()) {
            const svgClone = ganttSvg.cloneNode(true);
            const gridBg = ganttSvg.querySelector('.grid-background');
            const w = gridBg ? parseFloat(gridBg.getAttribute('width')) : (parseFloat(ganttSvg.getAttribute('width')) || 1440);
            const h = parseFloat(ganttSvg.getAttribute('height')) || 690;

            svgClone.setAttribute('viewBox', `0 0 ${w} ${h}`);
            svgClone.removeAttribute('width');
            svgClone.removeAttribute('height');
            svgClone.style.width = '100%';
            svgClone.style.height = 'auto';
            svgClone.style.display = 'block';

            // Explicitly set presentation fill and stroke attributes on elements so print engines render colors
            svgClone.querySelectorAll('.grid-background').forEach(el => el.setAttribute('fill', '#ffffff'));
            svgClone.querySelectorAll('.grid-header').forEach(el => {
                el.setAttribute('fill', '#f8fafc');
                el.setAttribute('stroke', '#e2e8f0');
            });
            svgClone.querySelectorAll('.grid-row').forEach((el, i) => {
                el.setAttribute('fill', i % 2 === 0 ? '#ffffff' : '#f8fafc');
            });
            svgClone.querySelectorAll('.row-line').forEach(el => el.setAttribute('stroke', '#f1f5f9'));
            svgClone.querySelectorAll('.tick').forEach(el => el.setAttribute('stroke', '#e2e8f0'));
            svgClone.querySelectorAll('.bar-wrapper .bar').forEach(el => {
                el.setAttribute('fill', '#E2E8F0');
                el.setAttribute('rx', '6');
                el.setAttribute('ry', '6');
            });
            svgClone.querySelectorAll('.bar-wrapper .bar-progress').forEach(el => {
                el.setAttribute('fill', '#742C81');
                el.setAttribute('rx', '6');
                el.setAttribute('ry', '6');
            });
            svgClone.querySelectorAll('.bar-label').forEach(el => {
                el.setAttribute('fill', '#1E293B');
                el.setAttribute('font-weight', '600');
                el.setAttribute('font-family', 'Prompt, sans-serif');
                el.setAttribute('font-size', '11px');
            });
            svgClone.querySelectorAll('text').forEach(el => {
                if (!el.getAttribute('fill')) el.setAttribute('fill', '#64748B');
                el.setAttribute('font-family', 'Prompt, Sarabun, sans-serif');
            });
            svgClone.querySelectorAll('.upper-text').forEach(el => {
                el.setAttribute('fill', '#475569');
                el.setAttribute('font-weight', '600');
            });
            svgClone.querySelectorAll('.lower-text').forEach(el => {
                el.setAttribute('fill', '#64748B');
            });

            ganttContent = svgClone.outerHTML;
        }

        printContent += `
        <div class="print-section" style="page-break-before: always;">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-chart-gantt"></i></span>
                <h2 class="print-section-title">แผนผังการดำเนินงานแกนต์ชาร์ต (Gantt Chart Timeline)</h2>
            </div>
            <div class="gantt-print-header-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="font-size: 11.5px; color: #475569;">
                    <i class="fa-solid fa-list-check" style="color: #742C81;"></i> แผนงานย่อยทั้งหมด: <strong>${allTasks.length} รายการ</strong>
                </div>
                <div style="display: flex; gap: 14px; font-size: 11px;">
                    <span style="display: inline-flex; align-items: center; gap: 5px;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #742C81; display: inline-block;"></span> ผลงานจริงสะสม (Actual)</span>
                    <span style="display: inline-flex; align-items: center; gap: 5px;"><span style="width: 12px; height: 10px; border-radius: 2px; background: #E2E8F0; display: inline-block;"></span> แผนงานตามกำหนดการ (Plan)</span>
                </div>
            </div>
            <div class="gantt-box-print">
                ${ganttContent || '<p class="no-data-msg">ไม่มีข้อมูลผังแกนต์ชาร์ต</p>'}
            </div>
        </div>`;
    }

    // --- 7. Progress Photo Gallery (Grouped by Sub-Tasks) ---
    if (selected.includes('gallery') && p.gallery && p.gallery.length > 0) {
        const validGallery = p.gallery.filter(item => item.url);
        if (validGallery.length > 0) {
            // Group photos by taskId / taskName
            const taskGroups = {};
            const tasksList = p.tasks || [];

            tasksList.forEach(t => {
                taskGroups[t.id] = {
                    id: t.id,
                    name: t.name,
                    actual: t.actual || 0,
                    photos: []
                };
            });

            const unassignedPhotos = [];

            validGallery.forEach(item => {
                let matched = false;
                if (item.taskId && taskGroups[item.taskId]) {
                    taskGroups[item.taskId].photos.push(item);
                    matched = true;
                } else if (item.taskName) {
                    const found = tasksList.find(t => t.name === item.taskName);
                    if (found && taskGroups[found.id]) {
                        taskGroups[found.id].photos.push(item);
                        matched = true;
                    }
                } else if (item.desc) {
                    const found = tasksList.find(t => item.desc.includes(t.name));
                    if (found && taskGroups[found.id]) {
                        taskGroups[found.id].photos.push(item);
                        matched = true;
                    }
                }
                if (!matched) {
                    unassignedPhotos.push(item);
                }
            });

            let galleryHtml = '';

            // Render each task group that has photos
            Object.values(taskGroups).forEach(group => {
                if (group.photos.length > 0) {
                    let photoCards = '';
                    group.photos.forEach(item => {
                        photoCards += `
                            <div class="gallery-print-card">
                                <div class="gallery-print-img-wrapper">
                                    <img src="${item.url}" onerror="this.src='mascot.jpg'" alt="${item.desc || 'ภาพความก้าวหน้า'}">
                                    <span class="gallery-print-date-badge">${item.date || '-'}</span>
                                </div>
                                <div class="gallery-print-caption">
                                    <strong>${item.desc || group.name}</strong>
                                </div>
                            </div>`;
                    });

                    galleryHtml += `
                    <div class="gallery-print-task-block">
                        <div class="gallery-print-task-header">
                            <span class="gallery-print-task-title">
                                <i class="fa-solid fa-folder-open" style="color: #742C81; margin-right: 6px;"></i> ${group.name}
                            </span>
                            <div class="gallery-print-task-meta">
                                <span class="badge-task-progress">ความก้าวหน้างาน: ${group.actual}%</span>
                                <span class="badge-photo-count">${group.photos.length} รูป</span>
                            </div>
                        </div>
                        <div class="gallery-print-grid">
                            ${photoCards}
                        </div>
                    </div>`;
                }
            });

            // Render unassigned photos if any
            if (unassignedPhotos.length > 0) {
                let generalCards = '';
                unassignedPhotos.forEach(item => {
                    generalCards += `
                        <div class="gallery-print-card">
                            <div class="gallery-print-img-wrapper">
                                <img src="${item.url}" onerror="this.src='mascot.jpg'" alt="${item.desc || 'ภาพความก้าวหน้า'}">
                                <span class="gallery-print-date-badge">${item.date || '-'}</span>
                            </div>
                            <div class="gallery-print-caption">
                                <strong>${item.desc || 'ภาพหน้างานทั่วไป'}</strong>
                            </div>
                        </div>`;
                });

                galleryHtml += `
                <div class="gallery-print-task-block">
                    <div class="gallery-print-task-header">
                        <span class="gallery-print-task-title">
                            <i class="fa-regular fa-images" style="color: #64748B; margin-right: 6px;"></i> ภาพหน้างานทั่วไป / ไม่ระบุแผนงานย่อย
                        </span>
                        <div class="gallery-print-task-meta">
                            <span class="badge-photo-count">${unassignedPhotos.length} รูป</span>
                        </div>
                    </div>
                    <div class="gallery-print-grid">
                        ${generalCards}
                    </div>
                </div>`;
            }

            printContent += `
            <div class="print-section" style="page-break-before: always;">
                <div class="print-section-header">
                    <span class="section-icon"><i class="fa-solid fa-camera-retro"></i></span>
                    <h2 class="print-section-title">รูปภาพความก้าวหน้าหน้างานก่อสร้าง (จัดกลุ่มตามแผนงานย่อย)</h2>
                </div>
                ${galleryHtml}
            </div>`;
        }
    }

    // --- 8. Disbursement Section ---
    if (selected.includes('disbursement') && p.disbursement) {
        const d = p.disbursement;
        const fmt = (num) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(num || 0);

        let disbRows = '';
        let sumBudget = 0, sumTotalPaid = 0, sumTotalCommitment = 0;
        let sumPr = 0, sumPo = 0, sumGr = 0, sumIr = 0, sumRemaining = 0;

        if (d.items && d.items.length > 0) {
            d.items.forEach((item, idx) => {
                const b = parseFloat(item.budget) || 0;
                const tp = parseFloat(item.totalPaid) || 0;
                const pr = parseFloat(item.pr) || 0;
                const po = parseFloat(item.po) || 0;
                const gr = parseFloat(item.gr) || 0;
                const ir = parseFloat(item.ir) || 0;
                const cmt = item.commitment !== undefined && item.commitment !== null && !isNaN(parseFloat(item.commitment))
                            ? parseFloat(item.commitment)
                            : (pr + po + gr + ir);
                const rm = parseFloat(item.remaining) || 0;
                const pct = b > 0 ? ((tp / b) * 100).toFixed(2) : '0.00';

                sumBudget += b;
                sumTotalPaid += tp;
                sumTotalCommitment += cmt;
                sumPr += pr;
                sumPo += po;
                sumGr += gr;
                sumIr += ir;
                sumRemaining += rm;

                let statusClass = 'badge-pending';
                if (item.status && item.status.includes('CLSD')) statusClass = 'badge-success';
                else if (item.status && (item.status.includes('REL') || item.status.includes('PREL'))) statusClass = 'badge-status';

                disbRows += `
                    <tr>
                        <td class="text-center">${idx + 1}</td>
                        <td><strong>${item.name}</strong></td>
                        <td class="text-center"><code>${item.wbs || '-'}</code></td>
                        <td class="text-right">${fmt(b)}</td>
                        <td class="text-right text-success font-bold">${fmt(tp)}</td>
                        <td class="text-right text-amber font-bold">${fmt(cmt)}</td>
                        <td class="text-right">${fmt(pr)}</td>
                        <td class="text-right">${fmt(po)}</td>
                        <td class="text-right">${fmt(gr)}</td>
                        <td class="text-right">${fmt(ir)}</td>
                        <td class="text-right text-danger">${fmt(rm)}</td>
                        <td class="text-center font-bold">${pct}%</td>
                        <td class="text-center"><span class="${statusClass}">${item.status || '-'}</span></td>
                    </tr>`;
            });
        } else {
            disbRows = '<tr><td colspan="13" class="text-center" style="color: #94A3B8; padding: 20px;">ยังไม่มีข้อมูลรายการเบิกจ่ายงบประมาณ</td></tr>';
        }

        const overallBudget = parseFloat(d.budget) || sumBudget;
        const overallPaid = parseFloat(d.totalPaid) || sumTotalPaid;
        const overallCommitment = (d.commitment !== undefined && d.commitment !== null && !isNaN(parseFloat(d.commitment)) && parseFloat(d.commitment) > 0)
            ? parseFloat(d.commitment)
            : sumTotalCommitment;
        const overallRemaining = parseFloat(d.remaining) || sumRemaining;
        const overallPct = overallBudget > 0 ? ((overallPaid / overallBudget) * 100).toFixed(2) : '0.00';

        printContent += `
        <div class="print-section" style="page-break-before: always;">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-coins"></i></span>
                <h2 class="print-section-title">ข้อมูลการเบิกจ่ายงบประมาณโครงการและภาระผูกพัน (Disbursement & Commitments)</h2>
            </div>
            
            <div class="print-disb-kpi-grid">
                <div class="print-disb-kpi-card" style="border-left: 4px solid #2563EB;">
                    <span class="kpi-label">วงเงินงบประมาณทั้งสิ้น</span>
                    <span class="kpi-val" style="color: #2563EB;">${fmt(overallBudget)}</span>
                </div>
                <div class="print-disb-kpi-card" style="border-left: 4px solid #10B981;">
                    <span class="kpi-label">เบิกจ่ายจริงสะสม</span>
                    <span class="kpi-val" style="color: #10B981;">${fmt(overallPaid)}</span>
                </div>
                <div class="print-disb-kpi-card" style="border-left: 4px solid #D97706; background: #FFFBEB;">
                    <span class="kpi-label">ผลรวมภาระผูกพัน (Commitment)</span>
                    <span class="kpi-val" style="color: #D97706;">${fmt(overallCommitment)}</span>
                    <span style="font-size: 9px; color: #B45309; display: block; margin-top: 2px;">PR + PO + GR + IR</span>
                </div>
                <div class="print-disb-kpi-card" style="border-left: 4px solid #EF4444;">
                    <span class="kpi-label">งบประมาณคงเหลือ</span>
                    <span class="kpi-val" style="color: #EF4444;">${fmt(overallRemaining)}</span>
                </div>
                <div class="print-disb-kpi-card" style="border-left: 4px solid #742C81;">
                    <span class="kpi-label">ร้อยละการเบิกจ่าย</span>
                    <span class="kpi-val" style="color: #742C81;">${overallPct}%</span>
                </div>
            </div>

            ${disbImg ? `
            <div class="chart-box-print" style="margin-bottom: 20px;">
                <img src="${disbImg}" alt="Disbursement Chart" class="print-chart-img" style="max-height: 380px;">
            </div>` : ''}
            
            <table class="wbs-table" style="font-size: 10.5px;">
                <thead>
                    <tr>
                        <th style="width: 30px;">#</th>
                        <th>รายการเบิกจ่าย</th>
                        <th style="width: 80px; text-align: center;">WBS</th>
                        <th style="width: 100px; text-align: right;">งบประมาณ</th>
                        <th style="width: 100px; text-align: right;">จ่ายจริงสะสม</th>
                        <th style="width: 105px; text-align: right; background: #5a1e66;">รวมภาระผูกพัน</th>
                        <th style="width: 75px; text-align: right;">PR</th>
                        <th style="width: 75px; text-align: right;">PO</th>
                        <th style="width: 75px; text-align: right;">GR</th>
                        <th style="width: 75px; text-align: right;">IR</th>
                        <th style="width: 95px; text-align: right;">งบคงเหลือ</th>
                        <th style="width: 55px; text-align: center;">% เบิก</th>
                        <th style="width: 75px; text-align: center;">สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    ${disbRows}
                </tbody>
                <tfoot>
                    <tr class="wbs-total-row" style="background: #F1F5F9; font-weight: bold; border-top: 2px solid #CBD5E1;">
                        <td colspan="3" style="text-align: right; font-weight: bold; padding-right: 8px;">ผลรวมทั้งหมด (Total Summary)</td>
                        <td class="text-right font-bold text-plan">${fmt(sumBudget)}</td>
                        <td class="text-right font-bold text-success">${fmt(sumTotalPaid)}</td>
                        <td class="text-right font-bold text-amber" style="background: #FEF3C7;">${fmt(sumTotalCommitment)}</td>
                        <td class="text-right font-bold">${fmt(sumPr)}</td>
                        <td class="text-right font-bold">${fmt(sumPo)}</td>
                        <td class="text-right font-bold">${fmt(sumGr)}</td>
                        <td class="text-right font-bold">${fmt(sumIr)}</td>
                        <td class="text-right font-bold text-danger">${fmt(sumRemaining)}</td>
                        <td class="text-center font-bold text-actual">${overallPct}%</td>
                        <td class="text-center">-</td>
                    </tr>
                </tfoot>
            </table>
        </div>`;
    }

    // --- 9. Official 3-Party Signatures Block ---
    if (selected.includes('signatures')) {
        printContent += `
        <div class="print-section signatures-section">
            <div class="print-section-header">
                <span class="section-icon"><i class="fa-solid fa-file-signature"></i></span>
                <h2 class="print-section-title">การตรวจรับและรับรองรายงานความก้าวหน้าโครงการ</h2>
            </div>
            <div class="signatures-grid">
                <div class="signature-card">
                    <div class="sig-title">ผู้ควบคุมงาน</div>
                    <div class="sig-space"></div>
                    <div class="sig-dots">..................................................................</div>
                    <div class="sig-name">( ${p.supervisor || '......................................................'} )</div>
                    <div class="sig-position">ผู้ควบคุมงาน การไฟฟ้าส่วนภูมิภาค</div>
                    <div class="sig-date">วันที่ ......... / ......... / .................</div>
                </div>
                <div class="signature-card">
                    <div class="sig-title">${p.type === 'ดำเนินการเอง' ? 'หัวหน้าชุดงาน / ผู้ปฏิบัติงาน' : 'ผู้รับจ้าง / ผู้แทนผู้รับจ้าง'}</div>
                    <div class="sig-space"></div>
                    <div class="sig-dots">..................................................................</div>
                    <div class="sig-name">( ${p.contractor || '......................................................'} )</div>
                    <div class="sig-position">${p.type === 'ดำเนินการเอง' ? 'การไฟฟ้าส่วนภูมิภาค' : 'ผู้รับจ้างตามสัญญา'}</div>
                    <div class="sig-date">วันที่ ......... / ......... / .................</div>
                </div>
                <div class="signature-card">
                    <div class="sig-title">ประธานกรรมการตรวจรับพัสดุ</div>
                    <div class="sig-space"></div>
                    <div class="sig-dots">..................................................................</div>
                    <div class="sig-name">( ${p.committee || '......................................................'} )</div>
                    <div class="sig-position">ประธานกรรมการตรวจรับพัสดุ</div>
                    <div class="sig-date">วันที่ ......... / ......... / .................</div>
                </div>
            </div>
        </div>`;
    }

    // --- RESTORE ORIGINAL TAB STYLES ---
    if (tabSCurve) tabSCurve.setAttribute('style', origSCurveStyle);
    if (tabGantt) tabGantt.setAttribute('style', origGanttStyle);
    if (tabDisbursement && selected.includes('disbursement')) tabDisbursement.setAttribute('style', origDisbStyle);

    // --- OPEN POPUP PRINT WINDOW ---
    const printWindow = window.open('', '_blank', 'width=1200,height=880');
    if (!printWindow) {
        alert('กรุณาอนุญาตให้เปิดหน้าต่างป๊อปอัป (Popup) เพื่อพิมพ์รายงาน PDF');
        return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>รายงานความก้าวหน้าโครงการ - ${p.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/frappe-gantt/0.6.1/frappe-gantt.css">
    <style>
        @page {
            size: A4 landscape;
            margin: 10mm 12mm 12mm 12mm;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Sarabun', sans-serif;
            color: #1E293B;
            background-color: #FFFFFF;
            font-size: 11.5px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        h1, h2, h3, h4, .font-prompt {
            font-family: 'Prompt', sans-serif;
        }

        /* Screen Action Toolbar */
        .print-action-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #742C81 0%, #531B5E 100%);
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.25);
        }
        .print-action-info {
            color: white;
            font-size: 13px;
        }
        .print-action-info strong {
            font-family: 'Prompt', sans-serif;
            font-size: 15px;
            margin-right: 8px;
        }
        .print-action-buttons {
            display: flex;
            gap: 12px;
        }
        .btn-print-action {
            padding: 8px 20px;
            border-radius: 6px;
            font-family: 'Prompt', sans-serif;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .btn-print-confirm {
            background: #F59E0B;
            color: #1E1E2D;
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
        }
        .btn-print-confirm:hover {
            background: #D97706;
            transform: translateY(-1px);
        }
        .btn-print-close {
            background: rgba(255, 255, 255, 0.15);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .btn-print-close:hover {
            background: rgba(255, 255, 255, 0.25);
        }

        /* Document Container */
        .report-page-container {
            max-width: 1140px;
            margin: 0 auto;
            padding: 20px 0;
        }

        /* Official PEA Header */
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #742C81;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }
        .report-header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .pea-emblem-badge {
            width: 48px;
            height: 48px;
            background: #742C81;
            color: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 3px 8px rgba(116, 44, 129, 0.3);
        }
        .report-title-block h1 {
            font-size: 18px;
            color: #742C81;
            font-weight: 700;
            line-height: 1.3;
            margin-bottom: 3px;
        }
        .report-title-block .doc-subtitle {
            font-size: 11.5px;
            color: #64748B;
        }
        .report-header-right {
            text-align: right;
        }
        .brand-pcts {
            font-family: 'Prompt', sans-serif;
            font-size: 22px;
            font-weight: 700;
            color: #742C81;
            letter-spacing: 0.5px;
        }
        .brand-sub {
            font-size: 9.5px;
            color: #94A3B8;
            letter-spacing: 0.3px;
        }
        .report-meta-tag {
            display: inline-block;
            margin-top: 4px;
            font-size: 10.5px;
            color: #64748B;
            background: #F8FAFC;
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid #E2E8F0;
        }

        /* Executive KPI Ribbon */
        .print-kpi-ribbon {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }
        .print-kpi-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 10px 14px;
            text-align: center;
        }
        .print-kpi-label {
            display: block;
            font-size: 10.5px;
            color: #64748B;
            margin-bottom: 3px;
            font-family: 'Prompt', sans-serif;
            font-weight: 500;
        }
        .print-kpi-value {
            display: block;
            font-family: 'Prompt', sans-serif;
            font-size: 20px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 2px;
        }
        .print-kpi-sub {
            font-size: 9.5px;
            color: #94A3B8;
        }

        /* Sections */
        .print-section {
            margin-bottom: 22px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .print-section-header {
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 6px;
            margin-bottom: 12px;
        }
        .section-icon {
            color: #742C81;
            font-size: 14px;
        }
        .print-section-title {
            font-size: 14px;
            color: #742C81;
            font-weight: 600;
        }

        /* Tables */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            overflow: hidden;
            font-size: 11.5px;
        }
        .info-table td {
            padding: 7px 12px;
            border-bottom: 1px solid #E2E8F0;
            border-right: 1px solid #E2E8F0;
        }
        .info-table .label-cell {
            width: 160px;
            background: #F8FAFC;
            color: #475569;
            font-weight: 600;
        }
        .info-table .value-cell {
            color: #1E293B;
        }

        .wbs-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            overflow: hidden;
        }
        .wbs-table thead th {
            background: #742C81;
            color: white;
            padding: 8px 8px;
            font-family: 'Prompt', sans-serif;
            font-weight: 600;
            font-size: 11px;
            text-align: left;
            border-right: 1px solid rgba(255,255,255,0.15);
        }
        .wbs-table tbody td {
            padding: 6px 8px;
            border-bottom: 1px solid #E2E8F0;
            border-right: 1px solid #F1F5F9;
            vertical-align: middle;
        }
        .wbs-table tbody tr:nth-child(even) {
            background-color: #F8FAFC;
        }
        .wbs-total-row td {
            background: #F1F5F9;
            font-family: 'Prompt', sans-serif;
            padding: 8px;
            border-top: 2px solid #CBD5E1;
        }
        .task-desc-sub {
            font-size: 9.5px;
            color: #64748B;
            margin-top: 1px;
        }

        /* Progress Bars */
        .prog-cell-content {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .prog-num {
            width: 48px;
            text-align: right;
            font-size: 10.5px;
        }
        .print-prog-bar {
            flex: 1;
            height: 6px;
            background: #E2E8F0;
            border-radius: 4px;
            overflow: hidden;
        }
        .print-prog-fill {
            height: 100%;
            border-radius: 4px;
        }

        /* Chart Images */
        .chart-box-print {
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 12px;
            background: white;
            text-align: center;
        }
        .print-chart-img {
            max-width: 100%;
            max-height: 480px;
            object-fit: contain;
            display: block;
            margin: 0 auto;
        }
        .gantt-box-print {
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            padding: 12px;
            background: white;
            width: 100%;
            box-sizing: border-box;
            overflow: visible;
        }
        .gantt-box-print svg {
            width: 100% !important;
            height: auto !important;
            display: block !important;
            background: white;
            box-sizing: border-box;
        }
        .gantt .grid-background { fill: #ffffff !important; }
        .gantt .grid-header { fill: #f8fafc !important; stroke: #e2e8f0 !important; }
        .gantt .grid-row { fill: #ffffff !important; }
        .gantt .grid-row:nth-child(even) { fill: #f8fafc !important; }
        .gantt .row-line { stroke: #f1f5f9 !important; }
        .gantt .tick { stroke: #e2e8f0 !important; }
        .gantt .today-highlight { fill: rgba(245, 158, 11, 0.15) !important; }
        .gantt .bar-wrapper .bar {
            fill: #E2E8F0 !important;
            rx: 6px !important;
            ry: 6px !important;
        }
        .gantt .bar-wrapper .bar-progress {
            fill: #742C81 !important;
            rx: 6px !important;
            ry: 6px !important;
        }
        .gantt .bar-label {
            fill: #1e293b !important;
            font-weight: 600 !important;
            font-size: 11px !important;
            font-family: 'Prompt', sans-serif !important;
        }
        .gantt text {
            font-family: 'Prompt', 'Sarabun', sans-serif !important;
            font-size: 10px !important;
            fill: #64748b !important;
        }
        .gantt .upper-text {
            fill: #475569 !important;
            font-weight: 600 !important;
        }
        .gantt .lower-text {
            fill: #64748b !important;
        }

        /* Grouped Progress Gallery */
        .gallery-print-task-block {
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            margin-bottom: 16px;
            overflow: hidden;
            background: white;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .gallery-print-task-header {
            background: #F8FAFC;
            padding: 8px 14px;
            border-bottom: 1px solid #E2E8F0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .gallery-print-task-title {
            font-family: 'Prompt', sans-serif;
            font-weight: 600;
            font-size: 12px;
            color: #1E293B;
        }
        .gallery-print-task-meta {
            display: flex;
            gap: 8px;
        }
        .badge-task-progress {
            background: #EAE0F0;
            color: #742C81;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
        }
        .badge-photo-count {
            background: #E2E8F0;
            color: #475569;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
        }
        .gallery-print-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            padding: 12px;
        }
        .gallery-print-card {
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            overflow: hidden;
            background: #FFFFFF;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .gallery-print-img-wrapper {
            position: relative;
            width: 100%;
            height: 160px;
            background: #F1F5F9;
        }
        .gallery-print-img-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .gallery-print-date-badge {
            position: absolute;
            bottom: 6px;
            right: 6px;
            background: rgba(15, 23, 42, 0.75);
            color: white;
            font-size: 9.5px;
            padding: 2px 6px;
            border-radius: 4px;
        }
        .gallery-print-caption {
            padding: 8px 10px;
            background: #FAFAFA;
            font-size: 10.5px;
            color: #334155;
            line-height: 1.4;
            min-height: 38px;
        }

        /* Disbursement KPIs */
        .print-disb-kpi-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-bottom: 14px;
        }
        .print-disb-kpi-card {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            padding: 10px 14px;
            text-align: center;
        }
        .print-disb-kpi-card .kpi-label {
            display: block;
            font-size: 10.5px;
            color: #64748B;
            margin-bottom: 2px;
        }
        .print-disb-kpi-card .kpi-val {
            font-family: 'Prompt', sans-serif;
            font-size: 17px;
            font-weight: 700;
        }

        /* Signatures Section */
        .signatures-section {
            margin-top: 24px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .signatures-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-top: 10px;
        }
        .signature-card {
            border: 1px solid #CBD5E1;
            border-radius: 8px;
            padding: 16px 12px 14px;
            text-align: center;
            background: #FFFFFF;
        }
        .sig-title {
            font-family: 'Prompt', sans-serif;
            font-weight: 600;
            font-size: 11.5px;
            color: #334155;
            margin-bottom: 30px;
        }
        .sig-space {
            height: 30px;
        }
        .sig-dots {
            font-size: 11px;
            color: #94A3B8;
            margin-bottom: 6px;
            letter-spacing: 1px;
        }
        .sig-name {
            font-size: 11.5px;
            font-weight: 600;
            color: #1E293B;
            margin-bottom: 4px;
        }
        .sig-position {
            font-size: 10px;
            color: #64748B;
            margin-bottom: 12px;
        }
        .sig-date {
            font-size: 10px;
            color: #94A3B8;
        }

        /* Badges & Utility Colors */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-plan { color: #D97706; }
        .text-amber { color: #D97706; }
        .text-actual { color: #742C81; }
        .text-success { color: #10B981; }
        .text-danger { color: #EF4444; }
        .badge-status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10.5px;
            font-weight: 600;
            background: #EAE0F0;
            color: #742C81;
        }
        .badge-success {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9.5px;
            font-weight: 600;
            background: #D1FAE5;
            color: #065F46;
        }
        .badge-danger {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9.5px;
            font-weight: 600;
            background: #FEE2E2;
            color: #991B1B;
        }
        .badge-pending {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9.5px;
            font-weight: 600;
            background: #F1F5F9;
            color: #64748B;
        }
        .no-data-msg {
            color: #94A3B8;
            font-style: italic;
            padding: 24px;
            text-align: center;
        }

        /* Footer */
        .report-footer {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px solid #E2E8F0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9.5px;
            color: #94A3B8;
        }

        /* Print Media Queries */
        @media print {
            .print-action-bar {
                display: none !important;
            }
            body {
                padding-top: 0 !important;
                background: white !important;
            }
            .report-page-container {
                max-width: 100% !important;
                padding: 0 !important;
            }
            .print-section {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .wbs-table {
                page-break-inside: auto;
            }
            .wbs-table tr {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .wbs-table thead {
                display: table-header-group;
            }
            .gallery-print-task-block {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .signatures-section {
                page-break-inside: avoid;
                break-inside: avoid;
            }
        }
        @media screen {
            body {
                padding-top: 60px;
                background-color: #F1F5F9;
            }
            .report-page-container {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                margin-top: 20px;
                margin-bottom: 30px;
            }
        }
    </style>
</head>
<body>
    <!-- Screen Action Bar -->
    <div class="print-action-bar">
        <div class="print-action-info">
            <strong><i class="fa-solid fa-file-lines"></i> รายงานความก้าวหน้าโครงการก่อสร้าง (PCTS)</strong>
            <span>${p.name}</span>
        </div>
        <div class="print-action-buttons">
            <button class="btn-print-action btn-print-confirm" onclick="window.print()">
                <i class="fa-solid fa-print"></i> พิมพ์รายงาน / บันทึก PDF
            </button>
            <button class="btn-print-action btn-print-close" onclick="window.close()">
                <i class="fa-solid fa-xmark"></i> ปิดหน้านี้
            </button>
        </div>
    </div>

    <!-- Main Printable Content Container -->
    <div class="report-page-container">
        <!-- Header -->
        <div class="report-header">
            <div class="report-header-left">
                <div class="pea-emblem-badge">
                    <i class="fa-solid fa-bolt"></i>
                </div>
                <div class="report-title-block">
                    <h1>${p.name}</h1>
                    <div class="doc-subtitle">รายงานติดตามและประเมินผลความก้าวหน้าโครงการก่อสร้าง &bull; ข้อมูล ณ วันที่ ${today}</div>
                </div>
            </div>
            <div class="report-header-right">
                <div class="brand-pcts">PCTS</div>
                <div class="brand-sub">PEA Construction Tracking System</div>
                <span class="report-meta-tag">พิมพ์เมื่อ: ${printTimestamp}</span>
            </div>
        </div>

        ${printContent}

        <!-- Footer -->
        <div class="report-footer">
            <span>ระบบติดตามและบริหารโครงการก่อสร้าง การไฟฟ้าส่วนภูมิภาค (PCTS)</span>
            <span>เอกสารนี้สร้างขึ้นโดยระบบอัตโนมัติ &bull; วันที่ ${today}</span>
        </div>
    </div>
</body>
</html>`);
    printWindow.document.close();
};

// ==========================================
// Disbursement Feature
// ==========================================
let currentDisbUploadType = 'actual';
let currentDisbWorkbook = null;

window.openDisbursementUploadModal = function (type) {
    currentDisbUploadType = type;
    document.getElementById('disbUploadTitle').innerHTML = type === 'actual' ? '<i class="fa-solid fa-upload"></i> นำเข้าข้อมูลเบิกจ่าย (092)' : '<i class="fa-solid fa-upload"></i> นำเข้าแผนเบิกจ่าย';
    document.getElementById('disbFileType').value = type;
    document.getElementById('disbFileType').disabled = true;

    const yearSelect = document.getElementById('disbUploadYear');
    if (yearSelect.options.length === 0) {
        const currentYear = new Date().getFullYear() + 543;
        for (let i = currentYear - 3; i <= currentYear + 3; i++) {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            if (i === currentYear) opt.selected = true;
            yearSelect.appendChild(opt);
        }
    }

    const updateMonthTicks = () => {
        const y = yearSelect.value;
        const mData = window.currentProjectViewData?.disbursement?.monthlyData || {};
        const monthSelect = document.getElementById('disbUploadMonth');
        Array.from(monthSelect.options).forEach(opt => {
            const cleanText = opt.textContent.replace(' ✅', '');
            if (mData[`${opt.value} ${y}`]) {
                opt.textContent = cleanText + ' ✅';
            } else {
                opt.textContent = cleanText;
            }
        });
    };

    yearSelect.onchange = updateMonthTicks;
    updateMonthTicks();

    document.getElementById('disbMonthGroup').style.display = type === 'actual' ? 'flex' : 'none';
    document.getElementById('disbFileInput').value = '';
    document.getElementById('disbSheetSelector').style.display = 'none';
    currentDisbWorkbook = null;
    document.getElementById('disbursementUploadModal').style.display = 'flex';
};

window.closeDisbursementUploadModal = function () {
    document.getElementById('disbursementUploadModal').style.display = 'none';
};

document.getElementById('disbFileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        currentDisbWorkbook = workbook;

        const sheetSelect = document.getElementById('disbSheetSelect');
        sheetSelect.innerHTML = '';

        workbook.SheetNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            sheetSelect.appendChild(option);
        });

        if (currentDisbUploadType === 'actual') {
            const zbudr = workbook.SheetNames.find(n => n.toLowerCase().includes('zbudr092'));
            if (zbudr) sheetSelect.value = zbudr;
        } else {
            sheetSelect.value = workbook.SheetNames[0];
        }

        document.getElementById('disbSheetSelector').style.display = 'block';
    };
    reader.readAsArrayBuffer(file);
});

document.getElementById('disbursementUploadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentDisbWorkbook) {
        alert('กรุณาเลือกไฟล์ Excel');
        return;
    }

    const sheetName = document.getElementById('disbSheetSelect').value;
    const worksheet = currentDisbWorkbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

    if (currentDisbUploadType === 'actual') {
        const monthStr = document.getElementById('disbUploadMonth').value;
        const yearStr = document.getElementById('disbUploadYear').value;
        parseDisbursement092(data, `${monthStr} ${yearStr}`);
    } else {
        parseDisbursementPlan(data);
    }

    closeDisbursementUploadModal();
    saveProjects();
    if (window.currentProjectViewData) {
        window.renderDisbursementTab(window.currentProjectViewData);
    }
    alert('นำเข้าข้อมูลสำเร็จ');
});

function parseDisbursement092(data, month) {
    if (!window.currentProjectViewData) return;
    const p = window.currentProjectViewData;

    if (!p.disbursement) p.disbursement = { items: [], plan: [], actual: [], monthlyData: {}, budget: 0, paidPrevYear: 0, paidCurrentYear: 0, totalPaid: 0, remaining: 0 };
    if (!p.disbursement.monthlyData) p.disbursement.monthlyData = {};

    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(20, data.length); i++) {
        if (data[i] && data[i].some(cell => cell && typeof cell === 'string' && (cell.includes('WBS') || cell.includes('วงเงินงบประมาณ')))) {
            headerRowIdx = i;
            break;
        }
    }

    if (headerRowIdx === -1) {
        alert('ไม่พบหัวตาราง WBS หรือ วงเงินงบประมาณ ใน Sheet นี้');
        return;
    }

    const headers = data[headerRowIdx];
    const colWbs = headers.findIndex(h => typeof h === 'string' && h.includes('WBS'));
    const colName = headers.findIndex(h => typeof h === 'string' && h.includes('รายการ'));
    const colBudget = headers.findIndex(h => typeof h === 'string' && h.includes('วงเงินงบประมาณ'));
    const colPaidPrev = headers.findIndex(h => typeof h === 'string' && h.includes('รวมจ่ายจริงถึงสิ้นปีก่อนหน้า'));
    const colPaidCurr = headers.findIndex(h => typeof h === 'string' && h.includes('รวมจ่ายจริงปีปัจจุบัน'));
    const colPaidTotal = headers.findIndex(h => typeof h === 'string' && h === 'รวมจ่ายจริง');
    const colCommitment = headers.findIndex(h => typeof h === 'string' && h.includes('ภาระผูกพัน'));
    const colRemaining = headers.findIndex(h => typeof h === 'string' && h.includes('วงเงินคงเหลือยังไม่ดำเนินการ'));
    const colStatus = headers.findIndex(h => typeof h === 'string' && h.includes('สถานะ'));

    let colPR = -1, colPO = -1, colGR = -1, colIR = -1;
    for (let i = headerRowIdx; i <= headerRowIdx + 2 && i < data.length; i++) {
        const r = data[i];
        if (!r) continue;
        if (colPR === -1) colPR = r.findIndex(h => typeof h === 'string' && (h.toUpperCase().includes('PR') || h.includes('พีอาร์') || h.includes('ใบขอซื้อ')));
        if (colPO === -1) colPO = r.findIndex(h => typeof h === 'string' && (h.toUpperCase().includes('PO') || h.includes('พีโอ') || h.includes('ใบสั่งซื้อ') || h.includes('ใบสั่งจ้าง')));
        if (colGR === -1) colGR = r.findIndex(h => typeof h === 'string' && (h.toUpperCase().includes('GR') || h.includes('จีอาร์') || h.includes('ตรวจรับ')));
        if (colIR === -1) colIR = r.findIndex(h => typeof h === 'string' && (h.toUpperCase().includes('IR') || h.includes('ไออาร์') || h.includes('ตั้งหนี้')));
    }

    const monthData = {
        items: [],
        budget: 0, paidPrevYear: 0, paidCurrentYear: 0, totalPaid: 0, commitment: 0, remaining: 0
    };

    for (let i = headerRowIdx + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        const wbs = row[colWbs];
        if (!wbs || typeof wbs !== 'string' || !wbs.includes('I-')) continue;
        if (row[colName] && typeof row[colName] === 'string' && row[colName].startsWith('รวม')) continue;

        const b = parseFloat(row[colBudget]) || 0;
        const pp = parseFloat(row[colPaidPrev]) || 0;
        const pc = parseFloat(row[colPaidCurr]) || 0;
        let tp = parseFloat(row[colPaidTotal]);
        if (isNaN(tp)) tp = pp + pc;
        const pr = colPR !== -1 ? (parseFloat(row[colPR]) || 0) : 0;
        const po = colPO !== -1 ? (parseFloat(row[colPO]) || 0) : 0;
        const gr = colGR !== -1 ? (parseFloat(row[colGR]) || 0) : 0;
        const ir = colIR !== -1 ? (parseFloat(row[colIR]) || 0) : 0;
        const cmt = colCommitment !== -1 ? (parseFloat(row[colCommitment]) || 0) : (pr + po + gr + ir);
        const rm = parseFloat(row[colRemaining]) || 0;

        monthData.items.push({
            name: (row[colName] || '-').toString().trim(),
            wbs: wbs.trim(),
            budget: b,
            paidPrev: pp,
            paidCurr: pc,
            totalPaid: tp,
            commitment: cmt,
            pr: pr,
            po: po,
            gr: gr,
            ir: ir,
            remaining: rm,
            status: (row[colStatus] || '').toString().trim()
        });
    }

    monthData.budget = monthData.items.reduce((sum, item) => sum + item.budget, 0);
    monthData.paidPrevYear = monthData.items.reduce((sum, item) => sum + item.paidPrev, 0);
    monthData.paidCurrentYear = monthData.items.reduce((sum, item) => sum + item.paidCurr, 0);
    monthData.totalPaid = monthData.items.reduce((sum, item) => sum + item.totalPaid, 0);
    monthData.commitment = monthData.items.reduce((sum, item) => sum + (item.commitment || 0), 0);
    monthData.remaining = monthData.items.reduce((sum, item) => sum + item.remaining, 0);

    p.disbursement.monthlyData[month] = monthData;

    updateActualFromMonthly(p.disbursement);

    // Set to view this month automatically
    p.disbursement.currentViewMonth = month;
    applyDisbursementMonthView(p.disbursement);
}

function updateActualFromMonthly(disb) {
    if (!disb.plan || disb.plan.length === 0) {
        const displayMonths = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
        disb.plan = displayMonths.map(m => ({ month: m, year: '', amount: 0 }));
    }

    disb.actual = disb.plan.map(pItem => {
        const planMonthCode = pItem.month.replace(/[\.\s]/g, '').trim();
        const targetMonths = ['ตค', 'พย', 'ธค', 'มค', 'กพ', 'มีค', 'เมย', 'พค', 'มิย', 'กค', 'สค', 'กย'];
        const displayMonths = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
        const mIndex = targetMonths.indexOf(planMonthCode);
        if (mIndex !== -1) {
            let lookupKey = displayMonths[mIndex] + ' ' + (pItem.year || '');
            lookupKey = lookupKey.trim();
            if (disb.monthlyData[lookupKey]) {
                return disb.monthlyData[lookupKey].totalPaid;
            }

            const keys = Object.keys(disb.monthlyData);
            const fallbackKey = keys.find(k => k.startsWith(displayMonths[mIndex]));
            if (fallbackKey) {
                return disb.monthlyData[fallbackKey].totalPaid;
            }
        }
        return 0;
    });
}

function applyDisbursementMonthView(disb) {
    if (!disb.monthlyData) return;
    const m = disb.currentViewMonth;
    const data = disb.monthlyData[m];
    if (!data) return;

    disb.items = data.items;
    disb.budget = data.budget;
    disb.paidPrevYear = data.paidPrevYear;
    disb.paidCurrentYear = data.paidCurrentYear;
    disb.totalPaid = data.totalPaid;
    disb.commitment = data.commitment;
    disb.remaining = data.remaining;
}

window.changeDisbursementViewMonth = function () {
    if (!window.currentProjectViewData || !window.currentProjectViewData.disbursement) return;
    const disb = window.currentProjectViewData.disbursement;
    const select = document.getElementById('disbViewMonthSelect');
    if (select.value === 'latest') return;

    disb.currentViewMonth = select.value;
    applyDisbursementMonthView(disb);
    window.renderDisbursementTab(window.currentProjectViewData);
};

function parseDisbursementPlan(data) {
    if (!window.currentProjectViewData) return;
    const p = window.currentProjectViewData;

    if (!p.disbursement) p.disbursement = { items: [], plan: [], actual: [], budget: 0, paidPrevYear: 0, paidCurrentYear: 0, totalPaid: 0, remaining: 0 };

    // Normalize string by removing dots and spaces
    const normalizeMonth = (m) => m.replace(/[\.\s]/g, '').trim();
    const targetMonths = ['ตค', 'พย', 'ธค', 'มค', 'กพ', 'มีค', 'เมย', 'พค', 'มิย', 'กค', 'สค', 'กย'];
    const displayMonths = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];

    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(20, data.length); i++) {
        if (data[i] && data[i].some(cell => {
            if (typeof cell !== 'string') return false;
            const norm = normalizeMonth(cell);
            return norm === 'ตค' || norm === 'พย';
        })) {
            headerRowIdx = i;
            break;
        }
    }

    if (headerRowIdx === -1) {
        alert('ไม่พบแถวเดือน (ต.ค., พ.ย.) ใน Sheet นี้');
        return;
    }

    const monthRow = data[headerRowIdx];
    const yearRow = data[headerRowIdx - 1] || [];
    const planCols = [];
    let currentYear = '';

    for (let j = 0; j < monthRow.length; j++) {
        if (yearRow[j] && typeof yearRow[j] === 'string' && yearRow[j].includes('ปี')) {
            const match = yearRow[j].match(/\d{4}/);
            if (match) currentYear = match[0];
        }

        const cell = monthRow[j];
        if (typeof cell === 'string') {
            const norm = normalizeMonth(cell);
            const mIndex = targetMonths.findIndex(m => norm.includes(m));
            if (mIndex !== -1) {
                planCols.push({ col: j, month: displayMonths[mIndex], year: currentYear });
            }
        }
    }

    p.disbursement.plan = planCols.map(c => ({ month: c.month, year: c.year, amount: 0 }));

    const colWbs = monthRow.findIndex(h => typeof h === 'string' && h.toUpperCase().includes('WBS'));

    for (let i = headerRowIdx + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        const hasWbs = colWbs >= 0 && row[colWbs] && typeof row[colWbs] === 'string' && row[colWbs].includes('I-');

        if (hasWbs) {
            planCols.forEach((c, idx) => {
                const val = parseFloat(row[c.col]);
                if (!isNaN(val)) {
                    p.disbursement.plan[idx].amount += val;
                }
            });
        }
    }
}

window.renderDisbursementTab = function (p) {
    const d = p.disbursement;
    const fmt = (num) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(num || 0);

    if (!d) {
        document.getElementById('disbBudget').textContent = '-';
        document.getElementById('disbPaid').textContent = '-';
        document.getElementById('disbCommitment').textContent = '-';
        document.getElementById('disbRemaining').textContent = '-';
        document.getElementById('disbPercent').textContent = '-';
        document.getElementById('disbursementTableBody').innerHTML = '<tr><td colspan="14" style="text-align:center; color: #999;">ยังไม่มีข้อมูลเบิกจ่าย — กรุณานำเข้าไฟล์ Excel</td></tr>';
        if (window.disbChartInstance) window.disbChartInstance.destroy();
        document.getElementById('disbViewMonthSelect').style.display = 'none';
        return;
    }

    const monthSelect = document.getElementById('disbViewMonthSelect');
    if (d.monthlyData) {
        Object.keys(d.monthlyData).forEach(k => {
            if (!k.includes(' ')) {
                delete d.monthlyData[k];
            }
        });
    }

    if (d.monthlyData && Object.keys(d.monthlyData).length > 0) {
        monthSelect.style.display = 'inline-block';
        monthSelect.innerHTML = '';

        const keys = Object.keys(d.monthlyData);
        const monthOrder = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        keys.sort((a, b) => {
            const partsA = a.split(' ');
            const partsB = b.split(' ');
            const mA = partsA[0];
            const yA = partsA[1] || '0';
            const mB = partsB[0];
            const yB = partsB[1] || '0';
            if (yA !== yB) return parseInt(yA) - parseInt(yB);
            return monthOrder.indexOf(mA) - monthOrder.indexOf(mB);
        });

        keys.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = `ข้อมูลเดือน: ${m}`;
            if (m === d.currentViewMonth) opt.selected = true;
            monthSelect.appendChild(opt);
        });
    } else {
        monthSelect.style.display = 'none';
    }

    document.getElementById('disbBudget').textContent = fmt(d.budget);
    document.getElementById('disbPaid').textContent = fmt(d.totalPaid);
    document.getElementById('disbCommitment').textContent = fmt(d.commitment || 0);
    document.getElementById('disbRemaining').textContent = fmt(d.remaining);

    const percent = d.budget ? ((d.totalPaid / d.budget) * 100).toFixed(2) : 0;
    document.getElementById('disbPercent').textContent = `${percent}%`;

    const tbody = document.getElementById('disbursementTableBody');
    if (d.items && d.items.length > 0) {
        tbody.innerHTML = '';
        let sumBudget = 0, sumTotalPaid = 0, sumBudgetRemaining = 0, sumTotalCommitment = 0;
        let sumPr = 0, sumPo = 0, sumGr = 0, sumIr = 0, sumRemaining = 0;

        d.items.forEach((item, idx) => {
            let statusClass = 'disb-status-open';
            if (item.status.includes('CLSD')) statusClass = 'disb-status-clsd';
            if (item.status.includes('PREL')) statusClass = 'disb-status-prel';

            let pct = 0;
            if (item.budget && item.budget > 0) {
                pct = ((item.totalPaid / item.budget) * 100).toFixed(2);
            }

            let budgetRemaining = (item.budget || 0) - (item.totalPaid || 0);
            let totalCommitment = (item.pr || 0) + (item.po || 0) + (item.gr || 0) + (item.ir || 0);

            sumBudget += item.budget || 0;
            sumTotalPaid += item.totalPaid || 0;
            sumBudgetRemaining += budgetRemaining;
            sumTotalCommitment += totalCommitment;
            sumPr += item.pr || 0;
            sumPo += item.po || 0;
            sumGr += item.gr || 0;
            sumIr += item.ir || 0;
            sumRemaining += item.remaining || 0;

            tbody.innerHTML += `
                <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td>${item.name}</td>
                    <td><code>${item.wbs}</code></td>
                    <td style="text-align: right;">${fmt(item.budget)}</td>
                    <td style="text-align: right;">${fmt(item.totalPaid)}</td>
                    <td style="text-align: right; color: #2980b9; font-weight: 500;">${fmt(budgetRemaining)}</td>
                    <td style="text-align: right; color: #e74c3c; font-weight: 500;">${fmt(totalCommitment)}</td>
                    <td style="text-align: right;">${fmt(item.pr || 0)}</td>
                    <td style="text-align: right;">${fmt(item.po || 0)}</td>
                    <td style="text-align: right;">${fmt(item.gr || 0)}</td>
                    <td style="text-align: right;">${fmt(item.ir || 0)}</td>
                    <td style="text-align: right;">${fmt(item.remaining)}</td>
                    <td style="text-align: right;">${pct}%</td>
                    <td style="text-align: center;"><span class="disb-status-tag ${statusClass}">${item.status || '-'}</span></td>
                </tr>
            `;
        });

        let sumPct = sumBudget > 0 ? ((sumTotalPaid / sumBudget) * 100).toFixed(2) : 0;
        tbody.innerHTML += `
            <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="text-align: right;">รวมทั้งหมด:</td>
                <td style="text-align: right;">${fmt(sumBudget)}</td>
                <td style="text-align: right;">${fmt(sumTotalPaid)}</td>
                <td style="text-align: right; color: #2980b9;">${fmt(sumBudgetRemaining)}</td>
                <td style="text-align: right; color: #e74c3c;">${fmt(sumTotalCommitment)}</td>
                <td style="text-align: right;">${fmt(sumPr)}</td>
                <td style="text-align: right;">${fmt(sumPo)}</td>
                <td style="text-align: right;">${fmt(sumGr)}</td>
                <td style="text-align: right;">${fmt(sumIr)}</td>
                <td style="text-align: right;">${fmt(sumRemaining)}</td>
                <td style="text-align: right;">${sumPct}%</td>
                <td></td>
            </tr>
        `;
    } else {
        tbody.innerHTML = '<tr><td colspan="14" style="text-align:center; color: #999;">ยังไม่มีข้อมูลรายการเบิกจ่าย</td></tr>';
    }

    renderDisbursementChart(p);
};

window.disbChartInstance = null;
window.renderDisbursementChart = function (p) {
    const ctx = document.getElementById('disbursementChart');
    if (!ctx) return;

    if (window.disbChartInstance) {
        window.disbChartInstance.destroy();
    }

    const d = p.disbursement;
    if (!d || (!d.plan?.length && !d.items?.length)) return;

    const labels = [];
    const planData = [];
    const actualData = [];

    if (d.plan && d.plan.length > 0) {
        let accPlan = 0;
        let accPlanUpToViewedMonth = 0;

        let targetMonthStr = '';
        if (d.currentViewMonth) {
            targetMonthStr = d.currentViewMonth.split(' ')[0]; // Extract "ม.ค." from "ม.ค. 2567"
        }

        let foundViewMonthIndex = d.plan.length - 1;
        if (targetMonthStr) {
            const idx = d.plan.findIndex(p => p.month.includes(targetMonthStr));
            if (idx !== -1) foundViewMonthIndex = idx;
        }

        d.plan.forEach((pl, idx) => {
            labels.push(`${pl.month} ${pl.year || ''}`.trim());
            accPlan += pl.amount;
            planData.push(accPlan);

            if (idx <= foundViewMonthIndex) {
                actualData.push(d.actual && d.actual[idx] ? d.actual[idx] : 0);
                accPlanUpToViewedMonth += pl.amount;
            } else {
                actualData.push(0);
            }
        });

        const barLabel = targetMonthStr ? `สะสมถึง ${targetMonthStr}` : 'แผนรวม / จ่ายจริงปีนี้';
        labels.push(barLabel);
        planData.push(accPlanUpToViewedMonth);
        actualData.push(d.paidCurrentYear || 0);

    } else if (d.items && d.items.length > 0) {
        labels.push('แผนรวม', 'จ่ายจริงสะสม');
        planData.push(d.budget || 0, 0);
        actualData.push(0, d.totalPaid || 0);
    }

    window.disbChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'แผนเบิกจ่าย',
                    data: planData,
                    backgroundColor: 'rgba(41, 128, 185, 0.7)',
                    borderColor: 'rgba(41, 128, 185, 1)',
                    borderWidth: 1
                },
                {
                    label: 'จ่ายจริง',
                    data: actualData,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(39, 174, 96, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return new Intl.NumberFormat('th-TH', { notation: "compact", compactDisplay: "short" }).format(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': ' + new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(context.raw);
                        }
                    }
                }
            }
        }
    });
};

// --- AI Chatbox Logic ---
window.populateChatboxProjects = function () {
    const select = document.getElementById('chatProjectSelect');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = '<option value="all" style="color: black;">พูดคุยทั่วไป (ไม่เจาะจงโครงการ)</option>';

    if (typeof projects !== 'undefined') {
        projects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.style.color = "black";
            opt.text = p.name;
            select.appendChild(opt);
        });
    }

    if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
        select.value = currentVal;
    }
};

window.toggleChatbox = function () {
    const chatbox = document.getElementById('chatboxPanel');
    if (chatbox.style.display === 'none' || !chatbox.style.display) {
        populateChatboxProjects();
        chatbox.style.display = 'flex';
        document.getElementById('chatInput').focus();
    } else {
        chatbox.style.display = 'none';
    }
};

window.handleChatKeyPress = function (event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
};

window.sendChatMessage = function () {
    const input = document.getElementById('chatInput');
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
    const div = document.createElement('div');
    div.className = 'chat-message ' + sender;
    div.innerText = text;
    msgContainer.appendChild(div);
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

function botReply(userMsg) {
    // Show loading message
    const msgContainer = document.getElementById('chatboxMessages');
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

    let contextText = "";
    let imageParts = [];

    if (selectedProjectId !== 'all' && typeof projects !== 'undefined') {
        const p = projects.find(proj => proj.id == selectedProjectId);
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
    } else if (selectedProjectId === 'all' && typeof projects !== 'undefined') {
        contextText = "ข้อมูลภาพรวมของทุกโครงการที่มีในระบบ:\n\n";
        projects.forEach(p => {
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

    db.functions.invoke('gemini-proxy', {
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
                    } catch (__) {}
                }
            }
            appendMessage(`เกิดข้อผิดพลาดในการเชื่อมต่อ: ${errMsg}`, 'bot');
        } else if (data && data.error) {
            console.error('Gemini API Error:', data.error);
            appendMessage(`เกิดข้อผิดพลาดจาก API: ${data.error}`, 'bot');
        } else if (data && data.candidates && data.candidates.length > 0) {
            const parts = data.candidates[0]?.content?.parts || [];
            const textPart = parts.find(p => p.text);
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
    })
    .catch(error => {
        console.error('Fetch Error:', error);
        const loadingEl = document.getElementById('chatLoadingIndicator');
        if (loadingEl) loadingEl.remove();
        appendMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาลองใหม่อีกครั้งครับ", 'bot');
    });
}

window.openImageModal = function (url) {
    const modal = document.getElementById('imageViewerModal');
    if (modal) {
        document.getElementById('imageViewerSrc').src = url;
        modal.style.display = 'flex';
    }
};

window.closeImageModal = function () {
    const modal = document.getElementById('imageViewerModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('imageViewerSrc').src = '';
    }
};

window.getStatusBadgeClass = function (status) {
    if (status === 'แล้วเสร็จ') return 'status-completed';
    if (status === 'อยู่ระหว่างจัดจ้าง') return 'status-procurement';
    if (status === 'อยู่ระหว่างออกแบบประมาณการ') return 'status-design';
    if (status === 'อยู่ระหว่างรองบประมาณ') return 'status-budget';
    return 'status-active';
};
