# Final submission checklist

Do not submit until every item is checked.

## Required files

- [ ] One ZIP file opens successfully.
- [ ] `README.md` is present at the ZIP root.
- [ ] Complete React client source is present.
- [ ] Complete Node/Express server source is present.
- [ ] All JSON database files are present in `/database`.
- [ ] `.env.example` files are present; real secrets are not included.
- [ ] Image credits are present.
- [ ] No `node_modules`, build cache or unrelated files are included.

## README and access

- [ ] Local installation commands were tested on a clean copy.
- [ ] Database seed command was tested.
- [ ] Admin and student demo credentials work.
- [ ] Live frontend/API URL has been added after deployment.
- [ ] Any hosting limitations are stated accurately.
- [ ] Database design justification and assumptions are included.

## Functionality

- [ ] Registration, login, session check and logout work.
- [ ] Course, category, instructor, schedule and fee pages load database data.
- [ ] Course search, filters, sort and pagination work.
- [ ] Basket add, schedule update, remove and persistence work.
- [ ] Checkout creates enrollments and reduces seats.
- [ ] Duplicate registration and zero-seat registration are blocked.
- [ ] Cancelling/restoring an enrollment changes available seats correctly.
- [ ] Administrator checkout is blocked.
- [ ] Student dashboard displays only the logged-in student's records.
- [ ] Administrator CRUD and workflow updates work.
- [ ] Contact form stores messages.
- [ ] Loading, empty, validation and server-error states are handled.

## Quality

- [ ] Automated API tests pass.
- [ ] Production React build passes.
- [ ] Browser console contains no errors.
- [ ] API terminal contains no unexpected errors.
- [ ] All internal links and images work.
- [ ] Passwords are not stored or returned as plain text.
- [ ] Student/admin route protection was tested directly through the API.
- [ ] All pages are responsive on mobile, tablet and desktop.
- [ ] Logo, header, footer, metadata, labels and alt text are present.

## Moodle

- [ ] Upload completes before the official Moodle deadline.
- [ ] Download the submitted ZIP from Moodle and open it.
- [ ] Retain an identical backup copy and submission receipt.
