import { Link } from "react-router-dom";
import {
  CalendarClock,
  Check,
  Mail,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { AuthGate, PageHeading } from "../components/ui";
import { brand } from "@govpeep/contracts";

export function Settings() {
  const { user, config } = useAuth();
  return (
    <AuthGate>
      <PageHeading
        eyebrow="YOUR ACCOUNT"
        title="Settings"
        description="A private workspace, connected to your verified email."
      />
      <section className="panel padded settings-panel">
        <div className="section-label">
          <ShieldCheck size={19} /> Account
        </div>
        <dl className="details-list">
          <div>
            <dt>Name</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              {user?.email}{" "}
              <span className="badge badge-verified">
                <Check size={12} /> Verified
              </span>
            </dd>
          </div>
          <div>
            <dt>Sign-in options</dt>
            <dd>
              {[
                config?.authProviders?.google && "Google",
                config?.authProviders?.email && "Email link",
              ]
                .filter(Boolean)
                .join(" · ") || "Currently unavailable"}
            </dd>
          </div>
          <div>
            <dt>Environment</dt>
            <dd>
              {config?.developmentMailbox
                ? "Local development mailbox"
                : "Production sign-in"}
            </dd>
          </div>
        </dl>
      </section>
      <section className="panel padded settings-panel">
        <div className="section-label">
          <Mail size={19} /> Notifications
        </div>
        <p>
          Sign-in emails are available now. Recurring-draft notifications and
          follow-up reminders arrive with the scheduling milestone.
        </p>
        <Link to="/schedules" className="text-link">
          See the scheduling plan <ArrowRight size={15} />
        </Link>
      </section>
    </AuthGate>
  );
}
export function Schedules() {
  return (
    <>
      <PageHeading
        eyebrow="COMING NEXT"
        title="A request. A rhythm."
        description="Some questions are worth asking regularly. Scheduled drafts will help you keep up."
      />
      <section className="panel schedule-preview">
        <div className="icon-tile">
          <CalendarClock size={30} />
        </div>
        <h2>Recurring drafts, on your terms</h2>
        <p>
          Choose an office, a records period, and a monthly or quarterly rhythm.
          {brand.name} will prepare a new draft and notify you when it is ready
          to review.
        </p>
        <div className="schedule-example">
          <span className="badge badge-neutral">Planned workflow</span>
          <strong>Monthly city expenditure records</strong>
          <span>Every month on the 10th · Previous calendar month</span>
          <div>
            <span>Prepare draft</span>
            <ArrowRight size={16} />
            <span>Notify you</span>
            <ArrowRight size={16} />
            <span>You review & file</span>
          </div>
        </div>
        <p className="caption">
          Schedules are not enabled in this milestone. No requests or
          notifications will be sent automatically.
        </p>
        <Link to="/requests/new" className="button primary">
          Start with a manual request <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}
