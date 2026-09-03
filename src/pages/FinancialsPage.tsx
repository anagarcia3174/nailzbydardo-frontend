import { useState } from "react";
import { useFinancials } from "../hooks/useFinancials";
import styles from "./FinancialsPage.module.css";

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function endOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

function toInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function fromInputValue(value: string, endOfDay: boolean) {
  const [year, month, day] = value.split("-").map(Number);
  return endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day);
}

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatRangeLabel(start: Date, end: Date) {
  const sameYear = start.getFullYear() === end.getFullYear();
  const startFmt = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
  const endFmt = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startFmt} – ${endFmt}`;
}

export function FinancialsPage() {
  const [start, setStart] = useState<Date>(startOfMonth());
  const [end, setEnd] = useState<Date>(endOfMonth());
  const [rangeError, setRangeError] = useState<string | null>(null);

  const { data: financials, isLoading, isFetching } = useFinancials(start, end);

  function handleStartChange(value: string) {
    if (!value) return;
    const newStart = fromInputValue(value, false);

    if (newStart > end) {
      setRangeError("Start date must be before the end date.");
      return;
    }

    setRangeError(null);
    setStart(newStart);
  }

  function handleEndChange(value: string) {
    if (!value) return;
    const newEnd = fromInputValue(value, true);

    if (newEnd < start) {
      setRangeError("End date must be after the start date.");
      return;
    }

    setRangeError(null);
    setEnd(newEnd);
  }

  function applyPreset(newStart: Date, newEnd: Date) {
    setRangeError(null);
    setStart(newStart);
    setEnd(newEnd);
  }

  const net = financials ? financials.revenue - financials.expenses : 0;

  return (
    <main className={styles.scrollPage}>
      <div className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Financials</p>
          <h1>{formatRangeLabel(start, end)}</h1>
        </header>

        <section className={styles.section}>
          <div className={styles.dateRangeCard}>
            <div className={styles.dateFields}>
              <label className={styles.dateField}>
                <span className={styles.dateLabel}>From</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={toInputValue(start)}
                  onChange={(e) => handleStartChange(e.target.value)}
                />
              </label>

              <label className={styles.dateField}>
                <span className={styles.dateLabel}>To</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={toInputValue(end)}
                  onChange={(e) => handleEndChange(e.target.value)}
                />
              </label>
            </div>

            <div className={styles.presets}>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => applyPreset(startOfMonth(), endOfMonth())}
              >
                This month
              </button>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => {
                  const now = new Date();
                  const prevMonthStart = new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1,
                  );
                  const prevMonthEnd = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    0,
                    23,
                    59,
                    59,
                    999,
                  );
                  applyPreset(prevMonthStart, prevMonthEnd);
                }}
              >
                Last month
              </button>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={() => {
                  const now = new Date();
                  applyPreset(new Date(now.getFullYear(), 0, 1), now);
                }}
              >
                Year to date
              </button>
            </div>

            {rangeError && <p className={styles.error}>{rangeError}</p>}
          </div>
        </section>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : financials ? (
          <>
            <section className={styles.section} aria-busy={isFetching}>
              <div className={styles.heroCard}>
                <span className={styles.heroLabel}>Net</span>
                <span className={styles.heroValue}>{formatCurrency(net)}</span>
                <span className={styles.heroSub}>
                  {formatCurrency(financials.revenue)} revenue −{" "}
                  {formatCurrency(financials.expenses)} expenses
                </span>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>
                    {formatCurrency(financials.revenue)}
                  </span>
                  <span className={styles.statLabel}>Revenue</span>
                </div>

                <div className={styles.statCard}>
                  <span className={styles.statValue}>
                    {formatCurrency(financials.expenses)}
                  </span>
                  <span className={styles.statLabel}>Expenses</span>
                </div>

                <div className={styles.statCard}>
                  <span className={styles.statValue}>
                    {formatCurrency(financials.tips)}
                  </span>
                  <span className={styles.statLabel}>Tips</span>
                </div>

                <div className={styles.statCard}>
                  <span className={styles.statValue}>
                    {financials.appointment_count}
                  </span>
                  <span className={styles.statLabel}>Appointments</span>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className={styles.empty}>
            <h2>No data for this range</h2>
            <p>Try selecting a different date range.</p>
          </div>
        )}
      </div>
    </main>
  );
}