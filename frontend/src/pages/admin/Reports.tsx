import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/context/APIContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/custom/Navbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReportData {
    _id: string;
    title: string;
    category: string;
    description?: string;
}

const AdminReports = () => {
    const { adminGetReports, adminDeleteReport } = useApi();
    const navigate = useNavigate();
    const [reports, setReports] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        adminGetReports()
            .then((res) => {
                const data = res as { reports: ReportData[] };
                setReports(data.reports);
                console.log(data.reports);
            })
            .finally(() => setLoading(false));
    }, [adminGetReports]);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this report?")) {
            await adminDeleteReport(id);
            load();
        }
    };

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Report Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Oversee and manage all emergency reports
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12 animate-fade-in">
                        <p className="text-gray-500">Loading reports...</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reports.map((report, index) => (
                            <Card key={report._id} className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <span className="text-2xl transition-transform duration-300 hover:scale-125">
                                                {getCategoryEmoji(report.category)}
                                            </span>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{report.title}</CardTitle>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {report.description?.substring(0, 100)}
                                                    {report.description && report.description.length > 100 && "..."}
                                                </p>
                                                <Badge variant="outline" className="capitalize mt-2">
                                                    {report.category}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="transition-all duration-300 hover:scale-105"
                                                onClick={() => navigate(`/reports/view/${report._id}`)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="transition-all duration-300 hover:scale-105"
                                                onClick={() => handleDelete(report._id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReports;
