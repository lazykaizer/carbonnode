interface StatItemProps {
  value: string;
  label: string;
  suffix?: string;
}

export default function StatItem({ value, label, suffix = '' }: StatItemProps) {
  return (
    <div
      className="text-center animate-slide-up fill-both"
      style={{ animationDelay: '1.2s' }}
    >
      <div className="text-2xl sm:text-3xl font-black text-white carbon-value">
        {value}
        <span className="text-white/70 text-lg font-medium">{suffix}</span>
      </div>
      <div className="text-white/60 text-xs sm:text-sm mt-1">{label}</div>
    </div>
  );
}
