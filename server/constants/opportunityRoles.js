export const OPPORTUNITY_ANALYSIS_VERSION = 1;

export const OPPORTUNITY_THRESHOLDS = Object.freeze({
  readyNow: 75,
  almostReady: 55,
});

export const ROLE_PROFILES = Object.freeze([
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    track: "frontend",
    level: "entry",
    minimumYears: 0,
    coreSkills: ["JavaScript", "React", "HTML", "CSS"],
    supportingSkills: ["Git", "REST APIs", "Testing", "TypeScript"],
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    track: "backend",
    level: "entry",
    minimumYears: 0,
    coreSkills: ["JavaScript", "Node.js", "REST APIs", "Databases"],
    supportingSkills: ["Express.js", "Git", "Authentication", "SQL", "Docker"],
  },
  {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    track: "full-stack",
    level: "entry",
    minimumYears: 0,
    coreSkills: ["JavaScript", "React", "Node.js", "REST APIs", "Databases"],
    supportingSkills: ["HTML", "CSS", "Git", "Testing", "Docker"],
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    track: "software-engineering",
    level: "entry",
    minimumYears: 0,
    coreSkills: ["Programming", "Data Structures", "OOP", "Git"],
    supportingSkills: ["Testing", "Databases", "REST APIs", "System Design"],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    track: "data",
    level: "entry",
    minimumYears: 0,
    coreSkills: ["SQL", "Excel", "Statistics", "Data Visualization"],
    supportingSkills: ["Python", "Pandas", "Power BI", "Tableau"],
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    track: "cloud",
    level: "associate",
    minimumYears: 1,
    coreSkills: ["Cloud", "Linux", "Networking", "Docker"],
    supportingSkills: ["CI/CD", "Kubernetes", "Terraform", "Monitoring"],
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    track: "devops",
    level: "associate",
    minimumYears: 1,
    coreSkills: ["Linux", "Git", "Docker", "CI/CD"],
    supportingSkills: ["Cloud", "Kubernetes", "Terraform", "Monitoring", "Networking"],
  },
  {
    id: "senior-full-stack-developer",
    title: "Senior Full Stack Developer",
    track: "full-stack",
    level: "senior",
    minimumYears: 4,
    coreSkills: ["JavaScript", "React", "Node.js", "Databases", "System Design"],
    supportingSkills: ["Testing", "Docker", "Cloud", "CI/CD", "Monitoring"],
  },
  {
    id: "senior-software-engineer",
    title: "Senior Software Engineer",
    track: "software-engineering",
    level: "senior",
    minimumYears: 4,
    coreSkills: ["Programming", "Data Structures", "OOP", "System Design", "Testing"],
    supportingSkills: ["Databases", "Cloud", "CI/CD", "Monitoring", "Leadership"],
  },
]);

export const CERTIFICATION_CATALOG = Object.freeze([
  {
    id: "aws-cloud-practitioner",
    name: "AWS Certified Cloud Practitioner",
    skills: ["Cloud", "AWS"],
  },
  {
    id: "azure-fundamentals",
    name: "Microsoft Certified: Azure Fundamentals (AZ-900)",
    skills: ["Cloud", "Azure"],
  },
  {
    id: "kcna",
    name: "Kubernetes and Cloud Native Associate (KCNA)",
    skills: ["Kubernetes", "Cloud"],
  },
  {
    id: "mongodb-associate",
    name: "MongoDB Associate Developer Certification",
    skills: ["MongoDB", "Databases"],
  },
  {
    id: "power-bi-data-analyst",
    name: "Microsoft Certified: Power BI Data Analyst Associate (PL-300)",
    skills: ["Power BI", "Data Visualization"],
  },
  {
    id: "github-foundations",
    name: "GitHub Foundations Certification",
    skills: ["Git", "CI/CD"],
  },
]);

export const PROJECT_TEMPLATES = Object.freeze([
  {
    id: "containerized-service",
    triggerSkills: ["Docker"],
    title: "Containerize and operate an existing application",
    targetSkills: ["Docker", "Monitoring"],
    difficulty: "Intermediate",
  },
  {
    id: "cloud-deployment",
    triggerSkills: ["Cloud", "AWS", "Azure"],
    title: "Deploy a production-ready application to a cloud platform",
    targetSkills: ["Cloud", "Networking", "Monitoring"],
    difficulty: "Intermediate",
  },
  {
    id: "delivery-pipeline",
    triggerSkills: ["CI/CD"],
    title: "Build an automated test and deployment pipeline",
    targetSkills: ["CI/CD", "Testing", "Git"],
    difficulty: "Intermediate",
  },
  {
    id: "tested-api",
    triggerSkills: ["Testing", "REST APIs", "Authentication"],
    title: "Create a tested and secured REST API",
    targetSkills: ["REST APIs", "Testing", "Authentication"],
    difficulty: "Beginner",
  },
  {
    id: "system-design-case-study",
    triggerSkills: ["System Design", "Monitoring"],
    title: "Design and document a scalable service architecture",
    targetSkills: ["System Design", "Databases", "Monitoring"],
    difficulty: "Advanced",
  },
  {
    id: "data-dashboard",
    triggerSkills: ["SQL", "Data Visualization", "Power BI", "Tableau"],
    title: "Build an evidence-based analytics dashboard",
    targetSkills: ["SQL", "Data Visualization"],
    difficulty: "Beginner",
  },
]);
