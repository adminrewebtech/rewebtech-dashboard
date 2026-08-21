const STATUS_STYLES = {
  new: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  contacted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  won: 'bg-green-50 text-green-700 ring-green-600/20',
  lost: 'bg-gray-100 text-gray-500 ring-gray-500/20',
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
