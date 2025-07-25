import { useRouter } from 'next/navigation';

export const useAppRouter = () => {
    const router = useRouter();

    const navigateToLogin = () => {
        router.push('/login');
    };

    // Hàm điều hướng chung, có thể sử dụng cho các route khác
    const navigateTo = path => {
        router.push(path);
    };

    return {
        navigateToLogin,
        navigateTo,
    };
};
