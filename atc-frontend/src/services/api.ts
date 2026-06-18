import axios from "axios";
import type { Flight } from "../types";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export const getFlights = () => API.get<Flight[]>("/flights");
export const addFlight = (data: Flight) => API.post("/flights", data);
export const deleteFlight = (id: string) => API.delete(`/flights/${id}`);
export const startSim = (socketId: string) => API.post("/simulation/start", { socketId });

// Summary endpoints
export const getSummaries = () => API.get("/summary");
export const getLatestSummary = () => API.get("/summary/latest");
export const getSummaryById = (id: number) => API.get(`/summary/${id}`);