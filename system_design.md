# TalentBridge Design System

> **Purpose:** This document defines the standard visual language for TalentBridge. Every page — dashboards, forms, modals, sidebars — should follow these rules to maintain a consistent, professional, recruitment-focused experience.

---

## 1. Color Palette

### CSS Variables (define in `:root`)

```css
:root {
    /* ── Primary (Midnight Navy) ── */
    --primary:        #16171F;   /* Sidebar background, dark surfaces, primary text on light */
    --primary-dark:   #0D0E13;   /* Deepest background, overlays, hover on dark surfaces */
    --primary-light:  #2A2C38;   /* Hover rows on dark sidebar, subtle dark dividers */

    /* ── Accent (Signal Gold) ── */
    --accent:         #F0B90B;   /* Buttons, active nav state, links, highlights */
    --accent-dark:    #C99A08;   /* Hover states on accent buttons */
    --accent-light:   #FDF3D0;   /* Badge/tag backgrounds, soft highlight fills */

    /* ── Secondary Accents ── */
    --accent-success: #22C55E;   /* Online status dot, positive indicators */
    --accent-info:    #6B8CFF;   /* Informational tags/links (sparingly, on dark surfaces) */

    /* ── Backgrounds ── */
    --bg-page:        #F6F6F8;   /* Main content area background */
    --bg-sidebar:      #16171F;  /* Sidebar / dark chrome background */
    --bg-soft:         #F0EFEC;  /* Alternate card / hero background on light */

    /* ── Text ── */
    --text-primary:    #16171F;  /* Headings, body text on light surfaces */
    --text-secondary:  #6E7079;  /* Descriptions, helper text, metadata, timestamps */
    --text-muted:       #9CA0A8; /* Placeholder text, faint metadata */
    --text-on-dark:      #FFFFFF; /* Text on sidebar / dark surfaces */
    --text-on-dark-muted: #9599A6; /* Inactive sidebar labels */

    /* ── Surface & Border ── */
    --surface:         #FFFFFF;  /* Cards, modals, dropdowns */
    --border:          #E8E8EC;  /* Card borders, dividers, input outlines */
    --border-dark:     #2A2C38;  /* Borders/dividers on dark sidebar */

    /* ── Semantic ── */
    --crisis:          #E63946;  /* Errors, destructive actions, notification dots */
    --success:         #22C55E;  /* Success states, positive indicators, online status */
    --warning:          #F0B90B; /* Same as accent — used for pinned/attention badges */
}
```

### Usage Rules

| Scenario | Color |
|----------|-------|
| Primary buttons, active nav item, links | `--accent` |
| Button hover | `--accent-dark` |
| Badges (Pinned, category tags), highlight fills | `--accent-light` |
| Sidebar / dark chrome background | `--bg-sidebar` |
| Main page background | `--bg-page` |
| Card / modal surface | `--surface` |
| Card borders, dividers | `--border` |
| Headings, body copy on light surfaces | `--text-primary` |
| Helper text, metadata, timestamps | `--text-secondary` |
| Placeholder / faint metadata | `--text-muted` |
| Text/icons on sidebar (active) | `--accent` on `--bg-sidebar` |
| Text/icons on sidebar (inactive) | `--text-on-dark-muted` |
| Online/active status dot | `--success` |
| Notification badge, destructive actions | `--crisis` |

> [!CAUTION]
> Never use raw hex values in new CSS. Always reference the CSS variable (e.g. `var(--accent)`).

---

## 2. Typography

### Font Stack

```css
font-family: 'Inter', 'DM Sans', system-ui, -apple-system, sans-serif;
```

**Required imports** (place in `<head>`):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Hero title (h1) | `2.4rem` – `3rem` | 700 | 1.15 | `-0.5px` |
| Section title (h2) | `1.5rem` – `1.8rem` | 700 | 1.25 | `-0.3px` |
| Card / post title (h3) | `1.05rem` – `1.15rem` | 600 | 1.4 | normal |
| Body text | `0.9rem` – `1rem` | 400 | 1.6 | normal |
| Small/meta text (timestamps, counts) | `0.8rem` – `0.85rem` | 500 | 1.5 | normal |
| Sidebar nav labels | `0.88rem` | 500 | 1.4 | normal |
| Uppercase eyebrow/badge text | `0.7rem` – `0.75rem` | 600 | 1.3 | `0.8px` |
| Button text | `0.85rem` – `0.9rem` | 600 | 1.4 | normal |

