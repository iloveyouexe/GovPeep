import { useState, type FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Mail, ShieldCheck, Terminal } from "lucide-react";
import { useAuth } from "../lib/auth";
import { api, useResource } from "../lib/api";
import { ErrorMessage, Loading } from "../components/ui";
import { GoogleMark } from "../components/GoogleMark";

export function SignIn() {
  const { config, user, loading } = useAuth();
  const [params] = useSearchParams();
  const proposed = params.get("next") || "/app";
  const next =
    proposed.startsWith("/") &&
    !proposed.startsWith("//") &&
    !proposed.includes("\\") &&
    !proposed.startsWith("/sign-in")
      ? proposed
      : "/app";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sent, setSent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);
  const mailbox = useResource<{ id: string; url: string }[]>(
    config?.developmentMailbox && sent
      ? "/api/dev/mail?email=" + encodeURIComponent(sent)
      : null,
  );
  if (loading) return <Loading />;
  if (user) return <Navigate to={next} replace />;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/sign-in/magic-link", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || email.split("@")[0],
          callbackURL: next,
          errorCallbackURL: "/sign-in?next=" + encodeURIComponent(next),
        }),
      });
      setSent(email.trim().toLowerCase());
      mailbox.reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function signInWithGoogle() {
    setError("");
    setGoogleBusy(true);
    try {
      const result = await api<{ url: string }>("/api/auth/sign-in/social", {
        method: "POST",
        body: JSON.stringify({
          provider: "google",
          callbackURL: next,
          errorCallbackURL: "/sign-in?next=" + encodeURIComponent(next),
          disableRedirect: true,
        }),
      });
      const destination = new URL(result.url);
      if (destination.origin !== "https://accounts.google.com")
        throw new Error("Unexpected sign-in destination. Please try again.");
      window.location.assign(destination.href);
    } catch (e) {
      setError((e as Error).message);
      setGoogleBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <div className="auth-intro">
        <div className="eyebrow">YOUR PUBLIC RECORDS WORKSPACE</div>
        <h1>
          A little clarity.
          <br />A lot more access.
        </h1>
        <p>
          Save a draft, keep your correspondence together, and make your next
          request a little easier.
        </p>
        <div className="auth-benefit">
          <ShieldCheck size={22} />
          <div>
            <strong>Your requests stay yours.</strong>
            <p>Private workspace. Verified email. No password to remember.</p>
          </div>
        </div>
      </div>
      <section className="panel auth-card">
        <div className="icon-tile">
          <Mail size={24} />
        </div>
        <h2>{sent ? "Check your email" : "Make yourself at home"}</h2>
        <p>
          {sent
            ? `We prepared a sign-in link for ${sent}. It expires in 10 minutes.`
            : "Sign in or create your account. Your workspace is waiting."}
        </p>
        <ErrorMessage>
          {error ||
            (params.has("error")
              ? "Sign-in could not be completed. Try Google again or request a new email link."
              : "")}
        </ErrorMessage>
        {!config?.authAvailable && (
          <div className="notice">
            Sign-in is being configured on this deployment. You can still
            explore the directory.
          </div>
        )}
        <button
          type="button"
          className="button google-sign-in full-width"
          disabled={googleBusy || busy || !config?.authProviders?.google}
          onClick={() => {
            void signInWithGoogle();
          }}
        >
          <GoogleMark />
          {googleBusy ? "Opening Google…" : "Continue with Google"}
        </button>
        {!config?.authProviders?.google && (
          <p className="caption provider-setup-note">
            Google sign-in will be available once OAuth credentials are
            configured.
          </p>
        )}
        <div className="auth-divider">
          <span>or use your email</span>
        </div>
        {!config?.authProviders?.email && config?.authProviders?.google && (
          <p className="caption">
            Email-link sign-in is not enabled on this deployment.
          </p>
        )}
        <form onSubmit={submit} className="form-stack">
          <label>
            Your name <span className="optional">optional</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Alex Morgan"
              maxLength={200}
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
              maxLength={254}
            />
          </label>
          <button
            className="button primary full-width"
            disabled={busy || googleBusy || !config?.authProviders?.email}
          >
            {busy
              ? "Preparing your link…"
              : sent
                ? "Send a new link"
                : "Continue with email"}
            <ArrowRight size={17} />
          </button>
        </form>
        <p className="caption">
          Your email is used for account access. Creating a draft does not send
          a request to an agency.
        </p>
        {config?.developmentMailbox && sent && (
          <div className="dev-mailbox">
            <div className="section-label">
              <Terminal size={16} /> Local development mailbox
            </div>
            <p>No email was sent. Use this local-only link to test sign-in.</p>
            <ErrorMessage>{mailbox.error}</ErrorMessage>
            {mailbox.loading ? (
              <Loading />
            ) : mailbox.data?.[0] ? (
              <a className="button" href={mailbox.data[0].url}>
                Open sign-in link <ArrowRight size={16} />
              </a>
            ) : (
              <button className="button" onClick={mailbox.reload}>
                Refresh mailbox
              </button>
            )}
          </div>
        )}
        <Link to="/directory" className="text-link">
          Explore the directory first <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
