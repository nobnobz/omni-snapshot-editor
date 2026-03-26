import type { OmniConfig } from "./types";

export type LargePerfFixture = {
    config: OmniConfig;
    fallbackCount: number;
    mainGroupCount: number;
    subgroupCount: number;
    linkedCatalogCount: number;
    manifestCatalogCount: number;
};

export const buildLargePerfFixture = (): LargePerfFixture => {
    const mainGroupCount = 80;
    const subgroupCount = 400;
    const linkedCatalogCount = 2000;
    const manifestCatalogCount = 800;
    const fallbackCount = 1600;

    const main_catalog_groups: Record<string, { name: string; subgroupNames: string[]; posterType: string; posterSize: string }> = {};
    const subgroup_order: Record<string, string[]> = {};
    const catalog_groups: Record<string, string[]> = {};
    const catalog_group_image_urls: Record<string, string> = {};
    const main_group_order: string[] = [];
    const custom_catalog_names: Record<string, string> = {};
    const selected_catalogs: string[] = [];
    const top_row_catalogs: string[] = [];
    const catalogs = [];

    for (let index = 0; index < manifestCatalogCount; index += 1) {
        const id = `${index % 2 === 0 ? "movie" : "series"}:mdblist.${100000 + index}`;
        catalogs.push({
            id,
            name: `Fixture Catalog ${index + 1}`,
            enabled: true,
            showInHome: index % 5 === 0,
        });
        selected_catalogs.push(id);
        if (index % 5 === 0) {
            top_row_catalogs.push(id);
        }
    }

    for (let index = 0; index < fallbackCount; index += 1) {
        custom_catalog_names[`mdblist.${100000 + index}`] = `Fixture Fallback ${index + 1}`;
    }

    for (let mainIndex = 0; mainIndex < mainGroupCount; mainIndex += 1) {
        const uuid = `fixture-main-group-${mainIndex + 1}`;
        const subgroupNames: string[] = [];
        main_catalog_groups[uuid] = {
            name: `Fixture Main Group ${mainIndex + 1}`,
            subgroupNames,
            posterType: "Square",
            posterSize: "Default",
        };
        subgroup_order[uuid] = subgroupNames;
        main_group_order.push(uuid);
    }

    for (let subgroupIndex = 0; subgroupIndex < subgroupCount; subgroupIndex += 1) {
        const subgroupName = `Fixture Subgroup ${subgroupIndex + 1}`;
        const parentUuid = main_group_order[subgroupIndex % mainGroupCount];
        const linkedCatalogs: string[] = [];
        for (let linkIndex = 0; linkIndex < linkedCatalogCount / subgroupCount; linkIndex += 1) {
            const catalogIndex = (subgroupIndex * 5 + linkIndex) % manifestCatalogCount;
            linkedCatalogs.push(catalogs[catalogIndex].id);
        }
        catalog_groups[subgroupName] = linkedCatalogs;
        catalog_group_image_urls[subgroupName] = `https://example.com/posters/${subgroupIndex + 1}.png`;
        main_catalog_groups[parentUuid].subgroupNames.push(subgroupName);
    }

    return {
        config: {
            name: "Large Perf Fixture",
            version: "fixture",
            values: {
                main_catalog_groups,
                subgroup_order,
                catalog_groups,
                catalog_group_image_urls,
                main_group_order,
                custom_catalog_names,
                selected_catalogs,
                top_row_catalogs,
            },
            catalogs,
        },
        fallbackCount,
        mainGroupCount,
        subgroupCount,
        linkedCatalogCount,
        manifestCatalogCount,
    };
};
