// Reusable checkers reject placeholders on assertions, not import errors.
export const allContracts = [
  {name:'core', path:"../../app/core/index.js", suite:"./core.js", check:"checkCore"},
  {name:'mission', path:"../../app/mission/index.js", suite:"./mission.js", check:"checkMission"},
  {name:'catalogs', path:"../../app/catalogs/index.js", suite:"./catalogs.js", check:"checkCatalogs"},
  {name:'store', path:"../../app/store/index.js", suite:"./store.js", check:"checkStore"},
  {name:'scenario', path:"../../app/scenario/index.js", suite:"./scenario.js", check:"checkScenario"},
  {name:'readings', path:"../../app/readings/index.js", suite:"./readings.js", check:"checkReadings"},
  {name:'procedures', path:"../../app/procedures/index.js", suite:"./procedures.js", check:"checkProcedures"},
  {name:'plan', path:"../../app/plan/index.js", suite:"./plan.js", check:"checkPlan"},
  {name:'privacy', path:"../../app/privacy/index.js", suite:"./privacy.js", check:"checkPrivacy"},
  {name:'episode', path:"../../app/episode/index.js", suite:"./episode.js", check:"checkEpisode"},
  {name:'copilot', path:"../../app/copilot/index.js", suite:"./copilot.js", check:"checkCopilot"},
  {name:'summary', path:"../../app/summary/index.js", suite:"./summary.js", check:"checkSummary"},
  {name:'importers', path:"../../app/importers/index.js", suite:"./importers.js", check:"checkImporters"},
  {name:'sync', path:"../../app/sync/index.js", suite:"./sync.js", check:"checkSync"},
  {name:'ui/base', path:"../../app/ui/base/index.js", suite:"./ui.js", check:"checkBaseUI"},
  {name:'ui/my-health', path:"../../app/ui/my-health/index.js", suite:"./ui.js", check:"checkView"},
  {name:'ui/adaptation', path:"../../app/ui/adaptation/index.js", suite:"./ui.js", check:"checkView"},
  {name:'ui/habitat', path:"../../app/ui/habitat/index.js", suite:"./ui.js", check:"checkView"},
  {name:'ui/my-progress', path:"../../app/ui/my-progress/index.js", suite:"./ui.js", check:"checkView"},
  {name:'ui/my-day', path:"../../app/ui/my-day/index.js", suite:"./ui.js", check:"checkView"},
  {name:'ui/my-plan', path:"../../app/ui/my-plan/index.js", suite:"./ui.js", check:"checkView"},
  {name:'ui/on-board', path:"../../app/ui/on-board/index.js", suite:"./ui.js", check:"checkView"},
  {name:'ui/i-feel-different', path:"../../app/ui/i-feel-different/index.js", suite:"./ui.js", check:"checkView"},
  {name:'ui/nasa-cases', path:"../../app/ui/nasa-cases/index.js", suite:"./ui.js", check:"checkView"},
  {name:'ui/ground', path:"../../app/ui/ground/index.js", suite:"./ui.js", check:"checkView"},
];

// The orchestrator promotes entries as reviewed module implementations land.
// Keep definitions and explicit export surfaces; retire only placeholder checks.
export const implementedNames = ['core','mission','catalogs','store','scenario','importers','readings','procedures','plan','privacy','sync','episode','copilot','summary','ui/base'];
// A view cannot satisfy checkView without a DOM, so implemented views are checked separately (export surface and an
// answering model); their drawing is checked in a browser by the module's own script.
export const implementedViewNames = ['ui/my-health', 'ui/adaptation', 'ui/habitat', 'ui/my-progress', 'ui/my-day', 'ui/my-plan', 'ui/on-board', 'ui/ground', 'ui/i-feel-different', 'ui/nasa-cases'];
export const contracts = allContracts.filter(entry => !implementedNames.includes(entry.name) && !implementedViewNames.includes(entry.name));
export const implementedContracts = allContracts.filter(entry => implementedNames.includes(entry.name));
export const implementedViews = allContracts.filter(entry => implementedViewNames.includes(entry.name));

// Explicit contract surface. Do not derive this from Object.keys(implementation):
// that would silently accept a removed export. Undefined component output shapes
// remain out of scope, but their named entry points must exist.
export const expectedExports = {
  core: 'STATES TYPES ORIGINS SCHEMA_VERSION validateRecord createRecord areComparable',
  mission: 'validateConfig hasEquipment phaseAt',
  catalogs: 'observations variables equipment sources',
  store: 'openStore',
  scenario: 'generateScenario',
  readings: 'series latest baseline environment cumulative attention seriesBySourceTime',
  procedures: 'validateProcedure availability start advance interrupt resume finish publishProcedure listProcedures getProcedure',
  plan: 'tasksFor progress mark linkResult',
  privacy: 'createSession logShared sharedLog',
  episode: 'open situation link close issueAlert',
  copilot: 'card validateRules',
  summary: 'generate',
  importers: 'importCRF importAdaptation importGlucose',
  sync: 'createLink enqueue advance received deliveries',
  'ui/base': 'stateLabel originLabel valueWithContext accessibleTable lineChart dataStateBadge attentionBadge renderChart renderTable renderBadge renderEntry renderSection viewKit',
  'ui/my-health': 'model mount',
  'ui/adaptation': 'model mount',
  'ui/habitat': 'model mount',
  'ui/my-progress': 'model mount',
  'ui/my-day': 'model mount',
  'ui/my-plan': 'model mount',
  'ui/on-board': 'model mount',
  'ui/i-feel-different': 'model mount',
  'ui/nasa-cases': 'model mount',
  'ui/ground': 'model mount'
};
