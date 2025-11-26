import { useNavigate } from "react-router-dom";
import { useApi } from "@/context/APIContext";
import { Navbar } from "@/components/custom/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
    const { user } = useApi();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.username}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage emergency reports and coordinate relief efforts
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-scale-in" onClick={() => navigate("/reports/create")}>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span className="text-2xl transition-transform duration-300 hover:scale-125">📝</span>
                                <span>Create Report</span>
                            </CardTitle>
                            <CardDescription>
                                Report a new emergency or incident
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full transition-all duration-300 hover:scale-105" onClick={() => navigate("/reports/create")}>
                                New Report
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-scale-in animation-delay-100" onClick={() => navigate("/reports")}>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span className="text-2xl transition-transform duration-300 hover:scale-125">📋</span>
                                <span>View Reports</span>
                            </CardTitle>
                            <CardDescription>
                                Browse all emergency reports
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full transition-all duration-300 hover:scale-105" onClick={() => navigate("/reports")}>
                                View All
                            </Button>
                        </CardContent>
                    </Card>

                    {(user?.role === "volunteer" || user?.role === "admin") && (
                        <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-scale-in animation-delay-200" onClick={() => navigate("/volunteer/dashboard")}>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <span className="text-2xl transition-transform duration-300 hover:scale-125">🚨</span>
                                    <span>Volunteer</span>
                                </CardTitle>
                                <CardDescription>
                                    Manage volunteer tasks
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full transition-all duration-300 hover:scale-105" onClick={() => navigate("/volunteer/dashboard")}>
                                    Go to Volunteer
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {user?.role === "admin" && (
                        <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-scale-in animation-delay-300" onClick={() => navigate("/admin")}>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <span className="text-2xl transition-transform duration-300 hover:scale-125">⚙️</span>
                                    <span>Admin Panel</span>
                                </CardTitle>
                                <CardDescription>
                                    Manage users and system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full transition-all duration-300 hover:scale-105" onClick={() => navigate("/admin")}>
                                    Admin Dashboard
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
