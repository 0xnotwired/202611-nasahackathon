// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"core is not implemented"}});
export const STATES=Object.freeze(["recorded","confirmed_none","not_recorded"]);
export const TYPES=Object.freeze(["observation","measurement","action","environment","exam"]);
export const ORIGINS=Object.freeze(["synthetic","ground_analog","terrestrial","flight","cell_culture"]);
export const SCHEMA_VERSION=1;
export function validateRecord(...args) { return unavailable(); }
export function createRecord(...args) { return unavailable(); }
export function areComparable(...args) { return unavailable(); }
