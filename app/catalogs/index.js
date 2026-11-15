/**
 * M03 reference content. Sources are inherited from the repository's targeted
 * reviews, not newly revalidated clinical evidence. This catalog is not a
 * diagnostic instrument, a clinical rule set or a set of normal ranges.
 * Each call returns detached data so a consumer cannot change another view.
 */
const OBSERVATIONS = [
  {id:'skin',label:'Skin change',source_ids:['B01']},
  {id:'congestion',label:'Congestion',source_ids:['B01','B02']},
  {id:'headache',label:'Headache',source_ids:['B05']},
  {id:'back_pain',label:'Back pain',source_ids:['B04']},
  {id:'sleep',label:'Sleep change',source_ids:['B02','S09']},
  {id:'nausea_dizziness',label:'Nausea or dizziness',source_ids:['B06']},
  {id:'fatigue',label:'Fatigue',source_ids:['S09']},
  {id:'vision',label:'Vision change',source_ids:['S12']},
  {id:'other',label:'Other observation',source_ids:['B03']}
];

// Units describe catalog metadata; Record.unit preserves the actual measurement.
// as_recorded is an explicit unresolved-unit marker, NEVER a measurement unit
// to stamp onto an imported record. No conversion is performed by this module.
const VARIABLES = [
  {id:'pulse',label:'Pulse',unit:'bpm',type:'measurement'},
  {id:'systolic_pressure',label:'Systolic blood pressure',unit:'mmHg',type:'measurement'},
  {id:'diastolic_pressure',label:'Diastolic blood pressure',unit:'mmHg',type:'measurement'},
  {id:'respiration_rate',label:'Respiration rate',unit:'breaths/min',type:'measurement'},
  {id:'mass',label:'Body mass or weight — retain recorded unit',unit:'as_recorded',type:'measurement'},
  {id:'temperature',label:'Body temperature — retain recorded unit',unit:'as_recorded',type:'measurement'},
  {id:'sleep_hours',label:'Self-reported rest duration',unit:'h',type:'measurement'},
  {id:'strength',label:'Strength assessment — retain recorded method and unit',unit:'as_recorded',type:'exam'},
  {id:'aerobic_capacity',label:'Aerobic assessment — retain recorded method and unit',unit:'as_recorded',type:'exam'},
  {id:'bone_density',label:'Bone density assessment — retain recorded method and unit',unit:'as_recorded',type:'exam'},
  {id:'co2',label:'Environmental carbon dioxide',unit:'ppm',type:'environment'},
  {id:'ambient_temperature',label:'Environmental temperature — retain recorded unit',unit:'as_recorded',type:'environment'},
  {id:'relative_humidity',label:'Relative humidity',unit:'%',type:'environment'},
  {id:'radiation_dose',label:'Radiation dose — retain recorded dose type and unit',unit:'as_recorded',type:'environment'},
  {id:'glucose',label:'Blood glucose — mg/dL or mmol/L as recorded; no conversion',unit:'as_recorded',type:'measurement'},
  {id:'mood',label:'Mood self-report — team scale 1–5; not validated; not a screening',unit:'team_scale_1_5',type:'observation'},
  ...OBSERVATIONS.map(({id,label})=>({id,label,unit:'not_applicable',type:'observation'}))
];

const EQUIPMENT = [
  {id:'demo-device',label:'Team demo device — fictional'},
  {id:'blood_pressure_cuff',label:'Blood pressure cuff'},
  {id:'thermometer',label:'Thermometer'},
  {id:'scale',label:'Mass or weight measurement device'},
  {id:'ecg',label:'Electrocardiogram device'},
  {id:'cycle_ergometer',label:'Cycle ergometer'},
  {id:'dynamometer',label:'Dynamometer'},
  {id:'dxa',label:'DXA scanner'},
  {id:'environment_sensor',label:'Environmental sensor'},
  {id:'glucose_monitor',label:'Glucose monitor'}
];

const SOURCES = [
  {id:'B01',citation:'Crucian et al. (2016). Incidence of clinical symptoms during long-duration orbital spaceflight. DOI 10.2147/IJGM.S114188.',reading_level:'FT',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC5098747'},
  {id:'B02',citation:'Wotring (2015). Medication use by U.S. crewmembers on the International Space Station. DOI 10.1096/fj.14-264838.',reading_level:'AB',url:'https://ntrs.nasa.gov/api/citations/20140017010/downloads/20140017010.pdf'},
  {id:'B03',citation:'Wotring and Smith (2020). Dose Tracker application for collecting medication use data from International Space Station crew. DOI 10.3357/AMHP.5392.2020.',reading_level:'FT',url:'https://doi.org/10.3357/AMHP.5392.2020'},
  {id:'B04',citation:'Kerstman et al. (2012). Low back pain; reference as recorded in EXTENDED_RESEARCH_B.md. DOI 10.3357/ASEM.2876.2012.',reading_level:'AB',url:'https://ntrs.nasa.gov/citations/20090019566'},
  {id:'B05',citation:'van Oosterhout et al. (2024). Headache study, DOI 10.1212/WNL.0000000000209224; accessed evidence is the press release recorded in RESEARCH_MATRIX_B.csv.',reading_level:'S',url:'https://www.eurekalert.org/news-releases/1037030'},
  {id:'B06',citation:'Khalid et al. (2023). Pharmacological and non-pharmacological countermeasures to Space Motion Sickness: a systematic review. DOI 10.3389/fncir.2023.1150233.',reading_level:'FT',url:'https://www.frontiersin.org/articles/10.3389/fncir.2023.1150233/full'},
  {id:'S09',citation:'NASA HRP (2016). Risk of Performance Decrements and Adverse Health Outcomes Resulting from Sleep Loss, Circadian Desynchronization, and Work Overload. Targeted partial review inherited from ACADEMIC_BASE.md; source not revalidated here.',reading_level:'S',url:'https://humanresearchroadmap.nasa.gov/Evidence/reports/Sleep.pdf'},
  {id:'S12',citation:'NASA HRP (2022). Risk of Spaceflight Associated Neuro-ocular Syndrome (SANS). Targeted partial review inherited from ACADEMIC_BASE.md; source not revalidated here.',reading_level:'S',url:'https://humanresearchroadmap.nasa.gov/Evidence/reports/SANS%20EB%202022%20FINAL_8-15-22.pdf'}
];

/** @returns {Array<{id:string,label:string,source_ids:string[]}>} */
export function observations() { return structuredClone(OBSERVATIONS); }
/** @returns {Array<{id:string,label:string,unit:string,type:string}>} */
export function variables() { return structuredClone(VARIABLES); }
/** @returns {Array<{id:string,label:string}>} */
export function equipment() { return structuredClone(EQUIPMENT); }
/** @returns {Array<{id:string,citation:string,reading_level:string,url:string}>} */
export function sources() { return structuredClone(SOURCES); }
