-- ==============================================================================
-- คำสั่ง SQL สำหรับบันทึกข้อมูล Editor ผู้ควบคุมงานลงตาราง user_roles (Supabase)
-- คัดลอกข้อความนี้ไปวางในเมนู SQL Editor บน Supabase แล้วกด "RUN" ได้ทันที
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    employee_id TEXT,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer',
    status TEXT NOT NULL DEFAULT 'active',
    permissions JSONB DEFAULT '{}'::jsonb,
    last_login TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- เพิ่ม/อัปเดตข้อมูลผู้ใช้งาน Admin และ Editor ที่เคยเข้าสู่ระบบแล้ว
INSERT INTO public.user_roles (id, email, employee_id, name, role, status, permissions, last_login, created_at)
VALUES 
  (
    'pea-admin-01', 
    'admin@pea.co.th', 
    '500744', 
    'ผู้ดูแลระบบ กบส. (Admin)', 
    'admin', 
    'active', 
    '{"can_upload_excel": true, "can_edit_wbs": true, "can_manage_punchlist": true, "can_export_report": true, "can_manage_users": true}'::jsonb,
    '2026-10-17 21:01:32',
    '2026-01-01 08:00:00'
  ),
  (
    'pea-editor-01', 
    'editor@pea.co.th', 
    '501234', 
    'วิศวกรผู้ควบคุมงาน กบส. (Editor กลาง)', 
    'editor', 
    'active', 
    '{"can_upload_excel": true, "can_edit_wbs": true, "can_manage_punchlist": true, "can_export_report": true, "can_manage_users": false}'::jsonb,
    '2026-10-17 18:45:00',
    '2026-02-15 09:30:00'
  ),
  (
    'pea-editor-jakraphan', 
    'jakraphan.n@pea.co.th', 
    '502341', 
    'นายจักรพันธ์ นรเหรียญ (พชง.6 ผจส.กรย.)', 
    'editor', 
    'active', 
    '{"can_upload_excel": true, "can_edit_wbs": true, "can_manage_punchlist": true, "can_export_report": true, "can_manage_users": false}'::jsonb,
    '2026-10-17 19:15:20',
    '2026-02-01 08:30:00'
  ),
  (
    'pea-editor-palakorn', 
    'palakorn.j@pea.co.th', 
    '503452', 
    'นายพลากร จงอมรสิริเกษม (พชง.3 ผจร.กรย.)', 
    'editor', 
    'active', 
    '{"can_upload_excel": true, "can_edit_wbs": true, "can_manage_punchlist": true, "can_export_report": true, "can_manage_users": false}'::jsonb,
    '2026-10-17 17:30:45',
    '2026-02-10 09:00:00'
  ),
  (
    'pea-editor-worapong', 
    'worapong.l@pea.co.th', 
    '501890', 
    'นายวรพงศ์ ลิ้มเจริญ (หผ.บอ.กบษ.)', 
    'editor', 
    'active', 
    '{"can_upload_excel": true, "can_edit_wbs": true, "can_manage_punchlist": true, "can_export_report": true, "can_manage_users": false}'::jsonb,
    '2026-10-17 16:20:10',
    '2026-01-15 10:15:00'
  ),
  (
    'pea-editor-ekkachai', 
    'ekkachai.m@pea.co.th', 
    '504123', 
    'นายเอกชัย หมอยาดี (ชผ.จส.กรย.)', 
    'editor', 
    'active', 
    '{"can_upload_excel": true, "can_edit_wbs": true, "can_manage_punchlist": true, "can_export_report": true, "can_manage_users": false}'::jsonb,
    '2026-10-17 15:45:00',
    '2026-03-01 11:00:00'
  ),
  (
    'pea-editor-watchara', 
    'watchara.w@pea.co.th', 
    '502987', 
    'นายวัชระ เวทีภิรมย์ (พชง.7 ผจส.กรย.)', 
    'editor', 
    'active', 
    '{"can_upload_excel": true, "can_edit_wbs": true, "can_manage_punchlist": true, "can_export_report": true, "can_manage_users": false}'::jsonb,
    '2026-10-17 14:10:30',
    '2026-01-20 09:45:00'
  ),
  (
    'pea-editor-kumpol', 
    'kumpol.t@pea.co.th', 
    '500321', 
    'นายกำพล ตุ้ยเต็มวงค์ (อก.รย.)', 
    'editor', 
    'active', 
    '{"can_upload_excel": true, "can_edit_wbs": true, "can_manage_punchlist": true, "can_export_report": true, "can_manage_users": false}'::jsonb,
    '2026-10-17 11:25:00',
    '2026-01-10 08:00:00'
  ),
  (
    'pea-viewer-01', 
    'viewer@pea.co.th', 
    '505678', 
    'ผู้บริหาร / ผู้สังเกตการณ์', 
    'viewer', 
    'active', 
    '{"can_upload_excel": false, "can_edit_wbs": false, "can_manage_punchlist": false, "can_export_report": true, "can_manage_users": false}'::jsonb,
    '2026-10-16 14:15:00',
    '2026-03-01 10:00:00'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  permissions = EXCLUDED.permissions,
  last_login = EXCLUDED.last_login;
