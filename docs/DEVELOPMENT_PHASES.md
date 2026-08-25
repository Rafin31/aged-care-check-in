# Development Phases — Aged-Care Check-In Dashboard

Start-to-end build order. Every phase ends with a checkpoint (per CLAUDE.md
rules: "make sense? any errors?") before moving to the next. Commit/push
only happens after Asif confirms a phase's checkpoint — never mid-phase.

## Phase 0 — AWS account foundation (manual, Console only)

Goal: safe, ready AWS account before any code is written.

- Root account MFA enabled
- Create an IAM user for daily work (never use root day-to-day)
- Request Bedrock model access (Claude) — this is a manual Console approval step
- Set up CloudWatch billing alarm at $5
- Confirm $200 credit + expiry date on the Billing > Free Tier page
- Note account creation date (Bedrock credit is a 6-month window from there)

No CDK yet — this phase is 100% Console, by design (teaching-mode rule:
account-level setup is clicked by hand).

## Phase 1 — Repo & tooling scaffold

Goal: empty but correctly structured repo, nothing deployed yet.

- Create GitHub repo `aged-care-checkin` (Asif creates it — Claude never
  owns repo creation/contributor status per the solo-contributor hard rule)
- Scaffold folder structure from the spec (`infra/`, `web/`, `docs/`, `.github/`)
- Write `CLAUDE.md` into the repo (rules from spec, finalized)
- Init CDK app in `infra/` (`cdk init app --language typescript`)
- Init Next.js app in `web/` with Tailwind + shadcn/ui
- `.env.example`, `.gitignore`

Checkpoint: `npm install` and a blank `cdk synth` run clean in `infra/`;
`npm run dev` boots the blank Next.js app in `web/`.

## Phase 2 — Design system wiring

Goal: `docs/DESIGN_SYSTEM.md` tokens live in code, nothing else built yet.

- Tailwind config: color tokens, font families (Fraunces, Inter, IBM Plex Mono)
- shadcn/ui initialized, base components themed to the palette
- One throwaway page proving the tokens render correctly (deleted after)

Checkpoint: colors/fonts visibly match the design doc in the browser.

## Phase 3 — Data layer

Goal: DynamoDB table exists, deployed via CDK, no compute yet.

- `data-stack.ts`: single-table DynamoDB (`PK=personId`, `SK=checkinTimestamp`, GSI for carer lookup)
- First real `cdk deploy` — Claude walks Asif to the DynamoDB Console afterward to see the created table

Checkpoint: table visible in Console, matches the access-pattern design.

## Phase 4 — Auth

Goal: Cognito user pool exists, one test user can log in.

- `auth-stack.ts`: Cognito user pool + app client
- Console walkthrough: Cognito user pool page, manually create first test user
- Wire `web/lib/auth.ts` to Cognito, build the login page

Checkpoint: Asif can log into the (still-empty) dashboard with the test user.

## Phase 5 — Core check-in workflow

Goal: the actual orchestrated flow runs end-to-end for one test person.

- `connect-stack.ts`: Amazon Connect instance + basic contact flow (Connect
  instance claim is a manual Console step — Connect doesn't fully support
  CDK for contact flow authoring, so Claude explains what's CDK vs Console here)
- Lambda: `start-checkin` (invokes Connect)
- Amazon Transcribe wired to the call recording
- Lambda: `analyze-response` (calls Bedrock — first real Bedrock usage,
  Claude gives the full "service introduction" treatment here)
- `checkin-workflow-stack.ts`: Step Functions state machine wiring all of
  the above + EventBridge Scheduler trigger
- Lambda: `send-alert` (SNS, email only — SMS never enabled per hard rule)

Checkpoint: one full manual test run against Asif's own phone number,
Step Functions console shows the execution graph succeeding, an email
alert arrives when a distress response is simulated.

This is the highest-risk phase — expect to spend real checkpoint time
debugging Connect/Transcribe/Bedrock permissions and IAM policies here.

## Phase 6 — Dashboard API + frontend

Goal: the Next.js dashboard shows real data from Phase 3-5.

- `api-stack.ts`: API Gateway + Lambda (`get-checkin-history`,
  `manage-schedule`), Cognito authorizer wired in
- Dashboard pages: check-in list (vitals-strip cards from the design doc),
  person management, schedule config
- `web/lib/api-client.ts` typed fetch wrapper

Checkpoint: logged-in dashboard shows the real check-in history from
Phase 5's test runs, matching the design system.

## Phase 7 — CI/CD

Goal: push to `main` deploys both infra and frontend automatically.

- `.github/workflows/infra-deploy.yml`: lint/test -> `cdk deploy` on merge to main
- `.github/workflows/web-ci.yml`: lint/test on PR
- Amplify Hosting connected to the repo for the frontend (Console step:
  connect GitHub repo in Amplify Console, confirm build settings)

Checkpoint: a trivial PR merge triggers both pipelines successfully.

## Phase 8 — Observability & cost guardrails

Goal: know when something breaks or costs money, before it's a surprise.

- `monitoring-stack.ts`: CloudWatch alarms (Step Functions failures, Lambda
  errors), confirm billing alarm from Phase 0 is still active
- Optional: X-Ray tracing across the Step Functions workflow

Checkpoint: intentionally break one Lambda, confirm the CloudWatch alarm fires.

## Phase 9 — Security pass

Goal: verify the security rules from the spec were actually followed, not
just designed.

- Audit every Lambda's IAM role — confirm least-privilege, no wildcard actions
- Confirm no secrets are hardcoded (Secrets Manager / SSM Parameter Store used)
- Confirm S3 (if used for recordings) is private + encrypted at rest
- Confirm API Gateway rejects unauthenticated requests

Checkpoint: security notes added to `docs/well-architected-notes.md`.

## Phase 10 — Well-Architected + diagram

Goal: portfolio-facing architecture artifact, built from what's actually deployed.

- Draw the final architecture diagram with official AWS Architecture Icons
  (now that real resources exist to point icons at)
- Fill in `docs/well-architected-notes.md` — map each of the 6 pillars to a
  concrete decision made during the build (not aspirational, actual)

## Phase 11 — Portfolio polish

Goal: this is presentable to a recruiter.

- `README.md`: what/why, architecture diagram, live demo link, tech stack, attribution
- Compile `docs/BUILD_LOG.md` entries into a coherent narrative — this is
  the raw material for an actual blog post about the build
- Record a short demo (screen recording or GIF) of the dashboard + a
  simulated escalation

## After this project

Once shipped: brainstorm + spec session for the second project (AI
Job-Match Engine), same process from the top.
