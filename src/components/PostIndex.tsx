type Heading = {
  text: string;
  depth: number;
  id: string;
};

export default function PostIndex({ headings }: { headings: Heading[] }) {
  return (
    <div>
      <ul className="space-y-1 text-sm px-6">
        {headings.map((h) => (
          <li key={h.id} className={`ml-${(h.depth - 2) * 4}`}>
            <a href={`#${h.id}`} className="hover:underline text-gray">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
