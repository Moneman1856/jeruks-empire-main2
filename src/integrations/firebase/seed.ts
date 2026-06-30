/**
 * Seeds all initial data (anggota + jadwal) into Firestore.
 * Safe to call multiple times — checks if data already exists first.
 */
import { collection, getDocs, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { db } from "./client";
import type { AnggotaRole } from "./types";

const ANGGOTA_SEED: Array<{
  urutan: number; nama: string; panggilan: string | null; role: AnggotaRole;
  email: string | null; nim: string | null; wa: string | null; ig: string | null;
  tiktok: string | null; tempat_lahir: string | null; tgl_lahir: string | null;
  foto_url: string | null; hobi: string | null; motto: string | null;
}> = [
  { urutan: 0, nama: "Aqila Bana Karagus", panggilan: "Aqiel", role: "manager", email: "mastermoneman@gmail.com", nim: "2511005", wa: "085641033743", ig: "limqiel", tiktok: "limqiel", tempat_lahir: "Magelang", tgl_lahir: "2006-06-18", foto_url: null, hobi: "Ngapain aja", motto: "Tidak perlu kata-kata, yang penting aksi nyata" },
  { urutan: 1, nama: "Raihan Satria Wibawa", panggilan: "Raihan", role: "bangsawan", email: "satriaraihan82@gmail.com", nim: "2511011", wa: "081227274819", ig: "rai_vestero", tiktok: "rai_vestero", tempat_lahir: "Magelang", tgl_lahir: "2007-09-27", foto_url: "https://drive.google.com/uc?id=1FgmcrqDzAnVi6jXPmamQSpOeqkk5y8Sv", hobi: "Bermain game", motto: "Hidup untuk menang" },
  { urutan: 2, nama: "Fatkhul Wahab", panggilan: "Wahab", role: "bangsawan", email: "wahabfatkhul44@gmail.com", nim: "2511026", wa: "085643147", ig: "fatkhul_w03", tiktok: "whb1266", tempat_lahir: "Magelang", tgl_lahir: "2005-07-03", foto_url: "https://drive.google.com/uc?id=1U5jwXnTcL_X-pe_3KZFNJJilCCQ5yRDw", hobi: "Main game, merawat ikan", motto: "Tetap semangat pantang menyerah" },
  { urutan: 3, nama: "Ragil Kurniawan", panggilan: "Awan", role: "bangsawan", email: "awnaidee@gmail.com", nim: "2511019", wa: "087749122420", ig: "awnaidee", tiktok: "cr7", tempat_lahir: "Amerika", tgl_lahir: "2002-02-28", foto_url: "https://drive.google.com/uc?id=16WJu_y9TTJ3zOT__k9PdHz95dLChxUX6", hobi: "Hobi ngamok", motto: "Alon alon rasah kesusu, arek kesusu yo susune sopo" },
  { urutan: 4, nama: "Muhammad Rasyid", panggilan: "Jefferson", role: "bangsawan", email: "muhammadrasyid6054@gmail.com", nim: "2511001", wa: "085921788183", ig: "18.1.shitt", tiktok: "sagara.rimba", tempat_lahir: "Palembang", tgl_lahir: "2006-02-24", foto_url: "https://drive.google.com/uc?id=1Lqz0hcaQyP9V2XOdHSODwB23TkTXVsSX", hobi: "Berkesenian", motto: "Hidup yang berarti bukan sekedar tak mati, mati yang berarti mesti yang terakhir kali" },
  { urutan: 5, nama: "Ahsan Adi Romza", panggilan: "Gavin / Jeruk", role: "yang_mulia", email: "gavinnn3105@gmail.com", nim: "2511013", wa: "08895639221", ig: "jeruukkk_", tiktok: "aqila", tempat_lahir: "Seoul", tgl_lahir: "2005-10-31", foto_url: "https://drive.google.com/uc?id=1PDqn_OOnjoXb4Nu6qBVn-yParwX0DAEn", hobi: "Menulis & Mendengarkan Musik", motto: "Hiduplah seperti Jeruk, Menggantung dan bervitamin." },
  { urutan: 6, nama: "Hefi Isti Rofiqoh", panggilan: "Heffii", role: "sekretaris", email: "hefiisti2@gmail.com", nim: "2511014", wa: "083104966654", ig: "user11.0479", tiktok: "hfiiii_", tempat_lahir: "Magelang", tgl_lahir: "2005-05-26", foto_url: "https://drive.google.com/uc?id=15W8Z9BNc3KTCAichs09HnvVQouVtKLru", hobi: null, motto: '"Sehat ragaku, bahagia jiwaku, sejahtera hidupku aamiin."' },
  { urutan: 7, nama: "Jonathan Alexander Tirta Sinulingga", panggilan: "Jojo", role: "bangsawan", email: "jojo.jats@gmail.com", nim: "2511008", wa: "082258791145", ig: "jojo.jats", tiktok: null, tempat_lahir: "Bogor", tgl_lahir: "2006-12-01", foto_url: "https://drive.google.com/uc?id=1MeWrjM-ACEhoLQBOn-VKI8Ypa5gv8Max", hobi: "Olahraga / nonton film", motto: "Don't chase comfort. You only live once" },
  { urutan: 8, nama: "Misbachul Alam Abdil Jabbar", panggilan: "Ahul", role: "bangsawan", email: "ahulahul487@gmail.com", nim: "2511020", wa: "081996033737", ig: "Misbah_ach", tiktok: "manstein", tempat_lahir: "Madiun", tgl_lahir: "2004-05-15", foto_url: "https://drive.google.com/uc?id=12MqMy78RmtcWe7mO38mkCu0biO4ibU35", hobi: "Olahraga", motto: "Be The Best You Can Be" },
  { urutan: 9, nama: "Elizabeth Fransiska Sanjaya", panggilan: "Eliz", role: "bangsawan", email: "elisabethfransiskasanjaya65@gmail.com", nim: "2511010", wa: "081392369586", ig: "El_sisca18", tiktok: null, tempat_lahir: "Magelang", tgl_lahir: "2007-02-16", foto_url: "https://drive.google.com/uc?id=1f6jzdjreMeqwi6ll-mVob8G9Elc9SW17", hobi: "Bermain game, fotografi", motto: "Mimpi tidak akan bekerja kecuali kamu memulainya." },
  { urutan: 10, nama: "Rifka Aulia Rahma", panggilan: "Rifka", role: "bangsawan", email: "rifkaauliarahma@gmail.com", nim: "2511015", wa: "081227553445", ig: "ripka.aulia", tiktok: "rifkaaulia225", tempat_lahir: "Magelang", tgl_lahir: "2006-05-22", foto_url: "https://drive.google.com/uc?id=1JGWS-uf9pZLEXZKVR_psueM2KwjU1brl", hobi: "Voli", motto: "Jalur langit pancen ra ketoro, neng insyaallah ketoto" },
  { urutan: 11, nama: "Rifqi Fadhilah Alif", panggilan: "Rifqi / Kisot", role: "bangsawan", email: "fadhilahrifqi190703@gmail.com", nim: "2511007", wa: "08812927551", ig: "ryuujiichiro", tiktok: "rifqi.f_", tempat_lahir: "Magelang", tgl_lahir: "2003-07-19", foto_url: "https://drive.google.com/uc?id=1fwmWapsLtpS8Hy_PwcKS4SOILYtRO4gW", hobi: "Nonton Film/Anime, Bermain Game", motto: "tetaplah berputus asa dan jgn bersemangat" },
  { urutan: 12, nama: "Dhea Arnesyaningsih", panggilan: "Dhea / Nesya", role: "bangsawan", email: "dheanesyaa@gmail.com", nim: "2511022", wa: "082331206906", ig: "dheeysy_", tiktok: "second neyy", tempat_lahir: "Magelang", tgl_lahir: "2007-07-06", foto_url: "https://drive.google.com/uc?id=1UG4vSBgS2sMesTNxDkNt79SCt9GQRx7U", hobi: "Aku suka ngoding tapi klo gda error nya", motto: '"Kunci sukses itu consistency. Konsisten mengeluh tapi tetap jalan terus."' },
  { urutan: 13, nama: "Wisnu Candra", panggilan: "Candra", role: "bangsawan", email: "cw104966@gmail.com", nim: null, wa: "085700901960", ig: null, tiktok: null, tempat_lahir: null, tgl_lahir: null, foto_url: null, hobi: null, motto: null },
];

const JADWAL_SEED = [
  { hari: 1, jam_mulai: "08:00", jam_selesai: "09:30", matkul: "Komunikasi Data", ruangan: "Ruang 2.3", dosen: "Ftm" },
  { hari: 1, jam_mulai: "10:00", jam_selesai: "11:30", matkul: "Bahasa Inggris 2", ruangan: "Ruang 2.3", dosen: "Sw" },
  { hari: 1, jam_mulai: "12:30", jam_selesai: "14:00", matkul: "Sistem Basis Data", ruangan: "Ruang 4", dosen: "Rsk" },
  { hari: 2, jam_mulai: "12:30", jam_selesai: "14:00", matkul: "Sistem Operasi", ruangan: "Lab B", dosen: "Ty" },
  { hari: 4, jam_mulai: "08:00", jam_selesai: "09:30", matkul: "Hardware & Software", ruangan: "Ruang 2.3", dosen: "Am" },
  { hari: 4, jam_mulai: "10:00", jam_selesai: "11:30", matkul: "Struktur Data", ruangan: "Lab B", dosen: "Da" },
  { hari: 4, jam_mulai: "12:30", jam_selesai: "14:00", matkul: "Matematika Diskrit", ruangan: "Ruang 2.3", dosen: "Yz" },
  { hari: 5, jam_mulai: "08:00", jam_selesai: "10:40", matkul: "Pemrograman Web Dasar", ruangan: "Lab B", dosen: "Frd" },
  { hari: 5, jam_mulai: "13:00", jam_selesai: "15:40", matkul: "Desain Grafis", ruangan: "Ruang 2.2", dosen: "Why" },
];

export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, "anggota"));
    if (!snap.empty) return; // already seeded

    const batch = writeBatch(db);
    const now = new Date().toISOString();

    for (const a of ANGGOTA_SEED) {
      const ref = doc(collection(db, "anggota"));
      batch.set(ref, { ...a, firebaseUid: null, created_at: now });
    }

    for (const j of JADWAL_SEED) {
      const ref = doc(collection(db, "jadwal"));
      batch.set(ref, { ...j, created_at: now });
    }

    await batch.commit();
    console.log("✅ Firestore seeded with members and jadwal.");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  }
}
