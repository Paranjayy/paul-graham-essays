# Design and architecture

The service has one source and no database or auth. It fetches a public essay index, validates its rows, and emits RSS 2.0 or JSON Feed 1.1. It bounds output at 60 essays. No third-party feed generator code is copied.

Caching has three layers: warm-process result, Vercel CDN, and a checked-in public metadata snapshot. Dynamic successful results are not durable outside the process/CDN. The snapshot is a deliberate fallback and exposes its check time. Source failure never becomes a valid empty feed.

The landing page follows the source’s editorial restraint and Unfold’s simple navigation: one primary subscription link, a separate format link, copy feedback, and readable source status. System typography handles controls. Georgia is reserved for editorial headings. All fetched titles use textContent. Light/dark colors follow system preference.

Publication dates are omitted because the index does not supply them. Feed retrieval time is labelled as a source check, never a publication time. Canonical original URLs are GUIDs, so metadata refresh does not create duplicate items.
