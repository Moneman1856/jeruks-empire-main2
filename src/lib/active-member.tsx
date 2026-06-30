import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth, db } from "@/integrations/firebase/client";
import type { Anggota, AnggotaRole } from "@/integrations/firebase/types";

// Re-export Anggota type for consumers
export type { Anggota };

interface ActiveMemberCtx {
  userId: string | null;
  email: string | null;
  member: Anggota | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<ActiveMemberCtx | null>(null);

export function ActiveMemberProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
      if (user) qc.invalidateQueries();
    });
    return unsub;
  }, [qc]);

  const { data: member } = useQuery({
    queryKey: ["anggota", "self", firebaseUser?.uid ?? null],
    enabled: !!firebaseUser,
    queryFn: async (): Promise<Anggota | null> => {
      if (!firebaseUser?.email) return null;
      // Try by firebaseUid first
      const byUid = query(collection(db, "anggota"), where("firebaseUid", "==", firebaseUser.uid));
      const snapUid = await getDocs(byUid);
      if (!snapUid.empty) {
        const d = snapUid.docs[0];
        return { id: d.id, ...d.data() } as Anggota;
      }
      // Fall back to email match (first login — link the UID)
      const byEmail = query(collection(db, "anggota"), where("email", "==", firebaseUser.email.toLowerCase()));
      const snapEmail = await getDocs(byEmail);
      if (snapEmail.empty) return null;
      const docRef = snapEmail.docs[0];
      // Save UID for future lookups
      await updateDoc(docRef.ref, { firebaseUid: firebaseUser.uid });
      return { id: docRef.id, ...docRef.data(), firebaseUid: firebaseUser.uid } as Anggota;
    },
  });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await firebaseSignOut(auth);
  };

  return (
    <Ctx.Provider
      value={{
        userId: firebaseUser?.uid ?? null,
        email: firebaseUser?.email ?? null,
        member: member ?? null,
        loading,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useActiveMember() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useActiveMember must be inside ActiveMemberProvider");
  return ctx;
}

export function isAdmin(role?: AnggotaRole | null) {
  return role === "manager" || role === "yang_mulia";
}
export function canManageKas(role?: AnggotaRole | null) {
  return role === "yang_mulia" || role === "manager";
}
export function canManageJadwal(role?: AnggotaRole | null) {
  return role === "yang_mulia" || role === "sekretaris" || role === "manager";
}
export function canManageTugas(role?: AnggotaRole | null) {
  return role === "yang_mulia" || role === "sekretaris" || role === "manager";
}
export function canManageMembers(role?: AnggotaRole | null) {
  return role === "yang_mulia" || role === "sekretaris" || role === "manager";
}
export function canManagePolling(role?: AnggotaRole | null) {
  return role === "yang_mulia" || role === "sekretaris" || role === "manager";
}