### Rules
- **Headings** use `--text-primary` (on light) or `--text-on-dark` (on dark surfaces)
- **Body/descriptions** use `--text-secondary`
- **Sidebar inactive labels** use `--text-on-dark-muted`; active label + icon use `--accent`
- Base `line-height` for body copy is `1.6`

---

## 3. Spacing & Layout

### Container
```css
.container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
}
```

### Layout Shell
| Region | Width / Padding |
|--------|------------------|
| Sidebar (desktop) | `220px` fixed, `24px 16px` padding |
| Top bar | `64px` height, `0 24px` padding |
| Main content | fluid, `24px 32px` padding |
| Right rail (widgets) | `300px` fixed |

### Spacing Scale (reference)
| Token | Value | Use |
|-------|-------|-----|
| `4px` | Micro | Icon-to-text gaps |
| `8px` | XS | Tight inner gaps, badge padding |
| `12px` | SM | Label-to-input, small card gaps |
| `16px` | MD | Card inner padding sides, sidebar item gaps |
| `20px`–`24px` | LG | Card padding, section gaps |
| `28px`–`32px` | XL | Between elements inside sections |
| `40px`–`48px` | 2XL | Between section header and content |
| `60px`–`80px` | 3XL | Hero padding, major section separation |

---

## 4. Shadows & Elevation

```css
--shadow-sm: 0 1px 2px rgba(22, 23, 31, 0.06);     /* Default cards, inputs */
--shadow-md: 0 4px 12px rgba(22, 23, 31, 0.08);     /* Hovered cards, dropdowns */
--shadow-lg: 0 12px 32px rgba(22, 23, 31, 0.12);    /* Modals, floating panels */
--shadow-xl: 0 20px 48px rgba(22, 23, 31, 0.16);    /* Large overlays */
```

> [!NOTE]
> Shadow color is always based on `rgba(22, 23, 31, ...)` (derived from `--primary`), NOT generic black. This keeps shadows feeling cohesive with the dark sidebar tone.

---

## 5. Border Radius

```css
--radius-sm:   6px;     /* Inputs, small tags, icon containers */
--radius-md:   10px;    /* Dropdowns, small cards, tooltips */
--radius-lg:   14px;    /* Standard cards, panels */
--radius-xl:   20px;    /* Large cards, modal containers, hero banner */
--radius-full: 9999px;  /* Buttons, pills, badges, avatars */
```

| Component | Radius |
|-----------|--------|
| Buttons | `--radius-full` (pill shape) |
| Cards (posts, dashboards) | `--radius-lg` |
| Inputs | `--radius-sm` |
| Modals | `--radius-xl` |
| Avatars / tags / badges | `--radius-full` |
| Icon containers (logo box, card icons) | `--radius-sm` |
| Dropdowns | `--radius-md` |

---

## 6. Buttons

### Variants

```css
/* Primary — main CTAs (e.g. "Create New Post") */
.btn-primary {
    background: var(--accent);
    color: var(--primary);
    border: none;
}
.btn-primary:hover {
    background: var(--accent-dark);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(240, 185, 11, 0.3);
}

/* Outline — secondary actions (e.g. "View Guidelines") */
.btn-outline {
    background: transparent;
    color: var(--text-on-dark);
    border: 1.5px solid rgba(255, 255, 255, 0.3);
}
.btn-outline:hover {
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.05);
}

/* Ghost (on light bg) — tertiary actions in dashboard content */
.btn-ghost {
    background: transparent;
    color: var(--text-secondary);
    border: 1.5px solid var(--border);
}
.btn-ghost:hover {
    border-color: var(--accent);
    background: var(--accent-light);
    color: var(--text-primary);
}

/* Danger — destructive actions */
/* Use --crisis as background, white text */
```

### Base Styles (applied to all `.btn`)
```css
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: var(--radius-full);   /* Always pill-shaped */
    font-weight: 600;
    font-size: 0.88rem;
    cursor: pointer;
    transition: all 0.25s ease;
    white-space: nowrap;
}
```

### Sizes
| Size | Padding | Font Size |
|------|---------|-----------|
| Default | `10px 20px` | `0.88rem` |
| Small | `8px 16px` | `0.82rem` |
| Large (`.btn-lg`) | `14px 28px` | `0.95rem` |

