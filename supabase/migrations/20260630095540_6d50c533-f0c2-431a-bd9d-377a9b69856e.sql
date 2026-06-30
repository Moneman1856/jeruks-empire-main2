
-- POLLING
CREATE TABLE public.polling (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pertanyaan text NOT NULL,
  deskripsi text,
  multi boolean NOT NULL DEFAULT false,
  ditutup boolean NOT NULL DEFAULT false,
  batas_waktu timestamptz,
  author_id uuid REFERENCES public.anggota(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.polling TO authenticated;
GRANT ALL ON public.polling TO service_role;
ALTER TABLE public.polling ENABLE ROW LEVEL SECURITY;
CREATE POLICY "polling read all" ON public.polling FOR SELECT TO authenticated USING (true);

CREATE TABLE public.pilihan_polling (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  polling_id uuid NOT NULL REFERENCES public.polling(id) ON DELETE CASCADE,
  teks text NOT NULL,
  urutan int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pilihan_polling TO authenticated;
GRANT ALL ON public.pilihan_polling TO service_role;
ALTER TABLE public.pilihan_polling ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pilihan read all" ON public.pilihan_polling FOR SELECT TO authenticated USING (true);

CREATE TABLE public.vote (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  polling_id uuid NOT NULL REFERENCES public.polling(id) ON DELETE CASCADE,
  pilihan_id uuid NOT NULL REFERENCES public.pilihan_polling(id) ON DELETE CASCADE,
  anggota_id uuid NOT NULL REFERENCES public.anggota(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (polling_id, anggota_id, pilihan_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vote TO authenticated;
GRANT ALL ON public.vote TO service_role;
ALTER TABLE public.vote ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vote read all" ON public.vote FOR SELECT TO authenticated USING (true);

-- NOTIFIKASI
CREATE TABLE public.notifikasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anggota_id uuid NOT NULL REFERENCES public.anggota(id) ON DELETE CASCADE,
  judul text NOT NULL,
  isi text,
  jenis text NOT NULL DEFAULT 'umum',
  link text,
  terbaca boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifikasi_anggota_unread_idx ON public.notifikasi(anggota_id, terbaca, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifikasi TO authenticated;
GRANT ALL ON public.notifikasi TO service_role;
ALTER TABLE public.notifikasi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif read own" ON public.notifikasi FOR SELECT TO authenticated
  USING (anggota_id = public.current_anggota_id());
CREATE POLICY "notif update own" ON public.notifikasi FOR UPDATE TO authenticated
  USING (anggota_id = public.current_anggota_id());

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikasi;
ALTER PUBLICATION supabase_realtime ADD TABLE public.polling;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vote;
ALTER PUBLICATION supabase_realtime ADD TABLE public.titah;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tugas;
