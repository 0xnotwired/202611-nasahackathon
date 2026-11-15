import {createRecord,SCHEMA_VERSION} from '../core/index.js';

/** This bounded fixture API takes a programming option, not an imported file.
 * No Result error shape is declared for generateScenario, so malformed options
 * throw TypeError instead of silently defaulting or inventing a new interface. */
function seedOption(options) {
  const invalid=()=>{throw new TypeError('Scenario seed must be an own data unsigned 32-bit integer');};
  try {
    if(!options||typeof options!=='object'||Array.isArray(options)) return invalid();
    const prototype=Object.getPrototypeOf(options);
    if(prototype!==Object.prototype&&prototype!==null) return invalid();
    const keys=Reflect.ownKeys(options);
    if(keys.length!==1||keys[0]!=='seed') return invalid();
    const descriptor=Object.getOwnPropertyDescriptor(options,'seed');
    if(!descriptor||!Object.hasOwn(descriptor,'value')||!descriptor.enumerable) return invalid();
    const seed=descriptor.value;
    if(!Number.isInteger(seed)||seed<0||seed>4294967295) return invalid();
    return seed;
  } catch { return invalid(); }
}

/** Generate only team-authored fictional values. No clinical classification,
 * calibration to a study, data loading, ambient clock or ambient random source.
 * The first two configurations are the focal equipment/communication pair;
 * the last two provide the remaining environment presets. */
export function generateScenario(options) {
  const seed=seedOption(options);
  let state=seed;
  // Integer LCG constants are technical reproducibility parameters, not ranges
  // or thresholds for any measured variable.
  const next=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state;};
  const prefix=`synthetic-${seed}`;
  const subject=`${prefix}-crew-007`;
  const now='2026-11-15T12:00:00.000Z';
  let counter=0;
  const records=[];
  const make=fields=>{
    const {time=now,...rest}=fields;
    const result=createRecord({subject,source:'user_entered',origin:'synthetic',
      mission_phase:'mission',note:'Team demo: fictional data; no real measurement.',...rest},
      {clock:()=>time,newId:()=>`${prefix}-record-${String(++counter).padStart(3,'0')}`});
    if(!result.ok) throw new Error(`Invalid internal scenario record: ${result.error.field}`);
    records.push(result.value);
  };

  // Daily series deliberately contains an explicit gap, never a filled zero.
  make({type:'measurement',state:'recorded',variable:'pulse',value:70+next()%9,unit:'bpm',method:'demo-device',time:'2026-11-13T12:00:00.000Z'});
  make({type:'measurement',state:'not_recorded',variable:'pulse',method:'demo-device',time:'2026-11-14T12:00:00.000Z'});
  make({type:'measurement',state:'recorded',variable:'pulse',value:70+next()%9,unit:'bpm',method:'demo-device'});
  make({type:'measurement',state:'recorded',variable:'sleep_hours',value:5+next()%4,unit:'h',method:'self_report'});
  make({type:'observation',state:'recorded',variable:'fatigue',method:'self_report'});
  make({type:'observation',state:'recorded',variable:'mood',value:1+next()%5,unit:'team_scale_1_5',method:'self_report',note:'Team demo: own team mood self-report 1–5; not validated; not a screening.'});
  make({type:'measurement',state:'recorded',variable:'glucose',value:90+next()%11,unit:'mg/dL',method:'demo-device',note:'Team demo: fictional glucose; unit chosen for this example, not inferred from BUT CGM.'});
  make({type:'measurement',state:'not_recorded',variable:'glucose',method:'demo-device',time:'2026-11-14T12:00:00.000Z'});
  make({type:'exam',state:'recorded',variable:'bone_density',value:1+(next()%10)/100,unit:'g/cm²',method:'dxa',mission_phase:'preflight',time:'2025-11-15T12:00:00.000Z',note:'Team demo: fictional old DXA assessment; not a current measurement.'});
  make({type:'exam',state:'recorded',variable:'strength',value:100+next()%21,unit:'N m',method:'dynamometer',time:'2026-11-01T12:00:00.000Z'});
  make({type:'exam',state:'not_recorded',variable:'aerobic_capacity',method:'cycle_ergometer'});

  for(const [time,week] of [['2026-10-18T12:00:00.000Z','week one'],['2026-10-25T12:00:00.000Z','week two']]) {
    make({type:'observation',state:'confirmed_none',variable:'other',method:'self_report',time,mission_phase:'preflight',note:`Team demo: explicitly confirmed no new observation for ${week}.`});
  }
  const interval={from:'2026-11-15T11:00:00.000Z',to:now};
  make({type:'environment',state:'recorded',variable:'co2',value:600+next()%50,unit:'ppm',method:'environment_sensor',place:'module-a',sensor:`${prefix}-sensor-a`,interval:{...interval}});
  make({type:'environment',state:'recorded',variable:'co2',value:700+next()%50,unit:'ppm',method:'environment_sensor',place:'module-b',sensor:`${prefix}-sensor-b`,interval:{...interval},note:'Team demo: fictional reading from another spacecraft module; do not infer personal exposure.'});
  make({type:'environment',state:'recorded',variable:'ambient_temperature',value:20+next()%4,unit:'degC',method:'environment_sensor',place:'module-a',sensor:`${prefix}-sensor-a`,interval:{...interval}});

  const environments=['station','spacecraft','rover','surface_base'];
  const config=environments.map((environment,index)=>({
    id:`${prefix}-config-${environment}`,schema_version:SCHEMA_VERSION,
    name:`Team demo — ${environment.replace('_',' ')}${index===0?' with fictional device':index===1?' without fictional device':''}`,
    available_equipment:index===0?['demo-device','environment_sensor']:['environment_sensor'],
    communication:index===0?'real_time':index===1?'delayed':'no_link',
    phases:[{name:'preflight',from:'2025-01-01T00:00:00.000Z',to:'2026-11-01T00:00:00.000Z'},
      {name:'mission',from:'2026-11-01T00:00:00.000Z',to:'2027-01-01T00:00:00.000Z'}],
    environment,gravity_note:'Team demo context only; no calculation or physiological claim.',
    attention_criteria:[]
  }));
  const procedures=[{
    id:`${prefix}-procedure-recording`,schema_version:SCHEMA_VERSION,version:'1',
    title:'Fictional recording walkthrough — team demo only',
    purpose:'Exercise the software journey with invented entries; no measurement or clinical action.',
    required_equipment:['demo-device'],
    preparation:['Confirm that all information is fictional and the device is a team demo prop.'],
    steps:[{id:'choose',text:'Select the fictional observation in the demo catalog.'},
      {id:'record',text:'Copy the fictional example into the demo record; this does not measure health.',records:'pulse'},
      {id:'finish',text:'Confirm that this was a software demonstration with no care action.'}],
    source:'team_defined',review_status:'demo'
  }];
  const tasks=[{
    id:`${prefix}-task-pending`,schema_version:SCHEMA_VERSION,subject,day:'2026-11-15',
    procedure_id:procedures[0].id,description:'Team demo: complete the fictional recording walkthrough.',
    assigned_by:'team_defined',completion:'pending',result_ids:[]
  }];
  return {config,records,tasks,procedures};
}
