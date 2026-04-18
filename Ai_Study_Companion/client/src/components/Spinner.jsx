const Spinner = ({ size = "md" }) => {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }[size];

  return (
    <div 
      className={`${sizeClass} border-2 rounded-full animate-spin`}
      style={{
        borderColor: 'rgba(168, 85, 247, 0.2)',
        borderTopColor: 'var(--accent-purple)',
        boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)'
      }}
    />
  );
};

export default Spinner;
