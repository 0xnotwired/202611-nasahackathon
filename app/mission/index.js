// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"mission is not implemented"}});
export function validateConfig(...args) { return unavailable(); }
export function hasEquipment(...args) { return unavailable(); }
export function phaseAt(...args) { return unavailable(); }
