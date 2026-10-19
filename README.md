# QuotePlace + Firebase setup

## 1. Create the project
1. Go to https://console.firebase.google.com and click **Add project**.
2. **Build > Authentication > Get started.** Enable **Email/Password** and **Google** (pick your support email).
3. **Build > Firestore Database > Create database** (production mode, pick a region near India such as asia-south1).
4. **Project settings > Your apps > Web (</>)**. Register an app and copy the config into `firebase-config.js`.
5. **Authentication > Settings > Authorized domains:** add your real domain when you have one (localhost and *.web.app are already there).

## 2. Security rules
Paste `firestore.rules` into **Firestore > Rules** and publish, or run `firebase deploy --only firestore:rules`.

## 3. Add quotes
Each quote is a document in the `quotes` collection:

| field | type | example |
|---|---|---|
| text | string | Well begun is half done. |
| author | string | Aristotle |
| category | string | Action |
| img | string (optional) | https://your-cdn/quote-123.jpg |
| createdAt | timestamp | (required, used for ordering) |

Images: store the files on any image host or CDN (Cloudflare R2, Cloudinary, Bunny, or Firebase Storage) and put the URL in `img`. Without `img`, the site draws a colour card from the text.

Bulk upload thousands of quotes with the Admin SDK (Node):
```js
// npm i firebase-admin ; download a service account key from Project settings > Service accounts
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccount.json")) });
const db = admin.firestore(), quotes = require("./quotes.json"); // [{text,author,category,img}]
(async () => {
  for (let i = 0; i < quotes.length; i += 400) {
    const b = db.batch();
    quotes.slice(i, i + 400).forEach(q => b.set(db.collection("quotes").doc(),
      { ...q, createdAt: admin.firestore.FieldValue.serverTimestamp() }));
    await b.commit();
  }
})();
```
Never put `serviceAccount.json` on the website or in a public repo.

## 4. Run and deploy
- Local test: the page uses ES modules, so open it through a server (`npx serve .`), not by double-clicking.
- Deploy: `npm i -g firebase-tools`, `firebase login`, `firebase init` (reuse these files), `firebase deploy`.

## Notes
- Until you paste real keys, the site shows 18 sample quotes and login says it isn't set up.
- Quotes load 40 at a time with a "Load more" button. Search and category chips filter the quotes loaded so far. For full-catalogue search at scale, add Algolia or Typesense later.
- Update the contact details in the `CO` block in `index.html` and keep the Privacy Policy matching what you actually collect.
