import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, AlertCircle } from "lucide-react";
import { enquirySchema } from "../shared/schemas";
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values, unknown, z.output<typeof enquirySchema>>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      kind,
      productId,
      quantity: kind === "quote" ? 1 : undefined,
      country: "",
      category: "",
      interest: params.get("interest") || "",
    },
  });
  const recipient = kind === "contact" ? company.contactEmail : company.email;
  const submit = handleSubmit((values) => {
    const subject =
      kind === "quote"
        ? `Product enquiry: ${productName}`
        : kind === "partnership"
          ? "Partnership enquiry"
          : "Website enquiry";
    const body = Object.entries({ ...values, productName })
      .filter(([key, value]) => key !== "consent" && value)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    window.open(
      `mailto:${recipient}?${new URLSearchParams({ subject, body })}`,
      "_self",
    );
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
      <div className="form-info">
        <AlertCircle size={20} />
        <p>
          This static site prepares a message in your email app. You can also{" "}
          <a href={`mailto:${recipient}`}>email us directly</a>.
        </p>
      </div>
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
      <button
        type="submit"
        className="button button-navy"
      >
        Prepare Email
        <Send size={17} />
      </button>
      <p className="fine-print">
        Your email is not an order, credit application or contractual
        commitment. Nothing is sent until you review and send it from your email
        app.
      </p>
    </form>
  );
}
