import { AUTHORS } from "@/lib/data";
import AuthorCard from "@/components/AuthorCard";
export default function AuthorsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Authors</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">Thinkers from across cultures and centuries, in one place.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AUTHORS.map((a) => <AuthorCard key={a.id} author={a} />)}
      </div>
    </div>
  );
}
