# LearnSphere — Online Course Registration

**Module:** CMP7246 Web Application Development  
**Assessment:** Design and Development of a Web Application  
**Deliverable:** Deliverable 2 — Server-side Project  
**Technology:** MongoDB, Express.js, React.js and Node.js (MERN)

## Project description

LearnSphere is a complete online course registration application developed from the Deliverable 1 client-side website. Deliverable 2 incrementally improves that design with a React interface, Node/Express API, MongoDB database, authenticated sessions, a server-managed course basket, registration processing, seat updates and administrator CRUD operations.

The application demonstrates the required interchange of data between website and database. Public pages populate course, category, instructor, schedule and fee information from MongoDB. Student actions create enrolment records and reduce the relevant course's available seats. Protected administrator actions create, read, update and safely deactivate catalogue records.

## Main functionality

### Public visitor

- Responsive home, courses, categories, schedule, instructors, fees, FAQ, about and contact pages.
- Course search, category and level filters, fee sorting and pagination.
- Populated course detail pages with instructor and schedule references.
- Add courses to a server-side session basket before login.
- Select a valid schedule for each chosen course.
- Submit an admissions message that is validated and saved to MongoDB.

### Student

- Create an account with server-side validation.
- Password stored as a unique salted scrypt hash, never plain text.
- Login, persistent session check and logout.
- Confirm course registration from the session basket.
- Duplicate-course and unavailable-seat prevention.
- Enrolment creation using the current database fee.
- Automatic reduction of `availableSeats` after successful registration.
- Personal dashboard containing registration references, schedules, payment state, progress and attendance.

### Administrator

- Protected role-based administration console.
- Analytics for students, courses, registrations, revenue, statuses, popular courses, low seats and new messages.
- Create, read, update and deactivate courses.
- Create, read, update and deactivate categories, instructors and schedules.
- Update enrolment, payment, progress and attendance values; cancelling/restoring an enrolment releases/reserves its linked course seat safely.
- Review admissions messages and update their workflow status.
- Server-side reference and relationship validation.

## Project structure

```text
learnsphere-course-registration-d2/
├── README.md
├── package.json
├── Dockerfile
├── docker-compose.yml
├── render.yaml
├── client/
│   ├── public/images/
│   ├── src/components/
│   ├── src/contexts/
│   ├── src/pages/
│   ├── src/services/
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/config/
│   ├── src/controllers/
│   ├── src/middleware/
│   ├── src/models/
│   ├── src/routes/
│   ├── src/services/
│   ├── seed/seed.js
│   ├── test/api.test.js
│   ├── .env.example
│   └── package.json
├── database/
│   ├── users.json
│   ├── categories.json
│   ├── instructors.json
│   ├── courses.json
│   ├── schedules.json
│   ├── enrollments.json
│   └── contact-messages.json
└── docs/
    ├── DATABASE_DESIGN.md
    ├── API_ENDPOINTS.md
    ├── MARKING_CRITERIA_EVIDENCE.md
    ├── TEST_PLAN.md
    ├── DEPLOYMENT.md
    ├── SUBMISSION_CHECKLIST.md
    ├── VALIDATION_REPORT.md
    ├── database-erd.svg / database-erd.png
    └── IMAGE-CREDITS.txt
```

## Local installation and running

### Prerequisites

- Node.js 20 or later.
- npm 10 or later.
- MongoDB Community Server, MongoDB Atlas, or Docker.

### 1. Extract and install

Open a terminal in the project root:

```bash
npm install
```

This root workspace command installs the client and server dependencies.

### 2. Configure the server

Copy the example environment file:

**Windows PowerShell**

```powershell
Copy-Item server/.env.example server/.env
```

**macOS/Linux**

```bash
cp server/.env.example server/.env
```

Default local values:

```text
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/learnsphere
SESSION_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
TRUST_PROXY=0
```

Replace `SESSION_SECRET` with a long random value. For MongoDB Atlas, replace `MONGODB_URI` with the Atlas connection string.

### 3. Seed the database

Ensure MongoDB is running, then execute:

```bash
npm run seed
```

The seed script imports all JSON files from `/database` in the correct relationship order.

### 4. Start the API

In terminal 1:

```bash
npm run dev:server
```

Expected address: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### 5. Start the React application

In terminal 2:

```bash
npm run dev:client
```

Open `http://localhost:5173`.

### Production build

```bash
npm run build
NODE_ENV=production npm start
```

On Windows PowerShell:

```powershell
$env:NODE_ENV="production"
npm start
```

The Express server serves the generated React files from `client/dist` in production.

