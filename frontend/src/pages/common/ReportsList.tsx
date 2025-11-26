import { useEffect, useState } from "react";
import { useApi } from "../../context/APIContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/custom/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Report {
    _id: string;
    title: string;
    description: string;
    category: string;
    status: string;
}

const ReportsList = () => {
    const { getAllReports } = useApi();
    const navigate = useNavigate();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllReports()
            .then((res) => {
                const data = res as { reports: Report[] };
                setReports(data.reports ?? []);
            })
            .finally(() => setLoading(false));
    }, [getAllReports]);

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            All Reports
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Browse and manage emergency reports
                        </p>
                    </div>
                    <Button className="transition-all duration-300 hover:scale-105 hover:shadow-lg" onClick={() => navigate("/reports/create")}>
                        + New Report
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12 animate-fade-in">
                        <p className="text-gray-500">Loading reports...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <Card className="animate-fade-in-up">
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">No reports found</p>
                            <Button
                                className="mt-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                onClick={() => navigate("/reports/create")}
                            >
                                Create First Report
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {reports.map((report, index) => (
                            <Card
                                key={report._id}
                                className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => navigate(`/reports/view/${report._id}`)}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            <span className="text-2xl transition-transform duration-300 hover:scale-125">
                                                {getCategoryEmoji(report.category)}
                                            </span>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">
                                                    {report.title}
                                                </CardTitle>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {report.description?.substring(0, 100)}
                                                    {report.description?.length > 100 && "..."}
                                                </p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Badge variant="outline" className="capitalize">
                                                        {report.category}
                                                    </Badge>
                                                    <Badge className={getStatusColor(report.status)}>
                                                        {report.status}
                                                    </Badge>
                                                </div>
                                            </div>
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

export default ReportsList;
