// Quote Place blog seed — original Quote Place writing, not copied from any other site.
// Firestore-ready shape. TODO: replace with Firestore `blogs` reads via db.ts
// (listBlogs / getBlogBySlug already do this when Firebase is configured).
import type { BlogDoc } from "./types";

const base = { likeCount: 0, viewCount: 0, commentCount: 0, createdAt: 0, updatedAt: 0, status: "published" as const, coverImageUrl: null };

export const BLOG_SEED: BlogDoc[] = [
  {
    ...base, id: "blog-dichotomy", slug: "dichotomy-of-control",
    title: "The Dichotomy of Control: The One Idea That Changes Everything",
    excerpt: "Some things are up to us, and some things are not. Learning to tell the difference is the whole game.",
    content: `# The Dichotomy of Control\n\nEpictetus opens the Enchiridion with a line that still cuts through noise two thousand years later: some things are up to us, and some things are not.\n\n## What is up to us\n\nOur judgements. Our impulses. Our desires and aversions. In short: the way we respond.\n\n## What is not up to us\n\nOur body. Our property. Our reputation. Our job. In short: everything outside our own mind.\n\n## Why it matters\n\nMost suffering comes from demanding control over the second list while neglecting the first. You cannot control the traffic, the market, or what someone thinks of you. You can control whether you answer with patience or with anger.\n\n## A daily practice\n\nEach morning, write two columns: "Up to me" and "Not up to me". Put the day's worries in the right column. Act on the first. Release the second.\n\nThat is the whole practice. It takes a minute, and it changes the day.`,
    authorId: "stoicbare", authorName: "Quote Place", tags: ["stoicism", "control", "practice"], topics: ["wisdom", "resilience", "fate"],
    readMinutes: 4, featured: true, seoTitle: "The Dichotomy of Control — Quote Place", seoDescription: "Some things are up to us, some are not. A plain guide to Epictetus and daily practice.",
    publishedAt: Date.parse("2026-10-01"),
  } as BlogDoc,
  {
    ...base, id: "blog-memento-mori", slug: "memento-mori",
    title: "Memento Mori: Remember You Will Die (And Why That Is Good News)",
    excerpt: "Remembering death is not morbid. It is the fastest way to stop wasting time.",
    content: `# Memento Mori\n\nThe Stoics kept death close — not to frighten themselves, but to focus themselves.\n\n## The point\n\nIf this day were your last, would you spend it arguing online, or calling someone you love? Memento mori asks that question before the day is spent.\n\n## Seneca on time\n\nSeneca wrote that we are not given a short life — we waste much of it. We spend time as if it were unlimited, then panic when it runs out.\n\n## A gentle practice\n\nOnce a day, pause and say: "This day will end. How do I want to have spent it?" Then spend the next hour that way.`,
    authorId: "stoicbare", authorName: "Quote Place", tags: ["stoicism", "time", "death"], topics: ["time", "death", "life"],
    readMinutes: 3, featured: true, seoTitle: "Memento Mori — Quote Place", seoDescription: "Remember you will die, and live better because of it.",
    publishedAt: Date.parse("2026-10-03"),
  } as BlogDoc,
  {
    ...base, id: "blog-amor-fati", slug: "amor-fati",
    title: "Amor Fati: Learning to Love What Happens",
    excerpt: "Do not just accept fate. Love it. That is the Stoic's hardest — and freest — move.",
    content: `# Amor Fati\n\nAmor fati means "love of fate". It goes one step beyond acceptance.\n\n## Acceptance vs love\n\nAcceptance says: "This happened, I will cope." Love says: "This happened, and I will use it."\n\n## Marcus Aurelius on obstacles\n\nMarcus wrote that what stands in the way becomes the way. The obstacle is not a detour from the path — it is the path.\n\n## Practice\n\nWhen something goes wrong, ask: "What does this make possible that was not possible before?" The answer is often the beginning of the next good thing.`,
    authorId: "stoicbare", authorName: "Quote Place", tags: ["stoicism", "fate", "resilience"], topics: ["fate", "resilience", "wisdom"],
    readMinutes: 3, featured: false, seoTitle: "Amor Fati — Quote Place", seoDescription: "Do not just accept fate. Love it.",
    publishedAt: Date.parse("2026-10-05"),
  } as BlogDoc,
  {
    ...base, id: "blog-morning-routine", slug: "stoic-morning-routine",
    title: "A 10-Minute Stoic Morning Routine That Actually Sticks",
    excerpt: "No 5 a.m. ice baths. Just three small moves that set the day's frame.",
    content: `# A 10-Minute Stoic Morning Routine\n\n## 1. Preview the day (3 minutes)\n\nThink through the day ahead. Where will you be tested? Decide in advance how you will respond.\n\n## 2. Read one passage (4 minutes)\n\nOne paragraph from Marcus Aurelius, Seneca, or Epictetus. One idea is enough.\n\n## 3. Write one intention (3 minutes)\n\nOne sentence: "Today I will be patient with ___." Carry it in your pocket.\n\n## Why it works\n\nYou do not need a perfect morning. You need a morning that reminds you who you want to be before the world tells you otherwise.`,
    authorId: "stoicbare", authorName: "Quote Place", tags: ["routine", "habits", "practice"], topics: ["discipline", "wisdom", "life"],
    readMinutes: 3, featured: false, seoTitle: "A 10-Minute Stoic Morning Routine — Quote Place", seoDescription: "Three small moves that set the day's frame.",
    publishedAt: Date.parse("2026-10-08"),
  } as BlogDoc,
  {
    ...base, id: "blog-anger", slug: "seneca-on-anger",
    title: "Seneca on Anger: Why It Feels Powerful and Leaves You Weaker",
    excerpt: "Anger promises strength. It delivers regret. Seneca's remedy still works.",
    content: `# Seneca on Anger\n\nSeneca wrote a whole book on anger — De Ira — and his verdict is blunt: anger is a brief madness.\n\n## Why anger lies\n\nAnger feels like power because it is loud. But the angry person is not in control; the anger is.\n\n## Seneca's remedy\n\nDelay. When anger rises, do not speak, do not write, do not decide. Give it an hour. Most anger, left alone for an hour, shrinks to a size you can see clearly.\n\n## Practice\n\nNext time you feel the heat rise, say to yourself: "I will answer this in one hour." Then answer it calmly — or not at all.`,
    authorId: "stoicbare", authorName: "Quote Place", tags: ["anger", "seneca", "emotions"], topics: ["anger", "wisdom", "discipline"],
    readMinutes: 3, featured: false, seoTitle: "Seneca on Anger — Quote Place", seoDescription: "Anger promises strength. It delivers regret.",
    publishedAt: Date.parse("2026-10-10"),
  } as BlogDoc,
  {
    ...base, id: "blog-journaling", slug: "stoic-journaling",
    title: "Stoic Journaling: The Evening Review in 5 Minutes",
    excerpt: "Marcus Aurelius wrote to himself, not for publication. Steal his method.",
    content: `# Stoic Journaling\n\nMarcus Aurelius did not write the Meditations for readers. He wrote it for himself, at night, to check his own day.\n\n## The evening review\n\nThree questions, five minutes:\n\n1. What did I do well today?\n2. Where did I lose control?\n3. What will I do differently tomorrow?\n\n## Why it works\n\nYou cannot improve what you never review. The evening review turns every day into a lesson, even the bad ones — especially the bad ones.\n\n## Start tonight\n\nOne page. Three questions. No judgement, just honesty.`,
    authorId: "stoicbare", authorName: "Quote Place", tags: ["journaling", "habits", "practice"], topics: ["self-knowledge", "discipline", "wisdom"],
    readMinutes: 3, featured: false, seoTitle: "Stoic Journaling — Quote Place", seoDescription: "The evening review in 5 minutes.",
    publishedAt: Date.parse("2026-10-12"),
  } as BlogDoc,
];

export function getBlogSeedBySlug(slug: string) {
  return BLOG_SEED.find((b) => b.slug === slug);
}
