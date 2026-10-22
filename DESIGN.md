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

## Statistics, collected quotes, and original sources

Essay statistics are derived in the browser from the public catalog. They exclude text chapters from word totals and expose undated coverage. Year bars open the corresponding essay filter. Counts and estimated reading hours are navigation aids, not claims about quality or complete lifetime output.

The quote finder indexes the author's collection of quotations from many speakers. It stores attribution, a stable content hash, source position, word count, up to eight topic words, and sorted SHA-256 token fingerprints. Original quotation bodies are transient during extraction and are not output. The browser hashes normalized search words and matches every word against the token fingerprints. It supports word search without publishing the original sentences or requiring a search server. It does not promise exact-phrase matching. Links open the original collection, with an attribution text fragment as a navigation aid. Source order can be reversed, but neither direction implies a publication date.

The quote index RSS uses stable hashes as GUIDs. Baseline entries have no dates. Newly observed hashes use their first index-observation time, explicitly labelled as that event rather than quote publication. The daily workflow runs essay and collection updates as separate commands so essay request bounds remain effective.

The source directory links to original Arc, Bel, Lisp, book, spam, response, FAQ, RAQ and bio pages. It retains titles and categories, with no mirrored page text. The bio pointer identifies Viaweb, later Yahoo Store, as the 1995 company. The source website remains the destination for reading and context.

## Draft readers

The Draft readers tab uses the existing searchable table pattern. It replaces the visible resource directory. Old #resources links fall back to Essays. Resource metadata remains available in the collection JSON.

Extractor version 3 records names from explicit Thanks-to clauses tied to reading, reviewing, or commenting on drafts. Counts mean distinct indexed essays. Dates come from essay headers and do not date the feedback itself. Names retain source spelling; no speculative identity merges. Missing or unusual acknowledgements can be missed. Every result exposes its original essays. Footnote statistics remain deferred.

Female Founders (ff.html), supplied by the user, is absent from the current official essay list. Its metadata is an explicitly labelled acknowledgementExtras entry in catalog.json. It participates only in draft-reader statistics, not essay totals or the essay feed. The updater makes one extra fixed-source request and retains previous supplementary metadata on failure.

## Readable quote collection (superseded by the table below)

The Quotes tab now places the original quote collection in a labelled, responsive iframe above the metadata search table. This fixes the metadata-only reading experience without generating a local quotation mirror. The remote page controls its text and layout. Loading is lazy, and Open original remains available if the publisher blocks embedding. The search index remains author/topic metadata and word hashes.

## Quotation text in the table

The user supplied the collection and clarified the requested reading surface. The table now displays quotation text, author/attribution, word count and original link. It replaces the embedded page and topic-word column. Preserve poetry and paragraph breaks without keeping HTML source wrapping. Text is inserted with textContent. Sort controls share one state: source order, quote wording, author or numeric length, ascending/descending. Store sort/filter state in the URL. Quote GUIDs and the absence of invented publication dates remain unchanged.
