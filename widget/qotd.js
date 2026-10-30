/* QuotePlace — Quote of the Day widget.
   Usage: <div id="quoteplace-qotd"></div>
          <script src="https://quoteplace.vercel.app/widget/qotd.js" async></script>
   Renders today's quote from QuotePlace with a link back. Free to use. */
(function () {
  var el = document.getElementById('quoteplace-qotd');
  if (!el) return;
  fetch('https://quoteplace.vercel.app/qotd.json')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      el.innerHTML = '';
      var fig = document.createElement('figure');
      fig.style.cssText = 'margin:0;padding:20px 22px;background:#FAF6EC;border:1px solid #EFE9DC;border-radius:12px;font-family:Georgia,serif;max-width:520px';
      var bq = document.createElement('blockquote');
      bq.style.cssText = 'margin:0 0 10px;font-size:20px;line-height:1.45;color:#1A1815';
      bq.textContent = '\u201C' + d.text + '\u201D';
      var cap = document.createElement('figcaption');
      cap.style.cssText = 'font-size:14px;color:#555';
      var au = document.createElement('span');
      au.textContent = '\u2014 ' + d.author + ' \u00B7 ';
      var link = document.createElement('a');
      link.href = 'https://quoteplace.vercel.app/quote-of-the-day/';
      link.textContent = 'Quote of the Day via QuotePlace';
      link.style.cssText = 'color:#2740D6;text-decoration:none';
      cap.appendChild(au); cap.appendChild(link);
      fig.appendChild(bq); fig.appendChild(cap);
      el.appendChild(fig);
    })
    .catch(function () { /* leave the host page's fallback content untouched */ });
})();
