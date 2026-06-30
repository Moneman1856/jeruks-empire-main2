// TypeScript types mirroring Firestore collections for Jeruks Empire

export type AnggotaRole = "manager" | "yang_mulia" | "sekretaris" | "bendahara" | "bangsawan";
export type TugasStatus = "belum" | "dikerjakan" | "selesai";
export type EventJenis = "uts" | "uas" | "libur" | "lainnya";
export type KasStatus = "belum" | "lunas";

export interface Anggota {
  id: string;
  nama: string;
  panggilan: string | null;
  foto_url: string | null;
  role: AnggotaRole;
  email: string | null;
  firebaseUid: string | null;
  nim: string | null;
  wa: string | null;
  ig: string | null;
  tiktok: string | null;
  tempat_lahir: string | null;
  tgl_lahir: string | null; // "YYYY-MM-DD"
  hobi: string | null;
  motto: string | null;
  urutan: number | null;
  created_at: string;
}

export interface Titah {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  pinned: boolean;
  author_id: string | null;
  author?: { nama: string } | null;
  created_at: string;
}

export interface Tugas {
  id: string;
  judul: string;
  matkul: string;
  deadline: string;
  status: TugasStatus;
  created_at: string;
}

export interface TugasCompletion {
  id: string;
  tugas_id: string;
  anggota_id: string;
  completed_at: string;
}

export interface Jadwal {
  id: string;
  hari: number; // 1=Senin ... 7=Minggu
  jam_mulai: string;
  jam_selesai: string;
  matkul: string;
  ruangan: string | null;
  dosen: string | null;
  created_at: string;
}

export interface AbsenShare {
  id: string;
  jadwal_id: string;
  tanggal: string;
  link: string;
  shared_by: string | null;
  expires_at: string;
  created_at: string;
  // joined
  anggota?: { nama: string | null; panggilan: string | null; foto_url: string | null } | null;
  jadwal?: { matkul: string; dosen: string | null; ruangan: string | null; hari: number; jam_mulai: string } | null;
}

export interface EventAkademik {
  id: string;
  nama: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  jenis: EventJenis;
  created_at: string;
}

export interface Materi {
  id: string;
  matkul: string;
  judul: string;
  link: string;
  created_at: string;
}

export interface KasPeriode {
  id: string;
  label: string;
  nominal_per_orang: number;
  created_at: string;
}

export interface KasPembayaran {
  id: string;
  periode_id: string;
  anggota_id: string;
  status: KasStatus;
  jumlah: number;
  tanggal: string | null;
  // joined
  anggota?: { nama: string; role: AnggotaRole } | null;
}

export interface Pengeluaran {
  id: string;
  deskripsi: string;
  jumlah: number;
  tanggal: string;
  created_at: string;
}

export interface Foto {
  id: string;
  url: string;
  caption: string | null;
  tanggal: string;
  uploader_id: string | null;
  created_at: string;
  // joined
  uploader?: { nama: string } | null;
}

export interface ForumTopik {
  id: string;
  judul: string;
  isi: string;
  author_id: string | null;
  created_at: string;
  // joined
  author?: { nama: string } | null;
  balasan?: { count: number }[];
}

export interface ForumBalasan {
  id: string;
  topik_id: string;
  author_id: string | null;
  isi: string;
  created_at: string;
  // joined
  author?: { nama: string } | null;
}

export interface Polling {
  id: string;
  pertanyaan: string;
  deskripsi: string | null;
  multi: boolean;
  ditutup: boolean;
  batas_waktu: string | null;
  author_id: string | null;
  created_at: string;
  // joined
  author?: { nama: string } | null;
  pilihan?: PilihanPolling[];
  vote?: Vote[];
}

export interface PilihanPolling {
  id: string;
  polling_id: string;
  teks: string;
  urutan: number;
}

export interface Vote {
  id: string;
  polling_id: string;
  pilihan_id: string;
  anggota_id: string;
  created_at: string;
}

export interface Notifikasi {
  id: string;
  anggota_id: string;
  judul: string;
  isi: string | null;
  jenis: string;
  link: string | null;
  terbaca: boolean;
  created_at: string;
}
