// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"procedures is not implemented"}});
export function validateProcedure(...args) { return unavailable(); }
export function availability(...args) { return unavailable(); }
export async function start(...args) { return unavailable(); }
export async function advance(...args) { return unavailable(); }
export async function interrupt(...args) { return unavailable(); }
export async function resume(...args) { return unavailable(); }
export async function finish(...args) { return unavailable(); }
