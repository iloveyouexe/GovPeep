import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  FileText,
  LoaderCircle,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import type { Jurisdiction, RequestStatus } from "@govpeep/contracts";
import { useAuth } from "../lib/auth";

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={20} /> Loading your workspace…
    </div>
  );
}
export function ErrorMessage({ children }: { children: ReactNode }) {
  return children ? (
    <div className="error-message" role="alert">
      <AlertCircle size={18} />
      <span>{children}</span>
    </div>
  ) : null;
}
export function Empty({
  title,
  description,
  to,
  action,
}: {
  title: string;
  description: string;
  to?: string;
  action?: string;
}) {
  return (
    <div className="empty-state">
      <div className="icon-tile">
        <FileText size={25} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {to && (
        <Link className="button primary" to={to}>
          {action}
        </Link>
      )}
    </div>
  );
}
export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`badge status-${status}`}>
      {status === "filed"
        ? "Filed manually"
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, error, refresh } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (error)
    return (
      <>
        <ErrorMessage>{error}</ErrorMessage>
        <button className="button" onClick={refresh}>
          Try again
        </button>
      </>
    );
  if (!user)
    return (
      <Empty
        title="A workspace of your own"
        description="Sign in with your email to save requests, keep a private history, and pick up where you left off."
        to={
          "/sign-in?next=" +
          encodeURIComponent(location.pathname + location.search)
        }
        action="Sign in or create an account"
      />
    );
  return <>{children}</>;
}
export function Guidance({ jurisdiction }: { jurisdiction: Jurisdiction }) {
  return (
    <section className="guidance panel">
      <div className="section-label">
        <BookOpen size={17} /> {jurisdiction.name} guidance
      </div>
      <p>{jurisdiction.summary}</p>
      <ul>
        {jurisdiction.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      {jurisdiction.guidanceVersion && (
        <p className="caption">
          Introductory guidance · {jurisdiction.guidanceVersion}
        </p>
      )}
      {jurisdiction.sources.length > 0 && (
        <div className="source-list">
          <h3>Sources & filing instructions</h3>
          {jurisdiction.sources.map((s) => (
            <a href={s.url} key={s.url} target="_blank" rel="noreferrer">
              {s.title}
              <ArrowUpRight size={14} />
              {s.checkedAt && <small>Checked {s.checkedAt}</small>}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
