import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/context/APIContext";
import { Navbar } from "@/components/custom/Navbar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface User {
    _id: string;
    username: string;
    email: string;
    role: string;
}

const AdminUsers = () => {
    const { adminGetUsers, adminDeleteUser } = useApi();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        adminGetUsers()
            .then((res) => {
                const data = res as { users: User[] };
                setUsers(data.users);
            })
            .finally(() => setLoading(false));
    }, [adminGetUsers]);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            await adminDeleteUser(id);
            load();
        }
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: "bg-red-100 text-red-800",
            volunteer: "bg-blue-100 text-blue-800",
            user: "bg-green-100 text-green-800",
        };
        return colors[role] || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6 animate-fade-in">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        User Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View and manage all registered users
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12 animate-fade-in">
                        <p className="text-gray-500">Loading users...</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {users.map((user, index) => (
                            <Card key={user._id} className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg transition-transform duration-300 hover:scale-110">
                                                {user.username?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{user.username}</CardTitle>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Badge className={getRoleBadgeColor(user.role)}>
                                                {user.role}
                                            </Badge>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="transition-all duration-300 hover:scale-105"
                                                onClick={() => handleDelete(user._id)}
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

export default AdminUsers;
