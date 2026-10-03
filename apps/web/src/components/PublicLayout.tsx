import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@govpeep/contracts";
import { Brand } from "./Brand";
import { useAuth } from "../lib/auth";

export function PublicLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  return (
    <div className="public-site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="public-header">
        <Brand />
        <nav aria-label="Website navigation">
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/directory">Directory</Link>
        </nav>
        <div className="public-header-actions">
          {user ? (
            <Link to="/app" className="button primary">
              My workspace <ArrowUpRight size={15} />
            </Link>
          ) : (
            pathname !== "/sign-in" && (
              <>
                <Link to="/sign-in" className="public-sign-in">
                  Sign in
                </Link>
                <Link to="/sign-in" className="button primary">
                  Get started <ArrowUpRight size={15} />
                </Link>
              </>
            )
          )}
        </div>
      </header>
      <main id="main" className="public-main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div>
          <Brand />
          <p>{brand.tagline}</p>
          <small>
            Independent service. Not affiliated with the public offices listed.
          </small>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/directory">Directory</Link>
          <Link to="/app">Workspace</Link>
          <Link to="/sign-in">Sign in</Link>
          <Link to="/#how-it-works">How it works</Link>
        </nav>
      </footer>
    </div>
  );
}
