import { describe, it, expect } from 'vitest';
import { renameGroup, disableGroup, disableCatalog, pruneCatalogFromManager, importGroups, validateAndFix } from './mutations';

describe('Mutations Library', () => {

    it('renameGroup updates all string-key references', () => {
        const initialState = {
            catalog_groups: {
                "Old Action": ["movie1", "movie2"],
                "Comedy": ["movie3"]
            },
            catalog_group_order: ["Old Action", "Comedy"],
            subgroup_order: {
                "uuid-123": ["Old Action"]
            },
            main_catalog_groups: {
                "uuid-123": {
                    name: "Movies",
                    subgroupNames: ["Old Action"]
                }
            },
            catalog_group_image_urls: {
                "Old Action": "http://img.png"
            }
        };

        const newState = renameGroup("Old Action", "New Action", initialState);

        // 1. catalog_groups
        expect(newState.catalog_groups["New Action"]).toEqual(["movie1", "movie2"]);
        expect(newState.catalog_groups["Old Action"]).toBeUndefined();

        // 2. catalog_group_order
        expect(newState.catalog_group_order).toEqual(["New Action", "Comedy"]);

        // 3. subgroup_order
        expect(newState.subgroup_order["uuid-123"]).toEqual(["New Action"]);

        // 4. main_catalog_groups
        expect(newState.main_catalog_groups["uuid-123"].subgroupNames).toEqual(["New Action"]);

        // 5. image urls
        expect(newState.catalog_group_image_urls["New Action"]).toBe("http://img.png");
        expect(newState.catalog_group_image_urls["Old Action"]).toBeUndefined();
    });

    it('renameGroup merges when new name already exists', () => {
        const initialState = {
            catalog_groups: {
                "Action": ["m1", "m2"],
                "Comedy": ["m3", "m4"]
            },
            catalog_group_order: ["Action", "Comedy"]
        };

        const newState = renameGroup("Action", "Comedy", initialState);

        // Should merge arrays uniquely
        expect(newState.catalog_groups["Comedy"]).toEqual(["m3", "m4", "m1", "m2"]);
        expect(newState.catalog_groups["Action"]).toBeUndefined();

        // Should drop duplicate from order
        expect(newState.catalog_group_order).toEqual(["Comedy"]);
    });

    it('disableGroup removes all references', () => {
        const initialState = {
            catalog_groups: {
                "Action": ["m1"]
            },
            catalog_group_order: ["Action"],
            subgroup_order: {
                "uuid-123": ["Action", "Comedy"]
            },
            main_catalog_groups: {
                "uuid-123": {
                    subgroupNames: ["Action"]
                }
            }
        };

        const newState = disableGroup("Action", initialState);

        expect(newState.catalog_groups["Action"]).toBeUndefined();
        expect(newState.catalog_group_order).toEqual([]);
        expect(newState.subgroup_order["uuid-123"]).toEqual(["Comedy"]);
        expect(newState.main_catalog_groups["uuid-123"].subgroupNames).toEqual([]);
    });

    it('disableCatalog removes catalog from everywhere', () => {
        const initialState = {
            catalog_groups: {
                "Action": ["cat1", "cat2"],
                "Comedy": ["cat1"]
            },
            selected_catalogs: ["cat1", "cat3"],
            pinned_catalogs: ["cat1"]
        };

        const newState = disableCatalog("cat1", initialState);

        expect(newState.catalog_groups["Action"]).toEqual(["cat2"]);
        expect(newState.catalog_groups["Comedy"]).toEqual([]);
        expect(newState.selected_catalogs).toEqual(["cat3"]);
        expect(newState.pinned_catalogs).toEqual([]);
    });

    it('pruneCatalogFromManager keeps subgroup links while removing manager-owned catalog references', () => {
        const initialState = {
            catalog_groups: {
                "Action": ["cat1", "cat2"],
                "Comedy": ["cat1"]
            },
            selected_catalogs: ["cat1", "cat3"],
            pinned_catalogs: ["cat1"],
            top_row_catalogs: ["cat1"]
        };

        const newState = pruneCatalogFromManager("cat1", initialState);

        expect(newState.catalog_groups["Action"]).toEqual(["cat1", "cat2"]);
        expect(newState.catalog_groups["Comedy"]).toEqual(["cat1"]);
        expect(newState.selected_catalogs).toEqual(["cat3"]);
        expect(newState.pinned_catalogs).toEqual([]);
        expect(newState.top_row_catalogs).toEqual([]);
    });

    it('validateAndFix removes missing references & dupes', () => {
        const initialState = {
            catalog_groups: {
                "Action": ["c1"],
                "Comedy": ["c2"]
            },
            catalog_group_order: ["Action", "Missing1", "Action"],
            subgroup_order: {
                "uuid-1": ["Action", "Missing2"]
            },
            main_catalog_groups: {
                "uuid-1": {
                    subgroupNames: ["Comedy", "Missing3", "Comedy"]
                }
            },
            selected_catalogs: ["c1", "c1", "c2"]
        };

        const newState = validateAndFix(initialState);

        expect(newState.catalog_group_order).toEqual(["Action", "Comedy"]); // "Comedy" auto appended because it exists but was missing
        expect(newState.subgroup_order["uuid-1"]).toEqual(["Action"]); // Missing deleted
        expect(newState.main_catalog_groups["uuid-1"].subgroupNames).toEqual(["Comedy"]); // Dupes and missing removed
        expect(newState.selected_catalogs).toEqual(["c1", "c2"]); // Dupes removed
    });

    it('validateAndFix appends main groups missing from main_group_order', () => {
        const initialState = {
            catalog_groups: {
                "Streaming": ["c1"],
                "Collections": ["c2"]
            },
            main_group_order: ["streaming-uuid"],
            subgroup_order: {
                "streaming-uuid": ["Streaming"]
            },
            main_catalog_groups: {
                "streaming-uuid": {
                    name: "Streaming Services",
                    subgroupNames: ["Streaming"]
                },
                "collections-uuid": {
                    name: "Collections",
                    subgroupNames: ["Collections"]
                }
            }
        };

        const newState = validateAndFix(initialState);

        expect(newState.main_group_order).toEqual(["streaming-uuid", "collections-uuid"]);
    });

    it('importGroups preserves existing subgroup catalogs when only relinking a duplicate subgroup', () => {
        const initialState = {
            main_catalog_groups: {
                "existing-main": {
                    name: "Existing Main",
                    subgroupNames: ["Existing Subgroup"]
                }
            },
            main_group_order: ["existing-main"],
            subgroup_order: {
                "existing-main": ["Existing Subgroup"]
            },
            catalog_groups: {
                "Existing Subgroup": ["movie:keep-me"]
            },
            catalog_group_order: ["Existing Subgroup"],
            catalog_group_image_urls: {}
        };

        const newState = importGroups({
            mainGroups: {
                "incoming-main": {
                    name: "Incoming Main",
                    subgroupNames: ["Existing Subgroup"],
                    posterType: "Poster",
                    posterSize: "Default"
                }
            },
            subgroups: {
                "Existing Subgroup": {
                    overwriteCatalogs: false,
                    overwriteImage: true,
                    imageUrl: "https://example.com/image.png"
                }
            },
            standaloneAssignments: {},
        }, initialState);

        expect(newState.catalog_groups["Existing Subgroup"]).toEqual(["movie:keep-me"]);
        expect(newState.catalog_group_image_urls["Existing Subgroup"]).toBe("https://example.com/image.png");
        expect(newState.main_catalog_groups["incoming-main"].subgroupNames).toEqual(["Existing Subgroup"]);
    });

    it('importGroups updates catalogs without touching an existing subgroup image when only catalog overwrite is requested', () => {
        const initialState = {
            main_catalog_groups: {},
            main_group_order: [],
            subgroup_order: {},
            catalog_groups: {
                "Existing Subgroup": ["movie:keep-me"]
            },
            catalog_group_order: ["Existing Subgroup"],
            catalog_group_image_urls: {
                "Existing Subgroup": "https://example.com/keep-image.png"
            },
            custom_catalog_names: {}
        };

        const newState = importGroups({
            mainGroups: {},
            subgroups: {
                "Existing Subgroup": {
                    catalogs: ["fresh-id"],
                    overwriteCatalogs: true,
                    overwriteImage: false,
                    imageUrl: "https://example.com/new-image.png"
                }
            },
            standaloneAssignments: {},
        }, initialState);

        expect(newState.catalog_groups["Existing Subgroup"]).toEqual(["movie:fresh-id"]);
        expect(newState.catalog_group_image_urls["Existing Subgroup"]).toBe("https://example.com/keep-image.png");
    });

    it('importGroups creates new subgroup catalogs when overwrite is requested', () => {
        const initialState = {
            main_catalog_groups: {},
            main_group_order: [],
            subgroup_order: {},
            catalog_groups: {},
            catalog_group_order: [],
            catalog_group_image_urls: {},
            custom_catalog_names: {}
        };

        const newState = importGroups({
            mainGroups: {
                "incoming-main": {
                    name: "Incoming Main",
                    subgroupNames: ["New Subgroup"],
                    posterType: "Poster",
                    posterSize: "Default"
                }
            },
            subgroups: {
                "New Subgroup": {
                    catalogs: ["fresh-id"],
                    overwriteCatalogs: true
                }
            },
            standaloneAssignments: {},
        }, initialState);

        expect(newState.catalog_groups["New Subgroup"]).toEqual(["movie:fresh-id"]);
        expect(newState.catalog_group_order).toContain("New Subgroup");
        expect(newState.subgroup_order["incoming-main"]).toEqual(["New Subgroup"]);
    });

    it('importGroups leaves catalog selection arrays untouched', () => {
        const initialState = {
            main_catalog_groups: {},
            main_group_order: [],
            subgroup_order: {},
            catalog_groups: {
                Existing: ["movie:keep-me"]
            },
            catalog_group_order: ["Existing"],
            catalog_group_image_urls: {},
            custom_catalog_names: {},
            selected_catalogs: ["movie:keep-me"],
            pinned_catalogs: ["movie:pinned"],
            top_row_catalogs: ["movie:top-row"],
        };

        const newState = importGroups({
            mainGroups: {
                "incoming-main": {
                    name: "Incoming Main",
                    subgroupNames: ["Imported Subgroup"],
                    posterType: "Poster",
                    posterSize: "Default"
                }
            },
            subgroups: {
                "Imported Subgroup": {
                    catalogs: ["fresh-id"],
                    overwriteCatalogs: true
                }
            },
            standaloneAssignments: {},
        }, initialState);

        expect(newState.selected_catalogs).toEqual(["movie:keep-me"]);
        expect(newState.pinned_catalogs).toEqual(["movie:pinned"]);
        expect(newState.top_row_catalogs).toEqual(["movie:top-row"]);
    });
});
