"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle, XCircle, RefreshCw, Car, ArrowLeft } from "lucide-react";
import { account } from "../appwrite";
import { useUserStore } from "@/stores/userStore";

const VerifyEmailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useUserStore();
  
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    // Check if there are verification parameters in the URL
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');
    
    if (userId && secret) {
      // Auto-verify if parameters are present
      handleVerification(userId, secret);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleVerification = async (userId: string, secret: string) => {
    setLoading(true);
    try {
      // Verify the email using Appwrite
      await account.updateVerification(userId, secret);
      
      // Update user data
      const userData = await account.get();
      setUser(userData);
      
      setVerificationStatus('success');
      setMessage('Your email has been successfully verified! You can now access all features.');
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      
      if (error.code === 401) {
        setMessage('Invalid or expired verification link. Please request a new one.');
      } else {
        setMessage('Verification failed. Please try again or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    try {
      await account.createVerification(`${window.location.origin}/verify-email`);
      setMessage('A new verification email has been sent. Please check your inbox.');
      setCanResend(false);
      setResendCountdown(60); // 60 second cooldown
    } catch (error: any) {
      console.error('Resend verification error:', error);
      setMessage('Failed to send verification email. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

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

      {/* Verification Card */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        {/* Loading State */}
        {loading && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        )}

        {/* Success State */}
        {verificationStatus === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <button
              onClick={handleGoToDashboard}
              className="w-full p-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Error State */}
        {verificationStatus === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading || !canResend}
                className="w-full p-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {resendLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : !canResend ? (
                  `Resend in ${resendCountdown}s`
                ) : (
                  "Resend Verification Email"
                )}
              </button>
              <button
                onClick={handleBackToLogin}
                className="w-full p-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* Pending State (waiting for user to check email) */}
        {verificationStatus === 'pending' && !loading && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We have sent a verification link to{" "}
              <span className="font-semibold text-gray-800">
                {email || "your email address"}
              </span>
              . Please check your inbox and click the link to verify your account.
            </p>

            {/* Email Tips */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">
                Cannot find the email?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• The email may take a few minutes to arrive</li>
              </ul>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading || !canResend}
                className="w-full p-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {resendLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : !canResend ? (
                  `Resend in ${resendCountdown}s`
                ) : (
                  "Resend Verification Email"
                )}
              </button>
              
              <button
                onClick={handleBackToLogin}
                className="w-full p-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-gray-500 text-xs">
          Having trouble?{" "}
          <button className="text-purple-600 hover:text-purple-700 transition-colors">
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;