/**
 * Interfaces mirror docs/CONTRACTS.md 0.5. All store consumers return promises.
 * Unspecified return shapes use unknown rather than invented fields.
 * @typedef {import('./data.js').Record} Record
 * @typedef {import('./data.js').MissionConfig} MissionConfig
 * @typedef {import('./data.js').Procedure} Procedure
 * @typedef {import('./data.js').Execution} Execution
 * @typedef {import('./data.js').Task} Task
 * @typedef {import('./data.js').Episode} Episode
 * @typedef {import('./data.js').Shared} Shared
 * @typedef {import('./data.js').Delivery} Delivery
 * @template T
 * @typedef {import('./data.js').Result<T>} Result
 */
/** @typedef {{clock:()=>string,newId:()=>string}} Context */
/** @typedef {{comparable:boolean,reason?:string}} Comparability */
/** @typedef {{
 * STATES:ReadonlyArray<string>, TYPES:ReadonlyArray<string>, ORIGINS:ReadonlyArray<string>, SCHEMA_VERSION:number,
 * validateRecord:(data:unknown)=>Result<Record>,
 * createRecord:(fields:Partial<Record>,context:Context)=>Result<Record>,
 * areComparable:(a:Record,b:Record)=>Comparability
 * }} Core */
/** @typedef {{
 * validateConfig:(data:unknown)=>Result<MissionConfig>,
 * hasEquipment:(config:MissionConfig,equipmentId:string)=>boolean,
 * phaseAt:(config:MissionConfig,time:string)=>string|null
 * }} Mission */
/** @typedef {{
 * observations:()=>Array<{id:string,label:string,source_ids:string[]}>,
 * variables:()=>Array<{id:string,label:string,unit:string,type:string}>,
 * equipment:()=>Array<{id:string,label:string}>,
 * sources:()=>Array<{id:string,citation:string,reading_level:string,url:string}>
 * }} Catalogs */
/** @typedef {'records'|'executions'|'tasks'|'episodes'|'shared'|'deliveries'|'config'} Collection */
/** @typedef {{
 * status:()=>{kind:string,persistent:boolean,reason?:string},
 * save:(collection:Collection,object:object)=>Promise<Result<object>>,
 * get:(collection:Collection,id:string)=>Promise<Result<object>>,
 * list:(collection:Collection,filter:object)=>Promise<Result<object[]>>,
 * saveBatch:(collection:Collection,objects:object[])=>Promise<Result<number>>,
 * updateState:(collection:Collection,id:string,changes:object)=>Promise<unknown>,
 * close:()=>Promise<void>
 * }} Store */
/** @typedef {{openStore:(options:{kind:'indexeddb'|'memory',name:string})=>Promise<Result<Store>>}} StoreModule */
/** @typedef {{generateScenario:(options:{seed:number})=>{config:MissionConfig[],records:Record[],tasks:Task[],procedures:Procedure[]}} Scenario */
/** @typedef {{subject:string,variable:string,from:string,to:string}} SeriesQuery */
/** @typedef {{status:'within'|'outside'|'no_criterion'|'not_assessed',criterion?:import('./data.js').AttentionCriterion,reason?:string}} Attention */
/** @typedef {{
 * series:(store:Store,query:SeriesQuery)=>Promise<{points:unknown[],gaps:unknown[],n:number,non_comparable_groups:unknown[]}>,
 * latest:(store:Store,query:{subject:string,variable:string},context:{clock:()=>string})=>Promise<{record:Record|null,age_days:number|null}>,
 * baseline:(store:Store,query:{subject:string,variable:string,to:string})=>Promise<{n:number,from:string,to:string}>,
 * environment:(store:Store,query:{place:string,interval:{from:string,to:string}})=>Promise<{records:Record[],coverage:{from:string,to:string,sensors:string[]}}>,
 * cumulative:(store:Store,query:SeriesQuery)=>Promise<{total:number|null,unit:string,n:number,gaps:unknown[]}>,
 * attention:(record:Record,config:MissionConfig)=>Attention
 * }} Readings */
