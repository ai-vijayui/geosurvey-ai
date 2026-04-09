import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { MarketingLayout } from "./marketing/components/MarketingLayout";
import { AboutPage } from "./marketing/pages/AboutPage";
import { BlogPage } from "./marketing/pages/BlogPage";
import { ContactPage } from "./marketing/pages/ContactPage";
import { FeaturesPage } from "./marketing/pages/FeaturesPage";
import { HomePage } from "./marketing/pages/HomePage";
import { NotFoundPage } from "./marketing/pages/NotFoundPage";
import { PricingPage } from "./marketing/pages/PricingPage";
import { AiWorkspaceHubPage } from "./pages/AiWorkspaceHubPage";
import { Dashboard } from "./pages/Dashboard";
import { GnssProcessor } from "./pages/GnssProcessor";
import { HelpPage } from "./pages/Help";
import { JobList } from "./pages/JobList";
import { JobWorkspacePage } from "./pages/JobWorkspacePage";
import { ProcessingPage } from "./pages/ProcessingPage";
import { PointCloudViewer } from "./pages/PointCloudViewer";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

const clerkAppearance = {
  variables: {
    colorPrimary: "#f45b55",
    colorText: "#1c1c1c",
    colorTextSecondary: "#6f675f",
    colorBackground: "#ffffff",
    colorInputBackground: "#fcfbf8",
    colorInputText: "#1c1c1c",
    borderRadius: "18px",
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif'
  },
  elements: {
    rootBox: "auth-shell__form-root",
    cardBox: "auth-shell__card-box",
    card: "auth-shell__card",
    headerTitle: "auth-shell__clerk-title",
    headerSubtitle: "auth-shell__clerk-subtitle",
    socialButtonsBlockButton: "auth-shell__social-button",
    socialButtonsBlockButtonText: "auth-shell__social-button-text",
    dividerLine: "auth-shell__divider-line",
    dividerText: "auth-shell__divider-text",
    formFieldLabel: "auth-shell__field-label",
    formFieldInput: "auth-shell__field-input",
    formButtonPrimary: "auth-shell__primary-button",
    footerActionLink: "auth-shell__footer-link",
    formResendCodeLink: "auth-shell__footer-link",
    identityPreviewEditButton: "auth-shell__footer-link",
    formFieldWarningText: "auth-shell__warning-text",
    formFieldErrorText: "auth-shell__error-text",
    alertText: "auth-shell__alert-text",
    alert: "auth-shell__alert",
    footer: "auth-shell__footer"
  }
};

function AuthShell({
  eyebrow,
  title,
  subtitle,
  children
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__backdrop" />
      <div className="auth-shell__grid">
        <section className="auth-shell__form-panel">
          <div className="auth-shell__form-rail">
            <div className="auth-shell__mini-brand">
              <div className="auth-shell__brand-mark auth-shell__brand-mark--small">GS</div>
              <div>
                <div className="auth-shell__brand-title">GEOSURVEY</div>
                <div className="auth-shell__brand-copy">Operational survey workspace</div>
              </div>
            </div>

            <div className="auth-shell__form-frame">{children}</div>

            <div className="auth-shell__form-note">
              Secure access for survey teams, project managers, and operations leads.
            </div>
          </div>
        </section>

        <section className="auth-shell__brand-panel">
          <div className="auth-shell__brand-rail">
            <div className="auth-shell__brand">
              <div className="auth-shell__brand-mark">GS</div>
              <div>
                <div className="auth-shell__brand-title">GEOSURVEY</div>
                <div className="auth-shell__brand-copy">Operational survey workspace</div>
              </div>
            </div>

            <div className="auth-shell__hero">
              <span className="auth-shell__eyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>

            <div className="auth-shell__onboarding">
              <div className="auth-shell__journey-card">
                <div className="auth-shell__journey-header">
                  <span className="auth-shell__stat-label">Getting started</span>
                  <strong>What happens after you sign in</strong>
                </div>
                <div className="auth-shell__journey-steps">
                  <div className="auth-shell__journey-step">
                    <span className="auth-shell__journey-index">1</span>
                    <div>
                      <strong>Create a project workspace</strong>
                      <p>Set up a project so every survey, file set, and report stays organized from day one.</p>
                    </div>
                  </div>
                  <div className="auth-shell__journey-step">
                    <span className="auth-shell__journey-index">2</span>
                    <div>
                      <strong>Launch jobs and upload data</strong>
                      <p>Bring in GNSS, drone, or point-cloud data and keep processing tied to the right job context.</p>
                    </div>
                  </div>
                  <div className="auth-shell__journey-step">
                    <span className="auth-shell__journey-index">3</span>
                    <div>
                      <strong>Track progress and review outputs</strong>
                      <p>Monitor status, inspect results, and use AI assistance without jumping across disconnected tools.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="auth-shell__proof-strip">
                <div className="auth-shell__proof-item">
                  <strong>Projects, jobs, processing</strong>
                  <span>Everything stays inside one operational survey workspace from intake to reporting.</span>
                </div>
                <div className="auth-shell__proof-item">
                  <strong>Clear next actions</strong>
                  <span>Teams can move from sign-in to live work without jumping across disconnected tools.</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function DevAuthPage({ title }: { title: string }) {
  return (
    <AuthShell eyebrow="Authentication offline" title={title} subtitle="Clerk is disabled in this environment, so the production sign-in experience is unavailable right now.">
      <div className="auth-shell__dev-card">
        <strong className="auth-shell__dev-title">{title}</strong>
        <p className="auth-shell__dev-copy">Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable the live GeoSurvey authentication flow.</p>
      </div>
    </AuthShell>
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

  return (
    <AuthShell eyebrow="Secure access" title="Run every survey from one operations workspace." subtitle="Sign in to manage field data, monitor processing, and move from intake to delivery in one place.">
      <SignIn appearance={clerkAppearance} routing="path" path="/sign-in" fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
    </AuthShell>
  );
}

function SignUpRoute() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthShell eyebrow="Create your workspace" title="Bring your survey team into a production-ready command center." subtitle="Create an account to organize projects, launch jobs, and keep processing visible across the entire pipeline.">
      <SignUp appearance={clerkAppearance} routing="path" path="/sign-up" fallbackRedirectUrl="/dashboard" signInUrl="/sign-in" />
    </AuthShell>
  );
}

export default function App() {
  const authDisabled = String(import.meta.env.VITE_DISABLE_AUTH ?? "").toLowerCase() === "true";
  const authEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) && !authDisabled;

  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
      </Route>
      <Route path="/sign-in" element={authEnabled ? <SignInRoute /> : <DevAuthPage title="Sign in" />} />
      <Route path="/sign-up" element={authEnabled ? <SignUpRoute /> : <DevAuthPage title="Sign up" />} />
      <Route path="/" element={authEnabled ? <AuthGuardRoute /> : <Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="ai" element={<AiWorkspaceHubPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="jobs" element={<JobList />} />
        <Route path="jobs/:id" element={<JobWorkspacePage />} />
        <Route path="processing" element={<ProcessingPage />} />
        <Route path="gnss" element={<GnssProcessor />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="viewer/:id" element={<PointCloudViewer />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route element={<MarketingLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
