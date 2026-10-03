import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, FileText, Plus, Search } from "lucide-react";
import type { RecordsRequest } from "@govpeep/contracts";
import { useAuth } from "../lib/auth";
import { dateLabel, useResource } from "../lib/api";
import {
  AuthGate,
  Empty,
  ErrorMessage,
  Loading,
  PageHeading,
  StatusBadge,
} from "../components/ui";

export function RequestList() {
  return (
    <AuthGate>
      <List />
    </AuthGate>
  );
}
function List() {
  const { user } = useAuth();
  const { data, error, loading } = useResource<RecordsRequest[]>(
    user ? "/api/requests" : null,
  );
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const rows = (data || []).filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      `${r.title} ${r.recipientName}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="YOUR WORKSPACE"
        title="My requests"
        description="From the first draft to the final response. Keep every step together."
        action={
          <Link to="/requests/new" className="button primary">
            <Plus size={17} /> New request
          </Link>
        }
      />
      <div className="list-toolbar">
        <div className="tabs" aria-label="Filter requests">
          {["all", "draft", "filed", "acknowledged", "completed", "closed"].map(
            (s) => (
              <button
                key={s}
                aria-pressed={filter === s}
                className={filter === s ? "selected" : ""}
                onClick={() => setFilter(s)}
              >
                {s === "all"
                  ? "All requests"
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ),
          )}
        </div>
        <label className="search-field compact">
          <Search size={17} />
          <input
            aria-label="Search your requests"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a request…"
          />
        </label>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? (
        <Loading />
      ) : rows.length ? (
        <div className="panel request-table">
          {rows.map((r) => (
            <Link to={"/requests/" + r.id} key={r.id} className="request-row">
              <span className="file-icon">
                <FileText size={20} />
              </span>
              <div>
                <strong>{r.title}</strong>
                <small>{r.recipientName}</small>
              </div>
              <StatusBadge status={r.status} />
              <span className="request-date">{dateLabel(r.updatedAt)}</span>
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </div>
      ) : (
        !error && (
          <Empty
            title={
              data?.length
                ? "No requests match this view"
                : "Your first request starts here"
            }
            description="Prepare a focused draft, file it using official instructions, and record the response in your private workspace."
            to="/requests/new"
            action="Create a request"
          />
        )
      )}
    </>
  );
}
