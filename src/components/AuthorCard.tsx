import Link from "next/link";
import type { Author } from "@/lib/data";
import { quoteCountForAuthor } from "@/lib/data";
export default function AuthorCard({ author }: { author: Author }) {
  const initials = author.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <Link href={`/authors/${author.id}`} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] font-serif text-lg font-bold text-white" aria-hidden="true">{initials}</span>
        <div>
          <p className="font-serif font-bold">{author.name}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{author.epithet} · {author.lifespan}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-[var(--muted-foreground)]">{author.bio}</p>
      <p className="mt-3 text-xs font-medium">{quoteCountForAuthor(author.id)} quotes</p>
    </Link>
  );
}
