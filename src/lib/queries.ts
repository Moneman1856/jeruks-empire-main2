import { queryOptions } from "@tanstack/react-query";
import {
  collection, getDocs, query, orderBy, where, limit,
  doc, getDoc,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import type {
  Anggota, Titah, Tugas, TugasCompletion, Jadwal, AbsenShare,
  EventAkademik, Materi, KasPeriode, KasPembayaran, Pengeluaran,
  Foto, ForumTopik, ForumBalasan, Polling, PilihanPolling, Vote, Notifikasi,
} from "@/integrations/firebase/types";

// Helper: convert Firestore snapshot to typed array with id
function snap<T>(s: import("firebase/firestore").QuerySnapshot): (T & { id: string })[] {
  return s.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }));
}

// ─── ANGGOTA ───────────────────────────────────────────────────
export const anggotaListQuery = queryOptions({
  queryKey: ["anggota", "list"],
  queryFn: async (): Promise<Anggota[]> => {
    const s = await getDocs(query(collection(db, "anggota"), orderBy("urutan")));
    return snap<Anggota>(s);
  },
});

// ─── TITAH ─────────────────────────────────────────────────────
export const titahListQuery = queryOptions({
  queryKey: ["titah", "list"],
  queryFn: async (): Promise<Titah[]> => {
    const s = await getDocs(query(collection(db, "titah"), orderBy("pinned", "desc"), orderBy("tanggal", "desc")));
    const rows = snap<Titah>(s);
    // Attach author names
    const anggotaSnap = await getDocs(collection(db, "anggota"));
    const anggotaMap = new Map(anggotaSnap.docs.map((d) => [d.id, d.data().nama as string]));
    return rows.map((t) => ({ ...t, author: t.author_id ? { nama: anggotaMap.get(t.author_id) ?? "?" } : null }));
  },
});

// ─── TUGAS ─────────────────────────────────────────────────────
export const tugasListQuery = queryOptions({
  queryKey: ["tugas", "list"],
  queryFn: async (): Promise<Tugas[]> => {
    const s = await getDocs(query(collection(db, "tugas"), orderBy("deadline")));
    return snap<Tugas>(s);
  },
});

export const completionListQuery = queryOptions({
  queryKey: ["tugas_completion", "list"],
  queryFn: async (): Promise<TugasCompletion[]> => {
    const s = await getDocs(collection(db, "tugas_completion"));
    return snap<TugasCompletion>(s);
  },
});

// ─── JADWAL ────────────────────────────────────────────────────
export const jadwalListQuery = queryOptions({
  queryKey: ["jadwal", "list"],
  queryFn: async (): Promise<Jadwal[]> => {
    const s = await getDocs(query(collection(db, "jadwal"), orderBy("hari"), orderBy("jam_mulai")));
    return snap<Jadwal>(s);
  },
});

// ─── ABSEN SHARE ───────────────────────────────────────────────
export const absenShareListQuery = queryOptions({
  queryKey: ["absen_share", "list"],
  queryFn: async (): Promise<AbsenShare[]> => {
    const [absenSnap, anggotaSnap, jadwalSnap] = await Promise.all([
      getDocs(query(collection(db, "absen_share"), orderBy("created_at", "desc"), limit(50))),
      getDocs(collection(db, "anggota")),
      getDocs(collection(db, "jadwal")),
    ]);
    const anggotaMap = new Map(anggotaSnap.docs.map((d) => [d.id, d.data()]));
    const jadwalMap = new Map(jadwalSnap.docs.map((d) => [d.id, d.data()]));
    return absenSnap.docs.map((d) => {
      const data = d.data() as AbsenShare;
      const a = data.shared_by ? anggotaMap.get(data.shared_by) : null;
      const j = data.jadwal_id ? jadwalMap.get(data.jadwal_id) : null;
      return {
        ...data,
        id: d.id,
        anggota: a ? { nama: a.nama, panggilan: a.panggilan, foto_url: a.foto_url } : null,
        jadwal: j ? { matkul: j.matkul, dosen: j.dosen, ruangan: j.ruangan, hari: j.hari, jam_mulai: j.jam_mulai } : null,
      };
    });
  },
});

