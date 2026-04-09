import { Link, useParams } from "react-router-dom";

export function PointCloudViewer() {
  const { id } = useParams();

  return (
    <div className="reference-page">
      <div className="reference-page-header">
        <div className="reference-page-header__copy">
          <h1>Point Cloud Viewer</h1>
          <p>This release still uses a lightweight placeholder viewer, but the route is now reachable directly from jobs that contain point cloud outputs.</p>
        </div>
        <div className="reference-actions">
          {id ? (
            <Link className="button-secondary" to={`/jobs/${id}?tab=Outputs`}>
              Back to outputs
            </Link>
          ) : null}
          <Link className="button-primary" to="/jobs">
            Open Jobs
          </Link>
        </div>
      </div>

      <div className="reference-card space-y-4">
        <strong className="text-lg text-slate-900">Viewer placeholder</strong>
        <span className="text-slate-500">Use this screen as the dedicated landing point for point-cloud deliverables until the full native viewer is added.</span>
      </div>
    </div>
  );
}
