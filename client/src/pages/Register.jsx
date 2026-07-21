import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { register } from "../services/auth.service.js";
import { User, Mail, Lock, Loader2 } from "lucide-react";

// Client-side validation schema matching server restrictions
const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await register(data.name, data.email, data.password);
      toast.success(response.message || "Registered successfully!");
      navigate("/login");
    } catch (error) {
      // Handles native fetch ApiError bodies or standard throw shapes
      const msg = error.body?.message || error.message || "Registration failed.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-scale-in bg-slate-900/60 p-8 rounded-2xl border border-slate-800 backdrop-blur-md shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold text-slate-100">
            Create Account
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Join PathForge AI to map out your career path
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-300 mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <User size={18} />
              </span>
              <input
                id="name"
                type="text"
                disabled={isLoading}
                placeholder="John Doe"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition duration-200 disabled:opacity-50"
                {...registerField("name")}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

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
                {...registerField("email")}
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
                {...registerField("password")}
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
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-light hover:text-indigo-400 hover:underline transition duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
