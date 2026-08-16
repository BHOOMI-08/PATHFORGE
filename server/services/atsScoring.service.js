import { normalizeScore } from "../utils/jsonValidator.js";
const STOP = new Set("a an and are as at be by for from has have in is it of on or our that the their this to we will with you your experience required preferred role team work years".split(" "));
const normalize = (v) => String(v).toLowerCase().replace(/node\s*\.?js/g,"node.js").replace(/react\.?js/g,"react").replace(/mongo\s*db/g,"mongodb").replace(/\s+/g," ").trim();
export const extractKeywords = (text) => [...new Set((normalize(text).match(/[a-z][a-z0-9+#.]*/g) || []).filter((x) => x.length > 1 && !STOP.has(x)))].slice(0,100);
export const calculateDeterministicScores = (resumeText, jd, data={}) => {
 const resume=normalize(resumeText), keys=extractKeywords(jd), matchedKeywords=keys.filter(k=>resume.includes(k)), missingKeywords=keys.filter(k=>!resume.includes(k));
 const checks=[data.contactInfo?.email,data.contactInfo?.phone,data.summary,data.education?.length,data.experience?.length,data.skills?.technical?.length];
 return { keywordScore: keys.length ? normalizeScore(matchedKeywords.length/keys.length*100):0, contentScore:normalizeScore(checks.filter(Boolean).length/checks.length*100), matchedKeywords, missingKeywords };
};
export const combineATSResult=(d,s)=>({atsScore:normalizeScore(d.keywordScore*.4+d.contentScore*.2+s.semanticScore*.2+s.formattingScore*.1+s.impactScore*.1),breakdown:{formattingScore:s.formattingScore,contentScore:d.contentScore,keywordScore:d.keywordScore,impactScore:s.impactScore},matchedKeywords:d.matchedKeywords,missingKeywords:d.missingKeywords,strengths:s.strengths,weaknesses:s.weaknesses,recommendations:s.recommendations,summary:s.summary,parsingFailures:s.parsingFailures,formattingAdvice:s.formattingAdvice,skillGapAdvice:s.skillGapAdvice,actionItems:s.actionItems});
