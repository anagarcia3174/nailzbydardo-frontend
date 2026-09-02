import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useClient,
  useClientAppointments,
  useUpdateClient,
  useDeleteClient,
  useClientSpent,
} from "../hooks/useClients";
import { ApiError } from "../api/client";
import styles from "./ClientDetailPage.module.css";
import LoyaltyHearts from "../components/LoyaltyHearts";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id!);
  const { data: appointments } = useClientAppointments(id!);
  const { data: spent } = useClientSpent(id!);
  const updateClient = useUpdateClient(id!);
  const deleteClient = useDeleteClient();

  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    client_name: "",
    contact_method: "",
    notes: "",
    birthday: "",
  });

  const statusClass: Record<string, string> = {
    booked: styles.booked,
    complete: styles.complete,
    no_show: styles.noShow,
    cancelled: styles.cancelled,
  };

  function openEdit() {
    setForm({
      client_name: client?.client_name ?? "",
      contact_method: client?.contact_method ?? "",
      notes: client?.notes ?? "",
      birthday: client?.birthday
        ? new Date(client.birthday).toISOString().split("T")[0]
        : "",
    });

    setError(null);
    setEditOpen(true);
  }

  async function handleSubmit() {
    setError(null);

    try {
      await updateClient.mutateAsync({
        client_name: form.client_name,
        contact_method: form.contact_method || null,
        notes: form.notes || null,
        birthday: form.birthday ? new Date(form.birthday).toISOString() : null,
      });

      setEditOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    await deleteClient.mutateAsync(id!);
    navigate("/clients");
  }

  function formatBirthday(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  }

  function formatCompactCurrency(cents: number) {
    const value = Math.round(cents / 100);

    return value >= 1000
      ? `$${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`
      : `$${value}`;
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  }

  const completedAppointments =
    appointments?.filter((a) => a.appt_status === "complete") ?? [];

  const lastAppointment =
    completedAppointments.length > 0
      ? completedAppointments.reduce((latest, a) =>
          new Date(a.appt_date) > new Date(latest.appt_date) ? a : latest,
        ).appt_date
      : null;

  const stats = {
    totalAppointments: appointments?.length ?? 0,
    totalSpent: spent?.total_spent,
    totalTips: spent?.total_tips,
  };

  if (isLoading || !client) {
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
        <div className={styles.headerLeft}>
          <button className={styles.back} onClick={() => navigate("/clients")}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
        {!editOpen && (
          <button onClick={openEdit} className={styles.editBtn}>
            Edit
          </button>
        )}
      </div>

      <div className={styles.body}>
        {editOpen ? (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input
                type="text"
                value={form.client_name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    client_name: event.target.value,
                  })
                }
                className={styles.input}
                placeholder="Client name"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Contact Method</label>
              <input
                type="text"
                value={form.contact_method}
                onChange={(event) =>
                  setForm({
                    ...form,
                    contact_method: event.target.value,
                  })
                }
                className={styles.input}
                placeholder="Phone or @handle"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Birthday</label>
              <input
                type="date"
                value={form.birthday}
                onChange={(event) =>
                  setForm({
                    ...form,
                    birthday: event.target.value,
                  })
                }
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm({
                    ...form,
                    notes: event.target.value,
                  })
                }
                className={styles.textarea}
                placeholder="Allergies, preferences…"
                rows={3}
              />
            </div>
          </>
        ) : (
          <>
            <div className={styles.profileCard}>
              <div className={styles.avatar}>
                {client.client_name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.clientName}>{client.client_name}</div>
              {client.contact_method && (
                <div className={styles.clientSub}>{client.contact_method}</div>
              )}
              {client.birthday && (
                <div className={styles.clientSub}>
                  🎂 {formatBirthday(client.birthday)}
                </div>
              )}
              {client.notes && (
                <div className={styles.clientNotes}>{client.notes}</div>
              )}
            </div>
            <LoyaltyHearts completedCount={completedAppointments.length} />
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {stats.totalAppointments}
                </div>
                <div className={styles.statLabel}>Appts</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {formatCompactCurrency(stats.totalSpent ?? 0)}
                </div>
                <div className={styles.statLabel}>Spent</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {formatCompactCurrency(stats.totalTips ?? 0)}
                </div>
                <div className={styles.statLabel}>Tips</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {formatDate(lastAppointment)}
                </div>
                <div className={styles.statLabel}>Last Visit</div>
              </div>
            </div>
            {appointments?.length != 0 && (
              <>
                <div className={styles.sectionLabel}>Appointment History</div>
                <div className={styles.apptList}>
                  {appointments?.map((appt) => (
                    <div
                      key={appt.id}
                      className={styles.apptRow}
                      onClick={() => navigate(`/appointments/${appt.id}`)}
                    >
                      <span className={styles.apptDate}>
                        {formatDate(appt.appt_date)}
                      </span>
                      <span
                        className={`${styles.apptStatus} ${statusClass[appt.appt_status]}`}
                      >
                        {appt.appt_status.replace("_", "-")}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className={styles.footer}>
        {error && <p className={styles.error}>{error}</p>}
        {editOpen ? (
          <div className={styles.actionsRow}>
            <button
              onClick={() => setEditOpen(false)}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={updateClient.isPending}
              className={styles.saveBtn}
            >
              {updateClient.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        ) : (
          <button onClick={handleDelete} className={styles.deleteBtn}>
            Delete Client
          </button>
        )}
      </div>
    </main>
  );
}
