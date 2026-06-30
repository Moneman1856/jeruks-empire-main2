## Masalah

Tabel `anggota` masih kosong, jadi siapa pun yang login Google (termasuk admin `mastermoneman@gmail.com`) tidak ketemu data dan dilempar ke layar "Menanti persetujuan Admin".

Trigger `handle_new_google_user` sudah benar: kalau email user Google cocok dengan baris di `anggota` yang `user_id`-nya kosong, langsung ditautkan. Yang kurang cuma datanya.

## Solusi

Seed semua anggota dari daftar yang dikirim ke tabel `anggota` (via insert tool). Begitu data masuk, login Google berikutnya untuk email-email tsb langsung tertaut otomatis — tidak ada layar tunggu lagi.

## Pemetaan Peran (role)

Mengikuti enum `anggota_role` yang sudah ada di DB (`manager, yang_mulia, sekretaris, bendahara, bangsawan`):

- `manager` (admin tertinggi untuk hak edit): **Aqila Bana Karagus** — `mastermoneman@gmail.com`
- `yang_mulia`: **Ahsan Adi Romza** — `gavinnn3105@gmail.com`
- `sekretaris`: **Hefi Isti Rofiqoh** — `hefiisti2@gmail.com`
- `bendahara`: *(tidak ada yang ditunjuk di daftar — dilewati)*
- `bangsawan`: semua sisanya (Raihan, Fatkhul, Ragil, Rasyid, Jonathan, Misbachul, Elizabeth, Rifka, Rifqi, Dhea, Wisnu)

Urutan tahta display (`urutan` kolom) akan diisi: yang_mulia=1, sekretaris=2, manager=3, bangsawan=4+. Catatan: hak akses admin tetap mengandalkan fungsi `is_admin()` yang mengembalikan true untuk `manager` & `yang_mulia` — admin (`mastermoneman`) tetap punya kuasa edit penuh.

## Penanganan Data Kosong

Sesuai permintaan: field yang kosong di sumber **dilewati** (insert tanpa kolom itu / `NULL`), yang ada datanya diisi.
- **Wisnu Candra**: hanya nama, panggilan, WA, email → kolom lain `NULL`.
- **Elizabeth**: tiktok kosong → `NULL`.
- **Aqila**: tgl_lahir kosong → `NULL`.
- Format foto Google Drive disimpan apa adanya (URL `open?id=...`).
- Tanggal lahir dikonversi ke format `YYYY-MM-DD`. Raihan tertulis "27,09,2007" akan diset `2007-09-27` (cocok dgn kolom kedua `9/27/2007`).

## Jadwal Kuliah

Daftar jadwal kuliah pribadi (Senin–Jumat) di pesan **tidak diseed** karena tabel `jadwal` adalah jadwal acara/agenda komunitas, bukan jadwal kuliah individu, dan tidak ada konteks pemilik untuk jadwal tsb. Kalau memang ingin disimpan, beri tahu sebagai fitur terpisah (mis. profil personal / kalender kuliah pribadi).

## Verifikasi

Setelah insert:
1. Query ulang `anggota` → 14 baris.
2. Login Google admin (`mastermoneman@gmail.com`) → trigger menautkan langsung, masuk dashboard tanpa layar pending.
3. Untuk user yang sebelumnya sempat masuk ke `pending_akses`, trigger tidak otomatis menautkan retroaktif — tapi `pending_akses` saat ini kosong, jadi aman.

## Yang TIDAK Diubah

- Trigger `handle_new_google_user` (sudah benar).
- Layar `PendingScreen` (tetap berguna untuk email yang benar-benar tidak terdaftar di masa depan).
- Skema tabel `anggota`.
