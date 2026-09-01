import { useNavigate } from "react-router-dom";

import { useDashboard } from "../hooks/useDashboard";
import styles from "./DashboardPage.module.css";

function formatCompactCurrency(cents: number) {
  const value = Math.round(cents / 100);

  return value >= 1000
    ? `$${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`
    : `$${value}`;
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

function getInitials(clientId: string) {
  return clientId.slice(0, 1).toUpperCase();
}

function isToday(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function DashboardPage() {
  const { data: dashboard, isLoading } = useDashboard();
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

  if (!dashboard) {
    return (
      <main className={styles.page}>
        <div className={styles.empty}>
          <h2>Unable to load dashboard</h2>
          <p>Please try again.</p>
        </div>
      </main>
    );
  }

  const upcomingAppointments = dashboard.upcoming_appointments.slice(0, 5);
  const hasToday = upcomingAppointments.some((appointment) =>
    isToday(appointment.appt_date),
  );
  const appointmentsLabel = hasToday ? "Today" : "Up Next";

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        {/* Greeting */}
        <header className={styles.header}>
          <p className={styles.date}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>

          <h1>
            Hi, <span>Dardo!</span>
          </h1>
        </header>

        {/* Upcoming */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{appointmentsLabel}</h2>

          {upcomingAppointments.length > 0 ? (
            <div className={styles.appointments}>
              {upcomingAppointments.map((appointment) => {
                const formatted = formatAppointmentDate(appointment.appt_date);

                return (
                  <button
                    key={appointment.id}
                    type="button"
                    className={styles.appointmentCard}
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                  >
                    <div className={styles.avatar}>
                      {getInitials(appointment.client_name)}
                    </div>

                    <div className={styles.clientInfo}>
                      <span className={styles.clientName}>
                        {appointment.client_name}
                      </span>
                    </div>

                    <div className={styles.appointmentTime}>
                      <span className={styles.appointmentDate}>
                        {formatted.date}
                      </span>

                      <span className={styles.time}>{formatted.time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyUpcoming}>
              <h3>No upcoming appointments</h3>

              <button
                type="button"
                className={styles.emptyBtn}
                onClick={() => navigate("/appointments/new")}
              >
                Book one now
              </button>
            </div>
          )}
        </section>

        {/* Monthly stats */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>This Month</h2>

          <div className={styles.statsCard}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {formatCompactCurrency(dashboard.monthly_revenue)}
              </span>

              <span className={styles.statLabel}>Revenue</span>
            </div>

            <div className={styles.divider} />

            <div className={styles.stat}>
              <span className={styles.statValue}>
                {dashboard.monthly_appointment_count}
              </span>

              <span className={styles.statLabel}>Appointments</span>
            </div>

            <div className={styles.divider} />

            <div className={styles.stat}>
              <span className={styles.statValue}>
                {formatCompactCurrency(dashboard.monthly_expenses)}
              </span>

              <span className={styles.statLabel}>Expenses</span>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>

          <div className={styles.shortcutGrid}>
            <button
              type="button"
              className={styles.shortcutTile}
              onClick={() => navigate("/appointments/new")}
            >
              <span className={styles.shortcutIcon}>＋</span>
              <span>New Appointment</span>
            </button>

            <button
              type="button"
              className={styles.shortcutTile}
              onClick={() => navigate("/clients/new")}
            >
              <span className={styles.shortcutIcon}>＋</span>
              <span>New Client</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
