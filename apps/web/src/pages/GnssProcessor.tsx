import { GnssImportPanel } from "../components/GnssImportPanel";

export function GnssProcessor() {
  return (
    <div className="reference-page">
      <div className="reference-page-header">
        <div className="reference-page-header__copy">
          <h1>GNSS Intake</h1>
          <p>
            Use the shared GNSS import workflow to validate observations before attaching them to an active survey job.
          </p>
        </div>
      </div>
      <div className="reference-card">
        <GnssImportPanel />
      </div>
    </div>
  );
}
