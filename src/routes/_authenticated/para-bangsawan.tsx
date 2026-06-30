import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Crown, Instagram, MessageCircle, Plus, Music2 } from "lucide-react";
import { anggotaListQuery } from "@/lib/queries";
import { createAnggota } from "@/lib/empire.functions";
import { useActiveMember, canManageMembers } from "@/lib/active-member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/para-bangsawan")({
  head: () => ({
    meta: [
      { title: "Para Bangsawan — JERUK'S EMPIRE" },
      { name: "description", content: "Direktori anggota kelas TI dan jabatan kerajaannya." },
      { property: "og:title", content: "Para Bangsawan — JERUK'S EMPIRE" },
      { property: "og:description", content: "Direktori anggota kelas." },
    ],
  }),
  component: ParaBangsawan,
});

const roleLabel: Record<string, string> = {
  manager: "Manager (Admin)",
  yang_mulia: "Yang Mulia",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  bangsawan: "Bangsawan",
};

function ParaBangsawan() {
  const qc = useQueryClient();
  const { data: anggota } = useQuery(anggotaListQuery);
  const { member } = useActiveMember();
  const canManage = canManageMembers(member?.role);
  const mut = useMutation({
    mutationFn: (input: {
      nama: string;
      role: "yang_mulia" | "bendahara" | "sekretaris" | "bangsawan";
      foto_url?: string | null;
      ig?: string | null;
      tiktok?: string | null;
      wa?: string | null;
    }) => createAnggota(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["anggota"] });
      toast.success("Bangsawan baru disambut di kerajaan.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-empire">Para Bangsawan</h1>
          <p className="text-sm text-muted-foreground">
            Daftar penghuni kerajaan.
            {!canManage && " Hanya Yang Mulia / Sekretaris yang berhak menambah."}
          </p>
        </div>
        {canManage && member && (
          <TambahDialog onSubmit={(d) => mut.mutate(d)} />
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {anggota?.map((a) => {
          const isYM = a.role === "yang_mulia";
          return (
            <Dialog key={a.id}>
              <DialogTrigger asChild>
                <article
                  className={`rounded-2xl border bg-card p-4 flex gap-3 cursor-pointer transition-all hover:shadow-md hover:border-empire/50 ${isYM ? "border-plum/40" : ""}`}
                >
                  <div className="size-16 rounded-full bg-cream shrink-0 overflow-hidden">
                    {a.foto_url ? <img src={a.foto_url} alt={a.nama} className="size-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-medium truncate">{a.nama}</h3>
                      {isYM && <Crown className="size-4 text-plum" />}
                    </div>
                    <p className={`text-xs ${isYM ? "text-plum font-medium" : "text-muted-foreground"}`}>
                      {roleLabel[a.role]}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      {a.ig && (
                        <span className="inline-flex items-center gap-1">
                          <Instagram className="size-3" /> @{a.ig.replace(/^@/, "")}
                        </span>
                      )}
                      {a.tiktok && (
                        <span className="inline-flex items-center gap-1">
                          <Music2 className="size-3" /> @{a.tiktok.replace(/^@/, "")}
                        </span>
                      )}
                      {a.wa && (
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="size-3" /> WA
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center font-display text-2xl text-empire">Profil Bangsawan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="size-24 rounded-full bg-cream overflow-hidden border-2 border-empire/20">
                      {a.foto_url ? <img src={a.foto_url} alt={a.nama} className="size-full object-cover" /> : null}
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <h3 className="font-medium text-lg">{a.nama}</h3>
                        {isYM && <Crown className="size-5 text-plum" />}
                      </div>
                      <p className={`text-sm ${isYM ? "text-plum font-medium" : "text-muted-foreground"}`}>
                        {roleLabel[a.role]} {a.panggilan ? `• Akrab disapa "${a.panggilan}"` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-accent/50 p-4 text-sm">
                    {a.nim && (
                      <div>
                        <span className="text-muted-foreground block text-xs">Nomor Induk (NIM)</span>
                        <span className="font-mono">{a.nim}</span>
                      </div>
                    )}
                    {(a.tempat_lahir || a.tgl_lahir) && (
                      <div>
                        <span className="text-muted-foreground block text-xs">Tempat, Tgl Lahir</span>
                        <span>{a.tempat_lahir || "?"}, {a.tgl_lahir || "?"}</span>
                      </div>
                    )}
                    {a.hobi && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground block text-xs">Kegemaran (Hobi)</span>
                        <span>{a.hobi}</span>
                      </div>
                    )}
                    {a.motto && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground block text-xs">Semboyan Hidup (Motto)</span>
                        <span className="italic">"{a.motto}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-2">
                    {a.ig && (
                      <a
                        href={`https://instagram.com/${a.ig.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm hover:bg-empire hover:text-empire-foreground transition-colors"
                      >
                        <Instagram className="size-4" /> IG
                      </a>
                    )}
                    {a.tiktok && (
                      <a
                        href={`https://tiktok.com/@${a.tiktok.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm hover:bg-empire hover:text-empire-foreground transition-colors"
                      >
                        <Music2 className="size-4" /> TikTok
                      </a>
                    )}
                    {a.wa && (
                      <a
                        href={`https://wa.me/${a.wa.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm hover:bg-empire hover:text-empire-foreground transition-colors"
                      >
                        <MessageCircle className="size-4" /> Chat
                      </a>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}

function TambahDialog({
  onSubmit,
}: {
  onSubmit: (d: {
    nama: string;
    role: "yang_mulia" | "bendahara" | "sekretaris" | "bangsawan";
    foto_url?: string | null;
    ig?: string | null;
    tiktok?: string | null;
    wa?: string | null;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [role, setRole] = useState<"yang_mulia" | "bendahara" | "sekretaris" | "bangsawan">("bangsawan");
  const [foto, setFoto] = useState("");
  const [ig, setIg] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [wa, setWa] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" /> Tambah Anggota
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-empire">Sambut Bangsawan Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Nama</Label>
            <Input value={nama} onChange={(e) => setNama(e.target.value)} />
          </div>
          <div>
            <Label>Peran</Label>
            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bangsawan">Bangsawan</SelectItem>
                <SelectItem value="bendahara">Bendahara</SelectItem>
                <SelectItem value="sekretaris">Sekretaris</SelectItem>
                <SelectItem value="yang_mulia">Yang Mulia (Ketua)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Foto (URL, opsional)</Label>
            <Input value={foto} onChange={(e) => setFoto(e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>IG</Label>
              <Input value={ig} onChange={(e) => setIg(e.target.value)} placeholder="username" />
            </div>
            <div>
              <Label>TikTok</Label>
              <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="username" />
            </div>
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input value={wa} onChange={(e) => setWa(e.target.value)} placeholder="0812..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={() => {
              if (!nama) return;
              onSubmit({
                nama,
                role,
                foto_url: foto || null,
                ig: ig || null,
                tiktok: tiktok || null,
                wa: wa || null,
              });
              setOpen(false);
              setNama("");
              setRole("bangsawan");
              setFoto("");
              setIg("");
              setTiktok("");
              setWa("");
            }}
          >
            Sambut
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
