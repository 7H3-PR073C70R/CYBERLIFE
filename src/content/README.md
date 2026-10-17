# In-Code Content Schemas & Loaders (`src/content/`)

Contains TypeScript types, runtime Zod validation schemas, and content loaders for static scenarios, missions, and organizational fixture data.

## Responsibilities
- Validates that JSON files in `public/content/` conform to domain contracts upon loading.
- Exposes typed query helpers for retrieving mission stages, NPC dialogue nodes, and network definitions.
