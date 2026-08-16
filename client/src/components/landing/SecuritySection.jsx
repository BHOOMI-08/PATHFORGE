import { motion } from "framer-motion";
import { ShieldCheck, Lock, KeyRound, EyeOff, Share2, Sparkles } from "lucide-react";

const TRUST_CARDS = [
  {
    title: "Privacy First Architecture",
    description: "Your professional data belongs exclusively to you. We strictly enforce user-centric data ownership.",
    icon: ShieldCheck,
    color: "text-[#34D399]",
  },
  {
    title: "Encrypted Document Storage",
    description: "All uploaded resumes and transcripts are protected with AES-256 encryption at rest and TLS 1.3 in transit.",
    icon: Lock,
    color: "text-[#60A5FA]",
  },
  {
    title: "Secure Authentication",
    description: "Protected using modern JWT authentication protocols, cookie-based sessions, and bcrypt password hashing.",
    icon: KeyRound,
    color: "text-purple-400",
  },
  {
    title: "AI Processing Transparency",
    description: "Clear explainability for all ATS scores and AI mentor recommendations with no black-box bias.",
    icon: EyeOff,
    color: "text-amber-400",
  },
  {
    title: "Zero Resume Sharing",
    description: "We never monetize or sell candidate resumes, contact details, or profile metrics to third parties.",
    icon: Share2,
    color: "text-pink-400",
  },
];

export const SecuritySection = () => {
  return (
    <section className="relative w-full py-24 px-6 sm:px-12 max-w-[1400px] mx-auto z-10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#34D399]/30 bg-[#34D399]/10 px-3.5 py-1 text-xs font-extrabold text-[#A7F3D0]">
          <ShieldCheck size={14} className="text-[#34D399]" />
          <span>Zero-Trust Infrastructure</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-100 tracking-tight">
          Enterprise Security & <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#A7F3D0] via-[#34D399] to-[#3B82F6] bg-clip-text text-transparent">
            Candidate Privacy
          </span>
        </h2>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Engineered with military-grade encryption and privacy protocols to safeguard your career data.
        </p>
      </div>

      {/* 5 Cards Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {TRUST_CARDS.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              whileHover={{ y: -5 }}
              className="rounded-3xl bg-[#041220]/80 border border-white/10 p-6 backdrop-blur-xl hover:border-[#34D399]/40 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div>
                <div className="h-11 w-11 rounded-2xl bg-[#091C2E] border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <IconComponent className={card.color} size={22} />
                </div>
                <h3 className="text-sm font-black text-slate-100 mb-2 group-hover:text-[#A7F3D0] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default SecuritySection;
