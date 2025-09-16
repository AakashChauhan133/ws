import React, {useEffect, useState} from "react";
import Sidebar from "../Sidebar"
import axios  from "axios";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../AuthProvider";
import API_BASE_URL from "../config";
import GaugeChart from 'react-gauge-chart';


// ---------------------------------
// --- PEST CALCULATION LOGIC ---
// ---------------------------------

/**
 * Pre-processes raw sensor data to find the min/max temperature for each day.
 * This is conceptually similar to a pandas groupby().agg() operation.
 * @param {Array<Object>} rawData - The array of sensor readings.
 * @returns {Array<Object>} An array of objects, e.g., [{ date: '9/1/2025', min: 20, max: 35 }]
 */
function preprocessDailyTemperatures(rawData) {
  if (!rawData || rawData.length === 0) return [];

  const dailyTemps = rawData.reduce((acc, record) => {
    // This function relies on a valid timestamp.
    const date = new Date(record.timestamp).toLocaleDateString();
    const temp = record.temperature_celcius;

    if (!acc[date]) {
      acc[date] = { min: temp, max: temp };
    } else {
      if (temp < acc[date].min) acc[date].min = temp;
      if (temp > acc[date].max) acc[date].max = temp;
    }
    return acc;
  }, {});

  return Object.entries(dailyTemps).map(([date, temps]) => ({
    date,
    ...temps,
  }));
}

/**
 * Calculates the total accumulated degree-days from a list of daily temperatures.
 * @param {Array<Object>} dailyTemps - Array from preprocessDailyTemperatures.
 * @param {number} min_temp_c - The lower developmental threshold for the pest.
 * @param {number} max_temp_c - The upper developmental threshold.
 * @returns {number} The accumulated degree-days.
 */
function calculateDegreeDays(dailyTemps, min_temp_c, max_temp_c) {
  return dailyTemps.reduce((total_dd, day) => {
    const avg_temp = (day.min + day.max) / 2;
    let dd = 0;

    if (avg_temp > min_temp_c) {
      if (avg_temp > max_temp_c) {
        dd = max_temp_c - min_temp_c;
      } else {
        dd = avg_temp - min_temp_c;
      }
    }
    return total_dd + dd;
  }, 0);
}


// --- Pest-Specific Risk Models (No changes needed here) ---

function getCodlingMothRisk(degreeDays) {
  let risk = { value: 0, status: "Low", description: "No significant activity expected." };
  if (degreeDays > 50 && degreeDays <= 250) {
    risk = { value: 40, status: "Medium", description: "First generation adults are laying eggs. Prepare for egg hatch." };
  } else if (degreeDays > 250) {
    risk = { value: 85, status: "High", description: "First generation eggs are hatching. Larvae are actively entering fruit." };
  }
  return risk;
}

function getAphidRisk(latestReading) {
  const { temperature_celcius: temp, humidity_percentage: humidity } = latestReading;
  let risk = { value: 10, status: "Low", description: "Conditions are not ideal for rapid population growth." };
  if (temp > 18 && temp < 25 && humidity < 70) {
    risk = { value: 90, status: "High", description: "Ideal (mild, dry) weather for rapid reproduction. Check new leaf growth." };
  } else if (temp > 15 && temp < 28) {
     risk = { value: 50, status: "Medium", description: "Conditions are moderately favorable. Population growth is possible." };
  }
  return risk;
}

function getAppleMaggotRisk(degreeDays) {
   let risk = { value: 0, status: "Low", description: "Adult flies have not yet emerged from the soil." };
   if (degreeDays > 900) { // Typical threshold for emergence
     risk = { value: 80, status: "High", description: "Adult flies have likely emerged and will begin laying eggs in fruit soon." };
   } else if (degreeDays > 700) {
     risk = { value: 40, status: "Medium", description: "Approaching the window for adult fly emergence. Monitor traps." };
   }
   return risk;
}

function getSpiderMiteRisk(latestReading) {
  const { temperature_celcius: temp, humidity_percentage: humidity } = latestReading;
  let risk = { value: 10, status: "Low", description: "Cool or humid conditions are suppressing mite populations." };
  if (temp > 29 && humidity < 60) {
    risk = { value: 95, status: "High", description: "Hot, dry conditions are ideal for a population explosion. Check undersides of leaves." };
  } else if (temp > 25 && humidity < 70) {
    risk = { value: 60, status: "Medium", description: "Warm, dry conditions are favorable. Monitor for signs of webbing or stippling." };
  }
  return risk;
}

function getSanJoseScaleRisk(degreeDays) {
    let risk = { value: 0, status: "Low", description: "Pest is likely dormant. No crawler activity." };
    if (degreeDays > 400 && degreeDays < 600) {
        risk = { value: 90, status: "High", description: "First generation 'crawlers' are active. This is the key window for control." };
    } else if (degreeDays > 250) {
        risk = { value: 30, status: "Medium", description: "Approaching the first crawler emergence window. Monitor closely." };
    }
    return risk;
}