## Demonstration accounts

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@learnsphere.test` | `Admin123!` |
| Student | `student@learnsphere.test` | `Student123!` |

These credentials are coursework demonstration data. Change them before leaving a public deployment online for an extended period.

## Remote access

Add the final values after deployment:

```text
Live application URL: [ADD AFTER DEPLOYMENT]
API health URL:       [ADD AFTER DEPLOYMENT]/api/health
Administrator access: admin@learnsphere.test / Admin123!
Student access:       student@learnsphere.test / Student123!
```

Deployment instructions are provided in `docs/DEPLOYMENT.md`.

## Database design summary

Collections:

- `users`
- `categories`
- `instructors`
- `courses`
- `schedules`
- `enrollments`
- `contactmessages`
- `sessions` generated at runtime

Principal relationships:

```text
Category 1 ─── many Courses
Instructor 1 ─── many Courses
Course 1 ─── many Schedules
User 1 ─── many Enrollments
Course 1 ─── many Enrollments
Schedule 1 ─── many Enrollments
```

The enrolment collection resolves the student/course many-to-many relationship and stores registration-specific data. Full justification, constraints, indexes, optimisation and assumptions are documented in `docs/DATABASE_DESIGN.md`. A visual relationship diagram is included as `docs/database-erd.svg`.

## Important registration logic

When a student confirms the basket, the server:

1. Requires an authenticated session.
2. Rejects an empty basket.
3. Confirms every selected schedule belongs to its course.
4. Rejects an existing registration for the same student and course.
5. Atomically reduces a course seat only when at least one seat remains.
6. Creates the enrolment using the current database fee.
7. Restores seats and removes partial records if a later item fails.
8. Clears the basket only when all registrations succeed.
9. Restricts checkout to student accounts; administrator accounts remain management-only.

Example:

```text
Available seats before confirmation: 8
Student confirms one registration:   1
Available seats after confirmation:  7
```

## Validation and security

- HTTP-only session cookie with configurable `Secure` and `SameSite` settings.
- MongoDB session store outside tests.
- Role-based route protection.
- Salted scrypt password hashing using Node's cryptographic library.
- Request validation with `express-validator`.
- Correct 400, 401, 403, 404, 409, 500 and 503 responses.
- Central error middleware.
- Helmet security headers.
- CORS allow-list and credential support.
- Authentication and contact-form rate limiting.
- Password hashes excluded from normal queries and API responses.
- Admin-only catalogue and management write routes.
- Student-only checkout route.
- Seat-count invariants enforced during course edits and enrolment-status changes.

## Testing

Install dependencies first, then run:

```bash
npm test
npm run build
npm --workspace server run test:syntax
```

The automated suite uses an isolated in-memory MongoDB instance. A detailed manual test script is in `docs/TEST_PLAN.md`, and `docs/LearnSphere.postman_collection.json` provides repeatable API requests.

## API summary

Key routes:

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/session
POST   /api/auth/logout

GET    /api/courses
GET    /api/courses/:id-or-slug
POST   /api/courses                 admin
PUT    /api/courses/:id             admin
DELETE /api/courses/:id             admin

GET    /api/basket
POST   /api/basket/items
PATCH  /api/basket/items/:courseId
DELETE /api/basket/items/:courseId

POST   /api/enrollments/checkout    authenticated
GET    /api/enrollments/dashboard   authenticated

GET    /api/admin/analytics         admin
GET    /api/admin/enrollments       admin
PATCH  /api/admin/enrollments/:id   admin
```

The complete endpoint list is in `docs/API_ENDPOINTS.md`.

## Responsive design and accessibility

- Responsive layouts for mobile, tablet and desktop.
- Mobile navigation, responsive cards, forms, basket, dashboard and admin area.
- Scrollable table containers on narrow screens.
- Logo, header and footer across all pages.
- Skip-to-content link and visible keyboard focus.
- Semantic headings, form labels, button names and meaningful image alternative text.
- Page-specific document titles and description metadata.
- Loading, empty, success and error messages.

## Assumptions

- One seat is reserved per student for each course.
- A student cannot register for the same course twice.
- Payment is simulated; the project does not process or store real card data.
- The database course fee is authoritative at checkout.
- Historical enrolments must remain valid when catalogue records are deactivated.
- Progress and attendance are demonstration values maintained by an administrator.
- GBP and UK date formats are used.

## Submission preparation

Before uploading to Moodle:

1. Follow `docs/TEST_PLAN.md` on a clean copy.
2. Deploy the project and replace the remote-access placeholders above.
3. Complete every item in `docs/SUBMISSION_CHECKLIST.md`.
4. Remove `node_modules`, `.env`, logs and build caches.
5. ZIP the single project folder.
6. Download the submitted ZIP from Moodle and confirm it opens.

## Image acknowledgement

Image source information from Deliverable 1 is retained in `docs/IMAGE-CREDITS.txt`.
