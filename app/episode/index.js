// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"episode is not implemented"}});
export async function open(...args) { return unavailable(); }
export async function situation(...args) { return unavailable(); }
export async function link(...args) { return unavailable(); }
export async function close(...args) { return unavailable(); }
