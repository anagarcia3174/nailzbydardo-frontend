import { useNavigate, useParams } from "react-router-dom";
import { useAppointment, useAppointmentTotal } from "../hooks/useAppointments";
import styles from "./AppointmentReceiptPage.module.css";
import { toPng } from "html-to-image";
import { useState } from "react";

function formatReceiptDate(dateStr: string) {
  const date = new Date(dateStr);

  return (
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) +
    " · " +
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
}

function usd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

const paymentLabel: Record<string, string> = {
  cash: "CASH",
  zelle: "ZELLE",
  cash_app: "CASH APP",
  other: "OTHER",
};

export function AppointmentReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: appointmentDetail, isLoading } = useAppointment(id!);
  const { data: total } = useAppointmentTotal(id!);
  const [ saving, setSaving ] = useState(false);
  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      </main>
    );
  }

  const appointment = appointmentDetail?.appointment;
  const clientSummary = appointmentDetail?.client_summary;
  const services = appointmentDetail?.appointment_services ?? [];
  const discounts = appointmentDetail?.appointment_discounts ?? [];
  const completeAppointments =
    appointmentDetail?.complete_appointments ?? 0;

  if (!appointment) {
    return (
      <main className={styles.page}>
        <div className={styles.notFound}>
          <p>Appointment not found.</p>
          <button
            className={styles.backButton}
            onClick={() => navigate("/appointments")}
          >
            Back to appointments
          </button>
        </div>
      </main>
    );
  }

  const receiptNumber = `#${appointment.id.slice(0, 8).toUpperCase()}`;

  const clientName = clientSummary?.client_name ?? "";
  const firstName = clientName.split(" ")[0];

  const servicesTotal = services.reduce(
    (sum, item) => sum + item.service_price + item.design_price,
    0,
  );

  const hasDiscounts = discounts.length > 0;
  const lateFee = appointment.late_fee ?? 0;
  const tip = total?.tip ?? 0;

  const hasModifiers = hasDiscounts || lateFee > 0 || tip > 0;
