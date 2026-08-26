# SOUL.md — How Claude Codes on This Project

This file is the coding contract. `CLAUDE.md` covers project facts and
process rules; this file covers *how code gets written* — before, during,
and after. Read both before touching any file in `infra/` or `web/`.

## Before writing any code

1. **Explain first.** For any new infra file or AWS-service-touching code:
   short plain-English explanation of what it does and why this
   service/pattern was chosen — before the code appears. This project is
   Rafin's hands-on AWS learning, not just a deliverable.
2. **First time a service appears**, give the full service-introduction
   treatment: what it is (1 line), best practice used here, why it matters,
   common beginner mistake and its real consequence. Later uses of the same
   service: brief reference only, no repeat lecture.
3. **Inspect before implementing.** Read the relevant existing files, the
   locked spec (`docs/planning/specs/2026-08-25-aged-care-checkin-design.md`),
   and `docs/design/DESIGN_SYSTEM.md` before writing anything that touches
   architecture, styling, or data shape. Never assume a file, function,
   package, or schema exists — check.
4. **One file/step at a time.** No skipping ahead. Wait for Rafin's "next"
   before moving to the following file or phase.

## AWS console guidance (hands-on learning is the point)

- **Manual-only, by design** (Claude never automates these, walks Rafin
  through the Console step by step instead): root MFA, IAM user creation,
  Bedrock model access request, billing alarm setup, Cognito user pool
  first look + first test user, Amazon Connect instance claim.
- **CDK-authored, but always followed by a Console walkthrough**: DynamoDB,
  Lambda, Step Functions, API Gateway, CloudWatch alarms. After every
  `cdk deploy`, tell Rafin exactly which Console page to open to see what
  got created.
- Goal: Rafin builds real console muscle memory, not copy-paste deploys he
  can't explain in an interview.

## While writing code

**Style & conventions**
- No `any` in TypeScript, ever.
- Zod for runtime validation at every Lambda boundary (event input, API
  request bodies).
- Beginner-readable over clever: descriptive names, minimal purposeful
  comments, avoid generics gymnastics/decorators/advanced TS patterns
  unless the AWS SDK's types force it.
- Single-table DynamoDB access pattern is documented before any new access
  pattern is added — point to the existing pattern first.
- All `web/` styling (color, type, spacing) derives from
  `docs/design/DESIGN_SYSTEM.md` — no ad-hoc hex values or fonts anywhere
  else. `--color-signal-alert` is reserved exclusively for real
  distress/escalation data, never decorative — check every new component
  against this before using red.
- Component library: shadcn/ui (Radix + Tailwind). Not DaisyUI.

**Frontend design — single design-tokens file (hard rule)**
- One file is the only place design values are declared: `web/styles/tokens.css`
  (CSS custom properties, Tailwind v4-style) or `web/tailwind.config.ts`
  `theme.extend` if Tailwind v3 — pick one when Phase 3 wires the design
  system, then never change the mechanism without an ADR. Every color,
  font family, type-scale step, spacing step, radius, and shadow used
  anywhere in `web/` must reference a token from this file (Tailwind
  class backed by the token, or `var(--token-name)`). No component ever
  declares a raw hex, px, or font-family value inline.
- `docs/design/DESIGN_SYSTEM.md` is the human-readable spec; the tokens
  file is its code implementation — the two must always match. If a token
  needs to change, edit the doc and the tokens file together, same commit.
- Before adding any new visual value (a new spacing size, a new shade),
  check whether an existing token already covers the need — reuse over
  invention. A new token is only added when the design doc itself is
  updated to justify it, never as a one-off in a component file.
- Genericness check (from the `frontend-design` skill): before building
  any new page/component, compare it against the three generic-AI-design
  defaults already ruled out in `DESIGN_SYSTEM.md` (cream+serif+terracotta,
  near-black+neon accent, broadsheet hairline columns). If a new piece of
  UI drifts toward one of these instead of the locked sage/teal/vitals-strip
  identity, stop and flag it rather than shipping it.
- The vitals strip (per-person check-in dot row) is this product's one
  signature element — keep everything else quiet and disciplined around
  it, per the skill's "spend boldness in one place" principle. Don't add a
  second "memorable" visual flourish competing for attention.
- Copy in the dashboard (labels, empty states, error messages) is written
  from the carer's point of view, plain and specific, active voice, same
  vocabulary from action to confirmation (e.g. a "Snooze check-in" control
  produces a "Snoozed" confirmation, never a different word for the same
  action). Errors state what happened and how to fix it — no vague
  wording, no apology filler.
- Respect `prefers-reduced-motion`; keyboard focus ring uses `--color-accent`
  on every interactive element; responsive down to mobile — all already in
  `DESIGN_SYSTEM.md`'s accessibility floor, repeated here because it's
  easy to skip under deadline pressure.

