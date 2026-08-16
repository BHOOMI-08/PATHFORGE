export const recalculateRoadmapProgress = (roadmap) => {
  let totalTasks = 0;
  let completedTasks = 0;

  for (const milestone of roadmap.milestones || []) {
    const tasks = milestone.tasks || [];
    const milestoneCompleted = tasks.filter((task) => task.completed).length;
    totalTasks += tasks.length;
    completedTasks += milestoneCompleted;
    milestone.progress = tasks.length
      ? Math.round((milestoneCompleted / tasks.length) * 100)
      : 0;
    milestone.completed = tasks.length > 0 && milestoneCompleted === tasks.length;
  }

  roadmap.progress = { completedTasks, totalTasks };
  roadmap.overallProgress = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;
  return roadmap;
};

export default { recalculateRoadmapProgress };
