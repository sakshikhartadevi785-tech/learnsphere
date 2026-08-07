import { Category, Course, Enrollment, Instructor, Schedule } from '../models/index.js';
import { createRecord, deactivateRecord, listRecords, updateRecord } from '../services/catalogService.js';
import { ApiError } from '../utils/ApiError.js';

const configs = {
  categories: { Model: Category, sort: 'name' },
  instructors: { Model: Instructor, sort: 'name' },
  schedules: { Model: Schedule, sort: 'startDate', populate: { path: 'course', select: 'title code slug image' } }
};

function getConfig(type) {
  const config = configs[type];
  if (!config) throw new Error(`Unknown catalogue type: ${type}`);
  return config;
}


async function assertCanDeactivate(type, id) {
  if (type === 'categories') {
    const used = await Course.exists({ category: id, isActive: true });
    if (used) throw new ApiError(409, 'This category is linked to active courses and cannot be deactivated yet.');
  }
  if (type === 'instructors') {
    const used = await Course.exists({ instructor: id, isActive: true });
    if (used) throw new ApiError(409, 'This instructor is linked to active courses and cannot be deactivated yet.');
  }
  if (type === 'schedules') {
    const used = await Enrollment.exists({ schedule: id, status: { $in: ['pending', 'confirmed'] } });
    if (used) throw new ApiError(409, 'This schedule is linked to an active enrollment and cannot be deactivated.');
  }
}

async function validateSchedule(data, current = null) {
  const courseId = data.course ?? current?.course;
  const course = await Course.findOne({ _id: courseId, isActive: true });
  if (!course) throw new ApiError(400, 'The selected course does not exist or is inactive.');
  const startTime = data.startTime ?? current?.startTime;
  const endTime = data.endTime ?? current?.endTime;
  if (startTime >= endTime) throw new ApiError(400, 'Schedule end time must be later than the start time.');
}

export function list(type) {
  return async (req, res) => {
    const config = getConfig(type);
    const activeOnly = !(req.user?.role === 'admin' && req.query.includeInactive === 'true');
    const filter = type === 'schedules'
      ? { ...(req.query.course ? { course: req.query.course } : {}), ...(req.query.mode ? { mode: req.query.mode } : {}) }
      : {};
    const items = await listRecords(config.Model, { activeOnly, populate: config.populate, sort: config.sort, filter });
    res.json({ success: true, items });
  };
}

export function create(type) {
  return async (req, res) => {
    const config = getConfig(type);
    if (type === 'schedules') await validateSchedule(req.body);
    const item = await createRecord(config.Model, req.body);
    const populated = config.populate ? await config.Model.findById(item._id).populate(config.populate) : item;
    res.status(201).json({ success: true, message: `${config.Model.modelName} created successfully.`, item: populated });
  };
}

export function update(type) {
  return async (req, res) => {
    const config = getConfig(type);
    if (req.body.isActive === false) await assertCanDeactivate(type, req.params.id);
    if (type === 'schedules') {
      const current = await Schedule.findById(req.params.id);
      if (!current) throw new ApiError(404, 'Schedule record not found.');
      await validateSchedule(req.body, current);
    }
    const item = await updateRecord(config.Model, req.params.id, req.body, config.populate);
    res.json({ success: true, message: `${config.Model.modelName} updated successfully.`, item });
  };
}

export function remove(type) {
  return async (req, res) => {
    const config = getConfig(type);
    await assertCanDeactivate(type, req.params.id);
    const item = await deactivateRecord(config.Model, req.params.id);
    res.json({ success: true, message: `${config.Model.modelName} deactivated successfully.`, item });
  };
}
