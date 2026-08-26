---
title: Library and Search
status: active
last_reviewed: 2026-08-26
---

# Library and Search

## Goal

Let a user recover a memory even when they do not remember its exact wording, title or when it was saved.

## Library

- Flat list of healthy memories.
- No folder tree, category toggle, file path or kind selector in the shipping Android product.
- Without a search query, order by most recently updated.
- Each row shows a body-derived title, a short snippet and recent-date metadata.
- Opening a row goes directly to the editable original memory.

## Search input

Placeholder: **Search people, places, moments…**

Search is fully local and deterministic. The search corpus may include:
- body-derived title;
- original memory body;
- legacy `source` metadata when present for compatibility.

It must not require a filename, folder or memory kind.

## Matching & ranking

For a multi-word query, every remembered token should find a plausible match. Rank:

1. exact normalized phrase;
2. exact substring/token matches;
3. prefix/fragment matches;
4. small edit-distance typo matches.

Diacritics and punctuation are normalized. Small spelling errors should be tolerated for meaningful tokens; very short tokens should remain strict to avoid noise.

Examples expected to match a memory containing `In Bangalore, Ravi told me a funny story about a taxi driver`:
- `Bangalore Ravi`
- `airport taxi` when airport is present in title/body
- `Bangalor taxi`
- `taxi story`

## Empty results

Show:
- `Nothing matched`
- guidance to try a person, place, event or shorter phrase;
- `Clear search`.

Do not introduce folders/tags as a fallback for weak search.

## Legacy links

Older beta memories may contain legacy formatting/link syntax. The compatibility text converter should make that content readable and preserve useful external URLs when the memory is edited. Wikilink authoring, backlink resolution and graph navigation are not product requirements for the current Android client.
