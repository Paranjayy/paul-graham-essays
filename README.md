# PG Essays Feed

An independent RSS and JSON Feed service for Paul Graham’s essay index. It discovers new links from the original site instead of relying on Aaron Swartz’s older feed.

Subscribe: https://pg-essays-feed.vercel.app/feed.xml

JSON Feed: https://pg-essays-feed.vercel.app/feed.json · Status: https://pg-essays-feed.vercel.app/status.json

## Run

Use Node.js 22 or later.

```sh
npm ci
npm test
npm run dev
```

Open http://localhost:3002. `npm run snapshot` refreshes the validated fallback before deployment. Deploy with `vercel --prod` after checking the linked project.

## Behavior and limits

The server checks the essay index on requests after a one-hour cache expires. Vercel also caches successful responses for an hour. There is no continuous polling process. The feed contains 60 links in source order. Essay URLs are stable identifiers. The service does not republish full essays or infer publication dates.

A failed fetch or an index with fewer than 20 recognized essay rows uses the last good in-memory result, then the deployed fallback. Status responses and headers report the original check time and whether that result is stale. The fallback survives cold starts. A manual snapshot refresh and deployment updates this durable fallback. Dynamic successful results persist only in the warm instance and CDN cache.

The public index’s HTML can change. Parser tests cover row selection, ordering, duplicate links, external links, invalid responses, and RSS escaping. Future changes must preserve validation and the previous fallback.

## Existing alternatives

[Olshansk/pgessays-rss](https://github.com/Olshansk/pgessays-rss) and [leftmove/paul-graham](https://github.com/leftmove/paul-graham) solve a similar problem. Their repository pages did not show a license when checked. No code was copied. This service uses Cheerio (MIT) to parse HTML. Essays remain their author’s work.
