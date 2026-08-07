import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { Category, ContactMessage, Course, Enrollment, Instructor, Schedule, User } from '../src/models/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.resolve(__dirname, '../../database');

async function readJson(filename) {
  const value = await fs.readFile(path.join(databaseDir, filename), 'utf8');
  return JSON.parse(value);
}

async function seed() {
  await connectDatabase();
  const [categories, instructors, courses, schedules, users, enrollments, messages] = await Promise.all([
    readJson('categories.json'),
    readJson('instructors.json'),
    readJson('courses.json'),
    readJson('schedules.json'),
    readJson('users.json'),
    readJson('enrollments.json'),
    readJson('contact-messages.json')
  ]);

  await Promise.all([
    Enrollment.deleteMany({}),
    ContactMessage.deleteMany({}),
    Schedule.deleteMany({}),
    Course.deleteMany({}),
    Category.deleteMany({}),
    Instructor.deleteMany({}),
    User.deleteMany({})
  ]);

  await Category.insertMany(categories);
  await Instructor.insertMany(instructors);
  await User.insertMany(users);
  await Course.insertMany(courses);
  await Schedule.insertMany(schedules);
  await Enrollment.insertMany(enrollments);
  await ContactMessage.insertMany(messages);

  await Promise.all([
    Category.syncIndexes(),
    Instructor.syncIndexes(),
    User.syncIndexes(),
    Course.syncIndexes(),
    Schedule.syncIndexes(),
    Enrollment.syncIndexes(),
    ContactMessage.syncIndexes()
  ]);

  console.log('LearnSphere database seeded successfully and indexes synchronised.');
  console.log('Admin: admin@learnsphere.test / Admin123!');
  console.log('Student: student@learnsphere.test / Student123!');
}

seed()
  .catch((error) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
