'use client';

import {
    faClose,
    faStar as faStarSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import api from '../axios/api';
import { uploadToCloudinary } from '../axios/uploadToCloudinary';

type Props = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    user: { username?: string } | null;
};

const Form = ({ isOpen, setIsOpen, user }: Props) => {
    const username = user?.username ?? '';
    const [formData, setFormData] = useState({
        name: '',
        shopName: '',
        shopAddress: '',
        category: '',
        reviewText: '',
        selectedRating: 0,
        preview: null as string | null,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        isError: boolean;
    } | null>(null);
    const [isNotificationExiting, setIsNotificationExiting] = useState(false);

    useEffect(() => {
        setFormData({
            name: username,
            shopName: '',
            shopAddress: '',
            category: '',
            reviewText: '',
            selectedRating: 0,
            preview: null,
        });
        setErrors({});
        setSelectedFile(null);
        setMessage(null);
        setIsNotificationExiting(false);
    }, [username]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflowY = 'hidden';
            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflowY = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflowY = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: username,
            shopName: '',
            shopAddress: '',
            category: '',
            reviewText: '',
            selectedRating: 0,
            preview: null,
        });
        setSelectedFile(null);
        setErrors({});
        setMessage(null);
        setIsNotificationExiting(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    preview: reader.result as string,
                }));
                setSelectedFile(file);
                setErrors(prev => ({ ...prev, preview: '' }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleRatingChange = (starValue: number) => {
        setFormData(prev => ({
            ...prev,
            selectedRating: starValue,
        }));
        setErrors(prev => ({ ...prev, rating: '' }));
    };

    const handleNotificationClose = () => {
        setIsNotificationExiting(true);
        setTimeout(() => {
            setMessage(null);
            setIsNotificationExiting(false);
        }, 500);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (formData.selectedRating === 0)
            newErrors.rating = 'Vui lòng chọn số sao đánh giá';
        if (!formData.preview) newErrors.preview = 'Vui lòng tải lên hình ảnh';
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0 || !selectedFile) {
            setMessage({
                text: 'Vui lòng điền đầy đủ thông tin!',
                isError: true,
            });
            return;
        }

        setIsLoading(true);

        try {
            const uploadedImageUrl = await uploadToCloudinary(selectedFile);
            if (!uploadedImageUrl) {
                throw new Error('Upload failed');
            }

            const reviewData = {
                name: formData.name,
                shop_name: formData.shopName,
                shop_address: formData.shopAddress,
                rating: formData.selectedRating,
                review: formData.reviewText,
                image: uploadedImageUrl,
                category: formData.category,
                timestamp: new Date().toISOString(),
            };

            await api.post('/insertItems', reviewData);
            setMessage({
                text: 'Thêm thành công!',
                isError: false,
            });
            setTimeout(() => {
                handleNotificationClose();
                resetForm();
                setIsOpen(false);
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Lỗi khi lưu đánh giá:', error);
            setMessage({
                text: ' Lưu đánh giá lỗi!',
                isError: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 z-[1000] font-poppins text-indigo-700 h-full w-full min-h-screen backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative bg-white shadow-md rounded-2xl max-w-[450px] w-full">
                <form
                    className="flex flex-col gap-4 max-h-screen h-[650px] font-rubik"
                    onSubmit={handleSubmit}
                >
                    <header className="p-4 w-full border-b border-[#C6D2FF] top-0 bg-white z-10 rounded-t-2xl">
                        <h2 className="text-[20px] font-bold text-[#03AA78]">
                            Write a Review
                        </h2>
                        <FontAwesomeIcon
                            icon={faClose}
                            className="text-2xl absolute top-5 right-4 w-5 h-5 cursor-pointer hover:text-red-400"
                            onClick={handleClose}
                        />
                    </header>

                    <div className="flex flex-col pr-6 pl-6 pb-6 pt-0 overflow-y-auto">
                        <label htmlFor="name" className="mb-1 text-[#03AA78]">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="font-rubik px-4 py-3 bg-[#ebeffc] border-[#C6D2FF] border-[1px] mb-1 rounded-md"
                            required
                            readOnly
                            tabIndex={-1}
                        />

                        <label
                            htmlFor="shopName"
                            className="mb-1 text-[#03AA78]"
                        >
                            Shop Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="shopName"
                            type="text"
                            name="shopName"
                            placeholder="Shop name"
                            value={formData.shopName}
                            onChange={handleChange}
                            className="font-rubik px-4 py-3 border-[#C6D2FF] border-[1px] mb-1 rounded-md"
                            required
                        />

                        <label
                            htmlFor="shopAddress"
                            className="mb-1 text-[#03AA78]"
                        >
                            Shop Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="shopAddress"
                            type="text"
                            name="shopAddress"
                            placeholder="Shop address"
                            value={formData.shopAddress}
                            onChange={handleChange}
                            className="font-rubik px-4 py-3 border-[#C6D2FF] border-[1px] mb-1 rounded-md"
                            required
                        />

                        <label htmlFor="rating" className="mb-1 text-[#03AA78]">
                            Rating <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 mb-1 text-yellow-400">
                            {Array.from({ length: 5 }, (_, index) => {
                                const starValue = index + 1;
                                return (
                                    <FontAwesomeIcon
                                        key={index}
                                        icon={
                                            starValue <= formData.selectedRating
                                                ? faStarSolid
                                                : faStarRegular
                                        }
                                        className="text-2xl cursor-pointer hover:text-yellow-500 transition-colors duration-100"
                                        onClick={() =>
                                            handleRatingChange(starValue)
                                        }
                                    />
                                );
                            })}
                        </div>
                        {errors.rating && (
                            <p className="font-rubik text-red-500 text-sm mb-4">
                                {errors.rating}
                            </p>
                        )}

                        <label
                            htmlFor="category"
                            className="mb-1 text-[#03AA78]"
                        >
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="w-full px-4 py-3 mb-1 border border-[#C6D2FF] rounded-md"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select --</option>
                            <option value="Food">Food</option>
                            <option value="Clothes">Clothes</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Books">Books</option>
                            <option value="Others">Others</option>
                        </select>

                        <label
                            htmlFor="reviewText"
                            className="mb-1 text-[#03AA78]"
                        >
                            Review <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="reviewText"
                            name="reviewText"
                            className="font-rubik w-full min-h-[100px] p-2 border border-[#C6D2FF] rounded-md mb-1"
                            rows={5}
                            placeholder="Write your review here..."
                            value={formData.reviewText}
                            onChange={handleChange}
                            required
                        />

                        <label
                            htmlFor="imageUpload"
                            className="mb-1 text-[#03AA78]"
                        >
                            Upload Photos{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 flex items-center mb-1">
                            <input
                                id="imageUpload"
                                name="imageUpload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="imageUpload"
                                className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-lg border border-indigo-200 flex items-center transition duration-200"
                            >
                                <svg
                                    stroke="currentColor"
                                    fill="currentColor"
                                    strokeWidth="0"
                                    viewBox="0 0 24 24"
                                    className="mr-2 h-5 w-5"
                                    height="1em"
                                    width="1em"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                    <path d="M21 6h-3.17L16 4h-6v2h5.12l1.83 2H21v12H5v-9H3v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM8 14c0 2.76 2.24 5 5 5s5-2.24 5-5-2.24-5-5-5-5 2.24-5 5zm5-3c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zM5 6h3V4H5V1H3v3H0v2h3"></path>
                                </svg>
                                Upload Photos
                            </label>
                            {formData.preview && (
                                <div className="ml-3">
                                    <Image
                                        src={formData.preview}
                                        alt="Preview"
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-cover rounded-lg border border-indigo-200"
                                        onError={() =>
                                            setFormData(prev => ({
                                                ...prev,
                                                preview:
                                                    'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg',
                                            }))
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        {errors.preview && (
                            <p className="text-red-500 text-sm mb-4">
                                {errors.preview}
                            </p>
                        )}
                    </div>

                    <footer className="flex justify-end border-t border-[#C6D2FF] px-6 py-2 bg-[#E5EBFF] rounded-b-2xl">
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                                <div className="w-12 h-12 border-4 border-t-[#55e19f] border-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <button
                            type="button"
                            className="px-3 mr-4 bg-white border-[#C6D2FF] border-[1px] text-indigo-700 rounded-md hover:bg-[#F1F1F1] transition-colors duration-300 cursor-pointer"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-[#3AAF9F] to-[#39B790] text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors duration-300 cursor-pointer"
                            disabled={isLoading}
                        >
                            Submit Review
                        </button>
                    </footer>
                </form>

                {message && (
                    <div className="fixed z-50 bottom-5 right-10 pointer-events-auto">
                        <div
                            className={`relative w-[200px] ${isNotificationExiting ? 'animate-notification-exit' : 'animate-notification-enter'}`}
                        >
                            <FontAwesomeIcon
                                icon={faClose}
                                className="text-2xl absolute top-[1px] right-1 text-white w-3 h-3 cursor-pointer hover:text-red-400 pointer-events-auto"
                                onClick={handleNotificationClose}
                            />
                            <div
                                className={`mb-4 p-3 pr-6 rounded-md text-white text-center font-rubik ${
                                    message.isError
                                        ? 'bg-red-500'
                                        : 'bg-green-500'
                                }`}
                            >
                                {message.text}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Form;
