// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"readings is not implemented"}});
export function attention(...args) { return unavailable(); }
export async function series(...args) { return unavailable(); }
export async function latest(...args) { return unavailable(); }
export async function baseline(...args) { return unavailable(); }
export async function environment(...args) { return unavailable(); }
export async function cumulative(...args) { return unavailable(); }
