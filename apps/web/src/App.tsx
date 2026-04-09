import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AiWorkspaceHubPage } from "./pages/AiWorkspaceHubPage";
import { Dashboard } from "./pages/Dashboard";
import { GnssProcessor } from "./pages/GnssProcessor";
import { JobList } from "./pages/JobList";
import { JobWorkspacePage } from "./pages/JobWorkspacePage";
import { ProcessingPage } from "./pages/ProcessingPage";
import { PointCloudViewer } from "./pages/PointCloudViewer";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

function DevAuthPage({ title }: { title: string }) {
  return (
    <div className="mx-auto mt-16 flex max-w-lg flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <strong className="text-xl font-semibold text-slate-900">{title}</strong>
      <span className="text-sm leading-6 text-slate-500">Clerk is disabled in local dev until VITE_CLERK_PUBLISHABLE_KEY is set.</span>
    </div>
  );
}

function AuthGuardRoute() {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <Layout /> : <Navigate to="/sign-in" replace />;
}

function SignInRoute() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />;
}

function SignUpRoute() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />;
}

export default function App() {
  const authDisabled = String(import.meta.env.VITE_DISABLE_AUTH ?? "").toLowerCase() === "true";
  const authEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) && !authDisabled;

  return (
    <Routes>
      <Route path="/sign-in" element={authEnabled ? <SignInRoute /> : <DevAuthPage title="Sign in" />} />
      <Route path="/sign-up" element={authEnabled ? <SignUpRoute /> : <DevAuthPage title="Sign up" />} />
      <Route path="/" element={authEnabled ? <AuthGuardRoute /> : <Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="ai" element={<AiWorkspaceHubPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="jobs" element={<JobList />} />
        <Route path="jobs/:id" element={<JobWorkspacePage />} />
        <Route path="processing" element={<ProcessingPage />} />
        <Route path="gnss" element={<GnssProcessor />} />
        <Route path="viewer/:id" element={<PointCloudViewer />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
