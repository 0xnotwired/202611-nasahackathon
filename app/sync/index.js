// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"sync is not implemented"}});
export function createLink(...args) { return unavailable(); }
export async function enqueue(...args) { return unavailable(); }
export async function advance(...args) { return unavailable(); }
export async function received(...args) { return unavailable(); }
