/**
 * Empire write operations using Firestore directly.
 * All functions are plain async — no server functions needed.
 */
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, where, writeBatch, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import type { AnggotaRole, TugasStatus, EventJenis, KasStatus } from "@/integrations/firebase/types";

const now = () => new Date().toISOString();

// ─── HELPER: broadcast notification to all members ─────────────
async function broadcastNotif(payload: {
  judul: string; isi?: string | null; jenis: string; link?: string | null;
  excludeAnggotaId?: string | null;
}) {
  const snap = await getDocs(collection(db, "anggota"));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    if (d.id === payload.excludeAnggotaId) return;
    const ref = doc(collection(db, "notifikasi"));
    batch.set(ref, {
      anggota_id: d.id, judul: payload.judul, isi: payload.isi ?? null,
      jenis: payload.jenis, link: payload.link ?? null, terbaca: false, created_at: now(),
    });
  });
  await batch.commit();
}

// ─── TITAH ─────────────────────────────────────────────────────
export async function createTitah(data: { judul: string; isi: string; pinned?: boolean; author_id: string }) {
  const ref = await addDoc(collection(db, "titah"), { ...data, tanggal: now(), pinned: data.pinned ?? false, created_at: now() });
  await broadcastNotif({ judul: "Titah baru: " + data.judul, isi: data.isi.slice(0, 140), jenis: "titah", link: "/", excludeAnggotaId: data.author_id });
  return ref.id;
}

export async function togglePinTitah(id: string, pinned: boolean) {
  await updateDoc(doc(db, "titah", id), { pinned });
}

export async function deleteTitah(id: string) {
  await deleteDoc(doc(db, "titah", id));
}

// ─── TUGAS ─────────────────────────────────────────────────────
export async function createTugas(data: { judul: string; matkul: string; deadline: string; actor_id?: string }) {
  const { actor_id, ...row } = data;
  const ref = await addDoc(collection(db, "tugas"), { ...row, status: "belum", created_at: now() });
  await broadcastNotif({ judul: "Tugas baru: " + data.judul, isi: data.matkul, jenis: "tugas", link: "/balai-tugas", excludeAnggotaId: actor_id ?? null });
  return ref.id;
}

export async function updateTugas(id: string, data: { judul: string; matkul: string; deadline: string }) {
  await updateDoc(doc(db, "tugas", id), data);
}

export async function deleteTugas(id: string) {
  await deleteDoc(doc(db, "tugas", id));
}

export async function setTugasStatus(id: string, status: TugasStatus, actor_id?: string) {
  await updateDoc(doc(db, "tugas", id), { status });
  if (status === "selesai" && actor_id) {
    await markPersonalDone(id, actor_id, true);
  }
}

export async function markPersonalDone(tugas_id: string, anggota_id: string, done: boolean) {
  if (done) {
    const existing = await getDocs(query(collection(db, "tugas_completion"), where("tugas_id", "==", tugas_id), where("anggota_id", "==", anggota_id)));
    if (existing.empty) {
      await addDoc(collection(db, "tugas_completion"), { tugas_id, anggota_id, completed_at: now() });
    }
  } else {
    const snap = await getDocs(query(collection(db, "tugas_completion"), where("tugas_id", "==", tugas_id), where("anggota_id", "==", anggota_id)));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }
}

// ─── JADWAL ────────────────────────────────────────────────────
export async function createJadwal(data: { hari: number; jam_mulai: string; jam_selesai: string; matkul: string; ruangan?: string | null; dosen?: string | null }) {
  await addDoc(collection(db, "jadwal"), { ...data, created_at: now() });
}

export async function deleteJadwal(id: string) {
  await deleteDoc(doc(db, "jadwal", id));
}

// ─── EVENT AKADEMIK ────────────────────────────────────────────
export async function createEvent(data: { nama: string; tanggal_mulai: string; tanggal_selesai?: string | null; jenis: EventJenis }) {
  await addDoc(collection(db, "event_akademik"), { ...data, created_at: now() });
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(db, "event_akademik", id));
}

// ─── MATERI ────────────────────────────────────────────────────
export async function createMateri(data: { matkul: string; judul: string; link: string }) {
  await addDoc(collection(db, "materi"), { ...data, created_at: now() });
}

export async function deleteMateri(id: string) {
  await deleteDoc(doc(db, "materi", id));
}

// ─── KAS ───────────────────────────────────────────────────────
export async function createKasPeriode(data: { label: string; nominal_per_orang: number }) {
  const ref = await addDoc(collection(db, "kas_periode"), { ...data, created_at: now() });
  // Seed all members with "belum" status
  const membersSnap = await getDocs(collection(db, "anggota"));
  const batch = writeBatch(db);
  membersSnap.docs.forEach((d) => {
    const payRef = doc(collection(db, "kas_pembayaran"));
    batch.set(payRef, { periode_id: ref.id, anggota_id: d.id, status: "belum", jumlah: 0, tanggal: null });
  });
  await batch.commit();
  return ref.id;
}

export async function recordPembayaran(data: { periode_id: string; anggota_id: string; jumlah: number; status: KasStatus }) {
  const existing = await getDocs(query(collection(db, "kas_pembayaran"), where("periode_id", "==", data.periode_id), where("anggota_id", "==", data.anggota_id)));
  const payload = {
    periode_id: data.periode_id, anggota_id: data.anggota_id,
    status: data.status, jumlah: data.status === "lunas" ? data.jumlah : 0,
    tanggal: data.status === "lunas" ? now() : null,
  };
  if (existing.empty) {
    await addDoc(collection(db, "kas_pembayaran"), payload);
  } else {
    await updateDoc(existing.docs[0].ref, payload);
  }
}

