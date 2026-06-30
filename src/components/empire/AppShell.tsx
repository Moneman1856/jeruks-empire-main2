import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Home,
  CalendarDays,
  ClipboardList,
  BookOpen,
  Menu,
  Coins,
  Crown,
  Image as ImageIcon,
  MessagesSquare,
  UserCircle2,
  Shield,
  LogOut,
  HelpCircle,
  QrCode,
  FolderOpen,
  Sun,
  Moon,
  Vote,
  ChevronLeft,
  X,
} from "lucide-react";
import { NotifBell } from "./NotifBell";
import { useTheme } from "@/lib/theme-context";
import { motion, AnimatePresence } from "framer-motion";
import { DISCORD_INVITE_URL, TUGAS_DRIVE_URL } from "@/lib/external-links";
import { Crest } from "./Crest";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { startTour } from "@/lib/onboarding-tour";
import { useActiveMember, isAdmin } from "@/lib/active-member";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const primaryNav = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/almanak", label: "Almanak", icon: CalendarDays },
  { to: "/absen", label: "Absen", icon: QrCode },
  { to: "/balai-tugas", label: "Tugas", icon: ClipboardList },
  { to: "/bank-materi", label: "Materi", icon: BookOpen },
] as const;

const secondaryNav = [
  { to: "/perbendaharaan", label: "Perbendaharaan", icon: Coins },
  { to: "/para-bangsawan", label: "Para Bangsawan", icon: Crown },
  { to: "/polling", label: "Balai Suara", icon: Vote },
  { to: "/balai-kenangan", label: "Balai Kenangan", icon: ImageIcon },
  { to: "/forum", label: "Forum", icon: MessagesSquare },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { member, email, signOut } = useActiveMember();
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const admin = isAdmin(member?.role);

  const sidebarWidth = sidebarCollapsed ? "w-[68px]" : "w-60";

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      {/* ═══════════════════════════════════════ */}
      {/* DESKTOP SIDEBAR (md+)                  */}
      {/* ═══════════════════════════════════════ */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed inset-y-0 left-0 z-40 border-r border-border/60 bg-background/95 backdrop-blur-sm transition-all duration-300",
          sidebarWidth,
        )}
      >
        {/* Logo & collapse toggle */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border/40">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Crest size={32} />
            {!sidebarCollapsed && (
              <span className="font-display text-base tracking-tight leading-none">
                <span className="text-empire">JERUK'S</span> EMPIRE
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "ml-auto flex items-center justify-center rounded-md size-7 hover:bg-accent/40 transition-colors text-muted-foreground",
              sidebarCollapsed && "ml-0 mx-auto mt-1",
            )}
            title={sidebarCollapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
          >
            <ChevronLeft className={cn("size-4 transition-transform", sidebarCollapsed && "rotate-180")} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {/* Label: Utama */}
          {!sidebarCollapsed && (
            <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Utama
            </p>
          )}
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-empire text-empire-foreground shadow-sm"
                    : "hover:bg-accent/40 text-muted-foreground hover:text-foreground",
                  sidebarCollapsed && "justify-center px-2",
                )}
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2.4 : 2} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="!my-3 border-t border-border/40" />

          {/* Label: Balai */}
          {!sidebarCollapsed && (
            <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Balai
            </p>
          )}
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-empire text-empire-foreground shadow-sm"
                    : "hover:bg-accent/40 text-muted-foreground hover:text-foreground",
                  sidebarCollapsed && "justify-center px-2",
                )}
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2.4 : 2} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* External links */}
          <div className="!my-3 border-t border-border/40" />
          {!sidebarCollapsed && (
            <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Eksternal
            </p>
          )}
          <a
            href={TUGAS_DRIVE_URL}
            target="_blank"
            rel="noreferrer"
            title={sidebarCollapsed ? "Drive Tugas" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent/40 text-muted-foreground hover:text-foreground transition-all",
              sidebarCollapsed && "justify-center px-2",
            )}
          >
            <FolderOpen className="size-[18px] shrink-0" />
            {!sidebarCollapsed && <span>Drive Tugas</span>}
          </a>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noreferrer"
            title={sidebarCollapsed ? "Discord Kelas" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#5865F2]/10 text-muted-foreground hover:text-[#5865F2] transition-all",
              sidebarCollapsed && "justify-center px-2",
            )}
          >
            <MessagesSquare className="size-[18px] shrink-0" />
            {!sidebarCollapsed && <span>Discord Kelas</span>}
          </a>

          {/* Admin */}
          {admin && (
            <>
              <div className="!my-3 border-t border-border/40" />
              <Link
                to="/admin"
                title={sidebarCollapsed ? "Balai Admin" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  pathname === "/admin"
                    ? "bg-plum text-white shadow-sm"
                    : "hover:bg-plum/10 text-plum",
                  sidebarCollapsed && "justify-center px-2",
                )}
              >
                <Shield className="size-[18px] shrink-0" />
                {!sidebarCollapsed && <span>Balai Admin</span>}
              </Link>
            </>
          )}
        </nav>

        {/* Sidebar bottom: controls & profile */}
        <div className="border-t border-border/40 p-2 space-y-2">
          {/* Quick controls row */}
          <div className={cn("flex items-center gap-1", sidebarCollapsed ? "flex-col" : "px-1")}>
            <button
              aria-label="Buka panduan"
              onClick={() => startTour()}
              title="Panduan"
              className="flex items-center justify-center rounded-md size-8 hover:bg-accent/30 transition-colors text-muted-foreground"
            >
              <HelpCircle className="size-4" />
            </button>
            <DarkModeToggle compact />
            <NotifBell />
            <ThemeSwitcher />
          </div>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg border border-border/50 bg-card px-2 py-1.5 text-sm hover:bg-accent/30 transition-colors",
                  sidebarCollapsed && "justify-center p-1.5",
                )}
              >
                {member?.foto_url ? (
                  <img src={member.foto_url} alt="" className="size-7 rounded-full object-cover bg-cream shrink-0" />
                ) : (
                  <UserCircle2 className="size-7 text-muted-foreground shrink-0" />
                )}
                {!sidebarCollapsed && (
                  <span className="truncate text-left text-xs">
                    {member?.panggilan || member?.nama?.split(" ")[0] || email?.split("@")[0] || "Bangsawan"}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-medium truncate">{member?.nama ?? "Bangsawan"}</div>
                <div className="text-xs text-muted-foreground truncate font-normal">{email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {admin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center gap-2">
                    <Shield className="size-4" /> Balai Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                <LogOut className="size-4 mr-2" /> Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ═══════════════════════════════════════ */}
      {/* MOBILE HEADER (< md)                   */}
      {/* ═══════════════════════════════════════ */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur md:hidden">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Crest size={30} />
            <span className="font-display text-base tracking-tight leading-none">
              <span className="text-empire">JERUK'S</span> EMPIRE
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <DarkModeToggle compact />
            <NotifBell />
            <ThemeSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center rounded-full border border-border/70 bg-card size-8">
                  {member?.foto_url ? (
                    <img src={member.foto_url} alt="" className="size-7 rounded-full object-cover bg-cream" />
                  ) : (
                    <UserCircle2 className="size-6 text-muted-foreground" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium truncate">{member?.nama ?? "Bangsawan"}</div>
                  <div className="text-xs text-muted-foreground truncate font-normal">{email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {admin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Shield className="size-4" /> Balai Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="size-4 mr-2" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════ */}
      {/* MAIN CONTENT                           */}
      {/* ═══════════════════════════════════════ */}
      <main
        className={cn(
          "flex-1 w-full min-w-0 overflow-x-hidden",
          // Desktop: offset by sidebar width
          sidebarCollapsed ? "md:ml-[68px]" : "md:ml-60",
          // Padding
          "px-3 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6",
          "transition-all duration-300",
        )}
      >
        <div className="mx-auto max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ═══════════════════════════════════════ */}
      {/* DESKTOP FOOTER                         */}
      {/* ═══════════════════════════════════════ */}
      <footer
        className={cn(
          "hidden md:block border-t border-border/60 py-4 text-center text-xs text-muted-foreground transition-all duration-300",
          sidebarCollapsed ? "md:ml-[68px]" : "md:ml-60",
        )}
      >
        © Kerajaan Jeruk · dipersembahkan untuk Bangsawan kelas TI
      </footer>

      {/* ═══════════════════════════════════════ */}
      {/* MOBILE BOTTOM NAV (< md)               */}
      {/* ═══════════════════════════════════════ */}
      <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-6">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                  active ? "text-empire" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                {item.label}
              </Link>
            );
          })}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                <Menu className="size-5" />
                Lainnya
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="font-display text-empire">Balai Tambahan</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 pt-3">
                {secondaryNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 hover:border-empire/60"
                    >
                      <Icon className="size-5 text-empire" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
                <a
                  href={TUGAS_DRIVE_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 hover:border-empire/60"
                >
                  <FolderOpen className="size-5 text-empire" />
                  <span className="text-sm font-medium">Drive Tugas</span>
                </a>
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 hover:border-[#5865F2]"
                >
                  <MessagesSquare className="size-5 text-[#5865F2]" />
                  <span className="text-sm font-medium">Discord Kelas</span>
                </a>
                {admin && (
                  <Link
                    to="/admin"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 rounded-lg border border-plum/40 bg-plum/5 p-3 col-span-2"
                  >
                    <Shield className="size-5 text-plum" />
                    <span className="text-sm font-medium text-plum">Balai Admin</span>
                  </Link>
                )}
              </div>
              <div className="pt-4 mt-4 border-t border-border/60">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMoreOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="size-4 mr-2" /> Keluar dari Kerajaan
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
}

function DarkModeToggle({ compact }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "cinematic" || theme === "cyber";
  return (
    <button
      aria-label={isDark ? "Mode terang" : "Mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
      onClick={() => setTheme(isDark ? "empire" : "cinematic")}
      className={cn(
        "flex items-center justify-center rounded-full border border-border/70 bg-card hover:bg-accent/30 transition-colors",
        compact ? "size-8" : "size-9",
      )}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
