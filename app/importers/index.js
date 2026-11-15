// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"importers is not implemented"}});
export function importCRF(...args) { return unavailable(); }
export function importAdaptation(...args) { return unavailable(); }
export function importGlucose(...args) { return unavailable(); }
