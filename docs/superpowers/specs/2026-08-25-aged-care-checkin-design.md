# Aged-Care Check-In & Escalation System — Design Spec

Status: approved by Asif, 2026-08-25. First of two portfolio projects (second: AI Job-Match Engine, built after this one, inside the same 6-month Bedrock credit window).

## Purpose

Scheduled check-in call/text to an elderly person. Analyze their response for
distress or non-response. Alert family/carer if something's wrong. Personal
narrative: ties to Asif's My Aged Care + Gastro admin background.

Portfolio goal: showcase AWS Cloud Practitioner + AI Practitioner certs with a
real, non-generic project. Security and scalability are first-class, not
afterthoughts — this is a resume/interview artifact, built to Well-Architected
standard at portfolio scale.

## Repo strategy

One GitHub repo per project (not a monorepo). This spec covers the
`aged-care-checkin` repo only. Cleaner portfolio links, independent history,
matches how AWS Well-Architected reviews scope per-workload anyway.

## Architecture & data flow

```
EventBridge Scheduler (cron per elderly person)
   -> Step Functions state machine:
      1. Start Amazon Connect outbound call/SMS to elderly person
      2. Connect Contact Flow plays check-in prompt, records response
      3. Amazon Transcribe converts response to text
      4. Amazon Bedrock (Claude) analyzes transcript -> sentiment + distress
         score + "responded: yes/no"
      5. Choice state:
         - no response OR distress detected -> SNS -> alert carer/family
         - normal response -> log only
      6. Write result to DynamoDB (check-in history table)
   -> Dashboard (Next.js on Amplify) reads history via API Gateway + Lambda,
      Cognito-gated
```

DynamoDB: single-table design. `PK=personId`, `SK=checkinTimestamp`, GSI for
carer lookup.

**Alerting:** SNS fans out to both Email and SMS in the architecture diagram
(looks complete for portfolio), but only **Email** is wired up in the actual
implementation. SMS is not in the AWS free tier (~$0.00645+/message) and stays
documented as "supported, not enabled." Email via SNS is free tier (1000
emails/mo).

## AWS services used

| Service | Why | Free tier? |
|---|---|---|
| EventBridge Scheduler | Cron trigger per person's check-in schedule | Always-free |
| Step Functions | Orchestrates call -> transcribe -> analyze -> alert, visual state machine, built-in retry/error handling | Always-free tier covers portfolio volume |
| Amazon Connect | Places outbound call/SMS, runs contact flow | 12-month free tier: 90 min/mo talk time |
| Amazon Transcribe | Converts recorded response to text | 12-month free tier: 60 min/mo |
| Amazon Bedrock (Claude) | Analyzes transcript for sentiment/distress, decides escalate or not | **No free tier** — covered by $200 new-account credit (6mo window); trivial cost after (~$0.01-0.05/check-in on a small model) |
| Amazon SNS | Alerts carer/family (Email only in practice) | Email: free tier (1000/mo). SMS: NOT free, not enabled |
| Amazon DynamoDB | Check-in history, person profiles, schedules | Always-free tier |
| AWS Lambda | Glue code inside Step Functions states + API backend | Always-free tier |
| Amazon API Gateway | REST API fronting Lambda for dashboard | Always-free tier |
| Amazon Cognito | Auth for carer/family dashboard login | 50,000 MAUs always-free |
| AWS Amplify Hosting | Hosts + CI/CD deploys the Next.js dashboard | 12-month free tier (1000 build-min/mo, 15GB served/mo) |
| AWS CDK (TypeScript) | Infrastructure as code, same language as the app | N/A (tooling) |
| AWS IAM | Least-privilege role per Lambda, security backbone | N/A (no cost) |
| Amazon CloudWatch | Logs, alarms, dashboards, billing alarm | Always-free tier (basic) |
| AWS X-Ray (optional) | Trace requests across Step Functions/Lambda | Free tier: 100k traces/mo |
| GitHub Actions | CI/CD: lint/test -> `cdk deploy` on merge to main | Free for public repos |

**Cost control:** CloudWatch billing alarm set at $5 as a tripwire before
first deploy. Whole project should run at $0 out of pocket outside the
Bedrock credit.

## AWS account structure

Single AWS account, all resources tagged `Project=AgedCareCheckIn`, isolated
by per-Lambda IAM least-privilege roles. No AWS Organizations / multi-account
— that's enterprise-scale ceremony this portfolio project doesn't need.

## IAM / security

- Per-Lambda scoped IAM roles (CDK auto-generates tight roles — e.g. the
  start-checkin Lambda can only call Connect's StartOutboundVoiceContact and
  write to its own DynamoDB table, nothing else). No shared execution role.
- Cognito gates the dashboard; API Gateway authorizer checks the Cognito JWT.
- No hardcoded secrets — Secrets Manager or SSM Parameter Store for things
  like the Connect instance ARN.
- Any S3 storage (e.g. call recordings) is private and encrypted at rest.

