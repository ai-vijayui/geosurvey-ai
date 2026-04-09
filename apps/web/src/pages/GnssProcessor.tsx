import { Link } from "react-router-dom";
import { GnssImportPanel } from "../components/GnssImportPanel";
import { UploadHelpPanel } from "../components/help/UploadHelpPanel";

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
        <div className="reference-actions">
          <Link className="button-secondary" to="/help#what-files-to-upload">Show Me How</Link>
          <Link className="button-secondary" to="/help#sample-files">Explain This Page</Link>
        </div>
      </div>
      <UploadHelpPanel
        sampleLinks={[
          { label: "Sample GNSS CSV", href: "/samples/sample-gnss-points.csv" },
          { label: "Sample Guide", href: "/samples/README.txt" }
        ]}
        helpAnchor="/help#what-files-to-upload"
        demoQuery="/jobs?createJob=1&demoType=GNSS_TRAVERSE&demoName=Demo%20GNSS%20Land%20Survey"
      />
      <div className="reference-card">
        <GnssImportPanel />
      </div>
    </div>
  );
}
