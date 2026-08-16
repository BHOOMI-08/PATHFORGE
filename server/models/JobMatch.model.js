import mongoose from "mongoose";
const jobMatchSchema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},
  resume:{type:mongoose.Schema.Types.ObjectId,ref:"Resume",required:true,index:true},
  jobTitle:{type:String,required:true,trim:true,minlength:2,maxlength:120},
  companyName:{type:String,default:"",trim:true,maxlength:120},
  jobDescription:{type:String,required:true,minlength:80,maxlength:12000},
  matchScore:{type:Number,required:true,min:0,max:100},
  matchBreakdown:{
    technicalMatch:{type:Number,required:true,min:0,max:100}, experienceMatch:{type:Number,required:true,min:0,max:100},
    educationMatch:{type:Number,required:true,min:0,max:100}, projectMatch:{type:Number,required:true,min:0,max:100},
  },
  matchingSkills:[String], missingSkills:[String], strengths:[String], weaknesses:[String], recommendations:[String], summary:{type:String,required:true,maxlength:2000},
},{timestamps:true});
jobMatchSchema.index({user:1,createdAt:-1});
jobMatchSchema.index({user:1,resume:1,createdAt:-1},{name:"job_match_user_resume_latest"});
export default mongoose.model("JobMatch",jobMatchSchema);
