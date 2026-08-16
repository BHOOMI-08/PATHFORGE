import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "Senior Software Engineer @ Meta",
    avatar: "A",
    text: "PathForge AI's ATS Scorer pinpointed keyword gaps I had missed for months. After using the 8-Week Roadmap, I landed 4 interview calls in two weeks.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Product Manager @ Google",
    avatar: "P",
    text: "The AI Mock Interviewer prepared me for tough behavioral and system design questions. The instant STAR feedback changed how I structure my answers.",
    rating: 5,
  },
  {
    name: "Marcus Vance",
    role: "Cloud Architect @ AWS",
    avatar: "M",
    text: "The Recruiter Simulator showed me exactly how hiring managers evaluate my experience. The accuracy was shocking—I secured a 30% raise.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="relative w-full py-24 px-6 sm:px-12 max-w-[1400px] mx-auto z-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3.5 py-1 text-xs font-extrabold text-[#A7F3D0]">
          <span>Proven Results</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-100 tracking-tight">
          Trusted By Candidates <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
            At Top Tech Enterprises
          </span>
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          See how PathForge AI empowers candidates to optimize their applications and land top-tier roles.
        </p>
      </div>

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {TESTIMONIALS.map((t, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-[#041220]/80 border border-white/10 p-7 backdrop-blur-xl hover:border-[#34D399]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group relative overflow-hidden"
          >
            {/* Top Quote Icon Accent */}
            <Quote className="absolute top-6 right-6 text-white/5 group-hover:text-[#34D399]/10 transition-colors" size={48} />

            <div>
              {/* Star Rating */}
              <div className="flex items-center space-x-1 mb-5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-[#34D399] text-[#34D399]" />
                ))}
              </div>

              {/* Testimonial Quote */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-6 relative z-10">
                "{t.text}"
              </p>
            </div>

            {/* Author Meta */}
            <div className="flex items-center space-x-3.5 border-t border-white/5 pt-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#34D399] flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
                {t.avatar}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">{t.name}</h4>
                <p className="text-[11px] font-semibold text-[#A7F3D0]">{t.role}</p>
              </div>
            </div>

          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
