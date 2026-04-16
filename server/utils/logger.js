const ActivityLog = require('../models/ActivityLog');

const createActivityLog = async (userId, text, type = 'system') => {
  try {
    const log = new ActivityLog({
      userId,
      text,
      type
    });
    await log.save();
    return log;
  } catch (err) {
    console.error('Logging failed:', err.message);
  }
};

module.exports = { createActivityLog };
