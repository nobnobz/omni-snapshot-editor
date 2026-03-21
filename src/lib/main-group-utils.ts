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
