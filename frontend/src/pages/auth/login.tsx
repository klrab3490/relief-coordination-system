import { useState } from "react";
import { useApi } from "../../context/APIContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

const Login = () => {
    const { login } = useApi();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 animate-gradient">
            <Card className="w-full max-w-md shadow-2xl animate-fade-in-up">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-center animate-fade-in">Welcome Back</CardTitle>
                    <CardDescription className="text-center animate-fade-in animation-delay-100">
                        Sign in to your Relief Coordination account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="animate-shake">
                            {error}
                        </Alert>
                    )}
                    <div className="space-y-2 animate-fade-in animation-delay-200">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="transition-all duration-300 focus:scale-[1.02]"
                        />
                    </div>
                    <div className="space-y-2 animate-fade-in animation-delay-300">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            className="transition-all duration-300 focus:scale-[1.02]"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 animate-fade-in animation-delay-400">
                    <Button
                        className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Button
                            variant="link"
                            className="p-0 h-auto font-semibold text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform duration-200"
                            onClick={() => navigate("/register")}
                        >
                            Create an account
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
