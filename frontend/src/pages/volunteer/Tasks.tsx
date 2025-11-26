import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/context/APIContext";
import { Navbar } from "@/components/custom/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Task {
    _id: string;
    title: string;
    description: string;
    status: string;
    category?: string;
}

const VolunteerTasks = () => {
    const { getMyTasks, acceptTask, resolveTask } = useApi();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        getMyTasks()
            .then((res) => {
                const data = res as { tasks: Task[] };
                setTasks(data.tasks ?? []);
            })
            .finally(() => setLoading(false));
    }, [getMyTasks]);

    useEffect(() => {
        load();
    }, [load]);

    const handleAccept = async (id: string) => {
        await acceptTask(id);
        load();
    };

    const handleResolve = async (id: string) => {
        await resolveTask(id);
        load();
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            reported: "bg-yellow-100 text-yellow-800",
            assigned: "bg-blue-100 text-blue-800",
            resolving: "bg-orange-100 text-orange-800",
            resolved: "bg-green-100 text-green-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        My Tasks
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage and complete your assigned emergency tasks
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12 animate-fade-in">
                        <p className="text-gray-500">Loading tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <Card className="animate-fade-in-up">
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500">No tasks assigned yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task, index) => (
                            <Card key={task._id} className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{task.title}</CardTitle>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                {task.description}
                                            </p>
                                            <Badge className={`${getStatusColor(task.status)} mt-3`}>
                                                {task.status}
                                            </Badge>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            {task.status !== "assigned" && task.status !== "resolved" && (
                                                <Button
                                                    size="sm"
                                                    className="transition-all duration-300 hover:scale-105"
                                                    onClick={() => handleAccept(task._id)}
                                                >
                                                    Accept
                                                </Button>
                                            )}
                                            {task.status !== "resolved" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-green-50 hover:bg-green-100 transition-all duration-300 hover:scale-105"
                                                    onClick={() => handleResolve(task._id)}
                                                >
                                                    Resolve
                                                </Button>
                                            )}
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

export default VolunteerTasks;
