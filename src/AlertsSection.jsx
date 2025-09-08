import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  Bell,
  BellOff,
  ThermometerSun,
  ThermometerSnowflake,
  MailX, 
  Mail,
  CloudOff
} from "lucide-react";

export default function AlertsPanel() {
  const [tempEnabled, setTempEnabled] = useState(true);
  const [tempThreshold, setTempThreshold] = useState(35);
  const [rainEnabled, setRainEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const alerts = [
    {
      label: "Temp Alert ",
      iconOn: <ThermometerSun className="text-orange-500 w-5 h-5" />,
      iconOff: <ThermometerSnowflake className="text-blue-500 w-5 h-5" />,
      enabled: tempEnabled,
      toggle: () => setTempEnabled(!tempEnabled),
      extra: (
        <input
          type="number"
          className="mr-4 border rounded-lg px-2 py-1 w-16 text-md"
          value={tempThreshold}
          onChange={(e) => setTempThreshold(e.target.value)}
        />
      ),
      unit: "°C Threshold"
    },
    {
      label: "Rain Alert Setup",
      iconOn: <CloudRain className="text-blue-500 w-5 h-5" />,
      iconOff: <CloudOff className="text-yellow-500 w-5 h-5" />,
      enabled: rainEnabled,
      toggle: () => setRainEnabled(!rainEnabled),
      textOn: "On",
      textOff: "Off"
    },
    {
      label: "Email Alerts",
      iconOn: <Mail className="text-green-600 w-5 h-5" />,
      iconOff: <MailX className="text-gray-400 w-5 h-5" />,
      enabled: emailEnabled,
      toggle: () => setEmailEnabled(!emailEnabled),
      textOn: "Enabled",
      textOff: "Disabled"
    },
    {
      label: "SMS Alerts",
      iconOn: <Bell className="text-green-500 w-5 h-5" />,
      iconOff: <BellOff className="text-gray-400 w-5 h-5" />,
      enabled: smsEnabled,
      toggle: () => setSmsEnabled(!smsEnabled),
      textOn: "Enabled",
      textOff: "Disabled"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-b-0"
        >
          {/* Icon + Label + Value */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            {alert.enabled ? alert.iconOn : alert.iconOff}
            <span
              className={`font-medium ${
                alert.enabled ? "text-green-600" : "text-gray-500"
              }`}
            >
              {alert.label}:
            </span>
            <span
              className={`${
                alert.enabled ? "text-green-600" : "text-gray-500"
              }`}
            >
              {alert.label === "Temp Alert "
                ? `${tempThreshold}${alert.unit}`
                : alert.enabled
                ? alert.textOn
                : alert.textOff}
            </span>
            
          </div>

          {/* Toggle */}
          {alert.label === "Temp Alert " && alert.extra}
          <button
            onClick={alert.toggle}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              alert.enabled
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            
            {alert.enabled ? "On" : "Off"}
          </button>
        </div>
      ))}
    </div>
  );
}
