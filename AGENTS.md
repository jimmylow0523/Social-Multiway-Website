# Website defaults

- This is a static website. Its HTML, CSS, JavaScript, and assets live in `dist/`.
- Use the existing shared navigation/menu, header, and footer on every page by default. Match the markup on `dist/about/index.html`, adjusting only the current-page indicator. Keep loading `dist/site.css` and `dist/site.js`; scope page-specific styles to the main content.
- Use `/assets/social-multiway-icon-green.svg` as the browser-tab icon and `Social Multiway` as the tab title, matching the company pages. The header uses the existing olive/ivory wordmark variants.
- Use `dist/text-colors.css` for shared company colors and navigation/footer text. Register new page body classes with its shared selectors. The warm company background is `--company-paper: #f8f6ef`.
- Preserve the simple footer: copyright plus Our businesses, About us, and Contact us. Do not add a footer logo.
- Follow the design skill explicitly selected in the user's prompt. The active project design skill is `.agents/skills/emil-design-eng/SKILL.md`.
- Social Book analytics use demo data with an eight-day window: seven prior dates and the current Malaysia date. Both IN and OUT filter by Kid, Elder, or Pet. IN is user coin spending; OUT is independent company-submitted RM spending with evidence per record. Each type/date can have zero, one, or multiple OUT records. Graphs sum records per day; tables list and paginate individual records. Never calculate OUT from IN/user data.
- Keep the graph and records table as separate sections. Tables must allow normal page scrolling without trapping vertical scroll inside a fixed-height container.
- Keep changes local unless the user requests publishing or a GitHub push.
