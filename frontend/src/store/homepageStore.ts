import { create } from 'zustand';

type ImageModule = {
    image: File | string | null;
    sequence: number;
    status: string;
};

type ComponentModule = {
    homepage_component_id: number;
    title_en: string;
    title_bm: string;
    type: "module" | "youtube" | "about" | "location";
    description_en: string;
    description_bm: string;
    image: File | string | null;
    link: string;
};

type HomepageStore = {
	components: ComponentModule[];
	imageSlider: ImageModule[];
	addImageSlider: (imageSlider: ImageModule) => void;
	setImageSlider: (imageSlider: ImageModule[]) => void;
	setComponents: (components: ComponentModule[]) => void;
};

export const useHomepageStore = create<HomepageStore>((set) => ({
	components: [],
	imageSlider: [],
	addImageSlider: (imageSlider: ImageModule) => set((state) => ({ imageSlider: [...state.imageSlider, imageSlider] })),
	setImageSlider: (imageSlider: ImageModule[]) => set({ imageSlider }),
	setComponents: (components: ComponentModule[]) => set({ components }),
}));