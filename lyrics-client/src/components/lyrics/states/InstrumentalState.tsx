// src/components/lyrics/InstrumentalState.tsx

type InstrumentalStateProps = {
  title?: string;
  subtitle?: string;
  className?: string;
};

const bars = [30, 55, 80, 100, 75, 50, 35, 45, 70, 90, 60, 40];

export function InstrumentalState({
  title = "This track appears to be instrumental",
  subtitle = "No lyrics found",
  className = "",
}: InstrumentalStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}
    >
      <div
        className="mb-10 flex h-40 items-end justify-center gap-1.5"
        aria-hidden="true"
      >
        {bars.map((height, index) => (
          <div
            key={index}
            className="w-3 rounded-full animate-wave bg-green-500"
            style={{
              height: `${height}%`,
              animationDelay: `${index * 0.08}s`,
            }}
          />
        ))}
      </div>

      <div className="mb-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Instrumental
      </div>

      <h2 className="max-w-md text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>

      <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
