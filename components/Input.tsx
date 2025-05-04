export function Input({ value, onChange, placeholder }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) {
    return (
      <input
        className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }
  