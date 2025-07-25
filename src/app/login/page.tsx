'use client';

import {
    faGoogle,
    faGithub,
    faFacebookF,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import api from '../axios/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Login = () => {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
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

        // Kiểm tra password trước khi submit
        if (isSignUp && formData.Password !== formData.ConfirmPassword) {
            setPasswordError('Passwords không trùng nhau');
            return;
        }

        const form = new FormData(e.target as HTMLFormElement);
        const email = form.get('Email');
        const password = form.get('Password');
        const endpoint = isSignUp ? '/register' : '/login';

        try {
            await api.post(endpoint, { email, password });

            if (isSignUp) {
                alert('Đăng ký thành công, vui lòng đăng nhập.');
                setIsSignUp(false);
            } else {
                // Token đã được lưu trong cookie bởi backend, không cần lưu ở đây
                console.log('Login successful, redirecting with useRouter...');
                router.push('/');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const message =
                    err.response?.data?.detail ||
                    err.response?.data?.message ||
                    'Link ngrok sai hoặc là xác thực link ngrok đi';
                alert(message);
            } else {
                alert('Lỗi không xác định.');
            }
        }
    };

    return (
        <div className="main bg-[#E5EBFF] min-h-screen h-full ">
            <div className="max-w-[1280px] m-auto">
                <div className="min-w-[76%] flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="flex relative w-[950px] min-h-[600px] bg-white rounded-xl shadow-lg overflow-hidden">
                        <form
                            onSubmit={handleSubmit}
                            className={`flex flex-col justify-center items-center w-[590px] bg-white transition-transform duration-700 ease-in-out transform ${isSignUp ? 'translate-x-[360px]' : 'translate-x-0'}`}
                        >
                            <h1 className="mb-6 text-[#41B49F] text-4xl font-rubik font-semibold">
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
                                            className="flex justify-center items-center w-[40px] h-[40px] mr-3 border border-gray-300 rounded-full hover:bg-gray-100 transition duration-300"
                                        >
                                            <FontAwesomeIcon
                                                icon={icon}
                                                className={`text-[20px] ${i === 1 ? 'ml-[1px]' : ''}`}
                                            />
                                        </button>
                                    )
                                )}
                            </div>
                            <p className="mb-4 text-gray-400 font-rubik">
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
                                    className="w-[60%] px-4 py-2 mb-3 rounded-md bg-[#F4F8F7]"
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
                                        className="w-[60%] px-4 py-2 mb-3 rounded-md bg-[#F4F8F7]"
                                        required
                                    />
                                    {passwordError && (
                                        <p className="text-red-500 text-sm mt-1 w-[60%] text-left">
                                            {passwordError}
                                        </p>
                                    )}
                                </>
                            )}
                            <a href="#" className="mb-8 mt-2">
                                Forgot your password ?
                            </a>
                            <button
                                type="submit"
                                disabled={isSignUp && !!passwordError}
                                className={`font-rubik tracking-wider px-15 py-2 bg-gradient-to-r from-[#41B49F] to-[#3AA7AE] text-white rounded-4xl transition-opacity duration-300 ${isSignUp && passwordError ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`}
                            >
                                {isSignUp ? 'SIGN UP' : 'SIGN IN'}
                            </button>
                        </form>
                        <div
                            className={`flex flex-col absolute h-full w-[360px] right-0 justify-center items-center bg-gradient-to-tr transition-transform duration-700 ease-in-out transform ${hasInteracted ? (isSignUp ? 'animate-stretch-shrink' : 'animate-stretch-shrinkLeft') : ''} ${isSignUp ? '-translate-x-[590px] from-[#3AAF9F] to-[#39B790]' : '-translate-x-0 from-[#3AAF9D] to-[#3AA7AE]'}`}
                        >
                            <h1 className="mb-6 text-white text-4xl font-rubik font-semibold">
                                {isSignUp ? 'Welcome Back' : 'Hello, Friend!'}
                            </h1>
                            <p className="mb-4 w-[220px] text-[14px] text-white font-rubik text-center">
                                {isSignUp
                                    ? 'To keep connected with us please login with your personal info'
                                    : 'Enter your personal details and start journey with us'}
                            </p>
                            <button
                                type="button"
                                className="font-rubik tracking-wider px-15 py-2 border border-white text-white rounded-4xl hover:opacity-90 transition-opacity duration-300 cursor-pointer"
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
        </div>
    );
};

export default Login;
