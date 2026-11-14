import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Sun,
  LogOut,
  Plus,
  Search,
  ArrowLeft,
  Upload,
  Eye,
  Save,
  LayoutDashboard,
  FileText,
  Package,
  Inbox,
  Image,
  Users,
  Shield,
  MapPin,
} from "lucide-react";
import { api, formatDate } from "../lib";
import {
  contentSchema,
  type Content,
  type ContentInput,
} from "../../shared/schemas";
import { Markdown, Notice } from "../components";
import { SEO } from "../seo";
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
};
type Session = { user: User; csrf: string };
type Enquiry = {
  id: string;
  kind: string;
  name: string;
  organisation: string;
  email: string;
  phone: string;
  country: string;
  category: string;
  interest: string;
  productId: string;
  quantity: number | null;
  message: string;
  status: string;
  emailStatus: string;
  createdAt: string;
};
type Media = {
  id: string;
  url: string;
  filename: string;
  mime: string;
  alt: string;
};
type Audit = {
  id: string;
  action: string;
  userId: string;
  target: string;
  createdAt: string;
};
const kinds = [
  "product",
  "article",
  "category",
  "article-category",
  "company",
  "homepage",
  "metric",
  "market",
  "case-study",
] as const;
const blank: ContentInput = contentSchema.parse({
  kind: "product",
  slug: "new-record",
  title: "New record",
});
export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const [items, setItems] = useState<Content[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [edit, setEdit] = useState<(ContentInput & { id?: string }) | null>(
    null,
  );
  const [preview, setPreview] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    api<Session>("/api/auth/me")
      .then(setSession)
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  const request = useCallback(
    <T,>(url: string, options: RequestInit = {}) =>
      api<T>(url, {
        ...options,
        headers: { ...options.headers, "X-CSRF-Token": session?.csrf || "" },
      }),
    [session?.csrf],
  );
  const refresh = useCallback(async () => {
    if (!session) return;
    setError("");
    try {
      if (tab === "overview") setStats(await request("/api/admin/overview"));
      else if (kinds.includes(tab as (typeof kinds)[number]))
        setItems(await request(`/api/admin/content?kind=${tab}`));
      else if (tab === "enquiries")
        setEnquiries(await request("/api/admin/enquiries"));
      else if (tab === "media") setMedia(await request("/api/admin/media"));
      else if (tab === "users") setUsers(await request("/api/admin/users"));
      else if (tab === "audit") setAudits(await request("/api/admin/audit"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [session, tab, request]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = new FormData(e.currentTarget);
    try {
      setSession(
        await api<Session>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: values.get("email"),
            password: values.get("password"),
          }),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!edit) return;
    setBusy(true);
    setError("");
    try {
      const values = contentSchema.parse(edit);
      await request(`/api/admin/content${edit.id ? `/${edit.id}` : ""}`, {
        method: edit.id ? "PUT" : "POST",
        body: JSON.stringify(values),
      });
      setEdit(null);
      setNotice("Content saved.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }
  if (checking)
    return <div className="admin-login">Checking your session…</div>;
  if (!session)
    return (
      <div className="admin-login">
        <SEO title="Administration" noindex />
        <form onSubmit={login}>
          <Link to="/" className="admin-brand">
            <Sun /> AFRISUN ENERGY
          </Link>
          <p className="eyebrow">Content administration</p>
          <h1>Welcome back.</h1>
          <p>Sign in with your authorised company account.</p>
          <label className="form-field">
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label className="form-field">
            Password
            <input
              name="password"
              type="password"
              minLength={12}
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button disabled={busy} className="button button-navy">
            {busy ? "Signing in…" : "Sign In"}
            <ArrowLeft className="rotate-arrow" size={17} />
          </button>
          <Link to="/" className="text-link">
            Back to website
          </Link>
        </form>
      </div>
    );
  const input = (name: keyof ContentInput, label: string, textarea = false) => {
    if (!edit) return null;
    return (
      <label className={`form-field ${textarea ? "full-width" : ""}`}>
        {label}
        {textarea ? (
          <textarea
            rows={name === "body" ? 14 : 3}
            value={String(edit[name] ?? "")}
            onChange={(e) => setEdit({ ...edit, [name]: e.target.value })}
          />
        ) : (
          <input
            value={String(edit[name] ?? "")}
            onChange={(e) => setEdit({ ...edit, [name]: e.target.value })}
          />
        )}
      </label>
    );
  };
  const tabs = [
    ["overview", "Overview", LayoutDashboard],
    ["product", "Products", Package],
    ["category", "Product categories", Package],
    ["article", "Articles", FileText],
    ["article-category", "Article categories", FileText],
    ["homepage", "Homepage content", Sun],
    ["company", "Company information", FileText],
    ["metric", "Impact metrics", Sun],
    ["market", "Market footprint", MapPin],
    ["case-study", "Case studies", FileText],
    ["media", "Media library", Image],
    ...(session.user.role === "admin"
      ? [
          ["enquiries", "Enquiries", Inbox],
          ["users", "Users & permissions", Users],
          ["audit", "Audit log", Shield],
        ]
      : []),
  ];
  return (
    <div className="admin-shell">
      <SEO title="Administration" noindex />
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand">
          <Sun />
          AFRISUN<span>CONTENT STUDIO</span>
        </Link>
        <nav aria-label="Administration">
          {tabs.map(([key, label, Icon]) => {
            const I = Icon as typeof Sun;
            return (
              <button
                key={String(key)}
                className={tab === key ? "selected" : ""}
                onClick={() => {
                  setTab(String(key));
                  setEdit(null);
                  setPreview(false);
                  setNotice("");
                }}
              >
                <I size={18} />
                {String(label)}
              </button>
            );
          })}
        </nav>
        <div className="admin-user">
          <strong>{session.user.name}</strong>
          <small>{session.user.role}</small>
          <button
            onClick={async () => {
              try {
                await request("/api/auth/logout", { method: "POST" });
                setSession(null);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-top">
          <span>
            AFRISUN ENERGY / {tabs.find((t) => t[0] === tab)?.[1] as string}
          </span>
          <Link to="/">View website ↗</Link>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        {edit ? (
          <form onSubmit={save}>
            <div className="admin-title">
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setEdit(null);
                  setPreview(false);
                }}
              >
                <ArrowLeft size={18} />
                All records
              </button>
              <div className="actions">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setPreview(!preview)}
                >
                  <Eye size={17} />
                  {preview ? "Edit" : "Preview draft"}
                </button>
                <button className="button button-navy" disabled={busy}>
                  <Save size={17} />
                  {busy ? "Saving…" : "Save content"}
                </button>
              </div>
            </div>
            <h1>
              {edit.id ? "Edit" : "Create"} {edit.kind.replace("-", " ")}
            </h1>
            {preview ? (
              <article className="draft-preview">
                <span className="status-badge">PRIVATE DRAFT PREVIEW</span>
                <h1>{edit.title}</h1>
                <p>{edit.description}</p>
                {edit.image && <img src={edit.image} alt={edit.imageAlt} />}
                <Markdown>{edit.body}</Markdown>
              </article>
            ) : (
              <>
                <div className="form-grid">
                  {input("title", "Title *")}
                  {input("slug", "URL slug *")}
                  {input("description", "Summary / description", true)}
                  {input(
                    "body",
                    "Content — Markdown supports headings, tables, images and links",
                    true,
                  )}
                  {["product", "article"].includes(edit.kind) && (
                    <>
                      {input("category", "Category slug")}
                      {edit.kind === "product" ? (
                        <>
                          {input("brand", "Brand — verified only")}
                          {input("model", "Model — verified only")}
                          <label className="form-field">
                            Availability
                            <select
                              value={edit.availability}
                              onChange={(e) =>
                                setEdit({
                                  ...edit,
                                  availability: e.target
                                    .value as ContentInput["availability"],
                                })
                              }
                            >
                              {[
                                "enquiry",
                                "available",
                                "unavailable",
                                "on-order",
                              ].map((v) => (
                                <option key={v}>{v}</option>
                              ))}
                            </select>
                          </label>
                          {input(
                            "datasheet",
                            "Datasheet URL from media library",
                          )}
                          {input("applications", "Applications", true)}
                          {input(
                            "warranty",
                            "Confirmed warranty information",
                            true,
                          )}
                          <label className="form-field full-width">
                            Specifications — one name: value per line
                            <textarea
                              rows={5}
                              value={edit.specifications
                                .map((s) => `${s.name}: ${s.value}`)
                                .join("\n")}
                              onChange={(e) =>
                                setEdit({
                                  ...edit,
                                  specifications: e.target.value
                                    .split("\n")
                                    .map((line) => {
                                      const i = line.indexOf(":");
                                      return {
                                        name: i < 0 ? line : line.slice(0, i),
                                        value:
                                          i < 0 ? "" : line.slice(i + 1).trim(),
                                      };
                                    })
                                    .filter((s) => s.name),
                                })
                              }
                            />
                          </label>
                        </>
                      ) : (
                        input("author", "Author *")
                      )}
                    </>
                  )}
                  {input("image", "Image URL from media library")}
                  {input("imageAlt", "Descriptive image alternative text")}
                  {input("seoTitle", "SEO title — up to 70 characters")}
                  {input(
                    "seoDescription",
                    "SEO description — up to 180 characters",
                  )}
                  <label className="form-field">
                    Publication date (UTC)
                    <input
                      type="datetime-local"
                      value={edit.publishedAt?.slice(0, 16) || ""}
                      onChange={(e) =>
                        setEdit({
                          ...edit,
                          publishedAt: e.target.value
                            ? new Date(e.target.value + "Z").toISOString()
                            : null,
                        })
                      }
                    />
                  </label>
                  <label className="form-field">
                    Display order
                    <input
                      type="number"
                      min="0"
                      value={edit.order}
                      onChange={(e) =>
                        setEdit({ ...edit, order: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="form-field">
                    Status
                    <select
                      value={edit.status}
                      onChange={(e) =>
                        setEdit({
                          ...edit,
                          status: e.target.value as ContentInput["status"],
                        })
                      }
                    >
                      {["draft", "published", "archived"].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="admin-checkboxes">
                  {(["verified", "demo", "featured"] as const).map((key) => (
                    <label className="consent" key={key}>
                      <input
                        type="checkbox"
                        checked={edit[key]}
                        onChange={(e) =>
                          setEdit({ ...edit, [key]: e.target.checked })
                        }
                      />
                      {key === "verified"
                        ? "Business owner has verified and approved this content"
                        : key === "demo"
                          ? "Demonstration record (cannot be published)"
                          : "Feature on homepage / listing"}
                    </label>
                  ))}
                </div>
                <p className="fine-print">
                  Published, verified records become public on their publication
                  date. Articles require an author, date and body. Draft and
                  archived records remain private.
                </p>
              </>
            )}
          </form>
        ) : (
          <>
            <div className="admin-title">
              <div>
                <p className="eyebrow">Your content, connected</p>
                <h1>{tabs.find((t) => t[0] === tab)?.[1] as string}</h1>
              </div>
              {kinds.includes(tab as (typeof kinds)[number]) && (
                <button
                  className="button button-navy"
                  onClick={() =>
                    setEdit({
                      ...blank,
                      kind: tab as ContentInput["kind"],
                      title: "",
                      slug: "",
                    })
                  }
                >
                  <Plus size={17} />
                  Create record
                </button>
              )}
            </div>
            {tab === "overview" && (
              <>
                <div className="admin-stats">
                  {Object.entries(stats).map(([label, value]) => (
                    <div key={label}>
                      <span>{value}</span>
                      <p>{label}</p>
                    </div>
                  ))}
                </div>
                <Notice
                  title="Publish with confidence"
                  text="Only verified content can be published. Product and article demonstrations remain private. Enquiry counts come from stored records."
                />
                <p>
                  Use Company information → slug “introduction” to override the
                  homepage introduction. Use Homepage content → slug “hero” to
                  override the homepage hero title and summary. Other approved
                  company details remain version-controlled to prevent
                  inconsistent legal/contact information.
                </p>
              </>
            )}
            {kinds.includes(tab as (typeof kinds)[number]) && (
              <>
                <label className="search-field">
                  <Search size={18} />
                  <span className="sr-only">Search records</span>
                  <input
                    placeholder="Search records…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Verified</th>
                        <th>Updated</th>
                        <th>Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items
                        .filter((i) =>
                          i.title.toLowerCase().includes(search.toLowerCase()),
                        )
                        .map((item) => (
                          <tr key={item.id}>
                            <td>
                              {item.title}
                              <small>/{item.slug}</small>
                            </td>
                            <td>
                              {item.status}
                              {item.demo ? " · demo" : ""}
                            </td>
                            <td>{item.verified ? "Yes" : "No"}</td>
                            <td>{formatDate(item.updatedAt)}</td>
                            <td>
                              <button
                                className="text-link"
                                onClick={() => setEdit(item)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {!items.length && (
                  <p>No records yet. Create a draft to get started.</p>
                )}
              </>
            )}
            {tab === "enquiries" && (
              <>
                <div className="actions">
                  <label className="search-field">
                    <Search size={17} />
                    <span className="sr-only">Search enquiries</span>
                    <input
                      placeholder="Search name, company, type or status…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  <a className="button button-outline" href="/api/admin/export">
                    Export CSV
                  </a>
                </div>
                {enquiries
                  .filter((e) =>
                    `${e.name} ${e.organisation} ${e.kind} ${e.status}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((e) => (
                    <details className="enquiry-record" key={e.id}>
                      <summary>
                        <strong>{e.name}</strong> · {e.organisation}
                        <span>
                          {e.kind} / {e.status}
                        </span>
                      </summary>
                      <div>
                        <p>{e.message}</p>
                        <dl>
                          {Object.entries(e)
                            .filter(([k]) => k !== "message")
                            .map(([k, v]) => (
                              <div key={k}>
                                <dt>{k}</dt>
                                <dd>{String(v ?? "—")}</dd>
                              </div>
                            ))}
                        </dl>
                        <label className="form-field">
                          Follow-up status
                          <select
                            value={e.status}
                            onChange={async (event) => {
                              try {
                                await request(`/api/admin/enquiries/${e.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    status: event.target.value,
                                  }),
                                });
                                await refresh();
                              } catch (e) {
                                setError((e as Error).message);
                              }
                            }}
                          >
                            {["new", "in-progress", "closed"].map((x) => (
                              <option key={x}>{x}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </details>
                  ))}
                {!enquiries.length && <p>No enquiries have been received.</p>}
              </>
            )}
            {tab === "media" && (
              <>
                <form
                  className="admin-upload"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    const form = e.currentTarget;
                    try {
                      const data = new FormData(form);
                      await request("/api/admin/media", {
                        method: "POST",
                        body: data,
                      });
                      form.reset();
                      await refresh();
                      setNotice(
                        "Media uploaded. Copy its URL into your content record.",
                      );
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <label className="form-field">
                    Image or datasheet (JPEG, PNG, WebP, PDF; max 10 MB)
                    <input
                      type="file"
                      name="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      required
                    />
                  </label>
                  <label className="form-field">
                    Alternative text / file description
                    <input name="alt" maxLength={300} required />
                  </label>
                  <button className="button button-navy" disabled={busy}>
                    <Upload size={17} />
                    {busy ? "Uploading…" : "Upload media"}
                  </button>
                </form>
                <div className="media-grid">
                  {media.map((m) => (
                    <article key={m.id}>
                      {m.mime.startsWith("image/") ? (
                        <img src={m.url} alt={m.alt} />
                      ) : (
                        <FileText size={50} />
                      )}
                      <h3>{m.filename}</h3>
                      <p>{m.alt}</p>
                      <label className="form-field">
                        Media URL
                        <input
                          readOnly
                          value={m.url}
                          onFocus={(e) => e.target.select()}
                        />
                      </label>
                      <a
                        className="text-link"
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open file ↗
                      </a>
                    </article>
                  ))}
                </div>
              </>
            )}
            {tab === "users" && (
              <>
                <form
                  className="admin-upload"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const values = Object.fromEntries(new FormData(form));
                    try {
                      await request("/api/admin/users", {
                        method: "POST",
                        body: JSON.stringify(values),
                      });
                      form.reset();
                      await refresh();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  <h2>Add authorised user</h2>
                  <div className="form-grid">
                    {["name", "email", "password"].map((k) => (
                      <label className="form-field" key={k}>
                        {k}
                        <input
                          name={k}
                          type={
                            k === "password"
                              ? "password"
                              : k === "email"
                                ? "email"
                                : "text"
                          }
                          minLength={k === "password" ? 14 : 1}
                          required
                          autoComplete="off"
                        />
                      </label>
                    ))}
                    <label className="form-field">
                      Role
                      <select name="role">
                        <option value="editor">Editor — content & media</option>
                        <option value="admin">
                          Administrator — all records & users
                        </option>
                      </select>
                    </label>
                  </div>
                  <button className="button button-navy">Create user</button>
                </form>
                {users.map((u) => (
                  <div className="user-record" key={u.id}>
                    <strong>{u.name}</strong>
                    <span>{u.email}</span>
                    <span>
                      {u.role} · {u.active ? "Active" : "Disabled"}
                    </span>
                    {u.id !== session.user.id && (
                      <button
                        className="text-link"
                        onClick={async () => {
                          try {
                            await request(`/api/admin/users/${u.id}`, {
                              method: "PATCH",
                              body: JSON.stringify({
                                role: u.role,
                                active: !u.active,
                              }),
                            });
                            await refresh();
                          } catch (e) {
                            setError((e as Error).message);
                          }
                        }}
                      >
                        {u.active ? "Disable access" : "Enable access"}
                      </button>
                    )}
                  </div>
                ))}
              </>
            )}
            {tab === "audit" && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>User</th>
                      <th>Record</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits.map((a) => (
                      <tr key={a.id}>
                        <td>{a.action}</td>
                        <td>{a.userId}</td>
                        <td>{a.target}</td>
                        <td>{formatDate(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
