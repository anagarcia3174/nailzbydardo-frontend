import styles from "./LoyaltyHearts.module.css";

interface Props {
  completedCount: number;
  pendingVisit?: boolean;
  historical?: boolean;
}

export default function LoyaltyHearts({
  completedCount,
  pendingVisit = false,
  historical = false,
}: Props) {
  const cycleProgress = completedCount % 6;
  // historical: the 6th completed appointment shows all 6 filled (cycle just finished), not 0
  const filledHearts =
    historical && cycleProgress === 0 && completedCount > 0 ? 6 : cycleProgress;
  const thisIsReward = pendingVisit && cycleProgress === 5;
  const nextIsReward =
    (pendingVisit && cycleProgress === 4) ||
    (!pendingVisit && cycleProgress === 5);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Loyalty</span>
        {(thisIsReward || nextIsReward) && (
          <span className={styles.badge}>
            {thisIsReward
              ? "Loyalty discount this visit!"
              : "Next visit: loyalty discount!"}
          </span>
        )}
      </div>
      <div className={styles.hearts}>
        {Array.from({ length: 6 }).map((_, i) => {
          const filled = i < filledHearts;
          const pending = pendingVisit && i === filledHearts;
          return (
            <svg
              key={i}
              width="28"
              height="28"
              viewBox="0 0 24 24"
              className={
                filled ? styles.filled : pending ? styles.pending : styles.empty
              }
            >
              {filled || pending ? (
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
              ) : (
                <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.08C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.41 2 8.5c0 3.77 3.4 6.86 8.55 11.53L12 21.35l1.45-1.32C18.6 15.36 22 12.27 22 8.5 22 5.41 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
              )}
            </svg>
          );
        })}
      </div>
      <p className={styles.subtext}>
        {thisIsReward
          ? "Loyalty discount applies to this appointment!"
          : nextIsReward
            ? "Next visit gets a loyalty discount!"
            : `${filledHearts} of 6 visits toward loyalty discount`}
      </p>
    </div>
  );
}
