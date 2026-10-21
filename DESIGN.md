# Paul Graham Essays: design and data boundaries

## Product direction

A compact reading index, with a maintained feed alongside it. The primary action is opening an original essay. Search, year and length filters, and column sorting help choose that essay. Metadata download and RSS subscription are secondary actions.

The visual reference lock combines the user's requested Notion table pattern with the existing service's small, direct source-link workflow. [Notion's database guidance](https://www.notion.com/help/views-filters-and-sorts) supplies the explicit view, column, filter, and sorting model. The [author's index](https://www.paulgraham.com/articles.html) supplies numbering and source order. No third-party UI code was copied.

Decisions: use a neutral canvas, system typography, thin row rules, sticky column labels, and tabular numbers. Use one table rather than essay cards or a marketing hero. The count stays subordinate to the table. Month-only dates remain textual months. Small screens scroll inside a labelled table region, while the page itself stays within the viewport. Dark colors follow the system preference. Titles use textContent, not fetched HTML.

## Data pipeline

The source index parser selects single-link content rows, canonicalizes original URLs, and deduplicates them in source order. It includes two explicitly allowed text chapters. Other external URLs are rejected. Fewer than 20 recognized entries fails validation instead of producing an empty feed.

`npm run update` fetches the source index, then missing, failed, stale, or old-extractor metadata. It defaults to at most 250 essay requests, two workers, a 350ms pause per worker, and 15-second request deadlines. Maximum bounds are 300 requests and four workers. Redirects are rejected. Original page bodies are transient and are not written to disk. The only outputs are public metadata and a feed fallback.

HTML extraction prefers the legacy 435px content cell. Individual font tags can split mid-essay, so the longest font alone is insufficient. The fallback font selector handles simple layouts. Dates are parsed near the header with explicit day/month precision and calendar validation. The body count starts after the header line. Notes remain included. Unknown dates stay null. Counts are approximate.

Each metadata row retains its source URL and check time. A failed recheck preserves the last successful fields and records an error. Output files use temporary-file rename. Ctrl+C lets active requests finish and saves partial results. An index fetch/validation failure leaves outputs intact. The daily GitHub workflow runs this same command and tests before committing only the three metadata outputs. It cannot mirror article text because the extractor never outputs it.

## Serving

The complete table reads `public/catalog.json`, updated by deployment. It does not fetch 235 article pages in a browser. Query/filter/sort state is encoded in the URL. Missing metadata sorts last in both directions. Row numbers always refer to the original index order. Search is title/URL/header metadata search, not full-text article search.

RSS and JSON Feed remain live, bounded at 60 entries. They use canonical original URLs as IDs and omit publication dates. Metadata dates belong to the catalog. Separating the paths keeps a new essay visible in RSS before the next catalog update. The metadata check time and index check time are distinct from publication dates.

Feed caching uses warm-process memory, Vercel CDN, and a checked-in public link snapshot. Dynamic successful results are not durable outside process/CDN. Source failure preserves a previous feed result and reports its original check time. Static output is limited to public/; application sources are not served as files.

## Boundaries

No auth, database, analytics, or essay mirror. The local folder and production URL stay stable when the GitHub repository becomes public under a fuller name. Public source is not a software-license grant. The essays remain their author's work.
