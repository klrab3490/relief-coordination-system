import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Home, FileText, Users, Settings, LogOut } from "lucide-react";
import { useApi } from "@/context/APIContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/theme/mode-toggle";

export const MobileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useApi();
    const navigate = useNavigate();

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
        navigate("/login");
    };

    return (
        <>
            {/* Hamburger Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className="md:hidden transition-transform hover:scale-110"
                aria-label="Open menu"
                aria-expanded={isOpen}
            >
                <Menu className="h-6 w-6" />
            </Button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Slide-out Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-800 shadow-2xl z-50 md:hidden transition-transform duration-300 ease-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
                role="dialog"
                aria-label="Mobile navigation"
                aria-hidden={!isOpen}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 bg-blue-600 text-white">
                                <AvatarFallback>
                                    {user?.username?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                    {user?.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="transition-transform hover:scale-110"
                            aria-label="Close menu"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        <button
                            onClick={() => handleNavigate("/")}
                            className="flex items-center space-x-3 w-full px-3 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200 hover:scale-105"
                        >
                            <Home className="h-5 w-5" />
                            <span className="font-medium">Dashboard</span>
                        </button>

                        <button
                            onClick={() => handleNavigate("/reports")}
                            className="flex items-center space-x-3 w-full px-3 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200 hover:scale-105"
                        >
                            <FileText className="h-5 w-5" />
                            <span className="font-medium">Reports</span>
                        </button>

                        {(user?.role === "volunteer" || user?.role === "admin") && (
                            <button
                                onClick={() => handleNavigate("/volunteer/dashboard")}
                                className="flex items-center space-x-3 w-full px-3 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200 hover:scale-105"
                            >
                                <Users className="h-5 w-5" />
                                <span className="font-medium">Volunteer</span>
                            </button>
                        )}

                        {user?.role === "admin" && (
                            <button
                                onClick={() => handleNavigate("/admin")}
                                className="flex items-center space-x-3 w-full px-3 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all duration-200 hover:scale-105"
                            >
                                <Settings className="h-5 w-5" />
                                <span className="font-medium">Admin</span>
                            </button>
                        )}

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Theme
                                </span>
                                <ModeToggle />
                            </div>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-3 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