// ─── EVENT AKADEMIK ────────────────────────────────────────────
export const eventListQuery = queryOptions({
  queryKey: ["event_akademik", "list"],
  queryFn: async (): Promise<EventAkademik[]> => {
    const s = await getDocs(query(collection(db, "event_akademik"), orderBy("tanggal_mulai")));
    return snap<EventAkademik>(s);
  },
});

// ─── MATERI ────────────────────────────────────────────────────
export const materiListQuery = queryOptions({
  queryKey: ["materi", "list"],
  queryFn: async (): Promise<Materi[]> => {
    const s = await getDocs(query(collection(db, "materi"), orderBy("matkul"), orderBy("created_at", "desc")));
    return snap<Materi>(s);
  },
});

// ─── KAS ───────────────────────────────────────────────────────
export const kasPeriodeListQuery = queryOptions({
  queryKey: ["kas_periode", "list"],
  queryFn: async (): Promise<KasPeriode[]> => {
    const s = await getDocs(query(collection(db, "kas_periode"), orderBy("created_at", "desc")));
    return snap<KasPeriode>(s);
  },
});

export const kasPembayaranListQuery = queryOptions({
  queryKey: ["kas_pembayaran", "list"],
  queryFn: async (): Promise<KasPembayaran[]> => {
    const [paySnap, anggotaSnap] = await Promise.all([
      getDocs(collection(db, "kas_pembayaran")),
      getDocs(query(collection(db, "anggota"), orderBy("urutan"))),
    ]);
    const anggotaMap = new Map(anggotaSnap.docs.map((d) => [d.id, d.data()]));
    return paySnap.docs.map((d) => {
      const data = d.data() as KasPembayaran;
      const a = data.anggota_id ? anggotaMap.get(data.anggota_id) : null;
      return { ...data, id: d.id, anggota: a ? { nama: a.nama, role: a.role } : null };
    });
  },
});

export const pengeluaranListQuery = queryOptions({
  queryKey: ["pengeluaran", "list"],
  queryFn: async (): Promise<Pengeluaran[]> => {
    const s = await getDocs(query(collection(db, "pengeluaran"), orderBy("tanggal", "desc")));
    return snap<Pengeluaran>(s);
  },
});

// ─── PENDING AKSES (no-op — not used with Firebase) ────────────
export const pendingAksesListQuery = queryOptions({
  queryKey: ["pending_akses", "list"],
  queryFn: async () => [] as never[],
});

// ─── FOTO ──────────────────────────────────────────────────────
export const fotoListQuery = queryOptions({
  queryKey: ["foto", "list"],
  queryFn: async (): Promise<Foto[]> => {
    const [fotoSnap, anggotaSnap] = await Promise.all([
      getDocs(query(collection(db, "foto"), orderBy("tanggal", "desc"))),
      getDocs(collection(db, "anggota")),
    ]);
    const anggotaMap = new Map(anggotaSnap.docs.map((d) => [d.id, d.data().nama as string]));
    return fotoSnap.docs.map((d) => {
      const data = d.data() as Foto;
      return { ...data, id: d.id, uploader: data.uploader_id ? { nama: anggotaMap.get(data.uploader_id) ?? "?" } : null };
    });
  },
});

// ─── FORUM ─────────────────────────────────────────────────────
export const forumTopikListQuery = queryOptions({
  queryKey: ["forum_topik", "list"],
  queryFn: async (): Promise<ForumTopik[]> => {
    const [topikSnap, anggotaSnap, balasanSnap] = await Promise.all([
      getDocs(query(collection(db, "forum_topik"), orderBy("created_at", "desc"))),
      getDocs(collection(db, "anggota")),
      getDocs(collection(db, "forum_balasan")),
    ]);
    const anggotaMap = new Map(anggotaSnap.docs.map((d) => [d.id, d.data().nama as string]));
    const balasanCount = new Map<string, number>();
    balasanSnap.docs.forEach((d) => {
      const tid = (d.data() as ForumBalasan).topik_id;
      balasanCount.set(tid, (balasanCount.get(tid) ?? 0) + 1);
    });
    return topikSnap.docs.map((d) => {
      const data = d.data() as ForumTopik;
      return {
        ...data, id: d.id,
        author: data.author_id ? { nama: anggotaMap.get(data.author_id) ?? "?" } : null,
        balasan: [{ count: balasanCount.get(d.id) ?? 0 }],
      };
    });
  },
});

