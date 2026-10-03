import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  FileText,
  FolderOpen,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Entity } from "@govpeep/contracts";
import { brand } from "@govpeep/contracts";
import { useResource } from "../lib/api";
import { useAuth } from "../lib/auth";
import { EntityLogo } from "../components/EntityLogo";

export function Landing() {
  const { user } = useAuth();
  const { hash } = useLocation();
  const directory = useResource<{ items: Entity[]; total: number }>(
    "/api/entities",
  );
  useEffect(() => {
    if (hash === "#how-it-works")
      document.getElementById("how-it-works")?.scrollIntoView();
  }, [hash]);
  return (
    <>
      <section className="landing-hero landing-container">
        <div className="landing-hero-copy">
          <span className="landing-pill">
            <span className="live-dot" /> PUBLIC RECORDS, WITHOUT THE RUNAROUND
          </span>
          <h1>
            The records are public.
            <br />
            <span>Make the process clearer.</span>
          </h1>
          <p>
            Find the right office, put your request into words, and keep
            everything organized—from the first draft to the final response.
          </p>
          <div className="landing-actions">
            <Link
              className="button primary"
              to={user ? "/app" : "/requests/new"}
            >
              {user ? "Open your workspace" : "Start a request"}{" "}
              <ArrowRight size={18} />
            </Link>
            <Link className="button" to="/directory">
              Explore the directory <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="landing-reassurance">
            <span>
              <Check size={15} /> Browse without an account
            </span>
            <span>
              <Check size={15} /> Your drafts stay private
            </span>
          </div>
        </div>
        <div
          className="landing-preview"
          aria-label="Example of a request workspace"
        >
          <div className="preview-window-bar">
            <div>
              <span />
              <span />
              <span />
            </div>
            <span>Example workspace</span>
            <ShieldCheck size={15} />
          </div>
          <div className="preview-window-content">
            <div className="preview-eyebrow">YOUR NEXT QUESTION</div>
            <h2>Where did the funding go?</h2>
            <p>A focused request for your city’s project records.</p>
            <div className="preview-recipient">
              <span className="entity-icon">
                <Building2 size={23} />
              </span>
              <div>
                <strong>City records office</strong>
                <small>Local government · Public records</small>
              </div>
              <ArrowUpRight size={16} />
            </div>
            <div className="preview-document">
              <div>
                <FileText size={17} />
                <strong>Project contracts & amendments</strong>
                <span className="badge status-draft">Draft</span>
              </div>
              <span className="preview-text-line" />
              <span className="preview-text-line medium" />
              <span className="preview-text-line" />
              <span className="preview-text-line short" />
            </div>
            <div className="preview-steps">
              <span className="done">
                <Check size={12} /> Find an office
              </span>
              <span className="current">
                2 <span>Prepare a request</span>
              </span>
              <span>
                3 <span>File & track</span>
              </span>
            </div>
          </div>
          <div className="preview-floating-note">
            <FolderOpen size={19} />
            <div>
              <strong>One place for the whole story</strong>
              <span>Your draft, filing details, and timeline.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-directory-band">
        <div className="landing-container">
          <div className="landing-section-header">
            <div>
              <span className="eyebrow">START WITH THE RIGHT RECIPIENT</span>
              <h2>Public offices. One searchable directory.</h2>
              <p>
                Browse federal, state, and local listings. See which filing
                details have been checked.
              </p>
            </div>
            <Link to="/directory" className="text-link">
              {directory.data
                ? `Explore ${directory.data.total} listings`
                : "Explore the directory"}{" "}
              <ArrowRight size={16} />
            </Link>
          </div>
          {directory.data && (
            <div className="landing-org-grid">
              {directory.data.items.slice(0, 6).map((entity) => (
                <Link to={"/directory/" + entity.id} key={entity.id}>
                  <EntityLogo entity={entity} />
                  <span>{entity.name}</span>
                </Link>
              ))}
            </div>
          )}
          <p className="landing-smallprint">
            Coverage is growing. A directory listing is a starting point;
            confirm the office’s eligibility and current filing instructions.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="landing-container landing-how">
        <div className="landing-section-header">
          <div>
            <span className="eyebrow">FROM A QUESTION TO A CLEAR REQUEST</span>
            <h2>
              You bring the question.
              <br />
              We help organize the next steps.
            </h2>
          </div>
          <p>
            A practical workspace for a one-time question or an ongoing
            investigation.
          </p>
        </div>
        <div className="landing-step-grid">
          {[
            {
              icon: Search,
              number: "01",
              title: "Find the right office",
              text: "Search organizations and jurisdictions. Check source links, custodian details, and required filing channels.",
            },
            {
              icon: FileText,
              number: "02",
              title: "Make your request clear",
              text: "Describe the records and date range. See an editable letter preview, then copy or download your request.",
            },
            {
              icon: FolderOpen,
              number: "03",
              title: "Keep the story together",
              text: "File through the office’s required process. Save the date, reference number, and updates in your private timeline.",
            },
          ].map(({ icon: Icon, number, title, text }) => (
            <article key={number}>
              <div>
                <span className="landing-step-icon">
                  <Icon size={23} />
                </span>
                <span className="step-number">{number}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-container">
        <div className="landing-roadmap">
          <span className="landing-step-icon">
            <Sparkles size={23} />
          </span>
          <div>
            <span className="eyebrow">WHAT’S NEXT</span>
            <h3>
              A little help finding the right words. A rhythm for recurring
              requests.
            </h3>
            <p>
              AI-assisted scoping and scheduled drafts are on the roadmap.
              Today, you can browse, prepare, save, and track manual requests.
            </p>
          </div>
          <Link to="/schedules" className="text-link">
            See the plan <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="landing-container landing-faq">
        <div>
          <span className="eyebrow">A FEW THINGS TO KNOW</span>
          <h2>
            Clear expectations.
            <br />
            From the start.
          </h2>
        </div>
        <div>
          <details>
            <summary>Does this work for state and local requests?</summary>
            <p>
              You can prepare a manual request for a federal, state, or local
              recipient. The applicable law and filing requirements vary.
              Reviewed guidance and source links are shown where available; the
              directory is not yet comprehensive.
            </p>
          </details>
          <details>
            <summary>Will {brand.name} send the request for me?</summary>
            <p>
              Not in this release. Prepare and export your letter, use the
              office’s required submission method, then record the filing in
              your workspace. Saving or marking a request filed never sends it.
            </p>
          </details>
          <details>
            <summary>Do I need an account?</summary>
            <p>
              The directory is public. Sign in to save private drafts and
              request history. Google sign-in and email links are supported when
              configured by the deployment operator.
            </p>
          </details>
        </div>
      </section>
      <section className="landing-container">
        <div className="landing-final-cta">
          <div>
            <span className="eyebrow">
              THERE’S A GOOD QUESTION ON YOUR MIND
            </span>
            <h2>Give it a clear next step.</h2>
            <p>Your first request starts with a draft.</p>
          </div>
          <Link to="/requests/new" className="button primary">
            Start a request <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
