export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'volunteer' | 'user';
}

export interface Report {
    id: string;
    title: string;
    description: string;
    category: "fire" | "flood" | "accident" | "earthquake" | "landslide" | "storm" | "other";
    status: "reported" | "reviewing" | "assigned" | "resolving" | "resolved";
    imageUrl: string;
    location: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    reportedBy: User["id"];
    assignedTo?: User["id"];
    createdAt: string;
    updatedAt: string;
}

export interface RegisterResponse {
    message: string;
    user?: User;
}

export interface LoginResponse {
    message: string;
    accessToken?: string;
    refreshToken?: string;
    user?: User;
}

export interface RefreshTokenResponse {
    message: string;
    accessToken?: string;
}

export interface logoutResponse {
    message: string;
}

export interface GetallUsersResponse {
    success: boolean;
    users?: User[];
    message?: string;
}

export interface GetallReportsResponse {
    success: boolean;
    reports?: Report[];
    message?: string;
}

export interface DeleteUserResponse {
    success: boolean;
    message: string;
}