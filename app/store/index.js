// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"store is not implemented"}});
export async function openStore(...args) { return unavailable(); }
