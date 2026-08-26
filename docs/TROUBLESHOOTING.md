# Troubleshooting Log

Every fixed problem gets an entry here: title, why it happened, how it was
fixed. Per CLAUDE.md checkpoint/error-handling rules.

## IAM user denied access to Billing console

**Why:** AWS gates the Billing and Cost Management console behind a
root-only account setting (`IAM User and Role Access to Billing
Information`), separate from IAM policies. The `rafin-admin` IAM user had
`AdministratorAccess` attached but still got "You need permissions" when
opening Billing preferences — that policy doesn't cover billing visibility
by default.

**How fixed:** Signed in as root -> account menu -> **Account** -> **IAM
User and Role Access to Billing Information** -> **Edit** -> checked
**Activate IAM Access** -> **Update**. Signed back into `rafin-admin`;
Billing preferences and the CloudWatch billing alarm setup then worked
normally.