## AWS Well-Architected pillar mapping

- **Operational Excellence** — Step Functions visual monitoring, CloudWatch alarms
- **Security** — least-privilege IAM, Cognito, encryption at rest
- **Reliability** — Step Functions retries/error catches on each state
- **Performance Efficiency** — serverless (Lambda/DynamoDB) scales automatically
- **Cost Optimization** — free-tier-first design, billing alarm, email-not-SMS
- **Sustainability** — serverless, no idle 24/7 compute

## Orchestration choice

Step Functions over plain chained Lambdas. Reasoning: visual state machine is
a strong portfolio screenshot, built-in retry/error handling, demonstrates
orchestration skill distinct from basic Lambda-to-Lambda calls. (ADR:
`docs/decisions/0001-step-functions-vs-lambda-chain.md`)

## Frontend

Next.js admin dashboard (not just a landing page) — family/carer-facing:
check-in history, sentiment trend, escalation log, per-person schedule
config. Real full-stack surface to demo, not just backend Lambda logs.

Hosted on **AWS Amplify Hosting** (not Vercel) — keeps the whole stack
inside AWS for a stronger AWS-portfolio narrative, and it's within free tier
for this traffic level.

Auth: **Amazon Cognito**, not NextAuth — shows an actual AWS service and
IAM-adjacent skill on the portfolio, not just app-level auth.

## Repo folder structure

```
aged-care-checkin/
├── CLAUDE.md                          # rulebook: design/dev/GitHub rules for Claude Code
├── README.md                          # portfolio-facing overview + architecture diagram + demo link
├── .gitignore
├── .env.example                       # documents required env vars, no real secrets
│
├── docs/
│   ├── architecture-diagram.png       # official AWS icons, final portfolio diagram
│   ├── architecture-diagram.drawio    # editable source for the diagram
│   ├── BUILD_LOG.md                   # narrative log, appended after every push (blog raw material)
│   ├── TROUBLESHOOTING.md             # every fixed problem: title, why it happened, how fixed
│   ├── well-architected-notes.md      # maps design to 6 WA pillars, for portfolio writeup
│   └── decisions/                     # ADRs, one file per major architecture decision
│       ├── 0001-step-functions-vs-lambda-chain.md
│       ├── 0002-cdk-vs-terraform.md
│       └── 0003-email-only-alerts.md
│
├── infra/                             # AWS CDK app (TypeScript)
│   ├── bin/
│   │   └── aged-care-checkin.ts       # CDK app entrypoint
│   ├── lib/
│   │   ├── network-stack.ts           # VPC (if needed), security groups
│   │   ├── data-stack.ts              # DynamoDB tables
│   │   ├── auth-stack.ts              # Cognito user pool
│   │   ├── connect-stack.ts           # Amazon Connect instance + contact flow
│   │   ├── checkin-workflow-stack.ts  # Step Functions + Lambdas + EventBridge Scheduler
│   │   ├── api-stack.ts               # API Gateway + Lambda for dashboard
│   │   └── monitoring-stack.ts        # CloudWatch alarms, billing alarm
│   ├── lambda/
│   │   ├── start-checkin/             # invokes Connect
│   │   ├── analyze-response/          # calls Bedrock
│   │   ├── send-alert/                # calls SNS
│   │   ├── get-checkin-history/       # API backend for dashboard
│   │   └── manage-schedule/           # API backend, CRUD schedules
│   ├── statemachine/
│   │   └── checkin-flow.asl.json      # Step Functions definition (or CDK-native constructs)
│   ├── test/
│   │   ├── stacks/                    # CDK snapshot tests
│   │   └── lambda/                    # unit tests per handler
│   ├── cdk.json
│   ├── tsconfig.json
│   └── package.json
│
├── web/                                # Next.js dashboard
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── dashboard/                 # check-in history, sentiment trend
│   │   ├── people/                    # manage elderly person profiles + schedules
│   │   └── layout.tsx
│   ├── components/
│   ├── lib/
│   │   ├── api-client.ts              # typed fetch wrapper to API Gateway
│   │   └── auth.ts                    # Cognito integration
│   ├── test/
│   ├── amplify.yml                    # Amplify Hosting build spec
│   ├── tsconfig.json
│   └── package.json
│
└── .github/
    └── workflows/
        ├── infra-deploy.yml            # lint/test -> cdk deploy, main branch only
        └── web-ci.yml                  # lint/test on PR (Amplify handles actual deploy)
```

## CLAUDE.md — rules for Claude Code (to be written into the project repo)

**Project basics**
- Purpose, 1-line architecture summary, tech stack version pins
- Command reference (`npm run deploy` in /infra, `npm run dev` in /web, test commands)

**Design system**
- All `web/` styling (color, typography, spacing) derives from
  `docs/DESIGN_SYSTEM.md` — no ad-hoc hex values or fonts introduced
  elsewhere. Component library: **shadcn/ui** (Radix + Tailwind), not
  DaisyUI. `--color-signal-alert` is reserved exclusively for real
  distress/escalation states, never decorative.

