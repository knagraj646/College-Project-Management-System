/* import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true,
}); */
import axios from "axios";

console.log("API Base URL:", "http://localhost:4000/api/v1");

export const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true,
});

console.log(
  "Axios instance created with baseURL:",
  axiosInstance.defaults.baseURL,
);