/** @typedef {{
 * validateProcedure:(data:unknown)=>Result<Procedure>,
 * availability:(procedure:Procedure,config:MissionConfig)=>{available:boolean,missing:string[],alternative_id?:string},
 * start:(store:Store,procedure:Procedure,config:MissionConfig,context:Context & {subject:string})=>Promise<Result<Execution>>,
 * advance:(store:Store,executionId:string,options:{record?:Record})=>Promise<Result<Execution>>,
 * interrupt:(store:Store,executionId:string,options:{reason:string})=>Promise<Result<Execution>>,
 * resume:(store:Store,executionId:string)=>Promise<Result<Execution>>,
 * finish:(store:Store,executionId:string,options:{state:'completed'|'could_not',difficulties:string[]})=>Promise<unknown>
 * }} Procedures */
/** @typedef {{
 * tasksFor:(store:Store,query:{subject:string,day:string})=>Promise<Result<Task[]>>,
 * progress:(store:Store,query:{subject:string,day:string})=>Promise<Result<{total:number,done:number,not_done:number,pending:number}>>,
 * mark:(store:Store,taskId:string,changes:{completion:string,execution_id?:string,note?:string})=>Promise<Result<Task>>,
 * linkResult:(store:Store,taskId:string,recordId:string)=>Promise<Result<Task>>
 * }} Plan */
/** @typedef {{unlock:()=>unknown,active:()=>boolean,close:()=>unknown}} Session */
/** @typedef {{
 * createSession:(context:{clock:()=>string})=>Session,
 * logShared:(store:Store,fields:{subject:string,what:string[]|string,with:string,channel:string},context:Context)=>Promise<Result<Shared>>,
 * sharedLog:(store:Store,query:{subject:string})=>Promise<Result<Shared[]>>
 * }} Privacy */
/** @typedef {{you_recorded:unknown,we_know:unknown,missing:unknown,you_can:unknown,happened:unknown,next:unknown}} Situation */
/** @typedef {{
 * open:(store:Store,observation:Record,context:Context)=>Promise<Result<Episode>>,
 * situation:(store:Store,episodeId:string,config:MissionConfig,context:{clock:()=>string})=>Promise<Situation>,
 * link:(store:Store,episodeId:string,links:{execution_id?:string,record_id?:string,task_id?:string})=>Promise<unknown>,
 * close:(store:Store,episodeId:string)=>Promise<unknown>
 * }} EpisodeModule */
/** @typedef {{card:(situation:Situation,config:MissionConfig,rules:object[])=>{data:unknown,gaps:unknown,suggestion:object|null,no_guidance:boolean,not_assessed:unknown,alert:{text:string}|null}} Copilot */
/** @typedef {{generate:(store:Store,episodeId:string,config:MissionConfig,context:{clock:()=>string})=>Promise<Result<{id:string,text:string,origins:string[],pending_send:boolean}>>}} Summary */
/** @typedef {{records:Record[],rejected:unknown,skipped:unknown}} ImportReport */
/** @typedef {{
 * importCRF:(text:string)=>Result<ImportReport>,
 * importAdaptation:(text:string,options:{study:string})=>Result<ImportReport>,
 * importGlucose:(text:string,options:{subject:string})=>Result<ImportReport>
 * }} Importers */
/** @typedef {{setMode:(mode:'real_time'|'delayed'|'no_link',delay_ms?:number)=>unknown}} Link */
/** @typedef {{
 * createLink:(options:{clock:()=>string,mode:'real_time'|'delayed'|'no_link',delay_ms:number})=>Link,
 * enqueue:(store:Store,sharedId:string,context:Context)=>Promise<Result<Delivery>>,
 * advance:(store:Store,link:Link,context:{clock:()=>string})=>Promise<Result<Delivery[]>>,
 * received:(store:Store,query:{subject?:string})=>Promise<Result<Delivery[]>>
 * }} Sync */
/** @typedef {{state:'loading'|'empty'|'error'|'ready',reason?:string}} ViewModel */
/** @typedef {{model:(services:object,params:object)=>Promise<ViewModel>,mount:(element:Element,viewModel:ViewModel,actions:object)=>unknown}} View */
/** @typedef {{
 * stateLabel:(record:Record)=>unknown, originLabel:(origin:string)=>unknown,
 * valueWithContext:(record:Record)=>unknown, accessibleTable:Function, lineChart:Function,
 * dataStateBadge:(record:Record,context:{clock:()=>string})=>unknown,
 * attentionBadge:(result:Attention)=>unknown
 * }} BaseUI */
export {};
