export function removeEmptyParams<T extends Record<string, any>>(params: T): Record<string, any> {
    const cleaned: Record<string, any> = {};

    for (const key in params) {
        const value = params[key];
        if (
            value !== '' &&
            value !== null &&
            value !== undefined &&
            !(Array.isArray(value) && value.length === 0)
        ) {
            cleaned[key] = value;
        }
    }

    return cleaned;
}