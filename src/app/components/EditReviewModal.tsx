'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClose,
    faStar as faStarSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import api from '../axios/api';
import { uploadToCloudinary } from '../axios/uploadToCloudinary';
import LoadingOverlay from './LoadingOverlay';

type Review = {
    _id: { $oid: string };
    name: string;
    shop_name: string;
    shop_address: string;
    rating: number;
    review: string;
    image: string;
    category: string;
    timestamp?: string | { $date: string };
};

type EditReviewModalProps = {
    review: Review;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
};

const EditReviewModal = ({
    review,
    isOpen,
    onClose,
    onUpdated,
}: EditReviewModalProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        name: review.name,
        shop_name: review.shop_name,
        shop_address: review.shop_address,
        rating: review.rating,
        review: review.review,
        image: review.image,
        category: review.category,
    });
    const [preview, setPreview] = useState<string | null>(review.image || null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        isError: boolean;
    } | null>(null);
    const [isNotificationExiting, setIsNotificationExiting] = useState(false);

    // Đồng bộ form với props review khi review thay đổi
    useEffect(() => {
        setForm({
            name: review.name,
            shop_name: review.shop_name,
            shop_address: review.shop_address,
            rating: review.rating,
            review: review.review,
            image: review.image,
            category: review.category,
        });
        setPreview(review.image || null);
        setSelectedFile(null);
        setMessage(null);
        setIsNotificationExiting(false);
    }, [review]);

    // Quản lý overflow của body khi modal mở/đóng
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

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
                setForm(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRatingChange = (starValue: number) => {
        setForm(prev => ({ ...prev, rating: starValue }));
    };

    const handleNotificationClose = () => {
        setIsNotificationExiting(true);
        setTimeout(() => {
            setMessage(null);
            setIsNotificationExiting(false);
        }, 500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        let imageUrl = form.image;
        if (selectedFile) {
            try {
                // Truyền URL ảnh cũ để xóa trước khi upload ảnh mới
                const uploadedUrl = await uploadToCloudinary(
                    selectedFile,
                    review.image
                );
                if (!uploadedUrl) throw new Error('Upload failed');
                imageUrl = uploadedUrl;
            } catch (err) {
                console.error('Lỗi khi upload ảnh:', err);
                setIsLoading(false);
                setMessage({ text: 'Tải ảnh lên thất bại!', isError: true });
                return;
            }
        }

        try {
            await api.put(`/updateItem/${review._id.$oid}`, {
                ...form,
                image: imageUrl,
                timestamp: new Date().toISOString(),
            });
            setForm(prev => ({ ...prev, image: imageUrl }));
            setIsLoading(false);
            setMessage({ text: 'Cập nhật thành công!', isError: false });
            setTimeout(() => {
                handleNotificationClose();
                onUpdated();
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Cập nhật thất bại:', error);
            setIsLoading(false);
            setMessage({ text: 'Cập nhật thất bại!', isError: true });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 left-0 z-[1000] font-poppins text-indigo-700 h-full w-full min-h-screen backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 overscroll-contain">
            <div className="relative bg-white shadow-md rounded-2xl max-w-[450px] w-full">
                <div className="flex flex-col gap-4 max-h-screen h-[650px]">
                    <header className="p-4 w-full text-[#03AA78] border-b border-[#C6D2FF] top-0 bg-white z-10 rounded-t-2xl">
                        <h2 className="text-[20px] font-bold">Update Review</h2>
                        <FontAwesomeIcon
                            icon={faClose}
                            className="text-2xl absolute top-5 right-4 w-5 h-5 cursor-pointer hover:text-red-400"
                            onClick={onClose}
                        />
                    </header>

                    <div className="flex flex-col pr-6 pl-6 pb-6 pt-0 overflow-y-auto">
                        <label
                            htmlFor="name"
                            className="mb-1 text-[#03AA78] font-rubik"
                        >
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Tên của bạn"
                            value={form.name}
                            onChange={handleChange}
                            className="font-rubik px-4 py-3 bg-[#e0e5f6] border-[#C6D2FF] border-[1px] mb-3 rounded-md"
                            readOnly
                            tabIndex={-1}
                        />

                        <label
                            htmlFor="shopName"
                            className="mb-1 text-[#03AA78] font-rubik"
                        >
                            Shop Name
                        </label>
                        <input
                            id="shopName"
                            type="text"
                            name="shop_name"
                            placeholder="Tên cửa hàng"
                            value={form.shop_name}
                            onChange={handleChange}
                            className="font-rubik px-4 py-3 border-[#C6D2FF] border-[1px] mb-3 rounded-md"
                        />

                        <label
                            htmlFor="shopAddress"
                            className="mb-1 text-[#03AA78] font-rubik"
                        >
                            Shop Address
                        </label>
                        <input
                            id="shopAddress"
                            type="text"
                            name="shop_address"
                            placeholder="Địa chỉ cửa hàng"
                            value={form.shop_address}
                            onChange={handleChange}
                            className="font-rubik px-4 py-3 border-[#C6D2FF] border-[1px] mb-3 rounded-md"
                        />

                        <label
                            htmlFor="rating"
                            className="mb-1 text-[#03AA78] font-rubik"
                        >
                            Rating
                        </label>
                        <div className="flex gap-2 mb-3 text-yellow-400">
                            {Array.from({ length: 5 }, (_, index) => {
                                const starValue = index + 1;
                                return (
                                    <FontAwesomeIcon
                                        key={index}
                                        icon={
                                            starValue <= form.rating
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

                        <label
                            htmlFor="category"
                            className="mb-1 text-[#03AA78] font-rubik"
                        >
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="w-full px-4 py-3 mb-3 border border-[#C6D2FF] rounded-md font-rubik"
                            value={form.category}
                            onChange={handleChange}
                        >
                            <option value="">-- Chọn --</option>
                            <option value="Food">Food</option>
                            <option value="Clothes">Clothes</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Books">Books</option>
                            <option value="Others">Others</option>
                        </select>

                        <label
                            htmlFor="reviewText"
                            className="mb-1 text-[#03AA78] font-rubik"
                        >
                            Review
                        </label>
                        <textarea
                            id="reviewText"
                            name="review"
                            className="font-rubik w-full min-h-[100px] p-2 border border-[#C6D2FF] rounded-md mb-3"
                            rows={5}
                            placeholder="Viết đánh giá của bạn tại đây..."
                            value={form.review}
                            onChange={handleChange}
                        />

                        <label
                            htmlFor="imageUpload"
                            className="mb-1 font-rubik text-[#03AA78]"
                        >
                            Upload Photos
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
                                Upload photo
                            </label>
                            {preview && (
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 ml-3 object-cover rounded-lg border border-indigo-200"
                                />
                            )}
                        </div>
                    </div>

                    <footer className="flex justify-end border-t border-[#C6D2FF] px-6 py-2 bg-[#E5EBFF] rounded-b-2xl">
                        <LoadingOverlay isLoading={isLoading} />
                        <button
                            type="button"
                            className="font-rubik px-3 mr-4 bg-white border-[#C6D2FF] border-[1px] text-indigo-700 rounded-md hover:bg-[#F1F1F1] transition-colors duration-300 cursor-pointer"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="font-rubik bg-gradient-to-r from-[#3AAF9F] to-[#39B790] text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors duration-300 cursor-pointer"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            Update
                        </button>
                    </footer>
                </div>
            </div>

            {/* Thông báo  */}
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
                                message.isError ? 'bg-red-500' : 'bg-green-500'
                            }`}
                        >
                            {message.text}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditReviewModal;
