// jobStore.js - Simple in-memory job tracker
// In real apps, this would be a database (Redis, MongoDB, etc.)

const jobs = {};

function createJob(id, originalFile) {
  jobs[id] = {
    id,
    originalFile,
    status: "pending", // pending → processing → done / failed
    progress: 0,
    results: [],
    createdAt: new Date().toISOString(),
  };
  return jobs[id];
}

function updateJob(id, updates) {
  if (jobs[id]) {
    Object.assign(jobs[id], updates);
  }
  return jobs[id];
}

function getJob(id) {
  return jobs[id] || null;
}

function getAllJobs() {
  return Object.values(jobs);
}

module.exports = { createJob, updateJob, getJob, getAllJobs };
