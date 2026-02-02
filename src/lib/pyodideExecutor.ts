declare global {
    interface Window {
        loadPyodide: any;
    }
}

let pyodide: any = null;

export async function initPyodide() {
    if (pyodide) return pyodide;

    // Wait for loadPyodide to be available if script tag exists but hasn't run
    if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Pyodide script from CDN."));
            document.head.appendChild(script);
        });
    }

    if (!window.loadPyodide) {
        throw new Error("Pyodide script failed to initialize correctly.");
    }

    pyodide = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
    });

    await pyodide.loadPackage(["pandas", "numpy", "scikit-learn"]);
    return pyodide;
}

export async function executePython(code: string, database: any) {
    const py = await initPyodide();

    // Inject individual datasets into Python global scope as DataFrames
    py.globals.set("matches_json", JSON.stringify(database.matches));
    py.globals.set("deliveries_json", JSON.stringify(database.deliveries));
    py.globals.set("teams_json", JSON.stringify(database.teams));

    const setupCode = `
import json
import pandas as pd
df_matches = pd.DataFrame(json.loads(matches_json))
df_deliveries = pd.DataFrame(json.loads(deliveries_json))
df_teams = pd.DataFrame(json.loads(teams_json))
`;

    await py.runPythonAsync(setupCode);

    try {
        await py.runPythonAsync(code);
        const resultProxy = py.globals.get("result");
        if (!resultProxy) {
            throw new Error("Variable 'result' not found in Python execution context.");
        }
        const result = resultProxy.toJs({ dict_converter: Object.fromEntries });
        return result;
    } catch (error) {
        console.error("Python Execution Error:", error);
        throw error;
    }
}