**Security & cost (non-negotiable)**
- Every Lambda gets its own least-privilege IAM role. Never a shared or
  wildcard role.
- No hardcoded secrets — Secrets Manager or SSM Parameter Store.
- SNS SMS is never enabled. Email only.
- Any S3 storage (e.g. call recordings) is private, encrypted at rest.
- CloudWatch billing alarm must exist before the first deploy.
- **Cost hard rule (highest priority):** account has exactly one credit —
  AWS Free Tier, $100.00, expires 08/26/2027. If any action anywhere risks
  a real charge, halt and warn Rafin before proceeding: what triggers it,
  how it'd be billed, and the free-tier-safe alternative. See `CLAUDE.md`.

## After writing code

- Point to the exact AWS Console page to verify what was just created/changed.
- Ask Rafin: "make sense? any errors?" — this is the checkpoint gate, not a
  formality. Stop forward progress on any error Rafin reports; debug
  together; resume exactly where it left off once fixed.
- Run whatever tests/lint/build/synth exists for the changed area before
  calling anything done.
- Every fixed bug gets an entry in `docs/TROUBLESHOOTING.md` (title, why it
  happened, how it was fixed).
- After every push: dated entry in `docs/BUILD_LOG.md` — what was built,
  why this approach over alternatives, what AWS concept it demonstrates.

## Negative instructions — DO NOT

- Do not assume requirements, file structure, APIs, database schemas, or
  existing functionality — inspect first.
- Do not hallucinate files, functions, variables, packages, commands,
  endpoints, or configuration.
- Do not take shortcuts to make code merely look complete.
- Do not invent missing information — state exactly what's unknown instead.
- Do not modify unrelated files or code.
- Do not remove existing functionality unless explicitly required.
- Do not silently change architecture, dependencies, configuration, or
  project structure — anything already locked in the spec needs an ADR in
  `docs/decisions/` if it's going to change.
- Do not create duplicate functions/components when an existing one can be
  reused.
- Do not use fake/mock data unless explicitly requested.
- Do not ignore TypeScript, linting, build, or test errors.
- Do not suppress errors with `any`, `@ts-ignore`, empty catch blocks, or
  similar workarounds unless truly unavoidable — and say so out loud when
  it happens.
- Do not hardcode values that should come from config, env vars, constants,
  or the database.
- Do not claim something works without verifying it.
- Do not guess library/AWS SDK APIs — check existing implementation, types,
  or docs first.
- Do not install unnecessary packages.
- Do not over-engineer simple tasks.
- Do not change working code without a clear reason.
- Do not expose secrets, API keys, credentials, tokens, or sensitive data.
- Do not leave incomplete TODOs when the requested task can be completed.
- Do not stop after fixing only the visible symptom — check the underlying
  cause.

## Positive instructions — ALWAYS DO

- Understand the requirement before changing code.
- Inspect the relevant existing files before implementing anything.
- Follow the project's existing architecture, patterns, naming conventions,
  and coding style.
- Reuse existing components, utilities, functions, types, services.
- Make the smallest safe change required to solve the problem.
- Prefer simple, readable, maintainable solutions.
- Verify assumptions against the actual codebase, not memory of it.
- Trace dependencies and usages before changing shared code (e.g. the
  DynamoDB single-table access pattern, shared Lambda utils).
- Preserve backward compatibility unless a breaking change is explicitly
  required and agreed.
- Handle errors and edge cases properly.
- Maintain strong TypeScript typing throughout.
- Keep security, validation, authentication, authorization in mind on every
  Lambda/API change.
- Use environment variables/configuration for environment-specific or
  sensitive values.
- After implementation, review the changed code for regressions.
- Run relevant tests, type checks, linting, and builds when available.
- Fix errors caused by your own changes instead of hiding them.
- Clearly state anything that could not be verified.
- If information is genuinely missing, say exactly what's unknown instead
  of inventing an answer.
- Solve the root cause rather than applying a temporary patch.
- Keep changes focused on the requested task.

## Core rule

Do not assume. Do not hallucinate. Do not take shortcuts. Inspect,
understand, implement, verify.

Before making a change: inspect the relevant code -> understand the
existing implementation -> identify the root cause or exact requirement ->
make the minimum necessary change -> check related usages and side effects
-> run available validation/tests -> review your own changes before
declaring the task complete.

## Definition of done

A task is not complete just because code was written. It is complete only
when:

- The requested behavior is implemented.
- Existing behavior has not been unintentionally broken.
- Relevant errors are handled.
- Types are valid.
- Relevant tests/checks have been run when available.
- No fake implementation or hidden workaround was introduced.
- The final implementation matches the actual codebase, not assumptions.
- Rafin has confirmed the checkpoint ("make sense? any errors?") — see
  `CLAUDE.md` commit/push gate. Passing checks alone is never sufficient to
  commit or push.
