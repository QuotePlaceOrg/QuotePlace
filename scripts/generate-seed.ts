// Generate scripts/seed-data.json from src/lib/data.ts + src/lib/blog-seed.ts.
// Run: bun scripts/generate-seed.ts
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AUTHORS, QUOTES, TOPICS, getAuthor } from "../src/lib/data";
import { BLOG_SEED } from "../src/lib/blog-seed";
import { searchKeywords } from "../src/lib/types";

const dir = dirname(fileURLToPath(import.meta.url));

const authors = AUTHORS.map((a) => ({
  id: a.id, slug: a.id, name: a.name, epithet: a.epithet, lifespan: a.lifespan, bio: a.bio,
  era: null, born: null, died: null, imageUrl: null,
  quoteCount: QUOTES.filter((q) => q.authorId === a.id).length,
  likeCount: 0, viewCount: 0, featured: false, status: "published",
  searchKeywords: searchKeywords(a.name, a.epithet, a.bio),
}));
const topics = TOPICS.map((t) => ({
  id: t.slug, slug: t.slug, name: t.name, description: t.description,
  quoteCount: QUOTES.filter((q) => q.topics.includes(t.slug)).length,
  likeCount: 0, imageUrl: null, featured: false,
}));
const quotes = QUOTES.map((q) => ({
  id: q.id, text: q.text, authorId: q.authorId,
  authorName: getAuthor(q.authorId)?.name ?? q.authorId,
  topics: q.topics, source: q.source, sourceUrl: null, language: "en",
  status: "published",
  likeCount: 0, favoriteCount: 0, viewCount: 0, shareCount: 0, copyCount: 0,
  featured: false, createdBy: null,
  searchKeywords: searchKeywords(q.text, getAuthor(q.authorId)?.name ?? "", q.source),
}));
const blogs = BLOG_SEED.map((b) => ({
  id: b.id, slug: b.slug, title: b.title, excerpt: b.excerpt, content: b.content,
  coverImageUrl: b.coverImageUrl, authorId: b.authorId, authorName: b.authorName,
  tags: b.tags, topics: b.topics, status: b.status,
  likeCount: 0, viewCount: 0, commentCount: 0, readMinutes: b.readMinutes,
  featured: b.featured, seoTitle: b.seoTitle, seoDescription: b.seoDescription,
  publishedAt: b.publishedAt,
}));

writeFileSync(join(dir, "seed-data.json"), JSON.stringify({ authors, topics, quotes, blogs }, null, 2));
console.log(`Wrote seed-data.json: ${quotes.length} quotes, ${authors.length} authors, ${topics.length} topics, ${blogs.length} blogs`);
