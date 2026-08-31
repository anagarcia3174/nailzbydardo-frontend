import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useClient,
  useClientAppointments,
  useUpdateClient,
  useDeleteClient,
} from "../hooks/useClients";
import { ApiError } from "../api/client";

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id!);
  const { data: appointments } = useClientAppointments(id!);
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

  async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setError(null);

  try {
    await updateClient.mutateAsync({
      client_name: form.client_name,
      contact_method: form.contact_method || null,
      notes: form.notes || null,
      birthday: form.birthday
        ? new Date(form.birthday).toISOString()
        : null,
    });

    setEditOpen(false);
  } catch (err) {
    setError(
      err instanceof ApiError
        ? err.message
        : "Something went wrong"
    );
  }
}

  async function handleDelete() {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    await deleteClient.mutateAsync(id!);
    navigate("/clients");
  }

if (isLoading || !client) {
  return (
    <div className="loading">
      <div className="spinner" />
    </div>
  );
}

  return (
  <main className="client-detail-page">
    <button
      className="back-button"
      onClick={() => navigate("/clients")}
    >
      ← Clients
    </button>

    <div className="client-detail-header">
      <div className="client-heading">
        <div className="client-detail-avatar">
          {client.client_name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1>{client.client_name}</h1>
          <p>
            {client.contact_method ?? "No contact method"}
          </p>
        </div>
      </div>

      <div className="client-actions">
        <button
          className="secondary-button"
          onClick={openEdit}
        >
          Edit
        </button>

        <button
          className="danger-button"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>

    {/* Client information */}
    <section className="detail-section">
      <h2>Client Information</h2>

      <div className="client-details-card">
        {client.contact_method && (
          <div className="detail-row">
            <span>Contact</span>
            <strong>{client.contact_method}</strong>
          </div>
        )}

        {client.birthday && (
          <div className="detail-row">
            <span>Birthday</span>
            <strong>
              {new Date(client.birthday).toLocaleDateString()}
            </strong>
          </div>
        )}

        {client.notes && (
          <div className="detail-notes">
            <span>Notes</span>
            <p>{client.notes}</p>
          </div>
        )}
      </div>
    </section>

    {/* Appointment history */}
    <section className="detail-section">
      <div className="section-header">
        <h2>Appointment History</h2>
      </div>

      {appointments && appointments.length === 0 ? (
        <p className="empty-message">
          No appointments yet.
        </p>
      ) : (
        <div className="appointment-list">
          {appointments?.map((appt) => (
            <button
              key={appt.id}
              className="appointment-card"
              onClick={() =>
                navigate(`/appointments/${appt.id}`)
              }
            >
              <div>
                <strong>
                  {new Date(
                    appt.appt_date
                  ).toLocaleDateString()}
                </strong>

                <span>
                  {new Date(
                    appt.appt_date
                  ).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="appointment-right">
                <span
                  className={`status-badge status-${appt.appt_status.toLowerCase()}`}
                >
                  {appt.appt_status}
                </span>

                <span className="appointment-arrow">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>

    {/* Edit modal */}
    {editOpen && (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>Edit Client</h2>

            <button
              className="modal-close"
              onClick={() => setEditOpen(false)}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            <label>
              Name

              <input
                type="text"
                required
                value={form.client_name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    client_name: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Contact Method

              <input
                type="text"
                value={form.contact_method}
                onChange={(event) =>
                  setForm({
                    ...form,
                    contact_method: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Notes

              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm({
                    ...form,
                    notes: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Birthday

              <input
                type="date"
                value={form.birthday}
                onChange={(event) =>
                  setForm({
                    ...form,
                    birthday: event.target.value,
                  })
                }
              />
            </label>

            <button
              type="submit"
              className="primary-button modal-submit"
              disabled={updateClient.isPending}
            >
              {updateClient.isPending
                ? "Saving..."
                : "Save"}
            </button>
          </form>
        </div>
      </div>
    )}
  </main>
);
}