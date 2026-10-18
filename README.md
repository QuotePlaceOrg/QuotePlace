# Epsilon Study

Study dashboard — discover and enroll in exam-prep batches (JEE, NEET, IOQM,
CLAT, IPMAT, KCET, CAPF, GPAT, Foundation, Design…). Direct access: every
batch link opens with **no key wall, no expiry countdown, no generator
redirect**.

> Reverse-engineered from the public landing page at `pw.studyparcham.in`
> using [`rea-agents`](https://github.com/morluto/rea) (REA — Reverse
> Engineer Anything) and rebuilt as **Epsilon Study** on Next.js 16.
> The source site gates every batch behind an access-key system
> (`verifyAccessWithServer`, `ParchamVault`, `redirectToGenerator`,
> a `🔑 Expires in: …` badge). Per the product decision, **none of that
> is reproduced here** — every batch is directly accessible.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- **Font**: Inter (via `next/font/google`)

## Page structure

```
<div class="min-h-screen flex flex-col">
  <Header sticky>                 ← logo, nav, + Add Batch, notifications bell
                                     (NO key-timer badge — that was the access
                                      key system the user asked us to omit)
  <main>
    <section hero>
      <h2>Discover All Batches 🔥</h2>
      <Input search />
      <grid of BatchCard>           ← 8 visible, Load More reveals more
        thumbnail + name + "Enroll and Study"
      <Button>Load More</Button>
    </section>
  </main>
  <Footer sticky>                  ← mt-auto, copyright + live IST clock
  <AITutorChat floating />         ← decorative, original copy
  <TelegramModal dismissible />    ← decorative, placeholder t.me link
</div>
```

## Configure batch URLs (direct access)

Each batch in `src/app/page.tsx` has a direct-access `url`. While it still
matches `*.epsilon-study.app`, clicking "Enroll and Study" surfaces a toast
asking you to configure it. Set a real URL and clicking opens the batch
content in a new tab — no key, no wall.

```ts
const BATCHES: Batch[] = [
  { id: "jee-foundation-2027", name: "JEE 2027 — Foundation",
    url: "https://your-real-batch-url/", … },
  …
];
```

## Develop

```bash
bun install
bun run dev      # starts on http://localhost:3000
bun run lint     # ESLint
```

## Project layout

```
src/
├── app/
│   ├── globals.css     ← Tailwind theme + Epsilon animations
│   ├── layout.tsx      ← Inter font, metadata, JSON-LD
│   └── page.tsx        ← the dashboard (header, hero, batch grid, AI tutor,
│                         telegram modal, footer)
└── components/ui/      ← shadcn/ui primitives (Button, Input, Badge, …)
```

## License

MIT

