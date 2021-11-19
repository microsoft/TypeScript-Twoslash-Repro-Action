export type BisectVersion = [version: string, date: string]

/** So we can have much less of that 14mb json file in memory */
export const extractDateAndVersionMetadata = (packument: any) => {
    const time = packument.time
    delete time["modified"]
    delete time["created"]
    
    return Object.keys(time).map(key => [key, time[key]]).sort((a, b) => a[0] - b[0]) as BisectVersion[]
}

export async function binarySearch(ar: any[],  func: (version: BisectVersion) => Promise<number>) {
    var m = 0;
    var n = ar.length - 1;
    while (m <= n) {
        var k = (n + m) >> 1;
        var cmp = await func(ar[k]);
        if (cmp > 0) {
            m = k + 1;
        } else if(cmp < 0) {
            n = k - 1;
        } else {
            return ar[k];
        }
    }
    return ar[m - 1];
}