export const forumTopikDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["forum_topik", id],
    queryFn: async () => {
      const [topikDoc, balasanSnap, anggotaSnap] = await Promise.all([
        getDoc(doc(db, "forum_topik", id)),
        getDocs(query(collection(db, "forum_balasan"), where("topik_id", "==", id), orderBy("created_at"))),
        getDocs(collection(db, "anggota")),
      ]);
      if (!topikDoc.exists()) return { topik: null, balasan: [] };
      const anggotaMap = new Map(anggotaSnap.docs.map((d) => [d.id, d.data().nama as string]));
      const topik = { id: topikDoc.id, ...topikDoc.data() } as ForumTopik;
      const balasan = balasanSnap.docs.map((d) => {
        const b = { id: d.id, ...d.data() } as ForumBalasan;
        return { ...b, author: b.author_id ? { nama: anggotaMap.get(b.author_id) ?? "?" } : null };
      });
      return {
        topik: { ...topik, author: topik.author_id ? { nama: anggotaMap.get(topik.author_id) ?? "?" } : null },
        balasan,
      };
    },
  });

// ─── POLLING ───────────────────────────────────────────────────
export const pollingListQuery = queryOptions({
  queryKey: ["polling", "list"],
  queryFn: async (): Promise<Polling[]> => {
    const [pollSnap, anggotaSnap, pilihanSnap, voteSnap] = await Promise.all([
      getDocs(query(collection(db, "polling"), orderBy("created_at", "desc"))),
      getDocs(collection(db, "anggota")),
      getDocs(collection(db, "pilihan_polling")),
      getDocs(collection(db, "vote")),
    ]);
    const anggotaMap = new Map(anggotaSnap.docs.map((d) => [d.id, d.data().nama as string]));
    const pilihanMap = new Map<string, PilihanPolling[]>();
    pilihanSnap.docs.forEach((d) => {
      const p = { id: d.id, ...d.data() } as PilihanPolling;
      if (!pilihanMap.has(p.polling_id)) pilihanMap.set(p.polling_id, []);
      pilihanMap.get(p.polling_id)!.push(p);
    });
    const voteMap = new Map<string, Vote[]>();
    voteSnap.docs.forEach((d) => {
      const v = { id: d.id, ...d.data() } as Vote;
      if (!voteMap.has(v.polling_id)) voteMap.set(v.polling_id, []);
      voteMap.get(v.polling_id)!.push(v);
    });
    return pollSnap.docs.map((d) => {
      const p = { id: d.id, ...d.data() } as Polling;
      return {
        ...p,
        author: p.author_id ? { nama: anggotaMap.get(p.author_id) ?? "?" } : null,
        pilihan: (pilihanMap.get(d.id) ?? []).sort((a, b) => a.urutan - b.urutan),
        vote: voteMap.get(d.id) ?? [],
      };
    });
  },
});

// ─── NOTIFIKASI ────────────────────────────────────────────────
export const notifikasiListQuery = (anggotaId: string | null | undefined) =>
  queryOptions({
    queryKey: ["notifikasi", anggotaId ?? "none"],
    enabled: !!anggotaId,
    queryFn: async (): Promise<Notifikasi[]> => {
      if (!anggotaId) return [];
      const s = await getDocs(
        query(
          collection(db, "notifikasi"),
          where("anggota_id", "==", anggotaId),
          orderBy("created_at", "desc"),
          limit(30)
        )
      );
      return snap<Notifikasi>(s);
    },
  });
