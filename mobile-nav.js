/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: mobile-nav.js - Mobile Bottom Navigation & Quick Action Controller
 * ==============================================================================
 */

(function () {
    'use strict';

    // 1. Update Mobile Bottom Nav based on User Role
    window.updateMobileBottomNav = function (role) {
        const bottomNav = document.getElementById('mobileBottomNav');
        const adminBtn = document.getElementById('btnMobileNavAdmin');
        const profileDot = document.getElementById('mobileProfileDot');
        const adminSection = document.getElementById('mobileProfileAdminSection');
        if (!bottomNav) return;

        const effectiveRole = role || window.currentRole || window.authenticatedRole || 'viewer';
        const isEligible = (effectiveRole === 'admin' || effectiveRole === 'editor');

        if (isEligible) {
            bottomNav.classList.add('nav-visible');
            document.body.classList.add('has-mobile-nav');
        } else {
            bottomNav.classList.remove('nav-visible');
            document.body.classList.remove('has-mobile-nav');
        }

        // Toggle Admin specific button & tools
        if (adminBtn) {
            adminBtn.style.display = (effectiveRole === 'admin') ? 'flex' : 'none';
        }
        if (adminSection) {
            adminSection.style.display = (window.authenticatedRole === 'admin' || window.location.hostname === 'localhost' || window.location.protocol === 'file:') ? 'block' : 'none';
        }

        // Role dot indicator color on Profile icon
        if (profileDot) {
            profileDot.style.background = (effectiveRole === 'admin') ? '#F39C12' : '#27ae60';
        }

        // Update active nav tab
        window.syncMobileNavActiveTab();
    };

    // 2. Mobile Nav Tab Switcher
    window.mobileNavSwitch = function (tab) {
        window.closeMobileUploadSheet();

        if (tab === 'status') {
            // Check active section
            const psctmView = document.getElementById('psctm-dashboard-view');
            const detailView = document.getElementById('project-detail-view');

            if (detailView && detailView.classList.contains('active')) {
                // Return from project detail to dashboard
                const returnTarget = window.lastViewBeforeDetail || 'psctm-dashboard-view';
                window.switchToViewSection(returnTarget);
            } else if (psctmView && psctmView.classList.contains('active')) {
                // If on PSCTM Overview, toggle to Projects Dashboard
                window.switchToViewSection('dashboard-view');
            } else {
                // Default go to PSCTM Dashboard
                window.switchToViewSection('psctm-dashboard-view');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (tab === 'report') {
            // Switch to Editor View (รายงานความก้าวหน้า)
            window.switchToViewSection('editor-view');
            if (typeof window.syncUploaderIdentityFields === 'function') {
                window.syncUploaderIdentityFields(true);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (tab === 'upload') {
            // Open Mobile Quick Photo Upload Action Sheet
            window.openMobileUploadSheet();
        } else if (tab === 'admin') {
            // Security check
            if (window.authenticatedRole !== 'admin') {
                alert('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเข้าถึงส่วนนี้ได้');
                return;
            }
            window.switchToViewSection('admin-view');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (tab === 'profile') {
            // Open Personal Profile Modal
            window.openMobileProfileModal();
        }

        window.syncMobileNavActiveTab();
    };

    // 3. Switch View Section Helper
    window.switchToViewSection = function (targetId) {
        const viewSections = document.querySelectorAll('.view-section');
        const navItems = document.querySelectorAll('.sidebar-nav li, .top-nav li');

        // Deactivate PSCTM group in sidebar if navigating away
        const psctmGroup = document.getElementById('sidebarGroupPsctm');
        if (psctmGroup && targetId !== 'psctm-dashboard-view') {
            psctmGroup.classList.remove('active');
            document.querySelectorAll('.sidebar-subitem').forEach(sub => sub.classList.remove('active'));
        }

        // Hide all views
        viewSections.forEach(s => s.classList.remove('active'));

        // Show target view
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.classList.add('active');
        }

        // Highlight sidebar nav
        navItems.forEach(n => {
            n.classList.toggle('active', n.getAttribute('data-target') === targetId);
        });

        // Lifecycle hooks for specific views
        if (targetId === 'editor-view') {
            if (typeof window.syncUploaderIdentityFields === 'function') {
                window.syncUploaderIdentityFields(true);
            }
            const reportDateInput = document.getElementById('reportDate');
            if (reportDateInput && !reportDateInput.value) {
                if (typeof window.setEditorDatePreset === 'function') {
                    window.setEditorDatePreset('today');
                } else {
                    reportDateInput.value = new Date().toLocaleDateString('en-CA');
                }
            }
            const edProjSelect = document.getElementById('editorProjectSelect');
            if (edProjSelect && (!edProjSelect.value || edProjSelect.value === "") && window.currentProjectViewData?.id) {
                edProjSelect.value = window.currentProjectViewData.id;
                edProjSelect.dispatchEvent(new Event('change'));
            }
        } else if (targetId === 'psctm-dashboard-view') {
            if (typeof window.renderPsctmDashboard === 'function') {
                window.renderPsctmDashboard();
            }
        } else if (targetId === 'dashboard-view') {
            if (window.currentProjectViewMode === 'gis') {
                window.switchProjectView('cards');
            } else if (typeof window.switchProjectView === 'function') {
                window.switchProjectView(window.currentProjectViewMode || 'cards');
            }
        }

        window.syncMobileNavActiveTab();
    };

    // 4. Synchronize Active Bottom Nav Item with currently active view
    window.syncMobileNavActiveTab = function () {
        const btnStatus = document.getElementById('btnMobileNavStatus');
        const btnReport = document.getElementById('btnMobileNavReport');
        const btnAdmin = document.getElementById('btnMobileNavAdmin');
        const btnProfile = document.getElementById('btnMobileNavProfile');

        if (!btnStatus || !btnReport) return;

        [btnStatus, btnReport, btnAdmin, btnProfile].forEach(b => {
            if (b) b.classList.remove('active');
        });

        const activeSec = document.querySelector('.view-section.active');
        const secId = activeSec ? activeSec.id : '';

        if (secId === 'editor-view') {
            btnReport.classList.add('active');
        } else if (secId === 'admin-view') {
            if (btnAdmin) btnAdmin.classList.add('active');
        } else if (secId === 'psctm-dashboard-view' || secId === 'dashboard-view' || secId === 'project-detail-view') {
            btnStatus.classList.add('active');
        }
    };

    // 5. Quick Photo Upload Action Sheet
    window.openMobileUploadSheet = function () {
        const backdrop = document.getElementById('mobileUploadSheetBackdrop');
        if (!backdrop) return;

        // Update current inspector name in the sheet pill
        const curInfo = (typeof window.getCurrentUserInfo === 'function') ? window.getCurrentUserInfo() : {};
        const pillName = document.getElementById('sheetInspectorName');
        if (pillName) {
            pillName.textContent = curInfo.name || 'ผู้ตรวจงาน กฟภ.';
        }

        backdrop.classList.add('open');
    };

    window.closeMobileUploadSheet = function () {
        const backdrop = document.getElementById('mobileUploadSheetBackdrop');
        if (backdrop) backdrop.classList.remove('open');
    };

    // Trigger Camera directly
    window.openMobileCameraUpload = function () {
        window.closeMobileUploadSheet();
        window.switchToViewSection('editor-view');
        setTimeout(() => {
            const camInput = document.getElementById('cameraDirectInput');
            if (camInput) camInput.click();
            const queueEl = document.getElementById('photoQueueSection') || document.getElementById('imagePreviewArea');
            if (queueEl) queueEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
    };

    // Trigger Gallery multi-picker directly
    window.openMobileGalleryUpload = function () {
        window.closeMobileUploadSheet();
        window.switchToViewSection('editor-view');
        setTimeout(() => {
            const galInput = document.getElementById('galleryMultiInput');
            if (galInput) galInput.click();
            const queueEl = document.getElementById('photoQueueSection') || document.getElementById('imagePreviewArea');
            if (queueEl) queueEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
    };

    // Jump to Daily Report Form
    window.openMobileReportForm = function () {
        window.closeMobileUploadSheet();
        window.switchToViewSection('editor-view');
        setTimeout(() => {
            const edForm = document.getElementById('editorFormCard') || document.getElementById('editor-view');
            if (edForm) edForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // 6. Personal Profile Modal / Bottom Sheet
    window.openMobileProfileModal = function () {
        const backdrop = document.getElementById('mobileProfileModalBackdrop');
        if (!backdrop) return;

        const info = (typeof window.getCurrentUserInfo === 'function') ? window.getCurrentUserInfo() : {};
        const curRole = window.currentRole || window.authenticatedRole || info.role || 'editor';

        // Pre-fill header
        const nameDisp = document.getElementById('mobileProfileDisplayName');
        const emailDisp = document.getElementById('mobileProfileEmail');
        const roleBadge = document.getElementById('mobileProfileRoleBadge');
        const roleIndicator = document.getElementById('mobileProfileRoleIndicator');

        if (nameDisp) nameDisp.textContent = info.name || 'ผู้ตรวจงาน กฟภ.';
        if (emailDisp) emailDisp.textContent = info.email || 'ยังไม่ได้เข้าสู่ระบบ';

        if (roleBadge) {
            roleBadge.className = (curRole === 'admin') ? 'user-role-badge role-badge-admin' : 'user-role-badge role-badge-editor';
            roleBadge.innerHTML = (curRole === 'admin')
                ? '<i class="fa-solid fa-shield-halved"></i> Admin (ผู้ดูแลระบบ)'
                : '<i class="fa-solid fa-user-gear"></i> Editor (ผู้ควบคุมงาน)';
        }

        if (roleIndicator) {
            roleIndicator.style.background = (curRole === 'admin') ? '#F39C12' : '#27ae60';
        }

        // Pre-fill form inputs
        const nameInput = document.getElementById('mobileProfName');
        const empInput = document.getElementById('mobileProfEmpId');
        const posInput = document.getElementById('mobileProfPos');

        if (nameInput) nameInput.value = info.name || '';
        if (empInput) empInput.value = info.employee_id || '';
        if (posInput) posInput.value = info.position || '';

        // Role pills for Admin test switching
        ['Admin', 'Editor', 'Viewer'].forEach(r => {
            const pill = document.getElementById('rolePill' + r);
            if (pill) {
                pill.classList.toggle('active', r.toLowerCase() === curRole.toLowerCase());
            }
        });

        // Theme text
        window.updateMobileProfileThemeText();

        backdrop.classList.add('open');
    };

    window.closeMobileProfileModal = function () {
        const backdrop = document.getElementById('mobileProfileModalBackdrop');
        if (backdrop) backdrop.classList.remove('open');
    };

    window.updateMobileProfileThemeText = function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const themeVal = document.getElementById('mobileProfileThemeValue');
        if (themeVal) {
            themeVal.textContent = (currentTheme === 'dark') ? 'โหมดกลางคืน (Dark)' : 'โหมดกลางวัน (Light)';
        }
    };

    // Save Profile Info
    window.saveMobileProfileInfo = function () {
        const nameInput = document.getElementById('mobileProfName');
        const empInput = document.getElementById('mobileProfEmpId');
        const posInput = document.getElementById('mobileProfPos');

        const nameVal = nameInput ? nameInput.value.trim() : '';
        const empVal = empInput ? empInput.value.trim() : '';
        const posVal = posInput ? posInput.value.trim() : '';

        if (!nameVal) {
            alert('กรุณากรอกชื่อ - นามสกุล ผู้ตรวจงาน');
            if (nameInput) nameInput.focus();
            return;
        }

        const profileData = {
            name: nameVal,
            employee_id: empVal,
            position: posVal
        };

        // Persist to localStorage
        try {
            localStorage.setItem('pcts_custom_inspector_profile', JSON.stringify(profileData));
            const curInfo = (typeof window.getCurrentUserInfo === 'function') ? window.getCurrentUserInfo() : {};
            const curEmail = (curInfo.email || window.currentUserEmail || '').toLowerCase();
            if (curEmail) {
                localStorage.setItem('pcts_inspector_profile_' + curEmail, JSON.stringify(profileData));
            }
        } catch (e) {
            console.warn('LocalStorage save error:', e);
        }

        // Update global variables
        window.currentUserName = nameVal;
        window.currentUserEmpId = empVal;
        window.currentUserPosition = posVal;
        if (window.currentUser) {
            window.currentUser.name = nameVal;
            window.currentUser.employee_id = empVal;
            window.currentUser.position = posVal;
        }

        // Sync inputs in editor-view
        if (typeof window.syncUploaderIdentityFields === 'function') {
            window.syncUploaderIdentityFields(true);
        }

        // Update header preview in modal
        const nameDisp = document.getElementById('mobileProfileDisplayName');
        if (nameDisp) nameDisp.textContent = nameVal;

        // Show feedback notification
        if (typeof Toastify === 'function') {
            Toastify({
                text: "✓ บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว (อัปเดตลายน้ำภาพอัตโนมัติ)",
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: "linear-gradient(135deg, #742C81 0%, #27ae60 100%)",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "13px"
                }
            }).showToast();
        } else {
            alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
        }

        // Close after a brief moment
        setTimeout(() => {
            window.closeMobileProfileModal();
        }, 600);
    };

    // Role switcher in profile sheet (for testing)
    window.mobileSwitchRole = function (role) {
        if (typeof window.updateRole === 'function') {
            window.updateRole(role, true);
        }
        window.openMobileProfileModal(); // Refresh sheet with updated role
    };

    // Handle logout from mobile sheet
    window.handleMobileLogout = function () {
        if (!confirm('ยืนยันออกจากระบบ PCTS?')) return;
        window.closeMobileProfileModal();
        if (typeof window.logout === 'function') {
            window.logout();
        }
    };

    // 7. Initialize listeners & observers on load
    window.initMobileBottomNav = function () {
        // Observe view switches to keep bottom nav active tab in sync
        const mainContent = document.querySelector('.content-area') || document.body;
        const observer = new MutationObserver(() => {
            window.syncMobileNavActiveTab();
        });
        observer.observe(mainContent, { attributes: true, subtree: true, attributeFilter: ['class'] });

        // Initial sync
        const initialRole = window.currentRole || window.authenticatedRole || 'admin';
        window.updateMobileBottomNav(initialRole);
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initMobileBottomNav);
    } else {
        setTimeout(window.initMobileBottomNav, 100);
    }
})();

