// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"summary is not implemented"}});
export async function generate(...args) { return unavailable(); }
