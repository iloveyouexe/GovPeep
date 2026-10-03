import { Link } from "react-router-dom";
import {
  ArrowRight,
  FilePenLine,
  Building2,
  CalendarClock,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import type { RecordsRequest } from "@govpeep/contracts";
import { useAuth } from "../lib/auth";
import { dateLabel, useResource } from "../lib/api";
import { ErrorMessage, PageHeading, StatusBadge } from "../components/ui";

export function Overview() {
  const { user } = useAuth();
  const requests = useResource<RecordsRequest[]>(user ? "/api/requests" : null);
  const rows = requests.data || [];
  return (
    <>
      <PageHeading
        eyebrow="A CLEARER PATH TO PUBLIC RECORDS"
        title={
          user
            ? `Welcome back${user.name ? ", " + user.name.split(" ")[0] : ""}.`
            : "Public records. Within reach."
        }
        description={
          user
            ? "Your requests, your next steps, all in one place."
            : "Find the right office. Put your request into words. Keep the whole journey organized."
        }
      />
      <section className="hero-panel">
        <div>
          <span className="hero-kicker">
            <span className="live-dot" /> YOUR NEXT QUESTION STARTS HERE
          </span>
          <h2>
            What would you
            <br />
            like to find out?
          </h2>
          <p>
            Turn a question about your government into a focused request for
            existing records.
          </p>
          <div className="button-row">
            <Link to="/requests/new" className="button primary">
              <Plus size={17} /> Create a request
            </Link>
            <Link to="/directory" className="button">
              Find a public office <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="paper-card paper-back" />
          <div className="paper-card">
            <div className="paper-top">
              <FilePenLine size={21} />
              <span>PUBLIC RECORDS REQUEST</span>
            </div>
            <div className="paper-line wide" />
            <div className="paper-line" />
            <div className="paper-line medium" />
            <div className="paper-divider" />
            <div className="paper-line wide" />
            <div className="paper-line medium" />
            <div className="paper-chip">
              A clear starting point <span>↗</span>
            </div>
          </div>
          <div className="illustration-tag">
            <span className="live-dot" /> Saved to your workspace
          </div>
        </div>
      </section>
      {user && (
        <>
          <div className="stat-grid">
            {[
              [
                "Drafts",
                rows.filter((r) => r.status === "draft").length,
                "Ready when you are",
              ],
              [
                "In progress",
                rows.filter((r) => ["filed", "acknowledged"].includes(r.status))
                  .length,
                "Keep the conversation going",
              ],
              [
                "Completed",
                rows.filter((r) => r.status === "completed").length,
                "Records journey completed",
              ],
            ].map(([label, count, hint]) => (
              <div className="stat-card" key={label}>
                <span>{label}</span>
                <strong>{count}</strong>
                <small>{hint}</small>
              </div>
            ))}
          </div>
          <ErrorMessage>{requests.error}</ErrorMessage>
        </>
      )}
      <div className="section-heading">
        <h2>{user ? "Recent requests" : "A simpler way to get started"}</h2>
        {user && (
          <Link to="/requests" className="text-link">
            View all <ArrowRight size={15} />
          </Link>
        )}
      </div>
      {user && rows.length > 0 ? (
        <div className="panel request-table">
          {rows.slice(0, 4).map((r) => (
            <Link className="request-row" to={"/requests/" + r.id} key={r.id}>
              <span className="file-icon">
                <FilePenLine size={20} />
              </span>
              <div>
                <strong>{r.title}</strong>
                <small>
                  {r.recipientName} · Updated {dateLabel(r.updatedAt)}
                </small>
              </div>
              <StatusBadge status={r.status} />
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="feature-grid">
          <Link to="/directory" className="feature-card">
            <Building2 size={23} />
            <h3>Find the right recipient</h3>
            <p>
              Explore public offices and see what is source-checked before you
              file.
            </p>
            <span>
              Browse the directory <ArrowRight size={15} />
            </span>
          </Link>
          <Link to="/requests/new" className="feature-card">
            <FilePenLine size={23} />
            <h3>Start with a clear draft</h3>
            <p>
              Describe the records, choose a date range, and preview your
              request as you write.
            </p>
            <span>
              Create a manual draft <ArrowRight size={15} />
            </span>
          </Link>
          <Link to="/schedules" className="feature-card">
            <CalendarClock size={23} />
            <h3>
              Build a regular habit <small className="soon">Coming next</small>
            </h3>
            <p>
              Recurring drafts and email reminders are the next part of the
              journey.
            </p>
            <span>
              See what is planned <ArrowRight size={15} />
            </span>
          </Link>
        </div>
      )}
    </>
  );
}
