import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { seedFirestoreIfEmpty } from "@/integrations/firebase/seed";
import { Crest } from "@/components/empire/Crest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { auth: fbAuth } = await import("@/integrations/firebase/client");
    if (fbAuth.currentUser) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Masuk Kerajaan — JERUK'S EMPIRE" },
      { name: "description", content: "Masuk ke balairung kerajaan dengan email bangsawan." },
    ],
  }),
  component: AuthPage,
});

const EMAIL_KEY = "jeruks_signin_email";

function AuthPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Handle magic link return (when user clicks email link)
  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;
    const savedEmail = window.localStorage.getItem(EMAIL_KEY);
    if (!savedEmail) return;

    setVerifying(true);
    signInWithEmailLink(auth, savedEmail, window.location.href)
      .then(() => {
        window.localStorage.removeItem(EMAIL_KEY);
        toast.success("Selamat datang, Bangsawan!");
        window.location.href = "/";
      })
      .catch((err) => {
        toast.error("Link tidak valid atau sudah kadaluarsa: " + err.message);
        setVerifying(false);
      });
  }, []);

  const kirimLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      // Seed data if empty (first launch bootstrapping)
      await seedFirestoreIfEmpty();

      // Cek email terdaftar di Firestore anggota
      const snap = await getDocs(
        query(collection(db, "anggota"), where("email", "==", email.trim().toLowerCase()))
      );
      if (snap.empty) {
        toast.error("Email tidak ditemukan dalam daftar bangsawan. Hubungi Admin.", {
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      const actionCodeSettings = {
        url: window.location.origin + "/auth",
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings);
      window.localStorage.setItem(EMAIL_KEY, email.trim());
      setSent(true);
      toast.success(`Link masuk dikirim ke ${email}. Periksa kotak masuk (atau spam).`);
    } catch (err) {
      toast.error("Gagal: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-cream via-background to-cream">
        <div className="text-center space-y-4">
          <Crest size={72} />
          <p className="text-muted-foreground animate-pulse">Membuka gerbang kerajaan…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-cream via-background to-cream">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <Crest size={88} />
        </div>

        <div>
          <h1 className="font-display text-4xl tracking-tight">
            <span className="text-empire">JERUK'S</span> EMPIRE
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {sent
              ? "Periksa email kamu dan klik link yang dikirim."
              : "Masukkan email bangsawan untuk menerima link masuk."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={kirimLink} className="space-y-3">
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
                <><Mail className="size-4" /> Kirim Link Masuk</>
              )}
            </Button>
          </form>
        ) : (
          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <CheckCircle2 className="size-10 text-empire mx-auto" />
            <p className="text-sm font-medium">Link dikirim ke</p>
            <p className="font-mono text-sm text-empire break-all">{email}</p>
            <p className="text-xs text-muted-foreground">
              Klik link di email untuk masuk. Cek folder spam jika tidak muncul.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Ganti email
            </button>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Hanya bangsawan yang sudah terdaftar oleh Admin yang dapat masuk.
        </p>
      </div>
    </div>
  );
}
