-- ==============================================================================
-- PCTS (PEA Construction Tracking System) - Database Migration & RLS Security
-- Version: 3.1+ (Phases 1-4 Updates)
-- ==============================================================================

-- 1. เพิ่มคอลัมน์ใหม่ในตาราง projects เพื่อรองรับข้อมูลโดยตรง (ไม่ต้องแปลงเป็น Tag ใน details)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'จ้างเหมา',
ADD COLUMN IF NOT EXISTS supervisor TEXT,
ADD COLUMN IF NOT EXISTS committee TEXT,
ADD COLUMN IF NOT EXISTS committee1 TEXT,
ADD COLUMN IF NOT EXISTS committee2 TEXT,
ADD COLUMN IF NOT EXISTS committee3 TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS eot JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS punch_list JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS before_after JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. สร้าง Trigger อัปเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. ฟังก์ชันตรวจสอบสิทธิ์ (Role Helper Functions)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.user_roles
  WHERE id = auth.uid();
  
  RETURN COALESCE(v_role, 'viewer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ตั้งค่า Row Level Security (RLS) สำหรับตาราง projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- ลบนโยบายเดิม (ถ้ามี)
DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
DROP POLICY IF EXISTS "Editors and Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;

-- สิทธิ์การอ่าน: ทุกคน (รวมถึง Viewer/ไม่ล็อกอิน) สามารถดูโครงการได้
CREATE POLICY "Anyone can view projects"
ON public.projects FOR SELECT
USING (true);

-- สิทธิ์การแก้ไข: เฉพาะ Editor และ Admin
CREATE POLICY "Editors and Admins can update projects"
ON public.projects FOR UPDATE
TO authenticated
USING (
  public.get_current_user_role() IN ('editor', 'admin')
)
WITH CHECK (
  public.get_current_user_role() IN ('editor', 'admin')
);

-- สิทธิ์การเพิ่ม: เฉพาะ Admin
CREATE POLICY "Admins can insert projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (
  public.get_current_user_role() = 'admin'
);

-- สิทธิ์การลบ: เฉพาะ Admin
CREATE POLICY "Admins can delete projects"
ON public.projects FOR DELETE
TO authenticated
USING (
  public.get_current_user_role() = 'admin'
);

-- 5. ตั้งค่า Row Level Security (RLS) สำหรับตาราง user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can register pending role" ON public.user_roles;

-- ผู้ใช้งานสามารถอ่านสิทธิ์ของตัวเองได้
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admin สามารถดูสิทธิ์ผู้ใช้ทั้งหมดได้ (รวมถึงที่รออนุมัติ)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- เฉพาะ Admin เท่านั้นที่สามารถเปลี่ยนสิทธิ์หรืออนุมัติผู้ใช้ได้ (ป้องกัน Client แก้ไขเอง)
CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- เฉพาะ Admin เท่านั้นที่สามารถลบคำขอได้
CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.get_current_user_role() = 'admin');

-- ผู้ใช้สมัครใหม่สามารถแทรกข้อมูลเริ่มต้นสถานะ pending ของตัวเองได้
CREATE POLICY "Users can register pending role"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid() AND role = 'pending'
);

-- 6. Stored Procedure ที่ปลอดภัยสำหรับ Admin อนุมัติสิทธิ์ (RPC Function)
CREATE OR REPLACE FUNCTION public.approve_user_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF public.get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied. Only administrators can approve user roles.';
  END IF;

  UPDATE public.user_roles
  SET role = new_role
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Supabase Realtime Publication
-- เปิดใช้งาน Realtime สำหรับตาราง projects เพื่อให้ Dashboard อัปเดตสดอัตโนมัติ
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;
END $$;

-- 8. ตั้งค่า Supabase Storage Bucket สำหรับรูปภาพโครงการและ Punch List (Phase 1 & 2)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- นโยบายอ่านรูปภาพ (ทุกคนสามารถเปิดดูภาพได้แบบ Public)
DROP POLICY IF EXISTS "Public Read Access for Project Images" ON storage.objects;
CREATE POLICY "Public Read Access for Project Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

-- นโยบายอัปโหลดรูปภาพ (ผู้ใช้ที่ล็อกอินสามารถอัปโหลดได้)
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

-- นโยบายอัปเดต/ลบรูปภาพ (เฉพาะ Admin และ Editor)
DROP POLICY IF EXISTS "Editors and Admins can update project images" ON storage.objects;
CREATE POLICY "Editors and Admins can update project images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images' AND public.get_current_user_role() IN ('editor', 'admin'));

DROP POLICY IF EXISTS "Admins can delete project images" ON storage.objects;
CREATE POLICY "Admins can delete project images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-images' AND public.get_current_user_role() = 'admin');

-- 9. ตารางแดชบอร์ดสถานะงานก่อสร้างและประวัติการอัปโหลด (Dashboard Persistence)
CREATE TABLE IF NOT EXISTS public.dashboard_data (
    id TEXT PRIMARY KEY DEFAULT 'latest',
    file_name TEXT,
    last_updated TEXT,
    saved_at BIGINT,
    saved_at_text TEXT,
    uploaded_by TEXT,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dashboard_history (
    id TEXT PRIMARY KEY,
    file_name TEXT,
    last_updated TEXT,
    saved_at BIGINT,
    saved_at_text TEXT,
    uploaded_by TEXT,
    stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dashboard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all read dashboard_data" ON public.dashboard_data;
CREATE POLICY "Allow all read dashboard_data" ON public.dashboard_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all insert_update dashboard_data" ON public.dashboard_data;
CREATE POLICY "Allow all insert_update dashboard_data" ON public.dashboard_data FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all read dashboard_history" ON public.dashboard_history;
CREATE POLICY "Allow all read dashboard_history" ON public.dashboard_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all insert dashboard_history" ON public.dashboard_history;
CREATE POLICY "Allow all insert dashboard_history" ON public.dashboard_history FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'dashboard_data'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_data;
  END IF;
END $$;

