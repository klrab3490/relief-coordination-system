import React, { createContext, useContext, useState, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";

// -----------------------------
// Types
// -----------------------------
export type Role = "user" | "volunteer" | "admin";

export interface User {
    id: string;
    email: string;
    username: string;
    role: Role;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role?: Role;
    [key: string]: unknown;
}

export interface CreateReportData {
    title: string;
    description: string;
    category: string;
    lng: number;
    lat: number;
    [key: string]: unknown;
}

export interface ApiResponse {
    message?: string;
    [key: string]: unknown;
}

interface ApiContextType {
    user: User | null;
    accessToken: string;

    // Auth
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<ApiResponse>;
    logout: () => Promise<void>;

    // User
    getProfile: (id: string) => Promise<ApiResponse>;
    updateLocation: (id: string, lng: number, lat: number) => Promise<ApiResponse>;

    // Reports
    createReport: (data: CreateReportData) => Promise<ApiResponse>;
    getAllReports: () => Promise<ApiResponse>;
    getReportById: (id: string) => Promise<ApiResponse>;
    getNearbyReports: (lng: number, lat: number, radius?: number) => Promise<ApiResponse>;
    updateReportStatus: (id: string, status: string) => Promise<ApiResponse>;
    assignVolunteer: (id: string, volunteerId: string) => Promise<ApiResponse>;

    // Volunteer
    getMyTasks: () => Promise<ApiResponse>;
    acceptTask: (id: string) => Promise<ApiResponse>;
    resolveTask: (id: string) => Promise<ApiResponse>;

    // Admin
    adminGetUsers: () => Promise<ApiResponse>;
    adminGetReports: () => Promise<ApiResponse>;
    adminDeleteUser: (id: string) => Promise<ApiResponse>;
    adminDeleteReport: (id: string) => Promise<ApiResponse>;
}

// -----------------------------
// Create Context
// -----------------------------
const ApiContext = createContext<ApiContextType | null>(null);

// -----------------------------
// Helper Fetch Wrapper
// -----------------------------
async function http(
    method: string,
    url: string,
    token?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: Record<string, any>
): Promise<ApiResponse> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error((json && (json as ApiResponse).message) || "Request failed");
    }

    return json;
}

// -----------------------------
// Provider Component
// -----------------------------
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string>(
        localStorage.getItem("accessToken") || ""
    );
    const [refreshToken, setRefreshToken] = useState<string>(
        localStorage.getItem("refreshToken") || ""
    );
    const [user, setUser] = useState<User | null>(
        localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null
    );

    // Auto-refresh fetch wrapper
    const safeFetch = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (method: string, path: string, body?: Record<string, any>) => {
            try {
                return await http(method, `${BASE_URL}${path}`, accessToken, body);
            } catch (err) {
                const error = err as Error;
                const isAuthError =
                    error.message.includes("expired") ||
                    error.message.includes("Invalid token") ||
                    error.message.includes("Unauthorized") ||
                    error.message.includes("token");

                if (isAuthError) {
                    if (!refreshToken) throw err; // no refresh token available

                    // Refresh token process
                    const data = await http("POST", `${BASE_URL}/api/auth/token`, undefined, {
                        refreshToken,
                    });

                    const newToken = data.accessToken as string;
                    setAccessToken(newToken);
                    localStorage.setItem("accessToken", newToken);

                    // Retry original request with new token
                    return await http(method, `${BASE_URL}${path}`, newToken, body);
                }
                throw err;
            }
        },
        [accessToken, refreshToken]
    );

    // -----------------------------
    // AUTH
    // -----------------------------
    const login = async (email: string, password: string) => {
        const res = await http("POST", `${BASE_URL}/api/auth/login`, undefined, {
            email,
            password,
        });

        setAccessToken(res.accessToken as string);
        setRefreshToken(res.refreshToken as string);
        setUser(res.user as User);

        localStorage.setItem("accessToken", res.accessToken as string);
        localStorage.setItem("refreshToken", res.refreshToken as string);
        localStorage.setItem("user", JSON.stringify(res.user));
    };

    const register = (data: RegisterData) =>
        http("POST", `${BASE_URL}/api/auth/register`, undefined, data);

    const logout = async () => {
        try {
            await http("POST", `${BASE_URL}/api/auth/logout`, undefined, { refreshToken });
        } catch {
            // Ignore logout errors - we'll clear local state anyway
        }
        setAccessToken("");
        setRefreshToken("");
        setUser(null);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    };

    // -----------------------------
    // USERS
    // -----------------------------
    const getProfile = (id: string) => safeFetch("GET", `/api/users/profile/${id}`);

    const updateLocation = (id: string, lng: number, lat: number) =>
        safeFetch("PATCH", `/api/users/location/${id}`, { lng, lat });

    // -----------------------------
    // REPORTS
    // -----------------------------
    const createReport = (data: CreateReportData) => safeFetch("POST", `/api/reports/create`, data);

    const getAllReports = () => safeFetch("GET", `/api/reports`);

    const getReportById = (id: string) => safeFetch("GET", `/api/reports/${id}`);

    const getNearbyReports = (lng: number, lat: number, radius = 5000) =>
        safeFetch("GET", `/api/reports/nearby?lng=${lng}&lat=${lat}&radius=${radius}`);

    const updateReportStatus = (id: string, status: string) =>
        safeFetch("PATCH", `/api/reports/${id}/status`, { status });

    const assignVolunteer = (id: string, volunteerId: string) =>
        safeFetch("PATCH", `/api/reports/${id}/assign`, { volunteerId });

    // -----------------------------
    // VOLUNTEER
    // -----------------------------
    const getMyTasks = () => safeFetch("GET", `/api/volunteer/tasks`);

    const acceptTask = (id: string) => safeFetch("PATCH", `/api/volunteer/tasks/${id}/accept`);

    const resolveTask = (id: string) => safeFetch("PATCH", `/api/volunteer/tasks/${id}/resolve`);

    // -----------------------------
    // ADMIN
    // -----------------------------
    const adminGetUsers = () => safeFetch("GET", `/api/admin/users`);

    const adminGetReports = () => safeFetch("GET", `/api/admin/reports`);

    const adminDeleteUser = (id: string) => safeFetch("DELETE", `/api/admin/user/${id}`);

    const adminDeleteReport = (id: string) => safeFetch("DELETE", `/api/admin/report/${id}`);

    // -----------------------------
    // CONTEXT VALUE
    // -----------------------------
    const value: ApiContextType = {
        user,
        accessToken,

        // Auth
        login,
        register,
        logout,

        // User
        getProfile,
        updateLocation,

        // Reports
        createReport,
        getAllReports,
        getReportById,
        getNearbyReports,
        updateReportStatus,
        assignVolunteer,

        // Volunteer
        getMyTasks,
        acceptTask,
        resolveTask,

        // Admin
        adminGetUsers,
        adminGetReports,
        adminDeleteUser,
        adminDeleteReport,
    };

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

// Custom hook
export const useApi = () => {
    const ctx = useContext(ApiContext);
    if (!ctx) throw new Error("useApi must be used inside ApiProvider");
    return ctx;
};
