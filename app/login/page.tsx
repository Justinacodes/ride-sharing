"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Eye, EyeOff, Car, Facebook } from "lucide-react";
import { account } from "../appwrite";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const LoginPage = () => {
  const router = useRouter();
  const { user, setUser, clearUser } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const email = watch("email");
  const password = watch("password");

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      try {
        await account.deleteSession('current');
      } catch (e) {
        console.log("No existing session to delete");
      }
  
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setUser(user);
      toast.success("Successfully Logged in!")
      router.push("/dashboard");
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    await login(data.email, data.password);
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Logging in with ${provider}...`);
  };

  const navigateToRegister = () => {
    router.push("/register")
  };

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        {/* User is logged in - could redirect or show dashboard */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-lg mb-4 shadow-md">
          <Car className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Ride-<span className="text-purple-600">geng</span>
        </h1>
      </div>

      {/* Login Form Container */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Login to Continue
        </h2>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email Input */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              className="text-purple-600 hover:text-purple-700 text-sm transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">Or login with</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleSocialLogin('Google')}
            className="w-full p-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleSocialLogin('Facebook')}
            className="w-full p-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <Facebook className="w-5 h-5" />
            Continue with Facebook
          </button>
        </div>

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
        Dont have an account?{" "}
            <button
              onClick={navigateToRegister}
              className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-gray-500 text-xs">
          By continuing, you agree to our{" "}
          <button className="text-purple-600 hover:text-purple-700 transition-colors">
            Terms of Service
          </button>{" "}
          and{" "}
          <button className="text-purple-600 hover:text-purple-700 transition-colors">
            Privacy Policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;