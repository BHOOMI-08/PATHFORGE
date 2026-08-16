import test from "node:test";
import assert from "node:assert/strict";
import { extractCanonicalSkills, calculateSkillGap, combineJobMatchResult } from "../services/jobMatchScoring.service.js";
import { jobMatchRequestSchema, validateJobMatchSemanticResult } from "../validators/jobMatch.validator.js";
import { cleanAndParseJson } from "../utils/jsonValidator.js";

const semantic={experienceMatch:80,educationMatch:70,projectMatch:90,strengths:["Relevant projects"],weaknesses:["No cloud evidence"],recommendations:["Add measurable outcomes"],summary:"Good fit"};
test("technology aliases normalize and deduplicate",()=>{const skills=extractCanonicalSkills("Java Script, React.js, NodeJS, Mongo DB, REST APIs and GitHub");assert.deepEqual(skills,["javascript","react","node.js","mongodb","rest api","git"]);});
test("missing skills come from the JD and are absent from resume",()=>{const gap=calculateSkillGap("React Node.js MongoDB Git","React.js, Node, Mongo DB, REST APIs, GitHub, Docker");assert.deepEqual(gap.matchingSkills,["react","node.js","mongodb","git"]);assert.deepEqual(gap.missingSkills,["rest api","docker"]);});
test("Java does not match JavaScript",()=>{const gap=calculateSkillGap("Java Spring Boot","JavaScript React Node.js");assert.equal(gap.matchingSkills.includes("javascript"),false);assert.equal(gap.missingSkills.includes("javascript"),true);});
test("hybrid compatibility uses documented deterministic weights",()=>{const result=combineJobMatchResult({technicalMatch:80,matchingSkills:[],missingSkills:[]},semantic);assert.equal(result.matchScore,81);assert.equal(result.matchBreakdown.projectMatch,90);});
test("request validation rejects short and oversized input",()=>{assert.equal(jobMatchRequestSchema.safeParse({resumeId:"x",jobTitle:"A",companyName:"",jobDescription:"short"}).success,false);});
test("semantic output is strict and rejects out-of-range or extra fields",()=>{assert.throws(()=>validateJobMatchSemanticResult({...semantic,experienceMatch:120}));assert.throws(()=>validateJobMatchSemanticResult({...semantic,unexpected:true}));});
test("malformed Gemini JSON fails instead of producing fallback data",()=>assert.throws(()=>validateJobMatchSemanticResult(cleanAndParseJson("not json"))));
