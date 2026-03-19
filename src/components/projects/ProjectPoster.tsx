import Image from "next/image";

type ProjectPosterProps = {
  title: string;
  mainColor: string;
  textColor?: string;
  logoSrc?: string;
  logoAlt?: string;
  priority?: boolean;
  className?: string;
  sizes: string;
};

export default function ProjectPoster({
  title,
  mainColor,
  textColor = "#ffffff",
  logoSrc,
  logoAlt,
  priority = false,
  className = "",
  sizes,
}: ProjectPosterProps) {
  const posterStyle = {
    backgroundColor: mainColor,
    color: textColor,
  };

  if (logoSrc) {
    return (
      <div
        data-project-poster="true"
        className={`relative overflow-hidden rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] grayscale transition duration-300 will-change-[filter,transform] hover:grayscale-0 group-hover:grayscale-0 ${className}`}
        style={posterStyle}
      >
        <Image
          src={logoSrc}
          alt={logoAlt ?? `${title} logo`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-contain p-7"
        />
      </div>
    );
  }

  return (
    <div
      data-project-poster="true"
      className={`flex items-center justify-center rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-6 text-center grayscale transition duration-300 will-change-[filter,transform] hover:grayscale-0 group-hover:grayscale-0 ${className}`}
      style={posterStyle}
    >
      <p className="mx-auto max-w-[10ch] text-[clamp(1.2rem,2vw,2rem)] font-semibold leading-[1.2] tracking-[-0.05em]">
        {title}
      </p>
    </div>
  );
}
