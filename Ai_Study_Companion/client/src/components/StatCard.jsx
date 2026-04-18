const StatCard = ({ label, value, hint }) => {
  return (
    <div 
      className="glass rounded-2xl p-5 group hover:scale-105 transition-transform"
      style={{
        background: 'linear-gradient(135deg, var(--card) 0%, rgba(168, 85, 247, 0.05) 100%)'
      }}
    >
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
        {label}
      </p>
      <h3 className="mt-3 text-3xl font-bold" style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {value}
      </h3>
      <p className="mt-2 text-xs" style={{ color: 'var(--ink-700)' }}>
        {hint}
      </p>
    </div>
  );
};

export default StatCard;
