# Social Multiway — Company & Product Content Brief

## 1. Social Multiway

**Social Multiway is a company that provides a charity platform. It is not a charity company.**

The company develops digital products and services that aim to connect everyday user activities with practical ways of helping people, animals, and communities.

Its current main ecosystem includes:

- **Social Button** — the main application
- **Social Book** — a transparency and contribution record platform
- **Social Shop** — a shop where purchases can also be used to help others

The overall idea is to create a platform where technology, community participation, spending, and social contribution can work together.

---

## 2. Social Button

**Social Button is the main app developed by Social Multiway.**

The app is designed as a multi-feature platform. Its current planned feature areas include:

- Emergency
- Community
- Nature
- Services

For the website landing page, Social Button should only be introduced at a general level. Detailed explanations of individual features should be placed on dedicated pages later.

### Emergency

The Emergency feature is intended to help users find suitable assistance more quickly during urgent situations.

Examples include:

- Finding nearby fire and rescue support during a fire or accident
- Finding nearby hospitals or medical assistance when medical help is needed

The purpose is to help users identify relevant nearby assistance faster.

For the landing page, this should remain a simple general explanation rather than listing every emergency function.

### Community

The Community feature includes a virtual care game.

The current game concepts are:

- **Kiddymon** — represents orphans
- **Eldermon** — represents elderly people
- **Petamon** — represents stray animals

The gameplay is similar to a virtual pet or care game. Users perform actions such as:

- Feeding
- Bathing
- Caring
- Helping the character grow

User activity inside this feature is connected to the wider Social Multiway contribution ecosystem.

Detailed gameplay mechanics should not be explained on the main landing page yet.

### Nature

The Nature feature is still being defined.

For now, it should not be explained in detail on the website.

### Services

The Services feature is still being defined.

For now, it should not be explained in detail on the website.

---

## 3. Social Book

**Social Book is the transparency and contribution record section of the Social Multiway ecosystem.**

It is currently connected mainly to activity from the Community feature inside Social Button.

Social Book has two views, **IN** and **OUT**. Both views use the same three character-type filters:

- **Kid** — Kiddymon / support for orphans
- **Elder** — Eldermon / support for elderly people
- **Pet** — Petamon / support for stray animals

The selected character type applies to both the analytics graph and the records table.

### IN

**IN records the amount of game coins spent by users.**

When users spend coins inside Community-related game features, Social Book shows the daily amount spent for the selected character type. The table ranks the selected type's user records by coins spent, with masked character IDs.

The purpose is to provide a visible record of user participation and in-game activity.

For example, Social Book may show:

- How many coins were spent today
- Daily coin activity
- Community game participation

At the current stage, IN mainly refers to coins spent inside the Community games.

### OUT

**OUT shows company-submitted spending records in Malaysian Ringgit (RM), filtered by Kid, Elder, or Pet.**

OUT is not a universal company total shared across all three types. Every company submission belongs to one character type and one spending date, with its own RM amount and supporting image evidence when available.

The number of records depends on what the company submits. A character type can have zero, one, or multiple spending records on the same date. Each submission remains a separate table row; records are not merged into one daily row.

OUT records are independent of users' data. Do not calculate OUT amounts or create OUT records from IN records, user counts, or Gold Coins. No coin-to-RM conversion is used on this page.

The OUT table displays the date, individual amount in RM, and a link to that record's image evidence. If no image is available, show an honest empty state. The analytics graph sums the submitted RM amounts for the selected character type on each date. The overview shows total RM, the number of company records, and the highest daily RM total within the displayed window.

The purpose of OUT is to show the real-world contribution made by Social Multiway in a simple and transparent way.

### Analytics and Records

- Keep the analytics graph and records table as separate sections.
- The graph always covers eight Malaysia dates: today and the seven previous dates. Dates without records show zero activity.
- The table offers those same eight individual dates, defaults to today, and lists only the selected date and character type. There is no all-dates option.
- Changing the table date or page does not change the graph's eight-day window.
- Keep Kid, Elder, and Pet controls available in both IN and OUT. Switching views retains the character type and table date, and resets pagination to the first page.
- Both tables support pagination so company submission counts are not limited to one record per day.
- The current website uses clearly labeled demo data. Real company submissions and today's live updates require a future data connection; no submission form or live service is implemented yet.

### Important Social Book Principle

The public-facing concept should be easy to understand:

**IN shows community participation. OUT shows real-world contribution.**

Both views are organized by character type, but use independent data sources: user coin activity for IN and company-submitted spending records for OUT.

---

## 4. Social Shop

**Social Shop is Social Multiway's own product shop with an optional contribution model.**

Social Multiway sells its own products through the shop.

After purchasing a product, the customer can choose whether they want the item delivered to them.

### Delivery

If the customer chooses **Delivery**, the purchased item will be delivered to the customer normally.

### No Delivery

If the customer chooses **No Delivery**, the customer does not receive the item.

Instead, Social Multiway can use the value or purpose of that purchase to support people, animals, or other eligible causes within the Social Multiway ecosystem.

Current intended groups include:

- Orphans
- Elderly people
- Stray animals

In the future, this may also support additional causes introduced through new Social Multiway features.

### Social Shop Core Idea

Social Shop should remain a real shop first, while also giving customers an option to turn a purchase into a contribution.

The website should explain this simply and avoid making it sound like Social Multiway itself is a charity organization.

---
