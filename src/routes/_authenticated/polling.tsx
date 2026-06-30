import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Plus, Vote as VoteIcon, Trash2, Lock, Unlock, X } from "lucide-react";
import { pollingListQuery } from "@/lib/queries";
import { castVote, createPolling, deletePolling, togglePollingTutup } from "@/lib/empire.functions";
import { useActiveMember, canManagePolling } from "@/lib/active-member";
import { EmptyState } from "@/components/empire/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/polling")({
  head: () => ({
    meta: [
      { title: "Balai Suara — JERUK'S EMPIRE" },
      { name: "description", content: "Polling & suara para bangsawan." },
    ],
  }),
  component: PollingPage,
});

function PollingPage() {
  const { member } = useActiveMember();
  const canManage = canManagePolling(member?.role);
  const { data: polls = [], isLoading } = useQuery(pollingListQuery);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="font-display text-3xl text-empire">Balai Suara</h1>
          <p className="text-sm text-muted-foreground">
            Polling & voting antar bangsawan. Setiap suara dihitung.
          </p>
        </div>
        {canManage && <NewPollingDialog />}
      </header>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Memuat polling…</div>
      ) : polls.length === 0 ? (
        <EmptyState
          title="Belum ada polling"
          hint={canManage ? "Buat polling pertama untuk memulai diskusi." : "Tunggu Yang Mulia atau Sekretaris membuat polling."}
        />
      ) : (
        <div className="space-y-4">
          {(polls as Poll[]).map((p) => (
            <PollCard key={p.id} poll={p} canManage={canManage} memberId={member?.id ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}

type Poll = {
  id: string;
  pertanyaan: string;
  deskripsi: string | null;
  multi: boolean;
  ditutup: boolean;
  batas_waktu: string | null;
  author: { nama: string } | null;
  pilihan: { id: string; teks: string; urutan: number }[];
  vote: { id: string; anggota_id: string; pilihan_id: string }[];
};

function PollCard({ poll, canManage, memberId }: { poll: Poll; canManage: boolean; memberId: string | null }) {
  const qc = useQueryClient();
  const vote = useServerFn(castVote);
  const del = useServerFn(deletePolling);
  const toggle = useServerFn(togglePollingTutup);

  const expired = poll.batas_waktu ? new Date(poll.batas_waktu) < new Date() : false;
  const locked = poll.ditutup || expired;

  const myVotes = useMemo(
    () => poll.vote.filter((v) => v.anggota_id === memberId).map((v) => v.pilihan_id),
    [poll.vote, memberId],
  );
  const totalVotes = poll.vote.length;
  const totalVoters = new Set(poll.vote.map((v) => v.anggota_id)).size;

  const [selected, setSelected] = useState<string[]>(myVotes);

  const voteMut = useMutation({
    mutationFn: async () => {
      if (!memberId) throw new Error("Login dulu");
      if (selected.length === 0) throw new Error("Pilih dulu minimal satu opsi");
      await vote({ data: { polling_id: poll.id, pilihan_ids: selected, anggota_id: memberId } });
    },
    onSuccess: () => {
      toast.success("Suara tersimpan");
      qc.invalidateQueries({ queryKey: ["polling"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: async () => {
      if (!memberId) return;
      await del({ data: { id: poll.id, actor_id: memberId } });
    },
    onSuccess: () => {
      toast.success("Polling dihapus");
      qc.invalidateQueries({ queryKey: ["polling"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMut = useMutation({
    mutationFn: async () => {
      if (!memberId) return;
      await toggle({ data: { id: poll.id, ditutup: !poll.ditutup, actor_id: memberId } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["polling"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePick = (id: string) => {
    if (poll.multi) {
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    } else {
      setSelected([id]);
    }
  };

  return (
    <article className="rounded-xl border border-border/60 bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-lg leading-snug">{poll.pertanyaan}</h2>
          {poll.deskripsi && <p className="text-sm text-muted-foreground mt-1">{poll.deskripsi}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span>oleh {poll.author?.nama ?? "—"}</span>
            <span>·</span>
            <span>{totalVoters} suara</span>
            {poll.multi && <span className="px-1.5 py-0.5 rounded bg-accent/40">multi-pilih</span>}
            {poll.batas_waktu && (
              <span className={cn(expired && "text-destructive")}>
                · sampai {format(parseISO(poll.batas_waktu), "d MMM HH:mm", { locale: idLocale })}
              </span>
            )}
            {poll.ditutup && <span className="px-1.5 py-0.5 rounded bg-muted">ditutup</span>}
          </div>
        </div>
        {canManage && (
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              title={poll.ditutup ? "Buka kembali" : "Tutup polling"}
              onClick={() => toggleMut.mutate()}
            >
              {poll.ditutup ? <Unlock className="size-4" /> : <Lock className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive"
              title="Hapus"
              onClick={() => {
                if (confirm("Hapus polling ini?")) delMut.mutate();
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {poll.pilihan
          .slice()
          .sort((a, b) => a.urutan - b.urutan)
          .map((opt) => {
            const count = poll.vote.filter((v) => v.pilihan_id === opt.id).length;
            const pct = totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0;
            const picked = selected.includes(opt.id);
            const myPick = myVotes.includes(opt.id);
            return (
              <button
                key={opt.id}
                disabled={locked}
                onClick={() => togglePick(opt.id)}
                className={cn(
                  "relative w-full text-left rounded-lg border px-3 py-2 overflow-hidden transition-colors",
                  picked ? "border-empire bg-empire/5" : "border-border/60 hover:border-empire/40",
                  locked && "opacity-80 cursor-not-allowed",
                )}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-empire/10"
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
                <div className="relative flex items-center gap-2">
                  <div
                    className={cn(
                      "size-4 rounded-full border flex items-center justify-center shrink-0",
                      poll.multi ? "rounded-[4px]" : "rounded-full",
                      picked ? "border-empire bg-empire text-empire-foreground" : "border-border",
                    )}
                  >
                    {picked && <div className="size-1.5 rounded-full bg-empire-foreground" />}
                  </div>
                  <span className="text-sm font-medium flex-1 truncate">{opt.teks}</span>
                  {myPick && <span className="text-[10px] text-empire font-semibold">PILIHANMU</span>}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {count} · {pct}%
                  </span>
                </div>
              </button>
            );
          })}
      </div>

      {!locked && (
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            disabled={selected.length === 0 || voteMut.isPending}
            onClick={() => voteMut.mutate()}
          >
            {myVotes.length > 0 ? "Ubah Suara" : "Kirim Suara"}
          </Button>
        </div>
      )}
    </article>
  );
}

function NewPollingDialog() {
  const qc = useQueryClient();
  const { member } = useActiveMember();
  const create = useServerFn(createPolling);
  const [open, setOpen] = useState(false);
  const [pertanyaan, setPertanyaan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [multi, setMulti] = useState(false);
  const [batas, setBatas] = useState("");
  const [opts, setOpts] = useState<string[]>(["", ""]);

  const reset = () => {
    setPertanyaan("");
    setDeskripsi("");
    setMulti(false);
    setBatas("");
    setOpts(["", ""]);
  };

  const mut = useMutation({
    mutationFn: async () => {
      if (!member?.id) throw new Error("Login dulu");
      const pilihan = opts.map((s) => s.trim()).filter(Boolean);
      if (pilihan.length < 2) throw new Error("Minimal 2 opsi");
      await create({
        data: {
          pertanyaan: pertanyaan.trim(),
          deskripsi: deskripsi.trim() || null,
          multi,
          batas_waktu: batas ? new Date(batas).toISOString() : null,
          pilihan,
          actor_id: member.id,
        },
      });
    },
    onSuccess: () => {
      toast.success("Polling dibuat");
      qc.invalidateQueries({ queryKey: ["polling"] });
      reset();
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto">
          <Plus className="size-4 mr-1" /> Polling Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-empire">Polling Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Pertanyaan</Label>
            <Input value={pertanyaan} onChange={(e) => setPertanyaan(e.target.value)} placeholder="Contoh: Kapan rapat kelas?" />
          </div>
          <div>
            <Label>Deskripsi (opsional)</Label>
            <Textarea rows={2} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
          </div>
          <div>
            <Label>Opsi Jawaban</Label>
            <div className="space-y-2 mt-1">
              {opts.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={v}
                    onChange={(e) => setOpts((s) => s.map((x, j) => (j === i ? e.target.value : x)))}
                    placeholder={`Opsi ${i + 1}`}
                  />
                  {opts.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpts((s) => s.filter((_, j) => j !== i))}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
              {opts.length < 10 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setOpts((s) => [...s, ""])}>
                  <Plus className="size-3 mr-1" /> Tambah opsi
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="multi" checked={multi} onCheckedChange={(c) => setMulti(!!c)} />
            <Label htmlFor="multi" className="font-normal cursor-pointer">
              Boleh memilih lebih dari satu opsi
            </Label>
          </div>
          <div>
            <Label>Batas Waktu (opsional)</Label>
            <Input type="datetime-local" value={batas} onChange={(e) => setBatas(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button disabled={mut.isPending || !pertanyaan.trim()} onClick={() => mut.mutate()}>
            {mut.isPending ? "Menyimpan…" : "Buat Polling"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
