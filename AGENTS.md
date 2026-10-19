# PG Essays Feed

Keep this project separate from Unfold. Never commit personal data, secrets, .local, or .vercel.

Commands: npm test; npm run snapshot; npm run dev (port 3002).

The source is the fixed HTTPS Paul Graham essay index. Do not accept arbitrary fetch URLs. Preserve source order, canonical URL IDs, strict parser validation and a deployable fallback snapshot. Do not invent publication dates. This is a link feed, not an essay mirror.

Check feed.xml, feed.json, status.json, conditional GET, and fallback behavior after changes. Verify the Vercel target before deployment. Update README and DESIGN for behavior changes.
