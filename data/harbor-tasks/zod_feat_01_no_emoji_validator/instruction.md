# Feature Development: Add `.noEmoji()` String Validator to Zod

## Repository
`https://github.com/colinhacks/zod` — pinned at tag `v3.22.4`

## Context
Zod's existing `.emoji()` validator (in `src/types.ts`) uses a regex that matches Unicode `\p{Extended_Pictographic}` and `\p{Emoji_Component}`. Due to the broad definition of `Emoji_Component` (which includes ASCII digits 0–9, `#`, `*`, and variation selectors), `z.string().emoji().parse("123")` unexpectedly **passes**, making the validator unsuitable for strict emoji detection.

The inverse operation — **rejecting strings that contain any emoji** — is equally useful (e.g. username validation, form fields) and also does not exist in Zod today.

## Objective
Add a `.noEmoji()` method to `ZodString` in `src/types.ts` that rejects any string containing an emoji character.

## Requirements

1. **Add `noEmoji()` method to `ZodString`** in `src/types.ts`:
   - Adds a new check of kind `"no_emoji"` to the checks array.
   - Validation logic: if the string contains any character matching `/\p{Extended_Pictographic}/u`, the check fails.
   - Default error message: `"String must not contain emoji"`.

2. **Wire into the `_parse` method**: Handle the `"no_emoji"` check kind inside the existing check-dispatch loop in `ZodString._parse`.

3. **TypeScript types**: The method signature must be:
   ```ts
   noEmoji(message?: string | { message?: string }): ZodString
   ```

4. **Export**: No additional export needed — it is a method on the existing `ZodString` class.

5. **Regression protection**: All existing Zod tests must continue to pass (`pnpm test`).

## Acceptance Criteria
- `z.string().noEmoji().safeParse("hello")` → `{ success: true }`
- `z.string().noEmoji().safeParse("hello 😀")` → `{ success: false }`
- `z.string().noEmoji().safeParse("😀")` → `{ success: false }`
- `z.string().noEmoji().safeParse("123")` → `{ success: true }` (digits are not emoji)
- `z.string().noEmoji().safeParse("")` → `{ success: true }` (empty string has no emoji)
- Custom message: `z.string().noEmoji("No emoji allowed").safeParse("😀")` returns error message `"No emoji allowed"`
- All existing Zod tests pass
