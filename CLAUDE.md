# CLAUDE.md — Project Rulebook (Aged-Care Check-In & Escalation System)

This is the durable instruction set for Claude Code in this repo. Read this
plus `SOUL.md` (coding contract — how to code, AWS teaching flow, negative
and positive instructions) before doing any work here. Locked design spec
lives at `docs/planning/specs/2026-08-25-aged-care-checkin-design.md` — this
file is the operational summary of it; that file is the source of truth for
architecture/design decisions if the two ever disagree.

## Session-start check — mandatory, before any other action

At the start of every new session, and again right before starting a new
phase or right after finishing one, Claude checks project position from
the actual files/repo/AWS state — never assumes a phase is done or pending
from memory or from what was said in a prior session.

**.md read order (do this first, in this sequence):**

1. `CLAUDE.md` (this file) — rules, hard rules, current "Where we are"
2. `SOUL.md` — coding contract, in case a code task follows
3. `docs/planning/DEVELOPMENT_PHASES.md` — the actual phase-completion
   ledger (`✅ Completed — date/time` tags are the real source of truth,
   more authoritative than this file's "Where we are" section)
4. `docs/planning/specs/2026-08-25-aged-care-checkin-design.md` — locked
   architecture/spec, if the session involves any design decision
5. `docs/design/DESIGN_SYSTEM.md` — if the session touches `web/`
6. `docs/decisions/*.md` — any ADRs, if present, for context on deviations
7. `docs/TROUBLESHOOTING.md` / `docs/BUILD_LOG.md` — once they exist, for
   recent history/context

After reading, cross-check against reality (`git log`, `git status`,
folder listing, and — once AWS work starts — actually looking at the
Console/CDK output) before stating which phase is current. If the docs and
the actual repo/AWS state disagree, or it's unclear whether a phase is
truly finished, **stop and ask Rafin** rather than guessing. Always tell
Rafin the current position (completed / current / remaining phases) as part
of picking up work — don't wait to be asked.

## Project basics

- **Purpose:** scheduled check-in call to an elderly person; Bedrock
  analyzes the response for distress/non-response; alert family/carer by
  email if something's wrong. Personal narrative: ties to Rafin's My Aged
  Care + Gastro admin background.
- **Portfolio goal:** demonstrate AWS Cloud Practitioner + AI Practitioner
  certs with a real, non-generic, Well-Architected project. First of two
  portfolio projects (second: AI Job-Match Engine, after this ships, same
  credit window — see Cost hard rule below).
- **Repo:** https://github.com/Rafin31/aws-aged-care-check-in.git — created,
  pushed, `main` branch tracked, working tree clean as of 2026-08-26.
- **1-line architecture:** EventBridge Scheduler -> Step Functions ->
  Amazon Connect (call) -> Transcribe -> Bedrock (distress/sentiment) ->
  Choice (SNS email alert or log) -> DynamoDB -> API Gateway + Lambda ->
  Next.js dashboard (Cognito-gated, Amplify Hosting).
- **Tech stack (locked):** AWS CDK (TypeScript) for IaC, Step Functions for
  orchestration (not chained Lambdas), Next.js + shadcn/ui for the
  dashboard, Amplify Hosting (not Vercel), Cognito (not NextAuth). Full
  service list and free-tier notes: spec file, "AWS services used" table.

## Repo structure

```
aged-care-check-in/
├── CLAUDE.md                # this file
├── SOUL.md                  # coding contract: how Claude codes, AWS teaching flow
├── README.md                # (not yet written — Phase 12)
├── docs/
│   ├── architecture/         # AWS diagrams: .drawio source + PNG exports, reference image
│   ├── design/                # DESIGN_SYSTEM.md (palette, type, vitals-strip, shadcn/ui)
│   ├── planning/               # DEVELOPMENT_PHASES.md (12-phase build order) + specs/
│   │   └── specs/2026-08-25-aged-care-checkin-design.md   # locked design spec, source of truth
│   └── decisions/              # ADRs — one file per major architecture decision (empty so far)
├── infra/                    # AWS CDK app — not created yet (Phase 2)
└── web/                       # Next.js dashboard — not created yet (Phase 2)
```

`docs/BUILD_LOG.md`, `docs/TROUBLESHOOTING.md`, `docs/well-architected-notes.md`
don't exist yet — created in later phases per `docs/planning/DEVELOPMENT_PHASES.md`.

## Where we are (updated 2026-08-26)

- **Phase 0 — Architecture & diagram lock: DONE.** Final diagram at
  `docs/architecture/aged-care-check-in-aws-architecture-diagram.png`
  (+ editable source `architecture-diagram.drawio`), matches the spec's
  data flow exactly, approved by Rafin.
- GitHub remote created and the existing local directory pushed to it —
  `main` branch, tracked, clean.
- Docs reorganized into `architecture/`, `design/`, `planning/` subfolders
  (2026-08-26) for clarity as the doc set grows.
- **Not started:** Phase 1 (AWS account foundation, manual Console —
  MFA, IAM user, Bedrock model access request, billing alarm, credit
  confirmation) is next. No CDK, no Next.js app, no AWS resources deployed.

Full phase-by-phase plan and checkpoints: `docs/planning/DEVELOPMENT_PHASES.md`.
Do not suggest skipping to a later phase — confirm current repo/AWS state
before proposing next steps, this file can go stale as work progresses.

## Design system (enforce on every `web/` change)

Full detail: `docs/design/DESIGN_SYSTEM.md`. Palette: sage-grey bg
(`#EEF1ED`), teal primary (`#3B6E64`), orange accent (`#C97B3B` — live-call
state and focus rings ONLY), brick-red signal-alert (`#B23A34` — real
distress/escalation data ONLY, never decorative). Fonts: Fraunces (display
only), Inter (body), IBM Plex Mono (all numeric/timestamp data). Component
library: shadcn/ui, not DaisyUI. Signature element: the "vitals strip" dot
row per person card.

**Single design-tokens file, hard rule:** every color/font/spacing/radius
value used in `web/` must come from exactly one tokens file (CSS custom
properties or Tailwind theme config, decided in Phase 3) — no raw hex/px
values in components. Full rule + genericness-check + copy-voice rules:
`SOUL.md` "Frontend design" section.

## Code conventions

See `SOUL.md` for the full coding contract. Summary: no `any` in
TypeScript, Zod validation at every Lambda boundary, beginner-readable code
over clever abstractions, single-table DynamoDB access pattern documented
before any new pattern is added.

## Cost hard rule — highest priority, above feature delivery

Rafin's AWS account has **one active credit: "AWS Free Tier", $100.00,
issued 08/26/2026, expires 08/26/2027** (confirmed via Billing > Credits
console, credit ID 10066356449). This project runs entirely inside AWS
always-free tier + 12-month free tier + this $100 credit. It must never
generate a real charge outside that.

**If there is any chance — anywhere, anytime, any service — of incurring a
charge, Claude halts immediately and warns Rafin before proceeding.** No
exceptions, no "it's probably fine." The warning must include:

1. Which action/service triggers the possible cost.
2. Short detail on how the charge would actually be billed (rate, unit,
   when free tier caps out).
3. The free-tier-safe alternative, if one exists (smaller instance,
   different service, a cap/config that keeps it free, or skipping the
   feature).

Applies to every phase — this rule overrides "make progress" or "finish the
phase." When in doubt about whether something is free, stop and ask rather
than assume free tier covers it.

## IAM / cost rules

- Every Lambda: its own least-privilege IAM role. Never shared/wildcard.
- SNS SMS is never enabled — email only (SMS isn't free tier).
- CloudWatch billing alarm ($5) must exist before the first deploy.
- No hardcoded secrets — Secrets Manager / SSM Parameter Store.

## Teaching-mode & AWS console guidance

Full detail in `SOUL.md`. Summary: explain before code, service-intro
treatment on first use of any AWS service, manual Console walkthroughs for
account-level setup (MFA, IAM user, Bedrock access, billing alarm, Cognito
first user, Connect instance claim), Console pointer after every CDK
deploy, no skipping ahead — one file/step at a time, wait for "next".

## Checkpoint / error-handling rules

- After each file/step: ask Rafin "make sense? any errors?" before moving on.
- If Rafin hits an error: stop forward progress, debug together, resume
  exactly where left off only after it's fixed. Never skip past a problem.
- Every fixed problem -> entry in `docs/TROUBLESHOOTING.md` (title, why,
  how fixed).
- After every push -> dated entry in `docs/BUILD_LOG.md` (what was built,
  why this approach, what AWS concept it demonstrates). Separate from
  TROUBLESHOOTING — this one is narrative/portfolio-blog raw material.

## Phase completion tracking

After a phase's checkpoint is confirmed by Rafin ("make sense? any errors?"
= yes), Claude updates `docs/planning/DEVELOPMENT_PHASES.md` immediately:
mark that phase's heading with **`✅ Completed — YYYY-MM-DD HH:MM`** (local
time). This is the running source of truth for "what phase are we
actually on" — check it before proposing next steps, don't rely on this
file's "Where we are" section alone since that goes stale faster.

