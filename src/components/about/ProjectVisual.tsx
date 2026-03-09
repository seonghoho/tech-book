import Image from "next/image";
import type { ProjectPreview } from "@/lib/aboutData";

type VisualVariant = "feature" | "card" | "gallery";

type ProjectVisualProps = {
  preview: ProjectPreview;
  priority?: boolean;
  className?: string;
  variant?: VisualVariant;
};

type PlaceholderPreview = Extract<ProjectPreview, { kind: "placeholder" }>;

const aspectClassMap = {
  wide: "aspect-[16/10]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
} as const;

const neutralPanelClass =
  "border-white/60 bg-white/72 text-slate-700 shadow-[0_16px_32px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/48 dark:text-slate-100";

const placeholderToneMap = {
  emerald: {
    shell:
      "border-emerald-200/70 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_rgba(248,250,252,0.95)_42%,_rgba(15,23,42,0.05)_100%)] dark:border-emerald-500/20 dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_rgba(2,6,23,0.98)_48%,_rgba(15,23,42,1)_100%)]",
    chip: "border-emerald-200/80 bg-white/80 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    primaryPanel:
      "border-emerald-200/75 bg-white/80 text-emerald-950 shadow-[0_18px_36px_rgba(16,185,129,0.12)] dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-50",
    solidPanel:
      "border-emerald-300/70 bg-emerald-500/90 text-white shadow-[0_20px_44px_rgba(16,185,129,0.24)] dark:border-emerald-300/30 dark:bg-emerald-300/85 dark:text-slate-950",
    marker:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-100",
    route:
      "from-emerald-300/80 via-emerald-200/60 to-transparent dark:from-emerald-400/45 dark:via-emerald-500/20 dark:to-transparent",
    dot: "bg-emerald-400 dark:bg-emerald-300",
    glow: "bg-emerald-200/40 dark:bg-emerald-500/20",
  },
  amber: {
    shell:
      "border-amber-200/70 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_rgba(248,250,252,0.95)_42%,_rgba(15,23,42,0.05)_100%)] dark:border-amber-500/20 dark:bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_rgba(2,6,23,0.98)_48%,_rgba(15,23,42,1)_100%)]",
    chip: "border-amber-200/80 bg-white/80 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200",
    primaryPanel:
      "border-amber-200/75 bg-white/80 text-amber-950 shadow-[0_18px_36px_rgba(245,158,11,0.12)] dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-50",
    solidPanel:
      "border-amber-300/70 bg-amber-500/88 text-white shadow-[0_20px_44px_rgba(245,158,11,0.24)] dark:border-amber-300/30 dark:bg-amber-300/85 dark:text-slate-950",
    marker:
      "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-100",
    route:
      "from-amber-300/80 via-amber-200/60 to-transparent dark:from-amber-400/45 dark:via-amber-500/20 dark:to-transparent",
    dot: "bg-amber-400 dark:bg-amber-300",
    glow: "bg-amber-200/40 dark:bg-amber-500/20",
  },
  sky: {
    shell:
      "border-sky-200/70 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_rgba(248,250,252,0.95)_42%,_rgba(15,23,42,0.05)_100%)] dark:border-sky-500/20 dark:bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_rgba(2,6,23,0.98)_48%,_rgba(15,23,42,1)_100%)]",
    chip: "border-sky-200/80 bg-white/80 text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200",
    primaryPanel:
      "border-sky-200/75 bg-white/80 text-sky-950 shadow-[0_18px_36px_rgba(14,165,233,0.12)] dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-50",
    solidPanel:
      "border-sky-300/70 bg-sky-500/88 text-white shadow-[0_20px_44px_rgba(14,165,233,0.24)] dark:border-sky-300/30 dark:bg-sky-300/85 dark:text-slate-950",
    marker: "bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-100",
    route:
      "from-sky-300/80 via-sky-200/60 to-transparent dark:from-sky-400/45 dark:via-sky-500/20 dark:to-transparent",
    dot: "bg-sky-400 dark:bg-sky-300",
    glow: "bg-sky-200/40 dark:bg-sky-500/20",
  },
  rose: {
    shell:
      "border-rose-200/70 bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.14),_rgba(248,250,252,0.95)_42%,_rgba(15,23,42,0.05)_100%)] dark:border-rose-500/20 dark:bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.16),_rgba(2,6,23,0.98)_48%,_rgba(15,23,42,1)_100%)]",
    chip: "border-rose-200/80 bg-white/80 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200",
    primaryPanel:
      "border-rose-200/75 bg-white/80 text-rose-950 shadow-[0_18px_36px_rgba(244,63,94,0.12)] dark:b∆order-rose-400/20 dark:bg-rose-500/10 dark:text-rose-50",
    solidPanel:
      "border-rose-300/70 bg-rose-500/88 text-white shadow-[0_20px_44px_rgba(244,63,94,0.24)] dark:border-rose-300/30 dark:bg-rose-300/85 dark:text-slate-950",
    marker: "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-100",
    route:
      "from-rose-300/80 via-rose-200/60 to-transparent dark:from-rose-400/45 dark:via-rose-500/20 dark:to-transparent",
    dot: "bg-rose-400 dark:bg-rose-300",
    glow: "bg-rose-200/40 dark:bg-rose-500/20",
  },
} as const;

