import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

const getColor = (temp) => {
  if (temp <= 30) return "#4ade80"; // green
  if (temp <= 40) return "#facc15"; // yellow
  return "#ef4444"; // red
};

export default function ThermometerChart({ temperature }) {
  const data = [{ name: "Temp", value: temperature }];

  return (
    <div className="w-full h-64 bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Temperature</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis type="number" domain={[0, 50]} hide />
          <YAxis type="category" dataKey="name" hide />
          <Bar dataKey="value" barSize={40} radius={[20, 20, 20, 20]}>
            <Cell fill={getColor(temperature)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