## Git & GitHub rules

- **HARD RULE — solo contributor, no exceptions, highest priority:** Claude
  must NEVER appear as a contributor on GitHub for this repo. No
  `Co-Authored-By: Claude` (or any Claude/Anthropic identity) in any commit,
  branch, or PR, ever. Git author/committer identity is always Rafin's
  (`asifhossain976@gmail.com`) only. This overrides Claude Code's default
  commit-message template — strip any auto-added co-author trailer before
  every commit in this repo.
- **Commit/push gate:** Claude never commits or pushes on its own
  initiative mid-task. Only after (1) relevant tests/build pass AND (2)
  Rafin has explicitly confirmed that step's checkpoint ("make sense? any
  errors?"). Passing checks alone is never sufficient.
- Trunk-based development: `main` always deployable, short-lived
  `feature/<name>` / `fix/<name>` / `infra/<name>` branches, PR back to
  main even solo (clean history + review checkpoint for recruiters),
  squash-merge.
- Commit messages: Conventional Commits prefix (`feat:`, `fix:`, `infra:`,
  `docs:`, `chore:`), short plain-English subject ≤50 chars, body only when
  the "why" isn't obvious from the diff.
- CI/CD (Phase 8, not yet built): GitHub Actions lint/test on PR, `cdk
  deploy` on merge to main. Amplify Hosting auto-deploys the frontend
  separately on push.

