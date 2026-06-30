import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crest } from "@/components/empire/Crest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, KeyRound, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Masuk Kerajaan — JERUK'S EMPIRE" },
      { name: "description", content: "Masuk ke balairung kerajaan dengan email bangsawan." },
    ],
  }),
  component: AuthPage,
});

type Step = "email" | "otp";

function AuthPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── LANGKAH 1: Kirim OTP setelah cek email di tabel anggota ── */
  const kirimOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      // Cek apakah email terdaftar di silsilah kerajaan
      const { data: anggota, error: cekError } = await supabase
        .from("anggota")
        .select("id, nama")
        .ilike("email", email.trim())
        .maybeSingle();

      if (cekError) throw cekError;

      if (!anggota) {
        toast.error(
          "Email tidak ditemukan dalam daftar bangsawan. Hubungi Admin untuk didaftarkan.",
          { duration: 5000 }
        );
        setLoading(false);
        return;
      }

      // Email cocok → kirim OTP via Supabase
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true, // buat akun auth jika belum ada
        },
      });

      if (error) throw error;

      toast.success(`Kode masuk dikirim ke ${email}. Periksa kotak masuk (atau spam).`);
      setStep("otp");
    } catch (err) {
      toast.error("Gagal: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /* ── LANGKAH 2: Verifikasi OTP ── */
  const verifikasiOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });

      if (error) throw error;

      toast.success("Selamat datang, Bangsawan!");
      window.location.href = "/";
    } catch (err) {
      toast.error("Kode salah atau kedaluwarsa: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-cream via-background to-cream">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Crest size={88} />
        </div>

        {/* Judul */}
        <div>
          <h1 className="font-display text-4xl tracking-tight">
            <span className="text-empire">JERUK'S</span> EMPIRE
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "email"
              ? "Masukkan email bangsawan untuk menerima kode masuk."
              : `Kode 6 digit dikirim ke ${email}`}
          </p>
        </div>

        {/* ── Form Email ── */}
        {step === "email" && (
          <form onSubmit={kirimOtp} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="auth-email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                className="pl-9"
              />
            </div>
            <Button type="submit" disabled={loading} size="lg" className="w-full gap-2">
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> Memeriksa silsilah…</>
              ) : (
                <><Mail className="size-4" /> Kirim Kode Masuk</>
              )}
            </Button>
          </form>
        )}

        {/* ── Form OTP ── */}
        {step === "otp" && (
          <form onSubmit={verifikasiOtp} className="space-y-3">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="auth-otp"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                disabled={loading}
                autoComplete="one-time-code"
                className="pl-9 tracking-widest text-center font-mono text-lg"
                maxLength={6}
              />
            </div>
            <Button type="submit" disabled={loading || otp.length < 6} size="lg" className="w-full gap-2">
              {loading ? (
                <><Loader2 className="size-4 animate-spin" /> Membuka gerbang…</>
              ) : (
                <><KeyRound className="size-4" /> Masuk ke Kerajaan</>
              )}
            </Button>
            <button
              type="button"
              onClick={() => { setStep("email"); setOtp(""); }}
              className="flex items-center gap-1.5 mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3" /> Ganti email
            </button>
          </form>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Hanya bangsawan yang sudah terdaftar oleh Admin yang dapat masuk.
        </p>
      </div>
    </div>
  );
}
