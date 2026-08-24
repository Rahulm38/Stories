# Stories product vault

This folder is an Obsidian vault and the working product specification for Stories.

Open `product-vault/` directly in Obsidian. Start at [[00 Product Home]]. Product requirements are written independently of implementation status; [[04 Delivery/02 Build Status and Traceability]] and [[04 Delivery/03 Open Issues and Not in Build]] say what exists today.

The vault belongs in Git. Only local Obsidian workspace/plugin/graph state, cache files, trash, and macOS metadata are ignored by the vault-level `.gitignore`. Stable vault settings (`app.json` and `appearance.json`) remain tracked.

The vault is documentation, not application content. It lives outside `src/`, `public/`, `apps/mobile/`, and `packages/core/`; neither Next.js nor Metro imports it, so it is not bundled into the web or native runtime artifacts.
