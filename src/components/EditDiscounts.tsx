import { useState } from "react";
import { IconTrash, IconRotate, IconPlus } from "@tabler/icons-react";
import type { AddDiscountRequest } from "../api/appointments";
import styles from "./EditDiscounts.module.css";
import type { AppointmentDiscountSummary, DiscountType } from "../types/appointment";

export interface DiscountChanges {
  toAdd: AddDiscountRequest[];
  toRemoveIds: string[];
}

interface PendingDiscount extends AddDiscountRequest {
  tempId: string;
}

interface EditDiscountsProps {
  existingDiscounts: AppointmentDiscountSummary[];
  onChange: (changes: DiscountChanges) => void;
}

function generateTempId() {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatDiscountValue(type: DiscountType, value: number) {
  return type === "percent" ? `${value}%` : `$${(value / 100).toFixed(2)}`;
}

export function EditDiscounts({ existingDiscounts, onChange }: EditDiscountsProps) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingDiscounts, setPendingDiscounts] = useState<PendingDiscount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState<DiscountType>("amount");
  const [valueInput, setValueInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function emit(nextRemoved: Set<string>, nextPending: PendingDiscount[]) {
    onChange({
      toAdd: nextPending.map(({ tempId, ...rest }) => rest),
      toRemoveIds: Array.from(nextRemoved),
    });
  }

  function toggleRemoveExisting(id: string) {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      emit(next, pendingDiscounts);
      return next;
    });
  }

  function removePending(tempId: string) {
    setPendingDiscounts((prev) => {
      const next = prev.filter((d) => d.tempId !== tempId);
      emit(removedIds, next);
      return next;
    });
  }

  function resetForm() {
    setNameInput("");
    setTypeInput("amount");
    setValueInput("");
    setFormError(null);
    setShowAddForm(false);
  }

  function handleAddDiscount() {
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      setFormError("Name is required.");
      return;
    }

    const rawValue = parseFloat(valueInput);
    if (isNaN(rawValue) || rawValue <= 0) {
      setFormError("Enter a value greater than 0.");
      return;
    }

    if (typeInput === "percent" && rawValue > 100) {
      setFormError("Percent discount can't exceed 100.");
      return;
    }

    const discountValue =
      typeInput === "percent" ? Math.round(rawValue) : Math.round(rawValue * 100);

    const newDiscount: PendingDiscount = {
      tempId: generateTempId(),
      discount_name: trimmedName,
      discount_type: typeInput,
      discount_value: discountValue,
    };

    setPendingDiscounts((prev) => {
      const next = [...prev, newDiscount];
      emit(removedIds, next);
      return next;
    });

    resetForm();
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>Discounts</div>

      {existingDiscounts.length === 0 && pendingDiscounts.length === 0 && (
        <p className={styles.empty}>No discounts added yet</p>
      )}

      {existingDiscounts.map((item) => {
        const isRemoved = removedIds.has(item.id);
        return (
          <div
            key={item.id}
            className={`${styles.row} ${isRemoved ? styles.removed : ""}`}
          >
            <div className={styles.info}>
              <span>{item.discount_name}</span>
            </div>
            <div className={styles.right}>
              <span className={styles.value}>
                {formatDiscountValue(item.discount_type, item.discount_value)}
              </span>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => toggleRemoveExisting(item.id)}
                aria-label={isRemoved ? "Undo remove" : "Remove discount"}
              >
                {isRemoved ? <IconRotate size={16} /> : <IconTrash size={16} />}
              </button>
            </div>
          </div>
        );
      })}

      {pendingDiscounts.map((item) => (
        <div key={item.tempId} className={`${styles.row} ${styles.pending}`}>
          <div className={styles.info}>
            <span>{item.discount_name}</span>
            <span className={styles.newTag}>new</span>
          </div>
          <div className={styles.right}>
            <span className={styles.value}>
              {formatDiscountValue(item.discount_type, item.discount_value)}
            </span>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => removePending(item.tempId)}
              aria-label="Remove discount"
            >
              <IconTrash size={16} />
            </button>
          </div>
        </div>
      ))}

      {!showAddForm ? (
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setShowAddForm(true)}
        >
          <IconPlus size={16} />
          Add discount
        </button>
      ) : (
        <div className={styles.addForm}>
          <input
            className={styles.input}
            type="text"
            placeholder="Discount name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <div className={styles.row2}>
            <select
              className={styles.select}
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value as DiscountType)}
            >
              <option value="amount">Amount ($)</option>
              <option value="percent">Percent (%)</option>
            </select>
            <input
              className={styles.input}
              type="number"
              min="0"
              step={typeInput === "percent" ? "1" : "0.01"}
              placeholder={typeInput === "percent" ? "e.g. 10" : "e.g. 5.00"}
              value={valueInput}
              onChange={(e) => setValueInput(e.target.value)}
            />
          </div>

          {formError && <p className={styles.formError}>{formError}</p>}

          <div className={styles.addFormActions}>
            <button type="button" className={styles.cancelBtn} onClick={resetForm}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={handleAddDiscount}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}