# Paul Graham Essays

A searchable index of Paul Graham’s essays, with publication dates, approximate word counts, reading times, and RSS feeds. Every article link opens the original. The site does not mirror essay text.

**[Browse the index](https://pg-essays-feed.vercel.app/)** · **[RSS](https://pg-essays-feed.vercel.app/feed.xml)** · **[JSON Feed](https://pg-essays-feed.vercel.app/feed.json)** · **[Download metadata](https://pg-essays-feed.vercel.app/catalog.json)**

## Use the index

Search titles, filter by publication year or length, and select a column heading to sort. Row numbers keep their position in the original source list. Search and filter settings stay in the URL, so you can share a specific view. Reset clears them.

The index covers the unique links listed on [Paul Graham’s essays page](https://www.paulgraham.com/articles.html), including its two text chapters. It is not a crawl of every page on his website.

Dates come from essay headers. A month-only date stays month-only. Missing dates appear as unavailable and sort after known dates. Revision dates do not replace an earlier publication date. The dates reflect the author’s header, rather than an independently verified first-publication timestamp.

Word counts are estimates from the recognized body, including footnotes. They exclude navigation and known header material. Older HTML layouts can affect the estimate. Reading times use 225 words per minute. The updater fetches pages for these calculations and discards their text. Only metadata enters the repository and public JSON.

## Feeds and updates

The RSS and JSON feeds contain the 60 latest links in source order, with original URLs as stable identifiers. They check the live essay index after an hourly cache expires. They do not fetch essay bodies during requests or invent publication timestamps.

The complete metadata index updates daily through [GitHub Actions](.github/workflows/update-index.yml), with a manual **Run workflow** option. New and failed entries are fetched first. Existing metadata is refreshed after 30 days. A successful metadata commit triggers the connected Vercel deployment. GitHub can delay scheduled runs and disable inactive public-repository schedules.

On source failure, the feed uses a previous warm-process result or its deployed fallback snapshot. [Feed status](https://pg-essays-feed.vercel.app/status.json) and response headers report the check time and stale state. A failed metadata refresh keeps previous successful values. An invalid index stops the updater before it writes new files.

## Run locally

Use Node.js 22 or later.

```sh
npm ci
npm test
npm run dev
```

Open http://localhost:3002.

```sh
# Update the complete index, with at most 250 requests and two workers.
npm run update

# A smaller first pass; rerun to continue missing or failed entries.
npm run update -- --limit 20 --workers 2

# Recheck all metadata within the same bounded request limit.
npm run update -- --refresh

# Update only the feed fallback, without essay metadata requests.
npm run snapshot
```

Press Ctrl+C to stop after active requests and retain the results. Existing files are replaced atomically. Metadata updates go to `data/metadata.json`, `public/catalog.json`, and `data/last-good.json`. No credentials are needed. The updater only requests the fixed author site and two explicitly allowed chapter URLs.

Deploy with `vercel --prod` after confirming the linked project. Static assets live in `public/`; the feed runs in `api/feed.mjs`. `FEED_ORIGIN` can override the canonical feed origin for a separate deployment. The local folder and existing production hostname remain `pg-essays-feed`.

## Checks and architecture

`npm test` covers source ordering, duplicate links, invalid upstream responses, XML escaping, outage fallback, date precision, legacy HTML boundaries, URL restrictions, table sorting, filtering, and shared view state. See [DESIGN.md](DESIGN.md) for the design and data boundaries and [AGENTS.md](AGENTS.md) for contributor rules.

The app uses plain JavaScript, semantic HTML, and CSS. Cheerio (MIT) parses the legacy HTML. No client framework, account, database, or analytics is required.

## Related projects and attribution

[Olshansk/pgessays-rss](https://github.com/Olshansk/pgessays-rss) and [leftmove/paul-graham](https://github.com/leftmove/paul-graham) offer other PG feed generators. Their repository pages did not show a license when checked. No code was copied. Aaron Swartz’s earlier scraped feed inspired the original feed approach.

This is an independent project, unaffiliated with Paul Graham. Essays belong to their author. Public source availability does not grant a license to republish his writing. This repository does not currently include a software license.
