import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/custom/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const VolunteerDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Volunteer Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage your assigned tasks and help coordinate relief efforts
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-scale-in" onClick={() => navigate("/volunteer/tasks")}>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span className="text-2xl transition-transform duration-300 hover:scale-125">✅</span>
                                <span>My Tasks</span>
                            </CardTitle>
                            <CardDescription>
                                View and manage your assigned emergency tasks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full transition-all duration-300 hover:scale-105" onClick={() => navigate("/volunteer/tasks")}>
                                View Tasks
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-scale-in animation-delay-100" onClick={() => navigate("/reports")}>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <span className="text-2xl transition-transform duration-300 hover:scale-125">📋</span>
                                <span>All Reports</span>
                            </CardTitle>
                            <CardDescription>
                                Browse all emergency reports in the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full transition-all duration-300 hover:scale-105" onClick={() => navigate("/reports")}>
                                View Reports
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
