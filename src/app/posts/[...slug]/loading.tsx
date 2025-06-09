export default function Loading() {
  return (
    <div className="flex flex-col gap-4 px-6 py-6 animate-pulse">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm"
        >
          <div className="w-12 h-12 rounded-md bg-gray-300 dark:bg-zinc-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-gray-300 dark:bg-zinc-700 rounded" />
            <div className="h-4 w-1/2 bg-gray-300 dark:bg-zinc-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
