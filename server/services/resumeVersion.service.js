import Resume from "../models/Resume.model.js";
import ResumeVersionCounter from "../models/ResumeVersionCounter.model.js";

const queryWithSession = (query, session) => (session ? query.session(session) : query);

export const ensureResumeVersionNumbers = async (userId, session = null) => {
  const missingFilter = {
    user: userId,
    $or: [{ versionNumber: { $exists: false } }, { versionNumber: null }],
  };
  const hasUnnumberedResume = await queryWithSession(Resume.exists(missingFilter), session);

  if (!hasUnnumberedResume) {
    const latestNumberedResume = await queryWithSession(
      Resume.findOne({ user: userId })
        .sort({ versionNumber: -1 })
        .select("versionNumber")
        .lean(),
      session,
    );
    const maximum = latestNumberedResume?.versionNumber || 0;
    await ResumeVersionCounter.findOneAndUpdate(
      { user: userId },
      { $max: { sequence: maximum }, $setOnInsert: { user: userId } },
      { upsert: true, setDefaultsOnInsert: true, session },
    );
    return maximum;
  }

  const resumes = await queryWithSession(
    Resume.find({ user: userId })
      .sort({ createdAt: 1, _id: 1 })
      .select("_id versionNumber")
      .lean(),
    session,
  );

  const used = new Set(
    resumes
      .map((resume) => Number(resume.versionNumber))
      .filter((value) => Number.isInteger(value) && value > 0),
  );
  let candidate = 1;
  const operations = [];

  for (const resume of resumes) {
    if (Number.isInteger(resume.versionNumber) && resume.versionNumber > 0) continue;
    while (used.has(candidate)) candidate += 1;
    used.add(candidate);
    operations.push({
      updateOne: {
        filter: {
          _id: resume._id,
          user: userId,
          $or: [{ versionNumber: { $exists: false } }, { versionNumber: null }],
        },
        update: { $set: { versionNumber: candidate } },
      },
    });
    candidate += 1;
  }

  if (operations.length > 0) {
    await Resume.bulkWrite(operations, session ? { session } : undefined);
  }

  const maximum = used.size > 0 ? Math.max(...used) : 0;
  await ResumeVersionCounter.findOneAndUpdate(
    { user: userId },
    { $max: { sequence: maximum }, $setOnInsert: { user: userId } },
    { upsert: true, setDefaultsOnInsert: true, session },
  );

  return maximum;
};

export const allocateResumeVersionNumber = async (userId, session = null) => {
  await ensureResumeVersionNumbers(userId, session);
  const counter = await ResumeVersionCounter.findOneAndUpdate(
    { user: userId },
    { $inc: { sequence: 1 } },
    { new: true, session },
  );
  return counter.sequence;
};

export default { allocateResumeVersionNumber, ensureResumeVersionNumbers };
