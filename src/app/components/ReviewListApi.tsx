'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import api from '../axios/api';
import ReviewCard from './ReviewCard';

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

const ReviewListApi = () => {
    const pathname = usePathname();
    const categories = [
        'All',
        'Food',
        'Clothes',
        'Accessories',
        'Electronics',
        'Books',
        'Others',
    ];
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});

    const formatTimestamp = (timestamp?: string | { $date: string }) => {
        if (!timestamp) {
            console.warn('Invalid or missing timestamp:', timestamp);
            return 'Không có thời gian';
        }

        let dateString: string;
        if (typeof timestamp === 'object' && '$date' in timestamp) {
            dateString = timestamp.$date;
        } else if (typeof timestamp === 'string') {
            dateString = timestamp;
        } else {
            console.warn('Unsupported timestamp format:', timestamp);
            return 'Thời gian không hợp lệ';
        }

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn('Failed to parse timestamp:', dateString);
                return 'Thời gian không hợp lệ';
            }

            return date.toLocaleString('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
        } catch (error) {
            console.error(
                'Error parsing timestamp:',
                error,
                'Timestamp:',
                dateString
            );
            return 'Thời gian không hợp lệ';
        }
    };

    const loadData = useCallback(async () => {
        try {
            const endpoint =
                pathname === '/'
                    ? `/allItems?category=${selectedCategory === 'All' ? '' : selectedCategory}`
                    : `/profile?category=${selectedCategory === 'All' ? '' : selectedCategory}`;
            const data = await api.get(endpoint);
            setReviews(data.data);
        } catch (error) {
            console.error('Error loading reviews:', error);
            setReviews([]);
        }
    }, [pathname, selectedCategory]);

    const fetchLikeCounts = useCallback(async () => {
        if (reviews.length === 0) return;

        try {
            const ids = reviews.map(review => review._id.$oid);
            const res = await api.post('/likes/batch-count', ids);
            const counts = res.data.reduce(
                (
                    acc: { [key: string]: number },
                    item: { id: string; count: number }
                ) => {
                    acc[item.id] = item.count;
                    return acc;
                },
                {}
            );
            setLikeCounts(counts);
        } catch (err) {
            console.error('Failed to fetch like counts:', err);
        }
    }, [reviews]);

    const updateLikeCount = useCallback(async (id: string, count?: number) => {
        if (count !== undefined) {
            // Cập nhật từ phản hồi API /likes/toggle
            setLikeCounts(prev => ({ ...prev, [id]: count }));
        } else {
            // Lấy lại toàn bộ lượt thích
            try {
                const res = await api.post('/likes/batch-count', [id]);
                const newCount = res.data[0]?.count || 0;
                setLikeCounts(prev => ({ ...prev, [id]: newCount }));
            } catch (err) {
                console.error('Failed to update like count:', err);
            }
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        fetchLikeCounts();
    }, [fetchLikeCounts]);

    return (
        <div className="flex flex-wrap gap-6">
            <div className="flex flex-wrap gap-3 justify-center items-center w-full h-auto min-h-[60px] mb-4">
                {categories.map((category, index) => (
                    <button
                        key={index}
                        className={`font-rubik border-[1px] rounded-xl px-4 py-2 text-[14px] transition-colors duration-200 shadow-md hover:shadow-md cursor-pointer
                        ${
                            selectedCategory === category
                                ? 'text-white bg-gradient-to-r from-indigo-600 to-violet-600 border-transparent'
                                : 'text-[#503BDA] bg-white border-[#C6D2FF] hover:text-[#372AAC] hover:bg-[#F1F1F1]'
                        }
                        `}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {reviews.length === 0 ? (
                <p className="text-gray-700 w-full text-center">
                    Không có đánh giá nào cho danh mục này.
                </p>
            ) : (
                reviews.map(review => (
                    <ReviewCard
                        key={review._id.$oid}
                        review={review}
                        setSelectedCategory={setSelectedCategory}
                        formatTimestamp={formatTimestamp}
                        loadData={loadData}
                        likeCounts={likeCounts}
                        updateLikeCount={updateLikeCount}
                    />
                ))
            )}
        </div>
    );
};

export default ReviewListApi;
