// Synthetic, non-clinical fixture values. No external data or thresholds.
export const time = '2026-11-15T12:00:00.000Z';
export const context = { clock: () => time, newId: () => '007' };
export const record = { id:'007', schema_version:1, type:'measurement', state:'recorded',
  variable:'demo_variable', value:12, unit:'demo_unit', method:'demo_instrument', time,
  origin:'synthetic', source:'user_entered', mission_phase:'demo', subject:'demo-subject' };
export const config = { id:'demo', schema_version:1, name:'Team demo', available_equipment:['demo-device'],
  communication:'no_link', phases:[{name:'demo',from:time,to:'2026-11-16T12:00:00.000Z'}],
  environment:'station', attention_criteria:[] };
export const procedure = {id:'demo-procedure',schema_version:1,version:'1',title:'Non-clinical fixture',
  purpose:'Test equipment availability only',required_equipment:['demo-device'],preparation:[],
  steps:[{id:'demo-step',text:'Record a fictional observation'}],source:'team_defined',review_status:'demo'};
export const invalidRecords = [null, [], '', 7, {}, {...record,id:7}, {...record,value:NaN},
  {...record,value:Infinity}, {...record,state:'unknown'}, {...record,origin:'ground'},
  {...record,subject:''}, {...record,variable:[]}, {...record,schema_version:999},
  {...record,time:'yesterday'}, {...record,state:'not_recorded',value:0}];
