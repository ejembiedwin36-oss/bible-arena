# Bible Arena — Idoma Reviewer Onboarding

## Purpose

Idoma voice samples require human native-language review before they can become ASR training/evaluation data. Reviewer privileges are security-sensitive and must never be self-assigned from the browser.

## Roles

### Reviewer
A reviewer listens to an unverified Idoma recording and checks the exact words spoken. The reviewer records the native transcript and intended meaning separately, and can mark the sample `native_reviewed` or reject it.

### Validator
A validator performs the second quality gate. Validators inspect samples that already completed native review. They may validate or reject a sample. Validation alone does not automatically make a sample ASR eligible; the remaining consent, speaker, dataset-split, and eligibility checks still apply.

## Qualification guidance

Before granting either role, the project administrator should confirm that the person:
- is genuinely competent in spoken Idoma;
- can read/write the project's agreed Idoma transcription convention once established;
- understands that the transcript records what was actually spoken rather than a corrected/preferred sentence;
- understands privacy expectations around voice recordings;
- agrees not to download, redistribute, or reuse contributor recordings outside the approved workflow.

For the pilot, prefer a small trusted reviewer group. Do not grant validator access merely because someone can sign in to Bible Arena.

## Secure role assignment

Reviewer/validator assignment is an administrative operation. The live database exposes service-role-only RPCs for assignment and deactivation. Browser clients and ordinary authenticated users cannot execute them.

Required inputs are the existing Bible Arena user UUID, language code (`id` for Idoma), and either `reviewer` or `validator`.

Do not place the Supabase service-role key in the web application, GitHub source, screenshots, or reviewer instructions.

## Separation of duties

For stronger pilot quality, use different people for first review and final validation when practical. The database role checks remain the authoritative permission boundary even though the UI also separates reviewer and validator actions.

## Offboarding

When a reviewer or validator should no longer have access, deactivate the specific language role. Do not delete historical review results simply because access was removed; review history is part of the dataset audit trail.

## Pilot readiness

Before accepting the first real Idoma recording for review, confirm at least one trusted Idoma reviewer and one trusted Idoma validator have signed-in Bible Arena accounts and have been intentionally assigned their roles by an administrator.