import Shepherd from "shepherd.js";

const TOUR_KEY = "empire-tour-completed-v2";

export function hasCompletedTour(): boolean {
  try {
    return localStorage.getItem(TOUR_KEY) === "1";
  } catch {
    return true;
  }
}

export function markTourCompleted() {
  try { localStorage.setItem(TOUR_KEY, "1"); } catch {}
}

function makeTour() {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      cancelIcon: { enabled: true },
      scrollTo: { behavior: "smooth", block: "center" },
      classes: "empire-shepherd",
      arrow: true,
    },
  });

  const skip = { text: "Lewati", action: () => tour.cancel(), classes: "shepherd-button-secondary" };
  const next = { text: "Lanjut →", action: () => tour.next() };
  const back = { text: "← Kembali", action: () => tour.back(), classes: "shepherd-button-secondary" };
  const done = { text: "✓ Selesai", action: () => tour.complete() };

  // ── BERANDA ──────────────────────────────────────────────
  tour.addStep({
    id: "beranda-welcome",
    title: "👑 Selamat datang di Jeruk's Empire!",
    text: "Ini adalah <b>Beranda</b> kerajaan — pusat informasi harianmu. Di sini kamu bisa melihat ringkasan semua hal penting dalam satu tampilan.",
    buttons: [skip, next],
  });

  tour.addStep({
    id: "beranda-quickaction",
    title: "⚡ Aksi Cepat",
    text: "<b>Absen Cepat</b> — buka QR Code absen untuk dibagikan ke teman-teman.<br><b>Drive Tugas</b> — langsung ke folder Google Drive pengumpulan tugas.<br><b>Discord Kelas</b> — gabung server obrolan kelas.",
    attachTo: { element: '[data-tour="quick-actions"]', on: "bottom" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "beranda-titah",
    title: "📌 Titah Mingguan",
    text: "Pengumuman atau pesan penting dari pengurus kelas akan muncul di sini dan tetap terpin di atas. Yang Mulia atau Sekretaris bisa menambahkan titah baru.",
    attachTo: { element: '[data-tour="titah"]', on: "bottom" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "beranda-summary",
    title: "📊 Ringkasan Harian",
    text: "<b>Countdown UAS</b> — hitung mundur menuju ujian akhir semester.<br><b>Countdown Ulang Tahun</b> — siapa yang ultah berikutnya?<br><b>Perbendaharaan</b> — saldo kas kelas real-time.<br><b>Deadline Terdekat</b> — tugas yang harus segera dikumpulkan.",
    attachTo: { element: '[data-tour="summary-grid"]', on: "top" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "beranda-jadwal",
    title: "📅 Jadwal Hari Ini",
    text: "Di sini tampil mata kuliah yang ada <b>hari ini saja</b>, lengkap dengan jam, ruangan, dan nama dosen. Untuk melihat jadwal seluruh minggu, buka menu <b>Almanak</b>.",
    attachTo: { element: '[data-tour="jadwal"]', on: "top" },
    buttons: [back, next],
  });

  // ── SIDEBAR NAVIGATION ─────────────────────────────────
  tour.addStep({
    id: "nav-almanak",
    title: "🗓️ Almanak",
    text: "Lihat <b>jadwal kuliah mingguan</b> lengkap per hari dan <b>kalender akademik</b> berisi jadwal UTS, UAS, libur, dan agenda kelas.",
    attachTo: { element: '[data-tour="nav"]', on: "right" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "nav-absen",
    title: "✅ Absen",
    text: "Buat sesi absen dengan QR Code yang bisa dibagikan. Teman-teman scan QR lalu nama mereka otomatis tercatat. Lihat juga rekap absensi per matkul.",
    attachTo: { element: '[data-tour="nav"]', on: "right" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "nav-tugas",
    title: "📋 Balai Tugas",
    text: "Pantau daftar tugas kelas beserta <b>deadline</b> dan <b>status penyelesaian</b>. Admin bisa menambah, mengedit, dan menandai tugas sebagai selesai.",
    attachTo: { element: '[data-tour="nav"]', on: "right" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "nav-materi",
    title: "📚 Bank Materi",
    text: "Simpan dan bagikan <b>link slide, PDF, atau catatan</b> per mata kuliah. Teman-teman bisa langsung akses materi kuliah kapan saja.",
    attachTo: { element: '[data-tour="nav"]', on: "right" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "nav-perbendaharaan",
    title: "💰 Perbendaharaan",
    text: "Kelola <b>kas kelas</b> secara transparan — catat pembayaran anggota, pengeluaran, dan lihat saldo terkini. Termasuk laporan status bayar tiap orang.",
    attachTo: { element: '[data-tour="nav"]', on: "right" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "nav-bangsawan",
    title: "👥 Para Bangsawan",
    text: "Direktori anggota kelas lengkap. <b>Klik kartu</b> siapapun untuk lihat profil lengkapnya: foto, NIM, TTL, hobi, motto, dan link media sosial mereka.",
    attachTo: { element: '[data-tour="nav"]', on: "right" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "nav-forum",
    title: "💬 Forum",
    text: "Tempat diskusi santai antar anggota kelas. Buat topik baru, balas komentar, dan bertukar pikiran layaknya musyawarah kerajaan.",
    attachTo: { element: '[data-tour="nav"]', on: "right" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "nav-kenangan",
    title: "🖼️ Balai Kenangan",
    text: "Galeri foto dan momen bersama kelas TI. Upload kenangan indah selama kuliah untuk dikenang bersama.",
    attachTo: { element: '[data-tour="nav"]', on: "right" },
    buttons: [back, next],
  });

  tour.addStep({
    id: "theme-tour",
    title: "🎨 Ganti Tema Tampilan",
    text: "Bosan tampilan default? Klik ikon ini untuk beralih ke tema <b>Cyber Orange</b> (gelap futuristik) atau <b>Cinematic Dark</b> (hitam elegan ala Netflix).",
    attachTo: { element: '[data-tour="theme"]', on: "top" },
    buttons: [back, done],
  });

  const cleanup = () => { (window as any).__empireTourActive = false; };
  tour.on("complete", () => { markTourCompleted(); cleanup(); });
  tour.on("cancel", () => { markTourCompleted(); cleanup(); });

  return tour;
}

export function startTour() {
  if ((window as any).__empireTourActive) return;
  (window as any).__empireTourActive = true;
  makeTour().start();
}
