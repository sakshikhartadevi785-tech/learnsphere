# How to Add Courses and Instructors

You have **TWO methods** to add courses and instructors to your LearnSphere application:

---

## Method 1: Using the Admin Interface (UI) ✨ RECOMMENDED

This is the easiest way for non-technical users to manage content.

### Step 1: Login as Admin

1. Go to your app: https://learnsphere-client-eta.vercel.app
2. Click **Login**
3. Use admin credentials:
   - **Email**: `admin@learnsphere.test`
   - **Password**: `Admin123!`

### Step 2: Access Admin Panel

1. After logging in, you'll see an **Admin** link in the navigation
2. Click **Admin** to access the management console

### Step 3: Add an Instructor First

Courses require an instructor, so create instructors first:

1. In the Admin panel, click the **Instructors** tab
2. Fill out the form:
   - **Name**: Full name (e.g., "Dr. John Smith")
   - **Professional Title**: Job title (e.g., "Senior Lecturer in Data Science")
   - **Specialisation**: Area of expertise (e.g., "Data Science")
   - **Email**: Contact email
   - **Biography**: Short bio (minimum 20 characters)
   - **Image Path**: Use an existing image path like `/images/instructor-training.png`
   - **Active**: Check this box ✓
3. Click **Create instructor**

**Available Images:**
- `/images/instructor-training.png`
- `/images/business-workshop.png`
- `/images/lecture-hall.png`
- `/images/student-laptop.png`

### Step 4: Add a Category (if needed)

1. Click the **Categories** tab
2. Fill out the form:
   - **Name**: Category name (e.g., "Data Science")
   - **Slug**: URL-friendly version (e.g., "data-science")
   - **Description**: Brief description
   - **Image Path**: Use `/images/course-tech.png` or similar
   - **Active**: Check this box ✓
3. Click **Create category**

### Step 5: Add a Course

1. Click the **Courses** tab
2. Fill out the comprehensive form:

**Basic Information:**
- **Title**: Course name (e.g., "Python for Data Science")
- **Slug**: URL-friendly version (e.g., "python-data-science")
- **Course Code**: Unique code (e.g., "LS-DS-101")
- **Level**: Select from Starter, Beginner, Intermediate, Advanced

**References:**
- **Category**: Select from dropdown
- **Instructor**: Select from dropdown

**Scheduling & Pricing:**
- **Duration (weeks)**: Number (e.g., 10)
- **Fee (£)**: Price (e.g., 450.00)
- **Capacity**: Total seats (e.g., 25)
- **Available Seats**: Current availability (e.g., 25)

**Content:**
- **Image Path**: Use an existing image
- **Short Description**: 20-260 characters
- **Full Description**: 40-3000 characters
- **Learning Outcomes**: One per line, e.g.:
  ```
  Understand Python fundamentals
  Analyze data with pandas
  Create visualizations with matplotlib
  Build predictive models
  ```

**Options:**
- **Featured Course**: ✓ to show on homepage
- **Active**: ✓ to make visible

3. Click **Create course**

**Available Course Images:**
- `/images/course-tech.png`
- `/images/course-business.png`
- `/images/course-design.png`
- `/images/course-management.png`
- `/images/course-online.png`
- `/images/course-evening.png`

### Step 6: Add Schedule (Optional)

1. Click the **Schedules** tab
2. Fill out the form:
   - **Course**: Select your course
   - **Mode**: Online, On campus, or Weekend
   - **Teaching Days**: Comma-separated (e.g., "Monday, Wednesday")
   - **Start Date**: YYYY-MM-DD format
   - **Start Time**: HH:MM format (e.g., 18:00)
   - **End Time**: HH:MM format (e.g., 20:00)
   - **Location**: Venue or "LearnSphere Live Classroom"
   - **Active**: Check this box ✓
3. Click **Create schedule**

---

## Method 2: Using Database Seed (For Bulk Import)

This method is useful for importing multiple records at once or resetting the database.

### Step 1: Edit JSON Files Locally

Navigate to the `database/` folder and edit these files:

#### Add Instructor (`database/instructors.json`):

```json
{
  "_id": "66a200000000000000000005",
  "name": "Dr. John Smith",
  "title": "Senior Lecturer in Data Science",
  "biography": "John has 15 years of experience in data analytics and machine learning...",
  "specialisation": "Data Science",
  "email": "john.smith@learnsphere.example",
  "image": "/images/instructor-training.png",
  "isActive": true
}
```

