import api from "./api";

export const uploadApi = {
    uploadImage: (file: File): Promise<{ imageUrl: string }> => {
        const formData = new FormData();
        formData.append("image", file);
        return api.post("/upload/image", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then(r => r.data);
    },
};
