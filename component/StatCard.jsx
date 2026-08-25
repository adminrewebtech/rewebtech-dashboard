export default function StatCard({ label, value, icon: Icon, hint }) {
  return (
    <div className="panel panel-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[13px] font-medium text-slate-500">{label}</span>
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
            <Icon size={15} />
          </span>
        )}
      </div>
      <div className="mt-3 text-[30px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
        {value}
      </div>
      {hint && <div className="mt-2 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
