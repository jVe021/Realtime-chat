import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/auth.store";

export const LoginPage = () => {
    const navigate = useNavigate();
    const login = useAuthStore(s => s.login);
    const isLoading = useAuthStore(s => s.isLoading);
    const user = useAuthStore(s => s.user);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate("/chat", { replace: true });
        }
    }, [user, navigate]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password) {
            toast.error("Please enter email and password");
            return;
        }

        try {
            await login({ email: email.trim(), password });
            navigate("/chat");
        } catch (error: any) {
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary bg-gradient-to-br from-bg-primary to-bg-secondary p-4">
            <div className="w-full max-w-md bg-bg-secondary/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-accent/10 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2">💬 Chat App</h1>
                    <p className="text-text-secondary">Sign in to continue to your account</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-bg-tertiary border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow disabled:opacity-50"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="w-full bg-bg-tertiary border border-border text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow disabled:opacity-50 pr-12"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1"
                                disabled={isLoading}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-accent to-accent-hover text-white font-semibold rounded-lg px-4 py-3 flex justify-center items-center hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-accent/20"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-text-secondary">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-accent hover:text-accent-light font-medium">
                        Register →
                    </Link>
                </div>
            </div>
        </div>
    );
};