async function handleSave() {
    const node = document.getElementById('receipt-card')
    if (!node) return
    setSaving(true)
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: Math.min(window.devicePixelRatio * 2, 4),
      })

      const file = new File(
        [await (await fetch(dataUrl)).blob()],
        'receipt.png',
        { type: 'image/png' }
      )

      // iOS Safari blocks the <a download> click below once it lands after
      // this async work, since the tap's user-activation window has expired.
      // Sharing the file instead still opens the native save sheet.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Receipt' })
      } else {
        const link = document.createElement('a')
        link.download = 'receipt.png'
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Failed to save image', err)
      }
    } finally {
      setSaving(false)
    }
  }
  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(`/appointments/${id}`)}
          aria-label="Back to appointment"
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
      </div>

      <div className={styles.receipt} id="receipt-card">
        <div className={styles.tearTop} />

        <div className={styles.inner}>
          {/* Header */}
          <div className={styles.headerSection}>
            <div className={styles.salonName}>NailzByDardo</div>

            <div className={styles.salonSub}>
              {/* Instagram */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>

              {/* TikTok */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
              </svg>

              {/* Facebook */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
          </div>

          <hr className={styles.dash} />

          {/* Receipt information */}
          <table className={styles.infoTable}>
            <tbody>
              <tr className={styles.infoRow}>
                <td className={styles.infoLabel}>Receipt</td>
                <td className={styles.infoValue}>{receiptNumber}</td>
              </tr>

              <tr className={styles.infoRow}>
                <td className={styles.infoLabel}>Date</td>
                <td className={styles.infoValue}>
                  {formatReceiptDate(appointment.appt_date)}
                </td>
              </tr>

              <tr className={styles.infoRow}>
                <td className={styles.infoLabel}>Client</td>
                <td className={styles.infoValue}>
                  {clientName.toUpperCase()}
                </td>
              </tr>
            </tbody>
          </table>

          <hr className={styles.dash} />

          {/* Services */}
          {services.length > 0 && (
            <div className={styles.services}>
              {services.map((item, i) => (
                <div key={i}>
                  <div className={styles.serviceRow}>
                    <span className={styles.serviceName}>
                      {item.service_name}
                    </span>

                    <span className={styles.serviceAmount}>
                      {usd(item.service_price)}
                    </span>
                  </div>

                  {item.design_price > 0 && (
                    <div className={styles.designRow}>
                      <span className={styles.designName}>
                        Design add-on
                      </span>

                      <span className={styles.designAmount}>
                        {usd(item.design_price)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <hr className={styles.dash} />

          {/* Totals */}
          <div className={styles.totals}>
            {hasModifiers && (
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Subtotal</span>
                <span className={styles.totalAmount}>
                  {usd(servicesTotal)}
                </span>
              </div>
            )}

            {discounts.map((discount, i) => {
              const discountAmount =
                discount.discount_type === "percent"
                  ? Math.round(
                      servicesTotal * (discount.discount_value / 100),
                    )
                  : discount.discount_value;

              const label =
                discount.discount_type === "percent"
                  ? `${discount.discount_name} (–${discount.discount_value}%)`
                  : discount.discount_name;

              return (
                <div key={i} className={styles.totalRow}>
                  <span
                    className={`${styles.totalLabel} ${styles.discountLabel}`}
                  >
                    {label}
                  </span>

                  <span
                    className={`${styles.totalAmount} ${styles.discountAmount}`}
                  >
                    –{usd(discountAmount)}
                  </span>
                </div>
              );
            })}

            {lateFee > 0 && (
              <div className={styles.totalRow}>
                <span
                  className={`${styles.totalLabel} ${styles.lateFeeLabel}`}
                >
                  Late fee
                </span>

                <span
                  className={`${styles.totalAmount} ${styles.lateFeeAmount}`}
                >
                  {usd(lateFee)}
                </span>
              </div>
            )}

            {tip > 0 && (
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Tip</span>

                <span className={styles.totalAmount}>{usd(tip)}</span>
              </div>
            )}
          </div>

          {/* Grand total */}
          <div className={styles.grandTotalBox}>
            <span className={styles.grandTotalLabel}>total</span>

            <span className={styles.grandTotalAmount}>
              {usd(total?.grand_total ?? 0)}
            </span>
          </div>

          {/* Payment */}
          <div className={styles.payment}>
            Paid ·{" "}
            {paymentLabel[appointment.payment_method ?? ""] ?? "—"}
          </div>

          <hr className={styles.dash} />

          {/* Thank you */}
          <div className={styles.thankYouSection}>
            <div className={styles.thankYouText}>thank you,</div>
            <div className={styles.clientNameThank}>
              {firstName} ♥
            </div>
          </div>

          {/* Loyalty */}
          {completeAppointments > 0 && (
            <div className={styles.loyaltySection}>
              <div className={styles.loyaltyHearts}>
                {Array.from({ length: 6 }).map((_, i) => {
                  const filled =
                    completeAppointments % 6 === 0
                      ? 6
                      : completeAppointments % 6;

                  return (
                    <svg
                      key={i}
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      className={
                        i < filled
                          ? styles.heartFilled
                          : styles.heartEmpty
                      }
                    >
                      <path
                        d={
                          i < filled
                            ? "M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
                            : "M16.5 3c-1.74 0-3.41.81-4.5 2.08C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.41 2 8.5c0 3.77 3.4 6.86 8.55 11.53L12 21.35l1.45-1.32C18.6 15.36 22 12.27 22 8.5 22 5.41 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
                        }
                      />
                    </svg>
                  );
                })}
              </div>

              <div className={styles.loyaltyLabel}>
                Loyalty discount on your 6th visit
              </div>
            </div>
          )}
        </div>

        <div className={styles.tearBottom} />
      </div>

      <button
  type="button"
  className={styles.saveButton}
  onClick={handleSave}
  disabled={saving}
>
      {saving ? 'Saving…' : 'Save Receipt'}
</button>
    </main>
  );
}