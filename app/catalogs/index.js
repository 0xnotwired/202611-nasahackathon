// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"catalogs is not implemented"}});
export function observations(...args) { return unavailable(); }
export function variables(...args) { return unavailable(); }
export function equipment(...args) { return unavailable(); }
export function sources(...args) { return unavailable(); }
