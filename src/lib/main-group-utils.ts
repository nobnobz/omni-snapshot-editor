export const normalizeMainGroupOrder = (
    mainGroups: Record<string, unknown>,
    mainGroupOrder: unknown
): string[] => {
    const filteredOrder = Array.isArray(mainGroupOrder)
        ? mainGroupOrder.filter((uuid): uuid is string => typeof uuid === "string" && !!mainGroups[uuid])
        : [];

    const orderSet = new Set(filteredOrder);
    Object.keys(mainGroups).forEach((uuid) => {
        if (!orderSet.has(uuid)) {
            filteredOrder.push(uuid);
        }
    });

    return filteredOrder;
};

export const normalizeSubgroupNames = (
    subgroupNames: unknown,
    subgroupOrder: unknown,
    validGroupNames?: Set<string>
): string[] => {
    const isValidName = (value: unknown): value is string =>
        typeof value === "string" && (!validGroupNames || validGroupNames.has(value));

    const normalizedOrder = Array.isArray(subgroupOrder)
        ? subgroupOrder.filter(isValidName)
        : [];
    const normalizedNames = Array.isArray(subgroupNames)
        ? subgroupNames.filter(isValidName)
        : [];

    const canonicalNames = Array.from(new Set(normalizedOrder));
    normalizedNames.forEach((name) => {
        if (!canonicalNames.includes(name)) {
            canonicalNames.push(name);
        }
    });

    return canonicalNames;
};
