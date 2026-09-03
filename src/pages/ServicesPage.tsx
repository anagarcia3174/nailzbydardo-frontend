import { useState } from "react";
import { IconPlus, IconPencil, IconTrash, IconCheck, IconX } from "@tabler/icons-react";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "../hooks/useServices";
import styles from "./ServicesPage.module.css";
import type { Service } from "../types/service";

function formatDollars(cents: number) {
  return (cents / 100).toFixed(2);
}

function EditableServiceCard({
  service,
  onCancel,
}: {
  service: Service;
  onCancel: () => void;
}) {
  const updateService = useUpdateService(service.id);
  const [name, setName] = useState(service.service_name);
  const [price, setPrice] = useState(formatDollars(service.price));
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const trimmedName = name.trim();
    const dollars = parseFloat(price);

    if (!trimmedName) {
      setError("Service name is required.");
      return;
    }
    if (isNaN(dollars) || dollars < 0) {
      setError("Enter a valid price.");
      return;
    }

    setError(null);
    try {
      await updateService.mutateAsync({
        service_name: trimmedName,
        service_price: Math.round(dollars * 100),
      });
      onCancel();
    } catch {
      setError("Failed to save. Please try again.");
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.editRow}>
        <input
          type="text"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Service name"
        />
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
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.editActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          <IconX size={16} />
          Cancel
        </button>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={updateService.isPending}
        >
          <IconCheck size={16} />
          {updateService.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

export function ServicesPage() {
  const { data: services, isLoading } = useServices();
  const createService = useCreateService();
  const deleteService = useDeleteService();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate() {
    const trimmedName = newName.trim();
    const dollars = parseFloat(newPrice);

    if (!trimmedName) {
      setCreateError("Service name is required.");
      return;
    }
    if (isNaN(dollars) || dollars < 0) {
      setCreateError("Enter a valid price.");
      return;
    }

    setCreateError(null);
    try {
      await createService.mutateAsync({
        service_name: trimmedName,
        service_price: Math.round(dollars * 100),
      });
      setNewName("");
      setNewPrice("");
      setCreating(false);
    } catch {
      setCreateError("Failed to create service. Please try again.");
    }
  }

  async function handleDelete(service: Service) {
    if (
      !window.confirm(`Delete "${service.service_name}"? This can't be undone.`)
    )
      return;

    try {
      await deleteService.mutateAsync(service.id);
    } catch {
      window.alert("Failed to delete service. Please try again.");
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

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.content}>
          <div className={styles.headerTop}>
            <h1>Services</h1>
            <button
              type="button"
              className={styles.newButton}
              onClick={() => {
                setCreating((prev) => !prev);
                setCreateError(null);
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
              <div className={styles.editRow}>
                <input
                  type="text"
                  className={styles.input}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Service name"
                  autoFocus
                />
                <div className={styles.priceInputWrap}>
                  <span className={styles.dollarSign}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={styles.priceInput}
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {createError && <p className={styles.error}>{createError}</p>}

              <div className={styles.editActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setCreating(false);
                    setNewName("");
                    setNewPrice("");
                    setCreateError(null);
                  }}
                >
                  <IconX size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={handleCreate}
                  disabled={createService.isPending}
                >
                  <IconCheck size={16} />
                  {createService.isPending ? "Creating..." : "Save"}
                </button>
              </div>
            </div>
          )}

          {services && services.length > 0 ? (
            <div className={styles.list}>
              {services.map((service) =>
                editingId === service.id ? (
                  <EditableServiceCard
                    key={service.id}
                    service={service}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div key={service.id} className={styles.card}>
                    <div className={styles.viewRow}>
                      <span className={styles.serviceName}>
                        {service.service_name}
                      </span>
                      <span className={styles.servicePrice}>
                        ${formatDollars(service.price)}
                      </span>
                    </div>
                    <div className={styles.viewActions}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => setEditingId(service.id)}
                        aria-label="Edit"
                      >
                        <IconPencil size={17} stroke={1.8} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtnDanger}
                        onClick={() => handleDelete(service)}
                        aria-label="Delete"
                      >
                        <IconTrash size={17} stroke={1.8} />
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            !creating && (
              <div className={styles.empty}>
                <h2>No services yet</h2>
                <p>Add your first service to get started.</p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}