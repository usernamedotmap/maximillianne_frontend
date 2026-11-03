


export type LoginInput = {
    email: string;
    password: string;
}

export type AdminUser = {
    id: string;
    email: string;
    createdAt: string;
}

export type AuthResponse = {
    user: AdminUser;
    message: string;
}

export type LogoutResponse = {
    message: string;
}