## Negative instructions — DO NOT

- Do not assume requirements, file structure, APIs, database schemas, or
  existing functionality.
- Do not hallucinate files, functions, variables, packages, commands,
  endpoints, or configuration.
- Do not take shortcuts just to make the code appear complete.
- Do not invent missing information.
- Do not modify unrelated files or code.
- Do not remove existing functionality unless explicitly required.
- Do not silently change architecture, dependencies, configuration, or
  project structure.
- Do not create duplicate functions or components when an existing one can
  be reused.
- Do not use fake/mock data unless explicitly requested.
- Do not ignore TypeScript, linting, build, or test errors.
- Do not suppress errors with `any`, `@ts-ignore`, empty catch blocks, or
  similar workarounds unless absolutely necessary.
- Do not hardcode values that should come from configuration, environment
  variables, constants, or the database.
- Do not claim something works without verifying it.
- Do not guess library APIs. Check the existing implementation, types, or
  documentation first.
- Do not install unnecessary packages.
- Do not over-engineer simple tasks.
- Do not change working code without a clear reason.
- Do not expose secrets, API keys, credentials, tokens, or sensitive data.
- Do not leave incomplete TODOs when the requested task can be completed.
- Do not stop after fixing only the visible symptom; check the underlying
  cause.

## Positive instructions — ALWAYS DO

- Understand the requirement before changing code.
- Inspect the relevant existing files before implementing anything.
- Follow the project's existing architecture, patterns, naming conventions,
  and coding style.
- Reuse existing components, utilities, functions, types, and services
  whenever appropriate.
- Make the smallest safe change required to solve the problem.
- Prefer simple, readable, maintainable solutions.
- Verify assumptions against the actual codebase.
- Trace dependencies and usages before changing shared code.
- Preserve backward compatibility unless a breaking change is explicitly
  required.
- Handle errors and edge cases properly.
- Maintain strong TypeScript typing.
- Keep security, validation, authentication, and authorization in mind.
- Use environment variables/configuration for environment-specific or
  sensitive values.
- After implementation, review the changed code for regressions.
- Run relevant tests, type checks, linting, and builds when available.
- Fix errors caused by your changes instead of hiding them.
- Clearly state anything that could not be verified.
- If information is genuinely missing, identify exactly what is unknown
  instead of inventing an answer.
- Solve the root cause rather than applying a temporary patch.
- Keep changes focused on the requested task.

## Core rule

Do not assume. Do not hallucinate. Do not take shortcuts. Inspect,
understand, implement, and verify.

Before making a change: inspect the relevant code -> understand how the
existing implementation works -> identify the root cause or exact
requirement -> make the minimum necessary change -> check related usages
and possible side effects -> run available validation/tests -> review your
own changes before declaring the task complete.

## Definition of done

Never say a task is complete simply because code was written. A task is
complete only when:

- The requested behavior has been implemented.
- Existing behavior has not been unintentionally broken.
- Relevant errors have been handled.
- Types are valid.
- Relevant tests/checks have been run when available.
- No fake implementation or hidden workaround was introduced.
- The final implementation matches the actual codebase rather than
  assumptions.
- Rafin has confirmed the checkpoint before anything is committed or pushed.

## Next steps

1. Phase 1 — AWS account foundation (manual Console only): root MFA, IAM
   user, Bedrock model access request, $5 billing alarm. Credit already
   confirmed: $100 AWS Free Tier, expires 08/26/2027 — see Cost hard rule.
2. Phase 2 — repo & tooling scaffold: `infra/` CDK init, `web/` Next.js
   init, `.env.example`, `.gitignore`.
3. Full order: `docs/planning/DEVELOPMENT_PHASES.md`.
