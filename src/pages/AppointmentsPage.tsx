import { IconPlus } from "@tabler/icons-react";
import { useAppointments } from "../hooks/useAppointments";
import styles from "./AppointmentsPage.module.css";
import type { AppointmentStatus } from "../types/appointment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const statuses: AppointmentStatus[] = [
  "booked",
  "complete",
  "no_show",
  "cancelled",
];

function getInitials(clientId: string) {
  return clientId.slice(0, 1).toUpperCase();
}

function formatAppointmentDate(dateString: string) {
  const date = new Date(dateString);

  return {
    date: date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

function formatStatus(status: AppointmentStatus) {
  return status
    .replace("_", "-")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatEmptyStatus(status: AppointmentStatus) {
  return status.replace("_", "-");
}

export function AppointmentsPage() {
  const { data: appointments, isLoading } = useAppointments();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>("booked");
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      </main>
    );
  }

  const filtered =
    appointments?.filter((a) => a.appt_status === statusFilter) ?? [];

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.content}>
          <div className={styles.headerTop}>
            <h1>Appointments</h1>

            <button
              type="button"
              className={styles.newButton}
              onClick={() => navigate("/appointments/new")}
            >
              <IconPlus size={18} stroke={2} />
              <span>New</span>
            </button>
          </div>

          <div className={styles.statusChips}>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                type="button"
                className={`${styles.pill} ${statusFilter === status ? styles.pillActive : ""}`}
              >
                {formatStatus(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.content}>
          {filtered.length === 0 && (
            <p className={styles.empty}>
              No {formatEmptyStatus(statusFilter)} appointments
            </p>
          )}

          {filtered.length > 0 && (
            <div className={styles.list}>
              {filtered.map((appt) => {
                const formatted = formatAppointmentDate(appt.appt_date);

                return (
                  <div
                    key={appt.id}
                    className={styles.card}
                    onClick={() => navigate(`/appointments/${appt.id}`)}
                  >
                    <div className={styles.avatar}>
                      {getInitials(appt.client_name)}
                    </div>
                    <div className={styles.cardInfo}>
                      <span className={styles.clientName}>
                        {appt.client_name}
                      </span>
                    </div>
                    <div className={styles.cardRight}>
                      <span className={styles.apptDate}>{formatted.date}</span>
                      <span className={styles.apptTime}>{formatted.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
