// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"scenario is not implemented"}});
export function generateScenario(...args) { return unavailable(); }