export async function recordPengeluaran(data: { deskripsi: string; jumlah: number }) {
  await addDoc(collection(db, "pengeluaran"), { ...data, tanggal: now(), created_at: now() });
}

// ─── FOTO ──────────────────────────────────────────────────────
export async function createFoto(data: { url: string; caption?: string | null; uploader_id?: string | null }) {
  await addDoc(collection(db, "foto"), { ...data, tanggal: now(), created_at: now() });
}

export async function deleteFoto(id: string) {
  await deleteDoc(doc(db, "foto", id));
}

// ─── FORUM ─────────────────────────────────────────────────────
export async function createForumTopik(data: { judul: string; isi: string; author_id: string }) {
  const ref = await addDoc(collection(db, "forum_topik"), { ...data, created_at: now() });
  return ref.id;
}

export async function createForumBalasan(data: { topik_id: string; isi: string; author_id: string }) {
  await addDoc(collection(db, "forum_balasan"), { ...data, created_at: now() });
}

// ─── ANGGOTA ───────────────────────────────────────────────────
export async function createAnggota(data: {
  nama: string; role: AnggotaRole; foto_url?: string | null;
  ig?: string | null; tiktok?: string | null; wa?: string | null;
  email?: string | null; nim?: string | null; panggilan?: string | null;
}) {
  await addDoc(collection(db, "anggota"), { ...data, firebaseUid: null, urutan: null, created_at: now() });
}

export async function updateAnggota(id: string, data: Partial<{
  nama: string; panggilan: string; role: AnggotaRole; email: string;
  nim: string; wa: string; ig: string; tiktok: string; foto_url: string;
  tempat_lahir: string; tgl_lahir: string; hobi: string; motto: string;
}>) {
  await updateDoc(doc(db, "anggota", id), data);
}

export async function deleteAnggota(id: string) {
  await deleteDoc(doc(db, "anggota", id));
}

// ─── NOTIFIKASI ────────────────────────────────────────────────
export async function markNotifRead(id: string, anggota_id: string) {
  const snap = await getDocs(query(collection(db, "notifikasi"), where("anggota_id", "==", anggota_id)));
  const target = snap.docs.find((d) => d.id === id);
  if (target) await updateDoc(target.ref, { terbaca: true });
}

export async function markAllNotifRead(anggota_id: string) {
  const snap = await getDocs(query(collection(db, "notifikasi"), where("anggota_id", "==", anggota_id), where("terbaca", "==", false)));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { terbaca: true }));
  await batch.commit();
}

// ─── POLLING ───────────────────────────────────────────────────
export async function createPolling(data: {
  pertanyaan: string; deskripsi?: string | null; multi?: boolean;
  batas_waktu?: string | null; pilihan: string[]; actor_id: string;
}) {
  const { pilihan, actor_id, ...pollData } = data;
  const ref = await addDoc(collection(db, "polling"), { ...pollData, multi: data.multi ?? false, ditutup: false, author_id: actor_id, created_at: now() });
  const batch = writeBatch(db);
  pilihan.forEach((teks, i) => {
    const pRef = doc(collection(db, "pilihan_polling"));
    batch.set(pRef, { polling_id: ref.id, teks, urutan: i });
  });
  await batch.commit();
  await broadcastNotif({ judul: "Polling baru: " + data.pertanyaan, isi: "Sampaikan suaramu di Balai Suara.", jenis: "polling", link: "/polling", excludeAnggotaId: actor_id });
  return ref.id;
}

export async function deletePolling(id: string) {
  await deleteDoc(doc(db, "polling", id));
}

export async function togglePollingTutup(id: string, ditutup: boolean) {
  await updateDoc(doc(db, "polling", id), { ditutup });
}

export async function castVote(data: { polling_id: string; pilihan_ids: string[]; anggota_id: string }) {
  // Remove existing votes for this poll by this user
  const existingSnap = await getDocs(query(collection(db, "vote"), where("polling_id", "==", data.polling_id), where("anggota_id", "==", data.anggota_id)));
  const batch = writeBatch(db);
  existingSnap.docs.forEach((d) => batch.delete(d.ref));
  data.pilihan_ids.forEach((pilihan_id) => {
    const ref = doc(collection(db, "vote"));
    batch.set(ref, { polling_id: data.polling_id, pilihan_id, anggota_id: data.anggota_id, created_at: now() });
  });
  await batch.commit();
}

// ─── ABSEN SHARE ───────────────────────────────────────────────
export async function shareAbsenLink(data: { jadwal_id: string; tanggal: string; link: string; shared_by: string }) {
  const nowIso = new Date().toISOString();
  const existing = await getDocs(query(collection(db, "absen_share"), where("jadwal_id", "==", data.jadwal_id), where("tanggal", "==", data.tanggal)));
  if (!existing.empty) {
    const ex = existing.docs[0].data();
    if (ex.expires_at > nowIso) throw new Error("Yah, ada yang sudah duluan share link absen sesi ini!");
    await deleteDoc(existing.docs[0].ref);
  }
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await addDoc(collection(db, "absen_share"), { ...data, expires_at: expiresAt, created_at: now() });
  return expiresAt;
}

export async function deleteAbsenShare(id: string) {
  await deleteDoc(doc(db, "absen_share", id));
}
