'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Like from '../assets/img/like.svg';
import Haha from '../assets/img/haha.svg';
import Heart from '../assets/img/heart.svg';
import LoveLy from '../assets/img/lovely.svg';
import Wow from '../assets/img/wow.svg';
import Sad from '../assets/img/sad.svg';
import Angry from '../assets/img/angryy.svg';
import {
    faComment,
    faShare,
    faSquarePen,
    faStar as faStarSolid,
    faTrash,
    faUser,
} from '@fortawesome/free-solid-svg-icons';
import {
    faThumbsUp as farThumbsUp,
    faComment as farComment,
} from '@fortawesome/free-regular-svg-icons';
import { faShareFromSquare as farShareFromSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import api from '../axios/api';
import EditReviewModal from './EditReviewModal';

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

type ReviewCardProps = {
    review: Review;
    setSelectedCategory: (category: string) => void;
    formatTimestamp: (timestamp?: string | { $date: string }) => string;
    loadData: () => void;
    likeCounts: { [key: string]: number };
    updateLikeCount: (id: string, count: number) => void;
};

const ReviewCard = ({
    review,
    setSelectedCategory,
    formatTimestamp,
    loadData,
    likeCounts,
    updateLikeCount,
}: ReviewCardProps) => {
    const pathname = usePathname();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [react, setReact] = useState<{
        src: string;
        alt: string;
        color: string;
    } | null>(null);
    const [showReactions, setShowReactions] = useState(false);

    const hoverTimeout = useRef<NodeJS.Timeout | null>(null); // dùng ref để giữ timeout ID

    const reactions = React.useMemo(
        () => [
            { src: Like, alt: 'Thích', color: '#0566FF' },
            { src: Heart, alt: 'Yêu thích', color: '#FF6868' },
            { src: LoveLy, alt: 'Thương thương', color: '#F9CF00' },
            { src: Haha, alt: 'Haha', color: '#F9CF00' },
            { src: Wow, alt: 'Wow', color: '#F9CF00' },
            { src: Sad, alt: 'Buồn', color: '#F9CF00' },
            { src: Angry, alt: 'Phẫn nộ', color: '#FF6868' },
        ],
        []
    );

    // Lấy trạng thái react của người dùng từ API
    const fetchUserLike = React.useCallback(async () => {
        try {
            const res = await api.get(`/likes/user?id=${review._id.$oid}`);
            if (res.data && res.data.type) {
                const reaction = reactions.find(r => r.alt === res.data.type);
                if (reaction) {
                    setReact({
                        src: reaction.src,
                        alt: reaction.alt,
                        color: reaction.color,
                    });
                }
            } else {
                setReact(null);
            }
        } catch (err) {
            console.error('Lỗi khi lấy trạng thái react:', err);
            setReact(null);
        }
    }, [review._id.$oid, reactions]);
    useEffect(() => {
        fetchUserLike();
    }, [fetchUserLike]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            'Bạn có chắc chắn muốn xóa item này không ?'
        );
        if (!confirmDelete) return;

        try {
            await api.delete(`/deleteItem/${review._id.$oid}`);
            alert('Xóa thành công!');
            loadData();
        } catch (error) {
            console.error('Xóa thất bại:', error);
            alert('Xóa thất bại!');
        }
    };

    const handleReaction = async (reaction: {
        src: string;
        alt: string;
        color: string;
    }) => {
        try {
            const res = await api.post('/likes/toggle', {
                item_id: review._id.$oid,
                type: reaction.alt,
            });

            setReact({
                src: reaction.src,
                alt: reaction.alt,
                color: reaction.color,
            });
            setShowReactions(false);
            fetchUserLike();
            // Cập nhật tổng số lượt thích từ phản hồi API
            updateLikeCount(review._id.$oid, res.data.count);
        } catch (err) {
            console.error('Lỗi khi thả cảm xúc:', err);
        }
    };

    return (
        <div
            onMouseLeave={() => {
                if (hoverTimeout.current) {
                    clearTimeout(hoverTimeout.current); // rời chuột sớm thì không gọi
                    hoverTimeout.current = null;
                }
                setShowReactions(false);
            }}
            onClick={() => setShowReactions(false)}
            className="w-full lg:w-[calc(50%-16px)]"
        >
            <div className="text-[#503BDA] w-full">
                <div className="card rounded-t-2xl w-full h-[230px] relative overflow-hidden">
                    <Image
                        src={review.image}
                        alt={review.shop_name}
                        fill
                        className="w-full h-[230px] absolute top-0 object-cover rounded-t-2xl"
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33.33vw"
                        priority
                        unoptimized
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 rounded-t-2xl z-10"></div>
                    <button
                        onClick={() => setSelectedCategory(review.category)}
                        className="category absolute font-rubik top-3 left-3 px-3 py-0.5 bg-white rounded-xl border border-[#C6D2FF] z-20 cursor-pointer"
                    >
                        {review?.category && (
                            <>
                                {review.category.charAt(0).toUpperCase() +
                                    review.category.slice(1)}
                            </>
                        )}
                    </button>
                    <h3 className="absolute font-rubik bottom-10 left-3 text-xl text-white mb-0.5 z-20">
                        {review.shop_address}
                    </h3>
                    <div className="flex gap-2 mb-4 text-yellow-400 absolute bottom-2 left-3 z-20">
                        {Array.from({ length: 5 }, (_, i) => (
                            <FontAwesomeIcon
                                key={i}
                                icon={faStarSolid}
                                className={`text-[14px] cursor-pointer transition-colors duration-100 ${
                                    i < review.rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-5 pb-1 bg-white rounded-b-2xl">
                <div className="user flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-1 overflow-hidden">
                        <FontAwesomeIcon
                            className="text-3xl cursor-pointer"
                            icon={faUser}
                            style={{ color: '#503bd9' }}
                        />
                    </div>
                    <span className="font-rubik ml-2 text-lg text-[#503BDA]">
                        {review.name}
                    </span>
                </div>
                <div className="min-h-[48px]">
                    <p className="italic font-rubik text-gray-700 line-clamp-2 font-normal">
                        &quot;{review.review}...&quot;
                    </p>
                </div>
                <div className="flex items-center">
                    <span className="font-rubik text-sm text-gray-500">
                        {formatTimestamp(review.timestamp)}
                    </span>
                    {pathname === '/profile' && (
                        <>
                            <FontAwesomeIcon
                                className="text-3xl ml-auto cursor-pointer"
                                icon={faSquarePen}
                                style={{ color: '#03aa78' }}
                                onClick={() => setIsEditOpen(true)}
                            />
                            <FontAwesomeIcon
                                className="text-[26px] ml-3 cursor-pointer mb-[1px]"
                                icon={faTrash}
                                style={{ color: '#f34b3f' }}
                                onClick={handleDelete}
                            />
                        </>
                    )}
                    <EditReviewModal
                        review={review}
                        isOpen={isEditOpen}
                        onClose={() => setIsEditOpen(false)}
                        onUpdated={loadData}
                    />
                </div>
                <div className="flex justify-between mt-3">
                    <div className="flex flex-row items-center">
                        {likeCounts[review._id.$oid] > 0 ? (
                            <Image
                                src={Like}
                                alt="Like"
                                width={20}
                                height={20}
                                className="w-5 h-5 z-20 hover:cursor-pointer"
                            />
                        ) : null}

                        {react && react.alt !== 'Thích' ? (
                            <Image
                                src={react.src}
                                alt={react.alt}
                                width={20}
                                height={20}
                                className="w-5 h-5 ml-[-5px]"
                            />
                        ) : null}

                        <div className="ml-[3px] text-gray-500 hover:cursor-pointer hover:underline">
                            {likeCounts[review._id.$oid] || 0}
                        </div>
                    </div>
                    <div className="flex flex-row items-center">
                        <FontAwesomeIcon
                            icon={faComment}
                            style={{ color: '#a8abaf' }}
                        />
                        <div className="ml-[3px] text-gray-500 hover:cursor-pointer hover:underline">
                            10
                        </div>
                        <FontAwesomeIcon
                            icon={faShare}
                            style={{ color: '#a8abaf' }}
                            className="ml-4"
                        />
                        <div className="ml-[3px] text-gray-500 hover:cursor-pointer hover:underline">
                            10
                        </div>
                    </div>
                </div>
                <hr className="w-full text-[#ccc] mt-[6px]" />
                <div className="flex justify-between mt-1">
                    <button className="relative w-1/3 py-1 h-10 rounded-md hover:cursor-pointer hover:bg-gray-200">
                        <div
                            onClick={() => handleReaction(reactions[0])}
                            onMouseEnter={() => {
                                hoverTimeout.current = setTimeout(() => {
                                    setShowReactions(true);
                                }, 1000); // sau 1 giây mới hiển thị bảng cảm xúc
                            }}
                            className="relative group flex flex-row items-center justify-center h-full w-full "
                        >
                            {react ? (
                                <Image
                                    src={react.src}
                                    alt={react.alt}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 mr-1.5"
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={farThumbsUp}
                                    className="text-gray-400"
                                />
                            )}
                            <div
                                className={`font-rubik ml-[3px] ${react ? '' : 'text-gray-500'}`}
                                style={
                                    react ? { color: react.color } : undefined
                                }
                            >
                                {react ? react.alt : 'Thích'}
                            </div>
                        </div>
                        <div
                            className={`absolute top-[-38px] left-0 w-[282px] border border-gray-300 bg-white shadow-md p-1 rounded-4xl text-sm z-50 flex space-x-2 absolute-slide-up ${showReactions ? 'show-reactions' : ''}`}
                        >
                            {reactions.map((reaction, index) => (
                                <Image
                                    key={index}
                                    src={reaction.src}
                                    alt={reaction.alt}
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 reaction-icon cursor-pointer"
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleReaction(reaction);
                                        setShowReactions(false);
                                    }}
                                />
                            ))}
                        </div>
                    </button>
                    <button className="py-1 rounded-md flex flex-row items-center justify-center w-1/3 hover:cursor-pointer hover:bg-gray-200">
                        <FontAwesomeIcon
                            icon={farComment}
                            style={{ color: '#a8abaf' }}
                        />
                        <div className="font-rubik ml-2 text-gray-500 hover:cursor-pointer">
                            Bình luận
                        </div>
                    </button>
                    <button className="py-1 rounded-md flex flex-row items-center justify-center w-1/3 hover:cursor-pointer hover:bg-gray-200">
                        <FontAwesomeIcon
                            icon={farShareFromSquare}
                            style={{ color: '#a8abaf' }}
                        />
                        <div className="font-rubik ml-2 text-gray-500 hover:cursor-pointer">
                            Chia sẻ
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
