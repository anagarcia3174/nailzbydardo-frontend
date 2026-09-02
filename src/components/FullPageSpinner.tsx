import styles from "./FullPageSpinner.module.css";

export function FullPageSpinner() {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
    </div>
  );
}