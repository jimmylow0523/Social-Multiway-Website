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

Social Book uses fictional demo data. In ranks masked Character IDs by Total Coins spent on the platform, with no currency conversion. Out is an independent company total for each date, stored in integer sen and displayed in RM. The date filter updates the overview, ranking, selected day and evidence preview; the company table retains the full date history. The two trend charts use independent scales and must not be interpreted as comparable monetary values. No balance or exchange rate is calculated.

Edit `dist/social-book-data.js` to change the records. Only masked Character IDs should reach this public file or any future public API. Preserve the alphabetic prefix and last two digits, replacing intervening digits with lowercase x. Masked labels can repeat and must not be used as unique keys.

Each company date has an `images` array. It is currently empty. The View button opens a dialog with an empty state. To display actual evidence later, add an entry such as `{ src: "/assets/evidence/example.webp", alt: "Accurate description of the evidence" }` and place the corresponding file at that path. Only local paths or HTTPS image URLs are displayed. This page has no upload control, upload service or persistent storage.

Run the Social Book checks with `node --test tests/social-book.test.cjs`.

The contact form validates inputs and displays a message preview. It does not send email, store submissions or connect to a backend or database.
The company email address is currently a placeholder on the Contact Us page.
Connect the form to your backend or email service and add your actual company email before accepting enquiries.

Shared page styles request DM Sans and Manrope from Google Fonts; system sans-serif fonts provide a fallback when offline.
The About Us page includes a local Manrope font file.
All website images and logos used by this version are included in the archive.
The community illustration is conceptual artwork, not a photograph of the company's employees.
