import test from "node:test"; import assert from "node:assert/strict";
import { calculateDeterministicScores, combineATSResult } from "../services/atsScoring.service.js";
import { cleanAndParseJson, validateATSSemanticResult } from "../utils/jsonValidator.js";
const semantic={semanticScore:80,strengths:["Relevant backend work"],weaknesses:[],recommendations:["Add metrics"],summary:"Relevant candidate",formattingScore:90,impactScore:70,parsingFailures:[],formattingAdvice:[],skillGapAdvice:[],actionItems:[]};
test("keyword comparison is case-insensitive and normalizes common aliases",()=>{const r=calculateDeterministicScores("Built React.js, NodeJS and Mongo DB systems","React Node.js MongoDB Kubernetes",{});assert.ok(r.matchedKeywords.includes("react"));assert.ok(r.matchedKeywords.includes("node.js"));assert.ok(r.matchedKeywords.includes("mongodb"));assert.ok(r.missingKeywords.includes("kubernetes"));});
test("hybrid scores are clamped and deterministic",()=>{const d={keywordScore:150,contentScore:50,matchedKeywords:[],missingKeywords:[]};const a=combineATSResult(d,semantic);assert.equal(a.atsScore,100);assert.equal(a.atsScore,combineATSResult(d,semantic).atsScore);});
test("Gemini JSON fences are parsed and strict schema is validated",()=>{const valid=validateATSSemanticResult(cleanAndParseJson('```json\n'+JSON.stringify(semantic)+'\n```'));assert.equal(valid.semanticScore,80);assert.throws(()=>validateATSSemanticResult({...semantic,semanticScore:"bad"}));});
test("malformed Gemini output fails instead of producing fallback data",()=>assert.throws(()=>cleanAndParseJson("not json")));

test("known Gemini action categories normalize to the API contract",()=>{const parsed=validateATSSemanticResult({...semantic,actionItems:[{category:"technical",priority:"High",title:"Add metrics",description:"Quantify outcomes"}]});assert.equal(parsed.actionItems[0].category,"skills");assert.equal(parsed.actionItems[0].priority,"high");});

