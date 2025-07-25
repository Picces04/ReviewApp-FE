import { Metadata } from 'next/types';
import Header from '../components/Header';

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
            <Header />
            {children}
        </div>
    );
}
