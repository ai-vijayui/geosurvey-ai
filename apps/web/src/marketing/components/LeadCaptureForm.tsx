import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../../lib/api";
import { useNotifications } from "../../context/NotificationContext";

type LeadCaptureFormProps = {
  interest: "contact" | "demo";
  sourcePage: string;
  submitLabel?: string;
  successTitle?: string;
  compact?: boolean;
};

type InquiryResponse = {
  accepted: boolean;
  referenceId: string;
  message: string;
};

const initialForm = {
  name: "",
  email: "",
  company: "",
  teamSize: "",
  message: "",
  website: ""
};

export function LeadCaptureForm({
  interest,
  sourcePage,
  submitLabel = "Request Demo",
  successTitle = "Request received",
  compact = false
}: LeadCaptureFormProps) {
  const { addNotification } = useNotifications();
  const [form, setForm] = useState(initialForm);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitInquiry = useMutation({
    mutationFn: () =>
      apiPost<InquiryResponse>("/api/marketing/contact", {
        ...form,
        interest,
        sourcePage
      }),
    onSuccess: (response) => {
      setSuccessMessage(response.message);
      setErrorMessage(null);
      setForm(initialForm);
      addNotification({
        title: successTitle,
        message: response.message,
        tone: "success",
        source: "marketing"
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "We could not send your request.";
      setErrorMessage(message);
      setSuccessMessage(null);
      addNotification({
        title: "Request failed",
        message,
        tone: "error",
        source: "marketing"
      });
    }
  });

  const isDisabled =
    submitInquiry.isPending ||
    form.name.trim().length < 2 ||
    form.email.trim().length < 5 ||
    form.company.trim().length < 2 ||
    form.message.trim().length < 10;

  return (
    <div className={`marketing-contact-form marketing-panel-card${compact ? " marketing-contact-form--compact" : ""}`}>
      <input
        type="text"
        value={form.website}
        onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="marketing-contact-form__honeypot"
      />

      <label className="ui-field">
        <span className="ui-field__label">Name</span>
        <input
          type="text"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Your name"
        />
      </label>

      <label className="ui-field">
        <span className="ui-field__label">Work email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="you@company.com"
        />
      </label>

      <label className="ui-field">
        <span className="ui-field__label">Company</span>
        <input
          type="text"
          value={form.company}
          onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
          placeholder="Company name"
        />
      </label>

      <label className="ui-field">
        <span className="ui-field__label">Team size</span>
        <input
          type="text"
          value={form.teamSize}
          onChange={(event) => setForm((current) => ({ ...current, teamSize: event.target.value }))}
          placeholder="Optional"
        />
      </label>

      <label className="ui-field">
        <span className="ui-field__label">{interest === "demo" ? "What should we show?" : "What are you evaluating?"}</span>
        <textarea
          rows={compact ? 4 : 5}
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          placeholder={
            interest === "demo"
              ? "Tell us which workflow, data type, or use case you want to see."
              : "Tell us about your survey workflow, team size, or delivery challenges."
          }
        />
      </label>

      {successMessage ? <div className="marketing-form-state marketing-form-state--success">{successMessage}</div> : null}
      {errorMessage ? <div className="marketing-form-state marketing-form-state--error">{errorMessage}</div> : null}

      <button type="button" className="ui-button ui-button--primary ui-button--full" disabled={isDisabled} onClick={() => submitInquiry.mutate()}>
        {submitInquiry.isPending ? "Sending..." : submitLabel}
      </button>
    </div>
  );
}
