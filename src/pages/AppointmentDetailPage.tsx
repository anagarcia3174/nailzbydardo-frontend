import { useNavigate, useParams } from "react-router-dom";
import {
  useAddDiscount,
  useAddService,
  useAppointment,
  useAppointmentTotal,
  useDeleteAppointment,
  useRemoveDiscount,
  useRemoveService,
  useUpdateAppointment,
} from "../hooks/useAppointments";
import styles from "./AppointmentDetailPage.module.css";
import { useState } from "react";
import LoyaltyHearts from "../components/LoyaltyHearts";
import { IconTrash, IconX } from "@tabler/icons-react";
import { EditServices, type ServiceChanges } from "../components/EditServices";
import { EditDiscounts, type DiscountChanges } from "../components/EditDiscounts";
import type { AppointmentStatus, PaymentMethod } from "../types/appointment";
import type { UpdateAppointmentRequest } from "../api/appointments";

function formatDisplay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatCompactCurrency(cents: number) {
  const value = Math.round(cents / 100);

  return value >= 1000
    ? `$${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`
    : `$${value}`;
}
export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: appointmentDetail, isLoading } = useAppointment(id!);
  const { data: total } = useAppointmentTotal(id!)
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const updateAppointment = useUpdateAppointment(id!);
  const deleteAppointment = useDeleteAppointment();
  const addService = useAddService(id!);
  const removeService = useRemoveService(id!);
  const addDiscount = useAddDiscount(id!);
  const removeDiscount = useRemoveDiscount(id!);

  const [editForm, setEditForm] = useState<UpdateAppointmentRequest | null>(
    null,
  );
