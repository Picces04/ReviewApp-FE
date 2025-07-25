import axios from 'axios';
import api from './api';

// Hàm trích xuất public ID từ URL của Cloudinary
const getPublicIdFromUrl = (url: string): string | null => {
    try {
        const regex = /\/v\d+\/(.+?)(?:\.\w+)?$/;
        const match = url.match(regex);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Lỗi khi trích xuất public ID:', error);
        return null;
    }
};

// Hàm xóa ảnh trên Cloudinary thông qua endpoint backend
const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        const response = await api.post('/api/deleteImage', { publicId });
        if (response.status === 200) {
            console.log('Xóa ảnh thành công:', publicId);
        } else {
            console.error('Xóa ảnh thất bại:', response.statusText);
        }
    } catch (error) {
        console.error('Lỗi khi xóa ảnh trên Cloudinary:', error);
    }
};

// Hàm upload ảnh mới và xóa ảnh cũ nếu có
export const uploadToCloudinary = async (
    file: File,
    oldImageUrl?: string
): Promise<string | null> => {
    try {
        // Xóa ảnh cũ nếu có oldImageUrl
        if (oldImageUrl) {
            const publicId = getPublicIdFromUrl(oldImageUrl);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        }

        // Upload ảnh mới
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'dwnr8zfxz'); // Upload preset không ký
        formData.append('cloud_name', 'dwnr8zfxz'); // Cloud name

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/dwnr8zfxz/image/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.status === 200) {
            console.log(
                'Ảnh đã upload lên Cloudinary:',
                response.data.secure_url
            );
            return response.data.secure_url;
        } else {
            console.error('Lỗi khi upload:', response.data);
            alert('Lỗi khi upload ảnh lên Cloudinary');
            return null;
        }
    } catch (err) {
        console.error('Lỗi kết nối:', err);
        alert('Có lỗi xảy ra khi upload ảnh');
        return null;
    }
};
