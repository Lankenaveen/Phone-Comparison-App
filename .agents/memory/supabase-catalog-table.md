---
name: Supabase catalog table
description: Existing Supabase phone data uses a schema incompatible with the Phone Compare app.
---

The Supabase project already has `public.phones`, but that table does not have the `model` column expected by this app.

**Why:** The existing table is external project data, and changing its schema risks affecting other uses.

**How to apply:** Keep Phone Compare on the dedicated `public.phone_compare_catalog` table. Do not rename or alter `public.phones` unless the user explicitly asks.
