import { AdminRoute } from "@/components/custom/AdminRoute";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/custom/ProtectedRoute";
import { VolunteerRoute } from "@/components/custom/VolunteerRoute";

// Importing all the pages
// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
// Admin Pages
import AdminUsers from "@/pages/admin/Users";
import AdminReports from "@/pages/admin/Reports";
import AdminDashboard from "@/pages/admin/Dashboard";
// Volunteer Pages
import VolunteerTasks from "@/pages/volunteer/Tasks";
import VolunteerDashboard from "@/pages/volunteer/Dashboard";
// User Pages
import UserDashboard from "@/pages/user/Dashboard";
import CreateReport from "@/pages/user/CreateReport";
// Common Pages
import ReportList from "@/pages/common/ReportsList";
import ReportView from "@/pages/common/ReportView";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* User Routes */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <UserDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/reports" element={
                    <ProtectedRoute>
                        <ReportList />
                    </ProtectedRoute>
                } />
                <Route path="/reports/create" element={
                    <ProtectedRoute>
                        <CreateReport />
                    </ProtectedRoute>
                } />
                <Route path="/reports/view/:id" element={
                    <ProtectedRoute>
                        <ReportView />
                    </ProtectedRoute>
                } />

                {/* Volunteer Routes */}
                <Route path="/volunteer/dashboard" element={
                    <VolunteerRoute>
                        <VolunteerDashboard />
                    </VolunteerRoute>
                } />
                <Route path="/volunteer/tasks" element={
                    <VolunteerRoute>
                        <VolunteerTasks />
                    </VolunteerRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                } />
                <Route path="/admin/users" element={
                    <AdminRoute>
                        <AdminUsers />
                    </AdminRoute>
                } />
                <Route path="/admin/reports" element={
                    <AdminRoute>
                        <AdminReports />
                    </AdminRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}