import { describe, it, expect } from 'vitest';
import { renameGroup, disableGroup, disableCatalog, validateAndFix } from './mutations';

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
});
