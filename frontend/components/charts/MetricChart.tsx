"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format } from "date-fns";

interface MetricChartProps {
  data: any[];
  dataKey: string;
  color: string;
  label: string;
  unit?: string;
  height?: number;
  gradient?: [string, string];
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs"
        style={{ background: "#1e2a45", border: "1px solid rgba(59,130,246,0.3)", color: "#e2e8f0" }}>
        <div className="font-semibold mb-1" style={{ color: "#94a3b8" }}>
          {typeof label === 'number' ? format(new Date(label), 'HH:mm:ss') : label}
        </div>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: "#94a3b8" }}>{p.name}:</span>
            <span className="font-bold" style={{ color: p.color }}>
              {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{unit || '%'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MetricChart({
  data, dataKey, color, label, unit = '%', height = 180, gradient
}: MetricChartProps) {
  const gradId = `grad-${dataKey}`;
  const [c1, c2] = gradient || [color, color];

  const formatted = data.map(d => ({
    ...d,
    ts: new Date(d.timestamp).getTime(),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={c1} stopOpacity={0.3} />
            <stop offset="95%" stopColor={c2} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="ts"
          type="number"
          domain={['dataMin', 'dataMax']}
          scale="time"
          tickFormatter={(t) => format(new Date(t), 'HH:mm')}
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}${unit}`}
        />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          name={label}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