---

## 7. Cards

### Standard Card (post / discussion card)
```css
.card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);    /* 14px */
    padding: 20px 24px;
    transition: all 0.25s ease;
}

.card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
}
```

### Card Icon Container
```css
/* Colored icon block inside a card / stat widget */
.card-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);    /* 6px */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    margin-bottom: 16px;
    color: var(--text-on-dark);
}

/* Icon color variants */
.card-icon--gold    { background: var(--accent); color: var(--primary); }
.card-icon--navy    { background: var(--primary); }
.card-icon--success { background: var(--success); }
.card-icon--crisis  { background: var(--crisis); }
```

### Card Typography
- Title: `1.05rem`, weight `600`, color `--text-primary`
- Description: `0.9rem`, color `--text-secondary`, line-height `1.6`
- Meta row (likes, comments, share, save): `0.8rem`, color `--text-secondary`, icons at `16px`

### Tags / Badges
```css
.badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: var(--radius-full);
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
}
.badge--pinned   { background: var(--accent-light); color: var(--accent-dark); }
.badge--category { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
```

---

## 8. Forms & Inputs

> [!IMPORTANT]
> These are recommended standards. Apply consistently to all forms.

```css
/* Text inputs, selects, textareas */
.form-input {
    width: 100%;
    padding: 10px 16px;
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);    /* 6px */
    font-family: inherit;
    font-size: 0.88rem;
    color: var(--text-primary);
    background: var(--surface);
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.form-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.15);
}

.form-input::placeholder {
    color: var(--text-muted);
}

/* Search input (top bar variant, on light) */
.search-input {
    background: var(--bg-page);
    border: 1px solid var(--border);
    border-radius: var(--radius-full);
    padding: 8px 16px 8px 36px; /* icon inset left */
}

/* Labels */
.form-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 6px;
}

/* Helper / error text */
.form-helper { font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; }
.form-error  { font-size: 0.8rem; color: var(--crisis); margin-top: 4px; }
```

---

## 9. Grids

### Standard Patterns

```css
/* Dashboard 3-column layout: sidebar / main feed / right rail */
.grid-dashboard {
    display: grid;
    grid-template-columns: 220px 1fr 300px;
    gap: 24px;
}

/* 3-column grid (stat cards, feature cards) */
.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

/* 2-column grid (forms, side-by-side content) */
.grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}
```

### Responsive Breakdowns
| Breakpoint | Dashboard grid → | 3-col → | 2-col → |
|------------|-------------------|---------|---------|
| ≤ 1200px | sidebar + main (rail collapses to drawer) | 2-col | 1-col |
| ≤ 1024px | main only (sidebar becomes overlay) | 1-col | 1-col |
| ≤ 768px | stacked, hamburger nav | 1-col | 1-col |

---

## 10. Sidebar Navigation

### Structure
```
[Logo box + wordmark]
[Breadcrumb-aware nav items with icons]
  Dashboard  Recruitment  Question Bank  Assessments  Community  Moderator
──────────────────────────────
[Settings — pinned to bottom]
```

### Key Styles
- **Background**: `var(--bg-sidebar)` (`#16171F`), full-height, fixed left, `220px` wide
- **Logo**: `32×32` rounded box (`--accent` bg, `--primary` icon), wordmark `1.1rem`, weight `700`, `--text-on-dark`
- **Nav item (default)**: `0.88rem`, weight `500`, color `--text-on-dark-muted`, icon `18px`, `12px 16px` padding, `--radius-md`
- **Nav item (active)**: background `rgba(240, 185, 11, 0.12)`, text + icon color `--accent`, left accent bar `3px` solid `--accent`
- **Nav item (hover)**: background `var(--primary-light)`, text lightens to `--text-on-dark`
- **Section grouping**: optional subtle divider (`1px solid var(--border-dark)`) between primary nav and utility items (Settings)
- **Mobile** (≤768px): sidebar collapses to an overlay drawer triggered by a hamburger icon in the top bar

### Top Bar (paired with sidebar)
- **Background**: `var(--surface)`, `1px solid var(--border)` bottom border
- **Height**: `64px`
- **Left**: breadcrumb trail, `0.85rem`, `--text-secondary`, current page in `--text-primary`
- **Right**: search input (pill, `--bg-page` fill) → notification bell with `--crisis` dot → user avatar + name/role stack (`0.85rem` name / `0.75rem` role in `--text-secondary`)

