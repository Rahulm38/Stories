---
title: Stories Product Home
product: Stories
document_type: map
status: active
owner: Product
last_reviewed: 2026-08-24
---

# Stories product home

> Stories helps people turn book learnings and lived experiences into memories they can retrieve and reuse—privately, from ordinary local Markdown.

## How to use this vault

This vault is the product source of truth. The specification intentionally describes required behavior whether or not it is already implemented.

- Product intent: [[01 Strategy/01 Product Brief]], [[01 Strategy/02 Users and Jobs]], [[01 Strategy/03 Scope and Principles]]
- Master specification: [[02 Requirements/00 Master PRD]]
- Feature requirements: [[02 Requirements/01 Capture]], [[02 Requirements/02 Recall]], [[02 Requirements/03 Library Search and Links]], [[02 Requirements/04 Note Editing and Content Model]], [[02 Requirements/05 Settings Privacy and Portability]]
- Quality bar: [[03 Quality/01 Edge Cases and Error Handling]], [[03 Quality/02 Non-Functional Requirements]], [[03 Quality/03 Accessibility Localization and Content]]
- Delivery truth: [[04 Delivery/01 Release Plan and Acceptance]], [[04 Delivery/02 Build Status and Traceability]], [[04 Delivery/03 Open Issues and Not in Build]], [[04 Delivery/04 Decisions Assumptions and Glossary]]

## Status vocabulary

| Status | Meaning |
| --- | --- |
| Required | Normative product behavior in this PRD. |
| Implemented | Present in the current code path; still subject to device verification. |
| Partial | Some behavior exists, but at least one stated acceptance criterion is unmet or unverified. |
| Not built | In the PRD but absent from the current build. |
| Deferred | Deliberately outside the current release boundary; reconsider only with evidence. |
| Open decision | A material product choice has not been made. |

## Reading rule

“Required” does not mean “shipped.” Every release claim must be checked against [[04 Delivery/02 Build Status and Traceability]]. Every requirement without a complete implementation belongs in [[04 Delivery/03 Open Issues and Not in Build]].

## Current product thesis

The riskiest assumption is not whether people can save Markdown. It is whether cue-first recall feels meaningfully more useful than saving and rereading a note. The product therefore prioritizes the smallest trustworthy loop:

**Capture → Cue → Attempt → Reveal → Rate → Reuse**

The daily surface is calm. Files remain durable underneath. Recall earns the product’s place; a graph, AI, sync, and productivity mechanics do not.

## Document control

- Product name: Stories
- Repository: `Stories`
- Primary client: Android-first Expo/React Native app
- Secondary client: iOS-ready shared native architecture
- Reference client: Next.js behavior prototype
- Data source of truth: app-private UTF-8 Markdown files
- PRD version: 1.0-detailed
- Baseline date: 2026-08-24
- Change policy: update requirement IDs and the traceability table together; record material scope changes in [[04 Delivery/04 Decisions Assumptions and Glossary]].
