/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/dwnr8zfxz/image/upload/**',
            },
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
                pathname: '/t/p/**', // Đường dẫn cụ thể cho hình ảnh từ TMDB
            },
        ],
    },
};

export default nextConfig;
