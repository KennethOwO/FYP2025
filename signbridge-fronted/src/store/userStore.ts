import { create } from "zustand";

type User = {
	user_id: number;
	firebase_id: string;
	username: string;
	email: string;
	picture: string;
	acc_type: string;
	role_access: string;
	email_verified: boolean;
	created_at: string;

	first_name?: string;
	last_name?: string;
	age?: string;
	gender?: string;
	race?: string;
	country?: string;
	state?: string;
	city?: string;
}

type UserStore = {
	user: User | null;
	setUser: (user: User) => void;
	removeUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
	user: null,
	setUser: (user) => set({ user }),
	removeUser: () => set({ user: null }),
}));