// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"privacy is not implemented"}});
export function createSession(...args) { return unavailable(); }
export async function logShared(...args) { return unavailable(); }
export async function sharedLog(...args) { return unavailable(); }
