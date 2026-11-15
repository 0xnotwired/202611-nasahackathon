/**
 * Contract version 0.10. Authority: docs/CONTRACTS.md.
 * Documentation only: no runtime validation or module logic lives here.
 * Every persisted object additionally carries schema_version (section 3),
 * represented by Persisted<T>; nested criteria are not separately persisted.
 * Record.value/unit are required for recorded measurement/environment/exam;
 * interval/place/sensor are required for environment. At least one criterion
 * bound is required. UTC timestamps and identifiers remain strings.
 * Underspecified object/error fields are deliberately not invented here.
 *
 * @template T
 * @typedef {{ok:true,value:T}|{ok:false,error:{code:string,field?:string,message:string}}} Result
 */
/** @template T @typedef {T & {schema_version:number}} Persisted */

/**
 * @typedef {Object} Record
 * @property {string} id
 * @property {number} schema_version
 * @property {'observation'|'measurement'|'action'|'environment'|'exam'} type
 * @property {'recorded'|'confirmed_none'|'not_recorded'} state
 * @property {string} variable
 * @property {number} [value]
 * @property {string|null} [unit]
 * @property {'known'|'unknown'} [unit_status]
 * @property {string} method
 * @property {string|null} time
 * @property {{value:string,raw:string,precision:'date'|'minute'|'second',timezone:null,calendar:'original'|'shifted'|'unknown',scope:string}} [source_time]
 * @property {{from:string,to:string}} [interval]
 * @property {'synthetic'|'ground_analog'|'terrestrial'|'flight'|'cell_culture'} origin
 * @property {string} source
 * @property {string} mission_phase
 * @property {string} subject
 * @property {string} [place]
 * @property {string} [sensor]
 * @property {string} [corrects]
 * @property {string} [note]
 */

/**
 * @typedef {Object} MissionConfig
 * @property {string} id
 * @property {string} name
 * @property {string[]} available_equipment
 * @property {'real_time'|'delayed'|'no_link'} communication
 * @property {Array<{name:string,from:string,to:string}>} phases
 * @property {'station'|'spacecraft'|'rover'|'surface_base'} environment
 * @property {string} [gravity_note]
 * @property {AttentionCriterion[]} attention_criteria
 */

/**
 * @typedef {Object} AttentionCriterion
 * @property {string} id
 * @property {string} variable
 * @property {string} unit
 * @property {number} [low]
 * @property {number} [high]
 * @property {string} defined_by
 * @property {string} source
 * @property {'demo'|'reviewed'} review_status
 */

/**
 * @typedef {Object} Procedure
 * @property {string} id
 * @property {string} version
 * @property {string} title
 * @property {string} purpose
 * @property {string[]} required_equipment
 * @property {string[]} preparation
 * @property {Array<{id:string,text:string,records?:string}>} steps
 * @property {string} source
 * @property {'draft'|'demo'|'reviewed'} review_status
 * @property {string} [documented_alternative]
 */

/**
 * @typedef {Object} Execution
 * @property {string} id
 * @property {string} procedure_id
 * @property {string} procedure_version
 * @property {string} subject
 * @property {'blocked'|'in_progress'|'interrupted'|'completed'|'could_not'} state
 * @property {number} current_step
 * @property {string} started
 * @property {string} updated
 * @property {string[]} difficulties
 * @property {string[]} records
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} subject
 * @property {string} day
 * @property {string} [procedure_id]
 * @property {string} description
 * @property {string} assigned_by
 * @property {'pending'|'done'|'not_done'} completion
 * @property {string} [execution_id]
 * @property {string[]} result_ids
 */

/**
 * @typedef {Object} Episode
 * @property {string} id
 * @property {string} subject
 * @property {string} opened
 * @property {string} [closed]
 * @property {string} observation_id
 * @property {string[]} execution_ids
 * @property {string[]} record_ids
 * @property {string[]} task_ids
 * @property {boolean} alert_issued
 */

/**
 * @typedef {Object} Shared
 * @property {string} id
 * @property {string} subject
 * @property {string} time
 * @property {string[]|string} what
 * @property {string} with
 * @property {string} channel
 */

/**
 * @typedef {Object} Delivery
 * @property {string} id
 * @property {string} shared_id
 * @property {string} subject
 * @property {string[]|string} what
 * @property {string} created
 * @property {string} sent
 * @property {string} [received]
 * @property {'queued'|'in_transit'|'received'} state
 */

export const CONTRACT_VERSION = "0.10";
