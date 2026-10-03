import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  FilePenLine,
  History,
  Save,
  Trash2,
} from "lucide-react";
import {
  draftSchema,
  renderLetter,
  type Draft,
  type Entity,
  type Jurisdiction,
  type RequestDetail,
  type RequestStatus,
} from "@govpeep/contracts";
import { api, dateLabel, useResource } from "../lib/api";
import { useAuth } from "../lib/auth";
import {
  AuthGate,
  ErrorMessage,
  Guidance,
  Loading,
  PageHeading,
  StatusBadge,
} from "../components/ui";

export function RequestPage() {
  return (
    <AuthGate>
      <RequestLoader />
    </AuthGate>
  );
}
function RequestLoader() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const entityId = params.get("entity");
  const detail = useResource<RequestDetail>(
    id ? "/api/requests/" + encodeURIComponent(id) : null,
  );
  const selection = useResource<{ entity: Entity; jurisdiction: Jurisdiction }>(
    !id && entityId ? "/api/entities/" + encodeURIComponent(entityId) : null,
  );
  if (detail.error || selection.error)
    return <ErrorMessage>{detail.error || selection.error}</ErrorMessage>;
  if (
    (id && (!detail.data || detail.data.request.id !== id)) ||
    (!id && entityId && !selection.data)
  )
    return <Loading />;
  return (
    <Editor
      key={id ? `${id}:${detail.data?.request.version}` : "new:" + entityId}
      detail={id ? detail.data : null}
      entity={id ? detail.data?.entity || null : selection.data?.entity || null}
      defaultJurisdiction={params.get("jurisdiction") || ""}
      refresh={detail.reload}
    />
  );
}
function Editor({
  detail,
  entity,
  defaultJurisdiction,
  refresh,
}: {
  detail: RequestDetail | null;
  entity: Entity | null;
  defaultJurisdiction: string;
  refresh: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initial: Draft = detail
    ? draftSchema.parse(detail.request)
    : {
        title: "",
        entityId: entity?.id || null,
        recipientName: entity?.name || "",
        recipientEmail: entity?.filingEmail || "",
        jurisdictionId: entity?.jurisdictionId || defaultJurisdiction,
        description: "",
        dateFrom: "",
        dateTo: "",
        requesterName: user?.name || "",
        requesterEmail: user?.email || "",
        feeLimit: null,
      };
  const [draft, setDraft] = useState<Draft>(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState<RequestStatus>(
    detail?.request.status === "draft"
      ? "filed"
      : detail?.request.status === "filed"
        ? "acknowledged"
        : "completed",
  );
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [reference, setReference] = useState(
    detail?.request.referenceNumber || "",
  );
  const [note, setNote] = useState("");
  const locked = Boolean(detail && detail.request.status !== "draft");
  const dirty = !locked && JSON.stringify(draft) !== JSON.stringify(initial);
  const jurisdictions =
    useResource<Pick<Jurisdiction, "id" | "name">[]>("/api/jurisdictions");
  const guidance = useResource<Jurisdiction>(
    !locked && draft.jurisdictionId
      ? "/api/jurisdictions/" + encodeURIComponent(draft.jurisdictionId)
      : null,
  );
  const currentGuidance = locked ? detail?.jurisdiction : guidance.data;
  const letter = renderLetter(draft);
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((previous) => ({ ...previous, [key]: value }));

  useEffect(() => {
    if (!dirty) return;
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const leave = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a");
      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        !link.href ||
        link.hash ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      if (
        link.href !== window.location.href &&
        !window.confirm("You have unsaved changes. Leave this draft?")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", leave, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", leave, true);
    };
  }, [dirty]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = draftSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (detail) {
        await api("/api/requests/" + detail.request.id, {
          method: "PUT",
          body: JSON.stringify({
            draft: parsed.data,
            version: detail.request.version,
          }),
        });
        refresh();
      } else {
        const result = await api<{ id: string }>("/api/requests", {
          method: "POST",
          body: JSON.stringify(parsed.data),
        });
        navigate("/requests/" + result.id, { replace: true });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function record(event: FormEvent) {
    event.preventDefault();
    if (!detail) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/requests/${detail.request.id}/events`, {
        method: "POST",
        body: JSON.stringify({
          status,
          occurredAt,
          referenceNumber: reference,
          note,
          version: detail.request.version,
        }),
      });
      refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([letter], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download =
      (draft.title.replace(/[^\w -]/g, "").slice(0, 80) ||
        "public-records-request") + ".txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function remove() {
    if (!detail || !window.confirm("Delete this draft and its history?"))
      return;
    setBusy(true);
    try {
      await api("/api/requests/" + detail.request.id, { method: "DELETE" });
      navigate("/requests");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  const statusOptions =
    detail?.request.status === "draft"
      ? ["filed"]
      : detail?.request.status === "filed"
        ? ["acknowledged", "completed", "closed"]
        : ["completed", "closed"];
  return (
    <>
      <Link to="/requests" className="text-link back-link">
        <ArrowLeft size={15} /> My requests
      </Link>
      <PageHeading
        eyebrow={detail ? "REQUEST WORKSPACE" : "A NEW START"}
        title={detail ? detail.request.title : "Build a clear request"}
        description={
          locked
            ? "Your filed request is preserved. Add updates as the conversation progresses."
            : "Choose your recipient, describe the records, and make it your own."
        }
        action={detail && <StatusBadge status={detail.request.status} />}
      />
      <ErrorMessage>
        {error || jurisdictions.error || guidance.error}
      </ErrorMessage>
      <div className="editor-layout">
        <div className="stack">
          <form
            id="request-form"
            onSubmit={save}
            className="panel request-form"
          >
            <fieldset disabled={locked || busy}>
              <div className="form-section">
                <div className="form-section-heading">
                  <span>01</span>
                  <div>
                    <h2>Where is it going?</h2>
                    <p>
                      The office that holds the records is the best place to
                      start.
                    </p>
                  </div>
                </div>
                <label>
                  Request title
                  <input
                    value={draft.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g. Oak Street road project contracts"
                    required
                    maxLength={160}
                  />
                </label>
                <div className="field-grid">
                  <label>
                    Jurisdiction
                    <select
                      value={draft.jurisdictionId}
                      onChange={(e) => update("jurisdictionId", e.target.value)}
                      disabled={Boolean(entity)}
                      required
                    >
                      <option value="" disabled>
                        Select a state or federal jurisdiction
                      </option>
                      {jurisdictions.data?.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Recipient name
                    <input
                      value={draft.recipientName}
                      onChange={(e) => update("recipientName", e.target.value)}
                      readOnly={Boolean(entity)}
                      placeholder="City clerk or records office"
                      required
                      maxLength={200}
                    />
                  </label>
                </div>
                <label>
                  Recipient email{" "}
                  <span className="optional">if applicable</span>
                  <input
                    type="email"
                    value={draft.recipientEmail}
                    onChange={(e) => update("recipientEmail", e.target.value)}
                    placeholder="Use the official filing instructions"
                  />
                </label>
                {!entity && (
                  <Link to="/directory" className="text-link">
                    Find an office in the directory <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>
              <div className="form-section">
                <div className="form-section-heading">
                  <span>02</span>
                  <div>
                    <h2>What records do you need?</h2>
                    <p>
                      Ask for documents that exist, with enough detail to locate
                      them.
                    </p>
                  </div>
                </div>
                <label>
                  Records description
                  <textarea
                    rows={7}
                    value={draft.description}
                    onChange={(e) => update("description", e.target.value)}
                    maxLength={12000}
                    placeholder="The awarded contract, amendments, and approved change orders for the Oak Street resurfacing project…"
                  />
                </label>
                <div className="field-grid">
                  <label>
                    From <span className="optional">optional</span>
                    <input
                      type="date"
                      value={draft.dateFrom}
                      onChange={(e) => update("dateFrom", e.target.value)}
                    />
                  </label>
                  <label>
                    Through <span className="optional">optional</span>
                    <input
                      type="date"
                      value={draft.dateTo}
                      min={draft.dateFrom || undefined}
                      onChange={(e) => update("dateTo", e.target.value)}
                    />
                  </label>
                </div>
                <p className="field-hint">
                  Useful starting points: a contract number, project name,
                  address, department, or specific period.
                </p>
              </div>
              <div className="form-section">
                <div className="form-section-heading">
                  <span>03</span>
                  <div>
                    <h2>Your details & preferences</h2>
                    <p>These details appear in your letter.</p>
                  </div>
                </div>
                <div className="field-grid">
                  <label>
                    Your name
                    <input
                      value={draft.requesterName}
                      onChange={(e) => update("requesterName", e.target.value)}
                      autoComplete="name"
                      maxLength={200}
                    />
                  </label>
                  <label>
                    Your contact email
                    <input
                      type="email"
                      value={draft.requesterEmail}
                      onChange={(e) => update("requesterEmail", e.target.value)}
                      autoComplete="email"
                    />
                  </label>
                </div>
                <label>
                  Contact me before fees exceed{" "}
                  <span className="optional">USD · optional</span>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    step="0.01"
                    value={draft.feeLimit ?? ""}
                    onChange={(e) =>
                      update(
                        "feeLimit",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    placeholder="Ask for an estimate before any charge"
                  />
                </label>
                <p className="field-hint">
                  The recipient may require its own form, identity information,
                  or payment arrangements. Review its official instructions
                  before filing.
                </p>
              </div>
            </fieldset>
            {!locked && (
              <div className="save-bar">
                <span className="caption">
                  {dirty
                    ? "Unsaved changes"
                    : detail
                      ? "Saved " + dateLabel(detail.request.updatedAt)
                      : "Your draft is not saved yet"}
                </span>
                <button
                  type="submit"
                  className="button primary"
                  disabled={busy || (Boolean(detail) && !dirty)}
                >
                  <Save size={16} />
                  {busy ? "Saving…" : "Save draft"}
                </button>
              </div>
            )}
          </form>
          {detail && (
            <section className="panel padded">
              <div className="section-label">
                <History size={18} /> Request timeline
              </div>
              <ol className="timeline">
                {detail.events.map((event) => (
                  <li key={event.id}>
                    <span className="timeline-dot" />
                    <div>
                      <strong>
                        {event.kind.charAt(0).toUpperCase() +
                          event.kind.slice(1)}
                      </strong>
                      <small>{dateLabel(event.occurredAt)}</small>
                      <p>{event.note}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
        <aside className="stack editor-aside">
          <section className="panel letter-panel">
            <div className="letter-toolbar">
              <span className="section-label">
                <FilePenLine size={17} /> Request preview
              </span>
              <span className="badge badge-neutral">Template-based</span>
            </div>
            <pre className="letter-preview">{letter}</pre>
            <div className="letter-actions">
              <button
                className="button"
                type="button"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(letter)
                    .then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    })
                    .catch(() =>
                      setError(
                        "Copy was unavailable. Download the letter instead.",
                      ),
                    );
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
                {copied ? "Copied" : "Copy text"}
              </button>
              <button className="button" type="button" onClick={download}>
                <Download size={15} /> Download .txt
              </button>
            </div>
          </section>
          {entity && (
            <section className="panel padded">
              <h3>How to file with this office</h3>
              <p>{entity.instructions}</p>
              <a
                className="text-link"
                href={entity.filingUrl || entity.website}
                target="_blank"
                rel="noreferrer"
              >
                Open official instructions <ArrowUpRight size={15} />
              </a>
            </section>
          )}
          <div className="notice">
            <strong>Prepared here. Filed by you.</strong>
            <p>
              Copy or download your letter, then submit using the office’s
              required process. Saving a draft never sends it.
            </p>
          </div>
          {detail &&
            !["completed", "closed"].includes(detail.request.status) && (
              <section className="panel padded">
                <h3>
                  {locked ? "Record an update" : "Already filed this request?"}
                </h3>
                <p>
                  {locked
                    ? "Keep track of acknowledgments and outcomes."
                    : "Record the date and reference after you submit it yourself."}
                </p>
                {dirty && (
                  <p className="field-hint">
                    Save your changes before recording filing.
                  </p>
                )}
                <button
                  className="button full-width"
                  disabled={dirty || busy}
                  onClick={() => setRecording(!recording)}
                >
                  {recording
                    ? "Cancel update"
                    : locked
                      ? "Add a status update"
                      : "Record manual filing"}
                </button>
                {recording && (
                  <form onSubmit={record} className="form-stack event-form">
                    <label>
                      Status
                      <select
                        value={status}
                        onChange={(e) =>
                          setStatus(e.target.value as RequestStatus)
                        }
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s === "filed"
                              ? "Filed manually"
                              : s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Date
                      <input
                        type="date"
                        value={occurredAt}
                        max={new Date().toISOString().slice(0, 10)}
                        min={detail.request.filedAt || undefined}
                        onChange={(e) => setOccurredAt(e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Agency reference{" "}
                      <span className="optional">optional</span>
                      <input
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        maxLength={200}
                      />
                    </label>
                    <label>
                      Note <span className="optional">optional</span>
                      <textarea
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={3000}
                      />
                    </label>
                    <button className="button primary" disabled={busy}>
                      Save update
                    </button>
                  </form>
                )}
              </section>
            )}
          {currentGuidance && <Guidance jurisdiction={currentGuidance} />}
          {detail && !locked && (
            <button
              className="button danger"
              disabled={busy}
              onClick={() => {
                void remove();
              }}
            >
              <Trash2 size={15} /> Delete draft
            </button>
          )}
        </aside>
      </div>
    </>
  );
}
