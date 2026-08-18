// Default Data
const defaultProjects = [
    {
        id: 1,
        name: "สถานีไฟฟ้าสมุทรสาคร 18 (ชั่วคราว)",
        contractor: "บริษัท รับเหมาไฟฟ้า จำกัด",
        supervisor: "นายสมชาย ใจดี",
        committee: "คณะกรรมการชุดที่ 2",
        duration: "7 เดือน",
        status: "กำลังดำเนินการ",
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
        gallery: []
    },
    {
        id: 2,
        name: "สถานีไฟฟ้ากาญจนบุรี 5 (ชั่วคราว)",
        contractor: "บริษัท รับเหมาไฟฟ้า จำกัด",
        supervisor: "นายสมชาย ใจดี",
        committee: "คณะกรรมการชุดที่ 2",
        duration: "7 เดือน",
        status: "กำลังดำเนินการ",
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

let projects = [];

window.loadProjects = async function() {
    try {
        const { data, error } = await db.from('projects').select('*').order('id', { ascending: true });
        if (error) throw error;
        
        if (data && data.length > 0) {
            projects = data.map(dbProj => ({
                id: dbProj.id,
                name: dbProj.name,
                status: dbProj.status,
                budget: dbProj.budget,
                duration: dbProj.duration,
                startDate: dbProj.start_date,
                endDate: dbProj.end_date,
                contractor: dbProj.contractor,
                details: dbProj.details,
                tasks: dbProj.tasks || [],
                gallery: dbProj.gallery || []
            }));
        } else {
            projects = defaultProjects;
            await saveProjects();
        }
    } catch (e) {
        console.error('Supabase Load Error:', e);
        alert('โหลดข้อมูลจาก Supabase ไม่สำเร็จ ระบบจะใช้ข้อมูลจำลองแทน');
        projects = defaultProjects;
    }
}

window.saveProjects = async function() {
    try {
        const dbProjects = projects.map(p => ({
            id: p.id,
            name: p.name,
            status: p.status,
            budget: p.budget || '',
            duration: p.duration || '',
            start_date: p.startDate || null,
            end_date: p.endDate || null,
            contractor: p.contractor || '',
            details: p.details || '',
            tasks: p.tasks || [],
            gallery: p.gallery || []
        }));
        const { error } = await db.from('projects').upsert(dbProjects);
        if (error) throw error;
    } catch (e) {
        console.error('Supabase Save Error:', e);
        alert('บันทึกข้อมูลไม่สำเร็จ: ' + (e.message || 'โปรดตรวจสอบการตั้งค่าฐานข้อมูล (RLS) หรือการเชื่อมต่ออินเทอร์เน็ต'));
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
    if(p.status === "แล้วเสร็จ") { planProg = 100; actualProg = 100; }
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
    
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.sidebar-nav li');
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
            if(targetId === 'project-detail-view') {
                if(sChart) sChart.resize();
            }
            if(targetId === 'calendar-view' && calendar) {
                calendar.refetchEvents();
                calendar.render();
            }
        });
    });

    // --- Role & Authentication Logic ---
    const roleAdminItems = document.querySelectorAll('.role-admin');
    const roleEditorItems = document.querySelectorAll('.role-editor');
    const currentUserRoleText = document.getElementById('currentUserRole');

    window.updateRole = function(role) {
        document.querySelector('[data-target="dashboard-view"]').click();

        if (role === 'viewer') {
            roleAdminItems.forEach(el => el.style.display = 'none');
            roleEditorItems.forEach(el => el.style.display = 'none');
            currentUserRoleText.textContent = 'Viewer (บุคคลทั่วไป)';
        } else if (role === 'editor') {
            roleAdminItems.forEach(el => el.style.display = 'none');
            roleEditorItems.forEach(el => el.style.display = 'flex');
            currentUserRoleText.textContent = 'Editor (ผู้ควบคุมงาน)';
        } else if (role === 'admin') {
            roleAdminItems.forEach(el => el.style.display = 'flex');
            roleEditorItems.forEach(el => el.style.display = 'flex');
            currentUserRoleText.textContent = 'Admin (ผู้ดูแลระบบ)';
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
        }
    });

    window.logout = async function() {
        await db.auth.signOut();
    };

    // Listen to Auth State Changes
    db.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event, session);
        if (session) {
            document.getElementById('btnLogin').style.display = 'none';
            document.getElementById('userInfo').style.display = 'block';
            document.getElementById('userEmailDisplay').textContent = session.user.email;
            
            // Get role from DB
            const { data, error } = await db.from('user_roles').select('role').eq('id', session.user.id).single();
            console.log('Role fetch:', data, error);
            if (data && data.role) {
                const userRole = data.role.toLowerCase();
                window.updateRole(userRole);
                if (userRole === 'admin') {
                    alert('เข้าสู่ระบบสำเร็จ! คุณได้รับสิทธิ์ระดับ Admin');
                } else if (userRole === 'editor') {
                    alert('เข้าสู่ระบบสำเร็จ! คุณได้รับสิทธิ์ระดับ Editor');
                }
            } else {
                console.warn('Role not found or error, falling back to viewer');
                alert('ล็อกอินสำเร็จ แต่ไม่พบสิทธิ์ของคุณในระบบ (รหัส UID อาจไม่ตรงในตาราง user_roles หรือลืมกำหนดสิทธิ์) ระบบจะให้สิทธิ์แค่ Viewer ครับ');
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

    // --- Render Tables ---
    window.renderTables = function() {
        // Update Stats
        let total = projects.length;
        let completed = projects.filter(p => p.status === 'แล้วเสร็จ').length;
        let active = total - completed;
        
        const elTotal = document.getElementById('statTotalProjects');
        const elActive = document.getElementById('statActiveProjects');
        const elCompleted = document.getElementById('statCompletedProjects');
        
        if (elTotal) elTotal.innerText = `${total} โครงการ`;
        if (elActive) elActive.innerText = `${active} โครงการ`;
        if (elCompleted) elCompleted.innerText = `${completed} โครงการ`;

        // Render Dashboard Table
        const dashboardTbody = document.getElementById('projectTableBody');
        dashboardTbody.innerHTML = '';
        projects.forEach(p => {
            const progress = calculateProjectProgress(p);
            p.plan = progress.plan;
            p.actual = progress.actual;

            const tr = document.createElement('tr');
            const statusClass = p.status === 'แล้วเสร็จ' ? 'status-completed' : 'status-active';
            tr.innerHTML = `
                <td><strong>${p.name}</strong></td>
                <td>${p.contractor}</td>
                <td><span class="status-badge ${statusClass}">${p.status}</span></td>
                <td>
                    <div style="font-size: 13px; margin-bottom: 3px;">
                        Plan: ${p.plan}% | Actual: ${p.actual}%
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-plan" style="width: ${p.plan}%;"></div>
                        <div class="progress-bar-actual" style="width: ${p.actual}%;"></div>
                    </div>
                </td>
                <td><button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="viewProjectDetails(${p.id})">ดูรายละเอียด</button></td>
            `;
            dashboardTbody.appendChild(tr);
        });

        // Render Admin Table
        const adminTbody = document.getElementById('adminProjectTableBody');
        if (adminTbody) {
            adminTbody.innerHTML = '';
            projects.forEach(p => {
                const tr = document.createElement('tr');
                const statusClass = p.status === 'แล้วเสร็จ' ? 'status-completed' : 'status-active';
                tr.innerHTML = `
                    <td><strong>${p.name}</strong></td>
                    <td>${p.contractor}</td>
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

    // --- S-Curve Chart.js Initialization ---
    const ctx = document.getElementById('sCurveChart').getContext('2d');
    window.sChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sCurveData.labels,
            datasets: [
                {
                    label: 'แผนงาน (Plan) %',
                    data: sCurveData.plan,
                    borderColor: '#F39C12', // PEA Gold
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'ผลงานจริง (Actual) %',
                    data: sCurveData.actual,
                    borderColor: '#742C81', // PEA Purple
                    backgroundColor: 'rgba(116, 44, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'ความก้าวหน้าสะสม (%)', font: { family: 'Kanit' } }
                }
            },
            plugins: {
                legend: {
                    labels: { font: { family: 'Kanit' } }
                },
                tooltip: {
                    titleFont: { family: 'Kanit' },
                    bodyFont: { family: 'Kanit' }
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
        events: function(fetchInfo, successCallback, failureCallback) {
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
        eventClick: function(info) {
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

    window.openLightbox = function(startIndex) {
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
        calClose.onclick = function() {
            calModal.style.display = "none";
        }
    }

    // Global click outside to close
    window.onclick = function(event) {
        if (event.target === calModal) {
            calModal.style.display = "none";
        }
        if (event.target === projModal) {
            projModal.style.display = "none";
        }
    }

    // --- Image Upload Preview (Editor View) ---
    const fileInput = document.querySelector('.file-input');
    const previewArea = document.getElementById('imagePreviewArea');

    fileInput.addEventListener('change', function() {
        previewArea.innerHTML = ''; // clear existing
        if(this.files) {
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

window.updateSCurve = function(p) {
    if (!window.sChart) return;
    
    // Find min and max dates
    let minDate = new Date("2099-01-01");
    let maxDate = new Date("2000-01-01");
    
    if (!p.tasks || p.tasks.length === 0) {
        window.sChart.data.labels = [];
        window.sChart.data.datasets[0].data = [];
        window.sChart.data.datasets[1].data = [];
        window.sChart.update();
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
    if(totalWeight === 0) totalWeight = 100;
    
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
            if(!t.startDate || !t.endDate) return;
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
                    if(!t.startDate || !t.endDate) return;
                    let start = new Date(t.startDate);
                    let end = new Date(t.endDate);
                    let w = parseFloat(t.weight) || 0;
                    if (now >= end) nowPlan += w;
                    else if (now > start) nowPlan += ((now - start) / (end - start)) * w;
                });
                nowPlan = (nowPlan / totalWeight) * 100;
                let ratio = nowPlan > 0 ? currentActualProj / nowPlan : 0;
                let estimatedActual = ((monthPlan / totalWeight) * 100) * ratio;
                if(estimatedActual > currentActualProj) estimatedActual = currentActualProj;
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

    window.sChart.data.labels = labels;
    window.sChart.data.datasets[0].data = planData;
    window.sChart.data.datasets[1].data = actualData;
    window.sChart.update();
}

// Global function to navigate from table button
window.viewProjectDetails = function(projectId) {
    const p = projects.find(proj => proj.id === projectId);
    if(p) {
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
        if(p.tasks && p.tasks.length > 0) {
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

        // --- Render Gantt Chart ---
        const ganttContainer = document.getElementById('ganttChart');
        if (p.tasks && p.tasks.length > 0) {
            const ganttTasks = p.tasks.filter(t => t.startDate && t.endDate).map(t => ({
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
                        bar_height: 25,
                        bar_corner_radius: 3,
                        arrow_curve: 5,
                        padding: 18,
                        view_mode: 'Month',
                        date_format: 'YYYY-MM-DD',
                        language: 'en',
                        custom_popup_html: function(task) {
                            return `
                                <div style="padding: 10px; border-radius: 4px; background: #fff; border: 1px solid #ccc; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-family: Kanit, sans-serif; min-width: 200px;">
                                    <strong style="display:block; margin-bottom: 5px; color: #742C81;">${task.name}</strong>
                                    <div style="font-size: 13px; color: #555;">
                                        <div><strong>เริ่ม:</strong> ${task.start}</div>
                                        <div><strong>สิ้นสุด:</strong> ${task.end}</div>
                                        <div><strong>ความก้าวหน้า:</strong> ${task.progress}%</div>
                                    </div>
                                </div>
                            `;
                        }
                    });
                    
                    window.currentGanttTasks = ganttTasks;
                    if (typeof adjustGanttDates === 'function') {
                        adjustGanttDates(window.currentGantt, ganttTasks);
                    }
                    
                } catch(e) {
                    console.error("Gantt Chart Error:", e);
                }
            } else {
                ganttContainer.innerHTML = '<text x="20" y="40" fill="#7f8c8d">ต้องระบุวันที่เริ่มต้นและสิ้นสุดของแผนงานย่อย เพื่อแสดงผลในรูปแบบ Gantt Chart</text>';
            }
        } else {
            ganttContainer.innerHTML = '<text x="20" y="40" fill="#7f8c8d">ยังไม่มีแผนงานย่อย</text>';
        }

        const galleryContainer = document.getElementById('progressGallery');
        galleryContainer.innerHTML = '';
        const projGallery = p.gallery || [];
        const validGallery = projGallery.filter(item => item.url);
        if (validGallery.length > 0) {
            validGallery.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'gallery-item';
                div.style.position = 'relative';
                
                // Keep the exact same date comparison since this is the only way to uniquely identify it without an ID
                div.innerHTML = `
                    <button class="btn btn-secondary role-editor" style="position: absolute; top: 10px; right: 10px; background: rgba(231, 76, 60, 0.9); color: white; padding: 5px 10px; z-index: 10; border-radius: 4px;" onclick="deleteGalleryItem(${p.id}, '${item.date}', '${item.desc}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    <img src="${item.url}" alt="progress">
                    <div class="gallery-info">
                        <p><i class="fa-regular fa-calendar"></i> ${item.date}</p>
                        <strong>${item.desc}</strong>
                    </div>
                `;
                galleryContainer.appendChild(div);
            });
        } else {
            galleryContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d; grid-column: 1 / -1; padding: 20px;">ยังไม่มีรูปภาพความก้าวหน้า</p>';
        }
        
        // Update S-Curve
        window.updateSCurve(p);
    }
    document.querySelector('[data-target="project-detail-view"]').click();
}

window.deleteGalleryItem = function(projectId, date, desc) {
    if (confirm('คุณต้องการลบรูปภาพ/ความก้าวหน้านี้ใช่หรือไม่?')) {
        const p = projects.find(proj => proj.id === projectId);
        if (p && p.gallery) {
            // Find the exact item based on date and description
            const index = p.gallery.findIndex(g => g.date === date && g.desc === desc);
            if (index !== -1) {
                p.gallery.splice(index, 1);
                saveProjects();
                
                // Re-render the detail view
                window.viewProjectDetails(projectId);
                
                // Also trigger calendar refetch if we are on calendar view or just in background
                if (window.calendar) {
                    window.calendar.refetchEvents();
                }
            }
        }
    }
}

window.changeGanttMode = function(mode) {
    if (window.currentGantt) {
        window.currentGantt.change_view_mode(mode);
        if (typeof adjustGanttDates === 'function' && window.currentGanttTasks) {
            adjustGanttDates(window.currentGantt, window.currentGanttTasks);
        }
    }
}

window.adjustGanttDates = function(gantt, tasks) {
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
window.openProjectModal = function(id = null) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectModalTitle');
    
    form.reset();
    document.getElementById('projectId').value = '';

    if (id !== null) {
        title.innerText = 'แก้ไขโครงการ';
        const project = projects.find(p => p.id === id);
        if(project) {
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectNameInput').value = project.name;
            document.getElementById('projectContractorInput').value = project.contractor;
            document.getElementById('projectSupervisorInput').value = project.supervisor || '';
            document.getElementById('projectCommitteeInput').value = project.committee || '';
            document.getElementById('projectDurationInput').value = project.duration || '';
            document.getElementById('projectStatusInput').value = project.status;
        }
    } else {
        title.innerText = 'เพิ่มโครงการใหม่';
    }
    
    modal.style.display = 'flex';
};

window.closeProjectModal = function() {
    document.getElementById('projectModal').style.display = 'none';
};

window.deleteProject = function(id) {
    if (confirm('คุณต้องการลบโครงการนี้ใช่หรือไม่?')) {
        projects = projects.filter(p => p.id !== id);
        saveProjects();
        window.renderTables();
    }
};

document.getElementById('projectForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const idVal = document.getElementById('projectId').value;
    const name = document.getElementById('projectNameInput').value;
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
            project.contractor = contractor;
            project.supervisor = supervisor;
            project.committee = committee;
            project.duration = duration;
            project.status = status;
        }
    } else {
        // Add
        const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
        projects.push({
            id: newId,
            name: name,
            contractor: contractor,
            supervisor: supervisor,
            committee: committee,
            duration: duration,
            status: status,
            tasks: []
        });
    }

    saveProjects();
    window.closeProjectModal();
    window.renderTables();
});

// Dynamic task loading for Editor
document.getElementById('editorProjectSelect')?.addEventListener('change', function(e) {
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
            <td>
                <button class="btn btn-secondary" style="color:var(--danger-color); padding: 5px 10px;" onclick="deleteWbsTask(${p.id}, ${t.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteWbsTask = function(projectId, taskId) {
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

document.getElementById('adminProjectSelect')?.addEventListener('change', function(e) {
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

document.getElementById('taskNameInput')?.addEventListener('input', function(e) {
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
document.getElementById('adminForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const projectId = document.getElementById('adminProjectSelect').value;
    const taskName = document.getElementById('taskNameInput').value;
    const taskDesc = document.getElementById('taskDescInput')?.value || '';
    const startDate = document.getElementById('taskStartDate').value;
    const endDate = document.getElementById('taskEndDate').value;
    const weight = parseFloat(document.getElementById('taskWeightInput').value);

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
                alert(`ข้อผิดพลาด: ค่าน้ำหนักรวมจะเกิน 100% (ปัจจุบัน ${currentTotal}%, ใส่เพิ่มได้อีก ${Math.max(0, 100-currentTotal).toFixed(2)}%)`);
                return;
            }

            if (existingTaskIndex !== -1) {
                // Update existing task
                p.tasks[existingTaskIndex].description = taskDesc;
                p.tasks[existingTaskIndex].startDate = startDate;
                p.tasks[existingTaskIndex].endDate = endDate;
                p.tasks[existingTaskIndex].weight = weight;
                alert(`แก้ไขข้อมูลแผนงานย่อย "${taskName}" เรียบร้อยแล้ว!`);
            } else {
                // Add new task
                if(!p.tasks) p.tasks = [];
                const newTaskId = p.tasks.length > 0 ? Math.max(...p.tasks.map(t => t.id)) + 1 : 1;
                p.tasks.push({
                    id: newTaskId, name: taskName, description: taskDesc, startDate: startDate, endDate: endDate, weight: weight, actual: 0
                });
                alert(`เพิ่มแผนงานย่อย "${taskName}" ให้โครงการ "${p.name}" เรียบร้อยแล้ว!`);
            }

            saveProjects();
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
document.getElementById('editorForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const projectId = document.getElementById('editorProjectSelect').value;
    const taskId = document.getElementById('editorTaskSelect').value;
    const actualVal = document.getElementById('taskActualInput').value;
    const reportDate = document.getElementById('reportDate').value;
    const desc = document.querySelector('#editorForm textarea').value;
    const fileInput = document.querySelector('#editorForm .file-input');
    
    if (projectId && taskId && reportDate) {
        const p = projects.find(proj => proj.id === parseInt(projectId));
        if (p) {
            const t = p.tasks.find(tk => tk.id === parseInt(taskId));
            if (t) {
                if (actualVal !== "") {
                    t.actual = parseFloat(actualVal);
                }
                
                if (!p.gallery) p.gallery = [];
                
                const processUpdate = () => {
                    p.gallery.sort((a, b) => new Date(b.date) - new Date(a.date));
                    try {
                        saveProjects();
                        window.renderTables();
                        alert(`บันทึกรายงานความก้าวหน้าแผนงาน "${t.name}" เรียบร้อยแล้ว!`);
                        // NOTIFICATION
                        addAppNotification(`🔔 มีการรายงานความก้าวหน้าโครงการ "${p.name}" แผนงาน "${t.name}" (Actual: ${t.actual}%)`, 'success');
                        
                        document.getElementById('imagePreviewArea').innerHTML = ''; // Clear preview
                        document.getElementById('editorForm').reset();
                    } catch(e) {
                        console.error(e);
                        alert("เกิดข้อผิดพลาด: ขนาดรูปภาพรวมใหญ่เกินกว่าระบบจะบันทึกได้ (LocalStorage เต็ม) กรุณาใช้รูปภาพขนาดเล็กลง หรือบันทึกเฉพาะข้อความ");
                        p.gallery.pop(); // Revert the last push
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
                                
                                const fileName = `${Date.now()}_${Math.floor(Math.random()*1000)}.jpg`;
                                const folderDate = new Date().toISOString().split('T')[0];
                                const filePath = `${folderDate}/${fileName}`;
                                
                                const { data: uploadData, error: uploadError } = await supabase
                                    .storage
                                    .from('project-images')
                                    .upload(filePath, blob, { contentType: 'image/jpeg' });
                                    
                                if (uploadError) {
                                    console.error('Upload Error:', uploadError);
                                    alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + uploadError.message);
                                } else {
                                    const { data: { publicUrl } } = supabase
                                        .storage
                                        .from('project-images')
                                        .getPublicUrl(filePath);
                                        
                                    p.gallery.push({
                                        url: publicUrl,
                                        date: reportDate,
                                        desc: desc || `อัปเดตงาน: ${t.name}`
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
                            desc: desc || (actualVal !== "" ? `อัปเดตความก้าวหน้าเป็น ${actualVal}%` : `อัปเดตงาน: ${t.name}`)
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
document.getElementById('importExcelInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (typeof XLSX === 'undefined') {
        alert('ไม่พบไลบรารี SheetJS กรุณารีเฟรชหน้าเว็บ');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const importedData = XLSX.utils.sheet_to_json(worksheet);
            
            if (importedData && importedData.length > 0) {
                const formattedProjects = importedData.map(row => {
                    let tasks = [];
                    let gallery = [];
                    
                    try { if (row.tasks_json) tasks = JSON.parse(row.tasks_json); } catch(e){}
                    try { if (row.gallery_json) gallery = JSON.parse(row.gallery_json); } catch(e){}
                    
                    // Allow both Thai and English column names
                    return {
                        id: row.id || row.ID || row['รหัส'] || (Math.floor(Math.random() * 1000000)),
                        name: row.name || row.Name || row['ชื่อโครงการ'] || 'ไม่ระบุชื่อ',
                        contractor: row.contractor || row.Contractor || row['ผู้รับเหมา'] || '',
                        supervisor: row.supervisor || row.Supervisor || row['ผู้ควบคุมงาน'] || '',
                        committee: row.committee || row.Committee || row['กรรมการตรวจรับ'] || '',
                        duration: row.duration || row.Duration || row['ระยะเวลา'] || '',
                        status: row.status || row.Status || row['สถานะ'] || 'กำลังดำเนินการ',
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
window.downloadPDFReport = function() {
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
        margin:       10,
        filename:     `${projectName.replace(/ /g, '_')}_Report.pdf`,
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { scale: 4, backgroundColor: '#ffffff', useCORS: true, windowWidth: 1200 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        buttons.forEach(btn => btn.style.display = '');
        element.classList.remove('pdf-export-mode');
        element.style.width = originalWidth;
        element.style.margin = originalMargin;
    });
};

window.downloadExcelReport = function() {
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

function addAppNotification(msg, type='info') {
    appNotifications.unshift({ msg, type, date: new Date().toISOString(), read: false });
    if(appNotifications.length > 30) appNotifications.pop();
    localStorage.setItem('pcts_notifications', JSON.stringify(appNotifications));
    if (typeof renderAppNotifications === 'function') renderAppNotifications();
}

window.renderAppNotifications = function() {
    const list = document.getElementById('notifList');
    const badge = document.getElementById('notifBadge');
    if(!list || !badge) return;
    
    list.innerHTML = '';
    let unreadCount = 0;
    
    if(appNotifications.length === 0) {
        list.innerHTML = '<div style="padding: 15px; text-align: center; color: #777;">ไม่มีการแจ้งเตือน</div>';
    } else {
        appNotifications.forEach((n, idx) => {
            if(!n.read) unreadCount++;
            const item = document.createElement('div');
            item.style.padding = '10px 15px';
            item.style.borderBottom = '1px solid var(--border-color)';
            item.style.fontSize = '13px';
            item.style.backgroundColor = n.read ? '#fff' : '#fef9e7';
            item.style.cursor = 'pointer';
            item.innerHTML = `
                <div style="color: ${n.type==='danger'?'#e74c3c':'#27ae60'}">${n.msg}</div>
                <div style="font-size: 11px; color: #999; margin-top: 5px;">${new Date(n.date).toLocaleString('th-TH')}</div>
            `;
            item.onclick = (e) => {
                e.stopPropagation();
                if(!n.read) {
                    n.read = true;
                    localStorage.setItem('pcts_notifications', JSON.stringify(appNotifications));
                    renderAppNotifications();
                }
            };
            list.appendChild(item);
        });
    }
    
    if(unreadCount > 0) {
        badge.innerText = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

window.toggleNotifications = function() {
    const dd = document.getElementById('notifDropdown');
    if(dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
};

window.clearNotifications = function(e) {
    if(e) e.stopPropagation();
    appNotifications = [];
    localStorage.removeItem('pcts_notifications');
    renderAppNotifications();
};

document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.notification-wrapper');
    const dd = document.getElementById('notifDropdown');
    if(wrapper && dd && !wrapper.contains(e.target)) {
        dd.style.display = 'none';
    }
});

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    renderAppNotifications();
});
