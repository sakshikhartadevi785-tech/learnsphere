# LearnSphere test plan

## Automated server tests

Run `npm test` from the project root. The suite uses `mongodb-memory-server` and checks:

1. Health endpoint and database connection.
2. Course population with related category and instructor data.
3. Login and persistent session state.
4. Session basket creation and retrieval.
5. Checkout creates an enrollment and reduces available seats.
6. Cancelling and restoring an enrollment releases and re-reserves the seat.
7. Administrator accounts cannot use student checkout.
6. Student access to admin writes is rejected.
7. Administrator course create, update and deactivate operations.
8. Invalid contact input is rejected and valid input is stored.

## Build tests

- `npm run build` must complete without React/Vite errors.
- `npm --workspace server run test:syntax` checks server entry-point syntax.
- Open browser developer tools and confirm no console errors or failed network requests.

## Manual functional test script

### Public catalogue

- Open home, courses, categories, schedule, instructors and fees.
- Search for `web`; filter category and level; sort by fee.
- Open every course details page.
- Confirm loading, empty and error states are readable.

### Session basket

- Add UX/UI Design Studio.
- Navigate away and return; confirm it remains in the basket.
- Attempt to add it again; confirm duplicate prevention.
- Select its valid schedule.
- Remove and add it again.

### Authentication

- Register a new account using a unique email.
- Confirm weak passwords and invalid email addresses are rejected.
- Refresh after login; confirm the session remains.
- Log out; confirm the dashboard is protected.

### Registration and database update

- Record the selected course's available-seat value.
- Log in as a student and confirm registration.
- Confirm a registration reference is displayed.
- Return to the course and confirm the available-seat value reduced by one.
- Confirm the registration appears in the student's dashboard.
- Attempt the same course again and confirm duplicate registration is rejected.

### Administrator

Log in with `admin@learnsphere.test / Admin123!` and test:

- Create, read, update and deactivate a temporary course.
- Create and edit a temporary category, instructor and schedule.
- Verify linked fields show correct names rather than raw IDs.
- Change enrollment status, payment status, progress and attendance. Confirm that cancelling raises the course available-seat count by one and restoring the enrollment lowers it by one.
- Change contact message status.
- Confirm dashboard totals and low-seat data update.
- Confirm a student account cannot open or call administrator operations.

### Responsive and accessibility

Test at 320, 375, 430, 768, 1024 and 1440 CSS pixels:

- No page-level horizontal overflow.
- Navigation opens and closes by keyboard and touch.
- Header, logo and footer are visible and consistent.
- Forms, basket, dashboard and admin controls remain usable.
- Tables scroll inside their containers.
- Tab through links and controls; focus remains visible.
- Activate the skip link.
- Check labels and alternative text with browser accessibility tools.

### Submission reproduction

- Copy the ZIP to another folder/computer.
- Follow only README instructions.
- Install dependencies, seed MongoDB, start both services and repeat the core flow.
- Confirm no secret `.env` file or `node_modules` directory is inside the ZIP.
