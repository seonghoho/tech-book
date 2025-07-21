export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-8 mx-auto"></div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 bg-gray-300 dark:bg-gray-700 rounded-lg p-6 h-[600px]"></div>
          <div className="hidden xl:block xl:col-span-1 bg-gray-300 dark:bg-gray-700 rounded-lg p-6 h-[400px]"></div>
        </div>
      </div>
    </div>
  );
}
