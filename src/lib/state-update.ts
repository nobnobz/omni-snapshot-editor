import { produce } from "immer";

const isMutableRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

export const updateValueAtPath = <T>(state: T, path: string[], value: unknown): T => {
    if (path.length === 0) {
        return value as T;
    }

    return produce(state, (draft) => {
        let cursor: Record<string, unknown> = isMutableRecord(draft) ? draft : {};

        for (let index = 0; index < path.length - 1; index += 1) {
            const key = path[index];
            const nextValue = cursor[key];
            if (!isMutableRecord(nextValue)) {
                cursor[key] = {};
            }
            cursor = cursor[key] as Record<string, unknown>;
        }

        const finalKey = path[path.length - 1];
        if (value === undefined) {
            delete cursor[finalKey];
            return;
        }

        cursor[finalKey] = value;
    });
};

export const removeValueAtPath = <T>(state: T, path: string[]): T =>
    updateValueAtPath(state, path, undefined);
