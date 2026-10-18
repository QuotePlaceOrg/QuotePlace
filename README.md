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
    <p>Direct access — redirecting in Ns.</p>
    <div role="list" class="sr-only">     ← hidden SEO tag list
    <a class="epsilon-button epsilon-button-server3">🚀 Enter Now 🚀</a>
    <p>Auto-redirect in Ns, or click the button.</p>
    <div>All systems operational · <IST clock></div>
  </section>
  <footer>                          ← sticky bottom (mt-auto)
    © 2026 Epsilon Study · Fast CDN Platform
  </footer>
</main>
```

## Configure the direct-access target

Edit `src/app/page.tsx` and replace the `TARGET_URL` constant with the real
Epsilon Study endpoint. Visiting `/` will auto-redirect there after
`COUNTDOWN_SECONDS` (default 3).

```ts
const TARGET_URL = "https://your-real-endpoint.example/";
const COUNTDOWN_SECONDS = 3;
```

While `TARGET_URL` still matches `*.epsilon-study.app`, the auto-redirect is
disabled and the button shows a toast (so the demo doesn't kick users out
to a non-existent host). Set a real URL and the page will redirect
automatically on load, with the "Enter Now" button as a manual fallback.

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
