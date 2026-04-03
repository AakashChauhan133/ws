import React, { useState, useEffect } from "react";
import {
  Users,
  Server,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import API_BASE_URL from "../../config";

// --- Mock Data for Dashboard Visuals ---
const mockSystemLoad = [
  { time: "00:00", load: 20 },
  { time: "04:00", load: 25 },
  { time: "08:00", load: 65 },
  { time: "12:00", load: 80 },
  { time: "16:00", load: 55 },
  { time: "20:00", load: 35 },
  { time: "24:00", load: 22 },
];

const mockAlerts = [
  {
    id: 1,
    device: "Node-A1 (Farm West)",
    issue: "Battery Low (15%)",
    time: "10 mins ago",
    severity: "medium",
  },
  {
    id: 2,
    device: "Node-C3 (Orchard)",
    issue: "Connection Lost",
    time: "1 hour ago",
    severity: "high",
  },
  {
    id: 3,
    device: "Node-B2 (Greenhouse)",
    issue: "High Temp Threshold Exceeded",
    time: "3 hours ago",
    severity: "low",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDevices: 0,
    activeDevices: 0,
    loading: true,
  });

  useEffect(() => {
    // In a real application, you might have a dedicated /admin/stats endpoint.
    // For now, we fetch devices to get a basic count.
    const fetchDashboardStats = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const devRes = await axios.get(`${API_BASE_URL}/devices/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const devices = Array.isArray(devRes.data)
          ? devRes.data
          : devRes.data.data || [];

        setStats({
          totalUsers: 42, // Placeholder until users endpoint is connected
          totalDevices: devices.length,
          activeDevices:
            devices.filter(
              (d) => d.status === "active" || d.device_status === "active",
            ).length || devices.length, // Fallback to total if no status field
          loading: false,
        });
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardStats();
  }, []);

  // Card Component for the top metrics
  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    colorClass,
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center text-sm mt-2">
          {trendUp ? (
            <ArrowUpRight size={16} className="text-emerald-500 mr-1" />
          ) : (
            <ArrowDownRight size={16} className="text-rose-500 mr-1" />
          )}
          <span
            className={
              trendUp
                ? "text-emerald-600 font-medium"
                : "text-rose-600 font-medium"
            }
          >
            {trend}
          </span>
          <span className="text-slate-400 ml-2">vs last week</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">System Overview</h1>
        <p className="text-slate-500 mt-1">
          Welcome to the administration dashboard.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.loading ? "..." : stats.totalUsers}
          icon={Users}
          trend="+12%"
          trendUp={true}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Devices"
          value={stats.loading ? "..." : stats.totalDevices}
          icon={Server}
          trend="+3"
          trendUp={true}
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Active Devices"
          value={stats.loading ? "..." : stats.activeDevices}
          icon={Activity}
          trend="-1"
          trendUp={false}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="System Alerts"
          value={mockAlerts.length}
          icon={AlertTriangle}
          colorClass="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">
              System Load (24h)
            </h2>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-md px-3 py-1 outline-none">
              <option>Today</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockSystemLoad}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="load"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorLoad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Recent Alerts
          </h2>

          <div className="flex-1 overflow-y-auto space-y-4">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                <div
                  className={`mt-1 p-2 rounded-full ${
                    alert.severity === "high"
                      ? "bg-rose-100 text-rose-600"
                      : alert.severity === "medium"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    {alert.device}
                  </h4>
                  <p className="text-sm text-slate-600 mt-0.5">{alert.issue}</p>
                  <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
            View All Alerts
          </button>
        </div>
      </div>
    </div>
  );
}
