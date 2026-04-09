type SkeletonBlockProps = {
  lines?: number;
};

export function SkeletonBlock({ lines = 3 }: SkeletonBlockProps) {
  return (
    <div className="ui-skeleton-block">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={`ui-skeleton-line ${index > 0 ? "mt-3" : ""}`} />
      ))}
    </div>
  );
}
