-- ==============================================================================
-- คำสั่ง SQL สำหรับสร้างตารางแดชบอร์ดบน Supabase (Dashboard Persistence)
-- คัดลอกข้อความทั้งหมดนี้ไปวางในเมนู SQL Editor บน Supabase แล้วกด "RUN" ได้ทันที
-- ==============================================================================

-- 1. ตารางเก็บข้อมูลแดชบอร์ดสถานะงานก่อสร้างล่าสุด (dashboard_data)
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

-- 2. ตารางเก็บประวัติการอัปโหลดไฟล์ (dashboard_history)
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

-- 3. เปิดใช้งาน Row Level Security (RLS) เพื่อความปลอดภัย
ALTER TABLE public.dashboard_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_history ENABLE ROW LEVEL SECURITY;

-- 4. ตั้งค่านโยบายสิทธิ์ (Policies)
-- สิทธิ์อ่าน: ทุกคนสามารถอ่านข้อมูลแดชบอร์ดได้ (เพื่อให้เห็นข้อมูลความก้าวหน้าล่าสุดตรงกัน)
DROP POLICY IF EXISTS "Allow all read dashboard_data" ON public.dashboard_data;
CREATE POLICY "Allow all read dashboard_data"
ON public.dashboard_data FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow all read dashboard_history" ON public.dashboard_history;
CREATE POLICY "Allow all read dashboard_history"
ON public.dashboard_history FOR SELECT
USING (true);

-- สิทธิ์เขียน/อัปเดต: อนุญาตให้อัปเดตข้อมูลขึ้นระบบได้
DROP POLICY IF EXISTS "Allow all insert_update dashboard_data" ON public.dashboard_data;
CREATE POLICY "Allow all insert_update dashboard_data"
ON public.dashboard_data FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all insert dashboard_history" ON public.dashboard_history;
CREATE POLICY "Allow all insert dashboard_history"
ON public.dashboard_history FOR ALL
USING (true)
WITH CHECK (true);

-- 5. เปิด Realtime สำหรับตาราง dashboard_data (อัปเดตหน้าจอทันทีเมื่อมีคนอัปโหลด)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'dashboard_data'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_data;
  END IF;
END $$;
