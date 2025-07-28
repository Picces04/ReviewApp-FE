import { Metadata } from 'next/types';
import Header from '../components/Header';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Profile | ReviewApp',
};
export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="profile-layout">
            <Suspense
                fallback={<div className="text-center">Đang tải ...</div>}
            >
                <Header />
            </Suspense>
            {children}
        </div>
    );
}
