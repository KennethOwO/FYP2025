import { create } from "zustand";

interface Notification {
    notification_id: number;
    receiver_id: number;
    sender_id: number;
    sender_username: string;
    sender_avatar: string;
    message_en: string;
    message_bm: string;
    sign_text: string;
    status: number;
    type: string;
    type_value: string;
    created_at: string;
}

interface NotificationFilterState {
    data: Notification[];
    modifiedData: Notification[];
    filter: string[];
    setData: (data: Notification[]) => void;
    setModifiedData: (data: Notification[]) => void;
    setFilter: (filter: string[]) => void; 
}

export const useNotificationFilterStore = create<NotificationFilterState>((set) => ({
    data: [],
    modifiedData: [],
    filter: ["accepted", "rejected", "newtask", "newtext", "waitingforverification"],
    setData: (data: Notification[]) => set({ data }),
    setModifiedData: (data: Notification[]) => set({ modifiedData: data }),
    setFilter: (filter) => set({ filter }),
}));