
-- ============================================================
-- UPDATE MEMBER DATA: TikTok, correct info, seed jadwal kuliah
-- ============================================================

-- Wipe existing jadwal so we reseed fresh
DELETE FROM public.jadwal;

-- Jadwal kuliah Senin (hari=1)
INSERT INTO public.jadwal (hari, jam_mulai, jam_selesai, matkul, ruangan, dosen) VALUES
(1, '08:00', '09:30', 'Komunikasi Data', 'Ruang 2.3', 'Ftm'),
(1, '10:00', '11:30', 'Bahasa Inggris 2', 'Ruang 2.3', 'Sw'),
(1, '12:30', '14:00', 'Sistem Basis Data', 'Ruang 4', 'Rsk');

-- Jadwal kuliah Selasa (hari=2)
INSERT INTO public.jadwal (hari, jam_mulai, jam_selesai, matkul, ruangan, dosen) VALUES
(2, '12:30', '14:00', 'Sistem Operasi', 'Lab B', 'Ty');

-- Jadwal kuliah Kamis (hari=4)
INSERT INTO public.jadwal (hari, jam_mulai, jam_selesai, matkul, ruangan, dosen) VALUES
(4, '08:00', '09:30', 'Hardware & Software', 'Ruang 2.3', 'Am'),
(4, '10:00', '11:30', 'Struktur Data', 'Lab B', 'Da'),
(4, '12:30', '14:00', 'Matematika Diskrit', 'Ruang 2.3', 'Yz');

-- Jadwal kuliah Jumat (hari=5)
INSERT INTO public.jadwal (hari, jam_mulai, jam_selesai, matkul, ruangan, dosen) VALUES
(5, '08:00', '10:40', 'Pemrograman Web Dasar', 'Lab B', 'Frd'),
(5, '13:00', '15:40', 'Desain Grafis', 'Ruang 2.2', 'Why');

-- ============================================================
-- UPDATE existing bangsawan data with tiktok & corrections
-- ============================================================

-- Raihan Satria Wibawa (urutan=1)
UPDATE public.anggota SET
  tiktok = 'rai_vestero'
WHERE lower(email) = 'satriaraihan82@gmail.com';

-- Fatkhul Wahab (urutan=2)
UPDATE public.anggota SET
  tiktok = 'whb1266'
WHERE lower(email) = 'wahabfatkhul44@gmail.com';

-- Ragil Kurniawan (urutan=3)
UPDATE public.anggota SET
  ig     = 'awnaidee',
  tiktok = 'cr7'
WHERE lower(email) = 'awnaidee@gmail.com';

-- Muhammad Rasyid (urutan=4)
UPDATE public.anggota SET
  ig     = '18.1.shitt',
  tiktok = 'sagara.rimba'
WHERE lower(email) = 'muhammadrasyid6054@gmail.com';

-- ============================================================
-- Remove old empty placeholder seats and insert remaining members
-- ============================================================

-- Delete the placeholder "Tahta Kosong" rows so we can insert real members
DELETE FROM public.anggota WHERE nama LIKE 'Tahta Kosong%';

-- Ahsan Adi Romza (Yang Mulia / Jeruk)
INSERT INTO public.anggota (urutan, nama, panggilan, role, email, nim, wa, ig, tiktok, tempat_lahir, tgl_lahir, foto_url, hobi, motto)
VALUES (5, 'Ahsan Adi Romza', 'Gavin / Jeruk', 'yang_mulia'::public.anggota_role,
        'gavinnn3105@gmail.com', '2511013', '08895639221', 'jeruukkk_', 'aqila',
        'Seoul', '2005-10-31',
        'https://drive.google.com/uc?id=1PDqn_OOnjoXb4Nu6qBVn-yParwX0DAEn',
        'Menulis & Mendengarkan Musik',
        'Hiduplah seperti Jeruk, Menggantung dan bervitamin.')
ON CONFLICT DO NOTHING;

-- Hefi Isti Rofiqoh (Sekretaris)
INSERT INTO public.anggota (urutan, nama, panggilan, role, email, nim, wa, ig, tiktok, tempat_lahir, tgl_lahir, foto_url, hobi, motto)
VALUES (6, 'Hefi Isti Rofiqoh', 'Heffii', 'sekretaris'::public.anggota_role,
        'hefiisti2@gmail.com', '2511014', '083104966654', 'user11.0479', 'hfiiii_',
        'Magelang', '2005-05-26',
        'https://drive.google.com/uc?id=15W8Z9BNc3KTCAichs09HnvVQouVtKLru',
        NULL,
        '"Sehat ragaku, bahagia jiwaku, sejahtera hidupku aamiin."')
ON CONFLICT DO NOTHING;

-- Jonathan Alexander Tirta Sinulingga (Bangsawan)
INSERT INTO public.anggota (urutan, nama, panggilan, role, email, nim, wa, ig, tiktok, tempat_lahir, tgl_lahir, foto_url, hobi, motto)
VALUES (7, 'Jonathan Alexander Tirta Sinulingga', 'Jojo', 'bangsawan'::public.anggota_role,
        'jojo.jats@gmail.com', '2511008', '082258791145', 'jojo.jats', NULL,
        'Bogor', '2006-12-01',
        'https://drive.google.com/uc?id=1MeWrjM-ACEhoLQBOn-VKI8Ypa5gv8Max',
        'Olahraga / nonton film',
        'Don''t chase comfort. You only live once')
