# Library and Search

## Goal

Help users find a memory even when they remember only fragments such as a person, place, topic, event or phrase.

## Library

- One simple chronological list of healthy memories.
- No user-visible categories or folders.
- Each row uses a familiar memory/note icon, readable title, short text clue/snippet and recent date.
- A `New` action remains available but visually secondary to search.

## Search

Placeholder: **Search people, places, moments…**

Search should:

- match title and original memory content;
- support multiple query words in any order;
- require all entered terms to be present somewhere in the searchable text;
- ignore case, punctuation and common diacritic differences;
- work for person + place, place + event, topic + phrase and similar fragment combinations;
- not expose or depend on storage paths, legacy types or hidden implementation metadata.

Examples:

- `Tokyo Ravi`
- `taxi airport`
- `customer interview`
- `grandfather shoes`

## Empty search

Use a visual search icon and copy:

- **Nothing matched**
- `Try a person, place, event, or phrase you remember.`
- `Clear search`

## Legacy links

Older memories may contain legacy link syntax. The compatibility layer may continue to parse old data, but linking is not a current mobile product feature and must not appear in capture, reading, editing or onboarding.
