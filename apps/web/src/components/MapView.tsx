import React, { Suspense } from "react";

const MapViewInner = React.lazy(() => import("./MapViewInner"));

function MapSkeleton({ height = "360px" }: { height?: string }) {
  return <div className="card pulse" style={{ height }} />;
}

export function MapView(props: React.ComponentProps<typeof MapViewInner>) {
  return (
    <Suspense fallback={<MapSkeleton height={props.height} />}>
      <MapViewInner {...props} />
    </Suspense>
  );
}
