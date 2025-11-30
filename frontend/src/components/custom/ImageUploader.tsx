import { useState, useRef } from "react";
import { useApi } from "@/context/APIContext";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface ImageUploaderProps {
    onImageUploaded: (imageUrl: string) => void;
    currentImageUrl?: string;
}

export const ImageUploader = ({ onImageUploaded, currentImageUrl }: ImageUploaderProps) => {
    const { uploadImage } = useApi();
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!validTypes.includes(file.type)) {
            setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        setError("");

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        setUploading(true);
        try {
            const response = await uploadImage(file);
            const imageUrl = response.imageUrl as string;
            onImageUploaded(imageUrl);
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Failed to upload image");
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            // Create a synthetic event to reuse handleFileSelect
            const syntheticEvent = {
                target: { files: [file] },
            } as React.ChangeEvent<HTMLInputElement>;
            handleFileSelect(syntheticEvent);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive" className="animate-shake">
                    {error}
                </Alert>
            )}

            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-300"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {preview ? (
                    <div className="space-y-3">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {uploading ? "Uploading..." : "Click or drag to change image"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        <div className="text-gray-600 dark:text-gray-400">
                            <p className="text-sm font-medium">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs">PNG, JPG, GIF, or WebP up to 5MB</p>
                        </div>
                    </div>
                )}

                {uploading && (
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-full"></div>
                        </div>
                    </div>
                )}
            </div>

            {preview && !uploading && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        onImageUploaded("");
                        if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                        }
                    }}
                    className="w-full transition-all duration-300 hover:scale-105"
                >
                    Remove Image
                </Button>
            )}
        </div>
    );
};
