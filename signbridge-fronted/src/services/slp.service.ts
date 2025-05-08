export async function fetchGlossMatch(text: string): Promise<string[]> {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/slp/match-gloss`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return data.glosses || [];
}

export async function fetchJsonlFrames(glosses: string[]): Promise<any[]> {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/slp/get-frames`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ glosses }),
    });
    const data = await res.json();
    return data.frames || [];
}
