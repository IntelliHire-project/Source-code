# TalentBridge Design System

This document is the reference for the frontend visual language. Keep it in sync with the shared stylesheet at [frontend/src/style.css](src/style.css).

## Core Palette

Use CSS variables for all new styling.

```css
:root {
  --primary: #16171F;
  --primary-dark: #0D0E13;
  --primary-light: #2A2C38;

  --accent: #F0B90B;
  --accent-dark: #C99A08;
  --accent-light: #FDF3D0;

  --accent-success: #22C55E;
  --accent-info: #6B8CFF;

  --bg-page: #F6F6F8;
  --bg-sidebar: #16171F;
  --bg-soft: #F0EFEC;

  --text-primary: #16171F;
  --text-secondary: #6E7079;
  --text-muted: #9CA0A8;
  --text-on-dark: #FFFFFF;
  --text-on-dark-muted: #9599A6;

  --surface: #FFFFFF;
  --border: #E8E8EC;
  --border-dark: #2A2C38;

  --crisis: #E63946;
  --success: #22C55E;
  --warning: #F0B90B;
}
```

## Typography

Use the Inter family with a fallback stack of DM Sans and system fonts.

- Hero titles: 2.4rem to 3rem, weight 700, line-height 1.15
- Section titles: 1.5rem to 1.8rem, weight 700, line-height 1.25
- Card titles: about 1.1rem, weight 600
- Body text: 0.9rem to 1rem, line-height 1.6
- Meta text: 0.8rem to 0.85rem, weight 500
- Buttons: 0.85rem to 0.9rem, weight 600

## Layout

- Page background: `--bg-page`
- Sidebar or dark chrome: `--bg-sidebar`
- Standard surface: `--surface`
- Standard page container: max-width 1280px with 24px horizontal padding
- Standard dashboard spacing: 24px gaps, 20px to 24px card padding

## Radius and Shadows

- Inputs: 6px radius
- Dropdowns and small cards: 10px radius
- Standard cards and panels: 14px radius
- Large cards and modals: 20px radius
- Pill buttons and badges: 9999px radius
- Shadows should be based on `rgba(22, 23, 31, ...)`, not generic black

## Buttons

- Primary actions use `--accent` with `--primary` text
- Secondary outline actions work on dark surfaces
- Ghost actions are for tertiary light-surface actions
- Buttons should be pill-shaped with a subtle hover lift

## Cards

- Use `--surface` background, `--border` border, and `--radius-lg`
- Hover states can lift slightly and tint the border toward `--accent`
- Use compact icon containers for stats or feature blocks

## Forms

- Inputs should use `--surface`, `--border`, and `--radius-sm`
- Focus state should use an accent-colored ring
- Helper text uses `--text-secondary`
- Error text uses `--crisis`

## Navigation

- Active nav items use `--accent` on `--bg-sidebar`
- Inactive nav items use `--text-on-dark-muted`
- Keep sidebar interactions subtle and consistent

## Responsive Rules

- 1200px and below: collapse the right rail
- 1024px and below: sidebar becomes an overlay drawer
- 768px and below: use a single-column layout
- 480px and below: full-width buttons and tighter spacing

## Notes

- Do not introduce raw hex values in new component styles unless defining a variable.
- Reuse the shared utilities in [frontend/src/style.css](src/style.css) before adding page-specific overrides.
