import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ paddingBottom: "70px" }}>
      {children}
      <BottomNav />
    </div>
  );
}