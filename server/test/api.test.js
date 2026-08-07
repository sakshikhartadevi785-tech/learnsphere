import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Category, ContactMessage, Course, Enrollment, Instructor, Schedule, User } from '../src/models/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.resolve(__dirname, '../../database');
let mongo;
let app;

async function json(name) {
  return JSON.parse(await fs.readFile(path.join(databaseDir, name), 'utf8'));
}

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.SESSION_SECRET = 'automated-test-session-secret';
  process.env.CLIENT_URL = 'http://localhost:5173';
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
  await Category.insertMany(await json('categories.json'));
  await Instructor.insertMany(await json('instructors.json'));
  await User.insertMany(await json('users.json'));
  await Course.insertMany(await json('courses.json'));
  await Schedule.insertMany(await json('schedules.json'));
  await Enrollment.insertMany(await json('enrollments.json'));
  await ContactMessage.insertMany(await json('contact-messages.json'));
  app = createApp();
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('LearnSphere API', () => {
  it('reports a healthy database connection', async () => {
    const response = await request(app).get('/api/health').expect(200);
    assert.equal(response.body.database, 'connected');
  });

  it('populates courses with category and instructor records', async () => {
    const response = await request(app).get('/api/courses?limit=10').expect(200);
    assert.equal(response.body.items.length, 6);
    assert.equal(response.body.items[0].category.name.length > 0, true);
    assert.equal(response.body.items[0].instructor.name.length > 0, true);
  });

  it('maintains login and basket state in a server session', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: 'student@learnsphere.test', password: 'Student123!' }).expect(200);
    const session = await agent.get('/api/auth/session').expect(200);
    assert.equal(session.body.authenticated, true);

    await agent.post('/api/basket/items').send({ courseId: '66a300000000000000000003', scheduleId: '66a400000000000000000003' }).expect(201);
    const basket = await agent.get('/api/basket').expect(200);
    assert.equal(basket.body.basket.count, 1);
    assert.equal(basket.body.basket.items[0].course.title, 'UX/UI Design Studio');
  });

  it('creates an enrollment and reduces the available seat count', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: 'student@learnsphere.test', password: 'Student123!' }).expect(200);
    await agent.post('/api/basket/items').send({ courseId: '66a300000000000000000004', scheduleId: '66a400000000000000000004' }).expect(201);
    const beforeCourse = await Course.findById('66a300000000000000000004');
    const response = await agent.post('/api/enrollments/checkout').expect(201);
    const afterCourse = await Course.findById('66a300000000000000000004');
    assert.equal(response.body.enrollments.length, 1);
    assert.equal(afterCourse.availableSeats, beforeCourse.availableSeats - 1);
    assert.equal(await Enrollment.countDocuments({ student: '66a500000000000000000002', course: '66a300000000000000000004' }), 1);
  });

  it('protects admin CRUD and allows an administrator to create, update and deactivate a course', async () => {
    const student = request.agent(app);
    await student.post('/api/auth/login').send({ email: 'student@learnsphere.test', password: 'Student123!' }).expect(200);
    await student.post('/api/courses').send({}).expect(403);

    const admin = request.agent(app);
    await admin.post('/api/auth/login').send({ email: 'admin@learnsphere.test', password: 'Admin123!' }).expect(200);
    const created = await admin.post('/api/courses').send({
      title: 'Test Quality Course', slug: 'test-quality-course', code: 'LS-TST-999',
      shortDescription: 'A complete temporary course record for automated CRUD verification.',
      description: 'This course is created by the automated API test to verify protected create, update and deactivate operations.',
      category: '66a100000000000000000001', instructor: '66a200000000000000000001',
      durationWeeks: 5, level: 'Beginner', fee: 199, image: '/images/course-tech.png', capacity: 10, availableSeats: 10,
      learningOutcomes: ['Verify a protected CRUD workflow.'], isFeatured: false, isActive: true
    }).expect(201);
    const id = created.body.course._id;
    const updated = await admin.put(`/api/courses/${id}`).send({ fee: 210, availableSeats: 9 }).expect(200);
    assert.equal(updated.body.course.fee, 210);
    const removed = await admin.delete(`/api/courses/${id}`).expect(200);
    assert.equal(removed.body.course.isActive, false);
  });

  it('keeps course seats consistent when an administrator cancels and restores an enrollment', async () => {
    const admin = request.agent(app);
    await admin.post('/api/auth/login').send({ email: 'admin@learnsphere.test', password: 'Admin123!' }).expect(200);

    const enrollmentId = '66a600000000000000000001';
    const courseId = '66a300000000000000000001';
    const before = await Course.findById(courseId);

    await admin.patch(`/api/admin/enrollments/${enrollmentId}`).send({ status: 'cancelled' }).expect(200);
    const afterCancellation = await Course.findById(courseId);
    assert.equal(afterCancellation.availableSeats, before.availableSeats + 1);

    await admin.patch(`/api/admin/enrollments/${enrollmentId}`).send({ status: 'confirmed' }).expect(200);
    const afterRestoration = await Course.findById(courseId);
    assert.equal(afterRestoration.availableSeats, before.availableSeats);
  });

  it('prevents administrator checkout and impossible course seat values', async () => {
    const admin = request.agent(app);
    await admin.post('/api/auth/login').send({ email: 'admin@learnsphere.test', password: 'Admin123!' }).expect(200);
    await admin.post('/api/enrollments/checkout').expect(403);
    await admin.put('/api/courses/66a300000000000000000001').send({ availableSeats: 30 }).expect(409);
  });

  it('validates and saves a contact message', async () => {
    await request(app).post('/api/contact').send({ name: 'A', email: 'bad', subject: 'x', message: 'short' }).expect(400);
    const response = await request(app).post('/api/contact').send({
      name: 'API Test User', email: 'api-test@example.com', subject: 'Testing admissions message storage',
      message: 'This valid contact message verifies that submitted enquiries are saved in the MongoDB collection.'
    }).expect(201);
    assert.equal(response.body.item.status, 'new');
  });
});
