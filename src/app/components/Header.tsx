'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircleUser,
    faGear,
    faPlus,
    faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import Form from './Form';
import Link from 'next/link';
import api from '../axios/api';
import { useAppRouter } from '../routes/useAppRouter';
import { setUser, clearUser, setLoading } from '@/app/login/redux/userSlice';
import { RootState } from '@/app/login/redux/store';
import Cookies from 'js-cookie';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

const Header = () => {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { isLoggedIn, user, isLoading } = useTypedSelector(
        state => state.user
    );

    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { navigateToLogin } = useAppRouter();
    const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                dispatch(setLoading(true));

                // Không cần kiểm tra token trong cookie nữa
                const res = await api.get('/me', { withCredentials: true });

                if (res.data && res.data.username) {
                    dispatch(
                        setUser({
                            username: res.data.username,
                            zone: res.data.zone,
                        })
                    );
                } else {
                    dispatch(clearUser());
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error(
                        'Lỗi kiểm tra trạng thái đăng nhập:',
                        error.message
                    );
                } else {
                    console.error('Lỗi kiểm tra trạng thái đăng nhập:', error);
                }

                interface ApiError {
                    response?: {
                        status?: number;
                    };
                }

                if (
                    typeof error === 'object' &&
                    error &&
                    'response' in error &&
                    (error as ApiError).response?.status === 401
                ) {
                    console.log(
                        'Token không hợp lệ hoặc hết hạn, chuyển hướng đến login...'
                    );
                    dispatch(clearUser());
                    navigateToLogin();
                } else {
                    dispatch(clearUser());
                }
            } finally {
                dispatch(setLoading(false));
            }
        };

        if (!hasAttemptedLogin) {
            setHasAttemptedLogin(true);
            checkLoginStatus();
        }
    }, [dispatch, hasAttemptedLogin, navigateToLogin]);

    const openForm = () => {
        setIsOpen(true);
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout', {}, { withCredentials: true });
            Cookies.remove('token');
            dispatch(clearUser());
            navigateToLogin();
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
            Cookies.remove('token');
            dispatch(clearUser());
            navigateToLogin();
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
    };

    return (
        <>
            <div className="flex justify-between max-w-[1280px] sm:h-[121px] p-6 bg-white shadow-md rounded-2xl mb-4 m-auto">
                <div className="">
                    <Link
                        href={'/'}
                        className="drop-shadow-md text-[36px] mb-2 font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight cursor-pointer"
                    >
                        ReviewAny
                    </Link>
                    <p className="hidden sm:block text-[#372AAC] font-bold text-[16px] font-savate">
                        Discover and share local shopping experiences
                    </p>
                </div>
                <div className="flex items-center">
                    {pathname === '/profile' && (
                        <button
                            className="flex items-center font-extrabold text-white p-3 pl-6 pr-6 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 transition-colors duration-300 shadow-md cursor-pointer"
                            onClick={openForm}
                        >
                            <FontAwesomeIcon
                                icon={faPlus}
                                className="w-[20px] h-[20px] mr-1"
                            />
                            <p className="hidden sm:block">Write review</p>
                        </button>
                    )}
                </div>
                <div className="flex items-center">
                    {isLoading ? (
                        <div className="w-16 h-10 animate-pulse bg-gray-200 rounded-lg"></div>
                    ) : isLoggedIn && user ? (
                        <div className="relative flex items-center">
                            <div
                                className="flex items-center cursor-pointer"
                                onClick={toggleDropdown}
                            >
                                <FontAwesomeIcon
                                    icon={faCircleUser}
                                    style={{ color: '#03aa78' }}
                                    className="text-5xl"
                                />
                            </div>
                            {isDropdownOpen && (
                                <div
                                    className="absolute top-full mt-2 right-0 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                                    onMouseLeave={closeDropdown}
                                >
                                    <Link
                                        href={'/profile'}
                                        onClick={closeDropdown}
                                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200 w-full text-left"
                                    >
                                        <FontAwesomeIcon
                                            icon={faCircleUser}
                                            className="w-5 h-5 mr-2"
                                        />
                                        <p className="font-rubik font-normal">
                                            {user.username}
                                        </p>
                                    </Link>
                                    <hr className="m-auto w-[85%] h-[1px] text-gray-300"></hr>
                                    <Link
                                        href={'/setting'}
                                        onClick={closeDropdown}
                                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200 w-full text-left"
                                    >
                                        <FontAwesomeIcon
                                            icon={faGear}
                                            className="w-5 h-5 mr-2"
                                        />
                                        Setting
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            closeDropdown();
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 hover:text-red-800 transition-colors duration-200"
                                    >
                                        <FontAwesomeIcon
                                            icon={faSignOutAlt}
                                            className="w-5 h-5 mr-2"
                                        />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="flex items-center text-white rounded-lg bg-gradient-to-r from-[#3AAF9F] to-[#39B790] hover:opacity-90 transition-colors duration-300 shadow-md cursor-pointer">
                            <Link
                                href="/login"
                                className="p-3 pl-6 pr-6 text-lg font-rubik"
                            >
                                Login
                            </Link>
                        </button>
                    )}
                </div>
            </div>
            <Form isOpen={isOpen} setIsOpen={setIsOpen} user={user} />
        </>
    );
};

export default Header;
