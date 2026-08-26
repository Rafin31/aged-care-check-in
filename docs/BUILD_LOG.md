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
