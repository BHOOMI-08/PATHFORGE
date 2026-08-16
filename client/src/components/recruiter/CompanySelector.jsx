import { Building2, CheckCircle2 } from "lucide-react";

const CompanySelector = ({ companies, selectedCompanyId, onSelect, disabled = false }) => (
  <section className="space-y-4" aria-labelledby="company-selector-title">
    <div>
      <h2 id="company-selector-title" className="text-xs font-bold uppercase tracking-wider text-slate-300">
        Select target company hiring bar
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        These are PathForge simulation heuristics, not official company hiring criteria.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => {
        const selected = selectedCompanyId === company.id;
        return (
          <button
            key={company.id}
            type="button"
            onClick={() => onSelect(company)}
            disabled={disabled}
            aria-pressed={selected}
            className={`relative overflow-hidden rounded-3xl border p-5 text-left backdrop-blur-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60 ${
              selected
                ? `border-primary bg-slate-900 shadow-xl ${company.glowColor}`
                : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2.5">
                <Building2 className={`h-5 w-5 ${selected ? "text-primary-light" : "text-slate-400"}`} />
                <span className="font-display text-lg font-bold text-slate-100">{company.name}</span>
              </span>
              {selected && <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">{company.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {company.focusAreas.map((area) => (
                <span key={area} className="rounded-lg border border-slate-700 bg-slate-950/70 px-2 py-1 text-[11px] font-medium text-slate-300">
                  {area}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  </section>
);

export default CompanySelector;
