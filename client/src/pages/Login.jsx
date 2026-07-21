import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Mail, Lock, Loader2 } from "lucide-react";

// Login form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export const Login = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      // Navigate directly to workspace dashboard on successful login
      navigate("/dashboard");
    } catch (error) {
      // AuthContext.login automatically shows error toasts, so we do not repeat it here.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-scale-in bg-slate-900/60 p-8 rounded-2xl border border-slate-800 backdrop-blur-md shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-slate-100">
            Welcome Back
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Sign in to continue mapping your career paths
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                disabled={isLoading}
                placeholder="you@example.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition duration-200 disabled:opacity-50"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition duration-200 disabled:opacity-50"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-danger">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-slate-100 bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-primary-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2" size={18} />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-primary-light hover:text-indigo-400 hover:underline transition duration-200"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
