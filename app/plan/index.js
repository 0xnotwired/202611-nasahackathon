// M00 placeholder. Replace within the owning module; no product logic.
const unavailable = () => ({ok:false,error:{code:"not_implemented",message:"plan is not implemented"}});
export async function tasksFor(...args) { return unavailable(); }
export async function progress(...args) { return unavailable(); }
export async function mark(...args) { return unavailable(); }
export async function linkResult(...args) { return unavailable(); }
