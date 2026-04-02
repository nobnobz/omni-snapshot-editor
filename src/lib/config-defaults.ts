type ConfigValues = Record<string, unknown>;

export const DEFAULT_METADATA_PROVIDER = "aio-metadata";

export const applyConfigDefaults = (values: ConfigValues): ConfigValues => {
    const normalizedValues = { ...values };

    if (normalizedValues.default_metadata_provider === undefined) {
        normalizedValues.default_metadata_provider = DEFAULT_METADATA_PROVIDER;
    }

    return normalizedValues;
};
