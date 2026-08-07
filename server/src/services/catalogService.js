import { ApiError } from '../utils/ApiError.js';

export async function listRecords(Model, { activeOnly = true, populate = undefined, sort = 'name', filter = {} } = {}) {
  const databaseFilter = { ...filter, ...(activeOnly ? { isActive: true } : {}) };
  let query = Model.find(databaseFilter).sort(sort);
  if (populate) query = query.populate(populate);
  return query;
}

export async function createRecord(Model, data) {
  return Model.create(data);
}

export async function updateRecord(Model, id, data, populate = undefined) {
  let query = Model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (populate) query = query.populate(populate);
  const record = await query;
  if (!record) throw new ApiError(404, `${Model.modelName} record not found.`);
  return record;
}

export async function deactivateRecord(Model, id) {
  const record = await Model.findById(id);
  if (!record) throw new ApiError(404, `${Model.modelName} record not found.`);
  record.isActive = false;
  await record.save();
  return record;
}
