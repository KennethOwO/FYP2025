export async function fetchGlossMatch(text: string): Promise<string[]> {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/slp/match-gloss`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true", // ✅ if using ngrok
            },
            body: JSON.stringify({ text }),
        });

        const data = await res.json();

        // ✅ Ensure it's an array
        if (Array.isArray(data.glosses)) {
            return data.glosses;
        } else {
            console.error("Expected glosses array, got:", data.glosses);
            return [];
        }
    } catch (error) {
        console.error("Error in fetchGlossMatch:", error);
        return [];
    }
}

export async function fetchJsonlFrames(glosses: string[]): Promise<any[]> {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/slp/get-frames`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true", // ✅ if using ngrok
            },
            body: JSON.stringify({ glosses }),
        });

        const data = await res.json();

        // ✅ Validate that frames is an array
        if (Array.isArray(data.frames)) {
            return data.frames;
        } else {
            console.error("Expected frames array, got:", data.frames);
            return [];
        }
    } catch (error) {
        console.error("Error in fetchJsonlFrames:", error);
        return [];
    }
}
