# Epsilon Study

Fast, minimal CDN-style landing page — pick one of three streaming servers to enter the Epsilon Study network.

> Reverse-engineered from the public landing page at `studyrays.cc` using
> [`rea-agents`](https://github.com/morluto/rea) (REA — Reverse Engineer
> Anything) and rebuilt as **Epsilon Study** on Next.js 16. No proprietary
> assets, brand text, or logos were copied — only the page structure,
> sectioning, and visual language (Inter typeface, blue/green/black gradient
> server buttons, hidden SEO tag list) were reproduced.

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York)
- **Font**: Inter (via `next/font/google`)
- **Animations**: Custom CSS keyframes (brand shimmer, button shine, entry rise)

## Page structure

```
<main>                              ← min-h-screen flex flex-col, white bg
  <section>                         ← hero, centered
    <span>High-Speed CDN Platform</span>   ← tag pill
    <h1>Epsilon Study</h1>                 ← shimmer gradient text
    <p>Fast, reliable content delivery…</p>
    <div role="list" class="sr-only">     ← hidden SEO tag list
    <nav aria-label="Server selection">
      <a class="epsilon-button epsilon-button-server1">🔥 Open Server 1 🔥</a>
      <a class="epsilon-button epsilon-button-server2">⚡ Open Server 2 ⚡</a>
      <a class="epsilon-button epsilon-button-server3">🚀 Open Server 3 🚀</a>
    </nav>
    <div>All systems operational · <IST clock></div>
  </section>
  <footer>                          ← sticky bottom (mt-auto)
    © 2026 Epsilon Study · Fast CDN Platform
  </footer>
</main>
```

## Configure the server URLs

Edit `src/app/page.tsx` and replace the placeholder URLs in the `SERVERS`
array with the real Epsilon Study endpoints:

```ts
const SERVERS: Server[] = [
  { id: 1, label: "Open Server 1", url: "https://your-real-server-1/", … },
  { id: 2, label: "Open Server 2", url: "https://your-real-server-2/", … },
  { id: 3, label: "Open Server 3", url: "https://your-real-server-3/", … },
];
```

While the URLs still match `*.epsilon-study.app`, clicking a button shows
a toast and prevents navigation (so the demo doesn't open broken tabs).
Once you set real URLs, clicking opens them in a new tab as expected.

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
│   └── page.tsx        ← the landing page
└── components/ui/      ← shadcn/ui primitives (button, toast, etc.)
```

## License

MIT
