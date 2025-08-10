# Documentation Discrepancies

This document lists the known discrepancies between the documentation and the current state of the codebase.

## 1. `CODEBASE_MAP.md`

- **Potential Duplication**: The `use-missions.ts` and `useMissions.ts` hooks both exist. This may be a duplication and should be investigated.

## 2. `ROADMAP.md`

- **Out of Sync**: The `docs/ROADMAP.md` and `src/ROADMAP.md` files were out of sync. They have now been merged into `docs/ROADMAP.md` and the `src/ROADMAP.md` file has been deleted.

## 3. `blueprint.md`

- **Incomplete "Missions" Feature Description**: The blueprint mentions a "missions" feature, but the implementation details are spread across two files: `use-missions.ts` and `useMissions.ts`. This suggests a potential code duplication or an incomplete refactoring that is not reflected in the blueprint.
- **Missing Roadmap Information**: The blueprint does not reflect the existence of `docs/ROADMAP.md`.

## 4. `technical-spec.md`

- No known discrepancies.

