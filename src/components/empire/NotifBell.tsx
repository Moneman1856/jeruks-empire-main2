import { useEffect, useMemo } from "react";
import { Bell, Check } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useActiveMember } from "@/lib/active-member";
import { notifikasiListQuery } from "@/lib/queries";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { markNotifRead, markAllNotifRead } from "@/lib/empire.functions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TIPE_LABEL: Record<string, string> = {
  titah: "Titah Baru",
  tugas: "Tugas Baru",
  polling: "Polling",
  umum: "Pengumuman",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam`;
  const d = Math.floor(h / 24);
  return `${d} hari`;
}

export function NotifBell() {
  const { member } = useActiveMember();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const memberId = member?.id ?? null;
  const { data: list = [] } = useQuery(notifikasiListQuery(memberId));

  const unread = useMemo(() => list.filter((n) => !n.terbaca).length, [list]);

  useEffect(() => {
    if (!memberId) return;
    const q = query(collection(db, "notifikasi"), where("anggota_id", "==", memberId));
    const unsub = onSnapshot(q, () => {
      qc.invalidateQueries({ queryKey: ["notifikasi", memberId] });
    });
    return unsub;
  }, [memberId, qc]);

  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!memberId) return;
      await markNotifRead(id, memberId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifikasi", memberId] }),
  });

  const readAllMutation = useMutation({
    mutationFn: async () => {
      if (!memberId) return;
      await markAllNotifRead(memberId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifikasi", memberId] }),
  });

  if (!memberId) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifikasi"
          className="relative flex items-center justify-center rounded-full border border-border/70 bg-card size-9 hover:bg-accent/30 transition-colors"
        >
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-empire text-empire-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
          <div className="font-display text-empire text-sm">Notifikasi</div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => readAllMutation.mutate()}>
              <Check className="size-3 mr-1" /> Tandai semua
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {list.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Belum ada notifikasi.</div>
          ) : (
            list.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.terbaca) readMutation.mutate(n.id);
                  if (n.link) navigate({ to: n.link });
                }}
                className={cn(
                  "w-full text-left px-3 py-2 border-b border-border/40 hover:bg-accent/30 transition-colors",
                  !n.terbaca && "bg-empire/5",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-empire">
                    {TIPE_LABEL[n.jenis] ?? n.jenis}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                </div>
                <div className="text-sm font-medium leading-snug mt-0.5">{n.judul}</div>
                {n.isi && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.isi}</div>}
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
