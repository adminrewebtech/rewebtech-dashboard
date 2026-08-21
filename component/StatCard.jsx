export default function StatCard({ label, value, icon: Icon, hint }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-400">{hint}</div>}
    </div>
  );
}
