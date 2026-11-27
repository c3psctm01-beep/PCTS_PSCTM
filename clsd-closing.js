/**
 * ==============================================================================
 * PCTS (PEA Construction Tracking System)
 * Module: clsd-closing.js
 * สถานะการปิดงานก่อสร้าง (SAP ZPSR018 / ZBUDR018)
 * Built using the exact architecture, Supabase Realtime sync, 10-category network
 * analysis, 5-step operational closing statuses, and transfer engine of D:\CLSD_SAP,
 * plus a 100% browser-side PDF.js fallback parser for static hosting.
 * ==============================================================================
 */

window.CLSDClosing = (function () {
  'use strict';

  // --------------------------------------------------------------------------
  // State & Configuration
  // --------------------------------------------------------------------------
  let currentProject = null;
  let allProjects = [];
  let budgetChart = null;
  let selectedPdfFile = null;
  let projectsViewMode = 'cards';
  let currentNetworkFilter = 'all';
  let postTransferFilterMode = 'transfer_only';
  let statusModalTargetProjectId = null;
  let projectPendingDelete = null;
  let updateTargetProjectId = null;
  let initialized = false;

  // Shared Supabase Cloud Configuration (same project & table as D:\CLSD_SAP)
  const CLSD_SUPABASE_CONFIG = {
    url: 'https://faeuyeulhzzgflmrtvfc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZXV5ZXVsaHp6Z2ZsbXJ0dmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMTMxODEsImV4cCI6MjEwNjc4OTE4MX0.Y4xgOOm4sjR92nzFUME7HbmNjz4xycCrRWpjb1FTDgc',
    table: 'projects'
  };

  let clsdSupabase = null;
  let clsdSupabaseStatus = 'checking';
  let clsdRealtimeChannel = null;

  const STORAGE_KEY = 'pcts_clsd_sap_projects_cache';
  const DELETED_IDS_KEY = 'pcts_clsd_sap_deleted_ids';
  const IDB_NAME = 'pcts_clsd_sap_db';
  const IDB_STORE = 'projects_store';
  const IDB_KEY = 'projects_data';

  // 5 Operational Closing Statuses + READY (matching D:\CLSD_SAP)
  const STATUS_DEFINITIONS = {
    STATUS_1: {
      key: 'STATUS_1',
      label: '1. อยู่ระหว่างดำเนินการโอนงบประมาณ',
      shortLabel: '1. โอนงบประมาณ',
      badgeClass: 'badge-status-transfer',
      cardClass: 'card-status-transfer',
      icon: 'fa-solid fa-money-bill-transfer',
      color: '#0284c7'
    },
    STATUS_2: {
      key: 'STATUS_2',
      label: '2. อยู่ระหว่างคืนพัสดุ',
      shortLabel: '2. คืนพัสดุ',
      badgeClass: 'badge-status-return',
      cardClass: 'card-status-return',
      icon: 'fa-solid fa-boxes-packing',
      color: '#d97706'
    },
    STATUS_3: {
      key: 'STATUS_3',
      label: '3. อยู่ระหว่างดำเนินการโอนงบประมาณ และคืนพัสดุ',
      shortLabel: '3. โอนงบและคืนพัสดุ',
      badgeClass: 'badge-status-both',
      cardClass: 'card-status-both',
      icon: 'fa-solid fa-triangle-exclamation',
      color: '#e11d48'
    },
    STATUS_4: {
      key: 'STATUS_4',
      label: '4. ส่งเอกสารปิดงานแล้ว อยู่ระหว่างส่วนเกี่ยวข้องตรวจสอบ',
      shortLabel: '4. ส่งเอกสาร/รอตรวจสอบ',
      badgeClass: 'badge-status-docs',
      cardClass: 'card-status-docs',
      icon: 'fa-solid fa-file-circle-check',
      color: '#7c3aed'
    },
    STATUS_5: {
      key: 'STATUS_5',
      label: '5. ปิดงานแล้ว CLSD F4',
      shortLabel: '5. ปิดงานแล้ว CLSD F4',
      badgeClass: 'badge-status-closed',
      cardClass: 'card-status-closed',
      icon: 'fa-solid fa-circle-check',
      color: '#059669'
    },
    READY: {
      key: 'READY',
      label: 'พร้อมปิดงาน (งบประมาณสมบูรณ์)',
      shortLabel: 'พร้อมปิดงาน',
      badgeClass: 'badge-status-ready',
      cardClass: 'card-ready',
      icon: 'fa-solid fa-circle-check',
      color: '#16a34a'
    }
  };

  function el(id) {
    return document.getElementById(id);
  }

  function canUploadClsd() {
    const role = String(window.currentRole || window.authenticatedRole || 'viewer').toLowerCase();
    return role === 'admin' || role === 'editor';
  }

  function updateUploadRoleUI() {
    const allowed = canUploadClsd();
    document.querySelectorAll('#clsd-closing-view .clsd-upload-only').forEach(btn => {
      btn.style.display = allowed ? '' : 'none';
    });
    if (!allowed) {
      el('clsdUploadModal')?.classList.remove('show');
      el('clsdUpdateZpsr018Modal')?.classList.remove('show');
    }
    if (initialized) {
      renderProjectsCardsAndDirectory();
    }
  }
  window.clsdUpdateUploadRole = updateUploadRoleUI;

  function formatMoney(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return '0.00';
    return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function notify(message, type = 'info') {
    if (typeof window.Toastify === 'function') {
      const bg = type === 'success'
        ? 'linear-gradient(135deg, #059669, #10b981)'
        : (type === 'danger' ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'linear-gradient(135deg, #5e1784, #7b1fa2)');
      window.Toastify({
        text: message,
        duration: 3200,
        gravity: 'bottom',
        position: 'right',
        style: { background: bg, borderRadius: '10px', fontFamily: "'Prompt', sans-serif", fontSize: '13px', fontWeight: '500' }
      }).showToast();
      return;
    }
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:${type === 'success' ? '#10b981' : (type === 'danger' ? '#ef4444' : '#5e1784')};color:#fff;padding:12px 18px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);font-family:'Prompt',sans-serif;font-size:13px;z-index:10099;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  function getFriendlyNetworkDesc(netNo, rawDesc) {
    const s = String(netNo || '').trim();
    if (s.includes('6001322332')) return 'แผนกฐานรากสถานี';
    if (s.includes('6001322483')) return 'แผนกระบบกราวด์';
    if (s.includes('6001322333')) return 'สถานีไฟฟ้าแรงสูง';
    if (s.includes('6001322334')) return 'ระบบไฟฟ้าแรงต่ำ';
    if (s.includes('6001322341')) return 'สายส่งระบบ 1';
    if (s.includes('6001322342')) return 'สายส่งระบบ 2';
    if (rawDesc) {
      const clean = String(rawDesc).replace(/แผนก/g, '').replace(/^งาน/, '').trim();
      if (clean) return clean;
    }
    return `โครงข่าย ${netNo}`;
  }

  function getProjectStatusInfo(p) {
    if (!p) return STATUS_DEFINITIONS.READY;
    const custom = p.custom_status;
    if (custom && STATUS_DEFINITIONS[custom]) {
      return { ...STATUS_DEFINITIONS[custom], isManual: true };
    }
    if (custom) {
      for (const k in STATUS_DEFINITIONS) {
        if (custom.includes(STATUS_DEFINITIONS[k].label) || custom === k) {
          return { ...STATUS_DEFINITIONS[k], isManual: true };
        }
      }
    }
    const isDef = p.budget_summary && p.budget_summary.is_deficit;
    const retCount = p.materials_summary ? (p.materials_summary.need_return_count || 0) : 0;
    if (isDef && retCount > 0) return { ...STATUS_DEFINITIONS.STATUS_3, isManual: false };
    if (isDef) return { ...STATUS_DEFINITIONS.STATUS_1, isManual: false };
    if (retCount > 0) return { ...STATUS_DEFINITIONS.STATUS_2, isManual: false };
    return { ...STATUS_DEFINITIONS.READY, isManual: false };
  }

  // --------------------------------------------------------------------------
  // Supabase Cloud & Local Cache Persistence
  // --------------------------------------------------------------------------
  function initClsdSupabase() {
    if (clsdSupabase) return clsdSupabase;
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        clsdSupabase = window.supabase.createClient(CLSD_SUPABASE_CONFIG.url, CLSD_SUPABASE_CONFIG.anonKey, {
          auth: { persistSession: false }
        });
      } catch (e) {
        console.warn('CLSD Supabase init error:', e);
      }
    }
    return clsdSupabase;
  }

  async function supabaseRest(endpoint, options = {}) {
    const url = `${CLSD_SUPABASE_CONFIG.url.replace(/\/$/, '')}/rest/v1/${endpoint.replace(/^\//, '')}`;
    const headers = {
      apikey: CLSD_SUPABASE_CONFIG.anonKey,
      Authorization: `Bearer ${CLSD_SUPABASE_CONFIG.anonKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    try {
      return await fetch(url, { ...options, headers });
    } catch (e) {
      return null;
    }
  }

  function normalizeSupabaseRow(row) {
    if (!row) return row;
    const p = row.data && typeof row.data === 'object' ? { ...row.data } : { ...row };
    p.id = row.id || p.id;
    if (row.wbs) p.wbs = row.wbs;
    if (row.name) p.name = row.name;
    if (row.target_month) p.target_month = row.target_month;
    if (row.target_year_be) p.target_year_be = row.target_year_be;
    if (row.target_month_num) p.target_month_num = row.target_month_num;
    if (row.custom_status) {
      p.custom_status = row.custom_status;
      if (row.status_text) p.status_text = row.status_text;
    } else if (row.custom_status === null) {
      delete p.custom_status;
      delete p.status_text;
    }
    return p;
  }

  async function fetchProjectsFromSupabase() {
    initClsdSupabase();
    if (clsdSupabase) {
      try {
        const { data, error, status } = await clsdSupabase
          .from(CLSD_SUPABASE_CONFIG.table)
          .select('*')
          .order('updated_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          return { success: true, projects: data.map(normalizeSupabaseRow), status: 'connected' };
        }
        if (error && (status === 404 || error.code === 'PGRST205')) {
          return { success: false, status: 'table_missing' };
        }
      } catch (_) { }
    }
    try {
      const res = await supabaseRest('projects?select=*&order=updated_at.desc');
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return { success: true, projects: data.map(normalizeSupabaseRow), status: 'connected' };
        }
      } else if (res && res.status === 404) {
        return { success: false, status: 'table_missing' };
      }
    } catch (_) { }
    return { success: false, status: 'offline' };
  }

  async function upsertProjectToSupabase(project) {
    if (!project || !project.id) return false;
    initClsdSupabase();
    const row = {
      id: project.id,
      wbs: project.wbs || project.id,
      name: project.name || '',
      target_month: project.target_month || '',
      target_year_be: project.target_year_be || null,
      target_month_num: project.target_month_num || null,
      custom_status: project.custom_status || null,
      status_text: project.status_text || null,
      data: project,
      updated_at: new Date().toISOString()
    };
    if (clsdSupabase) {
      try {
        const { error } = await clsdSupabase.from(CLSD_SUPABASE_CONFIG.table).upsert(row, { onConflict: 'id' });
        if (!error) return true;
      } catch (_) { }
    }
    const res = await supabaseRest('projects', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(row)
    });
    return !!(res && res.ok);
  }

  async function updateProjectFieldInSupabase(projectId, fields) {
    if (!projectId || !fields) return false;
    initClsdSupabase();
    const patchPayload = { ...fields, updated_at: new Date().toISOString() };
    const currentProj = allProjects.find(p => p.id === projectId || p.wbs === projectId);
    if (currentProj) {
      patchPayload.data = { ...currentProj, ...fields };
    }
    if (clsdSupabase) {
      try {
        const { error } = await clsdSupabase.from(CLSD_SUPABASE_CONFIG.table).update(patchPayload).eq('id', projectId);
        if (!error) return true;
      } catch (_) { }
    }
    const res = await supabaseRest(`projects?id=eq.${encodeURIComponent(projectId)}`, {
      method: 'PATCH',
      body: JSON.stringify(patchPayload)
    });
    return !!(res && res.ok);
  }

  async function deleteProjectFromSupabase(projectId) {
    if (!projectId) return false;
    initClsdSupabase();
    if (clsdSupabase) {
      try {
        const { error } = await clsdSupabase.from(CLSD_SUPABASE_CONFIG.table).delete().eq('id', projectId);
        if (!error) return true;
      } catch (_) { }
    }
    const res = await supabaseRest(`projects?id=eq.${encodeURIComponent(projectId)}`, { method: 'DELETE' });
    return !!(res && res.ok);
  }

  function subscribeToClsdRealtime() {
    initClsdSupabase();
    if (!clsdSupabase || clsdRealtimeChannel) return;
    try {
      clsdRealtimeChannel = clsdSupabase
        .channel('pcts-clsd-projects-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
          if (!payload || !payload.eventType) return;
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new;
            if (!row || !row.id) return;
            const project = normalizeSupabaseRow(row);
            const idx = allProjects.findIndex(p => p.id === project.id || (project.wbs && p.wbs === project.wbs));
            if (idx >= 0) {
              allProjects[idx] = project;
              if (currentProject && (currentProject.id === project.id || currentProject.wbs === project.wbs)) {
                currentProject = project;
                renderProjectUI();
              }
            } else {
              allProjects.unshift(project);
            }
            saveProjectsToCache(allProjects);
            populateProjectSelect();
            renderProjectsCardsAndDirectory();
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id;
            if (!oldId) return;
            allProjects = allProjects.filter(p => p.id !== oldId && p.wbs !== oldId);
            saveProjectsToCache(allProjects);
            if (currentProject && (currentProject.id === oldId || currentProject.wbs === oldId)) {
              if (allProjects.length > 0) setCurrentProject(allProjects[0]);
              else renderEmptyProjectState();
            }
            populateProjectSelect();
            renderProjectsCardsAndDirectory();
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') updateCloudSyncBadge('connected');
        });
    } catch (e) {
      console.warn('CLSD realtime subscribe error:', e);
    }
  }

  function updateCloudSyncBadge(status) {
    clsdSupabaseStatus = status;
    const badge = el('clsdCloudSyncBadge');
    const text = el('clsdCloudSyncText');
    const modalBadge = el('clsdModalSupabaseBadge');
    const modalMsg = el('clsdModalSupabaseMsg');
    const guide = el('clsdSupabaseGuideSection');
    if (badge && text) {
      badge.className = 'clsd-sync-badge';
      if (status === 'connected') {
        badge.classList.add('sync-connected');
        text.textContent = 'Supabase Cloud: เชื่อมต่อแล้ว';
      } else if (status === 'table_missing') {
        badge.classList.add('sync-warning');
        text.textContent = 'Supabase: รอตั้งค่า SQL';
      } else if (status === 'offline') {
        badge.classList.add('sync-offline');
        text.textContent = 'โหมดข้อมูลในเครื่อง';
      } else {
        text.textContent = 'กำลังซิงค์ Cloud...';
      }
    }
    if (modalBadge) {
      modalBadge.textContent = status === 'connected' ? 'เชื่อมต่อแล้ว (Realtime)' : (status === 'table_missing' ? 'ยังไม่พบตาราง projects' : 'โหมดออฟไลน์');
    }
    if (modalMsg) {
      modalMsg.innerHTML = status === 'connected'
        ? '<span class="text-success"><i class="fa-solid fa-circle-check"></i> เชื่อมต่อฐานข้อมูล Cloud เดียวกับระบบ CLSD_SAP เรียบร้อยแล้ว</span>'
        : '<span class="text-warning"><i class="fa-solid fa-circle-info"></i> ระบบกำลังใช้ข้อมูลสำรองในเครื่อง / เซิร์ฟเวอร์</span>';
    }
    if (guide) guide.style.display = status === 'table_missing' ? 'block' : 'none';
  }

  function openProjectsDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) { resolve(null); return; }
      try {
        const req = window.indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (_) { resolve(null); }
    });
  }

  async function getCachedProjectsAsync() {
    try {
      const db = await openProjectsDB();
      if (db) {
        const res = await new Promise((resolve) => {
          try {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
          } catch (_) { resolve(null); }
        });
        if (Array.isArray(res)) return res;
      }
    } catch (_) { }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) { }
    return null;
  }

  async function saveProjectsToCache(projects) {
    if (!Array.isArray(projects)) return;
    try {
      const db = await openProjectsDB();
      if (db) {
        await new Promise((resolve) => {
          try {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put(projects, IDB_KEY);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
          } catch (_) { resolve(false); }
        });
      }
    } catch (_) { }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch (_) { }
  }

  function getDeletedIds() {
    try { return JSON.parse(localStorage.getItem(DELETED_IDS_KEY) || '[]'); } catch (_) { return []; }
  }
  function addDeletedId(id) {
    if (!id) return;
    const ids = getDeletedIds();
    if (!ids.includes(id)) {
      ids.push(id);
      try { localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids)); } catch (_) { }
    }
  }
  function removeDeletedId(id) {
    if (!id) return;
    const ids = getDeletedIds().filter(x => x !== id);
    try { localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(ids)); } catch (_) { }
  }

  async function loadProjectsData() {
    updateCloudSyncBadge('checking');
    // 1. Supabase Cloud
    const sbRes = await fetchProjectsFromSupabase();
    if (sbRes.success && Array.isArray(sbRes.projects) && sbRes.projects.length > 0) {
      updateCloudSyncBadge('connected');
      subscribeToClsdRealtime();
      allProjects = sbRes.projects;
      await saveProjectsToCache(allProjects);
      populateProjectSelect();
      if (!currentProject && allProjects.length > 0) setCurrentProject(allProjects[0]);
      renderProjectsCardsAndDirectory();
      return;
    }

    // 2. Local server API (/api/clsd/projects) or static seed (data/clsd_projects.json)
    let serverProjects = null;
    for (const url of ['/api/clsd/projects', 'data/clsd_projects.json']) {
      try {
        const resp = await fetch(url, { cache: 'no-store' });
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data) && data.length > 0) {
            serverProjects = data;
            break;
          }
        }
      } catch (_) { }
    }

    const cached = await getCachedProjectsAsync();
    const deleted = getDeletedIds();
    if (cached && cached.length > 0) {
      const seen = new Set(cached.map(p => p.id));
      const merged = [...cached];
      if (serverProjects) {
        serverProjects.forEach(sp => {
          if (!seen.has(sp.id) && !deleted.includes(sp.id)) merged.push(sp);
        });
      }
      allProjects = merged.filter(p => !deleted.includes(p.id));
    } else if (serverProjects) {
      allProjects = serverProjects.filter(p => !deleted.includes(p.id));
    } else {
      allProjects = [];
    }

    updateCloudSyncBadge(sbRes.status === 'table_missing' ? 'table_missing' : (sbRes.success ? 'connected' : 'offline'));
    await saveProjectsToCache(allProjects);
    populateProjectSelect();
    if (allProjects.length > 0) setCurrentProject(allProjects[0]);
    else renderEmptyProjectState();
    renderProjectsCardsAndDirectory();
  }

  // --------------------------------------------------------------------------
  // Client-Side PDF.js SAP ZPSR018 / ZBUDR018 Parser Fallback
  // (Ensures 100% functionality even on static GitHub Pages without Python)
  // --------------------------------------------------------------------------
  function cleanThaiTextJs(text) {
    if (!text) return '';
    let t = String(text)
      .replace(/ชื\fองาน|ชื องาน|ชืองาน/g, 'ชื่องาน')
      .replace(/สั\fง|สั ง/g, 'สั่ง')
      .replace(/เรื\fอง|เรื อง/g, 'เรื่อง')
      .replace(/สถานที\f|สถานที /g, 'สถานที่ ')
      .replace(/วันที\f|วันที /g, 'วันที่ ')
      .replace(/\f/g, '');
    const map = {
      '\xc9': '\u0e48', '\xca': '\u0e49', '\xcb': '\u0e4a', '\xcc': '\u0e4b', '\xcd': '\u0e4c',
      'É': '\u0e48', 'Ê': '\u0e49', 'Ë': '\u0e4a', 'Ì': '\u0e4b', 'Í': '\u0e4c',
      'ř': '1', 'Ŝ': '4', 'ŝ': '4', 'ํา': 'ำ', 'ชหมายเลขงาน': ' หมายเลขงาน'
    };
    for (const [k, v] of Object.entries(map)) {
      t = t.split(k).join(v);
    }
    return t.replace(/อ้อมน้อย1/g, 'อ้อมน้อย 1');
  }

  function suggestProjectNameFromFilename(filename) {
    if (!filename) return '';
    let base = filename.replace(/\.[^/.]+$/, '');
    base = base.replace(/^(?:ZPSR018|ZBUDR018|018|รายงานการปิดงาน|รายงานปิดงาน|ปิดงาน)[-_ ]*/i, '');
    base = base.replace(/[-_ ]*\d{1,2}[-_\.]\d{1,2}[-_\.]\d{2,4}$/, '').trim();
    const numMatch = base.match(/(\d+)\s*(\((?:ชค|ช|ชั่วคราว)?\))?/);
    const num = numMatch ? numMatch[1] : '';
    const suffix = (numMatch && numMatch[2] && numMatch[2].includes('ช')) ? '(ช)' : (numMatch && numMatch[2] ? numMatch[2] : '(ช)');
    if (base.includes('สมุทรสาคร') || base.includes('สค.')) return num ? `งานก่อสร้างสฟฟ.สค. ${num}${suffix}` : 'งานก่อสร้างสฟฟ.สค.';
    if (base.includes('อ้อมน้อย') || base.includes('อน.')) return num ? `งานก่อสร้างระบบไฟฟ้าภายในสฟฟ.อ้อมน้อย ${num}` : 'งานก่อสร้างระบบไฟฟ้าภายในสฟฟ.อ้อมน้อย';
    if (base.includes('ท่าม่วง') || base.includes('ทมง.')) return num ? `งานด้านสถานีไฟฟ้าทมง.${num}` : 'งานด้านสถานีไฟฟ้าทมง.';
    if (base.includes('กระทุ่มแบน') || base.includes('กบ.')) return num ? `งานก่อสร้างสฟฟ.กบ. ${num}${suffix}` : 'งานก่อสร้างสฟฟ.กบ.';
    if (base.includes('ดำเนินสะดวก') || base.includes('ดน.')) return num ? `งานก่อสร้างสฟฟ.ดน. ${num}${suffix}` : 'งานก่อสร้างสฟฟ.ดน.';
    if (base.length > 0) {
      const clean = base.replace(/^(?:งานก่อสร้าง|งาน)/, '').trim();
      return `งานก่อสร้าง ${clean}`;
    }
    return '';
  }

  function generateSmartNetworkTransfersJs(networks, isOmns) {
    const runningDiffs = {};
    const runningEsts = {};
    const netMap = {};
    networks.forEach(n => {
      const netNo = String(n.network_no);
      netMap[netNo] = n;
      (n.site_categories || []).forEach(c => {
        runningDiffs[`${netNo}|${c.name}`] = Number(c.diff || 0);
        runningEsts[`${netNo}|${c.name}`] = Number(c.estimate || 0);
      });
    });

    const recs = [];
    const deficits = [];
    Object.entries(runningDiffs).forEach(([k, diff]) => {
      if (diff < 0) {
        const [netNo, catName] = k.split('|');
        deficits.push({ netNo, catName, absDiff: Math.abs(diff) });
      }
    });
    deficits.sort((a, b) => b.absDiff - a.absDiff);

    deficits.forEach(({ netNo, catName: targetCat }) => {
      let needed = Math.max(0, -runningDiffs[`${netNo}|${targetCat}`]);
      if (needed <= 0) return;
      const targetNet = netMap[netNo] || {};
      const targetDesc = getFriendlyNetworkDesc(netNo, targetNet.description || '');

      if (isOmns && netNo === '6001322483' && targetCat.includes('เบ็ดเตล็ด') && netMap['6001322332']) {
        const supKey = '6001322332|ค่าควบคุมงาน';
        const supAvail = runningDiffs[supKey] || 0;
        const interAmt = Math.min(50000, Math.max(0, supAvail - 1000));
        if (interAmt > 0) {
          const initEst = runningEsts[`${netNo}|${targetCat}`];
          const newEst = initEst + interAmt;
          runningEsts[`${netNo}|${targetCat}`] = newEst;
          runningDiffs[supKey] = +(runningDiffs[supKey] - interAmt).toFixed(2);
          runningDiffs[`${netNo}|${targetCat}`] = +(runningDiffs[`${netNo}|${targetCat}`] + interAmt).toFixed(2);
          needed = Math.max(0, -runningDiffs[`${netNo}|${targetCat}`]);
          recs.push({
            step: recs.length + 1,
            type: 'inter_network',
            title: 'ขาที่ 1: โอนข้ามโครงข่าย (Inter-Network)',
            tag: 'โอนข้ามโครงข่าย',
            tagClass: 'bg-purple',
            network_no: netNo,
            donor_network: '6001322332',
            donor_desc: getFriendlyNetworkDesc('6001322332', netMap['6001322332'].description),
            donor_category: 'ค่าควบคุมงาน',
            donor_available: supAvail,
            donor_remaining: Math.max(0, runningDiffs[supKey]),
            target_network: netNo,
            target_desc: targetDesc,
            target_category: targetCat,
            initial_estimate: initEst,
            amount: interAmt,
            new_estimate: newEst,
            reason: `อนุมัติให้โอนงบค่าควบคุมงาน แผนกฐานรากสถานี จำนวน ${formatMoney(interAmt)} บาท ไปเป็น${targetCat} ${targetDesc} ซึ่งเมื่อโอนงบค่าใช้จ่ายในครั้งนี้แล้วงบ${targetCat} เพิ่มขึ้น เป็นเงิน (${formatMoney(initEst)} + ${formatMoney(interAmt)}) = ${formatMoney(newEst)} บาท`
          });
        }
      }

      const intraOrder = ['ค่าแรงงาน / ค่าจ้างเหมา', 'ค่าควบคุมงาน', 'ค่าขนส่ง / ยานพาหนะ', 'ค่าดำเนินการ'];
      const intraCands = intraOrder
        .filter(c => c !== targetCat && (runningDiffs[`${netNo}|${c}`] || 0) > 1000)
        .map(c => ({ c, avail: runningDiffs[`${netNo}|${c}`] }))
        .sort((a, b) => b.avail - a.avail);

      for (const { c: donorCat } of intraCands) {
        if (needed <= 0) break;
        const curAvail = runningDiffs[`${netNo}|${donorCat}`] || 0;
        const cap100 = Math.floor(Math.max(0, curAvail - 1000) / 100) * 100;
        if (cap100 <= 0) continue;
        const amt = Math.min(Math.ceil(needed / 100) * 100, cap100);
        if (amt <= 0) continue;
        const initEst = runningEsts[`${netNo}|${targetCat}`];
        const newEst = initEst + amt;
        runningEsts[`${netNo}|${targetCat}`] = newEst;
        runningDiffs[`${netNo}|${donorCat}`] = +(curAvail - amt).toFixed(2);
        runningDiffs[`${netNo}|${targetCat}`] = +(runningDiffs[`${netNo}|${targetCat}`] + amt).toFixed(2);
        needed = Math.max(0, -runningDiffs[`${netNo}|${targetCat}`]);
        recs.push({
          step: recs.length + 1,
          type: 'intra_network',
          title: `ขาที่ ${recs.length + 1}: โอนภายในโครงข่าย ${netNo}`,
          tag: 'โอนภายในโครงข่าย',
          tagClass: 'bg-gold text-dark',
          network_no: netNo,
          donor_network: netNo,
          donor_desc: targetDesc,
          donor_category: donorCat,
          donor_available: curAvail,
          donor_remaining: Math.max(0, runningDiffs[`${netNo}|${donorCat}`]),
          target_network: netNo,
          target_desc: targetDesc,
          target_category: targetCat,
          initial_estimate: initEst,
          amount: amt,
          new_estimate: newEst,
          reason: `อนุมัติให้โอนงบ${donorCat} ${targetDesc} จำนวน ${formatMoney(amt)} บาท ไปเป็น${targetCat} ${targetDesc} ซึ่งเมื่อโอนงบค่าใช้จ่ายในครั้งนี้แล้วงบ${targetCat} เพิ่มขึ้น เป็นเงิน (${formatMoney(initEst)} + ${formatMoney(amt)}) = ${formatMoney(newEst)} บาท`
        });
      }

      if (needed > 0) {
        const interCands = [];
        Object.entries(runningDiffs).forEach(([k, avail]) => {
          const [oNet, oCat] = k.split('|');
          if (oNet !== netNo && avail > 1000) interCands.push({ oNet, oCat, avail });
        });
        interCands.sort((a, b) => b.avail - a.avail);
        for (const { oNet, oCat } of interCands) {
          if (needed <= 0) break;
          const curAvail = runningDiffs[`${oNet}|${oCat}`] || 0;
          const cap100 = Math.floor(Math.max(0, curAvail - 1000) / 100) * 100;
          if (cap100 <= 0) continue;
          const amt = Math.min(Math.ceil(needed / 100) * 100, cap100);
          if (amt <= 0) continue;
          const donorDesc = getFriendlyNetworkDesc(oNet, (netMap[oNet] || {}).description || '');
          const initEst = runningEsts[`${netNo}|${targetCat}`];
          const newEst = initEst + amt;
          runningEsts[`${netNo}|${targetCat}`] = newEst;
          runningDiffs[`${oNet}|${oCat}`] = +(curAvail - amt).toFixed(2);
          runningDiffs[`${netNo}|${targetCat}`] = +(runningDiffs[`${netNo}|${targetCat}`] + amt).toFixed(2);
          needed = Math.max(0, -runningDiffs[`${netNo}|${targetCat}`]);
          recs.push({
            step: recs.length + 1,
            type: 'inter_network',
            title: `ขาที่ ${recs.length + 1}: โอนข้ามโครงข่าย (${oNet} -> ${netNo})`,
            tag: 'โอนข้ามโครงข่าย',
            tagClass: 'bg-purple',
            network_no: netNo,
            donor_network: oNet,
            donor_desc: donorDesc,
            donor_category: oCat,
            donor_available: curAvail,
            donor_remaining: Math.max(0, runningDiffs[`${oNet}|${oCat}`]),
            target_network: netNo,
            target_desc: targetDesc,
            target_category: targetCat,
            initial_estimate: initEst,
            amount: amt,
            new_estimate: newEst,
            reason: `อนุมัติให้โอนงบ${oCat} ${donorDesc} จำนวน ${formatMoney(amt)} บาท ไปเป็น${targetCat} ${targetDesc} ซึ่งเมื่อโอนงบค่าใช้จ่ายในครั้งนี้แล้วงบ${targetCat} เพิ่มขึ้น เป็นเงิน (${formatMoney(initEst)} + ${formatMoney(amt)}) = ${formatMoney(newEst)} บาท`
          });
        }
      }
    });
    return recs;
  }

  async function parseSapPdfInBrowser(file, customName) {
    if (typeof window.ensurePdfJs === 'function') {
      await window.ensurePdfJs();
    }
    if (!window.pdfjsLib) {
      throw new Error('ไม่สามารถโหลด PDF.js สำหรับอ่านไฟล์ PDF บนเบราว์เซอร์ได้');
    }
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    const cols = [
      ['code', 10, 71], ['desc', 71, 227], ['unit', 227, 258],
      ['estimated', 258, 320], ['withdrawn', 320, 382], ['returned', 382, 445],
      ['damaged', 445, 507], ['installed', 507, 570], ['withdrawn_cost', 570, 638],
      ['dismantled_cost', 638, 700], ['audited_qty', 700, 815]
    ];
    const getCol = (x) => {
      for (const [n, mn, mx] of cols) if (x >= mn && x < mx) return n;
      return null;
    };

    let fullText = '';
    const pagesItems = [];
    const pagesLines = [];

    for (let pNum = 1; pNum <= pdf.numPages; pNum++) {
      const page = await pdf.getPage(pNum);
      const viewport = page.getViewport({ scale: 1.0 });
      const tc = await page.getTextContent();
      const words = [];
      const lineBuckets = [];

      tc.items.forEach(it => {
        const str = cleanThaiTextJs(it.str || '');
        if (!str.trim()) return;
        const x = it.transform[4];
        const yTop = viewport.height - it.transform[5];
        const w = it.width || 10;
        words.push({ text: str, x0: x, x1: x + w, y: yTop });

        let bucket = lineBuckets.find(b => Math.abs(b.y - yTop) <= 4.5);
        if (!bucket) {
          bucket = { y: yTop, items: [] };
          lineBuckets.push(bucket);
        }
        bucket.items.push({ x, str });
      });

      lineBuckets.sort((a, b) => a.y - b.y);
      const lines = lineBuckets.map(b => {
        b.items.sort((a, c) => a.x - c.x);
        return b.items.map(i => i.str).join(' ').trim();
      }).filter(Boolean);

      pagesItems.push(words);
      pagesLines.push(lines);
      fullText += lines.join('\n') + '\n';
    }

    const upper = fullText.toUpperCase().replace(/[\s-]/g, '');
    let templateCode = 'UNKNOWN';
    if (upper.includes('ZPSR018') || upper.includes('ZPSR')) templateCode = 'ZPSR018';
    else if (upper.includes('ZBUDR018') || upper.includes('ZBUD')) templateCode = 'ZBUDR018';
    else if (['การปิดงานก่อสร้าง', 'ปิดงานก่อสร้าง', 'ใบส่งคืนพัสดุ', 'หมายเลขงาน'].some(k => fullText.includes(k))) {
      templateCode = 'ZPSR018';
    } else {
      return {
        success: false,
        error: 'ไฟล์นี้ไม่ใช่ไฟล์รายงานปิดงานก่อสร้างจากระบบ SAP (ต้องเป็น Template ZPSR018 หรือ ZBUDR018 ของ กฟภ.)'
      };
    }

    const wbsMatch = fullText.match(/หมายเลขงาน\s*([A-Za-z0-9.\-_]+)/);
    const projectId = wbsMatch ? wbsMatch[1].trim() : ('P-' + Date.now());
    const projectName = (customName && customName.trim()) || suggestProjectNameFromFilename(file.name) || `โครงการก่อสร้างระบบไฟฟ้า ${projectId}`;

    const offMatch = fullText.match(/ให้นาย([^\s\d]+(?:\s+[^\s\d]+)?)\s*รหัสประ[จํจำ]*ตัว\s*(\d+)/);
    const officerName = offMatch ? ('นาย' + offMatch[1].trim()) : '-';
    const officerId = offMatch ? offMatch[2].trim() : '-';
    const dateMatch = fullText.match(/วันที่พิมพ์\s*([\d.]+)/);
    const printDate = dateMatch ? dateMatch[1].trim() : new Date().toLocaleDateString('th-TH');

    // Parse Materials
    const materials = [];
    let stopMat = false;
    for (let idx = 0; idx < pagesItems.length; idx++) {
      if (stopMat) break;
      const pTxt = pagesLines[idx].join('\n');
      if (/\|\s*1\s*\|\s*\d{10}/.test(pTxt)) stopMat = true;
      const words = pagesItems[idx];
      const codeWords = words.filter(w => /^\d-\d{2}-\d{3}-\d{4}$/.test(w.text.replace(/\|/g, '').trim()));
      codeWords.forEach(mc => {
        const codeStr = mc.text.replace(/\|/g, '').trim();
        const rowWords = words.filter(w => Math.abs(w.y - mc.y) <= 5.5);
        const item = {
          id: `${codeStr}_${materials.length + 1}`,
          page: idx + 1,
          section: 'งานก่อสร้างระบบไฟฟ้า',
          code: codeStr,
          desc: '',
          unit: 'EA',
          estimated: 0, withdrawn: 0, returned: 0, damaged: 0,
          installed: 0, withdrawn_cost: 0, dismantled_cost: 0, audited_qty: 0,
          status: 'complete', to_return: 0, to_withdraw: 0
        };
        const descParts = [];
        rowWords.forEach(rw => {
          const wt = rw.text.replace(/\|/g, '').trim();
          if (!wt || wt === 'NA' || wt === codeStr || wt.includes('_____')) return;
          const col = getCol((rw.x0 + rw.x1) / 2);
          if (col === 'desc') descParts.push(wt);
          else if (col === 'unit') item.unit = wt;
          else if (col && col in item) {
            const num = parseFloat(wt.replace(/,/g, ''));
            if (!isNaN(num)) item[col] = num;
          }
        });
        item.desc = descParts.join(' ') || `พัสดุรหัส ${codeStr}`;
        const excess = item.withdrawn - item.installed - item.returned - item.damaged;
        if (excess > 0 || item.returned > 0 || item.dismantled_cost > 0) {
          item.status = 'need_return';
          item.to_return = Math.max(0, excess);
        } else if (item.estimated > item.withdrawn) {
          item.status = 'need_withdraw';
          item.to_withdraw = item.estimated - item.withdrawn;
        }
        materials.push(item);
      });
    }

    // Parse Network & 10 Categories from combined lines
    const categoryDefs = [
      ['c1', 'ค่าพัสดุ', 'material', 'หมวดพัสดุ'],
      ['c2', 'พัสดุเข้างาน', 'material', 'หมวดพัสดุ'],
      ['c3', 'ค่าแรงงาน / ค่าจ้างเหมา', 'site', 'ค่าใช้จ่ายหน้างาน'],
      ['c4', 'ค่าควบคุมงาน', 'site', 'ค่าใช้จ่ายหน้างาน'],
      ['c5', 'ค่าขนส่ง / ยานพาหนะ', 'site', 'ค่าใช้จ่ายหน้างาน'],
      ['c6', 'ค่าเบ็ดเตล็ด', 'site', 'ค่าใช้จ่ายหน้างาน'],
      ['c7', 'ค่าดำเนินการ', 'site', 'ค่าใช้จ่ายหน้างาน'],
      ['c8', 'บันทึกเวลา / ปันส่วน', 'allocated', 'ค่าใช้จ่ายปันส่วนทางบัญชี'],
      ['c9', 'ค่าดอกเบี้ยฯ / ทางอ้อม', 'allocated', 'ค่าใช้จ่ายปันส่วนทางบัญชี'],
      ['c10', 'ค่าใช้จ่ายทางอ้อม / อื่นๆ', 'allocated', 'ค่าใช้จ่ายปันส่วนทางบัญชี']
    ];

    const allLines = pagesLines.flat();
    const parseNumsFromLine = (str) => {
      const tokens = str.replace(/\|/g, ' ').split(/\s+/);
      const nums = [];
      tokens.forEach(tok => {
        if (!/^[\d,]+(?:\.\d+)?-?$/.test(tok)) return;
        const neg = tok.endsWith('-');
        const v = parseFloat(tok.replace(/[,-]/g, ''));
        if (!isNaN(v)) nums.push(neg ? -v : v);
      });
      return nums;
    };

    const networks = [];
    for (let i = 0; i < allLines.length; i++) {
      const m = allLines[i].match(/\|?\s*(\d+)\s*\|\s*(\d{10})\s*\|\s*([^|]+)/);
      if (m) {
        const seq = parseInt(m[1], 10);
        const netNo = m[2].trim();
        const netDesc = m[3].replace(/ประมาณการ.*$/, '').trim();
        let estNums = [], actNums = [], diffNums = [];
        for (let k = i; k < Math.min(allLines.length, i + 25); k++) {
          if (allLines[k].includes('ประมาณการ') && estNums.length === 0) estNums = parseNumsFromLine(allLines[k]);
          else if (allLines[k].includes('ค่าจริง') && actNums.length === 0) actNums = parseNumsFromLine(allLines[k]);
          else if (allLines[k].includes('ผลต่าง') && diffNums.length === 0) { diffNums = parseNumsFromLine(allLines[k]); break; }
        }
        if (estNums.length >= 5 && actNums.length >= 5) {
          const cats = [];
          const siteCats = [];
          for (let cIdx = 0; cIdx < 10; cIdx++) {
            const [cid, cname, cgrp, cgrpName] = categoryDefs[cIdx];
            const e = estNums[cIdx] || 0;
            const a = actNums[cIdx] || 0;
            const d = diffNums[cIdx] !== undefined ? diffNums[cIdx] : +(e - a).toFixed(2);
            const cObj = { id: cid, name: cname, group: cgrp, group_name: cgrpName, estimate: e, actual: a, diff: d, is_deficit: d < 0 };
            cats.push(cObj);
            if (cgrp === 'site') siteCats.push(cObj);
          }
          const siteDeficits = siteCats.filter(c => c.diff < 0);
          const totEst = estNums[10] !== undefined ? estNums[10] : cats.reduce((s, c) => s + c.estimate, 0);
          const totAct = actNums[10] !== undefined ? actNums[10] : cats.reduce((s, c) => s + c.actual, 0);
          const totDiff = diffNums[10] !== undefined ? diffNums[10] : cats.reduce((s, c) => s + c.diff, 0);
          const hasDef = totDiff < 0 || siteDeficits.length > 0;
          networks.push({
            seq, network_no: netNo, description: netDesc,
            categories: cats, site_categories: siteCats,
            total_estimate: +totEst.toFixed(2), total_actual: +totAct.toFixed(2), total_diff: +totDiff.toFixed(2),
            site_estimate: +siteCats.reduce((s, c) => s + c.estimate, 0).toFixed(2),
            site_actual: +siteCats.reduce((s, c) => s + c.actual, 0).toFixed(2),
            site_diff: +siteCats.reduce((s, c) => s + c.diff, 0).toFixed(2),
            site_deficits: siteDeficits,
            site_surpluses: siteCats.filter(c => c.diff > 0),
            has_deficit: hasDef,
            status: hasDef ? 'DEFICIT' : 'READY'
          });
        }
      }
    }

    const categories = categoryDefs.map(([cid, cname, cgrp, cgrpName], idx) => {
      const e = +networks.reduce((s, n) => s + ((n.categories[idx]?.estimate) || 0), 0).toFixed(2);
      const a = +networks.reduce((s, n) => s + ((n.categories[idx]?.actual) || 0), 0).toFixed(2);
      const d = +networks.reduce((s, n) => s + ((n.categories[idx]?.diff) || 0), 0).toFixed(2);
      return { id: cid, name: cname, group: cgrp, group_name: cgrpName, estimate: e, actual: a, diff: d, is_deficit: d < 0 };
    });

    const siteItems = categories.filter(c => c.group === 'site');
    const siteDeficits = siteItems.filter(c => c.diff < 0);
    const totalDef = +siteDeficits.reduce((s, c) => s + Math.abs(c.diff), 0).toFixed(2);
    const allocBudget = +siteItems.reduce((s, c) => s + c.estimate, 0).toFixed(2);
    const ctrlActual = +siteItems.reduce((s, c) => s + c.actual, 0).toFixed(2);
    const remBudget = +(allocBudget - ctrlActual).toFixed(2);
    const isOmns = projectId.includes('OMNS') || networks.some(n => String(n.network_no).includes('6001322332'));
    const netRecs = generateSmartNetworkTransfersJs(networks, isOmns);

    return {
      success: true,
      id: projectId,
      template: templateCode,
      name: projectName,
      wbs: projectId,
      officer: officerName,
      officer_id: officerId,
      print_date: printDate,
      target_month: 'กันยายน 2569',
      target_year_be: 2569,
      target_month_num: 9,
      status: (siteDeficits.length > 0 || networks.some(n => n.has_deficit)) ? 'CANNOT_CLOSE' : 'READY_TO_CLOSE',
      networks,
      networks_summary: {
        total_count: networks.length,
        ready_count: networks.filter(n => !n.has_deficit).length,
        deficit_count: networks.filter(n => n.has_deficit).length,
        deficit_networks: networks.filter(n => n.has_deficit),
        transfer_recommendations: netRecs
      },
      budget_summary: {
        focus: 'site_expenses',
        allocated_budget: allocBudget,
        controlled_actual: ctrlActual,
        remaining_budget: remBudget,
        disbursement_rate_pct: allocBudget > 0 ? +((ctrlActual / allocBudget) * 100).toFixed(2) : 0,
        categories,
        deficits: siteDeficits,
        total_deficit: totalDef,
        is_deficit: siteDeficits.length > 0,
        recommendations: []
      },
      materials_summary: {
        total_count: materials.length,
        need_return_count: materials.filter(m => m.status === 'need_return').length,
        need_withdraw_count: materials.filter(m => m.status === 'need_withdraw').length,
        complete_count: materials.filter(m => m.status === 'complete').length,
        need_return_items: materials.filter(m => m.status === 'need_return'),
        need_withdraw_items: materials.filter(m => m.status === 'need_withdraw'),
        all_items: materials
      },
      created_at: new Date().toISOString()
    };
  }

  // --------------------------------------------------------------------------
  // Navigation & View Switching inside CLSD Module
  // --------------------------------------------------------------------------
  function switchTab(tabId) {
    document.querySelectorAll('#clsd-closing-view .clsd-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-clsd-tab') === tabId);
    });
    document.querySelectorAll('#clsd-closing-view .clsd-tab-content').forEach(c => {
      c.classList.toggle('active', c.id === tabId);
    });
    const hero = el('clsdProjectDetailHero');
    if (hero) {
      hero.style.display = tabId === 'clsd-tab-projects' ? 'none' : 'block';
    }
    if (tabId === 'clsd-tab-projects') {
      renderProjectsCardsAndDirectory();
    } else if (tabId === 'clsd-tab-overview' && budgetChart) {
      setTimeout(() => { try { budgetChart.resize(); } catch (_) { } }, 60);
    }
  }

  function setProjectsViewMode(mode) {
    projectsViewMode = mode;
    const btnCards = el('clsdBtnViewCards');
    const btnTable = el('clsdBtnViewTable');
    const cardsBox = el('clsdProjectsCardsContainer');
    const tableBox = el('clsdProjectsTableContainer');
    if (mode === 'cards') {
      if (btnCards) btnCards.className = 'clsd-btn clsd-btn-xs clsd-btn-purple active';
      if (btnTable) btnTable.className = 'clsd-btn clsd-btn-xs clsd-btn-outline-purple';
      if (cardsBox) cardsBox.style.display = 'grid';
      if (tableBox) tableBox.style.display = 'none';
    } else {
      if (btnCards) btnCards.className = 'clsd-btn clsd-btn-xs clsd-btn-outline-purple';
      if (btnTable) btnTable.className = 'clsd-btn clsd-btn-xs clsd-btn-purple active';
      if (cardsBox) cardsBox.style.display = 'none';
      if (tableBox) tableBox.style.display = 'block';
    }
  }

  function setStatusFilter(statusKey) {
    const sel = el('clsdHubStatusFilter');
    if (sel) sel.value = statusKey;
    document.querySelectorAll('#clsd-closing-view .status-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-status') === statusKey);
    });
    renderProjectsCardsAndDirectory();
  }

  function selectProjectById(id) {
    const match = allProjects.find(p => p.id === id || p.wbs === id);
    if (match) {
      setCurrentProject(match);
      switchTab('clsd-tab-overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function populateProjectSelect() {
    const sel = el('clsdProjectSelect');
    if (!sel) return;
    sel.innerHTML = '';
    if (allProjects.length === 0) {
      sel.innerHTML = '<option value="">ไม่มีข้อมูลโครงการ (โปรดอัปโหลด)</option>';
      return;
    }
    allProjects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.wbs || p.id} - ${p.name}`;
      sel.appendChild(opt);
    });
    if (currentProject) sel.value = currentProject.id;
  }

  function setCurrentProject(project) {
    currentProject = project;
    const sel = el('clsdProjectSelect');
    if (sel && project) sel.value = project.id;
    renderProjectUI();
  }

  function renderEmptyProjectState() {
    currentProject = null;
    if (el('clsdHeroWbs')) el('clsdHeroWbs').textContent = '-';
    if (el('clsdHeroProjectName')) el('clsdHeroProjectName').textContent = 'ไม่มีโครงการในระบบ (โปรดอัปโหลดรายงาน SAP ZPSR018)';
    populateProjectSelect();
    renderProjectsCardsAndDirectory();
  }

  // --------------------------------------------------------------------------
  // Render Hub Cards & Directory Table
  // --------------------------------------------------------------------------
  function renderProjectsCardsAndDirectory() {
    const sidebarBadge = el('badgeClsdCount');
    if (sidebarBadge) sidebarBadge.textContent = allProjects.length;

    const cardsContainer = el('clsdProjectsCardsContainer');
    const tbody = el('clsdProjectsDirectoryBody');
    const query = (el('clsdHubSearchInput')?.value || '').trim().toLowerCase();
    const filterVal = el('clsdHubStatusFilter')?.value || 'ALL';

    let readyCount = 0, deficitCount = 0, missingCount = 0;
    let c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0, cReady = 0;

    allProjects.forEach(p => {
      const sInfo = getProjectStatusInfo(p);
      if (sInfo.key === 'STATUS_1') c1++;
      else if (sInfo.key === 'STATUS_2') c2++;
      else if (sInfo.key === 'STATUS_3') c3++;
      else if (sInfo.key === 'STATUS_4') c4++;
      else if (sInfo.key === 'STATUS_5') c5++;
      else if (sInfo.key === 'READY') cReady++;

      if (p.budget_summary && p.budget_summary.is_deficit) deficitCount++;
      else readyCount++;

      if ((p.materials_summary?.need_withdraw_count || 0) > 0) missingCount++;
    });

    if (el('clsdHubTotalCount')) el('clsdHubTotalCount').textContent = allProjects.length;
    if (el('clsdHubReadyCount')) el('clsdHubReadyCount').textContent = readyCount;
    if (el('clsdHubDeficitCount')) el('clsdHubDeficitCount').textContent = deficitCount;
    if (el('clsdHubMissingCount')) el('clsdHubMissingCount').textContent = missingCount;

    if (el('clsdCountStatusAll')) el('clsdCountStatusAll').textContent = allProjects.length;
    if (el('clsdCountStatus1')) el('clsdCountStatus1').textContent = c1;
    if (el('clsdCountStatus2')) el('clsdCountStatus2').textContent = c2;
    if (el('clsdCountStatus3')) el('clsdCountStatus3').textContent = c3;
    if (el('clsdCountStatus4')) el('clsdCountStatus4').textContent = c4;
    if (el('clsdCountStatus5')) el('clsdCountStatus5').textContent = c5;
    if (el('clsdCountStatusReady')) el('clsdCountStatusReady').textContent = cReady;

    let filtered = allProjects.filter(p => {
      const k = getProjectStatusInfo(p).key;
      if (filterVal === 'READY') return k === 'READY' || k === 'STATUS_5';
      if (filterVal === 'DEFICIT') return !!(p.budget_summary && p.budget_summary.is_deficit);
      if (filterVal === 'WITHDRAW') return (p.materials_summary?.need_withdraw_count || 0) > 0;
      if (filterVal.startsWith('STATUS_')) return k === filterVal;
      return true;
    });

    if (query) {
      filtered = filtered.filter(p =>
        (p.wbs || p.id || '').toLowerCase().includes(query) ||
        (p.name || '').toLowerCase().includes(query) ||
        (p.officer || '').toLowerCase().includes(query)
      );
    }

    const allowUpload = canUploadClsd();

    if (cardsContainer) {
      cardsContainer.innerHTML = '';
      if (filtered.length === 0) {
        cardsContainer.innerHTML = allProjects.length === 0
          ? (allowUpload
            ? `<div class="clsd-project-card project-card-add" onclick="window.CLSDClosing.openUploadModal()" style="grid-column:1/-1;">
                 <div class="add-card-inner">
                   <div class="add-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                   <h4>ยังไม่มีโครงการในระบบ</h4>
                   <p>คลิกที่นี่เพื่ออัปโหลดรายงานปิดงาน SAP ZPSR018 / ZBUDR018 (.pdf)</p>
                 </div>
               </div>`
            : `<div style="grid-column:1/-1;text-align:center;padding:2.5rem 1rem;color:var(--clsd-text-muted);">
                 <i class="fa-solid fa-folder-open" style="font-size:2rem;margin-bottom:0.5rem;opacity:0.5;"></i>
                 <h4>ยังไม่มีโครงการในระบบ</h4>
                 <p style="font-size:0.84rem;">เฉพาะผู้ดูแลระบบ (Admin) และผู้ควบคุมงาน (Editor) เท่านั้นที่สามารถอัปโหลดไฟล์ได้</p>
               </div>`)
          : `<div style="grid-column:1/-1;text-align:center;padding:2.5rem 1rem;color:var(--clsd-text-muted);">
               <i class="fa-solid fa-magnifying-glass" style="font-size:1.8rem;margin-bottom:0.5rem;opacity:0.5;"></i>
               <h4>ไม่พบโครงการที่ตรงกับเงื่อนไขการค้นหา</h4>
             </div>`;
      } else {
        filtered.forEach(p => {
          const sInfo = getProjectStatusInfo(p);
          const isDef = p.budget_summary && p.budget_summary.is_deficit;
          const defSum = p.budget_summary ? (p.budget_summary.total_deficit || 0) : 0;
          const withCount = p.materials_summary ? (p.materials_summary.need_withdraw_count || 0) : 0;
          const retCount = p.materials_summary ? (p.materials_summary.need_return_count || 0) : 0;
          const isCurrent = currentProject && (currentProject.id === p.id || currentProject.wbs === p.wbs);

          let readiness = 100;
          if (isDef) readiness -= 40;
          if (retCount > 0) readiness -= 20;
          if (withCount > 0) readiness -= 15;
          if (sInfo.key === 'STATUS_5') readiness = 100;
          readiness = Math.max(0, readiness);

          const fillClass = readiness < 50 ? 'fill-danger' : (readiness < 90 ? 'fill-warning' : 'fill-success');
          const scoreColor = readiness < 50 ? 'text-danger' : (readiness < 90 ? 'text-warning' : 'text-success');
          const safeId = escapeHtml(p.id);
          const safeName = escapeHtml(p.name);
          const safeWbs = escapeHtml(p.wbs || p.id);

          const card = document.createElement('div');
          card.className = `clsd-project-card ${sInfo.cardClass} ${isCurrent ? 'card-current' : ''}`;
          card.innerHTML = `
            <div>
              <div class="project-card-header">
                <span class="project-card-wbs"><i class="fa-solid fa-hashtag"></i> ${safeWbs}</span>
                <span class="clsd-badge ${sInfo.badgeClass} clickable-status-pill" onclick="event.stopPropagation(); window.CLSDClosing.openChangeStatusModal('${safeId}')" title="คลิกเปลี่ยนสถานะปิดงาน">
                  <i class="${sInfo.icon}"></i> ${escapeHtml(sInfo.shortLabel)} <i class="fa-solid fa-pen" style="font-size:0.65rem;opacity:0.7;"></i>
                </span>
              </div>
              <h4 class="project-card-title" title="${safeName}">${safeName}</h4>
              <div class="project-card-meta">
                <span><i class="fa-solid fa-user-gear"></i> ${escapeHtml(p.officer || '-')} (รหัส ${escapeHtml(p.officer_id || '-')})</span>
                <span><i class="fa-solid fa-calendar-check text-gold"></i> แผนปิดงาน: <strong>${escapeHtml(p.target_month || 'ไม่ระบุ')}</strong></span>
              </div>
              <div class="project-card-readiness">
                <div class="readiness-bar-row">
                  <span>ความพร้อมปิดงาน</span>
                  <span class="${scoreColor} font-weight-bold">${readiness}%</span>
                </div>
                <div class="readiness-track">
                  <div class="readiness-fill ${fillClass}" style="width:${readiness}%;"></div>
                </div>
              </div>
              <div class="project-card-chips">
                <div class="metric-chip ${isDef ? 'chip-danger' : 'chip-success'}">
                  <span class="chip-label">งบหน้างาน</span>
                  <span class="chip-val">${isDef ? '-' + formatMoney(defSum) + ' ฿' : 'ปกติ (0 ฿)'}</span>
                </div>
                <div class="metric-chip ${withCount > 0 ? 'chip-warning' : 'chip-neutral'}">
                  <span class="chip-label">พัสดุขาดเบิก</span>
                  <span class="chip-val">${withCount} รายการ</span>
                </div>
                <div class="metric-chip ${retCount > 0 ? 'chip-warning' : 'chip-neutral'} chip-full">
                  <span class="chip-label">พัสดุค้างส่งคืน</span>
                  <span class="chip-val">${retCount > 0 ? 'ค้างส่งคืน ' + retCount + ' รายการ' : '✓ ไม่มีค้างส่งคืน'}</span>
                </div>
              </div>
            </div>
            <div class="project-card-actions">
              <button class="clsd-btn clsd-btn-purple clsd-btn-sm btn-open-detail" onclick="window.CLSDClosing.selectProjectById('${safeId}')">
                <i class="fa-solid fa-chart-pie"></i> เปิดดูโครงการ
              </button>
              <button class="clsd-btn clsd-btn-outline-purple clsd-btn-sm" onclick="window.CLSDClosing.openChangeStatusModal('${safeId}')" title="กำหนดสถานะปิดงาน">
                <i class="fa-solid fa-tags"></i> สถานะ
              </button>
              ${allowUpload ? `<button class="clsd-btn clsd-btn-outline-gold clsd-btn-sm" onclick="window.CLSDClosing.openUpdateZpsr018Modal('${safeId}')" title="อัพเดทไฟล์ ZPSR018 ใหม่">
                <i class="fa-solid fa-arrows-rotate"></i>
              </button>` : ''}
              <button class="clsd-btn clsd-btn-outline-purple clsd-btn-sm" onclick="window.CLSDClosing.openEditProjectNameModal('${safeId}')" title="แก้ไขชื่อโครงการ">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="clsd-btn clsd-btn-outline-danger clsd-btn-sm" onclick="window.CLSDClosing.promptDeleteProject('${safeId}')" title="ลบโครงการ">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          `;
          cardsContainer.appendChild(card);
        });

        if (allowUpload) {
          const addCard = document.createElement('div');
          addCard.className = 'clsd-project-card project-card-add';
          addCard.onclick = openUploadModal;
          addCard.innerHTML = `
            <div class="add-card-inner">
              <div class="add-icon"><i class="fa-solid fa-plus"></i></div>
              <h4>เพิ่มโครงการใหม่</h4>
              <p>อัปโหลดรายงาน SAP ZPSR018 (.pdf)</p>
            </div>
          `;
          cardsContainer.appendChild(addCard);
        }
      }
    }

    if (tbody) {
      tbody.innerHTML = '';
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">ไม่พบข้อมูลโครงการที่ตรงกับเงื่อนไขการค้นหา</td></tr>';
      } else {
        filtered.forEach(p => {
          const sInfo = getProjectStatusInfo(p);
          const isDef = p.budget_summary && p.budget_summary.is_deficit;
          const defSum = p.budget_summary ? (p.budget_summary.total_deficit || 0) : 0;
          const withCount = p.materials_summary ? (p.materials_summary.need_withdraw_count || 0) : 0;
          const safeId = escapeHtml(p.id);
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><code>${escapeHtml(p.wbs || p.id)}</code></td>
            <td><strong>${escapeHtml(p.name)}</strong></td>
            <td>${escapeHtml(p.officer || '-')}</td>
            <td><span class="clsd-badge badge-wbs"><i class="fa-solid fa-calendar-check text-gold"></i> ${escapeHtml(p.target_month || 'ไม่ระบุ')}</span></td>
            <td class="text-right ${isDef ? 'text-danger font-weight-bold' : 'text-success'}">${isDef ? '-' + formatMoney(defSum) + ' ฿' : '0.00 ฿'}</td>
            <td class="text-center">${withCount} รายการ</td>
            <td class="text-center">
              <span class="check-badge ${sInfo.badgeClass} clickable-status-pill" onclick="window.CLSDClosing.openChangeStatusModal('${safeId}')">
                <i class="${sInfo.icon}"></i> ${escapeHtml(sInfo.shortLabel)}
              </span>
            </td>
            <td class="text-center">
              <div style="display:inline-flex;gap:0.35rem;">
                <button class="clsd-btn clsd-btn-xs clsd-btn-purple" onclick="window.CLSDClosing.selectProjectById('${safeId}')"><i class="fa-solid fa-eye"></i> เปิดดู</button>
                <button class="clsd-btn clsd-btn-xs clsd-btn-outline-purple" onclick="window.CLSDClosing.openChangeStatusModal('${safeId}')"><i class="fa-solid fa-tags"></i></button>
                ${allowUpload ? `<button class="clsd-btn clsd-btn-xs clsd-btn-outline-gold" onclick="window.CLSDClosing.openUpdateZpsr018Modal('${safeId}')" title="อัพเดทไฟล์ ZPSR018"><i class="fa-solid fa-arrows-rotate"></i></button>` : ''}
                <button class="clsd-btn clsd-btn-xs clsd-btn-outline-danger" onclick="window.CLSDClosing.promptDeleteProject('${safeId}')"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
  }

  // --------------------------------------------------------------------------
  // Render Selected Project Detail Workspace
  // --------------------------------------------------------------------------
  function renderProjectUI() {
    if (!currentProject) return;
    const p = currentProject;
    const b = p.budget_summary || {};
    const m = p.materials_summary || {};

    if (el('clsdHeroWbs')) el('clsdHeroWbs').textContent = p.wbs || p.id;
    if (el('clsdHeroProjectName')) el('clsdHeroProjectName').textContent = p.name || 'โครงการไม่มีชื่อ';
    if (el('clsdHeroOfficer')) el('clsdHeroOfficer').textContent = p.officer || '-';
    if (el('clsdHeroOfficerId')) el('clsdHeroOfficerId').textContent = p.officer_id || '-';
    if (el('clsdHeroPrintDate')) el('clsdHeroPrintDate').textContent = p.print_date || '-';
    if (el('clsdTemplateBadge')) el('clsdTemplateBadge').innerHTML = `<i class="fa-solid fa-file-invoice"></i> TEMPLATE ${escapeHtml(p.template || 'ZPSR018')}`;

    if (p.target_month) {
      if (el('clsdTargetMonthDisplay')) el('clsdTargetMonthDisplay').textContent = p.target_month;
      if (el('clsdCheckTargetMonthText')) el('clsdCheckTargetMonthText').textContent = p.target_month;
      const parts = p.target_month.split(' ');
      if (parts.length >= 2) {
        if (el('clsdTargetMonthSelect')) el('clsdTargetMonthSelect').value = parts[0];
        if (el('clsdTargetYearSelect')) el('clsdTargetYearSelect').value = parts[1];
      }
    }

    const statusInfo = getProjectStatusInfo(p);
    const statusBadge = el('clsdClosingStatusBadge');
    if (statusBadge) {
      statusBadge.className = `clsd-badge clickable-status-pill ${statusInfo.badgeClass}`;
      statusBadge.innerHTML = `<i class="${statusInfo.icon}"></i> ${escapeHtml(statusInfo.label)} <i class="fa-solid fa-pen" style="font-size:0.65rem;"></i>`;
    }
    if (el('clsdOverallClosingBadge')) {
      el('clsdOverallClosingBadge').className = `clsd-badge ${statusInfo.badgeClass}`;
      el('clsdOverallClosingBadge').innerHTML = `<i class="${statusInfo.icon}"></i> ${escapeHtml(statusInfo.label)}`;
    }
    if (el('clsdHeroStatusSelect')) el('clsdHeroStatusSelect').value = p.custom_status || 'AUTO';
    if (el('clsdHeroStatusDisplayText')) {
      el('clsdHeroStatusDisplayText').textContent = `${statusInfo.label}${statusInfo.isManual ? ' (กำหนดเอง)' : ' (อัตโนมัติ)'}`;
    }

    // Budget Disbursement Banner
    const allocBudget = b.allocated_budget !== undefined ? b.allocated_budget : 0;
    const ctrlActual = b.controlled_actual !== undefined ? b.controlled_actual : 0;
    const remBudget = b.remaining_budget !== undefined ? b.remaining_budget : (allocBudget - ctrlActual);
    const disbRate = b.disbursement_rate_pct !== undefined ? b.disbursement_rate_pct : (allocBudget > 0 ? ((ctrlActual / allocBudget) * 100).toFixed(2) : 0);

    if (el('clsdProjAllocatedVal')) el('clsdProjAllocatedVal').textContent = `${formatMoney(allocBudget)} ฿`;
    if (el('clsdProjControlledVal')) el('clsdProjControlledVal').textContent = `${formatMoney(ctrlActual)} ฿`;
    if (el('clsdProjRemainingVal')) {
      el('clsdProjRemainingVal').textContent = `${remBudget < 0 ? '-' : ''}${formatMoney(Math.abs(remBudget))} ฿`;
      el('clsdProjRemainingVal').className = `budget-metric-val ${remBudget < 0 ? 'text-danger' : 'text-success'}`;
    }
    if (el('clsdProjDisbRateVal')) el('clsdProjDisbRateVal').textContent = `${Number(disbRate).toFixed(2)}%`;

    const siteNames = ['ค่าแรงงาน / ค่าจ้างเหมา', 'ค่าควบคุมงาน', 'ค่าขนส่ง / ยานพาหนะ', 'ค่าเบ็ดเตล็ด', 'ค่าดำเนินการ'];
    const cats = b.categories || [];
    const siteItems = cats.filter(c => siteNames.includes(c.name));
    const siteDeficits = siteItems.filter(c => c.diff < 0);
    const siteTotalDef = siteDeficits.reduce((s, d) => s + Math.abs(d.diff), 0);
    const siteTotalDiff = siteItems.reduce((s, c) => s + c.diff, 0);
    const isSiteDef = siteDeficits.length > 0;

    if (el('clsdKpiBudgetVal')) el('clsdKpiBudgetVal').textContent = isSiteDef ? `-${formatMoney(siteTotalDef)} ฿` : '0.00 ฿';
    if (el('clsdKpiBudgetTag')) {
      el('clsdKpiBudgetTag').className = `kpi-status-tag ${isSiteDef ? 'tag-danger' : 'tag-success'}`;
      el('clsdKpiBudgetTag').textContent = isSiteDef ? `ติดลบ ${siteDeficits.length} หมวด` : 'งบหน้างานสมบูรณ์';
    }
    if (el('clsdKpiBudgetDesc')) {
      el('clsdKpiBudgetDesc').textContent = isSiteDef
        ? `ติดลบในหมวด ${siteDeficits.map(d => d.name).join(', ')} ต้องโอนงบชดเชย`
        : 'ไม่มีหมวดค่าใช้จ่ายหน้างานที่ติดลบ';
    }

    const returnCount = m.need_return_count || 0;
    const withdrawCount = m.need_withdraw_count || 0;
    if (el('clsdKpiReturnCount')) el('clsdKpiReturnCount').textContent = returnCount;
    if (el('clsdKpiWithdrawCount')) el('clsdKpiWithdrawCount').textContent = withdrawCount;
    if (el('clsdKpiReturnTag')) {
      el('clsdKpiReturnTag').className = `kpi-status-tag ${returnCount > 0 ? 'tag-warning' : 'tag-neutral'}`;
      el('clsdKpiReturnTag').textContent = returnCount > 0 ? 'มีพัสดุค้างส่งคืน' : 'ไม่มีค้างส่งคืน';
    }
    if (el('clsdKpiWithdrawTag')) {
      el('clsdKpiWithdrawTag').className = `kpi-status-tag ${withdrawCount > 0 ? 'tag-warning' : 'tag-success'}`;
      el('clsdKpiWithdrawTag').textContent = withdrawCount > 0 ? 'มีรายการขาดเบิก' : 'เบิกครบตามแผน';
    }

    let readiness = 100;
    if (isSiteDef) readiness -= 40;
    if (returnCount > 0) readiness -= 20;
    if (withdrawCount > 0) readiness -= 15;
    if (statusInfo.key === 'STATUS_5') readiness = 100;
    if (el('clsdKpiReadinessPct')) el('clsdKpiReadinessPct').textContent = `${Math.max(0, readiness)}%`;
    if (el('clsdKpiReadinessTag')) {
      el('clsdKpiReadinessTag').className = `kpi-status-tag ${readiness >= 90 ? 'tag-success' : (readiness >= 50 ? 'tag-warning' : 'tag-danger')}`;
      el('clsdKpiReadinessTag').textContent = readiness >= 90 ? 'พร้อมปิดงาน' : 'ต้องแก้ไขข้อมูล';
    }

    if (el('clsdBudgetTabBadge')) {
      el('clsdBudgetTabBadge').className = `check-badge ${isSiteDef ? 'bg-danger' : 'bg-success'}`;
      el('clsdBudgetTabBadge').textContent = isSiteDef ? `ติดลบ ${siteDeficits.length} หมวด` : 'ปกติ';
    }
    if (el('clsdMatTabBadge')) el('clsdMatTabBadge').textContent = `${withdrawCount} ขาดเบิก`;

    // Checklist items
    const chkBud = el('clsdCheckItemBudget');
    if (chkBud) {
      chkBud.className = isSiteDef ? 'check-item' : 'check-item check-pass';
      if (el('clsdCheckBudgetDesc')) {
        el('clsdCheckBudgetDesc').textContent = isSiteDef
          ? `พบหมวดค่าใช้จ่ายหน้างานติดลบ ${siteDeficits.length} หมวด: ${siteDeficits.map(d => `${d.name} (-${formatMoney(Math.abs(d.diff))} ฿)`).join(', ')}`
          : 'ค่าใช้จ่ายหน้างานทุกหมวดมียอดคงเหลือเป็นบวก ผ่านเกณฑ์ปิดงาน';
      }
      if (el('clsdCheckBudgetBadge')) {
        el('clsdCheckBudgetBadge').className = `check-badge ${isSiteDef ? 'bg-danger' : 'bg-success'}`;
        el('clsdCheckBudgetBadge').textContent = isSiteDef ? 'ไม่ผ่าน' : 'ผ่าน';
      }
    }

    const chkRet = el('clsdCheckItemReturn');
    if (chkRet) {
      chkRet.className = returnCount > 0 ? 'check-item' : 'check-item check-pass';
      if (el('clsdCheckReturnDesc')) el('clsdCheckReturnDesc').textContent = returnCount > 0 ? `มีอุปกรณ์เบิกเกินค้างส่งคืนคลัง ${returnCount} รายการ` : 'ไม่มีพัสดุเบิกเกินค้างส่งคืนคลัง';
      if (el('clsdCheckReturnBadge')) {
        el('clsdCheckReturnBadge').className = `check-badge ${returnCount > 0 ? 'bg-warning' : 'bg-success'}`;
        el('clsdCheckReturnBadge').textContent = returnCount > 0 ? 'ต้องคืนคลัง' : 'ผ่าน';
      }
    }

    const chkWith = el('clsdCheckItemWithdraw');
    if (chkWith) {
      chkWith.className = withdrawCount > 0 ? 'check-item' : 'check-item check-pass';
      if (el('clsdCheckWithdrawDesc')) el('clsdCheckWithdrawDesc').textContent = withdrawCount > 0 ? `มีพัสดุตามแบบที่ยังไม่ได้เบิก ${withdrawCount} รายการ (ตรวจสอบเพื่อปลดจอง)` : 'พัสดุเบิกจ่ายครบถ้วนตามประมาณการ';
      if (el('clsdCheckWithdrawBadge')) {
        el('clsdCheckWithdrawBadge').className = `check-badge ${withdrawCount > 0 ? 'bg-warning' : 'bg-success'}`;
        el('clsdCheckWithdrawBadge').textContent = withdrawCount > 0 ? 'แจ้งเตือน' : 'ผ่าน';
      }
    }

    if (el('clsdActionSummary')) {
      el('clsdActionSummary').innerHTML = isSiteDef
        ? `โครงการนี้ยังไม่สามารถปิดงานได้เนื่องจาก <strong>ค่าใช้จ่ายหน้างานติดลบ (${siteDeficits.map(d => `${escapeHtml(d.name)} -${formatMoney(Math.abs(d.diff))} ฿`).join(', ')})</strong> แต่ภาพรวมหน้างานยังมีงบเหลือสุทธิ ${siteTotalDiff >= 0 ? '+' : ''}${formatMoney(siteTotalDiff)} บาท ให้ดำเนินการโอนงบประมาณชดเชย ${formatMoney(siteTotalDef)} บาท และตรวจสอบพัสดุขาดเบิก ${withdrawCount} รายการก่อนส่ง กส.3`
        : `โครงการมีความพร้อมด้านงบประมาณค่าใช้จ่ายหน้างานสมบูรณ์ <strong>(ไม่มีหมวดติดลบ)</strong> โปรดตรวจสอบรายการพัสดุและจัดทำรายงาน กส.3 ตามแผนเดือน ${escapeHtml(p.target_month || '-')}`;
    }

    renderBudgetChart();
    renderSiteBudgetTable();
    renderMaterialBudgetTable();
    renderNetworksTable();
    renderNetworkTransferGuide();
    renderTransferRecommendations();
    renderSimulationTables();
    renderAllocatedBudgetTable();
    renderMaterialsTables();
    renderAllMaterialsTable();
  }

  function renderBudgetChart() {
    const canvas = el('clsdBudgetDiffChart');
    if (!canvas || !currentProject || typeof window.Chart === 'undefined') return;
    const cats = currentProject.budget_summary?.categories || [];
    const displayNames = ['ค่าแรงงาน / ค่าจ้างเหมา', 'ค่าควบคุมงาน', 'ค่าขนส่ง / ยานพาหนะ', 'ค่าเบ็ดเตล็ด', 'ค่าดำเนินการ', 'ค่าพัสดุ', 'พัสดุเข้างาน'];
    const filtered = cats.filter(c => displayNames.includes(c.name));
    if (budgetChart) budgetChart.destroy();
    budgetChart = new window.Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: filtered.map(c => c.name),
        datasets: [{
          label: 'ผลต่างงบประมาณ (บาท)',
          data: filtered.map(c => c.diff),
          backgroundColor: filtered.map(c => c.diff < 0 ? '#ef4444' : '#10b981'),
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${formatMoney(ctx.raw)} บาท (${ctx.raw < 0 ? 'ติดลบ' : 'คงเหลือ'})`
            }
          }
        }
      }
    });
  }

  function renderSiteBudgetTable() {
    const tbody = el('clsdSiteBudgetBody');
    const tfoot = el('clsdSiteBudgetFoot');
    if (!tbody || !currentProject) return;
    const siteNames = ['ค่าแรงงาน / ค่าจ้างเหมา', 'ค่าควบคุมงาน', 'ค่าขนส่ง / ยานพาหนะ', 'ค่าเบ็ดเตล็ด', 'ค่าดำเนินการ'];
    const items = (currentProject.budget_summary?.categories || []).filter(c => siteNames.includes(c.name));
    const totEst = items.reduce((s, c) => s + (c.estimate || 0), 0);
    const totAct = items.reduce((s, c) => s + (c.actual || 0), 0);
    const totDiff = items.reduce((s, c) => s + (c.diff || 0), 0);
    const totDef = items.filter(c => c.diff < 0).reduce((s, c) => s + Math.abs(c.diff), 0);

    const header = el('clsdSiteBudgetHeader');
    if (header) {
      header.classList.toggle('header-gradient-danger', totDef > 0);
      header.classList.toggle('header-gradient-success', totDef === 0);
    }
    if (el('clsdSiteTotalDeficitText')) {
      el('clsdSiteTotalDeficitText').textContent = totDef > 0 ? `ยอดติดลบหน้างาน: -${formatMoney(totDef)} ฿` : 'ปกติ ไม่มียอดติดลบ (0.00 ฿)';
    }

    tbody.innerHTML = items.map((c, idx) => {
      const pct = totAct > 0 ? ((c.actual / totAct) * 100).toFixed(1) : '0.0';
      const neg = c.diff < 0;
      return `<tr>
        <td class="text-center">${idx + 1}</td>
        <td><strong>${escapeHtml(c.name)}</strong></td>
        <td class="text-right font-weight-bold">${formatMoney(c.estimate)}</td>
        <td class="text-right">${formatMoney(c.actual)}</td>
        <td class="text-right ${neg ? 'text-danger' : 'text-success'} font-weight-bold">${neg ? '-' : '+'}${formatMoney(Math.abs(c.diff))}</td>
        <td class="text-center">${pct}%</td>
        <td class="text-center"><span class="check-badge ${neg ? 'bg-danger' : 'bg-success'}">${neg ? 'ติดลบ (ปิดงานไม่ได้)' : 'ปกติ (มีงบเหลือ)'}</span></td>
      </tr>`;
    }).join('');

    if (tfoot) {
      tfoot.innerHTML = `<tr>
        <td colspan="2" class="text-center"><strong>รวมค่าใช้จ่ายหน้างาน (5 หมวด)</strong></td>
        <td class="text-right"><strong>${formatMoney(totEst)} ฿</strong></td>
        <td class="text-right"><strong>${formatMoney(totAct)} ฿</strong></td>
        <td class="text-right ${totDiff < 0 ? 'text-danger' : 'text-success'} font-weight-bold">${totDiff < 0 ? '-' : '+'}${formatMoney(Math.abs(totDiff))} ฿</td>
        <td class="text-center"><strong>100%</strong></td>
        <td class="text-center"><span class="check-badge ${totDef > 0 ? 'bg-danger' : 'bg-success'}">${totDef > 0 ? `ติดลบ ${formatMoney(totDef)} ฿` : 'พร้อมปิดงาน'}</span></td>
      </tr>`;
    }
  }

  function renderMaterialBudgetTable() {
    const tbody = el('clsdMatBudgetBody');
    const tfoot = el('clsdMatBudgetFoot');
    if (!tbody || !currentProject) return;
    const items = (currentProject.budget_summary?.categories || []).filter(c => ['ค่าพัสดุ', 'พัสดุเข้างาน'].includes(c.name));
    const totEst = items.reduce((s, c) => s + (c.estimate || 0), 0);
    const totAct = items.reduce((s, c) => s + (c.actual || 0), 0);
    const totDiff = items.reduce((s, c) => s + (c.diff || 0), 0);
    if (el('clsdMatSurplusBadge')) el('clsdMatSurplusBadge').textContent = `งบพัสดุคงเหลือ: ${totDiff < 0 ? '-' : '+'}${formatMoney(Math.abs(totDiff))} ฿`;

    tbody.innerHTML = items.map((c, idx) => {
      const neg = c.diff < 0;
      return `<tr>
        <td class="text-center">${idx + 1}</td>
        <td><strong>${escapeHtml(c.name)}</strong></td>
        <td class="text-right">${formatMoney(c.estimate)}</td>
        <td class="text-right">${formatMoney(c.actual)}</td>
        <td class="text-right ${neg ? 'text-danger' : 'text-success'} font-weight-bold">${neg ? '-' : '+'}${formatMoney(Math.abs(c.diff))}</td>
        <td class="text-center">${totAct > 0 ? ((c.actual / totAct) * 100).toFixed(1) + '%' : '0.0%'}</td>
        <td class="text-center"><span class="check-badge ${neg ? 'bg-danger' : 'bg-success'}">${neg ? 'ติดลบ' : 'งบพัสดุคงเหลือ'}</span></td>
      </tr>`;
    }).join('');

    if (tfoot) {
      tfoot.innerHTML = `<tr>
        <td colspan="2" class="text-center"><strong>รวมหมวดพัสดุ</strong></td>
        <td class="text-right"><strong>${formatMoney(totEst)} ฿</strong></td>
        <td class="text-right"><strong>${formatMoney(totAct)} ฿</strong></td>
        <td class="text-right ${totDiff < 0 ? 'text-danger' : 'text-success'} font-weight-bold">${totDiff < 0 ? '-' : '+'}${formatMoney(Math.abs(totDiff))} ฿</td>
        <td class="text-center"><strong>100%</strong></td>
        <td class="text-center"><span class="check-badge ${totDiff < 0 ? 'bg-danger' : 'bg-success'}">${totDiff < 0 ? 'ติดลบ' : 'สมบูรณ์'}</span></td>
      </tr>`;
    }
  }

  function renderNetworksTable() {
    const tbody = el('clsdNetworksBody');
    const tfoot = el('clsdNetworksFoot');
    if (!tbody || !currentProject) return;
    const nets = currentProject.networks || [];
    const defNets = nets.filter(n => n.has_deficit);
    const readyNets = nets.filter(n => !n.has_deficit);

    if (el('clsdNetCountTotal')) el('clsdNetCountTotal').textContent = nets.length;
    if (el('clsdNetCountPass')) el('clsdNetCountPass').textContent = readyNets.length;
    if (el('clsdNetCountDeficit')) el('clsdNetCountDeficit').textContent = defNets.length;
    if (el('clsdFilterNetAllCount')) el('clsdFilterNetAllCount').textContent = nets.length;
    if (el('clsdFilterNetDeficitCount')) el('clsdFilterNetDeficitCount').textContent = defNets.length;
    if (el('clsdFilterNetReadyCount')) el('clsdFilterNetReadyCount').textContent = readyNets.length;

    const alertBox = el('clsdNetworkAlertBox');
    const alertDesc = el('clsdNetworkAlertDesc');
    if (alertBox && alertDesc) {
      alertBox.className = defNets.length > 0 ? 'network-alert-box' : 'network-alert-box alert-success';
      alertDesc.innerHTML = defNets.length > 0
        ? `พบโครงข่ายที่มียอดเงินติดลบ <strong>${defNets.length} โครงข่าย</strong> ได้แก่ ${defNets.map(n => `<strong>โครงข่าย ${escapeHtml(n.network_no)} (${escapeHtml(n.description || '-')})</strong>`).join(', ')} ต้องดำเนินการเกลี่ย/โอนงบประมาณก่อนส่งปิดงาน กส.3`
        : `โครงข่ายทั้งหมด (${nets.length} โครงข่าย) มีค่าใช้จ่ายจริงไม่เกินวงเงินประมาณการ พร้อมสำหรับการปิดงานด้านการเงิน`;
    }

    let displayNets = nets;
    if (currentNetworkFilter === 'deficit') displayNets = defNets;
    else if (currentNetworkFilter === 'ready') displayNets = readyNets;

    tbody.innerHTML = displayNets.length === 0
      ? '<tr><td colspan="11" class="text-center">ไม่พบข้อมูลโครงข่ายตามเงื่อนไขที่เลือก</td></tr>'
      : displayNets.map(n => {
          const isDef = n.has_deficit;
          const prob = isDef && n.site_deficits?.length
            ? n.site_deficits.map(d => `<span class="check-badge bg-danger">${escapeHtml(d.name)} (-${formatMoney(Math.abs(d.diff))} ฿)</span>`).join(' ')
            : (isDef ? '<span class="check-badge bg-danger">ติดลบ</span>' : '<span class="text-success"><i class="fa-solid fa-circle-check"></i> ปกติ</span>');
          return `<tr>
            <td class="text-center font-weight-bold">${n.seq}</td>
            <td><code>${escapeHtml(n.network_no)}</code></td>
            <td><strong>${escapeHtml(n.description)}</strong></td>
            <td class="text-right">${formatMoney(n.total_estimate)}</td>
            <td class="text-right">${formatMoney(n.total_actual)}</td>
            <td class="text-right ${n.total_diff < 0 ? 'text-danger' : 'text-success'} font-weight-bold">${n.total_diff < 0 ? '-' : '+'}${formatMoney(Math.abs(n.total_diff))}</td>
            <td class="text-right">${formatMoney(n.site_actual)}</td>
            <td class="text-right ${n.site_diff < 0 ? 'text-danger' : 'text-success'} font-weight-bold">${n.site_diff < 0 ? '-' : '+'}${formatMoney(Math.abs(n.site_diff))}</td>
            <td>${prob}</td>
            <td class="text-center"><span class="check-badge ${isDef ? 'bg-danger' : 'bg-success'}">${isDef ? 'ติดลบ' : 'พร้อมปิด'}</span></td>
            <td class="text-center"><button class="clsd-btn clsd-btn-xs clsd-btn-purple" onclick="window.CLSDClosing.openNetworkModal('${escapeHtml(n.network_no)}')"><i class="fa-solid fa-magnifying-glass-chart"></i> ดู 10 หมวด</button></td>
          </tr>`;
        }).join('');

    if (tfoot) {
      const sEst = nets.reduce((s, n) => s + (n.total_estimate || 0), 0);
      const sAct = nets.reduce((s, n) => s + (n.total_actual || 0), 0);
      const sDiff = nets.reduce((s, n) => s + (n.total_diff || 0), 0);
      const sSiteAct = nets.reduce((s, n) => s + (n.site_actual || 0), 0);
      const sSiteDiff = nets.reduce((s, n) => s + (n.site_diff || 0), 0);
      tfoot.innerHTML = `<tr>
        <td colspan="3" class="text-center"><strong>รวมทุกโครงข่าย (${nets.length} โครงข่าย)</strong></td>
        <td class="text-right"><strong>${formatMoney(sEst)} ฿</strong></td>
        <td class="text-right"><strong>${formatMoney(sAct)} ฿</strong></td>
        <td class="text-right ${sDiff < 0 ? 'text-danger' : 'text-success'} font-weight-bold">${sDiff < 0 ? '-' : '+'}${formatMoney(Math.abs(sDiff))} ฿</td>
        <td class="text-right"><strong>${formatMoney(sSiteAct)} ฿</strong></td>
        <td class="text-right ${sSiteDiff < 0 ? 'text-danger' : 'text-success'} font-weight-bold">${sSiteDiff < 0 ? '-' : '+'}${formatMoney(Math.abs(sSiteDiff))} ฿</td>
        <td colspan="3" class="text-center"><span class="check-badge ${defNets.length > 0 ? 'bg-danger' : 'bg-success'}">${defNets.length > 0 ? `ติดลบ ${defNets.length} โครงข่าย` : 'ทุกโครงข่ายพร้อมปิดงาน'}</span></td>
      </tr>`;
    }
  }

  function renderNetworkTransferGuide() {
    const grid = el('clsdNetTransferGuideGrid');
    if (!grid || !currentProject) return;
    const recs = currentProject.networks_summary?.transfer_recommendations || [];
    const hasDef = (currentProject.networks || []).some(n => n.has_deficit);
    if (!hasDef || recs.length === 0) {
      grid.innerHTML = `<div class="net-guide-card" style="grid-column:1/-1;border-left:4px solid #10b981;">
        <strong class="text-success"><i class="fa-solid fa-circle-check"></i> งบประมาณทุกโครงข่ายสมดุล ไม่จำเป็นต้องโอนงบประมาณระหว่างโครงข่าย</strong>
      </div>`;
      return;
    }
    grid.innerHTML = recs.map(rec => {
      const isIntra = rec.type === 'intra_network';
      return `<div class="net-guide-card ${isIntra ? 'card-intra' : 'card-inter'}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.45rem;">
          <strong>${escapeHtml(rec.title)}</strong>
          <span class="check-badge ${isIntra ? 'bg-gold' : 'bg-purple'}">${formatMoney(rec.amount)} ฿</span>
        </div>
        <p style="font-size:0.8rem;color:var(--clsd-text-muted);margin:0 0 0.5rem 0;">${escapeHtml(rec.reason)}</p>
        <div class="guide-flow-box">
          ${isIntra
            ? `<span><strong>จากหมวด:</strong> [${escapeHtml(rec.donor_category)}]</span> <i class="fa-solid fa-arrow-right text-gold"></i> <span><strong>เข้าหมวด:</strong> [${escapeHtml(rec.target_category)}]</span>`
            : `<span><strong>จากโครงข่าย:</strong> ${escapeHtml(rec.donor_network)} (${escapeHtml(rec.donor_desc)})</span> <i class="fa-solid fa-arrow-right text-purple"></i> <span><strong>เข้าโครงข่าย:</strong> ${escapeHtml(rec.target_network)} (${escapeHtml(rec.target_desc)})</span>`
          }
        </div>
      </div>`;
    }).join('');
  }

  function renderTransferRecommendations() {
    const grid = el('clsdTransferCardsGrid');
    if (!grid || !currentProject) return;
    const cats = currentProject.budget_summary?.categories || [];
    const siteItems = cats.filter(c => ['ค่าแรงงาน / ค่าจ้างเหมา', 'ค่าควบคุมงาน', 'ค่าขนส่ง / ยานพาหนะ', 'ค่าเบ็ดเตล็ด', 'ค่าดำเนินการ'].includes(c.name));
    const siteDefs = siteItems.filter(c => c.diff < 0);
    const netDefs = (currentProject.networks || []).filter(n => n.has_deficit);
    const netRecs = currentProject.networks_summary?.transfer_recommendations || [];

    const simSec = el('clsdSimulationSection');
    const btnDocx = el('clsdBtnExportApprovalDocx');
    const btnMemo = el('clsdBtnCopyTransferMemo');
    if (siteDefs.length === 0 && netDefs.length === 0) {
      if (simSec) simSec.style.display = 'none';
      if (btnDocx) btnDocx.style.display = 'none';
      if (btnMemo) btnMemo.style.display = 'none';
      grid.innerHTML = `<div class="transfer-card" style="grid-column:1/-1;border-left:4px solid #10b981;">
        <strong class="text-success"><i class="fa-solid fa-check-double"></i> ค่าใช้จ่ายหน้างานทุกหมวดไม่ติดลบ — ไม่ต้องโอนงบประมาณในระบบ SAP พร้อมจัดพิมพ์รายงาน กส.3 ได้ทันที</strong>
      </div>`;
      return;
    }

    if (simSec) simSec.style.display = 'block';
    if (btnDocx) btnDocx.style.display = 'inline-flex';
    if (btnMemo) btnMemo.style.display = 'inline-flex';

    const recsToShow = netRecs.length > 0 ? netRecs : (currentProject.budget_summary?.recommendations || []).map((r, idx) => ({
      title: r.option_title || `แผนที่ ${idx + 1}`,
      tag: 'แนะนำ',
      tagClass: 'bg-success',
      donor_category: r.from_category,
      donor_network: 'รวม',
      target_category: r.to_category,
      target_network: 'รวม',
      amount: r.amount,
      reason: r.reason
    }));

    grid.innerHTML = recsToShow.map(r => `
      <div class="transfer-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.55rem;">
          <strong><i class="fa-solid fa-arrows-turn-right text-purple"></i> ${escapeHtml(r.title)}</strong>
          <span class="check-badge ${r.tagClass || 'bg-purple'}">${escapeHtml(r.tag || 'โอนงบ')}</span>
        </div>
        <div class="guide-flow-box" style="margin-bottom:0.55rem;">
          <span><strong>ต้นทาง:</strong> ${escapeHtml(r.donor_category)} (${escapeHtml(r.donor_network)})</span>
          <i class="fa-solid fa-arrow-right text-gold"></i>
          <span><strong>ปลายทาง:</strong> ${escapeHtml(r.target_category)} (${escapeHtml(r.target_network)})</span>
        </div>
        <div style="font-weight:700;color:#059669;margin-bottom:0.35rem;">ยอดโอน: +${formatMoney(r.amount)} บาท</div>
        <div style="font-size:0.78rem;color:var(--clsd-text-muted);">${escapeHtml(r.reason)}</div>
      </div>
    `).join('');
  }

  function renderSimulationTables() {
    const simBody = el('clsdSimulationBody');
    const postBody = el('clsdPostTransferBody');
    if (!simBody || !postBody || !currentProject) return;
    const netRecs = currentProject.networks_summary?.transfer_recommendations || [];
    simBody.innerHTML = netRecs.length === 0
      ? '<tr><td colspan="8" class="text-center">ไม่มีรายการโอนงบประมาณ</td></tr>'
      : netRecs.map((r, idx) => `<tr>
          <td class="text-center font-weight-bold">${idx + 1}</td>
          <td><span class="check-badge ${r.type === 'intra_network' ? 'bg-gold' : 'bg-purple'}">${escapeHtml(r.tag || r.type)}</span></td>
          <td><code>${escapeHtml(r.donor_network)}</code> (${escapeHtml(r.donor_desc || '-')})</td>
          <td><strong>${escapeHtml(r.donor_category)}</strong></td>
          <td><code>${escapeHtml(r.target_network)}</code> (${escapeHtml(r.target_desc || '-')})</td>
          <td><strong class="text-danger">${escapeHtml(r.target_category)}</strong></td>
          <td class="text-right text-success font-weight-bold">${formatMoney(r.amount)} ฿</td>
          <td class="text-center"><span class="check-badge bg-success">โอนได้</span></td>
        </tr>`).join('');

    const networks = currentProject.networks || [];
    let rowsHtml = '';
    networks.forEach(net => {
      const netNo = String(net.network_no || '').trim();
      const friendly = getFriendlyNetworkDesc(netNo, net.description);
      const siteCats = net.site_categories || (net.categories || []).filter(c => c.group === 'site');
      const adj = {};
      siteCats.forEach(c => { adj[c.name] = 0; });
      let touched = false;
      netRecs.forEach(r => {
        if (String(r.donor_network).trim() === netNo) {
          siteCats.forEach(c => { if (c.name.includes(r.donor_category) || r.donor_category.includes(c.name)) { adj[c.name] -= Number(r.amount || 0); touched = true; } });
        }
        if (String(r.target_network).trim() === netNo) {
          siteCats.forEach(c => { if (c.name.includes(r.target_category) || r.target_category.includes(c.name)) { adj[c.name] += Number(r.amount || 0); touched = true; } });
        }
      });
      if (postTransferFilterMode === 'transfer_only' && !touched && !net.has_deficit) return;
      siteCats.forEach(c => {
        const orig = Number(c.diff || 0);
        const a = adj[c.name] || 0;
        const post = orig + a;
        rowsHtml += `<tr>
          <td><code>${escapeHtml(netNo)}</code></td>
          <td><strong>${escapeHtml(friendly)}</strong></td>
          <td>${escapeHtml(c.name)}</td>
          <td class="text-right ${orig < 0 ? 'text-danger font-weight-bold' : 'text-success'}">${orig < 0 ? '-' : '+'}${formatMoney(Math.abs(orig))}</td>
          <td class="text-center font-weight-bold ${a > 0 ? 'text-success' : (a < 0 ? 'text-danger' : '')}">${a === 0 ? '-' : (a > 0 ? '+' : '-') + formatMoney(Math.abs(a))}</td>
          <td class="text-right font-weight-bold ${post >= 0 ? 'text-success' : 'text-danger'}">${post < 0 ? '-' : '+'}${formatMoney(Math.abs(post))}</td>
          <td class="text-center"><span class="check-badge ${post >= 0 ? 'bg-success' : 'bg-danger'}">${post >= 0 ? '✓ ไม่ติดลบ' : 'ยังติดลบ'}</span></td>
        </tr>`;
      });
    });
    postBody.innerHTML = rowsHtml || '<tr><td colspan="7" class="text-center">ไม่พบข้อมูลโครงข่ายที่ต้องโอนงบ</td></tr>';
  }

  function renderAllocatedBudgetTable() {
    const tbody = el('clsdAllocatedBudgetBody');
    if (!tbody || !currentProject) return;
    const allocItems = (currentProject.budget_summary?.categories || []).filter(c =>
      c.group === 'allocated' || ['c8', 'c9', 'c10'].includes((c.id || '').toLowerCase())
    );
    tbody.innerHTML = allocItems.length === 0
      ? '<tr><td colspan="6" class="text-center">ไม่พบข้อมูลค่าใช้จ่ายปันส่วนทางบัญชี</td></tr>'
      : allocItems.map(c => {
          const d = Number(c.diff || 0);
          return `<tr>
            <td class="text-center"><code>${escapeHtml((c.id || '').toUpperCase())}</code></td>
            <td><strong>${escapeHtml(c.name)}</strong></td>
            <td class="text-right">${formatMoney(c.estimate)}</td>
            <td class="text-right">${formatMoney(c.actual)}</td>
            <td class="text-right ${d < 0 ? 'text-danger' : 'text-success'} font-weight-bold">${d < 0 ? '-' : '+'}${formatMoney(Math.abs(d))}</td>
            <td style="font-size:0.78rem;color:var(--clsd-text-muted);">ระบบกลางปันส่วนอัตโนมัติ (ไม่กระทบการปิดงานหน้างาน)</td>
          </tr>`;
        }).join('');
  }

  function renderMaterialsTables() {
    const retBody = el('clsdReturnMaterialsBody');
    const withBody = el('clsdWithdrawMaterialsBody');
    if (!currentProject) return;
    const retItems = currentProject.materials_summary?.need_return_items || [];
    const withItems = currentProject.materials_summary?.need_withdraw_items || [];
    if (el('clsdReturnItemBadge')) el('clsdReturnItemBadge').textContent = `${retItems.length} รายการ`;
    if (el('clsdWithdrawItemBadge')) el('clsdWithdrawItemBadge').textContent = `${withItems.length} รายการ`;

    if (retBody) {
      retBody.innerHTML = retItems.length === 0
        ? '<tr><td colspan="6" class="text-center text-success"><i class="fa-solid fa-circle-check"></i> ไม่พบอุปกรณ์ค้างส่งคืนคลังพัสดุ</td></tr>'
        : retItems.map(i => `<tr>
            <td><code>${escapeHtml(i.code)}</code></td>
            <td>${escapeHtml(i.desc)}</td>
            <td class="text-right">${i.withdrawn}</td>
            <td class="text-right">${i.installed}</td>
            <td class="text-right text-danger font-weight-bold">${i.to_return}</td>
            <td>${escapeHtml(i.unit)}</td>
          </tr>`).join('');
    }
    if (withBody) {
      withBody.innerHTML = withItems.length === 0
        ? '<tr><td colspan="6" class="text-center text-success"><i class="fa-solid fa-circle-check"></i> พัสดุเบิกจ่ายครบถ้วนตามแบบประมาณการ</td></tr>'
        : withItems.map(i => `<tr>
            <td><code>${escapeHtml(i.code)}</code></td>
            <td>${escapeHtml(i.desc)}</td>
            <td class="text-right">${i.estimated}</td>
            <td class="text-right">${i.withdrawn}</td>
            <td class="text-right text-warning font-weight-bold">${i.to_withdraw}</td>
            <td>${escapeHtml(i.unit)}</td>
          </tr>`).join('');
    }
  }

  function renderAllMaterialsTable() {
    const tbody = el('clsdAllMaterialsBody');
    if (!tbody || !currentProject) return;
    const allItems = currentProject.materials_summary?.all_items || [];
    const fVal = el('clsdMaterialFilterSelect')?.value || 'ALL';
    const qVal = (el('clsdMaterialSearchInput')?.value || '').trim().toLowerCase();

    let filtered = allItems;
    if (fVal !== 'ALL') filtered = filtered.filter(i => i.status === fVal);
    if (qVal) {
      filtered = filtered.filter(i =>
        (i.code || '').toLowerCase().includes(qVal) ||
        (i.desc || '').toLowerCase().includes(qVal)
      );
    }
    if (el('clsdTotalMaterialsCountTag')) el('clsdTotalMaterialsCountTag').textContent = `${filtered.length} จาก ${allItems.length} รายการ`;
    tbody.innerHTML = filtered.length === 0
      ? '<tr><td colspan="10" class="text-center">ไม่พบข้อมูลพัสดุที่ค้นหา</td></tr>'
      : filtered.map(i => {
          let badge = '<span class="check-badge bg-success">ติดตั้งครบ</span>';
          if (i.status === 'need_withdraw') badge = `<span class="check-badge bg-warning">ขาดเบิก ${i.to_withdraw}</span>`;
          else if (i.status === 'need_return') badge = `<span class="check-badge bg-danger">ต้องคืน ${i.to_return}</span>`;
          return `<tr>
            <td class="text-center">${i.page}</td>
            <td><code>${escapeHtml(i.code)}</code></td>
            <td>${escapeHtml(i.desc)}</td>
            <td class="text-center">${escapeHtml(i.unit)}</td>
            <td class="text-right">${i.estimated}</td>
            <td class="text-right">${i.withdrawn}</td>
            <td class="text-right">${i.returned}</td>
            <td class="text-right font-weight-bold">${i.installed}</td>
            <td class="text-right">${formatMoney(i.withdrawn_cost)}</td>
            <td class="text-center">${badge}</td>
          </tr>`;
        }).join('');
  }

  // --------------------------------------------------------------------------
  // Modals & Interactive Actions
  // --------------------------------------------------------------------------
  function openNetworkModal(networkNo) {
    if (!currentProject) return;
    const net = (currentProject.networks || []).find(n => String(n.network_no) === String(networkNo));
    if (!net) return;
    if (el('clsdModalNetNo')) el('clsdModalNetNo').textContent = net.network_no;
    if (el('clsdModalNetDesc')) el('clsdModalNetDesc').textContent = `${net.description} (ลำดับที่ ${net.seq})`;
    if (el('clsdModalNetEst')) el('clsdModalNetEst').textContent = `${formatMoney(net.total_estimate)} ฿`;
    if (el('clsdModalNetAct')) el('clsdModalNetAct').textContent = `${formatMoney(net.total_actual)} ฿`;
    if (el('clsdModalNetDiff')) el('clsdModalNetDiff').textContent = `${net.total_diff < 0 ? '-' : '+'}${formatMoney(Math.abs(net.total_diff))} ฿`;
    if (el('clsdModalNetSiteDiff')) el('clsdModalNetSiteDiff').textContent = `${net.site_diff < 0 ? '-' : '+'}${formatMoney(Math.abs(net.site_diff))} ฿`;
    const tbody = el('clsdModalNetCatBody');
    if (tbody) {
      tbody.innerHTML = (net.categories || []).map((c, idx) => {
        const neg = c.diff < 0;
        return `<tr>
          <td class="text-center">${idx + 1}</td>
          <td><strong>${escapeHtml(c.name)}</strong></td>
          <td>${escapeHtml(c.group_name || c.group)}</td>
          <td class="text-right">${formatMoney(c.estimate)}</td>
          <td class="text-right">${formatMoney(c.actual)}</td>
          <td class="text-right ${neg ? 'text-danger' : 'text-success'} font-weight-bold">${neg ? '-' : '+'}${formatMoney(Math.abs(c.diff))}</td>
          <td class="text-center"><span class="check-badge ${neg ? 'bg-danger' : 'bg-success'}">${neg ? 'ติดลบ' : 'คงเหลือ'}</span></td>
        </tr>`;
      }).join('');
    }
    el('clsdNetworkModal')?.classList.add('show');
  }

  async function saveTargetMonth() {
    if (!currentProject) return;
    const m = el('clsdTargetMonthSelect')?.value || 'กันยายน';
    const y = el('clsdTargetYearSelect')?.value || '2569';
    const newTarget = `${m} ${y}`;
    currentProject.target_month = newTarget;
    if (el('clsdTargetMonthDisplay')) el('clsdTargetMonthDisplay').textContent = newTarget;
    if (el('clsdCheckTargetMonthText')) el('clsdCheckTargetMonthText').textContent = newTarget;
    await saveProjectsToCache(allProjects);
    updateProjectFieldInSupabase(currentProject.id, { target_month: newTarget });
    fetch('/api/clsd/projects/update-target', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentProject.id, target_month: newTarget })
    }).catch(() => { });
    renderProjectsCardsAndDirectory();
    notify(`บันทึกแผนเดือนปิดงานเป็น "${newTarget}" เรียบร้อยแล้ว`, 'success');
  }

  function openChangeStatusModal(projectId = null) {
    const pid = projectId || currentProject?.id;
    const project = allProjects.find(p => p.id === pid || p.wbs === pid) || currentProject;
    if (!project) return;
    statusModalTargetProjectId = project.id;
    if (el('clsdStatusModalWbs')) el('clsdStatusModalWbs').textContent = project.wbs || project.id;
    if (el('clsdStatusModalName')) el('clsdStatusModalName').textContent = project.name;
    const curVal = project.custom_status || 'AUTO';
    document.querySelectorAll("input[name='clsdProjectStatusOpt']").forEach(r => {
      r.checked = (r.value === curVal);
      r.closest('.clsd-status-option-card')?.classList.toggle('selected', r.checked);
    });
    el('clsdChangeStatusModal')?.classList.add('show');
  }

  async function saveProjectStatus(projectId, statusKey) {
    const project = allProjects.find(p => p.id === projectId || p.wbs === projectId);
    if (!project) return;
    const isAuto = !statusKey || statusKey === 'AUTO';
    if (isAuto) {
      delete project.custom_status;
      delete project.status_text;
    } else {
      project.custom_status = statusKey;
      project.status_text = STATUS_DEFINITIONS[statusKey]?.label || statusKey;
    }
    if (currentProject && (currentProject.id === project.id || currentProject.wbs === project.wbs)) {
      currentProject = project;
      renderProjectUI();
    }
    await saveProjectsToCache(allProjects);
    updateProjectFieldInSupabase(project.id, {
      custom_status: isAuto ? null : statusKey,
      status_text: isAuto ? null : project.status_text
    });
    fetch('/api/clsd/projects/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: project.id, custom_status: isAuto ? 'AUTO' : statusKey, status_text: project.status_text || '' })
    }).catch(() => { });
    renderProjectsCardsAndDirectory();
    notify('บันทึกสถานะการดำเนินงานปิดงานเรียบร้อยแล้ว', 'success');
  }

  function openUploadModal() {
    if (!canUploadClsd()) {
      notify('เฉพาะผู้ดูแลระบบ (Admin) และผู้ควบคุมงาน (Editor) เท่านั้นที่สามารถอัปโหลดไฟล์ได้', 'danger');
      return;
    }
    selectedPdfFile = null;
    if (el('clsdPdfFileInput')) el('clsdPdfFileInput').value = '';
    if (el('clsdSelectedFileCard')) el('clsdSelectedFileCard').style.display = 'none';
    if (el('clsdUploadProjectNameGroup')) el('clsdUploadProjectNameGroup').style.display = 'none';
    if (el('clsdUploadProgress')) el('clsdUploadProgress').style.display = 'none';
    if (el('clsdBtnConfirmUpload')) el('clsdBtnConfirmUpload').disabled = true;
    el('clsdUploadModal')?.classList.add('show');
  }

  function handleFileSelected(file) {
    if (!canUploadClsd()) {
      notify('เฉพาะผู้ดูแลระบบ (Admin) และผู้ควบคุมงาน (Editor) เท่านั้นที่สามารถอัปโหลดไฟล์ได้', 'danger');
      return;
    }
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      showInvalidModal('โปรดเลือกไฟล์เอกสาร .pdf จากระบบ SAP เท่านั้น');
      return;
    }
    selectedPdfFile = file;
    if (el('clsdSelectedFileName')) el('clsdSelectedFileName').textContent = file.name;
    if (el('clsdSelectedFileSize')) el('clsdSelectedFileSize').textContent = `${(file.size / 1024).toFixed(1)} KB`;
    if (el('clsdSelectedFileCard')) el('clsdSelectedFileCard').style.display = 'flex';
    if (el('clsdUploadProjectNameGroup')) el('clsdUploadProjectNameGroup').style.display = 'block';
    if (el('clsdUploadCustomName')) el('clsdUploadCustomName').value = suggestProjectNameFromFilename(file.name);
    if (el('clsdBtnConfirmUpload')) el('clsdBtnConfirmUpload').disabled = false;
  }

  async function submitPdfUpload(file, customName, targetProjectId = null) {
    if (!canUploadClsd()) {
      throw new Error('ไม่มีสิทธิ์อัปโหลดไฟล์ (เฉพาะ Admin และ Editor เท่านั้น)');
    }
    // 1. Try Python PyMuPDF server endpoint first
    const fd = new FormData();
    fd.append('file', file);
    fd.append('filename', file.name);
    if (customName) fd.append('custom_project_name', customName);
    if (targetProjectId) fd.append('target_project_id', targetProjectId);

    try {
      const res = await fetch('/api/clsd/upload-pdf', {
        method: 'POST',
        headers: {
          'X-Filename': encodeURIComponent(file.name),
          'X-Project-Name': encodeURIComponent(customName || ''),
          'X-Project-Id': encodeURIComponent(targetProjectId || ''),
          'X-User-Role': String(window.currentRole || window.authenticatedRole || 'viewer').toLowerCase()
        },
        body: fd
      });
      if (res.status !== 404 && res.status !== 405 && res.status !== 501) {
        const data = await res.json();
        return data;
      }
    } catch (_) {
      // Fallback to client-side PDF.js parser
    }
    return await parseSapPdfInBrowser(file, customName);
  }

  async function handleConfirmUpload() {
    if (!canUploadClsd()) {
      el('clsdUploadModal')?.classList.remove('show');
      notify('เฉพาะผู้ดูแลระบบ (Admin) และผู้ควบคุมงาน (Editor) เท่านั้นที่สามารถอัปโหลดไฟล์ได้', 'danger');
      return;
    }
    if (!selectedPdfFile) return;
    if (el('clsdUploadProgress')) el('clsdUploadProgress').style.display = 'block';
    if (el('clsdBtnConfirmUpload')) el('clsdBtnConfirmUpload').disabled = true;
    const customName = (el('clsdUploadCustomName')?.value || '').trim();
    try {
      const result = await submitPdfUpload(selectedPdfFile, customName, null);
      if (el('clsdUploadProgress')) el('clsdUploadProgress').style.display = 'none';
      if (!result || !result.success) {
        el('clsdUploadModal')?.classList.remove('show');
        showInvalidModal(result?.error || 'ไฟล์นี้ไม่ใช่รายงานปิดงานจากระบบ SAP (ZPSR018 / ZBUDR018)');
        return;
      }
      el('clsdUploadModal')?.classList.remove('show');
      const idx = allProjects.findIndex(p => p.id === result.id || (result.wbs && p.wbs === result.wbs));
      if (idx >= 0) allProjects[idx] = result;
      else allProjects.unshift(result);
      removeDeletedId(result.id);
      await saveProjectsToCache(allProjects);
      upsertProjectToSupabase(result);
      populateProjectSelect();
      setCurrentProject(result);
      renderProjectsCardsAndDirectory();
      switchTab('clsd-tab-overview');
      notify('นำเข้าและวิเคราะห์ไฟล์ SAP ZPSR018 เรียบร้อยแล้ว!', 'success');
    } catch (err) {
      if (el('clsdUploadProgress')) el('clsdUploadProgress').style.display = 'none';
      el('clsdUploadModal')?.classList.remove('show');
      showInvalidModal('เกิดข้อผิดพลาดในการอ่านไฟล์ PDF: ' + err.message);
    } finally {
      if (el('clsdBtnConfirmUpload')) el('clsdBtnConfirmUpload').disabled = false;
    }
  }

  function openUpdateZpsr018Modal(projectId) {
    if (!canUploadClsd()) {
      notify('เฉพาะผู้ดูแลระบบ (Admin) และผู้ควบคุมงาน (Editor) เท่านั้นที่สามารถอัปโหลดไฟล์ได้', 'danger');
      return;
    }
    const p = allProjects.find(x => x.id === projectId || x.wbs === projectId) || currentProject;
    if (!p) return;
    updateTargetProjectId = p.id;
    if (el('clsdUpdateModalWbs')) el('clsdUpdateModalWbs').textContent = p.wbs || p.id;
    if (el('clsdUpdateModalName')) el('clsdUpdateModalName').textContent = p.name;
    const inp = el('clsdUpdatePdfInput');
    if (inp) { inp.value = ''; inp._file = null; }
    if (el('clsdUpdateFileCard')) el('clsdUpdateFileCard').style.display = 'none';
    if (el('clsdBtnConfirmUpdate')) el('clsdBtnConfirmUpdate').disabled = true;
    el('clsdUpdateZpsr018Modal')?.classList.add('show');
  }

  async function handleConfirmUpdateZpsr018() {
    if (!canUploadClsd()) {
      el('clsdUpdateZpsr018Modal')?.classList.remove('show');
      notify('เฉพาะผู้ดูแลระบบ (Admin) และผู้ควบคุมงาน (Editor) เท่านั้นที่สามารถอัปโหลดไฟล์ได้', 'danger');
      return;
    }
    const inp = el('clsdUpdatePdfInput');
    const file = inp?._file;
    if (!file || !updateTargetProjectId) return;
    const prev = allProjects.find(p => p.id === updateTargetProjectId);
    if (el('clsdBtnConfirmUpdate')) el('clsdBtnConfirmUpdate').disabled = true;
    try {
      const result = await submitPdfUpload(file, prev?.name || '', updateTargetProjectId);
      if (!result || !result.success) {
        el('clsdUpdateZpsr018Modal')?.classList.remove('show');
        showInvalidModal(result?.error || 'ไม่สามารถอัพเดทไฟล์ ZPSR018 ได้');
        return;
      }
      if (prev) {
        result.id = prev.id;
        if (prev.name) result.name = prev.name;
        if (prev.target_month) result.target_month = prev.target_month;
        if (prev.custom_status) {
          result.custom_status = prev.custom_status;
          result.status_text = prev.status_text;
        }
      }
      const idx = allProjects.findIndex(p => p.id === updateTargetProjectId);
      if (idx >= 0) allProjects[idx] = result;
      await saveProjectsToCache(allProjects);
      upsertProjectToSupabase(result);
      el('clsdUpdateZpsr018Modal')?.classList.remove('show');
      populateProjectSelect();
      setCurrentProject(result);
      renderProjectsCardsAndDirectory();
      notify('อัพเดทข้อมูลงบประมาณจากไฟล์ ZPSR018 ฉบับใหม่สำเร็จ!', 'success');
    } catch (err) {
      notify('เกิดข้อผิดพลาด: ' + err.message, 'danger');
    } finally {
      if (el('clsdBtnConfirmUpdate')) el('clsdBtnConfirmUpdate').disabled = false;
    }
  }

  function showInvalidModal(msg) {
    if (el('clsdInvalidErrorText')) el('clsdInvalidErrorText').textContent = msg;
    el('clsdInvalidModal')?.classList.add('show');
  }

  function openEditProjectNameModal(projectId = null) {
    const p = projectId ? allProjects.find(x => x.id === projectId || x.wbs === projectId) : currentProject;
    if (!p) return;
    const inp = el('clsdInputEditProjectName');
    if (inp) {
      inp.value = p.name || '';
      inp.dataset.projectId = p.id;
    }
    el('clsdEditNameModal')?.classList.add('show');
  }

  async function saveEditedProjectName() {
    const inp = el('clsdInputEditProjectName');
    if (!inp) return;
    const newName = inp.value.trim();
    const pid = inp.dataset.projectId;
    if (!newName) { notify('กรุณาระบุชื่อโครงการ', 'danger'); return; }
    const p = allProjects.find(x => x.id === pid);
    if (p) p.name = newName;
    if (currentProject && currentProject.id === pid) {
      currentProject.name = newName;
      if (el('clsdHeroProjectName')) el('clsdHeroProjectName').textContent = newName;
    }
    await saveProjectsToCache(allProjects);
    updateProjectFieldInSupabase(pid, { name: newName });
    fetch('/api/clsd/projects/update-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pid, name: newName })
    }).catch(() => { });
    populateProjectSelect();
    renderProjectsCardsAndDirectory();
    el('clsdEditNameModal')?.classList.remove('show');
    notify('บันทึกชื่อโครงการเรียบร้อยแล้ว', 'success');
  }

  function promptDeleteProject(projectId = null) {
    const p = projectId ? allProjects.find(x => x.id === projectId || x.wbs === projectId) : currentProject;
    if (!p) return;
    projectPendingDelete = p;
    if (el('clsdDeleteModalWbs')) el('clsdDeleteModalWbs').textContent = p.wbs || p.id;
    if (el('clsdDeleteModalName')) el('clsdDeleteModalName').textContent = p.name;
    el('clsdDeleteModal')?.classList.add('show');
  }

  async function confirmDeleteProject() {
    if (!projectPendingDelete) return;
    const delId = projectPendingDelete.id;
    const delName = projectPendingDelete.name;
    allProjects = allProjects.filter(p => p.id !== delId && p.wbs !== delId);
    addDeletedId(delId);
    await saveProjectsToCache(allProjects);
    deleteProjectFromSupabase(delId);
    fetch('/api/clsd/projects/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: delId })
    }).catch(() => { });
    el('clsdDeleteModal')?.classList.remove('show');
    projectPendingDelete = null;
    if (currentProject && currentProject.id === delId) {
      if (allProjects.length > 0) setCurrentProject(allProjects[0]);
      else renderEmptyProjectState();
      switchTab('clsd-tab-projects');
    }
    populateProjectSelect();
    renderProjectsCardsAndDirectory();
    notify(`ลบโครงการ "${delName}" เรียบร้อยแล้ว`, 'success');
  }

  // --------------------------------------------------------------------------
  // Official Memo, Word (.docx) Export & กส.3 Print Report
  // --------------------------------------------------------------------------
  function openMemoModal() {
    if (!currentProject) return;
    const p = currentProject;
    const b = p.budget_summary || {};
    const netRecs = p.networks_summary?.transfer_recommendations || [];
    let lines = '';
    let sumAmt = 0;
    netRecs.forEach((r, idx) => {
      lines += `    3.${idx + 1} ${r.reason}\n`;
      sumAmt += Number(r.amount || 0);
    });
    const text = `บันทึกข้อความ
ส่วนงาน: กรย.(ก3) แผนกจัดการงานก่อสร้างระบบส่งและสถานีไฟฟ้า การไฟฟ้าส่วนภูมิภาค
ที่: ก.3 กรย.(จส)          /2569                  วันที่: ${p.print_date || new Date().toLocaleDateString('th-TH')}
เรื่อง: ขออนุมัติโอนงบประมาณค่าใช้จ่ายหน้างานเพื่อปิดงานก่อสร้าง ${p.name}

เรียน  ผชก.(ก3) ผ่าน อฝ.วบ.(ก3)

1. เรื่องเดิม
ตามที่ได้ดำเนินการก่อสร้างโครงการ "${p.name}" หมายเลขงาน (WBS): ${p.wbs || p.id} ผู้ควบคุมงาน: ${p.officer || '-'} (รหัส ${p.officer_id || '-'}) แล้วเสร็จนั้น

2. ข้อมูล
จากการตรวจสอบรายงานการปิดงานก่อสร้างในระบบ SAP (คีย์โค้ด ${p.template || 'ZPSR018'}) พบหมวดค่าใช้จ่ายหน้างานติดลบ จำนวน ${(b.deficits || []).length} หมวด รวมเป็นเงิน -${formatMoney(b.total_deficit || 0)} บาท ทำให้ยังไม่สามารถปิดงาน (CLSD) ในระบบ SAP ได้

3. ข้อพิจารณา - สรุป
เพื่อให้สามารถดำเนินการปิดงานก่อสร้าง (กส.3) และขึ้นทะเบียนทรัพย์สินได้ตามระเบียบ กฟภ. จึงเห็นควรอนุมัติโอนงบประมาณดังนี้:
${lines || '    - ไม่มีรายการโอนงบประมาณ -\n'}
รวมจำนวนเงินที่ขออนุมัติโอนทั้งสิ้น: ${formatMoney(sumAmt || b.total_deficit || 0)} บาท

จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ


                                        (${p.officer || 'ผู้ควบคุมงาน'})
                                       ผู้ควบคุมงาน กฟภ.`;
    if (el('clsdMemoTextarea')) el('clsdMemoTextarea').value = text;
    el('clsdMemoModal')?.classList.add('show');
  }

  async function exportApprovalDocx() {
    if (!currentProject) return;
    try {
      const res = await fetch('/api/clsd/export-approval-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentProject.id, project: currentProject })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.download_url) {
          const a = document.createElement('a');
          a.href = data.download_url;
          a.download = '';
          document.body.appendChild(a);
          a.click();
          a.remove();
          notify('ดาวน์โหลดแบบฟอร์มขออนุมัติค่าใช้จ่ายหน้างาน (.docx) สำเร็จ!', 'success');
          return;
        }
      }
    } catch (_) { }
    // Fallback Word-compatible HTML document download if running static without Python
    const htmlDoc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>แบบฟอร์มขออนุมัติค่าใช้จ่ายหน้างาน</title></head><body>${buildReportHtml(currentProject)}</body></html>`;
    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `แบบฟอร์มขออนุมัติค่าใช้จ่ายหน้างาน_${currentProject.wbs || currentProject.id}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    notify('สร้างไฟล์เอกสารขออนุมัติค่าใช้จ่ายหน้างานเรียบร้อยแล้ว', 'success');
  }

  function buildReportHtml(p) {
    if (!p) return '';
    const b = p.budget_summary || {};
    const netRecs = p.networks_summary?.transfer_recommendations || [];
    const networks = p.networks || [];
    const statusInfo = getProjectStatusInfo(p);
    const totalTransfer = netRecs.reduce((s, r) => s + Number(r.amount || 0), 0);

    return `
      <div style="font-family:'Sarabun','Prompt',sans-serif;padding:12px 16px;color:#0f172a;">
        <div style="text-align:center;border-bottom:2.5px solid #1e1b4b;padding-bottom:8px;margin-bottom:14px;">
          <div style="font-size:9pt;font-weight:bold;color:#581c87;">การไฟฟ้าส่วนภูมิภาค • PROVINCIAL ELECTRICITY AUTHORITY</div>
          <h2 style="margin:3px 0;font-size:14pt;color:#0f172a;">รายงานผลการตรวจสอบการปิดงานก่อสร้างระบบไฟฟ้า และแผนการโอนงบประมาณ (กส.3)</h2>
          <div style="font-size:8.5pt;color:#475569;">อ้างอิง SAP ${escapeHtml(p.template || 'ZPSR018')} | วันที่พิมพ์รายงาน: ${escapeHtml(p.print_date || '-')}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:9pt;background:#f8fafc;border:1px solid #cbd5e1;">
          <tr>
            <td style="padding:5px 8px;"><strong>หมายเลขงาน (WBS):</strong> <code>${escapeHtml(p.wbs || p.id)}</code></td>
            <td style="padding:5px 8px;"><strong>แผนเดือนปิดงาน:</strong> ${escapeHtml(p.target_month || '-')}</td>
          </tr>
          <tr>
            <td style="padding:5px 8px;"><strong>ชื่องานก่อสร้าง:</strong> ${escapeHtml(p.name)}</td>
            <td style="padding:5px 8px;"><strong>สถานะ:</strong> <strong style="color:${statusInfo.color};">${escapeHtml(statusInfo.label)}</strong></td>
          </tr>
          <tr>
            <td colspan="2" style="padding:5px 8px;"><strong>ผู้ควบคุมงาน:</strong> ${escapeHtml(p.officer || '-')} (รหัส ${escapeHtml(p.officer_id || '-')})</td>
          </tr>
        </table>

        <h4 style="font-size:10.5pt;margin:10px 0 6px;border-bottom:1px solid #475569;padding-bottom:3px;">1. สรุปงบประมาณ 10 หมวดค่าใช้จ่ายในระบบ SAP</h4>
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:8.5pt;" border="1" bordercolor="#cbd5e1">
          <thead><tr style="background:#f1f5f9;"><th style="padding:4px;">หมวดค่าใช้จ่าย</th><th style="padding:4px;">กลุ่ม</th><th style="padding:4px;text-align:right;">ประมาณการ (฿)</th><th style="padding:4px;text-align:right;">ใช้จริง (฿)</th><th style="padding:4px;text-align:right;">ผลต่างเดิม (฿)</th></tr></thead>
          <tbody>
            ${(b.categories || []).map(c => `<tr>
              <td style="padding:3px 6px;">${escapeHtml(c.name)}</td>
              <td style="padding:3px 6px;text-align:center;">${escapeHtml(c.group_name || '-')}</td>
              <td style="padding:3px 6px;text-align:right;">${formatMoney(c.estimate)}</td>
              <td style="padding:3px 6px;text-align:right;">${formatMoney(c.actual)}</td>
              <td style="padding:3px 6px;text-align:right;font-weight:bold;color:${c.diff < 0 ? '#b91c1c' : '#047857'};">${c.diff < 0 ? '-' : '+'}${formatMoney(Math.abs(c.diff))}</td>
            </tr>`).join('')}
          </tbody>
        </table>

        <h4 style="font-size:10.5pt;margin:10px 0 6px;border-bottom:1px solid #475569;padding-bottom:3px;">2. สรุปสถานะการเงินรายโครงข่าย (${networks.length} โครงข่าย)</h4>
        <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:8.5pt;" border="1" bordercolor="#cbd5e1">
          <thead><tr style="background:#f1f5f9;"><th style="padding:4px;">ที่</th><th style="padding:4px;">เลขที่โครงข่าย</th><th style="padding:4px;">รายการ</th><th style="padding:4px;text-align:right;">ประมาณการรวม</th><th style="padding:4px;text-align:right;">ใช้จริงรวม</th><th style="padding:4px;text-align:right;">ผลต่างสุทธิ</th></tr></thead>
          <tbody>
            ${networks.map(n => `<tr>
              <td style="padding:3px 5px;text-align:center;">${n.seq}</td>
              <td style="padding:3px 5px;font-family:monospace;">${escapeHtml(n.network_no)}</td>
              <td style="padding:3px 5px;">${escapeHtml(n.description)}</td>
              <td style="padding:3px 5px;text-align:right;">${formatMoney(n.total_estimate)}</td>
              <td style="padding:3px 5px;text-align:right;">${formatMoney(n.total_actual)}</td>
              <td style="padding:3px 5px;text-align:right;font-weight:bold;color:${n.total_diff < 0 ? '#b91c1c' : '#047857'};">${n.total_diff < 0 ? '-' : '+'}${formatMoney(Math.abs(n.total_diff))}</td>
            </tr>`).join('')}
          </tbody>
        </table>

        <h4 style="font-size:10.5pt;margin:10px 0 6px;border-bottom:1px solid #475569;padding-bottom:3px;">3. แผนการโอนงบประมาณเพื่อแก้ไขยอดติดลบหน้างาน</h4>
        ${netRecs.length === 0
          ? '<div style="padding:8px;background:#ecfdf5;border:1px solid #6ee7b7;font-size:9pt;color:#065f46;">✓ ค่าใช้จ่ายหน้างานไม่มีหมวดติดลบ พร้อมปิดงานได้ทันที</div>'
          : `<table style="width:100%;border-collapse:collapse;font-size:8.5pt;" border="1" bordercolor="#cbd5e1">
               <thead><tr style="background:#f1f5f9;"><th style="padding:4px;">ขาที่</th><th style="padding:4px;">ประเภท</th><th style="padding:4px;">ต้นทาง</th><th style="padding:4px;">ปลายทาง</th><th style="padding:4px;text-align:right;">ยอดโอน (฿)</th></tr></thead>
               <tbody>
                 ${netRecs.map((r, i) => `<tr>
                   <td style="padding:4px;text-align:center;">${i + 1}</td>
                   <td style="padding:4px;">${escapeHtml(r.tag || r.type)}</td>
                   <td style="padding:4px;">${escapeHtml(r.donor_category)} (${escapeHtml(r.donor_network)})</td>
                   <td style="padding:4px;">${escapeHtml(r.target_category)} (${escapeHtml(r.target_network)})</td>
                   <td style="padding:4px;text-align:right;font-weight:bold;color:#047857;">+${formatMoney(r.amount)}</td>
                 </tr>`).join('')}
                 <tr style="background:#f8fafc;font-weight:bold;"><td colspan="4" style="padding:5px;text-align:right;">รวมยอดขออนุมัติโอนทั้งสิ้น:</td><td style="padding:5px;text-align:right;color:#047857;">+${formatMoney(totalTransfer)} บาท</td></tr>
               </tbody>
             </table>`
        }
      </div>
    `;
  }

  function openReportPreviewModal() {
    if (!currentProject) { notify('กรุณาเลือกโครงการก่อนพิมพ์รายงาน', 'warning'); return; }
    const html = buildReportHtml(currentProject);
    if (el('clsdReportPreviewPaper')) el('clsdReportPreviewPaper').innerHTML = html;
    if (el('clsdPrintArea')) el('clsdPrintArea').innerHTML = html;
    el('clsdReportPreviewModal')?.classList.add('show');
  }

  function executePrintReport() {
    if (!currentProject) return;
    if (el('clsdPrintArea')) el('clsdPrintArea').innerHTML = buildReportHtml(currentProject);
    document.body.classList.add('clsd-printing');
    const cleanup = () => {
      document.body.classList.remove('clsd-printing');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 1200);
    }, 80);
  }

  function exportBudgetCsv() {
    if (!currentProject) return;
    const cats = currentProject.budget_summary?.categories || [];
    let csv = '\uFEFFรหัส,หมวดค่าใช้จ่าย,กลุ่ม,ประมาณการ(บาท),ค่าใช้จ่ายจริง(บาท),ผลต่าง(บาท),สถานะ\n';
    cats.forEach(c => {
      csv += `"${(c.id || '').toUpperCase()}","${c.name}","${c.group_name || ''}",${c.estimate || 0},${c.actual || 0},${c.diff || 0},"${c.diff < 0 ? 'ติดลบ' : 'คงเหลือ'}"\n`;
    });
    downloadCsv(csv, `PEA_SAP_Budget_${currentProject.wbs || currentProject.id}.csv`);
  }

  function exportMaterialsCsv() {
    if (!currentProject) return;
    const mats = currentProject.materials_summary?.all_items || [];
    let csv = '\uFEFFหน้า,รหัสพัสดุ,รายการ,หน่วย,ประมาณการ,เบิกจริง,ส่งคืน,ติดตั้งจริง,ค่าพัสดุเบิก(บาท),สถานะ\n';
    mats.forEach(m => {
      csv += `${m.page},"${m.code}","${String(m.desc || '').replace(/"/g, '""')}","${m.unit}",${m.estimated},${m.withdrawn},${m.returned},${m.installed},${m.withdrawn_cost},"${m.status}"\n`;
    });
    downloadCsv(csv, `PEA_SAP_Materials_${currentProject.wbs || currentProject.id}.csv`);
  }

  function downloadCsv(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function syncAllToCloud() {
    let okCount = 0;
    for (const p of allProjects) {
      if (await upsertProjectToSupabase(p)) okCount++;
    }
    if (okCount > 0) {
      updateCloudSyncBadge('connected');
      notify(`ซิงค์ข้อมูลขึ้น Supabase Cloud สำเร็จ ${okCount}/${allProjects.length} โครงการ`, 'success');
    } else {
      notify('ไม่สามารถซิงค์ขึ้น Supabase ได้ในขณะนี้', 'danger');
    }
  }

  // --------------------------------------------------------------------------
  // Initialization & Event Binding
  // --------------------------------------------------------------------------
  function init() {
    if (initialized) return;
    if (!el('clsd-closing-view')) return;
    initialized = true;

    // Detail workspace segmented tabs
    document.querySelectorAll('#clsd-closing-view .clsd-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.getAttribute('data-clsd-tab')));
    });

    // Quick project switcher
    el('clsdProjectSelect')?.addEventListener('change', (e) => {
      const p = allProjects.find(x => x.id === e.target.value);
      if (p) setCurrentProject(p);
    });

    // Search & status filters
    el('clsdHubSearchInput')?.addEventListener('input', renderProjectsCardsAndDirectory);
    el('clsdHubStatusFilter')?.addEventListener('change', (e) => setStatusFilter(e.target.value));

    // Network filter buttons
    document.querySelectorAll('#clsd-closing-view .net-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#clsd-closing-view .net-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentNetworkFilter = btn.getAttribute('data-filter') || 'all';
        renderNetworksTable();
      });
    });

    // Materials search & filter
    el('clsdMaterialFilterSelect')?.addEventListener('change', renderAllMaterialsTable);
    el('clsdMaterialSearchInput')?.addEventListener('input', renderAllMaterialsTable);

    // Dropzone for new PDF upload
    const dz = el('clsdPdfDropzone');
    if (dz) {
      dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
      dz.addEventListener('drop', (e) => {
        e.preventDefault();
        dz.classList.remove('dragover');
        if (e.dataTransfer?.files?.[0]) handleFileSelected(e.dataTransfer.files[0]);
      });
    }
    el('clsdPdfFileInput')?.addEventListener('change', (e) => {
      if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
    });

    // Update ZPSR018 file input
    el('clsdUpdatePdfInput')?.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      e.target._file = f;
      if (el('clsdUpdateFileName')) el('clsdUpdateFileName').textContent = f.name;
      if (el('clsdUpdateFileSize')) el('clsdUpdateFileSize').textContent = `${(f.size / 1024).toFixed(1)} KB`;
      if (el('clsdUpdateFileCard')) el('clsdUpdateFileCard').style.display = 'flex';
      if (el('clsdBtnConfirmUpdate')) el('clsdBtnConfirmUpdate').disabled = false;
    });

    // Backdrop click to close CLSD modals
    document.querySelectorAll('.clsd-modal-backdrop').forEach(bd => {
      bd.addEventListener('click', (e) => {
        if (e.target === bd) bd.classList.remove('show');
      });
    });

    updateUploadRoleUI();
    loadProjectsData();
  }

  function onActivate() {
    init();
    updateUploadRoleUI();
    renderProjectsCardsAndDirectory();
    if (budgetChart) {
      setTimeout(() => { try { budgetChart.resize(); } catch (_) { } }, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }

  return {
    init,
    onActivate,
    switchTab,
    setProjectsViewMode,
    setStatusFilter,
    selectProjectById,
    openUploadModal,
    handleConfirmUpload,
    openUpdateZpsr018Modal,
    handleConfirmUpdateZpsr018,
    openChangeStatusModal,
    saveStatusFromModal: async () => {
      const sel = document.querySelector("input[name='clsdProjectStatusOpt']:checked");
      if (statusModalTargetProjectId) {
        await saveProjectStatus(statusModalTargetProjectId, sel ? sel.value : 'AUTO');
      }
      el('clsdChangeStatusModal')?.classList.remove('show');
    },
    saveHeroStatus: async () => {
      if (!currentProject) return;
      await saveProjectStatus(currentProject.id, el('clsdHeroStatusSelect')?.value || 'AUTO');
    },
    saveTargetMonth,
    openEditProjectNameModal,
    saveEditedProjectName,
    promptDeleteProject,
    confirmDeleteProject,
    openNetworkModal,
    setPostTransferView: (mode) => {
      postTransferFilterMode = mode;
      el('clsdBtnFilterTransferOnly')?.classList.toggle('clsd-btn-purple', mode === 'transfer_only');
      el('clsdBtnFilterTransferOnly')?.classList.toggle('clsd-btn-outline-dark', mode !== 'transfer_only');
      el('clsdBtnFilterAllNets')?.classList.toggle('clsd-btn-purple', mode === 'all');
      el('clsdBtnFilterAllNets')?.classList.toggle('clsd-btn-outline-dark', mode !== 'all');
      renderSimulationTables();
    },
    openMemoModal,
    copyMemo: () => {
      const ta = el('clsdMemoTextarea');
      if (ta && ta.value) {
        navigator.clipboard.writeText(ta.value).then(() => notify('คัดลอกบันทึกข้อความขอโอนงบ SAP เรียบร้อยแล้ว', 'success'));
      }
    },
    exportApprovalDocx,
    openReportPreviewModal,
    executePrintReport,
    exportBudgetCsv,
    exportMaterialsCsv,
    openSupabaseModal: () => {
      updateCloudSyncBadge(clsdSupabaseStatus);
      el('clsdSupabaseModal')?.classList.add('show');
    },
    syncAllToCloud,
    updateRoleUI: updateUploadRoleUI,
    canUpload: canUploadClsd,
    closeModal: (id) => el(id)?.classList.remove('show')
  };
})();
