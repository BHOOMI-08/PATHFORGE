import { motion } from "framer-motion";
import { GraduationCap, Award, Briefcase, RefreshCw, CheckCircle2 } from "lucide-react";

const AUDIENCES = [
  {
    title: "Students",
    subtitle: "Building early career foundation",
    icon: GraduationCap,
    description: "Get early direction, craft high-scoring internships resumes, and learn key industry technologies before graduation.",
    benefits: [
      "Internship ATS keyword targeting",
      "Foundational 8-week learning roadmaps",
      "Entry-level AI mock interviews",
    ],
    color: "from-blue-500 to-[#3B82F6]",
  },
  {
    title: "Fresh Graduates",
    subtitle: "Transitioning into full-time roles",
    icon: Award,
    description: "Stand out in crowded applicant pools by proving practical readiness and bypassing initial ATS rejections.",
    benefits: [
      "Job-ready resume formatting",
      "Recruiter shortlist probability check",
      "STAR method interview prep",
    ],
    color: "from-[#34D399] to-emerald-400",
  },
  {
    title: "Working Professionals",
    subtitle: "Scaling into senior & lead positions",
    icon: Briefcase,
    description: "Optimize executive metrics, benchmark market compensation, and model high-pay promotion trajectories.",
    benefits: [
      "Leadership metric optimization",
      "Opportunity Radar market scanning",
      "Executive trajectory modeling",
    ],
    color: "from-purple-500 to-indigo-500",
  },
  {
    title: "Career Switchers",
    subtitle: "Pivoting to high-demand fields",
    icon: RefreshCw,
    description: "Map transferable skills from your previous background to modern technology role requirements seamlessly.",
    benefits: [
      "Transferable skill translation",
      "Custom pivot skill gap analysis",
      "Targeted domain AI coaching",
    ],
    color: "from-pink-500 to-rose-500",
  },
];

export const WhoIsThisForSection = () => {
  return (
    <section className="relative w-full py-24 px-6 sm:px-12 max-w-[1400px] mx-auto z-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3.5 py-1 text-xs font-extrabold text-[#A7F3D0]">
          <span>Designed For Every Career Stage</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-100 tracking-tight">
          Who Is PathForge AI <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
            Engineered For?
          </span>
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Tailored career intelligence workflows designed for every step of your professional journey.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {AUDIENCES.map((audience, idx) => {
          const IconComponent = audience.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl bg-[#041220]/70 border border-white/10 p-7 backdrop-blur-xl hover:border-[#34D399]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* Icon Container */}
                <div className="h-12 w-12 rounded-2xl bg-[#091C2E] border border-white/10 flex items-center justify-center mb-5 text-[#A7F3D0] group-hover:scale-110 transition-transform">
                  <IconComponent size={24} />
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-black text-slate-100 mb-1 group-hover:text-[#A7F3D0] transition-colors">
                  {audience.title}
                </h3>
                <p className="text-[11px] font-bold text-[#60A5FA] uppercase tracking-wider mb-4">
                  {audience.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {audience.description}
                </p>

                {/* Benefits Bullet List */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  {audience.benefits.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start space-x-2 text-xs text-slate-300 font-medium">
                      <CheckCircle2 size={15} className="text-[#34D399] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Decorative Indicator */}
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-[#34D399] transition-colors">
                <span>View Tailored Plan</span>
                <span>→</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default WhoIsThisForSection;
