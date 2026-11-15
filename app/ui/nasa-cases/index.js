// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"ui/nasa-cases is not implemented"}});
export function mount(...args) { return unavailable(); }
export async function model(...args) { return unavailable(); }
