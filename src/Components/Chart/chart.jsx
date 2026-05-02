import React, { useMemo, useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
);

const PALETTE = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#fb923c",
  "#34d399",
  "#38bdf8",
  "#818cf8",
];

function colorForSymbol() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ecgScannerPlugin = {
  id: "ecgScanner",
  afterDatasetsDraw(chart, _args, pluginOptions) {
    if (!pluginOptions?.active) return;
    const dataset = chart.data.datasets[0];
    const rawData = dataset?.data ?? [];
    const meta = chart.getDatasetMeta(0);
    let lastIdx = -1;
    for (let i = rawData.length - 1; i >= 0; i--) {
      if (rawData[i] !== null && rawData[i] !== undefined) {
        lastIdx = i;
        break;
      }
    }
    if (lastIdx < 0) return;
    const el = meta.data[lastIdx];
    if (!el) return;
    const { x, y } = el;
    const color = dataset.borderColor;
    if (typeof color !== "string") return;
    const { ctx } = chart;
    ctx.save();
    const grd = ctx.createRadialGradient(x, y, 0, x, y, 13);
    grd.addColorStop(0, hexToRgba(color, 0.6));
    grd.addColorStop(0.45, hexToRgba(color, 0.25));
    grd.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
  },
};

const REVEAL_INTERVAL_MS = 70;

const Chart = ({ one, four, seven, symbol, color }) => {
  const lineColor = colorForSymbol(symbol);

  const fullData = useMemo(
    () => [
      one ?? 1.2,
      1.3,
      1.3,
      1.28,
      1.27,
      four ?? 1.3,
      1.32,
      1.31,
      1.29,
      1.3,
      1.33,
      seven ?? 1.34,
      1.4,
      1.5,
      1.6,
      one ?? 1.2,
    ],
    [one, four, seven],
  );

  const [step, setStep] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setStep(0);
    clearInterval(timerRef.current);
    let s = 0;
    timerRef.current = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= fullData.length) clearInterval(timerRef.current);
    }, REVEAL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [fullData]);

  const animating = step < fullData.length;

  const data = useMemo(
    () => ({
      labels: Array(fullData.length).fill(""),
      datasets: [
        {
          data: fullData.map((v, i) => (i < step ? v : null)),
          borderColor: lineColor,
          backgroundColor: (ctx) => {
            const { ctx: canvas, chartArea } = ctx.chart;
            if (!chartArea) return hexToRgba(lineColor, 0.18);
            const g = canvas.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            g.addColorStop(0, hexToRgba(lineColor, 0.35));
            g.addColorStop(1, hexToRgba(lineColor, 0.02));
            return g;
          },
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: true,
          tension: 0.4,
          spanGaps: false,
        },
      ],
    }),
    [fullData, step, lineColor],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
        ecgScanner: { active: animating },
      },
      scales: {
        y: {
          display: false,
          min: Math.min(...fullData) * 0.993,
          max: Math.max(...fullData) * 1.007,
        },
        x: { display: false },
      },
      animation: false,
      transitions: { active: { animation: { duration: 0 } } },
      layout: { padding: 0 },
    }),
    [fullData, animating],
  );

  return (
    <div className="h-14 w-full">
      <Line data={data} options={options} plugins={[ecgScannerPlugin]} />
    </div>
  );
};

export default Chart;
