import Link from "next/link";
import { TOPICS } from "@/lib/data";
export default function TopicPills({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Popular topics">
      {TOPICS.map((t) => (
        <Link key={t.slug} href={`/topics/${t.slug}`} className={`rounded-full border px-3 py-1.5 text-sm capitalize ${active === t.slug ? "bg-[var(--primary)] text-white" : "bg-white"}`}>{t.name}</Link>
      ))}
    </div>
  );
}