**Important:** Generate a unique 24-character MongoDB ObjectId (use pattern: `66a2000000000000000000XX`)

#### Add Course (`database/courses.json`):

```json
{
  "_id": "66a300000000000000000007",
  "title": "Python for Data Science",
  "slug": "python-data-science",
  "code": "LS-DS-101",
  "shortDescription": "Learn Python programming for data analysis and visualization.",
  "description": "Comprehensive introduction to Python for data science...",
  "category": "66a100000000000000000001",
  "instructor": "66a200000000000000000005",
  "durationWeeks": 10,
  "level": "Beginner",
  "fee": 450,
  "image": "/images/course-tech.png",
  "capacity": 25,
  "availableSeats": 25,
  "learningOutcomes": [
    "Understand Python fundamentals",
    "Analyze data with pandas",
    "Create visualizations with matplotlib",
    "Build predictive models"
  ],
  "isFeatured": true,
  "isActive": true
}
```

**Note:** Make sure `category` and `instructor` reference valid IDs from those collections.

### Step 2: Run Seed Command Locally

```bash
npm run seed
```

This will:
- Clear existing data
- Import all JSON files
- Create the default admin and student accounts

**Warning:** This deletes all existing enrollments and data!

### Step 3: Run Seed on Railway (Production)

⚠️ **CAUTION**: This will wipe your production database!

In Railway:
1. Go to your service
2. Click **Settings** → **Deploy**
3. Add a one-time command:
   ```bash
   npm run seed
   ```

Or connect via Railway CLI:
```bash
railway run npm run seed
```

---

## Existing Test Accounts

After seeding, these accounts are available:

**Admin Account:**
- Email: `admin@learnsphere.test`
- Password: `Admin123!`

**Student Account:**
- Email: `student@learnsphere.test`
- Password: `Student123!`

---

## Tips & Best Practices

### Image Management
- Use existing placeholder images in `/images/`
- For custom images, add them to `client/public/images/`
- Reference them as `/images/your-image.png`

### Slugs
- Must be URL-friendly (lowercase, hyphens, no spaces)
- Must be unique per collection
- Example: "Python for Data Science" → "python-data-science"

### Course Codes
- Use consistent format: `LS-[DEPT]-[NUMBER]`
- Examples: `LS-WEB-101`, `LS-BUS-210`, `LS-DS-101`

### Pricing
- Enter as decimal: `450` or `450.00`
- Displayed as currency (£450.00) automatically

### Learning Outcomes
- Keep concise and measurable
- Start with action verbs (Understand, Create, Analyze, Build)
- 3-6 outcomes per course recommended

### Capacity Management
- Set realistic capacity based on mode
- Online: 30-40 students
- On campus: 20-25 students
- Workshop: 10-15 students

---

## Troubleshooting

### "Cannot create course - Category not found"
**Fix:** Create the category first, then create the course

### "Cannot create course - Instructor not found"
**Fix:** Create the instructor first, then create the course

### Changes not appearing on site
**Fix:** 
1. Check that **Active** checkbox is checked
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check the **Courses** page directly

### Images not loading
**Fix:** Make sure the image path starts with `/images/` and the file exists in `client/public/images/`

---

## Quick Start Example

Want to add a course right now? Follow this quick example:

1. **Login as admin** (admin@learnsphere.test / Admin123!)
2. **Go to Admin panel**
3. **Add Instructor**:
   - Name: "Dr. Sarah Johnson"
   - Title: "AI Research Lead"
   - Specialisation: "Artificial Intelligence"
   - Email: "sarah.j@learnsphere.example"
   - Biography: "Sarah specializes in machine learning and neural networks with 10+ years experience."
   - Image: `/images/student-laptop.png`
   - Active: ✓
4. **Add Course**:
   - Title: "Introduction to AI"
   - Slug: "intro-to-ai"
   - Code: "LS-AI-101"
   - Select your new instructor
   - Select "Technology" category
   - Duration: 12 weeks
   - Fee: 500
   - Capacity: 30
   - Available Seats: 30
   - Level: Intermediate
   - Add descriptions and outcomes
   - Featured: ✓
   - Active: ✓
5. **Check the homepage** - Your featured course should appear!

That's it! Your course is now live. 🎉
