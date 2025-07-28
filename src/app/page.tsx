import { Metadata } from 'next';
import { Suspense } from 'react';
import Header from './components/Header';
import ReviewListApi from './components/ReviewListApi';

export const metadata: Metadata = {
    title: 'ReviewApp',
};

// Ngăn prerender nếu cần dùng hook client như usePathname, useSearchParams
export const dynamic = 'force-dynamic';

export default function Home() {
    return (
        <div className="main bg-[#E5EBFF] min-h-screen h-full">
            <div className="max-w-[1280px] m-auto">
                <Header />
                <div className="min-h-[600px]">
                    <Suspense
                        fallback={
                            <div className="text-center">
                                Đang tải đánh giá...
                            </div>
                        }
                    >
                        <ReviewListApi />
                    </Suspense>
                </div>
                <div className="mt-10 left-1/3 right-1/3 footer flex items-center justify-center">
                    <p className="text-sm text-gray-500 mt-auto">
                        © 2025 ReviewAny. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
