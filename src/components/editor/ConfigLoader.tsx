"use client";

import { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Github, Upload, CheckCircle2 } from "lucide-react";

function fixMojibakeString(str: string): string {
    if ([...str].some(c => c.charCodeAt(0) > 255)) return str;
    try {
        const bytes = new Uint8Array(str.split("").map(c => c.charCodeAt(0)));
        const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        return decoded === str ? str : decoded;
    } catch (e) {
        return str;
    }
}

function repairMojibakeInConfig(obj: any): any {
    if (typeof obj === "string") {
        return fixMojibakeString(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(repairMojibakeInConfig);
    } else if (obj !== null && typeof obj === "object") {
        const newObj: any = {};
        for (const key in obj) {
            newObj[key] = repairMojibakeInConfig(obj[key]);
        }
        return newObj;
    }
    return obj;
}

export function ConfigLoader() {
    const { loadConfig } = useConfig();
    const [url, setUrl] = useState("https://raw.githubusercontent.com/nobnobz/Omni-Template-Bot-Bid-Raiser/refs/heads/main/omni-snapshot-unified-media-experience-v1.7.1-2026-03-02.json");
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFromGitHub = async () => {
        if (!url) {
            setError("Please enter a valid GitHub raw URL.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const headers: HeadersInit = {};
            if (token) {
                headers["Authorization"] = `token ${token}`;
            }
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            const buffer = await response.arrayBuffer();
            const decoder = new TextDecoder("utf-8");
            const text = decoder.decode(buffer);
            const json = repairMojibakeInConfig(JSON.parse(text));
            const fn = url.split("/").pop() || "omni-config.json";
            loadConfig(json, fn);
        } catch (err: any) {
            setError(err.message || "Failed to load JSON from URL.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = repairMojibakeInConfig(JSON.parse(event.target?.result as string));
                loadConfig(json, file.name);
            } catch (err) {
                setError("Invalid JSON file.");
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file, "UTF-8");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-950 p-4 font-sans text-neutral-100">
            <Card className="w-full max-w-lg shadow-2xl bg-neutral-900 border-neutral-800 text-neutral-100">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <span className="bg-blue-600 p-2 rounded-lg text-white">O</span>
                        Omni Config Editor
                    </CardTitle>
                    <CardDescription className="text-neutral-400">
                        Load an Omni configuration file from GitHub or local disk to begin editing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md flex gap-2 items-start">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-neutral-800" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-neutral-900 px-2 text-neutral-500">From GitHub</span></div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="url">Raw JSON URL</Label>
                            <Input
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://raw.githubusercontent.com/..."
                                className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="token">Personal Access Token (for private repos)</Label>
                            <Input
                                id="token"
                                type="password"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="ghp_xxxxxxxxxxxx"
                                className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
                            />
                        </div>

                        <Button onClick={fetchFromGitHub} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? "Loading..." : (
                                <>
                                    <Github className="w-4 h-4 mr-2" /> Load from GitHub
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-neutral-800" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-neutral-900 px-2 text-neutral-500">Or</span></div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file-upload" className="flex items-center justify-center w-full h-24 px-4 transition bg-neutral-800 border-2 border-neutral-700 border-dashed rounded-md appearance-none cursor-pointer hover:border-neutral-500 focus:outline-none">
                            <span className="flex items-center space-x-2">
                                <Upload className="w-5 h-5 text-neutral-400" />
                                <span className="font-medium text-neutral-400">Drop JSON file here to upload</span>
                            </span>
                            <input id="file-upload" type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
                        </Label>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
