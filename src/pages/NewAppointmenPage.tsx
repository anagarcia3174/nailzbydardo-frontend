import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClients } from "../hooks/useClients";
import { useCreateAppointment } from "../hooks/useAppointments";
import styles from "./NewAppointmentPage.module.css";

export function NewAppointmentPage() {
  const navigate = useNavigate();
  const { data: clients } = useClients();
  const createAppointment = useCreateAppointment();

  const [clientSearch, setClientSearch] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    const term = clientSearch.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((c) => c.client_name.toLowerCase().includes(term));
  }, [clients, clientSearch]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelectClient(id: string, name: string) {
    setClientId(id);
    setClientSearch(name);
    setDropdownOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError("Select a client from the list");
      return;
    }
    if (!apptDate || !apptTime) {
      setError("Date and time are required");
      return;
    }

    const combined = new Date(`${apptDate}T${apptTime}`);
    if (isNaN(combined.getTime())) {
      setError("Invalid date or time");
      return;
    }

    try {
      const appointment = await createAppointment.mutateAsync({
        client_id: clientId,
        appt_date: combined.toISOString(),
        notes: notes.trim() ? notes.trim() : null,
      });
      navigate(`/appointments/${appointment.id}`);
    } catch {
      setError("Something went wrong creating the appointment");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate(-1)}
        >
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
        <h1 className={styles.title}>New Appointment</h1>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Client</label>
            <input
              type="text"
              placeholder="Search clients..."
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setClientId(null);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => {
                setTimeout(() => setDropdownOpen(false), 150);
              }}
              className={styles.input}
            />
            {dropdownOpen && <div className={styles.dropdown}></div>}
            {dropdownOpen && (
              <div className={styles.dropdown}>
                {filteredClients.length === 0 ? (
                  <div className={styles.noResults}>No clients found</div>
                ) : (
                  filteredClients.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className={styles.dropdownItem}
                      onClick={() => handleSelectClient(c.id, c.client_name)}
                    >
                      {c.client_name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Date</label>
              <input
                type="date"
                value={apptDate}
                onChange={(e) => setApptDate(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Time</label>
              <input
                type="time"
                value={apptTime}
                onChange={(e) => setApptTime(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
              placeholder="Any notes about this appointment..."
              rows={3}
            />
          </div>
        </div>
        <div className={styles.footer}>
          {error && <p className={styles.error}>{error}</p>}
          <button
            type="submit"
            disabled={createAppointment.isPending}
            className={styles.submit}
          >
            {createAppointment.isPending ? "Creating..." : "Create Appointment"}
          </button>
        </div>
      </form>
    </main>
  );
}