ON CONFLICT DO NOTHING;

-- Misbachul Alam Abdil Jabbar (Bangsawan)
INSERT INTO public.anggota (urutan, nama, panggilan, role, email, nim, wa, ig, tiktok, tempat_lahir, tgl_lahir, foto_url, hobi, motto)
VALUES (8, 'Misbachul Alam Abdil Jabbar', 'Ahul', 'bangsawan'::public.anggota_role,
        'ahulahul487@gmail.com', '2511020', '081996033737', 'Misbah_ach', 'manstein',
        'Madiun', '2004-05-15',
        'https://drive.google.com/uc?id=12MqMy78RmtcWe7mO38mkCu0biO4ibU35',
        'Olahraga',
        'Be The Best You Can Be')
ON CONFLICT DO NOTHING;

-- Elizabeth Fransiska Sanjaya (Bangsawan)
INSERT INTO public.anggota (urutan, nama, panggilan, role, email, nim, wa, ig, tiktok, tempat_lahir, tgl_lahir, foto_url, hobi, motto)
VALUES (9, 'Elizabeth Fransiska Sanjaya', 'Eliz', 'bangsawan'::public.anggota_role,
        'elisabethfransiskasanjaya65@gmail.com', '2511010', '081392369586', 'El_sisca18', NULL,
        'Magelang', '2007-02-16',
        'https://drive.google.com/uc?id=1f6jzdjreMeqwi6ll-mVob8G9Elc9SW17',
        'Bermain game, fotografi',
        'Mimpi tidak akan bekerja kecuali kamu memulainya.')
ON CONFLICT DO NOTHING;

-- Rifka Aulia Rahma (Bangsawan)
INSERT INTO public.anggota (urutan, nama, panggilan, role, email, nim, wa, ig, tiktok, tempat_lahir, tgl_lahir, foto_url, hobi, motto)
VALUES (10, 'Rifka Aulia Rahma', 'Rifka', 'bangsawan'::public.anggota_role,
        'rifkaauliarahma@gmail.com', '2511015', '081227553445', 'ripka.aulia', 'rifkaaulia225',
        'Magelang', '2006-05-22',
        'https://drive.google.com/uc?id=1JGWS-uf9pZLEXZKVR_psueM2KwjU1brl',
        'Voli',
        'Jalur langit pancen ra ketoro, neng insyaallah ketoto')
ON CONFLICT DO NOTHING;

-- Rifqi Fadhilah Alif (Bangsawan)
INSERT INTO public.anggota (urutan, nama, panggilan, role, email, nim, wa, ig, tiktok, tempat_lahir, tgl_lahir, foto_url, hobi, motto)
VALUES (11, 'Rifqi Fadhilah Alif', 'Rifqi / Kisot', 'bangsawan'::public.anggota_role,
        'fadhilahrifqi190703@gmail.com', '2511007', '08812927551', 'ryuujiichiro', 'rifqi.f_',
        'Magelang', '2003-07-19',
        'https://drive.google.com/uc?id=1fwmWapsLtpS8Hy_PwcKS4SOILYtRO4gW',
        'Nonton Film/Anime, Bermain Game',
        'tetaplah berputus asa dan jgn bersemangat')
ON CONFLICT DO NOTHING;

-- Dhea Arnesyaningsih (Bangsawan)
INSERT INTO public.anggota (urutan, nama, panggilan, role, email, nim, wa, ig, tiktok, tempat_lahir, tgl_lahir, foto_url, hobi, motto)
VALUES (12, 'Dhea Arnesyaningsih', 'Dhea / Nesya', 'bangsawan'::public.anggota_role,
        'dheanesyaa@gmail.com', '2511022', '082331206906', 'dheeysy_', 'second neyy',
        'Magelang', '2007-07-06',
        'https://drive.google.com/uc?id=1UG4vSBgS2sMesTNxDkNt79SCt9GQRx7U',
        'Aku suka ngoding tapi klo gda error nya',
        '"Kunci sukses itu consistency. Konsisten mengeluh tapi tetap jalan terus."')
ON CONFLICT DO NOTHING;

-- Wisnu Candra (Bangsawan — no NIM given)
INSERT INTO public.anggota (urutan, nama, panggilan, role, email, nim, wa, ig, tiktok, tempat_lahir, tgl_lahir, foto_url, hobi, motto)
VALUES (13, 'Wisnu Candra', 'Candra', 'bangsawan'::public.anggota_role,
        'cw104966@gmail.com', NULL, '085700901960', NULL, NULL,
        NULL, NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Aqila Bana Karagus (Manager/Admin)
UPDATE public.anggota SET
  nama        = 'Aqila Bana Karagus',
  panggilan   = 'Aqiel',
  nim         = '2511005',
  wa          = '085641033743',
  ig          = 'limqiel',
  tiktok      = 'limqiel',
  tempat_lahir= 'Magelang',
  tgl_lahir   = '2006-06-18',
  hobi        = 'Ngapain aja',
  motto       = 'Tidak perlu kata-kata, yang penting aksi nyata'
WHERE lower(email) = 'mastermoneman@gmail.com';
