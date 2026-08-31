import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconPlus, IconSearch, IconX, IconChevronRight, IconUsers } from "@tabler/icons-react";

import { useClients, useCreateClient } from "../hooks/useClients";
import { ApiError } from "../api/client";
import styles from "./ClientsPage.module.css";

export function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    client_name: "",
    contact_method: "",
    notes: "",
    birthday: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    try {
      await createClient.mutateAsync({
        client_name: form.client_name,
        contact_method: form.contact_method || null,
        notes: form.notes || null,
        birthday: form.birthday
          ? new Date(form.birthday).toISOString()
          : null,
      });

      setForm({
        client_name: "",
        contact_method: "",
        notes: "",
        birthday: "",
      });

      setModalOpen(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong"
      );
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

  const filteredClients = clients?.filter((client) =>
    client.client_name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className={styles.stickyHeader}>
        <header className={styles.header}>
          <div>
            <h1>Clients</h1>
          </div>

          <button
            type="button"
            className={styles.newButton}
            onClick={() => setModalOpen(true)}
          >
            <IconPlus size={18} stroke={2} />
            <span>New</span>
          </button>
        </header>

        <div className={styles.searchWrapper}>
          <IconSearch
            className={styles.searchIcon}
            size={19}
            stroke={1.8}
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clients..."
            className={styles.search}
          />

          {search && (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <IconX size={17} />
            </button>
          )}
        </div>
        </div>

        {filteredClients && filteredClients.length > 0 ? (
          <div className={styles.list}>
            {filteredClients.map((client) => (
              <button
                key={client.id}
                type="button"
                className={styles.card}
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <div className={styles.avatar}>
                  {client.client_name.charAt(0).toUpperCase()}
                </div>

                <div className={styles.info}>
                  <span className={styles.name}>
                    {client.client_name}
                  </span>

                  {client.contact_method && (
                    <span className={styles.sub}>
                      {client.contact_method}
                    </span>
                  )}
                </div>

                <IconChevronRight
                  className={styles.arrow}
                  size={19}
                  stroke={1.7}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <IconUsers size={24} stroke={1.5} />
            </div>

            <h2>
              {search ? "No clients found" : "No clients yet"}
            </h2>

            <p>
              {search
                ? "Try searching for a different name."
                : "Add your first client to get started."}
            </p>

            {!search && (
              <button
                type="button"
                className={styles.emptyButton}
                onClick={() => setModalOpen(true)}
              >
                <IconPlus size={17} />
                Add Client
              </button>
            )}
          </div>
        )}

      </div>
        {modalOpen && (
          <div
            className={styles.overlay}
            onClick={() => setModalOpen(false)}
          >
            <div
              className={styles.modal}
              onClick={(event) => event.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div>
                  <h2>Add Client</h2>
                </div>

                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setModalOpen(false)}
                  aria-label="Close"
                >
                  <IconX size={20} />
                </button>
              </div>

              <form
  id="add-client-form"
  className={styles.form}
  onSubmit={handleSubmit}
>
                {error && (
                  <p className={styles.formError}>
                    {error}
                  </p>
                )}

                <label className={styles.field}>
                  <span>Name</span>
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

                <label className={styles.field}>
                  <span>Contact Method</span>
                  <input
                    type="text"
                    placeholder="Instagram, phone, etc."
                    value={form.contact_method}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        contact_method: event.target.value,
                      })
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>Notes</span>
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

                <label className={styles.field}>
                  <span>Birthday</span>
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

              </form>
                <div className={styles.bottomBar}>
  <button
    type="submit"
    form="add-client-form"
    className={styles.submitButton}
    disabled={createClient.isPending}
  >
    {createClient.isPending ? "Creating..." : "Create Client"}
  </button>
</div>
            </div>
          </div>
        )}
    </main>
  );
}