function getPlaceholderPoints(preview: PlaceholderPreview) {
  const [first, second, third] = preview.points;

  return [
    first ?? preview.label,
    second ?? preview.title,
    third ?? preview.caption,
  ] as const;
}

function StepCard({
  tone,
  index,
  text,
  className = "",
  appearance = "neutral",
}: {
  tone: (typeof placeholderToneMap)[keyof typeof placeholderToneMap];
  index: number;
  text: string;
  className?: string;
  appearance?: "neutral" | "tinted" | "solid";
}) {
  const appearanceClass =
    appearance === "solid"
      ? tone.solidPanel
      : appearance === "tinted"
        ? tone.primaryPanel
        : neutralPanelClass;

  const markerClass =
    // appearance === "solid"
    //   ? "bg-white/35 text-slate-800 dark:bg-slate-950/15 dark:text-slate-950"
    //   :
    tone.marker;

  const textClass = "text-slate-700 dark:text-white";

  return (
    <div
      className={`rounded-[22px] border p-4 backdrop-blur-xl ${appearanceClass} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-[11px] font-semibold tracking-[0.12em] ${markerClass}`}
        >
          {String(index).padStart(2, "0")}
        </span>
        <p className={`text-sm font-semibold leading-6 ${textClass}`}>{text}</p>
      </div>
    </div>
  );
}

function RouteDot({
  tone,
  className = "",
}: {
  tone: (typeof placeholderToneMap)[keyof typeof placeholderToneMap];
  className?: string;
}) {
  return (
    <span
      className={`absolute h-3 w-3 rounded-full shadow-[0_0_0_6px_rgba(255,255,255,0.72)] dark:shadow-[0_0_0_6px_rgba(2,6,23,0.65)] ${tone.dot} ${className}`}
    />
  );
}

