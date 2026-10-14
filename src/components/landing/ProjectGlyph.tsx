import { projectGlyphKind } from "@/components/landing/projectCard";

type Props = {
  slug: string;
};

// 프로젝트 성격을 나타내는 작은 선 그림. 기본 선은 글자색, 강조선 하나만 프로젝트 고유색이다.
export default function ProjectGlyph({ slug }: Props) {
  const kind = projectGlyphKind(slug);

  return (
    <svg viewBox="0 0 200 64" aria-hidden="true" className="h-16 w-full max-w-[220px]">
      {kind === "canvas" ? (
        <>
          <rect className="project-glyph-line" x="64" y="12" width="72" height="40" rx="6" />
          <circle className="project-accent-stroke" cx="100" cy="32" r="11" />
        </>
      ) : null}
      {kind === "route" ? (
        <>
          <path className="project-glyph-line" d="M60 48 L84 26 L108 38 L140 16" />
          <circle className="project-accent-stroke" cx="108" cy="38" r="5" />
        </>
      ) : null}
      {kind === "pitch" ? (
        <>
          <rect className="project-glyph-line" x="60" y="10" width="80" height="44" />
          <line className="project-glyph-line" x1="100" y1="10" x2="100" y2="54" />
          <circle className="project-accent-stroke" cx="100" cy="32" r="9" />
        </>
      ) : null}
      {kind === "default" ? (
        <>
          <rect className="project-glyph-line" x="70" y="12" width="60" height="40" rx="4" />
          <line className="project-accent-stroke" x1="70" y1="52" x2="130" y2="12" />
        </>
      ) : null}
    </svg>
  );
}
