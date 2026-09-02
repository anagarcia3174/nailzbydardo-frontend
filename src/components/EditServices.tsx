import { useState } from "react";
import { IconTrash, IconRotate, IconPlus } from "@tabler/icons-react";
import { useServices } from "../hooks/useServices";
import type { AddServiceRequest } from "../api/appointments";
import type { Service } from "../types/service";
import styles from "./EditServices.module.css";
import type { AppointmentServiceSummary } from "../types/appointment";

export interface ServiceChanges {
  toAdd: AddServiceRequest[];
  toRemoveIds: string[];
}

interface PendingService extends AddServiceRequest {
  tempId: string;
}

interface EditServicesProps {
  existingServices: AppointmentServiceSummary[];
  onChange: (changes: ServiceChanges) => void;
}

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function generateTempId() {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
export function EditServices({ existingServices, onChange }: EditServicesProps) {
  const { data: availableServices } = useServices();

  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [designPriceInput, setDesignPriceInput] = useState("");

  function emit(nextRemoved: Set<string>, nextPending: PendingService[]) {
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
      emit(next, pendingServices);
      return next;
    });
  }

  function removePending(tempId: string) {
    setPendingServices((prev) => {
      const next = prev.filter((s) => s.tempId !== tempId);
      emit(removedIds, next);
      return next;
    });
  }
console.log("selectedServiceId", selectedServiceId, "availableServices", availableServices);
  function handleAddService() {
    const service = availableServices?.find(
      (s: Service) => s.id === selectedServiceId,
    );
    if (!service) return;

    const designPrice = designPriceInput
      ? Math.round(parseFloat(designPriceInput) * 100)
      : 0;

    const newService: PendingService = {
      tempId: generateTempId(),
      service_name: service.service_name,
      service_price: service.price,
      design_price: designPrice,
    };

    setPendingServices((prev) => {
      const next = [...prev, newService];
      emit(removedIds, next);
      return next;
    });

    setSelectedServiceId("");
    setDesignPriceInput("");
    setShowAddForm(false);
  }

  const alreadyAddedNames = new Set(pendingServices.map((s) => s.service_name));
  const selectableServices = (availableServices ?? []).filter(
    (s: Service) => !alreadyAddedNames.has(s.service_name),
  );

  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>Services</div>

      {existingServices.length === 0 && pendingServices.length === 0 && (
        <p className={styles.empty}>No services added yet</p>
      )}

      {existingServices.map((item) => {
        const isRemoved = removedIds.has(item.id);
        return (
          <div
            key={item.id}
            className={`${styles.row} ${isRemoved ? styles.removed : ""}`}
          >
            <div className={styles.info}>
              <span>{item.service_name}</span>
              {item.design_price > 0 && (
                <span className={styles.subLabel}>
                  + {formatCurrency(item.design_price)} design
                </span>
              )}
            </div>
            <div className={styles.right}>
              <span className={styles.price}>
                {formatCurrency(item.service_price + item.design_price)}
              </span>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => toggleRemoveExisting(item.id)}
                aria-label={isRemoved ? "Undo remove" : "Remove service"}
              >
                {isRemoved ? <IconRotate size={16} /> : <IconTrash size={16} />}
              </button>
            </div>
          </div>
        );
      })}

      {pendingServices.map((item) => (
        <div key={item.tempId} className={`${styles.row} ${styles.pending}`}>
          <div className={styles.info}>
            <span>{item.service_name}</span>
            {item.design_price > 0 && (
              <span className={styles.subLabel}>
                + {formatCurrency(item.design_price)} design
              </span>
            )}
            <span className={styles.newTag}>new</span>
          </div>
          <div className={styles.right}>
            <span className={styles.price}>
              {formatCurrency(item.service_price + item.design_price)}
            </span>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => removePending(item.tempId)}
              aria-label="Remove service"
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
          Add service
        </button>
      ) : (
        <div className={styles.addForm}>
          <select
            className={styles.select}
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            <option value="">Select a service…</option>
            {selectableServices.map((s: Service) => (
              <option key={s.id} value={s.id}>
                {s.service_name} — {formatCurrency(s.price)}
              </option>
            ))}
          </select>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.01"
            placeholder="Design add-on ($, optional)"
            value={designPriceInput}
            onChange={(e) => setDesignPriceInput(e.target.value)}
          />
          <div className={styles.addFormActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => {
                setShowAddForm(false);
                setSelectedServiceId("");
                setDesignPriceInput("");
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={handleAddService}
              disabled={!selectedServiceId}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}