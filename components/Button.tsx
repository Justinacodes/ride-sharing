export function Button({ children, onClick, className = '', variant = 'solid' }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'solid' | 'outline';
  }) {
    const base = 'px-4 py-2 rounded-md text-sm font-medium';
    const variants = {
      solid: 'bg-purple-600 text-white hover:bg-primary/90',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    };
    return (
      <button
        onClick={onClick}
        className={`${base} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  }