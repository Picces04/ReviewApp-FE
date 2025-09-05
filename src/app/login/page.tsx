'use client';

import {
    faGoogle,
    faGithub,
    faFacebookF,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import api from '@/app/axios/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from '@/app/login/redux/userSlice';

const Login = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [isSignUp, setIsSignUp] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [hasInteracted, setHasInteracted] = useState(false);
    const [formData, setFormData] = useState({
        Email: '',
        Password: '',
        ConfirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'ConfirmPassword') {
            if (value !== formData.Password) {
                setPasswordError('Passwords không trùng nhau');
            } else {
                setPasswordError('');
            }
        }
        if (name === 'Password' && formData.ConfirmPassword) {
            if (value !== formData.ConfirmPassword) {
                setPasswordError('Passwords không trùng nhau');
            } else {
                setPasswordError('');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSignUp && formData.Password !== formData.ConfirmPassword) {
            setPasswordError('Passwords không trùng nhau');
            return;
        }

        const form = new FormData(e.target as HTMLFormElement);
        const email = form.get('Email');
        const password = form.get('Password');
        const endpoint = isSignUp ? '/register' : '/login';

        try {
            dispatch(setLoading(true));
            if (isSignUp) {
                await api.post(endpoint, {
                    email,
                    password,
                    username: (email as string).split('@')[0],
                });
                alert('Đăng ký thành công, vui lòng đăng nhập.');
                setIsSignUp(false);
            } else {
                await api.post(endpoint, { email, password });
                const meRes = await api.get('/me', { withCredentials: true });
                if (meRes.data && meRes.data.username) {
                    dispatch(
                        setUser({
                            username: meRes.data.username,
                            zone: meRes.data.zone,
                        })
                    );
                    console.log('Login successful, redirecting to home...');
                    router.push('/');
                } else {
                    throw new Error('Không lấy được thông tin người dùng');
                }
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const message =
                    err.response?.data?.detail ||
                    err.response?.data?.message ||
                    'Lỗi xác thực, vui lòng kiểm tra email và mật khẩu';
                alert(message);
            } else {
                alert('Lỗi không xác định.');
            }
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="bg-[#E5EBFF] flex items-center justify-center ">
            <div className="w-full max-w-[1280px] px-4">
                <div className="flex flex-col md:flex-row items-center justify-center min-h-[600px]">
                    <div className="flex relative w-full max-w-[950px] min-h-[400px] md:min-h-[600px] bg-white rounded-xl shadow-lg overflow-hidden">
                        <form
                            onSubmit={handleSubmit}
                            className={`flex flex-col justify-center items-center w-full md:w-[590px] md:py-5 bg-white transition-transform duration-700 ease-in-out transform ${isSignUp ? 'md:translate-x-[360px]' : 'md:translate-x-0'}`}
                        >
                            <h1 className="mb-6 text-[#41B49F] text-2xl sm:text-3xl md:text-4xl font-rubik font-semibold text-center">
                                {isSignUp
                                    ? 'Create Account'
                                    : 'Sign in to ReviewApp'}
                            </h1>
                            <div className="flex mb-4">
                                {[faGoogle, faGithub, faFacebookF].map(
                                    (icon, i) => (
                                        <button
                                            type="button"
                                            key={i}
                                            className="flex justify-center items-center w-10 h-10 mr-3 border border-gray-300 rounded-full hover:bg-gray-100 transition duration-300"
                                        >
                                            <FontAwesomeIcon
                                                icon={icon}
                                                className={`text-lg ${i === 1 ? 'ml-[1px]' : ''}`}
                                            />
                                        </button>
                                    )
                                )}
                            </div>
                            <p className="mb-4 text-gray-400 font-rubik text-sm sm:text-base">
                                or use your email account
                            </p>
                            {(
                                [
                                    'Email',
                                    'Password',
                                ] as (keyof typeof formData)[]
                            ).map((placeholder, i) => (
                                <input
                                    key={i}
                                    name={placeholder}
                                    type={
                                        placeholder === 'Password'
                                            ? 'password'
                                            : 'email'
                                    }
                                    placeholder={placeholder}
                                    value={formData[placeholder]}
                                    onChange={handleInputChange}
                                    className="w-[80%] sm:w-[60%] px-4 py-2 mb-3 rounded-md bg-[#F4F8F7] text-sm sm:text-base"
                                    required
                                />
                            ))}
                            {isSignUp && (
                                <>
                                    <input
                                        type="password"
                                        name="ConfirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.ConfirmPassword}
                                        onChange={handleInputChange}
                                        className="w-[80%] sm:w-[60%] px-4 py-2 mb-3 rounded-md bg-[#F4F8F7] text-sm sm:text-base"
                                        required
                                    />
                                    {passwordError && (
                                        <p className="text-red-500 text-sm mt-1 w-[80%] sm:w-[60%] text-left">
                                            {passwordError}
                                        </p>
                                    )}
                                </>
                            )}
                            <a
                                href="#"
                                className="mb-6 mt-2 text-sm sm:text-base hover:underline"
                            >
                                Forgot your password?
                            </a>
                            <button
                                type="submit"
                                disabled={isSignUp && !!passwordError}
                                className={`font-rubik tracking-wider px-15 py-2 bg-gradient-to-r from-[#41B49F] to-[#3AA7AE] text-white rounded-[2rem] transition-opacity duration-300 text-sm sm:text-base ${isSignUp && passwordError ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
                            >
                                {isSignUp ? 'SIGN UP' : 'SIGN IN'}
                            </button>
                        </form>
                        <div
                            className={`hidden md:flex flex-col absolute h-full w-full md:w-[360px] right-0 justify-center items-center bg-gradient-to-tr transition-transform duration-700 ease-in-out transform animate-panel ${isSignUp ? 'translate-x-[-590px] from-[#3AAF9F] to-[#39B790]' : 'translate-x-0 from-[#3AAF9D] to-[#3AA7AE]'}`}
                        >
                            <h1 className="mb-6 text-white text-2xl md:text-4xl font-rubik font-semibold">
                                {isSignUp ? 'Welcome Back' : 'Hello, Friend!'}
                            </h1>
                            <p className="mb-4 w-[220px] text-sm md:text-[14px] text-white font-rubik text-center">
                                {isSignUp
                                    ? 'To keep connected with us please login with your personal info'
                                    : 'Enter your personal details and start journey with us'}
                            </p>

                            {/* Button sign-in , sign-up */}
                            <button
                                type="button"
                                className="font-rubik tracking-wider px-15 py-2 border border-white text-white rounded-[2rem] hover:opacity-90 transition-opacity duration-300 cursor-pointer text-sm md:text-base"
                                onClick={() => {
                                    setIsSignUp(prev => !prev);
                                    setHasInteracted(true);
                                }}
                            >
                                {isSignUp ? 'SIGN IN' : 'SIGN UP'}
                            </button>
                        </div>
                    </div>
                    <div className="md:hidden flex justify-center mt-4">
                        <button
                            type="button"
                            className="font-rubik tracking-wider px-6 py-2 border border-[#41B49F] text-[#41B49F] rounded-[2rem] hover:bg-[#41B49F] hover:text-white transition-all duration-300 text-sm sm:text-base"
                            onClick={() => {
                                setIsSignUp(prev => !prev);
                                setHasInteracted(true);
                            }}
                        >
                            {isSignUp ? 'SIGN IN' : 'SIGN UP'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
