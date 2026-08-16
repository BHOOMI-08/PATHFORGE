const clamp = (value) =>
  Math.round(Math.min(100, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0)));

export const QUESTION_SCORE_WEIGHTS = Object.freeze({
  correctness: 0.4,
  clarity: 0.2,
  depth: 0.25,
  communication: 0.15,
});

export const calculateQuestionScore = (evaluation) =>
  clamp(
    clamp(evaluation.correctness) * QUESTION_SCORE_WEIGHTS.correctness +
      clamp(evaluation.clarity) * QUESTION_SCORE_WEIGHTS.clarity +
      clamp(evaluation.depth) * QUESTION_SCORE_WEIGHTS.depth +
      clamp(evaluation.communication) * QUESTION_SCORE_WEIGHTS.communication,
  );

export const calculateInterviewScores = (questions = []) => {
  const evaluations = questions
    .map((question) => question?.answer?.evaluation)
    .filter(Boolean);

  if (!evaluations.length) {
    return {
      overall: 0,
      technicalAccuracy: 0,
      conceptualDepth: 0,
      communication: 0,
      clarity: 0,
      answeredQuestions: 0,
    };
  }

  const average = (key) =>
    clamp(evaluations.reduce((sum, evaluation) => sum + clamp(evaluation[key]), 0) / evaluations.length);

  const technicalAccuracy = average("correctness");
  const conceptualDepth = average("depth");
  const communication = average("communication");
  const clarity = average("clarity");

  return {
    overall: clamp(
      technicalAccuracy * QUESTION_SCORE_WEIGHTS.correctness +
        clarity * QUESTION_SCORE_WEIGHTS.clarity +
        conceptualDepth * QUESTION_SCORE_WEIGHTS.depth +
        communication * QUESTION_SCORE_WEIGHTS.communication,
    ),
    technicalAccuracy,
    conceptualDepth,
    communication,
    clarity,
    answeredQuestions: evaluations.length,
  };
};

export const readinessFromScore = (score) => {
  const normalized = clamp(score);
  if (normalized >= 85) return "Interview Ready";
  if (normalized >= 70) return "Nearly Ready";
  if (normalized >= 50) return "Developing";
  return "Needs More Practice";
};

export default {
  calculateQuestionScore,
  calculateInterviewScores,
  readinessFromScore,
  QUESTION_SCORE_WEIGHTS,
};
