export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Next.js 14
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Production-ready template with App Router, Prisma, and NextAuth.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/api/users"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            View API
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
