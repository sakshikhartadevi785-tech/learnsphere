# LearnSphere D2 validation report

**Validation date:** 5 August 2026  
**Status:** Complete first build; static validation passed; runtime and hosted deployment validation still required before Moodle submission.

## Checks completed successfully

- All 41 server JavaScript files passed Node.js syntax checking.
- All 32 client JavaScript/JSX files passed parse-only syntax checking.
- All 11 JSON files and both YAML files parsed successfully.
- 203 relative JavaScript imports were checked and resolved to existing local files.
- All 13 client images referenced by database records exist.
- All 48 supplied database records use valid ObjectId values.
- Every course/category/instructor/schedule/user/enrollment reference resolves to an existing record.
- Unique email, slug, code, registration-reference and student-course values were checked.
- Course `availableSeats` values match capacity minus seat-holding enrollments.
- Demonstration administrator and student password hashes were verified against the documented credentials.
- No real `.env` file or `node_modules` directory is present in the submission tree.
- Server-managed basket, authentication, checkout, CRUD and contact-message paths have automated test coverage in `server/test/api.test.js`.

## Runtime checks still required

This build environment could not reach the public npm registry (`EAI_AGAIN` DNS/network failure), so dependencies could not be installed here. Consequently, the following must be completed on the student's computer before submission:

1. Run `npm install` from the project root.
2. Start MongoDB and run `npm run seed`.
3. Run `npm test`.
4. Run `npm run build`.
5. Run both development servers and complete every manual test in `docs/TEST_PLAN.md`.
6. Deploy the application, test the remote URLs and replace the README deployment placeholders.
7. Recreate the final ZIP only after all runtime tests pass.

Do not treat this report as evidence that the application has already been executed or deployed. It records only the checks that were actually possible in the build environment.
