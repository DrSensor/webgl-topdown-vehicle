export const
    cssVar = {
        get(key: string, el = document.documentElement) {
            const val = getComputedStyle(el).getPropertyValue('--' + key)
            if (val.includes('url'))
                return val.replace('url(', '').replace(')', '')
            else
                return val
        },
        set: (key: string, val: string, el = document.documentElement) =>
            getComputedStyle(el).setProperty('--' + key, val)
    }
