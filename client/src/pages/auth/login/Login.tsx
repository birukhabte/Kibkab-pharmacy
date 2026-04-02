import React, { useState } from "react";
import axios from "axios";
import styles from "./Login.module.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState({
        username: false,
        password: false
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
    
        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/login`,
                { username, password },
                { withCredentials: true }
            );
    
            // Response data contains the user object
            const user = response.data;
    
            // Store user info in localStorage if needed
            localStorage.setItem("user", JSON.stringify(user));
    
            // The JWT token is stored securely in the cookie by the backend,
            // so you don't need to store it in localStorage here.
    
            window.location.href = "/dashboard";
        } catch (err) {
            setError(err.response?.data?.error || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleFocus = (field: string) => {
        setIsFocused(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field: string) => {
        setIsFocused(prev => ({ ...prev, [field]: false }));
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.floatingCircle1}></div>
            <div className={styles.floatingCircle2}></div>
            
            <div className={styles.loginCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.logo}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <path d="M8 11h8"></path>
                            <path d="M12 15V7"></path>
                            <circle cx="12" cy="7" r="1"></circle>
                        </svg>
                    </div>
                    <h2 className={styles.title}>PharmaCare Login</h2>
                    <p className={styles.subtitle}>Access your pharmacy dashboard</p>
                </div>
                
                <form onSubmit={handleLogin} className={styles.loginForm}>
                    <div className={styles.inputGroup}>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={() => handleFocus('username')}
                            onBlur={() => handleBlur('username')}
                            className={styles.input}
                            autoComplete="username"
                        />
                        <label 
                            htmlFor="username" 
                            className={`${styles.label} ${(isFocused.username || username) ? styles.labelFocused : ''}`}
                        >
                            Username
                        </label>
                    </div>
                    
                    <div className={styles.inputGroup}>
                        <div className={styles.passwordContainer}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => handleFocus('password')}
                                onBlur={() => handleBlur('password')}
                                className={styles.input}
                                autoComplete="current-password"
                            />
                            <button 
                                type="button" 
                                onClick={togglePasswordVisibility}
                                className={styles.toggleButton}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        <label 
                            htmlFor="password" 
                            className={`${styles.label} ${(isFocused.password || password) ? styles.labelFocused : ''}`}
                        >
                            Password
                        </label>
                    </div>
                    
                    <div className={styles.rememberForgot}>
                        <label className={styles.remember}>
                            <input type="checkbox" className={styles.checkbox} />
                            Remember me
                        </label>
                        <a href="#" className={styles.forgotPassword}>Forgot password?</a>
                    </div>
                    
                    {error && (
                        <div className={styles.errorBox}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.errorIcon}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`${styles.loginButton} ${loading ? styles.loadingButton : ''}`}
                    >
                        {loading ? (
                            <div className={styles.spinner}></div>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
                
                <div className={styles.divider}>
                    <span className={styles.dividerLine}></span>
                    <span className={styles.dividerText}>PharmaCare Management System</span>
                    <span className={styles.dividerLine}></span>
                </div>
            </div>
        </div>
    );
};

export default Login;
