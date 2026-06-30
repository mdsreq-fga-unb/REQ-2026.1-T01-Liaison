# Testing Policy — Risk-Based

Single source of truth for **what to test and what not to test**. All test
agents/skills (`/test-generator`, `/test-runner`, `/security-checker`) read
this before writing or gating tests.

**Goal is NOT 100% coverage.** Goal is tests on code where a bug costs a user
their hours, a broken certificate, or a leaked account. A test that only
re-asserts Django/DRF/React Native, or locks in an internal variable name, is
negative value — it costs tokens to write, breaks on every refactor, and
protects nothing. Skipping it is correct, not lazy.

The rule of gold: **test software the way a user uses it.** Student opens the
app, applies to a vaga, gets a certificate; org approves attendance. User does
not care about internal state, ORM querysets, or function names.

---

## 🚨 MUST test (high priority)

1. **Critical user journeys (happy path, integration via DRF APIClient / RNTL).**
   The flows where breakage = lost hours/certificate or product unusable.
   _Illustrative only (judge the actual diff, not this list):_ register/login
   (JWT issue), org `status=pending` → approved → can publish vaga, student
   applies to opportunity, attendance recorded, certificate issued + verifiable.
2. **Business logic & non-trivial rules (unit).**
   State machines, validations with branches, calculations of extension hours,
   anything with `if`/`@transaction.atomic`.
   _Illustrative only:_ role-based permission classes (`IsOrganizacao`,
   `IsAdminOrSelf`), org approval gate (RF06), attendance/certificate
   immutability (RNF08), serializer multi-object `save()` atomicity, hour totals.
3. **Shared UI primitives (unit/integration, RNTL).**
   A `Button`/`Input`/`Card` used across many screens — renders with the right
   props, fires the expected events (`onPress`). Break it → break every screen
   using it.
4. **Error handling (integration, mocked failures).**
   API 4xx/5xx or token expired (no auto-refresh) → user sees a friendly
   message, not a crash/white screen. Mock the failure and assert the fallback.
5. **Security boundaries.** Auth, permission enforcement on DRF (not only
   frontend), input validation at trust boundaries, ownership checks
   (`get_object_or_404(Model, id=x, owner=profile)`) — always tested, never
   skipped.

## 🛑 Do NOT test (waste)

1. **Third-party / framework code.** Don't test that Django saves a model, DRF
   serializes a field, simplejwt signs a token, `@react-navigation` changes a
   route, Expo renders a glyph. Trust the library. Test only *your* code's
   interaction with it.
2. **Implementation details.** Test the *result*, not how it's written. Test
   "submit → POST sent / certificate created", never the internal hook flag or
   queryset variable. Detail tests break on every refactor while the feature
   still works.
3. **Style in unit tests.** Don't assert "text is red" or "margin 16" with
   RNTL — fragile. Visual fidelity → manual / design review, not unit tests.
4. **Dumb/static components.** A screen that's only `<Text>`/static layout, a
   static footer. No logic, no interaction → test cost > value.
5. **Trivial one-liners / pure passthroughs.** A property that returns a field,
   a thin re-export, a model with no custom methods. YAGNI applies to tests too.

---

## Triage gate (run BEFORE writing any test)

Criticality is decided **dynamically, from the diff in front of you** — never
from a fixed checklist. For each changed file/symbol, judge what *this change*
does and write a concrete reason in the `Why` column (e.g. "parses untrusted
input", "shared by 12 screens", "guards the org-approval boundary"). A vague
reason ("important") means you haven't triaged — redo it. The categories above
are lenses for judging, not a list to match against.

For each changed file/symbol, classify:

```
| Symbol/File                 | Class      | Test? | Why                          |
|-----------------------------|------------|-------|------------------------------|
| IsOrganizacao permission    | security   | YES   | enforces role boundary       |
| org approval status gate    | biz-logic  | YES   | branchy, blocks publishing   |
| ApplicationSerializer.save  | biz-logic  | YES   | atomic multi-object create   |
| <FooterLinks> static        | dumb-ui    | NO    | no logic/interaction         |
| useFoo internal flag        | impl-detail| NO    | refactor-fragile, no value   |
```

Write tests ONLY for `YES` rows. Put the table in the test-generation output
so the gate is auditable. If everything classifies `NO`, write zero tests and
say so — that is a valid outcome.

## Coverage = signal, not gate

Coverage % is **informational**, never a blocking number. There is no global
80% gate (and no `pytest-cov` configured anyway). The gate is:

- **All written tests pass (zero failures).** Hard block.
- **Every MUST-test item above has a test.** Hard block.
- A low coverage % caused only by `NO`-class code is **PASS**, not a gap.

A "coverage gap" only matters if it lands on a MUST-test item.

---

## Test scope — DEFAULT rule (lean harness)

**Run only the test files created or modified in this task.**

```bash
# CORRECT — scope to new/changed files only
cd backend && pytest users/tests/test_permissions.py::TestIsOrganizacao
cd frontend && npm test -- ApplicationCard.test

# WRONG — full suite without explicit reason
cd backend && pytest
cd frontend && npm test
```

**Full suite is reserved for:**
- Pre-commit final gate (by `@committer`)
- Explicit "run full regression" request

Backend uses a **real Postgres test DB** (pytest-django, no SQLite). Reset it
with the command in CLAUDE.md § Dev commands if migrations drift.

**Testes não rodam no CI** (CI só faz deploy MkDocs) — rodar localmente antes
do PR. Pre-existing failures, if any, are documented in CLAUDE.md.
