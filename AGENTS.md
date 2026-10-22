# PG Essays Feed

Keep this project separate from Unfold. Never commit personal data, secrets, .local, or .vercel.

Commands: npm test; npm run snapshot; npm run dev (port 3002).

The source is the fixed HTTPS Paul Graham essay index. Do not accept arbitrary fetch URLs. Preserve source order, canonical URL IDs, strict parser validation and a deployable fallback snapshot. Do not invent publication dates. This is a link feed, not an essay mirror.

Check feed.xml, feed.json, status.json, conditional GET, and fallback behavior after changes. Verify the Vercel target before deployment. Update README and DESIGN for behavior changes.

## Complete metadata index

Commands: npm run update [-- --limit 20 --workers 2]; npm run update -- --refresh. Run npm test after parser or view changes.

Catalog helpers are public/catalog-tools.mjs. Metadata extraction is lib/metadata.mjs. The index updater is scripts/catalog.mjs. Keep body text transient. Commit only public titles, links, dates, counts and check status. Never store essays in public assets or test snapshots.

Use the full content cell for legacy HTML, because font tags can split an essay. Preserve date precision and leave unavailable values null. Counts include notes and remain approximate. Keep extraction versioning so parser changes trigger metadata refreshes. Failed refreshes preserve previous metadata. Do not remove source entries because a metadata fetch failed.

The daily GitHub workflow may commit only data/metadata.json, data/last-good.json and public/catalog.json. Keep requests bounded and allow an interrupt to save partial work. The table must support keyboard sorting, query sharing, and a narrow-screen scroll region. Do not add a client framework or account system for this index.

## RSS and discovery surfaces

The public remote is paul-graham-rss; keep the local pg-essays-feed folder and production hostname. `npm run update` retains its bounded essay options. `npm run update:collections` separately updates the quote finder, source directory and quote feed. The workflow runs both commands.

Quote metadata lives in public/collections.json, parser in lib/collections.mjs, pure statistics/search helpers in public/collection-tools.mjs. Word search uses deterministic normalized token hashes, not stored quotation bodies. Do not output original quotation bodies. Keep author attribution separate from collection curator. Source position is not chronology. Baseline quote entries have no publication date; later firstIndexedAt is index discovery only. Preserve stable GUIDs and original-source links.

Statistics exclude text chapters from essay word totals. Unknown dates remain explicit. New public outputs must remain metadata-only. Do not add claims about copying or comparison-project inventories to product copy.

Draft acknowledgement extraction is in lib/metadata.mjs, extractorVersion 3. Keep only explicit draft-reading/review credits and names. Do not infer personal relationships or merge name variants. Counts are distinct essay counts; first/latest dates are essay publication dates. The resource directory is hidden from navigation at the user's request. Existing #resources links fall back to essays. Keep source metadata intact.
