# LearnSphere API endpoints

All endpoints are prefixed with `/api`. JSON requests must use `Content-Type: application/json`. Browser requests include session cookies using `credentials: include`.

## Health

- `GET /health` — service and database status.

## Authentication and session

- `POST /auth/register` — create a student account and session.
- `POST /auth/login` — validate credentials and create a session.
- `GET /auth/session` — return the current authenticated user.
- `POST /auth/logout` — destroy the session and clear its cookie.

## Courses

- `GET /courses` — paginated public catalogue; supports `search`, `category`, `level`, `minFee`, `maxFee`, `sort`, `featured`, `page`, `limit`.
- `GET /courses/:id-or-slug` — populated course details.
- `POST /courses` — administrator creates a course.
- `PUT /courses/:id` — administrator updates a course.
- `DELETE /courses/:id` — administrator deactivates a course and its schedules.

## Categories, instructors and schedules

Each resource supports:

- `GET /<resource>` — public active records.
- `POST /<resource>` — administrator create.
- `PUT /<resource>/:id` — administrator update.
- `DELETE /<resource>/:id` — administrator safe deactivation.

Schedule lists additionally support `course` and `mode` filters.

## Session basket

- `GET /basket` — populated session basket.
- `POST /basket/items` — add one course and optional schedule.
- `PATCH /basket/items/:courseId` — select or change the course schedule.
- `DELETE /basket/items/:courseId` — remove a course.
- `DELETE /basket` — clear the basket.

## Enrollments

- `POST /enrollments/checkout` — authenticated checkout, enrolment creation and seat reduction.
- `GET /enrollments/mine` — current user's registrations.
- `GET /enrollments/dashboard` — current user's dashboard summary and registrations.

## Contact

- `POST /contact` — validate and store an admissions enquiry.

## Administrator

- `GET /admin/analytics` — totals, revenue, statuses, low seats and popular courses.
- `GET /admin/reference-data` — full catalogue data for the management console.
- `GET /admin/enrollments` — all populated enrolments.
- `PATCH /admin/enrollments/:id` — update status, payment, progress or attendance.
- `GET /admin/messages` — all admissions messages.
- `PATCH /admin/messages/:id` — update message workflow status.
