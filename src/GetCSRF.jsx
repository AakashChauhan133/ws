import axios from "axios";
import API_BASE_URL from "./config";

export async function getCSRFToken() {
  const res = await axios.get(`${API_BASE_URL}/getCSRF`, {
    withCredentials: true, // VERY IMPORTANT — sends PHP session cookie
  });

  return {
    name: res.data.csrf_name,  // e.g., 'csrf_test_name'
    value: res.data.csrf_token // actual value
  };
}

