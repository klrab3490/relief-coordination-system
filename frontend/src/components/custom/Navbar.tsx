import { MobileMenu } from "./MobileMenu";
import { useApi } from "@/context/APIContext";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { useNavigate, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, FileText, Users, Settings, ChevronDown, Shield } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Navbar = () => {
    const { user, logout } = useApi();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate("/")}>
                        <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:scale-110" />
                        <h1 className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-200 group-hover:scale-105">
                            Relief Coordination
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/")}
                            className={`transition-all duration-200 hover:scale-105 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 ${isActive("/") ? "bg-gray-100 dark:bg-gray-700" : ""
                                }`}
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                        {(user?.role === "user") && (
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/reports")}
                                className={`transition-all duration-200 hover:scale-105 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 ${isActive("/reports") ? "bg-gray-100 dark:bg-gray-700" : ""
                                    }`}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Reports
                            </Button>
                        )}
                        {(user?.role === "admin") && (
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/admin/reports")}
                                className={`transition-all duration-200 hover:scale-105 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 ${isActive("/admin/reports") ? "bg-gray-100 dark:bg-gray-700" : ""
                                    }`}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Reports
                            </Button>
                        )}
                        {(user?.role === "volunteer") && (
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/volunteer/dashboard")}
                                className={`transition-all duration-200 hover:scale-105 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 ${isActive("/volunteer/dashboard") ? "bg-gray-100 dark:bg-gray-700" : ""
                                    }`}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Volunteer
                            </Button>
                        )}
                        {(user?.role === "admin") && (
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/admin/users")}
                                className={`transition-all duration-200 hover:scale-105 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 ${isActive("/admin/users") ? "bg-gray-100 dark:bg-gray-700" : ""
                                    }`}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Volunteer
                            </Button>
                        )}
                        {user?.role === "admin" && (
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/admin")}
                                className={`transition-all duration-200 hover:scale-105 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 ${isActive("/admin") ? "bg-gray-100 dark:bg-gray-700" : ""
                                    }`}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Admin
                            </Button>
                        )}
                    </div>

                    {/* Right Side: Theme Toggle & User Menu (Desktop) + Mobile Menu */}
                    <div className="flex items-center space-x-3">
                        {/* Theme Toggle - Desktop Only */}
                        <div className="hidden md:block">
                            <ModeToggle />
                        </div>

                        {/* User Menu - Desktop Only */}
                        <div className="hidden md:block">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center space-x-2 px-2 py-1 rounded-md group focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                        <Avatar className="h-8 w-8 bg-blue-600 text-white transition-all duration-200 group-hover:ring-2 group-hover:ring-blue-500">
                                            <AvatarFallback>
                                                {user?.username?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-sm text-gray-700 dark:text-gray-200 max-w-25 truncate">
                                            {user?.username}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 group-hover:rotate-180" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user?.email}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Role: <span className="font-medium capitalize">{user?.role}</span>
                                        </p>
                                    </div>
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-red-600 dark:text-red-400 font-medium cursor-pointer"
                                    >
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Mobile Menu - Mobile Only */}
                        <MobileMenu />
                    </div>
                </div>
            </div>
        </nav>
    );
};
