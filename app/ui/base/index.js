// M07 base interface: the seven components every view uses, so the same data looks the same everywhere.
// The shell model, drawing and composition live in sibling files; this index exports only the contract surface.
export {stateLabel, originLabel, valueWithContext, dataStateBadge, attentionBadge} from './labels.js';
export {accessibleTable, lineChart} from './chart.js';
// DOM renderers, so a view never imports a file inside this module. Drawing only; models stay in the components above.
export {renderChart, renderTable, renderBadge} from './dom.js';
