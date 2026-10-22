---
inclusion: always
---

# Coding Standards — Reverse Audio

## General principles

- Prefer simple, readable code over clever code.
- Write code that the next developer can understand without asking questions.
- Solve the specific problem at hand. Do not add abstractions for hypothetical future needs.
- Keep each unit small and focused on one responsibility.
- Make changes incrementally. Preserve existing working behavior.
- Do not rewrite working code unless there is a concrete problem to fix.

## TypeScript

- Enable and maintain `strict: true` in `tsconfig.json`. Never disable it.
- Never use `any`. Use `unknown` for truly unknown values and narrow with type guards.
- Use explicit return types on all exported functions.
- Use `interface` for object shapes; use `type` for unions, intersections and aliases.
- Prefer `readonly` on properties and arrays that must not be mutated after creation.
- Use `const` by default. Use `let` only when reassignment is required.
- Do not use `!` (non-null assertion) unless the null case is truly impossible and that reasoning is noted in a comment.
- Avoid type casting (`as SomeType`) except where necessary to bridge browser API types and the reason is documented.

## React

- Use function components with hooks. Do not write class components.
- Keep components focused on rendering and user interaction. Move logic to hooks or the game/audio modules.
- A component should do one thing. If it does more, split it.
- Avoid deeply nested JSX. Extract sub-trees into named components.
- Do not put business logic or audio processing inside a component. Move it to a hook.
- Props interfaces must be explicitly typed. Do not use `any` or omit prop types.
- Use `React.FC` or explicit prop destructuring. Prefer the latter for clarity.
- Use `useCallback` and `useMemo` only when there is a measured performance reason, not by default.
- Keep `useEffect` minimal. Name each effect's purpose in a comment. Provide a cleanup function when the effect allocates resources.

## Simplicity rules

- Do not introduce a state management library (Redux, Zustand, Jotai, etc.) unless `useState` and `useContext` are demonstrably insufficient and the problem is well-understood.
- Do not introduce a routing library unless the application genuinely needs multiple pages.
- Do not introduce utility libraries (Lodash, Ramda, etc.) for functions that can be written in five lines or fewer.
- Do not add CSS-in-JS libraries. Plain CSS modules or a single global stylesheet are sufficient.
- Do not use class decorators, mixins or other advanced patterns without strong justification.

## Error handling

- Handle errors where they are actionable: display a message to the user or log them for debugging.
- Do not swallow errors silently. Avoid empty `catch` blocks.
- Prefer specific error types over generic `Error` where meaningful.
- Audio errors must result in a visible user-facing message and a safe application state.

## Code style

- Use 2-space indentation.
- Use single quotes for strings.
- Add a trailing comma in multi-line arrays, objects and parameter lists.
- Keep lines under 100 characters where practical.
- Add a blank line between logical sections within a function.
- Comment the *why*, not the *what*. Avoid comments that restate obvious code.
- Exported functions and complex internal functions should have a JSDoc comment describing their purpose, parameters and return value.

## Prohibited patterns

- `console.log` in production code. Use a dedicated logger utility or remove before committing.
- `TODO` comments that are not linked to a tracked issue.
- Commented-out code blocks.
- Magic numbers or strings not defined as named constants.
- Deeply nested callbacks. Extract named functions instead.
- Mutating function arguments.
