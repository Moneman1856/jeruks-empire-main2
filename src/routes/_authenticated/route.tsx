import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/integrations/firebase/client";
import { seedFirestoreIfEmpty } from "@/integrations/firebase/seed";
import { AppShell } from "@/components/empire/AppShell";
import { Crest } from "@/components/empire/Crest";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { hasCompletedTour, startTour } from "@/lib/onboarding-tour";
import { signOut } from "firebase/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await new Promise<import("firebase/auth").User | null>((resolve) => {
      const unsub = onAuthStateChanged(auth, (u) => { unsub(); resolve(u); });
    });
    if (!user) {
      const { redirect } = await import("@tanstack/react-router");
      throw redirect({ to: "/auth" });
    }
    return { user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const [checking, setChecking] = useState(true);
  const [hasMember, setHasMember] = useState(false);

  const { refetch } = useQuery({
    queryKey: ["membership-check", user.uid],
    queryFn: async () => {
      // Seed data if Firestore is empty (first launch)
      await seedFirestoreIfEmpty();

      const email = user.email?.toLowerCase() ?? "";
      const byUid = query(collection(db, "anggota"), where("firebaseUid", "==", user.uid));
      const snapUid = await getDocs(byUid);
      if (!snapUid.empty) { setHasMember(true); setChecking(false); return true; }

      const byEmail = query(collection(db, "anggota"), where("email", "==", email));
      const snapEmail = await getDocs(byEmail);
      const found = !snapEmail.empty;
      setHasMember(found);
      setChecking(false);
      return found;
    },
  });

  // Poll every 8s while not yet a member
  useEffect(() => {
    if (hasMember || checking) return;
    const t = setInterval(() => refetch(), 8000);
    return () => clearInterval(t);
  }, [hasMember, checking, refetch]);

  // Start onboarding tour on first visit
  useEffect(() => {
    if (!hasMember || checking) return;
    if (hasCompletedTour()) return;
    const t = setTimeout(() => startTour(), 700);
    return () => clearTimeout(t);
  }, [hasMember, checking]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src="/logo.png" alt="Logo" className="size-16 object-contain" />
      </div>
    );
  }

  if (!hasMember) {
    return <PendingScreen email={user.email ?? ""} />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function PendingScreen({ email }: { email: string }) {
  const handleSignOut = async () => {
    await signOut(auth);
    window.location.href = "/auth";
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-cream via-background to-cream">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="flex justify-center">
          <img src="/logo.png" alt="Logo" className="size-20 object-contain" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-zest/20 px-3 py-1 text-xs font-medium text-rind">
          <Clock className="size-3.5" /> Menanti persetujuan Admin
        </div>
        <h1 className="font-display text-3xl text-empire">Tunggu sejenak, Calon Bangsawan</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Akun <span className="font-mono text-foreground">{email}</span> belum
          terdaftar di silsilah kerajaan. Hubungi Admin untuk didaftarkan.
          Halaman ini akan terbuka otomatis begitu disetujui.
        </p>
        <Button variant="outline" onClick={handleSignOut} className="gap-2">
          <LogOut className="size-4" /> Keluar
        </Button>
      </div>
    </div>
  );
}
