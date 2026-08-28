# Build Log

Narrative record of what was built, why this approach over alternatives, and
what AWS concept it demonstrates. One dated entry per push. Raw material for
the eventual portfolio write-up (Phase 12).

## 2026-08-26 — Phase 1: AWS account foundation

**What was built:** Root account MFA (authenticator app), IAM user
`rafin-admin` in a new `admins` group (`AdministratorAccess` policy attached
to the group, not the user), AWS CLI v2 + `uv` installed locally with a
named profile (`aged-care-check-in`, `ap-southeast-2`) authenticated via
`aws login` browser flow, Bedrock model access confirmed (AWS auto-enables
serverless foundation models on first invoke now — no manual toggle step
exists any more), and a CloudWatch billing alarm (`billing-alarm-5usd`,
threshold >$5, email via SNS topic `billing-alarm-topic`) in `us-east-1`.

**Why this approach:**
- Group-based IAM (`admins` group holding the policy) instead of attaching
  `AdministratorAccess` directly to the user — policy is reusable for any
  future user without re-attaching, standard AWS best practice over
  per-user policy sprawl.
- Root MFA + a separate daily-driver IAM user, rather than using root
  credentials day to day — root has no permission ceiling, so a compromised
  root session is total account loss; an IAM user's blast radius is bounded
  by its policy.
- Billing alarm deliberately created in `us-east-1` even though the
  project's resources live in `ap-southeast-2` — the `EstimatedCharges`
  CloudWatch metric only ever publishes in `us-east-1`, regardless of where
  other resources run.

**AWS concepts demonstrated:** IAM users/groups/policies vs. root account
separation, MFA as an account-level control, CloudWatch billing alarms +
SNS notification topics, Bedrock's shift to zero-touch serverless model
access.

**Push:** `docs: mark Phase 1 AWS account foundation complete` (1c359f4)

## 2026-08-28 — Phase 3: design system wiring

**What was built:** Design tokens from `docs/design/DESIGN_SYSTEM.md` wired
into `web/src/app/globals.css` as the single tokens file (Tailwind v4
`@theme`/`:root`/`.dark` — no `tailwind.config.ts` exists on this shadcn
scaffold, so the CSS file is the mechanism). Replaced the scaffold's
generic neutral/oklch palette and Geist fonts with the sage/teal/ink/
accent/signal-alert palette and Fraunces (display)/Inter (body)/IBM Plex
Mono (data) fonts. Added a dark palette in the same file's `.dark` block —
same hue family, prepared for a future theme toggle, not activated yet. A
throwaway proof page (swatches, type samples, vitals-strip card mocks,
focus ring, dark-mode preview) confirmed the tokens render correctly, then
was deleted per the phase checklist.

**Why this approach:**
- CSS-file-as-tokens (not `tailwind.config.ts`) because the shadcn
  `base-nova` scaffold already generates Tailwind v4 `@theme inline` +
  `:root` blocks in `globals.css` with no config file — matching the
  existing mechanism instead of introducing a second one, per SOUL.md's
  single-tokens-file rule.
- shadcn's system var names (`--color-primary`, `--color-destructive`,
  etc.) kept as the Tailwind-facing layer, aliased to the design doc's own
  token names (`--bg`, `--primary`, `--signal-alert`, ...) — so `bg-primary`
  works in components while the doc's palette stays the single source
  underneath. `--destructive` and `--signal-alert` point at the same value
  since they mean the same thing in this product (real danger, never
  decorative).
- Dark palette added proactively (per Rafin's request) even though no
  toggle exists yet — same tokens file, same hue family, so activating a
  theme switch later is a mechanism change only, not a re-derivation of
  the palette.

**What it demonstrates:** Tailwind v4's CSS-native token model (`@theme`
inline mapping) vs. the older JS-config approach, and keeping a single
source of truth for design values across light/dark variants.

**Push:** `web: wire design system tokens, add dark palette`
