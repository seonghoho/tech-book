import Image from "next/image";
import type { ProjectPreview } from "@/lib/aboutData";

type ProjectVisualProps = {
  preview: ProjectPreview;
  priority?: boolean;
  className?: string;
};

const aspectClassMap = {
  wide: "aspect-[16/10]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
} as const;

const placeholderToneMap = {
  emerald: {
    shell:
      "border-emerald-200/70 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_rgba(248,250,252,0.94)_48%,_rgba(15,23,42,0.05)_100%)] dark:border-emerald-500/20 dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_rgba(2,6,23,0.98)_52%,_rgba(15,23,42,1)_100%)]",
    chip:
      "border-emerald-200/80 bg-white/75 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    glow: "bg-emerald-200/40 dark:bg-emerald-500/20",
  },
  amber: {
    shell:
      "border-amber-200/70 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_rgba(248,250,252,0.94)_48%,_rgba(15,23,42,0.05)_100%)] dark:border-amber-500/20 dark:bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_rgba(2,6,23,0.98)_52%,_rgba(15,23,42,1)_100%)]",
    chip:
      "border-amber-200/80 bg-white/75 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200",
    glow: "bg-amber-200/40 dark:bg-amber-500/20",
  },
  sky: {
    shell:
      "border-sky-200/70 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_rgba(248,250,252,0.94)_48%,_rgba(15,23,42,0.05)_100%)] dark:border-sky-500/20 dark:bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_rgba(2,6,23,0.98)_52%,_rgba(15,23,42,1)_100%)]",
    chip:
      "border-sky-200/80 bg-white/75 text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200",
    glow: "bg-sky-200/40 dark:bg-sky-500/20",
  },
  rose: {
    shell:
      "border-rose-200/70 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.15),_rgba(248,250,252,0.94)_48%,_rgba(15,23,42,0.05)_100%)] dark:border-rose-500/20 dark:bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.16),_rgba(2,6,23,0.98)_52%,_rgba(15,23,42,1)_100%)]",
    chip:
      "border-rose-200/80 bg-white/75 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200",
    glow: "bg-rose-200/40 dark:bg-rose-500/20",
  },
} as const;

export default function ProjectVisual({
  preview,
  priority = false,
  className = "",
}: ProjectVisualProps) {
  const aspectClass = aspectClassMap[preview.aspect ?? "landscape"];

  if (preview.kind === "image") {
    return (
      <figure
        className={`group relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-slate-950/5 shadow-[0_18px_44px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-slate-950 ${aspectClass} ${className}`}
      >
        <Image
          src={preview.src}
          alt={preview.alt}
          fill
          priority={priority}
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes="(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm font-medium text-white">
          {preview.caption}
        </figcaption>
      </figure>
    );
  }

  const tone = placeholderToneMap[preview.tone];

  return (
    <figure
      className={`relative overflow-hidden rounded-[28px] border shadow-[0_18px_44px_rgba(15,23,42,0.08)] ${aspectClass} ${tone.shell} ${className}`}
    >
      <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-80 dark:opacity-70 ${tone.glow}`} />
      <div className="absolute inset-0">
        <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${tone.chip}`}
          >
            {preview.label}
          </span>
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/80 shadow-sm dark:bg-white/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/60 dark:bg-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/40 dark:bg-white/15" />
          </div>
        </div>

        <div className="absolute inset-x-5 top-20 rounded-[22px] border border-white/60 bg-white/70 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {preview.title}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {preview.points.slice(0, 2).map((point) => (
                  <div
                    key={point}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium ${tone.chip}`}
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[20px] border border-white/60 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/55">
              <div className="grid h-full gap-3">
                <div className="rounded-2xl bg-slate-900/80 p-4 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  흐름
                </div>
                <div className="grid gap-2">
                  {preview.points.slice(1).map((point) => (
                    <div
                      key={point}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50/90 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm font-medium text-slate-700 dark:text-slate-200">
        {preview.caption}
      </figcaption>
    </figure>
  );
}
