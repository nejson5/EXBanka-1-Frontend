# Theme Switcher Design

_Date: 2026-03-12_

## Overview

Add a theme toggle button to the bottom-left corner of the sidebar, next to the user email. Supports light and dark mode, persists the selection to `localStorage`, and applies the `.dark` class to `<html>`.

---

## Architecture

### New file: `src/contexts/ThemeContext.tsx`

A React Context that:
- Reads the initial theme from `localStorage` (key: `"theme"`, values: `"light"` | `"dark"`). Defaults to `"light"` if not set. **System preference (`prefers-color-scheme`) is intentionally ignored — the default is always `"light"` unless the user has previously saved a preference.**
- Applies or removes the `.dark` class on `document.documentElement` (`<html>`) on mount and on every toggle. This is correct for this project: `index.css` defines the Tailwind v4 dark variant as `@custom-variant dark (&:is(.dark *))`, which requires `.dark` to be on an ancestor element. Toggling it on `<html>` covers the entire document.
- Writes the new value to `localStorage` on every toggle.
- Exports `ThemeContext`, a `ThemeProvider` component, and a `useTheme()` hook.

```ts
interface ThemeContextValue {
  isDark: boolean
  toggleTheme: () => void
}
```

### Modified: `src/main.tsx`

Wrap the app with `ThemeProvider` **inside `<StrictMode>`**, wrapping the Redux `Provider`. The resulting tree:

```tsx
<StrictMode>
  <ThemeProvider>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </ThemeProvider>
</StrictMode>
```

### Modified: `src/components/layout/Sidebar.tsx`

- Import `useTheme` from `@/contexts/ThemeContext`.
- Restructure the bottom section: email and theme icon button on the same row (`flex justify-between items-center`), logout button below.
- Render a `Sun` icon (Lucide) when dark mode is active, `Moon` icon when light mode is active.
- Button: `variant="ghost" size="icon"`, `text-sidebar-foreground/70`.
- **Accessibility**: the button must have an `aria-label` that reflects the action: `"Switch to light mode"` when dark is active, `"Switch to dark mode"` when light is active.

### Modified: `src/__tests__/utils/test-utils.tsx`

Add `ThemeProvider` wrapping the Redux `Provider` inside the existing `Wrapper` function, so all existing and new tests that render `Sidebar` (or any component using `useTheme`) continue to work.

---

## UI Layout

```
┌─────────────────────────────┐
│ user@email.com          🌙  │  ← flex row: email left, icon button right
│ [        Log Out        ]   │  ← full-width logout button
└─────────────────────────────┘
```

- Moon icon shown in light mode (click to switch to dark)
- Sun icon shown in dark mode (click to switch to light)
- No visible text label; accessible name provided via `aria-label`

---

## State Management

| Concern              | Tool            |
|----------------------|-----------------|
| Theme preference     | React Context   |
| Persistence          | localStorage    |
| DOM class toggle     | `document.documentElement.classList` |

This follows the CLAUDE.md guideline: "Simple shared UI state → React Context".

---

## Testing

Test files are co-located with their source files, consistent with the existing `Sidebar.test.tsx` pattern.

### `src/contexts/ThemeContext.test.tsx` (new — TDD, tests written first)

- Initialises to `light` when `localStorage` has no value
- Initialises to `dark` when `localStorage` contains `"dark"`
- `toggleTheme()` from light: adds `.dark` class to `<html>` and writes `"dark"` to `localStorage`
- `toggleTheme()` from dark: removes `.dark` class from `<html>` and writes `"light"` to `localStorage`
- Round-trip: calling `toggleTheme()` twice from light returns to light (correct `isDark` derivation from state)

### `src/components/layout/Sidebar.test.tsx` (extend existing)

- Renders a button with `aria-label="Switch to dark mode"` when theme is light (default)
- Renders a button with `aria-label="Switch to light mode"` when theme is dark
- Clicking the toggle button toggles the `.dark` class on `document.documentElement`

Tests use the real `ThemeProvider` (via `renderWithProviders`) and assert DOM side-effects (`document.documentElement.classList.contains('dark')`), not mock function calls. Tests query the toggle button via `getByRole('button', { name: /switch to dark mode/i })` etc.

---

## Files Changed

| File | Action |
|------|--------|
| `src/contexts/ThemeContext.tsx` | Create |
| `src/contexts/ThemeContext.test.tsx` | Create |
| `src/main.tsx` | Modify — add `ThemeProvider` inside `<StrictMode>` |
| `src/components/layout/Sidebar.tsx` | Modify — add toggle button with `aria-label`, restructure bottom section |
| `src/components/layout/Sidebar.test.tsx` | Modify — add toggle button tests |
| `src/__tests__/utils/test-utils.tsx` | Modify — add `ThemeProvider` to `renderWithProviders` wrapper |
