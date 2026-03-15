import { describe, it, expect } from 'vitest';
import { reorderCatalogGroupOrder } from './mutations';

describe('catalog_group_order Export Logic', () => {

    it('orders subgroups by main groups and places placeholders first', () => {
        const state = {
            main_group_order: ["mg1", "mg2"],
            main_catalog_groups: {
                "mg1": {
                    name: "Discover",
                    subgroupNames: ["Action", "❗️[Discover]", "Comedy"]
                },
                "mg2": {
                    name: "Collections",
                    subgroupNames: ["Disney", "Marvel"]
                }
            },
            catalog_groups: {
                "❗️[Discover]": [],
                "Action": [],
                "Comedy": [],
                "Disney": [],
                "Marvel": [],
                "Orphan": []
            }
        };

        const result = reorderCatalogGroupOrder(state);

        // MG1: Placeholder first, then real subgroups (Action, Comedy are already alphabetical)
        // MG2: Collections (Disney, Marvel already alphabetical)
        // Orphan at the end
        expect(result).toEqual([
            "❗️[Discover]",
            "Action",
            "Comedy",
            "Disney",
            "Marvel",
            "Orphan"
        ]);
    });

    it('sorts ALL main groups alphabetically (e.g. Discover)', () => {
        const state = {
            main_group_order: ["mg-discover"],
            main_catalog_groups: {
                "mg-discover": {
                    name: "Discover",
                    subgroupNames: ["Trending Shows", "Watchlist", "Trending Movies", "Latest Movies", "Latest Shows"]
                }
            },
            catalog_groups: {
                "Latest Movies": [],
                "Latest Shows": [],
                "Trending Movies": [],
                "Trending Shows": [],
                "Watchlist": []
            }
        };

        const result = reorderCatalogGroupOrder(state);

        expect(result).toEqual([
            "Latest Movies",
            "Latest Shows",
            "Trending Movies",
            "Trending Shows",
            "Watchlist"
        ]);
    });

    it('sorts Genres, Directors, Actors, Collections alphabetically', () => {
        const state = {
            main_group_order: ["mg-genres", "mg-directors"],
            main_catalog_groups: {
                "mg-genres": {
                    name: "Genres",
                    subgroupNames: ["Sci-Fi", "Action", "Drama", "❗️[Genres]"]
                },
                "mg-directors": {
                    name: "Directors",
                    subgroupNames: ["Z-Director", "A-Director"]
                }
            },
            catalog_groups: {
                "❗️[Genres]": [],
                "Sci-Fi": [],
                "Action": [],
                "Drama": [],
                "Z-Director": [],
                "A-Director": []
            }
        };

        const result = reorderCatalogGroupOrder(state);

        expect(result).toEqual([
            "❗️[Genres]",
            "Action",
            "Drama",
            "Sci-Fi",
            "A-Director",
            "Z-Director"
        ]);
    });

    it('handles missing placeholders and deduplicates', () => {
        const state = {
            main_group_order: ["mg1", "mg2"],
            main_catalog_groups: {
                "mg1": {
                    name: "NoPlaceholder",
                    subgroupNames: ["Sub1"]
                },
                "mg2": {
                    name: "Dupes",
                    subgroupNames: ["Sub1", "Sub2"]
                }
            },
            catalog_groups: {
                "Sub1": [],
                "Sub2": []
            }
        };

        const result = reorderCatalogGroupOrder(state);

        expect(result).toEqual([
            "Sub1",
            "Sub2"
        ]);
        expect(result.length).toBe(2);
    });

    it('preserves exactly what is in data and ignores non-existent references', () => {
        const state = {
            main_group_order: ["mg1"],
            main_catalog_groups: {
                "mg1": {
                    name: "Real",
                    subgroupNames: ["Exists", "NonExistent"]
                }
            },
            catalog_groups: {
                "Exists": [],
                "AlsoExists": []
            }
        };

        const result = reorderCatalogGroupOrder(state);

        expect(result).toEqual([
            "Exists",
            "AlsoExists"
        ]);
    });
});
