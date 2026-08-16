import ActivityLog from "../models/ActivityLog.model.js";

export const recordActivity = async ({ user, action, description, sourceId, metadata = {}, session = null }) => {
  const normalizedSourceId = String(sourceId || "").trim();
  if (!normalizedSourceId) throw new Error("Activity sourceId is required");

  const identity = { user, action, sourceId: normalizedSourceId };
  try {
    return await ActivityLog.findOneAndUpdate(
      identity,
      {
        $setOnInsert: {
          ...identity,
          description,
          metadata,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, ...(session ? { session } : {}) },
    );
  } catch (error) {
    if (error?.code === 11000) {
      const query = ActivityLog.findOne(identity);
      if (session) query.session(session);
      return query;
    }
    throw error;
  }
};

export default { recordActivity };
