/** Only render references supported by Qubtic's image manager and Next image configuration. */
export function canPreviewPluginLogo(value?: string, cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME): boolean {
    if (!value) return false;
    if (value.startsWith('/')) return !value.startsWith('//') && !/[\s\\]/.test(value);
    if (/^[a-z]+:/i.test(value)) {
        try {
            const url = new URL(value);
            return url.protocol === 'https:' && url.hostname === 'res.cloudinary.com' && !url.username && !url.password;
        } catch { return false; }
    }
    return Boolean(cloudName) && /^[a-zA-Z0-9_/-]+(?:\.[a-zA-Z0-9]+)?$/.test(value);
}
