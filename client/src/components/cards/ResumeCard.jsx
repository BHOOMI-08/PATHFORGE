import { useState } from "react";
import { FileText, Calendar, Award, Trash2, Eye, ExternalLink } from "lucide-react";

export const ResumeCard = ({ resume, onView, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = resume.createdAt
    ? new Date(resume.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const topSkills =
    resume.parsedData?.skills?.technical?.slice(0, 4) || [];

  const atsScore = resume.matchHistoryMetrics?.atsScoreBaseline ?? 0;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(resume._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200 shadow-xl flex flex-col justify-between space-y-4 group">
      {/* Top Details Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary-light font-bold">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-100 truncate group-hover:text-primary-light transition-colors">
              {resume.fileName}
            </h3>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* ATS Baseline Score Badge */}
        <div className="shrink-0 flex flex-col items-end">
          <div className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
            <Award size={12} />
            <span>{atsScore}% ATS</span>
          </div>
        </div>
      </div>

      {/* Top Skills Tags Preview */}
      <div>
        <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
          Extracted Competencies
        </span>
        {topSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map((sk, idx) => (
              <span
                key={idx}
                className="rounded-md bg-slate-950/80 border border-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300"
              >
                {sk}
              </span>
            ))}
            {resume.parsedData?.skills?.technical?.length > 4 && (
              <span className="text-[10px] text-slate-500 font-medium pt-0.5">
                +{resume.parsedData.skills.technical.length - 4} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No technical skills detected</p>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
        <button
          type="button"
          onClick={() => onView(resume)}
          className="flex items-center space-x-1.5 text-xs font-semibold text-primary-light hover:text-indigo-300 transition-colors"
        >
          <Eye size={14} />
          <span>View Extracted Data</span>
        </button>

        <div className="flex items-center space-x-2">
          {resume.fileUrl && (
            <a
              href={resume.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Open Original PDF"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            title="Delete Resume"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;

