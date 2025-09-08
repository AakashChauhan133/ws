import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

export default function PlanSection() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/plan`, {
          withCredentials: true,
        });

        if (response.data.status === "success") {
          setPlan(response.data.data);
        } else {
          setError(response.data.message || "No plan found");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  // Function to check plan status
  const getPlanStatus = (validTill) => {
    const today = new Date();
    const expiry = new Date(validTill);
    return expiry >= today ? "Active" : "Expired";
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6 space-y-2">
      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading plan details...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <p>
            Plan Type: <span className="font-semibold">{plan.plan_type}</span>
          </p>
          <p>Start Date: {plan.start_date}</p>
          <p>Valid Until: {plan.valid_till}</p>
          <p>
            Status:{" "}
            <span
              className={`font-semibold ${
                getPlanStatus(plan.valid_till) === "Active"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {getPlanStatus(plan.valid_till)}
            </span>
          </p>
          <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Upgrade Plan
          </button>
        </>
      )}
    </div>
  );
}
