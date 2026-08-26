# Design System — Aged-Care Check-In Dashboard

Single source of truth for all visual design in `web/`. Every color,
typeface, and spacing decision in the Next.js app derives from this file —
no ad-hoc hex values or fonts introduced elsewhere. Built following the
`frontend-design` skill's process (brainstorm token plan -> check against
generic AI-design defaults -> revise -> build).

## Brief

Subject: a monitoring dashboard for family/carers checking on an elderly
person's wellbeing. Audience: the carer/family member, not the elderly
person themselves. The page's single job: let someone spot a problem fast.
Every design decision below serves that job — color especially is semantic,
not decorative.

## Genericness check

Checked against the three clusters AI-generated design defaults to right
now: (1) cream background + high-contrast serif + terracotta accent, (2)
near-black + single neon accent, (3) broadsheet hairline-rule dense columns.
This system avoids all three: background is pale sage-grey (not cream, not
near-black), the serif is used in one restrained place only (not as the
dominant display treatment), and layout is card-based with generous
whitespace (not dense newspaper columns).

## Color

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#EEF1ED` | Page background — pale sage-grey, calm and clinical-soft without feeling cold |
| `--color-surface` | `#FFFFFF` | Card and panel backgrounds |
| `--color-ink` | `#23302B` | Primary text — deep pine-charcoal, softer than pure black |
| `--color-primary` | `#3B6E64` | Everyday UI: nav, buttons, links, the "all is well" status color |
| `--color-accent` | `#C97B3B` | **Reserved for the moment of live contact** — a call connecting/in progress, plus focus rings (accessibility floor, not a decorative exception). Never a large area, never a static "highlight" for its own sake |
| `--color-signal-alert` | `#B23A34` | **Reserved exclusively for distress/escalation states.** Never used decoratively — when this color appears anywhere, it means something is actually wrong |

Rule: `--color-signal-alert` may only be triggered by real escalation data
(no response, distress detected). `--color-accent` may only be triggered by
an actual live call state (connecting/in progress) or a focus ring. If a
component wants "red" or "warm highlight" for a purely decorative reason,
that's a sign the design has drifted — stop and re-check against this table.

Why anchored this way: this product's most characteristic mechanic is a
phone call, not a form submission. Both signal colors now mean something
specific happening in the real world (a call is live / something is wrong),
never decoration — the accent isn't just "warm" for atmosphere, it's tied to
the instant a call connects, the same way `--color-signal-alert` is tied to
real distress data.

## Typography

| Role | Typeface | Use |
|---|---|---|
| Display | **Fraunces** | Ultra-restrained — app name/logo and page-section headers only. Never body copy, never data. |
| Body | **Inter** | All UI text, labels, descriptions — carries the whole interface, chosen for legibility since this is health-adjacent information |
| Data / mono | **IBM Plex Mono** | Timestamps, sentiment scores, any numeric/tabular value, and the live-call elapsed-time ticker on the vitals strip |

Type scale (Tailwind-compatible steps): `text-xs` (12px) for captions/labels,
`text-sm` (14px) body default, `text-base` (16px) primary reading text,
`text-2xl`/`text-3xl` for section headers (Fraunces), `text-4xl` for the
dashboard's single largest number if one exists (e.g. "3 check-ins today").

## Layout

Sidebar navigation (fixed left, `--color-surface` background) + main content
area (`--color-bg`) with card-based content. Each elderly person gets one
card in the check-in list:

```
+--------------------------------------------------+
| [teal or brick-red left border, 4px]              |
|  Name                              Last check-in  |
|  o o o o ● o o        <- vitals strip             |
|  Next check-in: Tue 9:00am          [View history] |
+--------------------------------------------------+
```

Generous whitespace, rounded corners (not sharp broadsheet edges), no dense
multi-column newspaper layout — this is a small, calm, scannable list, not
a data-dense enterprise table.

## Signature element — the vitals strip

Each person's card shows a small horizontal strip of dots representing
recent check-ins, styled like a heartbeat-monitor readout:

- Filled teal (`--color-primary`) dot = responded, no distress
- Filled brick-red (`--color-signal-alert`) dot = distress detected or no response
- Hollow/outline dot = check-in not yet occurred (scheduled, future)
- **Pulsing accent (`--color-accent`) dot = call is live right now** — the
  only place this color appears outside a focus ring. Next to it, an
  elapsed-time readout in IBM Plex Mono (`0:42`, ticking) — set exactly like
  a phone call's duration display, because that's literally what's
  happening. The moment the call ends, the dot resolves to teal or
  brick-red per the outcome and the ticker disappears — the accent color
  only ever exists for the duration of an actual live call.

This is the one memorable, domain-specific visual the app is built around.
It is not decorative — every dot is real data (structure is information,
not a generic 01/02/03 numbered-step device, since check-ins are actual
sequential timestamps, so numbering-as-sequence is earned here, not
borrowed). The live-call state ties the strip directly to this product's
actual mechanism (Connect places a real outbound call) rather than reading
as a generic status-dot pattern any dashboard could have.

## Component library

**shadcn/ui** (Radix UI primitives + Tailwind CSS), not DaisyUI.

Why: shadcn/ui components are copied into the repo as source (not installed
as an opaque themed package), so the palette and type tokens above apply
directly with full control. DaisyUI applies its look through global utility
classes and a theme system that would fight against a custom palette,
converging toward the same visual signature as every other DaisyUI site —
the opposite of what a portfolio piece needs. shadcn/ui is also the more
current, more resume-relevant choice for Next.js dashboards in 2026.

## Accessibility floor (non-negotiable regardless of visual direction)

- All color pairs above meet WCAG AA contrast at normal text size
- Visible keyboard focus ring on every interactive element (use
  `--color-accent` for the focus ring)
- `prefers-reduced-motion` respected — no animation is required for the app
  to function
- Responsive down to mobile — carers/family will check this dashboard from
  a phone, not just desktop
