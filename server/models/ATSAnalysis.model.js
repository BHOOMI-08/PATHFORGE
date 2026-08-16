import mongoose from "mongoose";
const atsAnalysisSchema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true}, resume:{type:mongoose.Schema.Types.ObjectId,ref:"Resume",required:true,index:true},
 jobDescription:{type:String,required:true,minlength:80,maxlength:12000}, atsScore:{type:Number,required:true,min:0,max:100},
 breakdown:{formattingScore:{type:Number,min:0,max:100,default:0},contentScore:{type:Number,min:0,max:100,default:0},keywordScore:{type:Number,min:0,max:100,default:0},impactScore:{type:Number,min:0,max:100,default:0}},
 matchedKeywords:[String],missingKeywords:[String],strengths:[String],weaknesses:[String],recommendations:[String],summary:{type:String,default:""},parsingFailures:[String],formattingAdvice:[String],skillGapAdvice:[String],
 actionItems:[{category:{type:String,enum:["formatting","skills","impact","general"],default:"general"},priority:{type:String,enum:["high","medium","low"],default:"medium"},title:{type:String,required:true},description:{type:String,default:""}}]
},{timestamps:true});
atsAnalysisSchema.index({user:1,createdAt:-1});
atsAnalysisSchema.index({user:1,resume:1,createdAt:-1},{name:"ats_user_resume_latest"});
export default mongoose.model("ATSAnalysis",atsAnalysisSchema);
