import test from 'node:test';
import assert from 'node:assert/strict';
import {importCRF,importAdaptation,importGlucose} from './index.js';
import {validateRecord} from '../core/index.js';
const headers='Subject,Date,Test_Phase,BR_Day,Vitals Time,Pulse,SysBP,DiaBP,Resp Rate,Weight,Body Temp,Height,Comment,Bowel Movement Description';
const row='007,7/6/2007,PRE_TEST,-1,9:40,0,120,80,16,70,37,170,private clinical words,private bowel words';
const crf=(...rows)=>headers+'\n'+rows.join('\n');
const good=r=>{assert.equal(r.ok,true,JSON.stringify(r));return r.value;};
test('CRF preserves values, absence, original subject, source clock and privacy',()=>{
 const report=good(importCRF(crf(row,row.replace(',0,120,80,',',NA,,NaN,'))));
 assert.equal(report.records.length,14);assert.equal(report.rejected.length,0);assert.equal(report.skipped.length,4);
 const first=report.records[0];assert.equal(first.subject,'007');assert.equal(first.value,0);assert.equal(first.unit,null);assert.equal(first.unit_status,'unknown');assert.equal(first.origin,'ground_analog');assert.equal(first.time,null);assert.equal(first.source_time.value,'2007-07-06T09:40');assert.equal(first.source_time.precision,'minute');assert.equal(first.source_time.timezone,null);assert.match(first.note,/BR_Day=-1/);
 for(const r of report.records){assert.equal(validateRecord(r).ok,true);assert.equal(r.mission_phase,'PRE_TEST');}
 for(const r of report.records.slice(7,10)){assert.equal(r.state,'not_recorded');assert.equal(Object.hasOwn(r,'value'),false);}
 assert.equal(JSON.stringify(report).includes('private'),false);
 assert.deepEqual(importCRF(crf(row)),importCRF(crf(row)));
 assert.notEqual(first.id,good(importCRF(crf(row.replace(',0,',',1,')))).records[0].id);
});
test('malformed NASA rows do not discard surrounding valid rows',()=>{
 const r=good(importCRF(crf(row,row.replace(',120,',',Infinity,'),row.replace('7/6/2007','2/30/2007'),row)));
 assert.equal(r.records.length,14);assert.equal(r.rejected.length,2);assert.deepEqual(r.rejected.map(x=>x.row),[3,4]);
 assert.equal(importCRF(headers.replace('Subject','Pulse')+'\n'+row).ok,false);
});
test('CSV quotes do not leak comments and malformed syntax is explicit',()=>{
 const r=good(importCRF(crf(row.replace('private clinical words','"comma, quote ""and""\nnewline"'))));assert.equal(r.records.length,7);assert.equal(r.skipped.length,2);
 assert.equal(importCRF(crf(row)+'\n"unfinished').ok,false);
 for(const t of [null,{},[],7,'', 'x'.repeat(5*1024*1024+1)])assert.equal(importCRF(t).ok,false);
});
test('MR079G and MR035G retain source quantities/date-only and unknown BMD unit',()=>{
 const a=good(importAdaptation('ID,Campaign,Subject,Date,Test_Phase,BR_Day,Test,Position,Value,Units\n1,C3G,007,3/12/2009,PRE_TEST,-1,knee,seated,12,ft-lb',{study:'MR079G'}));
 assert.equal(a.records[0].value,12);assert.equal(a.records[0].unit,'ft-lb');assert.equal(a.records[0].source_time.value,'2009-03-12');assert.equal(a.records[0].source_time.precision,'date');assert.match(a.records[0].method,/seated/);
 const b=good(importAdaptation('ID,CAMPAIGN,SUBJECT,TEST_PHASE,BR_DAY,SCAN_DATE,NET_AVG_BMD\n1,C3D,007,POST_TEST,90,2007-07-06,0.75',{study:'MR035G'}));assert.equal(b.records[0].unit_status,'unknown');assert.equal(b.records[0].value,0.75);
 assert.equal(importAdaptation('anything',{study:'BRSMImmune'}).ok,false);
 let reads=0;const hostile={};Object.defineProperty(hostile,'study',{get(){reads++;return 'MR079G';}});assert.equal(importAdaptation('anything',hostile).ok,false);assert.equal(reads,0);
});
test('selected MR080G explicit units are scoped to verified exact test',()=>{
 const text='Campaign,Subject,Date,Test_Phase,BR_Day,Test,Stage,HR,VO2,VCO2,RER,VO2 (ml/kg/min),VE,FEO2,FECO2\nC3C,7772,5/7/2006,PRE_TEST,-1,Pre Bed Rest Maximum Cycle-Light,50 Watt Av.,100,1,0.8,0.8,20,30,17,4';
 const a=good(importAdaptation(text,{study:'MR080G'}));assert.equal(a.records.length,8);assert.equal(a.records.find(r=>r.variable==='VE').unit,'L/min at BTPS');
 const b=good(importAdaptation(text.replace('7772','8881'),{study:'MR080G'}));assert.equal(b.records.length,0);assert.equal(b.rejected[0].code,'unsupported_profile');
 const changed=good(importAdaptation(text.replace('Pre Bed Rest Maximum Cycle-Light','different test'),{study:'MR080G'}));assert.equal(changed.records.length,0);assert.equal(changed.rejected[0].code,'unsupported_profile');
});
test('BUT CGM BOM/semicolon/shifted clock preserves values and missing states',()=>{
 const r=good(importGlucose('\ufeffTimestamp;Glycemia\r\n2100-02-28 09:40:00;5.3\r\n2100-02-28 09:45:00;NaN\r\n2100-02-28 09:50:00;\r\n2100-02-30 09:50:00;8',{subject:'007'}));
 assert.equal(r.records.length,3);assert.equal(r.rejected.length,1);assert.equal(r.records[0].value,5.3);assert.equal(r.records[0].unit,'mmol/L');assert.equal(r.records[0].origin,'terrestrial');assert.equal(r.records[0].source_time.calendar,'shifted');assert.match(r.records[0].source,/10.13026\/hv8f-3w60/);
 for(const a of r.records){assert.equal(validateRecord(a).ok,true);assert.equal(a.subject,'007');}
 assert.equal(r.records[1].state,'not_recorded');assert.equal(Object.hasOwn(r.records[1],'value'),false);
 assert.equal(importGlucose('Timestamp;Glycemia',{}).ok,false);
});
test('output bounds are rejected explicitly rather than silently truncating',()=>{
 assert.equal(importCRF(crf(...Array(1430).fill(row))).ok,false);
});
test('unknown header aliases cannot override profile identity, phase or clock scope',()=>{
 const c=good(importCRF(headers+',Campaign\n'+row+',unrelated-campaign')).records[0];assert.equal(c.source_time.scope,'CRF:Campaign3:007');
 const text='ID,CAMPAIGN,SUBJECT,TEST_PHASE,BR_DAY,SCAN_DATE,NET_AVG_BMD,Campaign,Subject,Test_Phase,BR_Day\n1,C3D,007,POST_TEST,90,2007-07-06,0.75,evil,wrong,other,999';
 const a=good(importAdaptation(text,{study:'MR035G'})).records[0];assert.equal(a.subject,'007');assert.equal(a.mission_phase,'POST_TEST');assert.match(a.note,/BR_Day=90/);assert.equal(a.source_time.scope,'MR035G:C3D:007');assert.equal(a.source.includes('evil'),false);
});
test('precision loss and underflow never silently alter a source value',()=>{
 const text='Timestamp;Glycemia\n2100-01-01 00:00:00;1e-999\n2100-01-01 00:05:00;9007199254740993\n2100-01-01 00:10:00;1.0000000000000001\n2100-01-01 00:15:00;5.3000e0';
 const r=good(importGlucose(text,{subject:'007'}));assert.equal(r.rejected.length,3);assert.equal(r.records.length,1);assert.equal(r.records[0].value,5.3);
});
test('caller-assigned glucose subject participates in deterministic record identity',()=>{
 const text='Timestamp;Glycemia\n2100-01-02 01:02:03;5.5';const a=good(importGlucose(text,{subject:'A'})).records[0];const b=good(importGlucose(text,{subject:'B'})).records[0];assert.notEqual(a.id,b.id);assert.equal(a.source_time.scope,'BUT_CGM:1.0.0:A');assert.equal(b.source_time.scope,'BUT_CGM:1.0.0:B');
});
test('MR079G absent value may have absent unit, while numeric value requires its unit',()=>{
 const head='Campaign,Subject,Date,Test_Phase,BR_Day,Test,Position,Value,Units';
 const row='C3G,007,3/12/2009,PRE_TEST,-1,knee,seated,';
 const absent=good(importAdaptation(head+'\n'+row+'NA,NA',{study:'MR079G'}));assert.equal(absent.records.length,1);assert.equal(absent.records[0].state,'not_recorded');for(const field of ['value','unit','unit_status'])assert.equal(Object.hasOwn(absent.records[0],field),false);
 const present=good(importAdaptation(head+'\n'+row+'12,NA',{study:'MR079G'}));assert.equal(present.records.length,0);assert.equal(present.rejected[0].field,'unit');
});
test('ill-formed UTF16 cannot alias another UTF8 fingerprint or subject identity',()=>{
 const text='Timestamp;Glycemia\n2100-01-02 01:02:03;5.5';assert.equal(importGlucose(text,{subject:'\ud800'}).ok,false);assert.equal(importGlucose(text,{subject:'\udc00'}).ok,false);assert.equal(importGlucose(text+'\n\ud800',{subject:'A'}).ok,false);assert.equal(importGlucose(text,{subject:'\ufffd'}).ok,true);assert.equal(importGlucose(text,{subject:'🛰️'}).ok,true);
});
