# Social Multiway - full website project

Complete editable source for the published website, exported 13 October 2026.
Published version: 15
Source commit: 7aec8e8383c0993223b841de9c404aef8a040c98
Website: https://social-multiway.lowjinming123.chatgpt.site/

## What is included

This is a static website built with HTML, CSS and vanilla JavaScript.
The files in `dist/` are the editable source as well as the files served by the website.
No Node.js, npm installation, framework build, API keys or ChatGPT hosting are required to run it.

- `dist/index.html`: Home / landing page
- `dist/about/index.html`: latest redesigned About Us page
- `dist/contact/index.html`: Contact Us page
- `dist/privacy/index.html`: Privacy page
- `dist/social-book/index.html`: Social Book analytics dashboard
- `dist/social-book.css`, `dist/social-book.js`: Social Book dashboard, date filter and evidence dialogs
- `dist/social-book-data.js`: independent platform coin records and daily company spending records
- `dist/site.css`, `dist/site.js`: shared styles and navigation
- `dist/home.css`: landing page styles
- `dist/about.css`: About Us styles
- `dist/contact.css`, `dist/contact.js`: contact page styles and form behavior
- `dist/assets/`: logos, images, responsive images and fonts
- `dist/assets/fonts/manrope-license.txt`: included Manrope font license
- `dist/assets/tabler-icons-LICENSE.txt`: license for the IN/OUT arrow icons used by Social Book
- `.openai/hosting.json`: original Sites hosting configuration; it is not needed for ordinary static hosting

All tracked project files are included. Git history and local development credentials are not part of this export.

## Run on your Windows PC

1. Extract the ZIP.
2. Open a terminal in the extracted `social-multiway` folder, next to this README.
3. With Python installed, run:

```powershell
py -m http.server 8000 --bind 127.0.0.1 --directory dist
```

4. Open http://localhost:8000/ in your browser.
5. Press Ctrl+C in the terminal to stop the server.

If your Python installation uses `python` instead of `py`, substitute that command.
Use a local HTTP server so the root-relative asset paths and page links work correctly.

On macOS or Linux:

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

## Edit and deploy

Edit the HTML, CSS and JavaScript files directly and refresh the browser.
For EC2/Nginx, configure the web root to serve the contents of `dist/`.
The page paths are `/`, `/about/`, `/contact/`, `/privacy/` and `/social-book/`.
Deploy at the domain root because links and asset paths begin with `/`.
When using your own domain, update the `og:url` and `og:image` metadata in `dist/about/index.html`.
You can also upload this extracted folder into your own GitHub repository.

## Current functionality

Social Book has In and Out views, both filtered by Kid, Elder and Pet. In has 100 fictional masked spending records per type/date (800 per type, 2,400 total), ranked by Total Coins. Out uses independent company submissions tagged with a character type, date, unique record key, amount in RM and image evidence. Its demo counts vary from zero to fourteen records per type/date; real submission counts are unrestricted. The graph sums each day's submissions for the selected type, while the table shows individual records. Both views support 10/25/50 rows per page and direct page jumps. Money is stored as integer sen; Out records and amounts are never derived from user data or converted from coins.

The graph always shows eight dates: today and the previous seven days in Asia/Kuala_Lumpur. Today is labeled explicitly; all figures remain demo data, not a live feed. The window rolls at Malaysia midnight, checked every minute and when the tab becomes visible. Overlapping historical demo records remain stable. A live API is still needed for real-time spending updates.

The table has an independent date selector for today or each of the seven historical dates. Changing its date or pagination does not change the graph. Selecting a character changes the active view's totals, graph and records, resets pagination, and retains the table date. Switching In/Out retains the selected character, date and page size, and resets to the first page. The table allows scrolling to continue into the page at its edges; on mobile, the page owns vertical scrolling.

The local demo adapter in `dist/social-book-data.js` exposes `query({mode, type, date, page, size})` (mode defaults to `in`), `summary(date, type)` and `createDemoData(now)`. Out queries preserve stable submission order within each date, newest dates first. Summaries include `companyRecords` as the count of individual Out submissions. A real million-record deployment needs server-side filtering, sorting, pagination and precomputed summaries; this static demo does not include that backend. Do not send the complete production dataset to the browser. Tests exercise million-record pagination metadata with a bounded page response, not a production database load test.

Only masked Character IDs should reach public files or any future public API. Preserve the alphabetic prefix and last two digits, replacing intervening digits with lowercase x. Demo record keys are independent of these masked labels, which can repeat. Coins are never converted into RM.

Each demo company record has an empty `images` array. View opens that record's evidence dialog with an empty state. Add actual evidence later using `{ src: "/assets/evidence/example.webp", alt: "Accurate description" }` and place the corresponding file at that path. Local paths and HTTPS image URLs are supported. There is no upload form, upload service or persistent storage.

The shared header and footer remain unchanged. Pointer switches have a brief transition; keyboard actions and reduced-motion settings do not animate. Run checks with `node --test tests/social-book.test.cjs`.

The redesigned Contact Us page has a simple name, email and message form. It validates inputs and displays demo feedback; it does not send email, store submissions or connect to a backend or database.
The company email, `socialmultiway@gmail.com`, is a display-only example without a link. Replace its text in `dist/contact/index.html` when ready. Facebook, Instagram and TikTok are also display-only placeholders without links.
Connect the form to your backend or email service and add your actual company email before accepting enquiries.

Shared page styles request DM Sans and Manrope from Google Fonts; system sans-serif fonts provide a fallback when offline.
The About Us page includes a local Manrope font file.
All website images and logos used by this version are included in the archive.
The community illustration is conceptual artwork, not a photograph of the company's employees.
