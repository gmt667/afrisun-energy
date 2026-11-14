import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { enquirySchema } from "../shared/schemas";
import { api, useApi } from "./lib";
import { company } from "../shared/content";
import { Link, useSearchParams } from "react-router-dom";
type Values = z.input<typeof enquirySchema>;
export function EnquiryForm({
  kind,
  productId = "",
  productName = "",
}: {
  kind: "contact" | "quote" | "partnership";
  productId?: string;
  productName?: string;
}) {
  const [params] = useSearchParams();
  const { data: config, loading } = useApi("/api/config", {
    enquiriesEnabled: false,
  });
  const [challenge, setChallenge] = useState("");
  const [result, setResult] = useState<{
    message: string;
    notification: string;
    id: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [startedAt] = useState(() => Date.now());
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values, unknown, z.output<typeof enquirySchema>>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      kind,
      productId,
      quantity: kind === "quote" ? 1 : undefined,
      website: "",
      country: "",
      category: "",
      interest: params.get("interest") || "",
      startedAt,
    },
  });
  useEffect(() => {
    api<{ challenge: string }>("/api/challenge")
      .then((x) => setChallenge(x.challenge))
      .catch(() =>
        setError("The secure form is unavailable. Please contact us directly."),
      );
  }, []);
  if (result)
    return (
      <div className="form-success" role="status">
        <CheckCircle size={42} />
        <h3>Thank you for connecting.</h3>
        <p>{result.message}</p>
        <p>{result.notification}</p>
        <small>Reference: {result.id}</small>
        <Link to="/" className="text-link">
          Return to Afrisun
        </Link>
      </div>
    );
  const submit = handleSubmit(async (values) => {
    setError("");
    try {
      const response = await api<{
        message: string;
        notification: string;
        id: string;
      }>("/api/enquiries", {
        method: "POST",
        body: JSON.stringify({ ...values, challenge }),
      });
      setResult(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    }
  });
  const field = (
    name: "name" | "organisation" | "email" | "phone" | "country" | "interest",
    label: string,
    type = "text",
  ) => (
    <label className="form-field">
      {label}
      <input
        type={type}
        autoComplete={
          {
            name: "name",
            organisation: "organization",
            email: "email",
            phone: "tel",
            country: "country-name",
            interest: "off",
          }[name]
        }
        {...register(name)}
        aria-invalid={!!errors[name]}
      />
      {errors[name] && (
        <span className="field-error">{errors[name]?.message}</span>
      )}
    </label>
  );
  return (
    <form onSubmit={submit} className="enquiry-form" noValidate>
      <h3>
        {kind === "quote"
          ? "Request a product quote"
          : kind === "partnership"
            ? "Partnership enquiry"
            : "Send us a message"}
      </h3>
      {!loading && !config.enquiriesEnabled && (
        <div className="form-info">
          <AlertCircle size={20} />
          <p>
            Online submissions are awaiting activation. Please{" "}
            <a href={`mailto:${company.email}`}>email</a> or{" "}
            <a href="tel:+27635483486">call Afrisun</a> directly.
          </p>
        </div>
      )}
      <div className="form-grid">
        {field("name", "Full name *")}
        {field("organisation", "Organisation *")}
        {field("email", "Email address *", "email")}
        {field("phone", "Phone number *", "tel")}
        {kind !== "contact" && field("country", "Delivery country / country *")}
        {kind !== "quote" && (
          <label className="form-field">
            {kind === "contact" ? "I am a *" : "Partnership category *"}
            <select {...register("category")} aria-invalid={!!errors.category}>
              <option value="">Please select</option>
              {[
                "Manufacturer",
                "Distributor",
                "Retailer",
                "Development partner",
                "Other",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            {errors.category && (
              <span className="field-error">{errors.category.message}</span>
            )}
          </label>
        )}
        {kind === "partnership" &&
          field("interest", "Product or service interest")}
        {kind === "quote" && (
          <>
            <label className="form-field">
              Product
              <input value={productName} readOnly />
              <input type="hidden" {...register("productId")} />
              {errors.productId && (
                <span className="field-error">{errors.productId.message}</span>
              )}
            </label>
            <label className="form-field">
              Quantity *
              <input
                type="number"
                min="1"
                max="1000000"
                {...register("quantity")}
              />
              {errors.quantity && (
                <span className="field-error">{errors.quantity.message}</span>
              )}
            </label>
          </>
        )}
      </div>
      <label className="form-field">
        Message *
        <textarea
          rows={5}
          {...register("message")}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <span className="field-error">{errors.message.message}</span>
        )}
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>
      <label className="consent">
        <input type="checkbox" {...register("consent")} />
        <span>
          I have read the <Link to="/privacy">privacy notice</Link> and agree
          that Afrisun may use my details to respond to this enquiry. *
        </span>
      </label>
      {errors.consent && (
        <p className="field-error">{errors.consent.message}</p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="button button-navy"
        disabled={!config.enquiriesEnabled || !challenge || isSubmitting}
      >
        {isSubmitting
          ? "Submitting…"
          : config.enquiriesEnabled
            ? "Send Enquiry"
            : "Online Submissions Not Yet Enabled"}
        <Send size={17} />
      </button>
      <p className="fine-print">
        Your enquiry is not an order, credit application or contractual
        commitment.
      </p>
    </form>
  );
}
