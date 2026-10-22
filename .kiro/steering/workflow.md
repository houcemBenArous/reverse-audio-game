---
inclusion: always
---

# Development Workflow — Reverse Audio

## Implementation process

Follow this sequence for every non-trivial implementation task:

1. **Inspect first.** Read the relevant existing files before writing or modifying anything. Understand what already exists.
2. **Read the steering files.** Identify which rules apply to the task at hand.
3. **Understand the acceptance criteria.** Know what "done" looks like before writing a line of code.
4. **Plan before acting.** For tasks touching more than one file, write a short plan (2–5 bullet points) and confirm it before starting.
5. **Implement one coherent step at a time.** Complete and verify one step before moving to the next.
6. **Test immediately.** Run the relevant tests and the build after each step.
7. **Review your changes.** Re-read every changed file. Remove dead code, unused imports and unnecessary complexity.
8. **Report.** Summarize what was changed, which tests were run and what their results were, and note any known limitations.

Do not generate the entire application in one uncontrolled operation.

## Scope discipline

- Fix the thing that was asked about. Do not refactor unrelated code while fixing a bug.
- Do not add features that were not requested.
- Do not add defensive layers for hypothetical future requirements.
- If you notice a separate problem while working, note it in a comment or a separate issue. Do not fix it inline unless it is a blocking dependency.

## When to ask for clarification

Ask only when a missing decision materially affects correctness or architecture. Examples:

- The required audio format is unknown and the choice has cross-browser implications.
- Two acceptance criteria conflict with each other.
- A requested feature requires a backend in the MVP, which is explicitly excluded.

Do not ask about things you can resolve with a sensible default. Document the default and proceed.

## Git practices

- Commit in small, coherent increments. Each commit should represent one logical change.
- Write commit messages in the imperative: `Add reverseAudioBuffer function`, not `Added` or `Adding`.
- Do not commit commented-out code, debug logs, or placeholder TODOs.
- Do not force-push to a shared branch.
- Always push feature work to a new branch. Do not commit directly to `main`.
- Run `npm run lint` and `npm test` before committing.

## Debugging

- Read the error message fully before searching for a solution.
- Check the browser console for Web Audio API and MediaRecorder errors. These often include the exact condition that failed.
- If an approach fails twice, stop and diagnose the root cause. Do not make incremental patches to a fundamentally broken approach.
- Isolate audio engine problems from UI problems. Test the audio function in isolation first.

## Documentation

- Update the relevant steering file when a decision changes the architecture, constraints or technology choices.
- Update `README.md` when the setup or deployment instructions change.
- Inline code comments explain *why* something is done, not *what* the code does.
- Exported functions must have a JSDoc comment.
- Do not copy steering content into the README. The README is for setup and usage; steering files are for architectural rules.

## Architecture decision records

Create a lightweight ADR (architecture decision record) when:

- A decision significantly changes the technical direction (e.g., switching from Web Audio API to a library).
- A decision will be hard to reverse.
- Future contributors are likely to question the choice.

Store ADRs in `.kiro/decisions/ADR-NNN-short-title.md`. They do not need to be long — a title, context, decision and consequences is sufficient.

## Completion criteria

A task is complete when:

- [ ] All acceptance criteria are met.
- [ ] `npm run build` completes without errors.
- [ ] `npm test` passes with no failures or skipped tests related to the change.
- [ ] No regressions in previously passing tests.
- [ ] Changed files are reviewed and free of dead code and debug artifacts.
- [ ] The summary has been provided.

Marking a task complete without running the build and tests is not acceptable.
