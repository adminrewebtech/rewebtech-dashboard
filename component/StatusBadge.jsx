const STATUS_STYLES = {
  new: 'bg-blue-500/15 text-blue-300 ring-blue-400/25',
  contacted: 'bg-amber-500/15 text-amber-300 ring-amber-400/25',
  won: 'bg-green-500/15 text-green-300 ring-green-400/25',
  lost: 'bg-white/10 text-gray-400 ring-white/15',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.new;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status || 'new'}
    </span>
  );
}