// --- Utility for coloring the status badges ---
const getStatusColor = (status) => {
  switch (status) {
    case "High":
      return "bg-red-100 text-red-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-green-100 text-green-700";
  }
};

const getZoneColor = (value) => {
  if (value <= 40) return "#22c55e"; // green
  if (value <= 70) return "#facc15"; // yellow
  return "#ef4444"; // red
};



export default function Pest() {

  const { devices, devicesLoading } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [pestData, setPestData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Select first device automatically
  useEffect(() => {
    if (!devicesLoading && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devicesLoading, devices, selectedDevice]);

  useEffect(() => {
    if (!selectedDevice) return;

    const calculatePestRisks = async () => {
      setLoading(true);
      try {
        // --- 1. Robust Date Calculation ---
        // This method correctly handles month and year changes.
        const today = new Date();
        const endDate = new Date(today);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7); // Set start date to 7 days ago

        const formatDate = (date) => {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        };
        
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        // --- 2. Fetch Data from SQL API ---
        const response = await axios.get(
          `${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=custom&from=${formattedStartDate}&to=${formattedEndDate}`,
          { withCredentials: true }
        );

        const rawData = response.data.data || [];
        if (rawData.length === 0) {
            setPestData([]);
            setLoading(false);
            return;
        }

        // --- 3. Map Data Correctly ---
        // CRITICAL: Ensure your API returns a 'timestamp' field for this to work.
        const mappedData = rawData.map(item => ({
            timestamp: item.timestamp, // This field is essential
            temperature_celcius: parseFloat(item.temp),
            humidity_percentage: parseFloat(item.humidity)
        }));
        
        // --- 4. Process Data and Calculate Risks ---
        const latestReading = mappedData[mappedData.length - 1];
        const dailyTemps = preprocessDailyTemperatures(mappedData);

        const codlingMothDD = calculateDegreeDays(dailyTemps, 10, 31);
        const appleMaggotDD = calculateDegreeDays(dailyTemps, 9, 32);
        const sanJoseScaleDD = calculateDegreeDays(dailyTemps, 10.5, 32);
        
        const calculatedData = [
          { name: "Codling Moth", ...getCodlingMothRisk(codlingMothDD) },
          { name: "Aphids", ...getAphidRisk(latestReading) },
          { name: "Apple Maggot", ...getAppleMaggotRisk(appleMaggotDD) },
          { name: "Spider Mites", ...getSpiderMiteRisk(latestReading) },
          { name: "San Jose Scale", ...getSanJoseScaleRisk(sanJoseScaleDD) },
        ];

        setPestData(calculatedData);
      } catch (err) {
        console.error("Failed to fetch or process pest data:", err);
        setPestData([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    calculatePestRisks();
  }, [selectedDevice]);

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black">
      <div className="hidden md:block w-64 flex-shrink-0 bg-white border-r shadow">
        <Sidebar />
      </div>

      

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="-mx-6 -mt-6 md:hidden mb-4">
          <Sidebar />
        </div>
        <h1 className="text-3xl font-bold text-green-900">Pest Risk Analysis</h1>
        <p className="mt-2 text-gray-700">
          Risk levels for common apple pests based on degree-day models and current weather conditions.
        </p>

        {loading ? (
          <p className="mt-6 text-gray-500">Calculating risks...</p>
        ) : pestData.length === 0 ? (
          <p className="mt-6 text-gray-500">No data available to calculate pest risk for the selected period.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {pestData.map((pest, idx) => (
              <div
                key={idx}
                className="relative bg-white border-4 rounded-2xl p-6 flex flex-col items-center hover:shadow-lg transition"
              >
                {/* Gauge */}
                <ResponsiveContainer width={200} height={200}>
                  <GaugeChart                    
                    percent={(pest.value ?? 0) / 100}
                    colors={["#22c55e", "#facc15", "#ef4444"]}
                    arcWidth={0.3}
                    hideText="true"
                    textColor="#1f2937"
                    innerRadius="70%"
                    outerRadius="100%"
                    data={[{ name: pest.name, value: pest.value, fill: getZoneColor(pest.value) }]}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={15}
                      background={{ fill: "#e5e7eb" }}
                      clockWise
                    />
                  </GaugeChart>
                </ResponsiveContainer>

                {/* Centered % */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-30px] pt-9">
                  <p className="text-4xl font-bold text-gray-900">{pest.value}%</p>
                  <p className="text-sm text-gray-600">Risk</p>
                </div>

                {/* Info */}
                <div className="text-center mt-[-30px]">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {pest.name}
                    </h3>
                    <p className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pest.status)}`}>
                      {pest.status}
                    </p>
                     <p className="text-xs text-gray-500 mt-2 px-2">{pest.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
