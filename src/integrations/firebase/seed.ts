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
  { urutan: 0, nama: "Aqila Bana Karagus", panggilan: "Aqiel", role: "manager", email: "mastermoneman@gmail.com", nim: "2511005", wa: "085641033743", ig: "limqiel", tiktok: "limqiel", tempat_lahir: "Magelang", tgl_lahir: "2006-06-18", foto_url: "/Foto Setengah Badan (File responses)/Aqiel.png", hobi: "Ngapain aja", motto: "Tidak perlu kata-kata, yang penting aksi nyata" },
  { urutan: 1, nama: "Raihan Satria Wibawa", panggilan: "Raihan", role: "bangsawan", email: "satriaraihan82@gmail.com", nim: "2511011", wa: "081227274819", ig: "rai_vestero", tiktok: "rai_vestero", tempat_lahir: "Magelang", tgl_lahir: "2007-09-27", foto_url: "/Foto Setengah Badan (File responses)/Raihan.jpg", hobi: "Bermain game", motto: "Hidup untuk menang" },
  { urutan: 2, nama: "Fatkhul Wahab", panggilan: "Wahab", role: "bangsawan", email: "wahabfatkhul44@gmail.com", nim: "2511026", wa: "085643147", ig: "fatkhul_w03", tiktok: "whb1266", tempat_lahir: "Magelang", tgl_lahir: "2005-07-03", foto_url: "/Foto Setengah Badan (File responses)/Wahab.jpg", hobi: "Main game, merawat ikan", motto: "Tetap semangat pantang menyerah" },
  { urutan: 3, nama: "Ragil Kurniawan", panggilan: "Awan", role: "bangsawan", email: "awnaidee@gmail.com", nim: "2511019", wa: "087749122420", ig: "awnaidee", tiktok: "cr7", tempat_lahir: "Amerika", tgl_lahir: "2002-02-28", foto_url: "/Foto Setengah Badan (File responses)/Awan.jpg", hobi: "Hobi ngamok", motto: "Alon alon rasah kesusu, arek kesusu yo susune sopo" },
  { urutan: 4, nama: "Muhammad Rasyid", panggilan: "Jefferson", role: "bangsawan", email: "muhammadrasyid6054@gmail.com", nim: "2511001", wa: "085921788183", ig: "18.1.shitt", tiktok: "sagara.rimba", tempat_lahir: "Palembang", tgl_lahir: "2006-02-24", foto_url: "/Foto Setengah Badan (File responses)/Jefferson.JPG", hobi: "Berkesenian", motto: "Hidup yang berarti bukan sekedar tak mati, mati yang berarti mesti yang terakhir kali" },
  { urutan: 5, nama: "Ahsan Adi Romza", panggilan: "Gavin / Jeruk", role: "yang_mulia", email: "gavinnn3105@gmail.com", nim: "2511013", wa: "08895639221", ig: "jeruukkk_", tiktok: "aqila", tempat_lahir: "Seoul", tgl_lahir: "2005-10-31", foto_url: "/Foto Setengah Badan (File responses)/Jeruk.jpg", hobi: "Menulis & Mendengarkan Musik", motto: "Hiduplah seperti Jeruk, Menggantung dan bervitamin." },
  { urutan: 6, nama: "Hefi Isti Rofiqoh", panggilan: "Heffii", role: "sekretaris", email: "hefiisti2@gmail.com", nim: "2511014", wa: "083104966654", ig: "user11.0479", tiktok: "hfiiii_", tempat_lahir: "Magelang", tgl_lahir: "2005-05-26", foto_url: "/Foto Setengah Badan (File responses)/Hefi.jpg", hobi: null, motto: '"Sehat ragaku, bahagia jiwaku, sejahtera hidupku aamiin."' },
  { urutan: 7, nama: "Jonathan Alexander Tirta Sinulingga", panggilan: "Jojo", role: "bangsawan", email: "jojo.jats@gmail.com", nim: "2511008", wa: "082258791145", ig: "jojo.jats", tiktok: null, tempat_lahir: "Bogor", tgl_lahir: "2006-12-01", foto_url: "/Foto Setengah Badan (File responses)/Jojo.jpg", hobi: "Olahraga / nonton film", motto: "Don't chase comfort. You only live once" },
  { urutan: 8, nama: "Misbachul Alam Abdil Jabbar", panggilan: "Ahul", role: "bangsawan", email: "ahulahul487@gmail.com", nim: "2511020", wa: "081996033737", ig: "Misbah_ach", tiktok: "manstein", tempat_lahir: "Madiun", tgl_lahir: "2004-05-15", foto_url: "/Foto Setengah Badan (File responses)/Ahul.jpg", hobi: "Olahraga", motto: "Be The Best You Can Be" },
  { urutan: 9, nama: "Elizabeth Fransiska Sanjaya", panggilan: "Eliz", role: "bangsawan", email: "elisabethfransiskasanjaya65@gmail.com", nim: "2511010", wa: "081392369586", ig: "El_sisca18", tiktok: null, tempat_lahir: "Magelang", tgl_lahir: "2007-02-16", foto_url: "/Foto Setengah Badan (File responses)/Eliz.jpeg", hobi: "Bermain game, fotografi", motto: "Mimpi tidak akan bekerja kecuali kamu memulainya." },
  { urutan: 10, nama: "Rifka Aulia Rahma", panggilan: "Rifka", role: "bangsawan", email: "rifkaauliarahma@gmail.com", nim: "2511015", wa: "081227553445", ig: "ripka.aulia", tiktok: "rifkaaulia225", tempat_lahir: "Magelang", tgl_lahir: "2006-05-22", foto_url: "/Foto Setengah Badan (File responses)/Rifka.jpg", hobi: "Voli", motto: "Jalur langit pancen ra ketoro, neng insyaallah ketoto" },
  { urutan: 11, nama: "Rifqi Fadhilah Alif", panggilan: "Rifqi / Kisot", role: "bangsawan", email: "fadhilahrifqi190703@gmail.com", nim: "2511007", wa: "08812927551", ig: "ryuujiichiro", tiktok: "rifqi.f_", tempat_lahir: "Magelang", tgl_lahir: "2003-07-19", foto_url: "/Foto Setengah Badan (File responses)/Rifqi.jpg", hobi: "Nonton Film/Anime, Bermain Game", motto: "tetaplah berputus asa dan jgn bersemangat" },
  { urutan: 12, nama: "Dhea Arnesyaningsih", panggilan: "Dhea / Nesya", role: "bangsawan", email: "dheanesyaa@gmail.com", nim: "2511022", wa: "082331206906", ig: "dheeysy_", tiktok: "second neyy", tempat_lahir: "Magelang", tgl_lahir: "2007-07-06", foto_url: "/Foto Setengah Badan (File responses)/Dhea.jpg", hobi: "Aku suka ngoding tapi klo gda error nya", motto: '"Kunci sukses itu consistency. Konsisten mengeluh tapi tetap jalan terus."' },
  { urutan: 13, nama: "Wisnu Candra", panggilan: "Candra", role: "bangsawan", email: "cw104966@gmail.com", nim: null, wa: "085700901960", ig: null, tiktok: null, tempat_lahir: null, tgl_lahir: null, foto_url: "/Foto Setengah Badan (File responses)/Candra.png", hobi: null, motto: null },
  { urutan: 14, nama: "Flora Afinka", panggilan: "Vlo", role: "bangsawan", email: "floraafinka06@gmail.com", nim: "2511006", wa: "081326986830", ig: "vloraavinca", tiktok: "vlovnca", tempat_lahir: "Magelang", tgl_lahir: "2006-03-02", foto_url: "/Foto Setengah Badan (File responses)/Flora.jpeg", hobi: "healing", motto: "secret" },
];

