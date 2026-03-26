export const shallowEqualArray = <T,>(left: T[], right: T[]) => {
    if (left === right) return true;
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
        if (!Object.is(left[index], right[index])) {
            return false;
        }
    }
    return true;
};

export const shallowEqualObject = <T extends Record<string, unknown>>(left: T, right: T) => {
    if (left === right) return true;

    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;

    for (const key of leftKeys) {
        if (!Object.prototype.hasOwnProperty.call(right, key) || !Object.is(left[key], right[key])) {
            return false;
        }
    }

    return true;
};

export const shallowEqualSetByValue = <T,>(left: Set<T>, right: Set<T>) => {
    if (left === right) return true;
    if (left.size !== right.size) return false;

    for (const entry of left) {
        if (!right.has(entry)) {
            return false;
        }
    }

    return true;
};

export const referenceOrShallowEqual = <T>(left: T, right: T) => {
    if (Object.is(left, right)) return true;
    if (Array.isArray(left) && Array.isArray(right)) {
        return shallowEqualArray(left, right);
    }
    if (
        typeof left === "object" && left !== null &&
        typeof right === "object" && right !== null &&
        !Array.isArray(left) && !Array.isArray(right)
    ) {
        return shallowEqualObject(left as Record<string, unknown>, right as Record<string, unknown>);
    }
    return false;
};
