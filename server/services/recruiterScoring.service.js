import { RECRUITER_CATEGORY_KEYS } from "../constants/recruiterRubrics.js";
import { normalizeScore } from "../utils/jsonValidator.js";

export const calculateRecruiterScore = (categoryScores, evaluationWeights) => {
  const totalWeight = RECRUITER_CATEGORY_KEYS.reduce(
    (total, key) => total + Number(evaluationWeights[key] || 0),
    0
  );

  if (totalWeight <= 0) throw new Error("Recruiter rubric has no evaluation weight");

  const weightedTotal = RECRUITER_CATEGORY_KEYS.reduce(
    (total, key) => total + normalizeScore(categoryScores[key]) * Number(evaluationWeights[key] || 0),
    0
  );

  return normalizeScore(weightedTotal / totalWeight);
};

export const getRecruiterDecision = (overallScore) => {
  const score = normalizeScore(overallScore);
  if (score >= 85) return "Strong Interview Potential";
  if (score >= 70) return "Potential Interview";
  if (score >= 55) return "Borderline";
  return "Needs Improvement";
};

export const combineRecruiterResult = (semanticResult, rubric) => {
  const overallScore = calculateRecruiterScore(
    semanticResult.categoryScores,
    rubric.evaluationWeights
  );

  return {
    ...semanticResult,
    confidence: semanticResult.confidence[0].toUpperCase() + semanticResult.confidence.slice(1),
    overallScore,
    decision: getRecruiterDecision(overallScore),
    companyFit: {
      score: overallScore,
      strongMatches: semanticResult.companyFit.strongMatches,
      gaps: semanticResult.companyFit.gaps,
    },
  };
};

export default { calculateRecruiterScore, getRecruiterDecision, combineRecruiterResult };
