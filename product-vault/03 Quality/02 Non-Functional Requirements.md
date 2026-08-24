---
title: Non-Functional Requirements
status: active
last_reviewed: 2026-08-24
---

# Non-Functional Requirements

## 1. Reliability & Durability Targets

- **Zero Silent Data Loss**: Every file mutation stages through atomic replacement and verified read-back.
- **100% Offline Capable**: Core loop (Capture, Today recall queue, Library search, Markdown edit, local export) works completely without internet access.
- **Crash Recovery**: Orphaned `.tmp` or `.bak` files from unexpected process termination are cleanly recovered on next app launch.
- **Derived Data Reconstruction**: Search indexes and recall schedules are derived from plain Markdown files and can be rebuilt at any time.

---

## 2. Performance Budgets (Reference: Mid-range Android)

| Interaction | Target Budget (p95) | Tested Condition |
|---|---|---|
| **Today Screen Open (Warm)** | $\le 1.0\text{ s}$ | Normal launch with active vault |
| **Today Screen Open (Cold)** | $\le 2.5\text{ s}$ | Cold start with 5,000 notes |
| **Save Memory Feedback** | $\le 100\text{ ms}$ | Immediate visual response |
| **Durable Write Verified** | $\le 500\text{ ms}$ | 10 KB Markdown document |
| **Library Search Results** | $\le 200\text{ ms}$ | Full-text query across 5,000 notes |
| **Wikilink Suggestions** | $\le 100\text{ ms}$ | Dropdown after typing `[[` |

---

## 3. Scale & Capacity

- **Target Vault Size**: Smoothly handles at least **5,000 Markdown memories** and **50,000 wikilinks** without UI frame drops.
- **Large Note Degradation**: Notes up to 100 KB render with virtualized scrolling.

---

## 4. Privacy & Security Invariants

- **Path Sandbox**: All file reads/writes are restricted to the app-private `stories-vault/` directory. Path traversal attempts (`../`) are strictly blocked.
- **Safe Markdown Rendering**: Markdown is treated as text/AST data; raw HTML or JavaScript execution is blocked.
- **Redacted Logging**: No memory text, source, search query, or cue prompt is ever written to system crash logs or console outputs.
