import React, { useState, useContext } from 'react';
import axios from 'axios';
import { SearchContext } from '../context/SearchContext'

const LoginModal = ({ onClose, onLoginSuccess }) => {
  const { setToken } = useContext(SearchContext);
  const [isSignIn, setIsSignIn] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isCodeEntry, setIsCodeEntry] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const backend_url = import.meta.env.VITE_BACKEND_URL; 


  const toggleForm = () => {
    setIsSignIn(!isSignIn);
    setIsForgotPassword(false);
    setIsCodeEntry(false);
    setIsResetPassword(false);
    setErrors({});
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      code: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setIsCodeEntry(false);
    setIsResetPassword(false);
    setErrors({});
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      code: '',
      newPassword: '',
      confirmNewPassword: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isForgotPassword && !isCodeEntry && !isResetPassword) {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
    } else if (isCodeEntry) {
      if (!formData.code) newErrors.code = 'Code is required';
      else if (!/^\d{6}$/.test(formData.code)) newErrors.code = 'Code must be 6 digits';
    } else if (isResetPassword) {
      if (!formData.newPassword) newErrors.newPassword = 'New password is required';
      else if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
      if (formData.newPassword !== formData.confirmNewPassword)
        newErrors.confirmNewPassword = 'Passwords do not match';
    } else if (!isSignIn) {
      if (!formData.username) newErrors.username = 'Username is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    } else {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      if (isForgotPassword && !isCodeEntry && !isResetPassword) {
        await axios.post(`${backend_url}/auth/forgot-password`, { email: formData.email });
        setErrors({ success: 'Verification code sent to your email. Check your inbox or spam folder.' });
        setIsCodeEntry(true);
      } else if (isCodeEntry && isForgotPassword) {
        await axios.post( `${backend_url}/auth/verify-code`, {
          email: formData.email,
          code: formData.code,
        });
        setErrors({ success: 'Code verified. Enter your new password.' });
        setIsCodeEntry(false);
        setIsResetPassword(true);
      } else if (isResetPassword) {
        await axios.post(`${backend_url}/auth/reset-password`, {
          email: formData.email,
          code: formData.code,
          new_password: formData.newPassword,
        });

        setErrors({ success: 'Password reset successfully. Please sign in.' });
        setIsForgotPassword(false);
        setIsCodeEntry(false);
        setIsResetPassword(false);
        setIsSignIn(true);
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          code: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else if (!isSignIn && !isCodeEntry) {
        await axios.post(`${backend_url}/auth/signup`, {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        setErrors({ success: 'Verification code sent to your email. Check your inbox or spam folder.' });
        setIsCodeEntry(true);
      } else if (!isSignIn && isCodeEntry) {
        const response = await axios.post(`${backend_url}/auth/signup-complete`, {
          email: formData.email,
          code: formData.code,
        });
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
        onLoginSuccess();
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          code: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setErrors({});
      } else {
        const response = await axios.post(`${backend_url}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
        onLoginSuccess();
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          code: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setErrors({});
      }
    } catch (error) {
      setErrors({
        api: error.response?.data?.detail || 'An error occurred. Please check your email provider or try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${backend_url}/auth/resend-code`, { email: formData.email });
      setErrors({ success: 'Verification code resent to your email. Check your inbox or spam folder.' });
    } catch (error) {
      setErrors({
        api: error.response?.data?.detail || 'Failed to resend code. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };



 

  return (
    
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[99999]">
        <div
          className={`w-[350px] bg-slate-800 shadow-xl rounded-lg p-5 md:p-7 transform transition-all duration-300 ${
            isSignIn ? 'translate-y-0' : 'translate-y-2'
          }`}
        >
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white absolute top-2 right-3 text-xl cursor-pointer"
            disabled={isLoading}
          >
            <i className="fas fa-times"></i>
          </button>
          <p className="text-center font-['Lucida_Sans'] text-gray-300 text-2xl md:text-3xl font-extrabold my-4 md:my-6">
            {isResetPassword ? 'Reset Password' : isCodeEntry ? 'Enter Verification Code' : isForgotPassword ? 'Reset Password' : isSignIn ? 'Welcome back' : 'Create Account'}
          </p>
          {errors.api && <p className="text-red-500 text-xs mt-1 text-center">{errors.api}</p>}
          {errors.success && <p className="text-green-500 text-xs mt-1 text-center">{errors.success}</p>}
          <form className="flex flex-col gap-4 mb-4" onSubmit={handleSubmit}>
            {(isForgotPassword || isCodeEntry || isResetPassword) && (
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-full border text-black border-gray-400 outline-none p-3 text-sm"
                  placeholder="Email (e.g., user@gmail.com.)"
                  disabled={isLoading || isCodeEntry || isResetPassword}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            )}
            {isCodeEntry && (
              <>
                <div>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full rounded-full text-black border border-gray-400 outline-none p-3 text-sm"
                    placeholder="6-digit code"
                    disabled={isLoading}
                  />
                  {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>
                <p className="text-center text-gray-300 text-xs">
                  Didn't receive the code?{' '}
                  <span
                    className="text-teal-600 underline cursor-pointer"
                    onClick={handleResendCode}
                  >
                    Resend Code
                  </span>
                </p>
              </>
            )}
            {isResetPassword && (
              <>
                <div>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-full text-black border border-gray-400 outline-none p-3 text-sm"
                    placeholder="New Password"
                    disabled={isLoading}
                  />
                  {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                </div>
                <div>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    className="w-full rounded-full text-black border border-gray-400 outline-none p-3 text-sm"
                    placeholder="Confirm New Password"
                    disabled={isLoading}
                  />
                  {errors.confirmNewPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmNewPassword}</p>}
                </div>
              </>
            )}
            {!isForgotPassword && !isCodeEntry && !isResetPassword && (
              <>
                {!isSignIn && (
                  <div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full rounded-full text-black border border-gray-400 outline-none p-3 text-sm"
                      placeholder="Username"
                      disabled={isLoading}
                    />
                    {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                  </div>
                )}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-full text-black border border-gray-400 outline-none p-3 text-sm"
                    placeholder="Email (e.g., user@gmail.com.)"
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-full text-black border border-gray-400 outline-none p-3 text-sm"
                    placeholder="Password"
                    disabled={isLoading}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                {!isSignIn && (
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full rounded-full  text-black border border-gray-400 outline-none p-3 text-sm"
                      placeholder="Confirm Password"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}
              </>
            )}
            {isSignIn && !isForgotPassword && !isCodeEntry && !isResetPassword && (
              <p className="text-right text-gray-300">
                <span
                  className="text-xs font-['Lucida_Sans'] font-bold cursor-pointer hover:text-white underline"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </span>
              </p>
            )}
            <button
              className="rounded-full bg-teal-600 text-white p-3 font-['Lucida_Sans'] shadow-md hover:shadow-none transition-shadow flex items-center justify-center"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : isResetPassword ? (
                'Reset Password'
              ) : isCodeEntry ? (
                'Verify Code'
              ) : isForgotPassword ? (
                'Send Reset Code'
              ) : isSignIn ? (
                'Sign In'
              ) : (
                'Sign Up'
              )}
            </button>
          </form>
          <p className="text-center text-gray-300 text-[12px] font-['Lucida_Sans']">
            {(isForgotPassword || isCodeEntry || isResetPassword) ? (
              <span
                className="ml-1 text-teal-600 text-xs underline font-extrabold cursor-pointer"
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsCodeEntry(false);
                  setIsResetPassword(false);
                  setIsSignIn(true);
                  setErrors({});
                }}
              >
                Back to Sign In
              </span>
            ) : isSignIn ? (
              <>
                Don't have an account?
                <span
                  className="ml-1 text-teal-600 text-xs underline font-extrabold cursor-pointer"
                  onClick={toggleForm}
                >
                  Sign up
                </span>
              </>
            ) : (
              <>
                Already have an account?
                <span
                  className="ml-1 text-teal-600 text-xs underline font-extrabold cursor-pointer"
                  onClick={toggleForm}
                >
                  Sign in
                </span>
              </>
            )}
          </p>
          
        </div>
      </div>
   
  );
};

export default LoginModal;