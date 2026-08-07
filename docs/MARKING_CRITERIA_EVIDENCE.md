# Deliverable 2 marking-criteria evidence

The brief contains two descriptions of the final 10%: the summary refers to deployment, while the detailed task and rubric refer to responsive design. The project therefore supplies evidence for **both**.

## Database design and inter-related tables/collections

Evidence:

- Seven purposeful data collections plus MongoDB-backed sessions.
- Mongoose schemas with correct types, required fields, enum validation, numeric limits and timestamps.
- ObjectId references linking categories, instructors, courses, schedules, students and enrollments.
- Primary, unique, compound and query indexes.
- Service-level reference and cross-field validation.
- Safe deactivation to preserve history.
- Importable JSON data in `/database`.
- Automated seed command.
- Design justification, assumptions and ER diagram in `docs/DATABASE_DESIGN.md`.

## Data populated to the website

Evidence:

- Home featured courses, full course catalogue, course details, categories, instructors, schedule and fees are API-driven.
- Search, category, level, sort and pagination operate on server queries.
- Student dashboard displays authenticated user records.
- Admin tables display populated category, instructor, course, schedule, student and contact references.
- Loading, empty and error states are implemented.
- Formatting uses GBP and UK dates.

## Server-side code and database updates

Evidence:

- Routes → controllers → services → models separation.
- Account registration, login, persistent session check and logout.
- Salted scrypt password hashing and protected role middleware.
- Server-managed session basket with add, read, update, remove and clear operations.
- Registration validates schedules, prevents duplicates, creates enrollments and reduces seats.
- Rollback restores seats and removes partial records on checkout failure.
- Complete administrator CRUD for courses, categories, instructors and schedules.
- Enrollment, payment, progress, attendance and message-status updates. Enrollment cancellation/restoration also keeps the linked course seat count consistent.
- Central validation, HTTP status codes and error middleware.
- Security headers, CORS, rate limits and HTTP-only cookies.
- Automated API tests in `server/test/api.test.js`.

## Responsive design

Evidence:

- Responsive header, mobile navigation, logo and footer.
- Course, category, instructor, dashboard and administration grids adapt across breakpoints.
- Forms change from two columns to one.
- Data tables remain usable with horizontal scroll on small devices.
- Basket and details sidebars become normal-flow sections.
- Mobile touch targets, focus styles, skip link, labels and image alternative text.
- Page-specific titles, description metadata and viewport metadata.

## Deployment

Evidence:

- Production server can serve the built React application.
- Root multi-stage `Dockerfile`.
- `docker-compose.yml` for application plus MongoDB and a one-time seed service.
- `render.yaml` deployment template.
- Environment examples and complete deployment instructions.
- Health-check endpoint.

A live URL still requires the student's own hosting and MongoDB credentials; add those to the README before final submission.
