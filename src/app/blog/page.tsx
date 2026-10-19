import { listBlogs } from "@/lib/db";
import BlogCard from "@/components/BlogCard";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await listBlogs();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Articles</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        Original StoicBare essays on Stoicism, time, anger, habits, and living well — {posts.length} articles.
      </p>
      {posts.length === 0 ? (
        <p className="mt-8 rounded-xl border border-[var(--border)] bg-white p-6 text-center">No articles published yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => <BlogCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