---

## 11. Right Rail / Widget Panels

Used for supplementary panels (Have a question?, Trending, Expert Spotlight):

```css
.widget-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px;
}

.widget-panel--cta {
    background: var(--primary);
    color: var(--text-on-dark);
}
```

- Widget title: `0.95rem`, weight `700`
- Ranked list items (Trending #1/#2/#3): rank number in `--accent`, `0.8rem` weight `700`; title `0.85rem` weight `600`; meta `0.75rem` `--text-secondary`
- Stat rows (Community Pulse): label `--text-secondary` left, value `--accent` or `--text-primary` right-aligned, weight `700`

---

## 12. Section Headers

Standard pattern for titled sections within dashboard content:

```html
<div class="section-header">
    <span class="section-label">LABEL TEXT</span>
    <h2 class="section-title">Main Title Here</h2>
    <p class="section-subtitle">Supporting description text.</p>
</div>
```

```css
.section-header  { margin-bottom: 32px; }
.section-label   { font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
                   letter-spacing: 0.8px; color: var(--accent); }
.section-title   { font-size: 1.8rem; font-weight: 700; color: var(--text-primary);
                   letter-spacing: -0.3px; line-height: 1.25; margin-bottom: 10px; }
.section-subtitle { font-size: 0.92rem; color: var(--text-secondary);
                    max-width: 560px; line-height: 1.6; }
```

---

## 13. Section / Surface Backgrounds

| Section Type | Class | Background |
|--------------|-------|------------|
| Default content area | `.section` | `--bg-page` (`#F6F6F8`) |
| Card surface | `.surface` | `--surface` (white) |
| Sidebar / dark chrome | `.chrome` | `--bg-sidebar` (`#16171F`) |
| Hero / feature banner | `.hero` | dark image overlay on `--primary`, `--text-on-dark` |
| Accent CTA panel | `.cta-panel` | `--accent` background, `--primary` text |

---

## 14. Animations

### Hover Interactions
- **Cards**: `box-shadow: var(--shadow-md)`, `border-color: var(--accent)`, `0.25s ease`
- **Buttons**: `transform: translateY(-1px)`, colored box-shadow matching variant
- **Sidebar nav items**: background fade `0.2s ease`, icon/text color fade `0.2s ease`
- **Links**: color transition `0.2s ease`

### Loading / Skeleton States
- Use `--border` colored skeleton blocks with a subtle shimmer (`rgba(255,255,255,0.4)` sweep) at `1.4s` linear infinite

### Notification Pulse (unread indicators)
```css
@keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.4; }
}
/* Duration: 1.6s, ease-in-out, infinite — applied to --crisis notification dots */
```

---

## 15. Icons

### Library
**Tabler Icons** (or Font Awesome 6.5 as fallback):
```html
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
```

### Usage conventions
- Sidebar nav: icon + label, `18px` icon, `gap: 12px`
- Buttons: icon + text, `gap: 8px`
- Card icons: inside a colored `44×44` container with `border-radius: 6px`
- Avatars: circular, `36px` (top bar) / `40px` (post author) / `56px` (expert spotlight), with a `10px` green `--success` status dot for online users
- Meta row icons (like, comment, share, save): `16px`, `--text-secondary`, filled on active state

---

## 16. Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| `≤ 1200px` | Large tablets — right rail collapses or moves below main feed |
| `≤ 1024px` | Tablets — sidebar becomes an overlay drawer |
| `≤ 768px` | Mobile — single column, hamburger nav, stacked cards |
| `≤ 480px` | Small mobile — full-width buttons, tighter spacing |

### Key mobile rules
- Sidebar hidden by default, triggered via hamburger in top bar
- Right rail widgets stack below main feed content
- Grids collapse to 1-col
- Section titles shrink (e.g. `1.8rem` → `1.4rem`)
- Buttons go full-width on ≤480px
- Card padding reduces from `20px 24px` to `16px`

---

## 17. Quick Reference — Copy-Paste Starter

When creating a new page, include these in your layout `<head>`:

```html
<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<!-- Icons -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
```

And start your CSS with the `:root` variables from Section 1 above.
