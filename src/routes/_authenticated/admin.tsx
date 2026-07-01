import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Shield, Crown, Pencil } from "lucide-react";
import { auth, db } from "@/integrations/firebase/client";
import { query, collection, where, getDocs } from "firebase/firestore";
import { useActiveMember, isAdmin } from "@/lib/active-member";
import { anggotaListQuery } from "@/lib/queries";
import { updateAnggota } from "@/lib/empire.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Anggota } from "@/integrations/firebase/types";

const ROLE_LABEL: Record<string, string> = {
  manager: "Manager (Admin)",
  yang_mulia: "Yang Mulia",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  bangsawan: "Bangsawan",
};

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { auth: fbAuth, db: fbDb } = await import("@/integrations/firebase/client");
    const user = fbAuth.currentUser;
    if (!user) throw redirect({ to: "/auth" });
    const { query, collection, where, getDocs } = await import("firebase/firestore");
    const q = query(collection(fbDb, "anggota"), where("firebaseUid", "==", user.uid));
    const snap = await getDocs(q);
    if (snap.empty) throw redirect({ to: "/" });
    const role = snap.docs[0].data().role;
    if (role !== "manager" && role !== "yang_mulia") {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Balai Admin — JERUK'S EMPIRE" },
      { name: "description", content: "Kelola bangsawan dan persetujuan akses." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { member } = useActiveMember();
  const { data: anggotaList = [] } = useQuery(anggotaListQuery);
  const [editTarget, setEditTarget] = useState<Anggota | null>(null);

  if (!isAdmin(member?.role)) return null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-empire flex items-center gap-2">
          <Shield className="size-7 text-plum" /> Balai Admin
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola data bangsawan kerajaan.
        </p>
      </header>

      {/* Anggota */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-4 py-3 bg-empire/10 border-b">
          <h2 className="font-display text-xl text-empire">Silsilah Bangsawan</h2>
          <p className="text-xs text-muted-foreground">
            Klik kursi untuk ubah peran, data, atau lepaskan tautan akun.
          </p>
        </div>
        <ul className="divide-y divide-border/60">
          {anggotaList.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-4 py-3">
              {a.foto_url ? (
                <img src={a.foto_url} alt="" className="size-10 rounded-full object-cover bg-cream" />
              ) : (
                <div className="size-10 rounded-full bg-cream flex items-center justify-center text-xs text-muted-foreground font-bold">
                  {a.panggilan ? a.panggilan.slice(0, 2).toUpperCase() : "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate flex items-center gap-1.5">
                  {a.role === "manager" && <Shield className="size-3.5 text-plum" />}
                  {a.role === "yang_mulia" && <img src="/logo.png" alt="Yang Mulia" className="size-4 object-contain drop-shadow-sm" />}
                  {a.nama}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {ROLE_LABEL[a.role]}
                  {a.email && ` · ${a.email}`}
                  {a.firebaseUid ? " · ✓ tertaut" : " · belum tertaut"}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setEditTarget(a)} className="gap-1">
                <Pencil className="size-3.5" /> Ubah
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {editTarget && <EditDialog anggota={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  );
}

function EditDialog({ anggota, onClose }: { anggota: Anggota; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nama: anggota.nama,
    panggilan: anggota.panggilan ?? "",
    role: anggota.role,
    email: anggota.email ?? "",
    nim: anggota.nim ?? "",
    wa: anggota.wa ?? "",
    ig: anggota.ig ?? "",
    tiktok: anggota.tiktok ?? "",
    foto_url: anggota.foto_url ?? "",
    tempat_lahir: anggota.tempat_lahir ?? "",
    tgl_lahir: anggota.tgl_lahir ?? "",
    hobi: anggota.hobi ?? "",
    motto: anggota.motto ?? "",
  });

  const mut = useMutation({
    mutationFn: async () => {
      await updateAnggota(anggota.id, {
        ...form,
        email: form.email || null,
        tgl_lahir: form.tgl_lahir || null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["anggota"] });
      toast.success("Data bangsawan diperbarui.");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const unlink = useMutation({
    mutationFn: async () => {
      await updateAnggota(anggota.id, { firebaseUid: null });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["anggota"] });
      toast.success("Akun Google/Firebase dilepaskan dari kursi.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-empire">Ubah Bangsawan</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nama Lengkap">
              <Input value={form.nama} onChange={(e) => set("nama", e.target.value)} />
            </Field>
            <Field label="Panggilan">
              <Input value={form.panggilan} onChange={(e) => set("panggilan", e.target.value)} />
            </Field>
          </div>
          <Field label="Peran">
            <Select
              value={form.role}
              onValueChange={(v) => set("role", v as typeof form.role)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABEL).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nama@gmail.com" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="NIM">
              <Input value={form.nim} onChange={(e) => set("nim", e.target.value)} />
            </Field>
            <Field label="No WA">
              <Input value={form.wa} onChange={(e) => set("wa", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Instagram">
              <Input value={form.ig} onChange={(e) => set("ig", e.target.value)} />
            </Field>
            <Field label="TikTok">
              <Input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} />
            </Field>
          </div>
          <Field label="Foto URL">
            <Input value={form.foto_url} onChange={(e) => set("foto_url", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tempat Lahir">
              <Input value={form.tempat_lahir} onChange={(e) => set("tempat_lahir", e.target.value)} />
            </Field>
            <Field label="Tanggal Lahir">
              <Input type="date" value={form.tgl_lahir} onChange={(e) => set("tgl_lahir", e.target.value)} />
            </Field>
          </div>
          <Field label="Hobi">
            <Input value={form.hobi} onChange={(e) => set("hobi", e.target.value)} />
          </Field>
          <Field label="Motto">
            <Input value={form.motto} onChange={(e) => set("motto", e.target.value)} />
          </Field>
          {anggota.firebaseUid && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => unlink.mutate()}
              disabled={unlink.isPending}
              className="w-full text-destructive"
            >
              Lepaskan tautan akun Google/Firebase
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
