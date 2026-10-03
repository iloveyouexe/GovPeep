import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCheck,
  Search,
  MapPin,
  Plus,
} from "lucide-react";
import { brand, type Entity, type Jurisdiction } from "@govpeep/contracts";
import { EntityLogo } from "../components/EntityLogo";
import { useResource } from "../lib/api";
import {
  Empty,
  ErrorMessage,
  Guidance,
  Loading,
  PageHeading,
} from "../components/ui";

export function Directory() {
  const [params, setParams] = useSearchParams();
  const jurisdiction = params.get("jurisdiction") ?? "";
  const [query, setQuery] = useState(params.get("q") || "");
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const page = Number(params.get("page")) || 1;
  const jurisdictions =
    useResource<Pick<Jurisdiction, "id" | "name">[]>("/api/jurisdictions");
  const listing = useResource<{
    items: Entity[];
    total: number;
    pageSize: number;
  }>(
    `/api/entities?jurisdiction=${encodeURIComponent(jurisdiction)}&q=${encodeURIComponent(debounced)}&page=${page}`,
  );
  function update(key: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("jurisdiction", jurisdiction);
      next.set(key, value);
      if (key !== "page") next.delete("page");
      return next;
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="THE DIRECTORY"
        title="Find your public office"
        description="Start with a place or an organization. Check the filing details before making your request."
        action={
          <Link
            to={
              "/requests/new?jurisdiction=" + encodeURIComponent(jurisdiction)
            }
            className="button"
          >
            <Plus size={16} /> Use a custom recipient
          </Link>
        }
      />
      <div className="directory-toolbar panel">
        <label className="search-field">
          <Search size={19} />
          <input
            aria-label="Search public offices"
            placeholder="Search names, services, or topics…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              update("q", e.target.value);
            }}
          />
        </label>
        <label className="jurisdiction-select">
          <MapPin size={17} />
          <select
            aria-label="Jurisdiction"
            value={jurisdiction}
            onChange={(e) => update("jurisdiction", e.target.value)}
          >
            <option value="">All jurisdictions</option>
            {jurisdictions.data?.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="results-meta">
        <span>
          {listing.data?.total ?? "…"} organizations
          {jurisdiction
            ? ` · ${jurisdictions.data?.find((j) => j.id === jurisdiction)?.name || jurisdiction}`
            : " · All jurisdictions"}
        </span>
        <span>
          <CheckCheck size={15} /> Source-checked details are marked
        </span>
      </div>
      <ErrorMessage>{listing.error || jurisdictions.error}</ErrorMessage>
      {listing.loading ? (
        <Loading />
      ) : listing.data?.items.length ? (
        <>
          <div className="entity-grid">
            {listing.data.items.map((entity) => (
              <Link
                to={"/directory/" + entity.id}
                className="entity-card"
                key={entity.id}
              >
                <div className="entity-top">
                  <EntityLogo entity={entity} />
                  <span
                    className={`badge ${entity.verification === "source_checked" ? "badge-verified" : "badge-neutral"}`}
                  >
                    {entity.verification === "source_checked"
                      ? "Source checked"
                      : "Imported listing"}
                  </span>
                </div>
                <span className="caption">{entity.kind}</span>
                <h2>{entity.name}</h2>
                <p>{entity.description}</p>
                <div className="entity-bottom">
                  <span>
                    {entity.channel === "portal"
                      ? "Official form / portal"
                      : entity.channel === "email"
                        ? "Form + email"
                        : "Filing route unverified"}
                  </span>
                  <ArrowUpRight size={17} />
                </div>
              </Link>
            ))}
          </div>
          <div className="pagination">
            <button
              className="button"
              disabled={page <= 1}
              onClick={() => update("page", String(page - 1))}
            >
              <ArrowLeft size={15} /> Previous
            </button>
            <span>
              Page {page} of {Math.max(1, Math.ceil(listing.data.total / 24))}
            </span>
            <button
              className="button"
              disabled={page * 24 >= listing.data.total}
              onClick={() => update("page", String(page + 1))}
            >
              Next <ArrowRight size={15} />
            </button>
          </div>
        </>
      ) : (
        !listing.error && (
          <Empty
            title="More coverage is on the way"
            description="No matching offices are listed here yet. You can still prepare a request using a recipient and official filing information you already know."
            to={
              "/requests/new?jurisdiction=" + encodeURIComponent(jurisdiction)
            }
            action="Use a custom recipient"
          />
        )
      )}
      <p className="directory-footnote">
        A directory listing is a starting point, not a determination that every
        record or entity is covered. Federal demo listings need eligibility and
        custodian verification.
      </p>
    </>
  );
}

export function EntityPage() {
  const { id } = useParams();
  const { data, error, loading } = useResource<{
    entity: Entity;
    jurisdiction: Jurisdiction;
  }>("/api/entities/" + encodeURIComponent(id || ""));
  if (loading) return <Loading />;
  if (error || !data)
    return <ErrorMessage>{error || "Office not found."}</ErrorMessage>;
  const { entity, jurisdiction } = data;
  return (
    <>
      <Link
        to={"/directory?jurisdiction=" + entity.jurisdictionId}
        className="text-link back-link"
      >
        <ArrowLeft size={15} /> Back to directory
      </Link>
      <div className="entity-detail-logo">
        <EntityLogo entity={entity} />
      </div>
      <PageHeading
        eyebrow={jurisdiction.name + " · " + entity.kind}
        title={entity.name}
        description={entity.description}
        action={
          <Link
            to={"/requests/new?entity=" + entity.id}
            className="button primary"
          >
            <Plus size={17} /> Prepare a request
          </Link>
        }
      />
      <div className="detail-grid">
        <div className="stack">
          <section className="panel padded">
            <div className="section-label">
              <Building2 size={18} /> Filing information
            </div>
            <dl className="details-list">
              <div>
                <dt>Records custodian</dt>
                <dd>{entity.custodian || "Not yet verified"}</dd>
              </div>
              <div>
                <dt>Submission route</dt>
                <dd>
                  {entity.channel === "unverified"
                    ? "Check the official website"
                    : entity.channel === "email"
                      ? "Official form, then email"
                      : "Official form / portal"}
                </dd>
              </div>
              {entity.filingEmail && (
                <div>
                  <dt>Filing email</dt>
                  <dd>{entity.filingEmail}</dd>
                </div>
              )}
              <div>
                <dt>Source status</dt>
                <dd>
                  {entity.checkedAt
                    ? `Checked ${entity.checkedAt}`
                    : "Imported listing — details need review"}
                </dd>
              </div>
            </dl>
            <p>{entity.instructions}</p>
            <div className="button-row">
              <a
                className="button"
                href={entity.filingUrl || entity.website}
                target="_blank"
                rel="noreferrer"
              >
                Official filing instructions <ArrowUpRight size={16} />
              </a>
              <a
                className="text-link"
                href={entity.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                View source <ArrowUpRight size={15} />
              </a>
            </div>
          </section>
          <div className="notice">
            {brand.name} helps you prepare and organize your request. This
            release supports manual filing; it does not submit to this office.
          </div>
        </div>
        <Guidance jurisdiction={jurisdiction} />
      </div>
    </>
  );
}
