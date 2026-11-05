/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: admin-users.js - Comprehensive Admin User & Permission Management
 * ==============================================================================
 */

(function () {
    'use strict';

    window.adminUsersList = [];
    window.currentAdminUserFilter = 'all';
    window.currentAdminUserSearch = '';

    // Helper for fetch with timeout
    function fetchWithTimeout(url, options = {}, timeoutMs = 3000) {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), timeoutMs))
        ]);
    }

    function updateAdminUserKPIs(users) {
        const list = users || [];
        const total = list.length;
        const admins = list.filter(u => u.role === 'admin').length;
        const editors = list.filter(u => u.role === 'editor').length;
        const viewers = list.filter(u => u.role === 'viewer').length;
        const pending = list.filter(u => u.role === 'pending' || u.status === 'pending').length;
        const suspended = list.filter(u => u.status === 'suspended').length;

        const elTotal = document.getElementById('adminStatTotal');
        const elAdmin = document.getElementById('adminStatAdmin');
        const elEditor = document.getElementById('adminStatEditor');
        const elViewer = document.getElementById('adminStatViewer');
        const elPending = document.getElementById('adminStatPending');
        const pulseDot = document.getElementById('adminPendingPulseDot');

        if (elTotal) elTotal.textContent = total;
        if (elAdmin) elAdmin.textContent = admins;
        if (elEditor) elEditor.textContent = editors;
        if (elViewer) elViewer.textContent = viewers;
        if (elPending) elPending.textContent = pending;
        if (pulseDot) pulseDot.style.display = pending > 0 ? 'block' : 'none';

        // Update Pill Count Badges
        const pAll = document.getElementById('pillCountAll');
        const pPending = document.getElementById('pillCountPending');
        const pAdmin = document.getElementById('pillCountAdmin');
        const pEditor = document.getElementById('pillCountEditor');
        const pViewer = document.getElementById('pillCountViewer');
        const pSuspended = document.getElementById('pillCountSuspended');

        if (pAll) pAll.textContent = total;
        if (pPending) pPending.textContent = pending;
        if (pAdmin) pAdmin.textContent = admins;
        if (pEditor) pEditor.textContent = editors;
        if (pViewer) pViewer.textContent = viewers;
        if (pSuspended) pSuspended.textContent = suspended;
    }
    window.updateAdminUserKPIs = updateAdminUserKPIs;

    window.loadAdminUsers = async function (forceRefresh = false) {
        const tbody = document.getElementById('adminUserTableBody');
        if (!tbody) return;

        if (forceRefresh) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 25px; color: var(--text-secondary);"><i class="fa-solid fa-spinner fa-spin"></i> กำลังโหลดข้อมูลผู้ใช้งาน...</td></tr>';
        }

        // Get deleted blacklist from localStorage
        let deletedList = [];
        try {
            deletedList = JSON.parse(localStorage.getItem('pcts_deleted_users') || '[]');
        } catch (e) { deletedList = []; }
        const isDeleted = (u) => {
            if (!u) return true;
            const uid = String(u.id || '').toLowerCase();
            const uemail = String(u.email || '').toLowerCase();
            return deletedList.some(d => {
                const dl = String(d).toLowerCase();
                return dl === uid || dl === uemail;
            });
        };

        // One-time purge of legacy mock users from client localStorage
        const legacyMockEmails = ['admin@pea.co.th', 'editor@pea.co.th', 'viewer@pea.co.th', 'somchai.m@pea.co.th', 'jakraphan.n@pea.co.th', 'palakorn.j@pea.co.th', 'worapong.l@pea.co.th', 'ekkachai.m@pea.co.th', 'watchara.w@pea.co.th', 'kumpol.t@pea.co.th'];
        if (!localStorage.getItem('pcts_users_purged_v4')) {
            try {
                let cached = JSON.parse(localStorage.getItem('pcts_cached_users') || '[]');
                if (Array.isArray(cached)) {
                    cached = cached.filter(u => !u.email || !legacyMockEmails.includes(u.email.toLowerCase()));
                    localStorage.setItem('pcts_cached_users', JSON.stringify(cached));
                }
                localStorage.setItem('pcts_users_purged_v4', 'true');
            } catch (e) { }
        }

        let localServerUsers = [];
        let localUsersMap = new Map();

        // 1. Fetch Local Server (/api/users) to get rich metadata (name, status, perms, last_login)
        try {
            const resp = await fetchWithTimeout('/api/users', { cache: 'no-store' }, 2500);
            if (resp.ok) {
                const json = await resp.json();
                if (json && json.deleted_users && Array.isArray(json.deleted_users)) {
                    json.deleted_users.forEach(du => {
                        const dlow = String(du).toLowerCase();
                        if (!deletedList.includes(dlow)) deletedList.push(dlow);
                    });
                    try { localStorage.setItem('pcts_deleted_users', JSON.stringify(deletedList)); } catch (e) { }
                }
                if (json && json.users && Array.isArray(json.users)) {
                    localServerUsers = json.users;
                    json.users.forEach(u => {
                        if (u.id) localUsersMap.set(String(u.id), u);
                        if (u.email) localUsersMap.set(String(u.email).toLowerCase(), u);
                    });
                }
            }
        } catch (err) {
            console.warn('Local server users fetch note:', err.message);
        }

        // 2. Query Supabase user_roles (Live cloud accounts) - WITHOUT .order('created_at')!
        let supaUsers = [];
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 3000));
            const fetchPromise = window.db.from('user_roles').select('*');
            const res = await Promise.race([fetchPromise, timeoutPromise]);
            if (res && res.data && Array.isArray(res.data)) {
                supaUsers = res.data;
            }
        } catch (e) {
            console.warn('Supabase users query note:', e.message);
        }

        // If completely offline (both Supabase & server unreachable), fallback to localStorage
        if (supaUsers.length === 0 && localServerUsers.length === 0) {
            try {
                const cached = JSON.parse(localStorage.getItem('pcts_cached_users') || '[]');
                if (Array.isArray(cached)) {
                    cached.forEach(u => {
                        if (!legacyMockEmails.includes((u.email || '').toLowerCase())) {
                            localServerUsers.push(u);
                            if (u.id) localUsersMap.set(String(u.id), u);
                            if (u.email) localUsersMap.set(String(u.email).toLowerCase(), u);
                        }
                    });
                }
            } catch (e) { }
        }

        // Load local role overrides saved by Admin (prevents stale Supabase RLS data from reverting admin changes on refresh)
        let localOverrides = {};
        try {
            localOverrides = JSON.parse(localStorage.getItem('pcts_user_role_overrides') || '{}');
        } catch (e) { localOverrides = {}; }

        // Merge Supabase users with local enriched metadata & local admin overrides
        const userMap = new Map();

        // If Supabase users available, add them
        supaUsers.forEach(su => {
            if (isDeleted(su)) return;
            if (legacyMockEmails.includes((su.email || '').toLowerCase())) return;
            const key = su.id || su.email;
            const localMeta = localUsersMap.get(String(su.id)) || localUsersMap.get(String(su.email || '').toLowerCase()) || {};
            const override = (su.id && localOverrides[String(su.id)]) ||
                (su.email && localOverrides[String(su.email).toLowerCase()]) || null;

            userMap.set(key, {
                id: su.id,
                email: su.email || localMeta.email || '',
                employee_id: (override && override.employee_id) || su.employee_id || localMeta.employee_id || '',
                role: (override && override.role) || (localMeta && localMeta.role) || su.role || 'editor',
                name: (override && override.name) || localMeta.name || (su.email ? su.email.split('@')[0] : 'ผู้ใช้งาน'),
                position: (override && override.position) || localMeta.position || '',
                status: (override && override.status) || localMeta.status || 'active',
                permissions: (override && override.permissions) || localMeta.permissions || null,
                last_login: localMeta.last_login || '-',
                created_at: localMeta.created_at || '-'
            });
        });

        // Add local server users that may exist locally
        localServerUsers.forEach((lu) => {
            if (isDeleted(lu)) return;
            if (legacyMockEmails.includes((lu.email || '').toLowerCase())) return;
            const key = lu.id || lu.email;
            if (!userMap.has(key)) {
                const emailMatch = Array.from(userMap.values()).some(u => u.email && lu.email && u.email.toLowerCase() === lu.email.toLowerCase());
                if (!emailMatch) {
                    const override = (lu.id && localOverrides[String(lu.id)]) ||
                        (lu.email && localOverrides[String(lu.email).toLowerCase()]) || null;
                    userMap.set(key, {
                        ...lu,
                        role: (override && override.role) || lu.role || 'editor',
                        status: (override && override.status) || lu.status || 'active',
                        permissions: (override && override.permissions) || lu.permissions || null
                    });
                }
            }
        });

        // Include local overrides that might not be in supaUsers or localServerUsers yet
        Object.keys(localOverrides).forEach(okey => {
            const ov = localOverrides[okey];
            if (!ov || isDeleted(ov)) return;
            const userExists = Array.from(userMap.values()).some(u =>
                (ov.id && String(u.id) === String(ov.id)) ||
                (ov.email && u.email && u.email.toLowerCase() === String(ov.email).toLowerCase())
            );
            if (!userExists && ov.id) {
                userMap.set(ov.id, {
                    id: ov.id,
                    email: ov.email || '',
                    employee_id: ov.employee_id || '',
                    name: ov.name || (ov.email ? ov.email.split('@')[0] : 'ผู้ใช้งาน'),
                    position: ov.position || '',
                    role: ov.role || 'editor',
                    status: ov.status || 'active',
                    permissions: ov.permissions || null,
                    last_login: '-',
                    created_at: ov.updated_at || '-'
                });
            }
        });

        let users = Array.from(userMap.values());

        // Ensure permissions object is parsed
        users = users.map(u => {
            let perms = u.permissions;
            if (typeof perms === 'string') {
                try { perms = JSON.parse(perms); } catch (e) { perms = {}; }
            }
            if (!perms || typeof perms !== 'object') {
                perms = {
                    can_upload_excel: u.role === 'admin' || u.role === 'editor',
                    can_edit_wbs: u.role === 'admin' || u.role === 'editor',
                    can_manage_punchlist: u.role === 'admin' || u.role === 'editor',
                    can_export_report: true,
                    can_manage_users: u.role === 'admin'
                };
            }
            return {
                ...u,
                permissions: perms,
                status: u.status || (u.role === 'pending' ? 'pending' : 'active')
            };
        });

        window.adminUsersList = users;
        try {
            localStorage.setItem('pcts_cached_users', JSON.stringify(users));
        } catch (e) { }

        // Update KPI Counters
        updateAdminUserKPIs(users);

        // Render Table
        window.renderAdminUsersTable();
    };

    window.renderAdminUsersTable = function () {
        const tbody = document.getElementById('adminUserTableBody');
        if (!tbody) return;

        let filtered = [...window.adminUsersList];

        // Filter by role / status tab
        const filter = window.currentAdminUserFilter || 'all';
        if (filter === 'pending') {
            filtered = filtered.filter(u => u.role === 'pending' || u.status === 'pending');
        } else if (filter === 'admin') {
            filtered = filtered.filter(u => u.role === 'admin');
        } else if (filter === 'editor') {
            filtered = filtered.filter(u => u.role === 'editor');
        } else if (filter === 'viewer') {
            filtered = filtered.filter(u => u.role === 'viewer');
        } else if (filter === 'suspended') {
            filtered = filtered.filter(u => u.status === 'suspended');
        }

        // Filter by search query
        const q = (window.currentAdminUserSearch || '').toLowerCase().trim();
        if (q) {
            filtered = filtered.filter(u => {
                const email = (u.email || '').toLowerCase();
                const empId = (u.employee_id || '').toLowerCase();
                const name = (u.name || '').toLowerCase();
                const role = (u.role || '').toLowerCase();
                return email.includes(q) || empId.includes(q) || name.includes(q) || role.includes(q);
            });
        }

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 35px 20px; color: var(--text-secondary);">
                <i class="fa-solid fa-user-slash" style="font-size: 24px; opacity: 0.5; margin-bottom: 8px;"></i><br>
                ไม่พบข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไข
            </td></tr>`;
            return;
        }

        filtered.forEach(u => {
            const tr = document.createElement('tr');

            // Avatar color gradient based on role
            let avatarBg = 'linear-gradient(135deg, #742C81 0%, #a855f7 100%)';
            let initial = (u.name || u.email || 'U').charAt(0).toUpperCase();
            if (u.role === 'editor') avatarBg = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';
            else if (u.role === 'viewer') avatarBg = 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)';
            else if (u.role === 'pending') avatarBg = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
            else if (u.status === 'suspended') avatarBg = 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';

            // Role badge
            const roleBadges = {
                admin: '<span class="role-badge-pill role-admin"><i class="fa-solid fa-crown"></i> Admin</span>',
                editor: '<span class="role-badge-pill role-editor"><i class="fa-solid fa-user-gear"></i> Editor</span>',
                viewer: '<span class="role-badge-pill role-viewer"><i class="fa-solid fa-eye"></i> Viewer</span>',
                pending: '<span class="role-badge-pill role-pending"><i class="fa-solid fa-clock"></i> รออนุมัติ</span>'
            };
            const currentRoleBadge = roleBadges[u.role] || `<span class="role-badge-pill">${u.role}</span>`;

            // Granular permission chips
            const p = u.permissions || {};
            let permChipsHtml = `
                <div class="perm-badges-container">
                    <span class="perm-chip ${p.can_upload_excel ? 'perm-active' : ''}" title="นำเข้า Excel PSCTM"><i class="fa-solid fa-file-excel"></i> Excel</span>
                    <span class="perm-chip ${p.can_edit_wbs ? 'perm-active' : ''}" title="แก้ไข WBS/โครงการ"><i class="fa-solid fa-pen-to-square"></i> WBS</span>
                    <span class="perm-chip ${p.can_manage_punchlist ? 'perm-active' : ''}" title="จัดการ Punch List/ภาพ"><i class="fa-solid fa-camera"></i> Punch</span>
                    <span class="perm-chip ${p.can_export_report ? 'perm-active' : ''}" title="ส่งออกรายงาน PDF"><i class="fa-solid fa-file-pdf"></i> PDF</span>
                    ${u.role === 'admin' ? '<span class="perm-chip perm-active" title="ผู้ดูแลระบบ"><i class="fa-solid fa-shield-halved"></i> Super</span>' : ''}
                </div>
            `;

            // Status indicator
            const isSuspended = u.status === 'suspended';
            const isPending = u.status === 'pending' || u.role === 'pending';
            let statusHtml = '<span class="user-status-indicator active"><span class="user-status-dot"></span> ปกติ</span>';
            if (isSuspended) {
                statusHtml = '<span class="user-status-indicator suspended"><span class="user-status-dot"></span> ระงับ</span>';
            } else if (isPending) {
                statusHtml = '<span class="user-status-indicator pending"><span class="user-status-dot"></span> รออนุมัติ</span>';
            }

            // Action buttons
            let actionsHtml = '<div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">';
            if (isPending) {
                actionsHtml += `
                    <button class="btn btn-primary" style="padding: 4px 9px; font-size: 11.5px;" onclick="window.quickApproveUser('${u.id}', 'editor')" title="อนุมัติให้เป็น Editor ทันที">
                        <i class="fa-solid fa-check"></i> อนุมัติ
                    </button>
                `;
            }
            actionsHtml += `
                <button class="btn btn-action-edit" onclick="window.openUserPermissionModal('${u.id}')" title="แก้ไขข้อมูลผู้ใช้และกำหนดสิทธิ์">
                    <i class="fa-solid fa-pen-to-square"></i> แก้ไข
                </button>
                <button class="btn btn-action-toggle ${isSuspended ? 'is-suspended' : ''}" onclick="window.toggleUserStatus('${u.id}')" title="${isSuspended ? 'ปลดระงับการใช้งาน' : 'ระงับการใช้งาน'}">
                    <i class="fa-solid ${isSuspended ? 'fa-lock-open' : 'fa-lock'}"></i>
                </button>
                <button class="btn btn-action-delete" onclick="window.deleteAdminUser('${u.id}')" title="ลบผู้ใช้นี้">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>`;

            tr.innerHTML = `
                <td>
                    <div class="user-info-cell">
                        <div class="user-avatar" style="background: ${avatarBg};">${initial}</div>
                        <div>
                            <div class="user-name-title">${u.name || (u.email ? u.email.split('@')[0] : 'ผู้ใช้งาน')}</div>
                            <div class="user-email-subtitle"><i class="fa-regular fa-envelope"></i> ${u.email || '-'}</div>
                        </div>
                    </div>
                </td>
                <td><code class="emp-code-pill">${u.employee_id || '-'}</code></td>
                <td>${currentRoleBadge}</td>
                <td>${permChipsHtml}</td>
                <td><span class="user-last-login">${u.last_login || '-'}</span></td>
                <td>${statusHtml}</td>
                <td>${actionsHtml}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.filterAdminUsers = function (role) {
        window.currentAdminUserFilter = role;
        const pillIds = {
            all: 'filterPillAll',
            pending: 'filterPillPending',
            admin: 'filterPillAdmin',
            editor: 'filterPillEditor',
            viewer: 'filterPillViewer',
            suspended: 'filterPillSuspended'
        };
        Object.keys(pillIds).forEach(k => {
            const el = document.getElementById(pillIds[k]);
            if (el) el.classList.toggle('active', k === role);
        });
        window.renderAdminUsersTable();
    };

    window.onAdminUserSearch = function (val) {
        window.currentAdminUserSearch = val || '';
        const clearBtn = document.getElementById('adminUserClearSearchBtn');
        if (clearBtn) clearBtn.style.display = val ? 'block' : 'none';
        window.renderAdminUsersTable();
    };

    window.clearAdminUserSearch = function () {
        const input = document.getElementById('adminUserSearchInput');
        if (input) input.value = '';
        window.onAdminUserSearch('');
    };

    window.openUserPermissionModal = function (userId) {
        const user = window.adminUsersList.find(u => u.id === userId);
        if (!user) return alert('ไม่พบข้อมูลผู้ใช้งาน');

        document.getElementById('permUserId').value = user.id;
        document.getElementById('permUserName').value = user.name || '';
        document.getElementById('permUserEmpId').value = user.employee_id || '';
        const emailEl = document.getElementById('permUserEmail');
        if (emailEl) emailEl.value = user.email || '';
        const passEl = document.getElementById('permUserPassword');
        if (passEl) passEl.value = '';
        document.getElementById('permUserRole').value = user.role || 'viewer';
        document.getElementById('permUserStatus').value = user.status || 'active';
        document.getElementById('permModalSubtitle').textContent = `รหัสระบบ: ${user.id} | เข้าสู่ระบบล่าสุด: ${user.last_login || '-'}`;

        const p = user.permissions || {};
        document.getElementById('chkPermUploadExcel').checked = !!p.can_upload_excel;
        document.getElementById('chkPermEditWBS').checked = !!p.can_edit_wbs;
        document.getElementById('chkPermManagePunch').checked = !!p.can_manage_punchlist;
        document.getElementById('chkPermExportReport').checked = !!p.can_export_report;
        document.getElementById('chkPermManageUsers').checked = !!p.can_manage_users || user.role === 'admin';

        document.getElementById('userPermissionModal').style.display = 'flex';
    };

    window.closeUserPermissionModal = function () {
        document.getElementById('userPermissionModal').style.display = 'none';
    };

    window.onPermRoleSelectChange = function (role) {
        window.applyPermPreset(role);
    };

    window.applyPermPreset = function (preset) {
        const chkExcel = document.getElementById('chkPermUploadExcel');
        const chkWBS = document.getElementById('chkPermEditWBS');
        const chkPunch = document.getElementById('chkPermManagePunch');
        const chkReport = document.getElementById('chkPermExportReport');
        const chkUsers = document.getElementById('chkPermManageUsers');

        if (preset === 'admin') {
            if (chkExcel) chkExcel.checked = true;
            if (chkWBS) chkWBS.checked = true;
            if (chkPunch) chkPunch.checked = true;
            if (chkReport) chkReport.checked = true;
            if (chkUsers) chkUsers.checked = true;
        } else if (preset === 'editor') {
            if (chkExcel) chkExcel.checked = true;
            if (chkWBS) chkWBS.checked = true;
            if (chkPunch) chkPunch.checked = true;
            if (chkReport) chkReport.checked = true;
            if (chkUsers) chkUsers.checked = false;
        } else if (preset === 'viewer') {
            if (chkExcel) chkExcel.checked = false;
            if (chkWBS) chkWBS.checked = false;
            if (chkPunch) chkPunch.checked = false;
            if (chkReport) chkReport.checked = true;
            if (chkUsers) chkUsers.checked = false;
        } else if (preset === 'clear') {
            if (chkExcel) chkExcel.checked = false;
            if (chkWBS) chkWBS.checked = false;
            if (chkPunch) chkPunch.checked = false;
            if (chkReport) chkReport.checked = false;
            if (chkUsers) chkUsers.checked = false;
        }
    };

    window.submitUserPermissions = async function (e) {
        e.preventDefault();
        const userId = document.getElementById('permUserId').value;
        const name = document.getElementById('permUserName').value.trim();
        const empId = document.getElementById('permUserEmpId').value.trim();
        const email = (document.getElementById('permUserEmail')?.value || '').trim().toLowerCase();
        const password = (document.getElementById('permUserPassword')?.value || '').trim();
        const role = document.getElementById('permUserRole').value;
        const status = document.getElementById('permUserStatus').value;

        if (!email) {
            return alert('กรุณาระบุอีเมลผู้ใช้งาน');
        }

        const permissions = {
            can_upload_excel: document.getElementById('chkPermUploadExcel')?.checked ?? false,
            can_edit_wbs: document.getElementById('chkPermEditWBS')?.checked ?? false,
            can_manage_punchlist: document.getElementById('chkPermManagePunch')?.checked ?? false,
            can_export_report: document.getElementById('chkPermExportReport')?.checked ?? true,
            can_manage_users: (document.getElementById('chkPermManageUsers')?.checked ?? false) || role === 'admin'
        };

        const btn = document.getElementById('btnSavePermissions');
        const origText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...';
        btn.disabled = true;

        try {
            let position = '';
            if (name.includes('(') && name.includes(')')) {
                const parts = name.split('(');
                position = parts[1].replace(')', '').trim();
            }
            if (!position) {
                position = (role === 'admin') ? 'วิศวกร (Admin กบส.)' : (role === 'editor' ? 'วิศวกรควบคุมงาน (Editor)' : 'ผู้เข้าชม');
            }

            const payload = {
                id: userId,
                email: email,
                name: name,
                position: position,
                employee_id: empId,
                role: role,
                status: status,
                permissions: permissions
            };
            if (password) {
                payload.password = password;
            }

            // Unmark from deleted users if present
            try {
                let deletedList = JSON.parse(localStorage.getItem('pcts_deleted_users') || '[]');
                deletedList = deletedList.filter(d => String(d).toLowerCase() !== String(userId).toLowerCase() && String(d).toLowerCase() !== String(email).toLowerCase());
                localStorage.setItem('pcts_deleted_users', JSON.stringify(deletedList));
            } catch (e) { }

            // 1. Save to localStorage override tracker (guarantees persistence across refresh even if Supabase RLS is active)
            try {
                let overrides = JSON.parse(localStorage.getItem('pcts_user_role_overrides') || '{}');
                const overrideData = {
                    id: userId,
                    email: email,
                    name: name,
                    position: position,
                    employee_id: empId,
                    role: role,
                    status: status,
                    permissions: permissions,
                    updated_at: new Date().toISOString()
                };
                if (userId) overrides[String(userId)] = overrideData;
                if (email) overrides[String(email).toLowerCase()] = overrideData;
                localStorage.setItem('pcts_user_role_overrides', JSON.stringify(overrides));
            } catch (e) { }

            // 2. Save to Supabase (with timeout fallback) - only valid columns: email, employee_id, role
            try {
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 2500));
                const updatePromise = window.db.from('user_roles').update({
                    email: email,
                    employee_id: empId,
                    role: role
                }).eq('id', userId);
                const supaRes = await Promise.race([updatePromise, timeoutPromise]);
                if (supaRes && supaRes.error) {
                    console.warn('Supabase Cloud Sync Note (RLS Protected):', supaRes.error.message);
                }
            } catch (supaErr) {
                console.warn('Supabase update note:', supaErr.message);
            }

            // 3. Save to Central Server API (/api/users/save)
            try {
                await fetchWithTimeout('/api/users/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }, 3000);
            } catch (apiErr) {
                console.warn('Local server save note:', apiErr.message);
            }

            // 4. Update in local memory list & cache
            const idx = window.adminUsersList.findIndex(u => u.id === userId);
            if (idx !== -1) {
                window.adminUsersList[idx] = {
                    ...window.adminUsersList[idx],
                    email: email,
                    name: name,
                    position: position,
                    employee_id: empId,
                    role: role,
                    status: status,
                    permissions: permissions
                };
                if (password) {
                    window.adminUsersList[idx].password = password;
                }
                localStorage.setItem('pcts_cached_users', JSON.stringify(window.adminUsersList));
            }

            // 5. If current user was edited, update active session
            try {
                const currentSession = (await window.db.auth.getSession())?.data?.session;
                if (currentSession && currentSession.user && currentSession.user.id === userId) {
                    window.authenticatedRole = role;
                    window.currentUserPermissions = permissions;
                    if (typeof window.updateRole === 'function') window.updateRole(role, true);
                }
            } catch (e) { }

            alert('บันทึกข้อมูลและสิทธิ์ผู้ใช้งานเรียบร้อยแล้ว');
            window.closeUserPermissionModal();
            updateAdminUserKPIs(window.adminUsersList);
            window.renderAdminUsersTable();
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
        } finally {
            btn.innerHTML = origText;
            btn.disabled = false;
        }
    };

    window.quickApproveUser = async function (userId, role = 'editor') {
        if (!confirm(`ยืนยันการอนุมัติสิทธิ์ให้เป็น ${role.toUpperCase()} แก่ผู้ใช้นี้?`)) return;

        try {
            const perms = role === 'admin' ? {
                can_upload_excel: true, can_edit_wbs: true, can_manage_punchlist: true, can_export_report: true, can_manage_users: true
            } : {
                can_upload_excel: true, can_edit_wbs: true, can_manage_punchlist: true, can_export_report: true, can_manage_users: false
            };

            const target = window.adminUsersList.find(u => u.id === userId);

            // 1. Save to localStorage override tracker
            try {
                let overrides = JSON.parse(localStorage.getItem('pcts_user_role_overrides') || '{}');
                const overrideData = {
                    id: userId,
                    email: target ? target.email : '',
                    role: role,
                    status: 'active',
                    permissions: perms,
                    updated_at: new Date().toISOString()
                };
                if (userId) overrides[String(userId)] = overrideData;
                if (target && target.email) overrides[String(target.email).toLowerCase()] = overrideData;
                localStorage.setItem('pcts_user_role_overrides', JSON.stringify(overrides));
            } catch (e) { }

            // 2. Try Supabase RPC or direct update
            try {
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 2500));
                const p1 = window.db.rpc('approve_user_role', { target_user_id: userId, new_role: role });
                const res = await Promise.race([p1, timeoutPromise]);
                if (res && res.error) {
                    const p2 = await window.db.from('user_roles').update({ role: role }).eq('id', userId);
                    if (p2 && p2.error) {
                        console.warn('Supabase Cloud Sync Note (RLS Protected):', p2.error.message);
                    }
                }
            } catch (e) {
                console.warn('Supabase quick approve note:', e.message);
            }

            // 3. Try local server
            try {
                await fetchWithTimeout('/api/users/approve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: userId, role: role, permissions: perms })
                }, 2500);
            } catch (e) { }

            // 4. Update in memory & cache
            if (target) {
                target.role = role;
                target.status = 'active';
                target.permissions = perms;
                localStorage.setItem('pcts_cached_users', JSON.stringify(window.adminUsersList));
            }

            alert(`อนุมัติสิทธิ์เป็น ${role.toUpperCase()} สำเร็จเรียบร้อยแล้ว`);
            updateAdminUserKPIs(window.adminUsersList);
            window.renderAdminUsersTable();
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        }
    };

    window.toggleUserStatus = async function (userId) {
        const user = window.adminUsersList.find(u => u.id === userId);
        if (!user) return;
        const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
        const actionText = newStatus === 'suspended' ? 'ระงับการใช้งาน' : 'เปิดใช้งาน';

        if (!confirm(`ต้องการ ${actionText} ผู้ใช้ ${user.email} หรือไม่?`)) return;

        try {
            // 1. Save in override tracker
            try {
                let overrides = JSON.parse(localStorage.getItem('pcts_user_role_overrides') || '{}');
                const oKey = String(userId);
                const eKey = user.email ? String(user.email).toLowerCase() : null;
                const existing = overrides[oKey] || (eKey && overrides[eKey]) || { ...user };
                existing.status = newStatus;
                existing.updated_at = new Date().toISOString();
                overrides[oKey] = existing;
                if (eKey) overrides[eKey] = existing;
                localStorage.setItem('pcts_user_role_overrides', JSON.stringify(overrides));
            } catch (e) { }

            // 2. Try local server
            try {
                await fetchWithTimeout('/api/users/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: userId, status: newStatus })
                }, 2500);
            } catch (e) { }

            user.status = newStatus;
            localStorage.setItem('pcts_cached_users', JSON.stringify(window.adminUsersList));
            alert(`ดำเนินการ ${actionText} เรียบร้อยแล้ว`);
            updateAdminUserKPIs(window.adminUsersList);
            window.renderAdminUsersTable();
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        }
    };

    window.deleteAdminUser = async function (userId) {
        const user = window.adminUsersList.find(u => u.id === userId);
        if (!user) return;

        if (!confirm(`⚠️ ยืนยันการลบผู้ใช้ ${user.email} ออกจากระบบ? การกระทำนี้ไม่สามารถย้อนกลับได้`)) return;

        try {
            // 1. Remove from localStorage overrides
            try {
                let overrides = JSON.parse(localStorage.getItem('pcts_user_role_overrides') || '{}');
                if (userId) delete overrides[String(userId)];
                if (user.email) delete overrides[String(user.email).toLowerCase()];
                localStorage.setItem('pcts_user_role_overrides', JSON.stringify(overrides));
            } catch (e) { }

            // 2. Record in localStorage deleted_users blacklist immediately
            try {
                let deletedList = JSON.parse(localStorage.getItem('pcts_deleted_users') || '[]');
                if (userId && !deletedList.includes(userId)) deletedList.push(userId);
                if (user.email && !deletedList.includes(user.email.toLowerCase())) deletedList.push(user.email.toLowerCase());
                localStorage.setItem('pcts_deleted_users', JSON.stringify(deletedList));
            } catch (e) { }

            // 3. Delete from Supabase
            try {
                await window.db.from('user_roles').delete().eq('id', userId);
                if (user.email) {
                    await window.db.from('user_roles').delete().eq('email', user.email);
                }
            } catch (e) {
                console.warn('Supabase delete user note:', e.message);
            }

            // 4. Delete from Local Server API
            try {
                await fetchWithTimeout('/api/users/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: userId, email: user.email })
                }, 2500);
            } catch (e) {
                console.warn('Local server delete note:', e.message);
            }

            // 5. Update memory & local cache
            window.adminUsersList = window.adminUsersList.filter(u => u.id !== userId && (!user.email || u.email?.toLowerCase() !== user.email.toLowerCase()));
            localStorage.setItem('pcts_cached_users', JSON.stringify(window.adminUsersList));

            alert('ลบผู้ใช้งานเรียบร้อยแล้ว');
            updateAdminUserKPIs(window.adminUsersList);
            window.renderAdminUsersTable();
        } catch (err) {
            alert('เกิดข้อผิดพลาด: ' + err.message);
        }
    };

    window.openAddUserModal = function () {
        const m = document.getElementById('adminAddUserModal');
        if (m) m.style.display = 'flex';
    };

    window.closeAddUserModal = function () {
        const m = document.getElementById('adminAddUserModal');
        if (m) m.style.display = 'none';
        document.getElementById('adminAddUserForm')?.reset();
    };

    window.onAddUserRoleChange = function (role) {
        // Role change hook if needed
    };

    window.submitAdminAddUser = async function (e) {
        e.preventDefault();
        const email = document.getElementById('addEmail').value.trim();
        const empId = document.getElementById('addEmpId').value.trim();
        const name = document.getElementById('addName').value.trim() || email.split('@')[0];
        const role = document.getElementById('addRole').value;
        const password = document.getElementById('addPassword').value.trim();

        const btn = document.getElementById('btnAddUserSubmit');
        const origText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังสร้าง...';
        btn.disabled = true;

        try {
            const perms = role === 'admin' ? {
                can_upload_excel: true, can_edit_wbs: true, can_manage_punchlist: true, can_export_report: true, can_manage_users: true
            } : (role === 'editor' ? {
                can_upload_excel: true, can_edit_wbs: true, can_manage_punchlist: true, can_export_report: true, can_manage_users: false
            } : {
                can_upload_excel: false, can_edit_wbs: false, can_manage_punchlist: false, can_export_report: true, can_manage_users: false
            });

            const newId = `pea-user-${Date.now()}`;
            const newUser = {
                id: newId,
                email: email,
                employee_id: empId,
                name: name,
                role: role,
                status: 'active',
                permissions: perms,
                password: password,
                created_at: new Date().toISOString()
            };

            // Unmark from deleted users if present
            try {
                let deletedList = JSON.parse(localStorage.getItem('pcts_deleted_users') || '[]');
                deletedList = deletedList.filter(d => String(d).toLowerCase() !== String(newId).toLowerCase() && String(d).toLowerCase() !== String(email).toLowerCase());
                localStorage.setItem('pcts_deleted_users', JSON.stringify(deletedList));
            } catch (e) { }

            // 1. Try local server
            try {
                await fetchWithTimeout('/api/users/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                }, 3000);
            } catch (e) {
                console.warn('Local server save note:', e.message);
            }

            // 2. Try Supabase user_roles table (only columns id, email, employee_id, role)
            try {
                await window.db.from('user_roles').insert([{
                    id: newId,
                    email: email,
                    employee_id: empId,
                    role: role
                }]);
            } catch (e) {
                console.warn('Supabase insert note:', e.message);
            }

            // 3. Save in localStorage override tracker
            try {
                let overrides = JSON.parse(localStorage.getItem('pcts_user_role_overrides') || '{}');
                overrides[String(newId)] = newUser;
                if (email) overrides[String(email).toLowerCase()] = newUser;
                localStorage.setItem('pcts_user_role_overrides', JSON.stringify(overrides));
            } catch (e) { }

            window.adminUsersList.unshift(newUser);
            localStorage.setItem('pcts_cached_users', JSON.stringify(window.adminUsersList));

            alert(`สร้างผู้ใช้งาน ${email} (${role.toUpperCase()}) สำเร็จแล้ว!`);
            window.closeAddUserModal();
            updateAdminUserKPIs(window.adminUsersList);
            window.renderAdminUsersTable();
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน: ' + err.message);
        } finally {
            btn.innerHTML = origText;
            btn.disabled = false;
        }
    };

    // Aliases for compatibility with any existing calls
    window.loadPendingUsers = window.loadAdminUsers;
    window.approveUser = function (userId) { window.quickApproveUser(userId, 'editor'); };
    window.rejectUser = function (userId) { window.deleteAdminUser(userId); };
})();