const JADWAL_SEED = [
  { hari: 1, jam_mulai: "08:00", jam_selesai: "09:30", matkul: "Komunikasi Data (Komdat)", ruangan: "Ruang 2.3", dosen: "Ftm" },
  { hari: 1, jam_mulai: "10:00", jam_selesai: "11:30", matkul: "B. Inggris 2", ruangan: "Ruang 2.3", dosen: "Sw" },
  { hari: 1, jam_mulai: "12:30", jam_selesai: "14:00", matkul: "Sistem Basis Data (Sist. Basis Dt)", ruangan: "Ruang 4", dosen: "Rsk" },
  { hari: 2, jam_mulai: "12:30", jam_selesai: "14:00", matkul: "Sistem Operasi", ruangan: "Ruang Lab B", dosen: "Ty" },
  { hari: 4, jam_mulai: "08:00", jam_selesai: "09:30", matkul: "Hard/Software", ruangan: "Ruang 2.3", dosen: "Am" },
  { hari: 4, jam_mulai: "10:00", jam_selesai: "11:30", matkul: "Struktur Data (Struk. Data)", ruangan: "Ruang Lab B", dosen: "Da" },
  { hari: 4, jam_mulai: "12:30", jam_selesai: "14:00", matkul: "Matematika Diskrit (Mtk Diskrit)", ruangan: "Ruang 2.3", dosen: "Yz" },
  { hari: 5, jam_mulai: "08:00", jam_selesai: "10:40", matkul: "Pemrograman Web Dasar (P. Web Dasar)", ruangan: "Ruang Lab B", dosen: "Frd" },
  { hari: 5, jam_mulai: "13:00", jam_selesai: "15:40", matkul: "Desain Grafis", ruangan: "Ruang 2.2", dosen: "Why" },
];

export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, "anggota"));
    const anggotaDocsByEmail = new Map();
    snap.docs.forEach(doc => {
      const data = doc.data();
      if (data.email) {
        anggotaDocsByEmail.set(data.email.toLowerCase(), doc);
      }
    });

    const batch = writeBatch(db);
    const now = new Date().toISOString();
    let addedCount = 0;

    // 1. Sync members (Add new or Update existing)
    for (const a of ANGGOTA_SEED) {
      if (!a.email) continue;
      const emailLower = a.email.toLowerCase();
      
      if (anggotaDocsByEmail.has(emailLower)) {
        // Update existing to sync photos etc without losing firebaseUid
        const existingDoc = anggotaDocsByEmail.get(emailLower);
        batch.set(existingDoc.ref, { ...a }, { merge: true });
      } else {
        // Add new
        const ref = doc(collection(db, "anggota"));
        batch.set(ref, { ...a, firebaseUid: null, created_at: now });
      }
      addedCount++;
    }

    // 2. Overwrite jadwal using deterministic IDs with { merge: true } to bypass strict delete rules
    for (const j of JADWAL_SEED) {
      // Create a predictable ID like "jadwal_1_0800"
      const docId = `jadwal_${j.hari}_${j.jam_mulai.replace(":", "")}`;
      const ref = doc(collection(db, "jadwal"), docId);
      batch.set(ref, { ...j, created_at: now }, { merge: true });
      addedCount++;
    }

    if (addedCount > 0) {
      await batch.commit();
      console.log(`✅ Firestore seeded: Synced ${addedCount} record(s).`);
    }
  } catch (err) {
    console.error("❌ Seed failed:", err);
  }
}
