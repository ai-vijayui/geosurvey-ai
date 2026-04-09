type SkeletonBlockProps = {
  lines?: number;
};

export function SkeletonBlock({ lines = 3 }: SkeletonBlockProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={`h-4 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:220%_100%] animate-[shimmer_1.4s_linear_infinite] ${index > 0 ? "mt-3" : ""}`} />
      ))}
    </div>
  );
}
