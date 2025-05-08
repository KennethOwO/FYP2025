import { create } from "zustand";
import { GetFeedback } from "../services/feedback.service";


interface FeedbackSortFilterState {
	data: any;
	modifiedData: any;
	field: string;
	sortBy: string;
	filterBy: string | null;
	setData: (field: any[]) => void
	setModifiedData: (field: any[]) => void;
	setFields: (field: string) => void;
	setSortBy: (sortBy: string) => void;
	setFilterBy: (filterBy: string | null) => void;
}

export const useFeedbackSortFilterStore = create<FeedbackSortFilterState>((set) => ({
	data: [],
	modifiedData: [],
	field: "ID",
	sortBy: "asc",
	filterBy: null,
	setData: (field: any[]) => set({ data: field }),
	setModifiedData: (field: any[]) => set({ modifiedData: field }),
	setFields: (field: string) => set({ field }),
	setSortBy: (sortBy: string) => set({ sortBy }),
	setFilterBy: (filterBy: string | null) => set({ filterBy }),
}));