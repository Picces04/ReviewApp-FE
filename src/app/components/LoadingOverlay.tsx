import React from 'react';

type LoadingOverlayProps = {
    isLoading: boolean;
};

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
            <div className="w-12 h-12 border-4 border-t-[#55e19f] border-transparent rounded-full animate-spin"></div>
        </div>
    );
};

export default LoadingOverlay;
