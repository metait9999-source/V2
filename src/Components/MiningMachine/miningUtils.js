// ── Shared data ──
export const MACHINES = [
  {
    id: 1,
    days: 3,
    label: "3 Days",
    description: "Financial product - not redeemable within three days",
    rent: "1,000 USDT",
    rentValue: 1000,
    stars: 5,
    output: "1.0000% USDT/Day",
    computing: "15000 TH/s",
    power: "150000W",
    cycle: "3 Days",
    color: "#5b6ef5",
  },
  {
    id: 2,
    days: 7,
    label: "7 Days",
    description: "Financial product - not redeemable within seven days",
    rent: "3,000 USDT",
    rentValue: 3000,
    stars: 5,
    output: "1.5000% USDT/Day",
    computing: "25000 TH/s",
    power: "200000W",
    cycle: "7 Days",
    color: "#a855f7",
  },
  {
    id: 3,
    days: 30,
    label: "30 Days",
    description: "Financial product - not redeemable within thirty days",
    rent: "10,000 USDT",
    rentValue: 10000,
    stars: 5,
    output: "2.0000% USDT/Day",
    computing: "50000 TH/s",
    power: "350000W",
    cycle: "30 Days",
    color: "#ec4899",
  },
];

export const BENEFITS = [
  "Daily settlement of miner income",
  "Data centers established in multiple countries",
  "24*365 days stable operation",
  "Professional technical team support",
  "Real-time monitoring & alerts",
];

// ── Shared UI components ──
export const MachineIcon = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <rect
      x="10"
      y="30"
      width="60"
      height="12"
      rx="6"
      fill="#fca5a5"
      opacity="0.6"
    />
    <rect
      x="10"
      y="22"
      width="60"
      height="12"
      rx="6"
      fill="#f87171"
      opacity="0.7"
    />
    <rect
      x="10"
      y="14"
      width="60"
      height="12"
      rx="6"
      fill="#ef4444"
      opacity="0.8"
    />
    <rect
      x="15"
      y="6"
      width="50"
      height="12"
      rx="6"
      fill="#dc2626"
      opacity="0.9"
    />
    <circle cx="40" cy="12" r="6" fill="white" opacity="0.3" />
    <circle cx="40" cy="12" r="3" fill="white" opacity="0.6" />
    <path d="M38 10 L40 8 L42 10 L42 14 L38 14 Z" fill="white" opacity="0.8" />
  </svg>
);

export const Stars = ({ count = 5 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#f59e0b">
        <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
      </svg>
    ))}
  </div>
);
