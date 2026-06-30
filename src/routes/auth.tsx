import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { seedFirestoreIfEmpty } from "@/integrations/firebase/seed";
import { Crest } from "@/components/empire/Crest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Key, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { auth: fbAuth } = await import("@/integrations/firebase/client");
    if (fbAuth.currentUser) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Masuk Kerajaan — JERUK'S EMPIRE" },
      { name: "description", content: "Masuk ke balairung kerajaan dengan akun bangsawan." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password.length < 6) {
      return toast.error("Password minimal harus 6 karakter.");
    }

    setLoading(true);
    try {
      // Seed data if empty (first launch bootstrapping)
      await seedFirestoreIfEmpty();

      const normalizedEmail = email.trim().toLowerCase();

      // Cek apakah email terdaftar di silsilah bangsawan
      const snap = await getDocs(
        query(collection(db, "anggota"), where("email", "==", normalizedEmail))
      );

      if (snap.empty) {
        toast.error("Email tidak terdaftar sebagai bangsawan. Hubungi Admin.", {
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      const docId = snap.docs[0].id;
      const memberData = snap.docs[0].data();
      const existingUid = memberData.firebaseUid;

      if (!existingUid) {
        // Pendaftaran pertama: daftarkan akun baru di Firebase Auth
        toast.info("Mendaftarkan sandi pertama kali untuk email Anda...");
        try {
          const userCred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          // Tautkan UID ke dokumen anggota di Firestore
          await updateDoc(doc(db, "anggota", docId), {
            firebaseUid: userCred.user.uid,
          });
          toast.success("Pendaftaran berhasil! Selamat datang di Kerajaan.");
          window.location.href = "/";
        } catch (authErr: any) {
          // Jika ternyata akun auth sudah ada tapi di firestore belum tertaut
          if (authErr.code === "auth/email-already-in-use") {
            try {
              // Coba langsung login dengan password tersebut
              const userCred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
              await updateDoc(doc(db, "anggota", docId), {
                firebaseUid: userCred.user.uid,
              });
              toast.success("Akun ditautkan! Selamat datang kembali.");
              window.location.href = "/";
            } catch (loginErr) {
              toast.error("Sandi salah untuk akun yang sudah terdaftar.");
            }
          } else {
            throw authErr;
          }
        }
      } else {
        // Login biasa
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
        toast.success("Selamat datang kembali, Bangsawan!");
        window.location.href = "/";
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message;
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        errMsg = "Sandi salah. Coba lagi atau hubungi Admin jika lupa.";
      }
      toast.error("Gagal masuk: " + errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-cream via-background to-cream">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <img src="/logo.png" alt="Jeruk's Empire Logo" className="size-24 object-contain" />
        </div>

        <div>
          <h1 className="font-display text-4xl tracking-tight">
            <span className="text-empire">JERUK'S</span> EMPIRE
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk dengan email bangsawan dan sandi pilihan Anda.
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <Label htmlFor="auth-email">Email</Label>
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="auth-password">Sandi (Password)</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="auth-password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="pl-9"
              />
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal mt-1">
              *Jika baru pertama kali masuk, sandi yang Anda ketikkan otomatis menjadi sandi tetap Anda.
            </p>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full gap-2 mt-2">
            {loading ? (
              <><Loader2 className="size-4 animate-spin" /> Membuka gerbang...</>
            ) : (
              "Masuk Kerajaan"
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Hubungi Admin jika lupa sandi untuk memutuskan tautan akun Anda agar dapat didaftarkan sandi baru.
        </p>
      </div>
    </div>
  );
}
