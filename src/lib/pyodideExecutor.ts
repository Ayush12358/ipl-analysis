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
            throw new Error("Variable 'result' not found in Python execution context. Ensure your code creates a 'result' dictionary.");
        }
        const result = resultProxy.toJs({ dict_converter: Object.fromEntries });
        return result;
    } catch (error: any) {
        // Extract a clean error message and context if possible
        const errorMessage = error.message || String(error);
        console.error("Python Execution Error:", errorMessage);
        throw new Error(errorMessage);
    }
}

export async function getDatabaseSchema() {
    const py = await initPyodide();
    const schemaCode = `
import json
schema = {
    "df_matches": list(df_matches.columns),
    "df_deliveries": list(df_deliveries.columns),
    "df_teams": list(df_teams.columns)
}
json.dumps(schema)
`;
    const schemaJson = await py.runPythonAsync(schemaCode);
    return JSON.parse(schemaJson);
}