**Code conventions**
- No `any` in TypeScript
- Zod for runtime validation at Lambda boundaries
- Beginner-readable code: descriptive names over clever abstractions, minimal
  purposeful comments, avoid advanced TS patterns (generics gymnastics,
  decorators) unless the AWS SDK forces it
- Single-table DynamoDB access pattern documented and pointed to before any
  new access pattern is added

**IAM / cost rules**
- Every Lambda gets its own least-privilege IAM role, never a shared wildcard role
- Never enable SNS SMS — email only
- CloudWatch billing alarm must exist before first deploy

**Teaching-mode rules** (governs every dev session)
- Before writing any infra file: short plain-English explanation of what it
  does and why this AWS service/pattern, before the code appears
- After each CDK deploy: point to the exact AWS Console page to go look at
  the created resource
- Manual AWS Console walkthroughs (not CDK) for one-time account-level setup:
  IAM user/root lockdown, MFA, billing alarm, Bedrock model access request,
  Cognito user pool first look, Connect instance claim — clicked through by
  hand, step by step, to build console muscle memory
- Everything else (Lambda, DynamoDB, Step Functions, API Gateway) is
  CDK-authored, but Claude walks Asif to the Console afterward to see what
  got created
- No skipping ahead — build file by file, explain, wait for "next" before
  continuing
- **Service-introduction rule:** first time any AWS service appears, give:
  what it is (1 line), best practice used here, why it matters, what to
  avoid and why (common beginner mistake, its real consequence). Brief
  reference only on later uses of the same service.

**Checkpoint / error-handling rules**
- After each file/step, ask Asif "make sense? any errors?" before moving on
- If Asif hits an error: stop forward progress, debug together, resume
  exactly where left off only after it's fixed — never skip past a problem
- Every fixed problem gets an entry in `docs/TROUBLESHOOTING.md`: Problem
  title, short why-it-happened, short how-we-fixed-it
- After every push: append a dated entry to `docs/BUILD_LOG.md` — what was
  built, why this approach over alternatives, what AWS concept it
  demonstrates. This is separate from TROUBLESHOOTING.md (that's a debugging
  reference; BUILD_LOG.md is narrative, for blog/portfolio reuse)

**Git rules**
- **HARD RULE — solo contributor, no exceptions:** Claude must NEVER appear
  as a contributor on GitHub for this repo. No `Co-Authored-By: Claude` (or
  any Claude/Anthropic identity) in any commit, ever. Git author/committer
  identity is always Asif's (`asifhossain976@gmail.com`) only. This overrides
  any default commit-message template Claude Code would otherwise use.
  Applies to every commit, every branch, every PR, no exceptions, prioritized
  above all other git rules.
- **Commit/push gate:** Claude never commits or pushes on its own initiative
  mid-task. It commits/pushes only after (1) the relevant tests/build pass,
  AND (2) Asif has confirmed the checkpoint ("make sense? any errors?") for
  that step. Passing tests alone is not enough — Asif's explicit go-ahead is
  required before any commit or push.
- Trunk-based development: `main` always deployable, short-lived
  `feature/<name>`, `fix/<name>`, `infra/<name>` branches, PR back to main
  even solo (review checkpoint + clean history for recruiters), squash-merge
- Commit messages: Conventional Commits prefix (`feat:`, `fix:`, `infra:`,
  `docs:`, `chore:`) but short, plain-English subject line, ≤50 chars, body
  only when the "why" isn't obvious from the diff
- CI/CD: GitHub Actions — lint/test on PR, `cdk deploy` on merge to main.
  Amplify Hosting auto-deploys the frontend separately on push.

## Orchestration & IaC decisions locked

- IaC: **AWS CDK (TypeScript)** — same language as the app, no context
  switch, type-safe infra, strong "TypeScript end-to-end" resume line.
- Orchestration: **Step Functions**, not chained Lambdas (see above).

## Diagram

Architecture is locked as a blueprint **before** any AWS account work or
code — this is Phase 0 of `docs/DEVELOPMENT_PHASES.md`, not an
after-the-fact artifact. Final architecture diagram uses official AWS
Architecture Icons, numbered components, account-boundary box — same
visual language as the reference image Asif provided (Kelvin/industrial AWS
diagram). Drawn from the data flow already decided in this spec. Verified
against the as-built system at Phase 11 (any deviation during build gets
logged as an ADR and the diagram updated to match).

## Attribution

- GitHub profile: `Rafin31`
- Contact email: `asifhossain976@gmail.com`
- Portfolio site: rafinh.dev

Used for README authorship, git commit identity, and any contact links on
the portfolio-facing README.

## Next steps (not part of this session)

1. `writing-plans` skill to turn this spec into a step-by-step implementation
   plan, once Asif is ready to start coding.
2. Second project (AI Job-Match Engine: Lambda, API Gateway, S3, DynamoDB,
   Bedrock) gets its own brainstorming + spec session after this one ships.
