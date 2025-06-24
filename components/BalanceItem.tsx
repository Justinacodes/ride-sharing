// components/account/BalanceItem.tsx
interface BalanceItemProps {
  label: string;
  amount: string;
  color?: string;
}

export default function BalanceItem({ label, amount, color }: BalanceItemProps) {
  return (
    <div className="text-center">
      <p className="text-sm">{label}</p>
      <p className={`text-md font-bold ${color ?? 'text-black'}`}>{amount}</p>
    </div>
  );
}
