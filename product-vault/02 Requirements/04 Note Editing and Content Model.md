# Memory Reading, Editing and Content Model

## Reading

The memory screen prioritises the user's original content.

Show:

- original memory as ordinary readable text;
- one lightweight return state: `Comes back [date]` or `Saved in Library`;
- Edit and overflow actions.

Do not add a separate visible title, category, cue, or advanced details section to the memory screen.

## Editing

Editing is the memory text only. There is no formatting language, toolbar, title field, category field, cue field, or return-date form.

When edited, Stories may re-derive the Library display title from the first meaningful line. Existing return state is preserved automatically.

## Overflow actions

- Share
- Stop resurfacing, or Bring back in 3 days when currently stopped
- Delete

Stopping resurfacing does not delete the memory. Deleting requires destructive confirmation. Sharing uses the system share sheet and plain readable text.

## Content truth

The user's saved memory is the source of truth. The system may derive a Library title, search index and short retrieval clue, but must not invent events, quotes, motives or details.

## Legacy compatibility

Older memories can contain storage-era metadata and formatting syntax. They must remain readable. The mobile product renders them as ordinary text and does not expose old authoring controls. Editing an older memory converts the visible content into the current plain-text experience.