function FlowLayout({
  preview,
  tone,
  variant,
}: {
  preview: PlaceholderPreview;
  tone: (typeof placeholderToneMap)[keyof typeof placeholderToneMap];
  variant: VisualVariant;
}) {
  const [first, second, third] = getPlaceholderPoints(preview);

  if (variant === "gallery") {
    return (
      <div className="grid h-full gap-3">
        <div className="grid grid-cols-2 gap-3">
          <StepCard tone={tone} index={1} text={first} appearance="tinted" />
          <StepCard tone={tone} index={2} text={second} />
        </div>
        <StepCard tone={tone} index={3} text={third} appearance="solid" />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div
        className={`absolute left-[18%] right-[28%] top-[38%] h-px bg-gradient-to-r ${tone.route}`}
      />
      <div
        className={`absolute right-[28%] top-[18%] bottom-[18%] w-px bg-gradient-to-b ${tone.route}`}
      />
      <RouteDot tone={tone} className="left-[16%] top-[36%]" />
      <RouteDot tone={tone} className="right-[26%] top-[16%]" />
      <RouteDot tone={tone} className="right-[26%] bottom-[16%]" />

      <StepCard
        tone={tone}
        index={1}
        text={first}
        appearance="tinted"
        className="absolute left-0 top-[18%] w-[48%]"
      />
      <StepCard
        tone={tone}
        index={2}
        text={second}
        className="absolute right-0 top-0 w-[36%]"
      />
      <StepCard
        tone={tone}
        index={3}
        text={third}
        appearance="solid"
        className="absolute bottom-0 right-[8%] w-[46%]"
      />
    </div>
  );
}

function DashboardLayout({
  preview,
  tone,
}: {
  preview: PlaceholderPreview;
  tone: (typeof placeholderToneMap)[keyof typeof placeholderToneMap];
}) {
  const [first, second, third] = getPlaceholderPoints(preview);

  return (
    <div className="grid h-full grid-cols-[1.08fr_0.92fr] gap-3">
      <div className="grid gap-3">
        <StepCard
          tone={tone}
          index={1}
          text={first}
          appearance="tinted"
          className="min-h-[96px]"
        />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className={`rounded-[18px] border px-3 py-3 backdrop-blur-xl ${neutralPanelClass}`}
            >
              <span className="block h-2 w-10 rounded-full bg-slate-900/10 dark:bg-white/10" />
              <span className="mt-3 block h-2 w-full rounded-full bg-slate-900/5 dark:bg-white/5" />
              <span className="mt-2 block h-2 rounded-full bg-slate-900/5 dark:bg-white/5" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <StepCard tone={tone} index={2} text={second} />
        <StepCard tone={tone} index={3} text={third} appearance="solid" />
      </div>
    </div>
  );
}

function SplitLayout({
  preview,
  tone,
  variant,
}: {
  preview: PlaceholderPreview;
  tone: (typeof placeholderToneMap)[keyof typeof placeholderToneMap];
  variant: VisualVariant;
}) {
  const [first, second, third] = getPlaceholderPoints(preview);

  if (variant === "gallery") {
    return (
      <div className="grid h-full gap-3">
        <div className="grid grid-cols-2 gap-3">
          <StepCard tone={tone} index={1} text={first} appearance="tinted" />
          <StepCard tone={tone} index={2} text={second} />
        </div>
        <StepCard tone={tone} index={3} text={third} appearance="solid" />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div
        className={`absolute left-[28%] right-[28%] top-[42%] h-px bg-gradient-to-r ${tone.route}`}
      />
      <div
        className={`absolute left-1/2 top-[42%] bottom-[18%] w-px -translate-x-1/2 bg-gradient-to-b ${tone.route}`}
      />
      <RouteDot tone={tone} className="left-[26%] top-[40%]" />
      <RouteDot tone={tone} className="right-[26%] top-[40%]" />
      <RouteDot
        tone={tone}
        className="left-1/2 bottom-[16%] -translate-x-1/2"
      />

      <StepCard
        tone={tone}
        index={1}
        text={first}
        appearance="tinted"
        className="absolute left-0 top-0 w-[40%]"
      />
      <StepCard
        tone={tone}
        index={2}
        text={second}
        className="absolute right-0 top-0 w-[40%]"
      />
      <StepCard
        tone={tone}
        index={3}
        text={third}
        appearance="solid"
        className="absolute bottom-0 left-1/2 w-[56%] -translate-x-1/2"
      />
    </div>
  );
}

function StackLayout({
  preview,
  tone,
  variant,
}: {
  preview: PlaceholderPreview;
  tone: (typeof placeholderToneMap)[keyof typeof placeholderToneMap];
  variant: VisualVariant;
}) {
  const [first, second, third] = getPlaceholderPoints(preview);

  if (variant === "gallery") {
    return (
      <div className="grid h-full gap-3">
        <StepCard tone={tone} index={1} text={first} appearance="tinted" />
        <div className="grid grid-cols-[1.02fr_0.98fr] gap-3">
          <StepCard tone={tone} index={2} text={second} />
          <StepCard tone={tone} index={3} text={third} appearance="solid" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <StepCard
        tone={tone}
        index={1}
        text={first}
        appearance="tinted"
        className="absolute inset-x-[4%] top-[10%] z-30"
      />
      <StepCard
        tone={tone}
        index={2}
        text={second}
        className="absolute inset-x-[15%] top-[38%] z-20"
      />
      <StepCard
        tone={tone}
        index={3}
        text={third}
        appearance="solid"
        className="absolute inset-x-[26%] bottom-[8%] z-10"
      />
    </div>
  );
}

function PlaceholderVisual({
  preview,
  tone,
  variant,
}: {
  preview: PlaceholderPreview;
  tone: (typeof placeholderToneMap)[keyof typeof placeholderToneMap];
  variant: VisualVariant;
}) {
  switch (preview.layout ?? "flow") {
    case "dashboard":
      return <DashboardLayout preview={preview} tone={tone} />;
    case "split":
      return <SplitLayout preview={preview} tone={tone} variant={variant} />;
    case "stack":
      return <StackLayout preview={preview} tone={tone} variant={variant} />;
    case "flow":
    default:
      return <FlowLayout preview={preview} tone={tone} variant={variant} />;
  }
}

export default function ProjectVisual({
  preview,
  priority = false,
  className = "",
  variant = "card",
}: ProjectVisualProps) {
  const aspectClass = aspectClassMap[preview.aspect ?? "landscape"];

  if (preview.kind === "image") {
    const imageCaptionClass =
      variant === "gallery" ? "p-4 text-xs sm:text-sm" : "p-5 text-sm";

    return (
      <figure
        className={`group relative overflow-hidden rounded-[14px] border border-slate-200/70 bg-slate-950/10 shadow-[0_18px_44px_rgba(15,23,42,0.02)] dark:border-slate-800/80 dark:bg-slate-950 ${aspectClass} ${className}`}
      >
        <Image
          src={preview.src}
          alt={preview.alt}
          fill
          priority={priority}
          className="object-fit transition duration-500 group-hover:scale-[1.04]"
          sizes="(min-width: 1280px) 40vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-600/10 to-transparent" />
        <figcaption
          className={`absolute inset-x-0 bottom-0 font-medium text-white ${imageCaptionClass}`}
        >
          {preview.caption}
        </figcaption>
      </figure>
    );
  }

  const tone = placeholderToneMap[preview.tone];
  const bodyInsetClass =
    variant === "gallery"
      ? "absolute inset-x-4 top-16 bottom-14"
      : variant === "feature"
        ? "absolute inset-x-6 top-20 bottom-16"
        : "absolute inset-x-5 top-20 bottom-16";
  const titleClass =
    variant === "gallery"
      ? "text-[13px] leading-6"
      : variant === "feature"
        ? "text-base leading-7"
        : "text-sm leading-6";
  const captionClass =
    variant === "gallery" ? "p-4 text-xs sm:text-sm" : "p-5 text-sm";

  return (
    <figure
      className={`relative overflow-hidden rounded-[28px] border shadow-[0_18px_44px_rgba(15,23,42,0.08)] ${aspectClass} ${tone.shell} ${className}`}
    >
      <div
        className={`absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-80 dark:opacity-70 ${tone.glow}`}
      />

      <div className="absolute inset-x-5 top-5 flex items-center justify-between">
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

      <div className={`${bodyInsetClass} flex flex-col`}>
        <div className="mb-4 max-w-[88%]">
          <p
            className={`font-semibold text-slate-900 dark:text-white ${titleClass}`}
          >
            {preview.title}
          </p>
        </div>
        <div className="relative min-h-[120px] flex-1">
          <PlaceholderVisual preview={preview} tone={tone} variant={variant} />
        </div>
      </div>

      <figcaption
        className={`absolute inset-x-0 bottom-0 font-medium text-slate-700 dark:text-slate-200 ${captionClass}`}
      >
        {preview.caption}
      </figcaption>
    </figure>
  );
}
