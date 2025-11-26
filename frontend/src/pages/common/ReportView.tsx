import { useEffect, useState } from "react";
import { useApi } from "../../context/APIContext";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/custom/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ReportData {
    _id: string;
    title: string;
    description: string;
    category: string;
    status: string;
}

const ReportView = () => {
    const { id } = useParams();
    const { getReportById, user, updateReportStatus } = useApi();
    const navigate = useNavigate();

    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getReportById(id)
                .then((res) => {
                    const data = res as { report: ReportData };
                    setReport(data.report);
                })
                .finally(() => setLoading(false));
        }
    }, [id, getReportById]);

    const getCategoryEmoji = (category: string) => {
        const emojis: Record<string, string> = {
            fire: "🔥",
            flood: "🌊",
            accident: "🚗",
            earthquake: "🌍",
            landslide: "🏔️",
            storm: "⛈️",
            other: "📌",
        };
        return emojis[category] || "📌";
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            reported: "bg-yellow-100 text-yellow-800",
            reviewing: "bg-blue-100 text-blue-800",
            assigned: "bg-purple-100 text-purple-800",
            resolving: "bg-orange-100 text-orange-800",
            resolved: "bg-green-100 text-green-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const handleStatusChange = async (newStatus: string) => {
        if (report) {
            await updateReportStatus(report._id, newStatus);
            setReport({ ...report, status: newStatus });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto p-6">
                    <p className="text-center py-12 text-gray-500 animate-fade-in">Loading report...</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="max-w-4xl mx-auto p-6">
                    <Card className="animate-fade-in-up">
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">Report not found</p>
                            <Button className="mt-4 transition-all duration-300 hover:scale-105 hover:shadow-lg" onClick={() => navigate("/reports")}>
                                Back to Reports
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/reports")}
                    className="mb-4 transition-all duration-300 hover:scale-105 animate-fade-in"
                >
                    ← Back to Reports
                </Button>

                <Card className="animate-fade-in-up">
                    <CardHeader>
                        <div className="flex items-start space-x-4">
                            <span className="text-4xl transition-transform duration-300 hover:scale-125">{getCategoryEmoji(report.category)}</span>
                            <div className="flex-1">
                                <CardTitle className="text-2xl mb-2">{report.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="capitalize">
                                        {report.category}
                                    </Badge>
                                    <Badge className={getStatusColor(report.status)}>
                                        {report.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Description</h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                {report.description || "No description provided"}
                            </p>
                        </div>

                        {(user?.role === "admin" || user?.role === "volunteer") && (
                            <div className="pt-4 border-t">
                                <Label htmlFor="status" className="text-lg font-semibold">
                                    Update Status
                                </Label>
                                <p className="text-sm text-gray-500 mb-3">
                                    Change the current status of this report
                                </p>
                                <Select
                                    id="status"
                                    value={report.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="max-w-xs"
                                >
                                    <option value="reported">Reported</option>
                                    <option value="reviewing">Reviewing</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="resolving">Resolving</option>
                                    <option value="resolved">Resolved</option>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ReportView;
