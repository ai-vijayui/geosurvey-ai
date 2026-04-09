import { Link } from "react-router-dom";
import { acceptedFileHelp, type SampleLink } from "./helpContent";

type Props = {
  sampleLinks: SampleLink[];
  helpAnchor?: string;
  demoQuery?: string;
};

export function UploadHelpPanel({ sampleLinks, helpAnchor = "/help#what-files-to-upload", demoQuery = "/jobs?createJob=1&demoType=GNSS_TRAVERSE&demoName=Demo%20GNSS%20Land%20Survey" }: Props) {
  return (
    <section className="upload-help-panel">
      <div className="upload-help-panel__copy">
        <span className="reference-chip">Upload help</span>
        <strong>What file should I upload?</strong>
        <p>Need a test file? Download a sample first. Not sure? Try Demo Project.</p>
      </div>

      <div className="upload-help-panel__actions">
        <Link className="button-secondary" to={helpAnchor}>Show Me How</Link>
        <Link className="button-secondary" to="/help#sample-files">Explain This Page</Link>
        <Link className="button-primary" to={demoQuery}>Try Demo Project</Link>
      </div>

      <div className="upload-help-panel__downloads">
        {sampleLinks.map((link) => (
          <a key={link.href} className="table-action" href={link.href} download>
            {link.label}
          </a>
        ))}
      </div>

      <div className="upload-help-panel__formats">
        {acceptedFileHelp.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}
