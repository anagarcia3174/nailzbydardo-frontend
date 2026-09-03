import { useState } from "react";
import { IconPlus, IconTrash, IconCheck, IconX, IconReceipt2 } from "@tabler/icons-react";
import { useExpenses, useCreateExpense, useDeleteExpense } from "../hooks/useExpenses";
import type { Expense } from "../types/expense";
import styles from "./ExpensesPage.module.css";

function formatDollars(cents: number) {
  return (cents / 100).toFixed(2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function ExpensesPage() {
  const { data: expenses, isLoading } = useExpenses();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [datePurchased, setDatePurchased] = useState(todayInputValue());
  const [receiptUrl, setReceiptUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setPrice("");
    setDatePurchased(todayInputValue());
    setReceiptUrl("");
    setError(null);
  }

  async function handleCreate() {
    const trimmedName = name.trim();
    const dollars = parseFloat(price);

    if (!trimmedName) {
      setError("Expense name is required.");
      return;
    }
    if (isNaN(dollars) || dollars < 0) {
      setError("Enter a valid price.");
      return;
    }
    if (!datePurchased) {
      setError("Date is required.");
      return;
    }

    setError(null);
    try {
      await createExpense.mutateAsync({
        expense_name: trimmedName,
        price: Math.round(dollars * 100),
        date_purchased: new Date(datePurchased).toISOString(),
        receipt_url: receiptUrl.trim() ? receiptUrl.trim() : null,
      });
      resetForm();
      setCreating(false);
    } catch {
      setError("Failed to create expense. Please try again.");
    }
  }

  async function handleDelete(expense: Expense) {
    if (
      !window.confirm(`Delete "${expense.expense_name}"? This can't be undone.`)
    )
      return;

    try {
      await deleteExpense.mutateAsync(expense.id);
    } catch {
      window.alert("Failed to delete expense. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      </main>
    );
  }
const sortedExpenses = expenses
  ?.slice()
  .sort(
    (a, b) =>
      new Date(b.date_purchased).getTime() - new Date(a.date_purchased).getTime(),
  );
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.content}>
          <div className={styles.headerTop}>
            <h1>Expenses</h1>
            <button
              type="button"
              className={styles.newButton}
              onClick={() => {
                if (creating) {
                  resetForm();
                }
                setCreating((prev) => !prev);
              }}
            >
              <IconPlus size={18} stroke={2} />
              <span>New</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.content}>
          {creating && (
            <div className={styles.card}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span className={styles.label}>Expense name</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nail polish restock"
                    autoFocus
                  />
                </label>

                <div className={styles.row}>
                  <label className={styles.field}>
                    <span className={styles.label}>Price</span>
                    <div className={styles.priceInputWrap}>
                      <span className={styles.dollarSign}>$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={styles.priceInput}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Date</span>
                    <input
                      type="date"
                      className={styles.input}
                      value={datePurchased}
                      onChange={(e) => setDatePurchased(e.target.value)}
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span className={styles.label}>Receipt URL (optional)</span>
                  <input
                    type="text"
                    className={styles.input}
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </label>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.editActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    resetForm();
                    setCreating(false);
                  }}
                >
                  <IconX size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleCreate}
                  disabled={createExpense.isPending}
                >
                  <IconCheck size={16} />
                  {createExpense.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          {sortedExpenses && sortedExpenses.length > 0 ? (
            <div className={styles.list}>
              {sortedExpenses.map((expense) => (
                <div key={expense.id} className={styles.card}>
                  <div className={styles.viewRow}>
                    <div className={styles.expenseInfo}>
                      <span className={styles.expenseName}>
                        {expense.expense_name}
                      </span>
                      <span className={styles.expenseDate}>
                        {formatDate(expense.date_purchased)}
                      </span>
                    </div>
                    <span className={styles.expensePrice}>
                      ${formatDollars(expense.price)}
                    </span>
                  </div>

                  <div className={styles.viewActions}>
                    {expense.receipt_url && (
                      <a
                        href={expense.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.receiptLink}
                      >
                        <IconReceipt2 size={15} stroke={1.8} />
                        Receipt
                      </a>
                    )}
                    <button
                      type="button"
                      className={styles.iconBtnDanger}
                      onClick={() => handleDelete(expense)}
                      aria-label="Delete"
                    >
                      <IconTrash size={17} stroke={1.8} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !creating && (
              <div className={styles.empty}>
                <h2>No expenses yet</h2>
                <p>Log your first expense to start tracking costs.</p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}