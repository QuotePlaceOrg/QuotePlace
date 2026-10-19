import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, listBlogs, listBlogComments } from "@/lib/db";
import BlogCard from "@/components/BlogCard";

export const dynamic = "force-dynamic";

// Minimal Markdown renderer: headings, paragraphs, bold, lists. No dependency.
function renderMarkdown(md: string) {
  const blocks = md.split(/\n\s*\n/);
  return blocks.map((block, i) => {
    const t = block.trim();
    if (t.startsWith("## ")) return <h2 key={i} className="mt-6 text-2xl font-bold">{t.slice(3)}</h2>;
    if (t.startsWith("# ")) return <h1 key={i} className="text-3xl font-bold">{t.slice(2)}</h1>;
    if (t.startsWith("1. ") || /^\d+\. /.test(t)) {
      return <ol key={i} className="mt-3 list-decimal space-y-1 pl-6">{t.split("\n").map((line, j) => <li key={j}>{line.replace(/^\d+\.\s*/, "")}</li>)}</ol>;
    }
    return <p key={i} className="mt-3 leading-relaxed">{t.replace(/\*\*(.+?)\*\*/g, "$1")}</p>;
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post || post.status !== "published") notFound();
  const comments = await listBlogComments(post.id);
  const related = (await listBlogs()).filter((b) => b.id !== post.id && b.topics.some((t) => post.topics.includes(t))).slice(0, 3);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/blog" className="text-sm text-[var(--primary)] hover:underline">← All articles</Link>
      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""} · {post.readMinutes} min read · {post.viewCount} views · ♥ {post.likeCount} likes
      </p>
      <h1 className="mt-2 font-serif text-4xl font-bold leading-tight">{post.title}</h1>
      <p className="mt-3 text-lg text-[var(--muted-foreground)]">{post.excerpt}</p>
      <p className="mt-2 text-sm">By {post.authorName}</p>
      <article className="mt-6 border-t border-[var(--border)] pt-4">{renderMarkdown(post.content)}</article>
      <div className="mt-4 flex flex-wrap gap-1">
        {post.tags.map((t) => <span key={t} className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">{t}</span>)}
      </div>
      <section className="mt-10">
        <h2 className="text-xl font-bold">Comments ({comments.length})</h2>
        {comments.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">No comments yet. Sign in to be the first to comment — comments save to Firestore once Firebase is configured.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-sm font-medium">{c.userName}</p>
                <p className="mt-1 text-sm">{c.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Related articles</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">{related.map((p) => <BlogCard key={p.id} post={p} />)}</div>
        </section>
      )}
    </div>
  );
}
