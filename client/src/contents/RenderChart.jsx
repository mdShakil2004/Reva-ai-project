
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const RenderChart = ( data, darkMode ) => {
  try {
    const parsedData = JSON.parse(data);

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      throw new Error("Invalid chart data");
    }

    // Modern color palette for bars (dark and light mode)
    const colorPalette = darkMode
      ? [
          { start: "#3b82f6", end: "#60a5fa" }, // Blue
          { start: "#10b981", end: "#34d399" }, // Green
          { start: "#8b5cf6", end: "#a78bfa" }, // Purple
          { start: "#f43f5e", end: "#fb7185" }, // Rose
          { start: "#06b6d4", end: "#22d3ee" }, // Cyan
        ]
      : [
          { start: "#2563eb", end: "#3b82f6" }, // Blue
          { start: "#059669", end: "#10b981" }, // Green
          { start: "#7c3aed", end: "#9f67fa" }, // Purple
          { start: "#e11d48", end: "#f43f5e" }, // Rose
          { start: "#0891b2", end: "#06b6d4" }, // Cyan
        ];

    // Theme-based styling
    const backgroundClass = darkMode ? "bg-gray-900" : "bg-white";
    const textColor = darkMode ? "#e5e7eb" : "#111827";
    const gridColor = darkMode ? "#374151" : "#e5e7eb";
    const tooltipBg = darkMode ? "#1f2937" : "#ffffff";
    const tooltipBorder = darkMode ? "#4b5563" : "#d1d5db";
    const tooltipText = darkMode ? "#e5e7eb" : "#111827";
    const captionBg = darkMode ? "bg-gray-800/50" : "bg-gray-100/50";
    const captionBorder = darkMode ? "border-gray-700" : "border-gray-200";

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div
            className="rounded-lg border p-3 shadow-lg"
            style={{
              backgroundColor: tooltipBg,
              borderColor: tooltipBorder,
              color: tooltipText,
            }}
          >
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-sm">{`Value: ${payload[0].value.toLocaleString()}`}</p>
          </div>
        );
      }
      return null;
    };

    return (
      <div
        className={`${backgroundClass} p-6 rounded-xl shadow-lg my-6 transition-all duration-300 hover:shadow-xl border ${
          darkMode ? "border-gray-800" : "border-gray-200"
        }`}
        role="region"
        aria-label="Bar Chart Visualization"
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={parsedData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            {/* Define gradients for each bar */}
            {parsedData.map((_, index) => (
              <defs key={`gradient-${index}`}>
                <linearGradient
                  id={`barGradient-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={colorPalette[index % colorPalette.length].start}
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="100%"
                    stopColor={colorPalette[index % colorPalette.length].end}
                    stopOpacity={0.6}
                  />
                </linearGradient>
              </defs>
            ))}
            <CartesianGrid
              strokeDasharray="4 4"
              stroke={gridColor}
              opacity={0.7}
            />
            <XAxis
              dataKey="name"
              stroke={textColor}
              tick={{ fontSize: 14, fill: textColor }}
              tickLine={{ stroke: textColor }}
              axisLine={{ stroke: textColor }}
              tickMargin={10}
            />
            <YAxis
              stroke={textColor}
              tick={{ fontSize: 14, fill: textColor }}
              tickLine={{ stroke: textColor }}
              axisLine={{ stroke: textColor }}
              tickFormatter={(value) => value.toLocaleString()}
              tickMargin={10}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                opacity: 0.2,
              }}
            />
            <Legend
              wrapperStyle={{
                color: textColor,
                fontSize: 14,
                paddingTop: 12,
                fontWeight: 500,
              }}
              formatter={(value) => (
                <span className="font-medium">{value.toUpperCase()}</span>
              )}
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              animationDuration={900}
              animationEasing="ease-out"
              barSize={Math.min(60, 400 / parsedData.length)}
            >
              {parsedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div
          className={`mt-1 px-3 rounded-md py-1.5  ${
            darkMode ? "text-gray-300" : "text-gray-600"
          } text-sm font-medium tracking-wide`}
          role="note"
          aria-label="Chart Caption"
        >
          Data source: User-provided input
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div
        className={`p-4 rounded-lg ${
          darkMode ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-600"
        } border ${darkMode ? "border-red-800" : "border-red-200"}`}
        role="alert"
        aria-label="Chart Error"
      >
        <p className="text-sm font-medium">Error rendering chart: {err.message}</p>
      </div>
    );
  }
};

export default RenderChart;