const [serviceChanges, setServiceChanges] = useState<ServiceChanges>({
  toAdd: [],
  toRemoveIds: [],
});
const [discountChanges, setDiscountChanges] = useState<DiscountChanges>({
  toAdd: [],
  toRemoveIds: [],
})
  const appointment = appointmentDetail?.appointment;
  const clientSummary = appointmentDetail?.client_summary;
  const completeAppointments = appointmentDetail?.complete_appointments ?? 0;
  const services = appointmentDetail?.appointment_services;
  const discounts = appointmentDetail?.appointment_discounts;

  function updateField<K extends keyof UpdateAppointmentRequest>(
    field: K,
    value: UpdateAppointmentRequest[K],
  ) {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function startEditing() {
    if (!appointment) return;
    setEditForm({
      appt_date: appointment.appt_date,
      appt_status: appointment.appt_status,
      late_fee: appointment.late_fee,
      payment_method: appointment.payment_method,
      notes: appointment.notes,
      receipt_url: appointment.receipt_url,
      loyalty_reward: appointment.loyalty_reward,
      tip: appointment.tip,
    });
    setServiceChanges({ toAdd: [], toRemoveIds: [] });
    setDiscountChanges({ toAdd: [], toRemoveIds: [] })
    setEditing(true);
  }

  function cancelEditing() {
    setEditForm(null);
    setServiceChanges({ toAdd: [], toRemoveIds: [] });
    setDiscountChanges({ toAdd: [], toRemoveIds: [] })
    setEditing(false);
  }

  function validateEditForm(form: UpdateAppointmentRequest): string | null {
    if (!form.appt_date) return "Date and time are required.";
    if (!form.appt_status) return "Status is required.";
    if (form.appt_status === "complete" && !form.payment_method) {
      return "Payment method is required to mark an appointment complete.";
    }
    return null;
  }

  async function handleUpdate() {
    if (!editForm) return;

    const validationError = validateEditForm(editForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    try {
      await updateAppointment.mutateAsync(editForm);

      for (const id of serviceChanges.toRemoveIds) {
      await removeService.mutateAsync(id);
    }
    for (const service of serviceChanges.toAdd) {
      await addService.mutateAsync(service);
    }
 for (const id of discountChanges.toRemoveIds) {
      await removeDiscount.mutateAsync(id);
    }
    for (const discount of discountChanges.toAdd) {
      await addDiscount.mutateAsync(discount);
    }
      setEditForm(null);
      setEditing(false);
    } catch (err) {
      setError("Failed to update appointment. Please try again.");
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Delete this appointment? This can't be undone."))
      return;

    setError(null);
    try {
      await deleteAppointment.mutateAsync(id);
      navigate("/appointments");
    } catch (err) {
      setError("Failed to delete appointment. Please try again.");
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
        <div className={styles.headerLeft}>
          {!editing ? (<button
            onClick={() => navigate("/appointments")}
            className={styles.back}
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
          </button>) : (
            <button onClick={cancelEditing} className={styles.closeButton}>
                              <IconX size={17} />

            </button>
          )}
          
          <h1 className={styles.title}>Appointment</h1>
        </div>
        <div className={styles.headerRight}>
          {!editing ? (
            <button onClick={startEditing} className={styles.editBtn}>
              Edit
            </button>
          ) : ( <button onClick={handleDelete} className={styles.deleteBtn}>
                             <IconTrash size={20} />

            </button>)}
        </div>
      </div>
      <div className={styles.body}>
        {!editing && (
          <>
            <div className={styles.clientCard}>
              <div className={styles.apptAvatar}>
                {clientSummary?.client_name.charAt(0).toUpperCase()}
              </div>
              <div className={styles.apptInfo}>
                <div className={styles.clientName}>
                  {clientSummary?.client_name}
                </div>
                {clientSummary?.contact_method && (
                  <div className={styles.clientSub}>
                    {clientSummary.contact_method}
                  </div>
                )}
              </div>
              <div className={styles.clientCardRight}>
                {appointment?.loyalty_reward && (
                  <span className={styles.rewardBadge}>loyalty </span>
                )}
                <span
                  className={`${styles.statusBadge} ${styles[appointment?.appt_status ?? "booked"]}`}
                >
                  {appointment?.appt_status.replace("_", "-")}
                </span>
              </div>
            </div>
          </>
        )}

        <div className={styles.card}>
          <div className={styles.sectionLabel}>Date & Time</div>

          {editing ? (
            <div className={styles.row}>
              <input
              className={styles.input}
                type="date"
                value={editForm?.appt_date.slice(0, 10) ?? ""}
                onChange={(e) => {
                  if (!editForm) return;
                  const time = editForm.appt_date.slice(11, 16);
                  updateField(
                    "appt_date",
                    new Date(`${e.target.value}T${time}`).toISOString(),
                  );
                }}
              />
              <input
                className={styles.input}
                type="time"
                value={editForm?.appt_date.slice(11, 16) ?? ""}
                onChange={(e) => {
                  if (!editForm) return;
                  const date = editForm.appt_date.slice(0, 10);
                  updateField(
                    "appt_date",
                    new Date(`${date}T${e.target.value}`).toISOString(),
                  );
                }}
              />
            </div>
          ) : (
            <div className={styles.value}>
              <span>
                {appointment?.appt_date && formatDisplay(appointment.appt_date)}
              </span>
              <span className={styles.time}>
                {appointment?.appt_date && formatTime(appointment.appt_date)}
              </span>
            </div>
          )}
        </div>
        {!editing && completeAppointments >= 0 && (
          <LoyaltyHearts
            completedCount={completeAppointments}
            pendingVisit={appointment?.appt_status === "booked"}
            historical={appointment?.appt_status === "complete"}
          />
        )}
 {!editing ? (
  <>
  <div className={styles.card}>
          <div className={styles.sectionLabel}>Charges</div>
         {services?.length === 0 && (
          <p className={styles.noServices}>No services added yet</p>
         )}
         {services?.map((item, i) => (
  <div key={i} className={styles.chargeRow}>
    <div className={styles.chargeInfo}>
      <span>{item.service_name}</span>
      {item.design_price > 0 && (
        <span className={styles.designCharge}>Design add-on</span>
      )}
    </div>
    <div className={styles.chargePrice}>
      <span>
        {formatCompactCurrency(item.service_price + item.design_price)}
      </span>

      {item.design_price > 0 && (
        <span className={styles.designCharge}>
          +{formatCompactCurrency(item.design_price)}
        </span>
      )}
    </div>
  </div>
))}

{discounts?.map((d, i) => {
const amount = d.discount_type === "percent" ? d.discount_value : formatCompactCurrency(d.discount_value)
  return (  <div key={i} className={styles.chargeRow}>
    <div className={styles.chargeInfo}>
      <span>{d.discount_name}</span>
    </div>

    <div className={styles.chargePrice}>
      <span>
        {amount}
      </span>
    </div>
  </div>)
})}

{appointment?.late_fee && appointment?.late_fee > 0 && (
  <div className={styles.chargeRow}>
    <div className={styles.chargeInfo}>
      <span>Late Fee</span>
    </div>

    <div className={styles.chargePrice}>
      <span>
        {formatCompactCurrency(appointment?.late_fee)}
      </span>
    </div>
  </div>
)}
{(total?.tip ?? 0) > 0 && (
  <div className={styles.chargeRow}>
    <div className={styles.chargeInfo}>
      <span>Tip</span>
    </div>

    <div className={styles.chargePrice}>
      <span>
        {formatCompactCurrency(total?.tip ?? 0)}
      </span>
    </div>
  </div>
)}
<div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalValue}>{formatCompactCurrency(total?.grand_total ?? 0)}</span>
              </div>
        </div>
      <div className={styles.smallCard}>
          <div className={styles.sectionLabel}>Payment</div>
<div className={styles.value}>
              {appointment?.payment_method ? appointment?.payment_method.replace("_", " ") : "-"}
              
            </div>
                  </div>
  {appointment?.notes && (
          <div className={styles.card}>
            <div className={styles.sectionLabel}>Notes</div>
              <div className={styles.value}>{appointment.notes}</div>
          </div>
        )}
 
          <div className={styles.smallCard}>
            <div className={styles.sectionLabel}>Appointment Status</div>
             <span
                  className={`${styles.statusBadge} ${styles[appointment?.appt_status ?? "booked"]}`}
                >
                  {appointment?.appt_status.replace("_", "-")}
                </span>
          </div>

           {appointment?.appt_status === "complete" && (
          <div className={styles.smallCard}>
            <div className={styles.sectionLabel}>Receipt</div>
            <a
              target="_blank"
              className={styles.receiptLink}
            >
              →
            </a>
          </div>
        )}
 </>
) : (<>
<EditServices
      existingServices={services ?? []}
      onChange={setServiceChanges}
    />

    <EditDiscounts 
    existingDiscounts={discounts ?? []}
    onChange={setDiscountChanges} />
    <div className={styles.card}>
  <div className={styles.sectionLabel}>Payment Method</div>
  <select
    className={styles.select}
    value={editForm?.payment_method ?? ""}
    onChange={(e) =>
      updateField(
        "payment_method",
        e.target.value === "" ? null : (e.target.value as PaymentMethod),
      )
    }
  >
    <option value="">Not set</option>
    <option value="cash">Cash</option>
    <option value="zelle">Zelle</option>
    <option value="cash_app">Cash App</option>
    <option value="other">Other</option>
  </select>
</div>

<div className={styles.card}>
  <div className={styles.sectionLabel}>Late Fee</div>
  <input
    className={styles.input}
    type="number"
    min="0"
    step="0.01"
    placeholder="0.00"
    value={
      editForm?.late_fee ? (editForm.late_fee / 100).toString() : ""
    }
    onChange={(e) => {
      const dollars = parseFloat(e.target.value);
      updateField(
        "late_fee",
        isNaN(dollars) ? 0 : Math.round(dollars * 100),
      );
    }}
  />
</div>

<div className={styles.card}>
  <div className={styles.sectionLabel}>Tip</div>
  <input
    className={styles.input}
    type="number"
    min="0"
    step="0.01"
    placeholder="0.00"
    value={editForm?.tip ? (editForm.tip / 100).toString() : ""}
    onChange={(e) => {
      const dollars = parseFloat(e.target.value);
      updateField("tip", isNaN(dollars) ? 0 : Math.round(dollars * 100));
    }}
  />
</div>
<div className={styles.card}>
  <div className={styles.sectionLabel}>Appointment Status</div>
  <select
    className={styles.select}
    value={editForm?.appt_status ?? "booked"}
    onChange={(e) =>
      updateField("appt_status", e.target.value as AppointmentStatus)
    }
  >
    <option value="booked">Booked</option>
    <option value="complete">Complete</option>
    <option value="no_show">No-show</option>
    <option value="cancelled">Cancelled</option>
  </select>
</div>

<div className={styles.card}>
  <div className={styles.sectionLabel}>Notes</div>
  <textarea
    className={styles.textarea}
    placeholder="Add any notes about this appointment…"
    value={editForm?.notes ?? ""}
onChange={(e) =>
  updateField("notes", e.target.value === "" ? null : e.target.value)
}  />
</div>
</>)}
      </div>

      {editing && (
  <div className={styles.footer}>
    {error && <p className={styles.errorText}>{error}</p>}
    <button
      type="button"
      className={styles.saveBtn}
      onClick={handleUpdate}
      disabled={updateAppointment.isPending}
    >
      {updateAppointment.isPending ? "Saving…" : "Save Changes"}
    </button>
  </div>
)}
    </main>
  );
}
