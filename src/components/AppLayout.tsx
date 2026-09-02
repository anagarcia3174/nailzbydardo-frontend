import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import styles from "./AppLayout.module.css";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      {children}
      <BottomNav />
    </div>
  );
}