import type { Match, KnockoutMatch } from "../types/tournament";

export const EXPORT_VERSION = 1;

export interface PredictionExport {
    version: number;
    exportedAt: string; // ISO date string
    profile: string;
    groupMatches: Match[];
    knockoutMatches: KnockoutMatch[];
    customGroupOrders: Record<string, string[]>;
}

/**
 * Serializes current prediction state to a JSON file and triggers a browser download.
 */
export function exportPredictions(
    profile: string,
    groupMatches: Match[],
    knockoutMatches: KnockoutMatch[],
    customGroupOrders: Record<string, string[]>
): void {
    const payload: PredictionExport = {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        profile,
        groupMatches,
        knockoutMatches,
        customGroupOrders,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = profile.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    a.href = url;
    a.download = `predict26_${safeName}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Reads a JSON file selected by the user and resolves to a PredictionExport object.
 * Rejects with a human-readable error message on failure.
 */
export function importPredictions(): Promise<PredictionExport> {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) {
                reject("No file selected.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const raw = e.target?.result as string;
                    const parsed = JSON.parse(raw) as PredictionExport;

                    // Basic validation
                    if (typeof parsed.version !== "number") {
                        throw new Error("Invalid file: missing version field.");
                    }
                    if (!Array.isArray(parsed.groupMatches)) {
                        throw new Error("Invalid file: groupMatches is not an array.");
                    }
                    if (!Array.isArray(parsed.knockoutMatches)) {
                        throw new Error("Invalid file: knockoutMatches is not an array.");
                    }
                    if (typeof parsed.customGroupOrders !== "object" || parsed.customGroupOrders === null) {
                        throw new Error("Invalid file: customGroupOrders is missing.");
                    }

                    resolve(parsed);
                } catch (err) {
                    reject(err instanceof Error ? err.message : "Failed to parse file.");
                }
            };

            reader.onerror = () => reject("Failed to read file.");
            reader.readAsText(file);
        };

        // If the user cancels without selecting a file
        input.oncancel = () => reject("Import cancelled.");

        input.click();
    });
}
