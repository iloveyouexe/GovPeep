import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { Shell } from "./components/Shell";
import { Overview } from "./pages/Overview";
import { Directory, EntityPage } from "./pages/Directory";
import { SignIn } from "./pages/SignIn";
import { RequestList } from "./pages/RequestList";
import { RequestPage } from "./pages/RequestPage";
import { Schedules, Settings } from "./pages/Settings";
import { Empty } from "./components/ui";
import { AuthGate } from "./components/ui";
import { PublicLayout } from "./components/PublicLayout";
import { Landing } from "./pages/Landing";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route
              path="/sign-up"
              element={<Navigate to="/sign-in" replace />}
            />
          </Route>
          <Route element={<Shell />}>
            <Route
              path="/app"
              element={
                <AuthGate>
                  <Overview />
                </AuthGate>
              }
            />
            <Route path="/directory" element={<Directory />} />
            <Route path="/directory/:id" element={<EntityPage />} />
            <Route path="/requests" element={<RequestList />} />
            <Route path="/requests/new" element={<RequestPage />} />
            <Route path="/requests/:id" element={<RequestPage />} />
            <Route
              path="/agency-list"
              element={<Navigate to="/directory?jurisdiction=US" replace />}
            />
            <Route
              path="/profile"
              element={<Navigate to="/settings" replace />}
            />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <Empty
                  title="That page is not here"
                  description="Head back to your workspace to pick up where you left off."
                  to="/app"
                  action="Go to overview"
                />
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
