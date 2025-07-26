"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Car, Facebook, User, Mail, Lock, Phone } from "lucide-react";
import { account, ID } from "@/app/appwrite";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { OAuthProvider } from 'appwrite';

// Phone number validation regex (supports international formats)
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const RegisterPage = () => {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    if (typeof window !== 'undefined' && window.google) {
      initializeGoogleAuth();
    }
  }, );

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const initializeGoogleAuth = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  };

  const handleGoogleSignIn = async (response: any) => {
    setGoogleLoading(true);
    try {
      // Decode the JWT token to get user information
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      const { email, name, picture } = payload;
      
      // Check if user already exists
      try {
        // Try to create account with Google OAuth
        await account.createOAuth2Session(
          OAuthProvider.Google,
          `${window.location.origin}/dashboard`, // Success redirect
          `${window.location.origin}/register?error=google_auth_failed` // Failure redirect
        );
        
        // If we reach here, OAuth was successful
        const userData = await account.get();
        setUser(userData);
        
        showToast("Successfully registered with Google!", "success");
        
        // Redirect to dashboard (Google accounts are automatically verified)
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
        
      } catch (error: any) {
        // If account creation fails, try to log in instead
        if (error.code === 409) {
          try {
            await account.createOAuth2Session(OAuthProvider.Google, 
              `${window.location.origin}/dashboard`,
              `${window.location.origin}/login?error=google_auth_failed`
            );
            
            const userData = await account.get();
            setUser(userData);
            
            showToast("Successfully signed in with Google!", "success");
            
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
            
          } catch (loginError) {
            showToast("Google authentication failed. Please try again.", "error");
          }
        } else {
          showToast("Google authentication failed. Please try again.", "error");
        }
      }
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      showToast("Google authentication failed. Please try again.", "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    setGoogleLoading(true);
    
    if (window.google) {
      // Use Google's One Tap or render a sign-in button
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to manual sign-in
          showGoogleSignInPopup();
        }
      });
    } else {
      showToast("Google authentication is not available. Please try again.", "error");
      setGoogleLoading(false);
    }
  };

  const showGoogleSignInPopup = () => {
    if (window.google) {
      const buttonElement = document.getElementById("google-signin-button");
      if (buttonElement) {
        window.google.accounts.id.renderButton(
          buttonElement,
          {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with"
          }
        );
      }
    }
  };

  const registerUser = async (email: string, password: string, name: string, phone: string) => {
    setLoading(true);
    try {
      // Create the user account
      await account.create(ID.unique(), email, password, name);
      
      // Log the user in immediately after registration
      await account.createEmailPasswordSession(email, password);
      
      // Get user data and set in store
      const userData = await account.get();
      setUser(userData);
      
      // Store phone number in user preferences/attributes
      try {
        await account.updatePrefs({ phone: phone });
      } catch (prefErr) {
        console.warn("Could not save phone number to preferences:", prefErr);
      }
      
      // Send email verification
      try {
        await account.createVerification(`${window.location.origin}/verify-email`);
        showToast("Registration successful! Please check your email to verify your account.", "success");
        
        // Navigate to email verification page
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 2000);
        
      } catch (verificationError) {
        console.error("Email verification error:", verificationError);
        showToast("Account created but email verification failed. Please try again from your dashboard.", "error");
        
        // Still navigate to dashboard even if email verification fails
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 409) {
        showToast("An account with this email already exists. Please try logging in instead.", "error");
      } else {
        showToast("Registration failed. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    await registerUser(data.email, data.password, data.name, data.phone);
  };

  const handleSocialRegister = (provider: string) => {
    if (provider === 'Google') {
      handleGoogleRegister();
    } else {
      showToast(`${provider} authentication coming soon!`, "success");
    }
  };

  const navigateToLogin = () => {
    router.push("/login");
  };

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        {/* User is logged in - could redirect or show dashboard */}
      </div>
    );
  }

  return (
    <>
      {/* Google Identity Services Script */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
        onLoad={() => {
          initializeGoogleAuth();
        }}
      />
      
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {toast.message}
          </div>
        )}

        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-lg mb-4 shadow-md">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Ride-<span className="text-purple-600">geng</span>
          </h1>
        </div>

        {/* Registration Form Container */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Create Your Account
          </h2>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Name Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("name")}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("email")}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("phone")}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +1234567890)
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("password")}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full p-3 pl-10 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  {...register("confirmPassword")}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <button type="button" className="text-purple-600 hover:text-purple-700 transition-colors">
                  Terms of Service
                </button>{" "}
                and{" "}
                <button type="button" className="text-purple-600 hover:text-purple-700 transition-colors">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">Or register with</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Registration Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialRegister('Google')}
              disabled={googleLoading}
              className="w-full p-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Signing in with Google...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
            
            {/* Hidden div for Google Sign-In button rendering */}
            <div id="google-signin-button" className="hidden"></div>

            <button
              onClick={() => handleSocialRegister('Facebook')}
              className="w-full p-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <Facebook className="w-5 h-5" />
              Continue with Facebook
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <button
                onClick={navigateToLogin}
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            By creating an account, you agree to our{" "}
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
    </>
  );
};

export default RegisterPage;