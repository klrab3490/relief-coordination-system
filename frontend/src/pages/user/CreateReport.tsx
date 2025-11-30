import { useState } from "react";
import { useApi } from "@/context/APIContext";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/custom/Navbar";
import { MapPicker } from "@/components/custom/MapPicker";
import { ImageUploader } from "@/components/custom/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

const ReportCreate = () => {
    const { createReport } = useApi();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("fire");
    const [lng, setLng] = useState<number | "">("");
    const [lat, setLat] = useState<number | "">("");
    const [imageUrl, setImageUrl] = useState("");
    const [selectedAddress, setSelectedAddress] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLocationSelect = (longitude: number, latitude: number, address?: string) => {
        setLng(longitude);
        setLat(latitude);
        setSelectedAddress(address || "");
    };

    const handleImageUploaded = (url: string) => {
        setImageUrl(url);
    };

    const handleSubmit = async () => {
        if (!lng || !lat) {
            setError("Please select a location on the map");
            return;
        }

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        if (!description.trim()) {
            setError("Description is required");
            return;
        }

        setError("");
        setLoading(true);

        try {
            await createReport({
                title,
                description,
                category,
                lng: Number(lng),
                lat: Number(lat),
                imageUrl,
            });

            navigate("/reports");
        } catch (err) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-3xl mx-auto p-6">
                <Card className="animate-fade-in-up">
                    <CardHeader>
                        <CardTitle className="text-2xl">Create Emergency Report</CardTitle>
                        <CardDescription>
                            Report an emergency or incident that requires coordination
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <Alert variant="destructive" className="animate-shake">
                                {error}
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Brief title of the incident"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the incident in detail..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={loading}
                            >
                                <option value="fire">🔥 Fire</option>
                                <option value="flood">🌊 Flood</option>
                                <option value="accident">🚗 Accident</option>
                                <option value="earthquake">🌍 Earthquake</option>
                                <option value="landslide">🏔️ Landslide</option>
                                <option value="storm">⛈️ Storm</option>
                                <option value="other">📌 Other</option>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Upload Image (Optional)</Label>
                            <ImageUploader
                                onImageUploaded={handleImageUploaded}
                                currentImageUrl={imageUrl}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Select Location on Map *</Label>
                            <MapPicker
                                onLocationSelect={handleLocationSelect}
                                initialLng={lng ? Number(lng) : undefined}
                                initialLat={lat ? Number(lat) : undefined}
                            />
                        </div>

                        <div className="flex space-x-4 pt-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                {loading ? "Submitting..." : "Submit Report"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/")}
                                disabled={loading}
                                className="transition-all duration-300 hover:scale-105"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ReportCreate;
