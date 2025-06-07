type Heading = {
  text: string;
  depth: number;
  id: string;
};

export default function PostIndex({ headings }: { headings: Heading[] }) {
  const indentClassMap: Record<number, string> = {
    2: "ml-0",
    3: "ml-4",
    4: "ml-8",
    5: "ml-12",
    6: "ml-16",
  };

  return (
    <div>
      <ul className="space-y-1 text-sm px-6">
        {headings.map((h) => (
          <li
            key={`${h.id}-${h.depth}-${Math.random().toString(36)}`}
            className={indentClassMap[h.depth] || "ml-0"}
          >
            <a href={`#${h.id}`} className="hover:underline text-gray">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
