'use client';
import { useState, useEffect } from 'react';
import { signInWithGmail, setUpRecaptcha, signInWithPhone, verifyOtp, signInAsGuest } from '@/auth'; // Adjust path as needed
import { useRouter } from 'next/navigation';
import { ConfirmationResult } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUpRecaptcha('recaptcha-container');
    }
  }, []);

  const handleGmailSignIn = async () => {
    setError(null);
    try {
      const result = await signInWithGmail();
      if (result) {
        router.push('/');
      }
    } catch (err) {
      setError('Gmail login failed.');
      console.error('Gmail login failed:', err);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    if (!phoneNumber) {
      setError('Please enter a phone number.');
      return;
    }
    try {
      const result = await signInWithPhone(phoneNumber);
      if (result) {
        setConfirmationResult(result);
        setShowOtpInput(true);
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('Error sending OTP.');
      console.error('Error sending OTP:', err);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    if (!confirmationResult) {
      setError('OTP confirmation result not found.');
      return;
    }
    try {
      const result = await verifyOtp(confirmationResult, otp);
      if (result) {
        router.push('/');
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      console.error('Error verifying OTP:', err);
    }
  };

  const handleGuestSignIn = async () => {
    setError(null);
    try {
      const result = await signInAsGuest();
      if (result) {
        router.push('/');
      }
    } catch (err) {
      setError('Guest login failed.');
      console.error('Guest login failed:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login to Prepmeinc
        </h2>
        {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-8 space-y-4">
          <button
            onClick={handleGmailSignIn}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
          >
            <img src="/google_logo.svg" alt="Google Logo" className="h-5 w-5 mr-2" />
            Sign in with Gmail
          </button>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400">Or continue with</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Mobile Number (OTP)</h3>
            {!showOtpInput ? (
              <div className="flex flex-col gap-3">
                <input
                  type="tel"
                  placeholder="Enter phone number (e.g., +11234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  onClick={handleSendOtp}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                >
                  Send OTP
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  onClick={handleVerifyOtp}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                >
                  Verify OTP
                </button>
              </div>
            )}
            <div id="recaptcha-container" className="mt-4"></div>
          </div>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400">Or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div>
            <button
              onClick={handleGuestSignIn}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
            >
              Sign in as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
