const EmptyState = ({ title, description, action }) => {
  return (
    <div className="glass rounded-2xl p-12 text-center">
      <div className="mb-4 flex justify-center">
        <span className="text-5xl">✨</span>
      </div>
      <h3 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
        {title}
      </h3>
      <p className="mt-2 text-sm" style={{ color: 'var(--ink-700)' }}>
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
