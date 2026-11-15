// Where each importable source comes from. This is DATA with provenance, not logic.
// Citations and licences are copied from docs/DATA_ATTRIBUTIONS.md and docs/DATASET_CITATIONS.md, which were read in
// full in the session that wrote this file (SOURCE). Where those documents print "(version1.0.0)" or "Ploutz- Snyder"
// as a typing artefact or a registry spelling, only the BUT CGM version spacing is normalised; creator spellings are kept.
// The BUT CGM sampling interval comes from its README ("Every 5th minute"), full text read on 2026-11-15 (SOURCE).
// No author, year or figure here comes from memory.

export const PROFILES = Object.freeze([
  Object.freeze({
    id: 'BUT_CGM', label: 'BUT CGM 1.0.0 (PhysioNet): continuous glucose', doi: '10.13026/hv8f-3w60',
    importer: 'importGlucose', needs_subject: true, accepts: 'a semicolon-separated CSV with the columns Timestamp and Glycemia',
    citation: Object.freeze([
      'Šaclová, L., Nemcova, A., Goldschmidt, T., Kralik, M., Chlíbková, D., Smital, L., Smisek, R., & Hubálek, J. (2026). Brno University of Technology Continuous Glycaemia, ECG, Activity and Food Intake Database (BUT CGM) (version 1.0.0). PhysioNet. RRID:SCR_007345. https://doi.org/10.13026/hv8f-3w60',
      'Pollard, T., Moody, B. E., Lehman, L., Gow, B., Fernandes, C., Xie, C., Johnson, A., Mark, R. G., & Heldt, T. (2026). PhysioNet as a global platform for biomedical research. Nature Health. https://doi.org/10.1038/s44360-026-00096-z'
    ]),
    license: 'Creative Commons Attribution 4.0 International (https://creativecommons.org/licenses/by/4.0/)',
    sampling: Object.freeze({interval_s: 300, source: 'BUT CGM README: "Every 5th minute" (full text read 2026-11-15)'})
  }),
  Object.freeze({
    id: 'MR079G', label: 'MR079G Isokinetic Muscle Function (Flight Analog)', doi: '10.83263/bk5h-r757',
    importer: 'importAdaptation', options: Object.freeze({study: 'MR079G'}), needs_subject: false, accepts: 'the MR079G adaptation CSV',
    citation: Object.freeze(['Moore, Alan D., Jr.; Lee, Stuart M. C.; Ciaozzo, Vince J.; Baldwin, Kenneth M.; Ploutz- Snyder, Lori (2026). Isokinetic Muscle Function (Flight Analog) [Dataset]. Ames Research Center. https://doi.org/10.83263/bk5h-r757']),
    license: 'CC0-1.0', sampling: null
  }),
  Object.freeze({
    id: 'MR035G', label: 'MR035G Bone Densitometry Assessment (Flight Analog)', doi: '10.83263/7myc-5j86',
    importer: 'importAdaptation', options: Object.freeze({study: 'MR035G'}), needs_subject: false, accepts: 'the MR035G adaptation CSV',
    citation: Object.freeze(['Principal Investigator: Sibonga, Jean D.; Technical Assistant to Principal Investigator: Evans, Harlan (2026). Bone Densitometry Assessment (Flight Analog) [Dataset]. Ames Research Center. https://doi.org/10.83263/7myc-5j86']),
    license: 'CC0-1.0', sampling: null
  }),
  Object.freeze({
    id: 'MR080G', label: 'MR080G Aerobic Capacity (Flight Analog)', doi: '10.83263/w056-8t76',
    importer: 'importAdaptation', options: Object.freeze({study: 'MR080G'}), needs_subject: false, accepts: 'the verified MR080G test file (other MR080G profiles are refused)',
    citation: Object.freeze(['Principal Investigator: Moore, Alan D., Jr.; Technical Assistant to Principal Investigator: Wilson, Cassie A.; Principal Investigator: Ploutz- Snyder, Lori; Technical Assistant to Principal Investigator: Everett-Downs, Meghan (2026). Aerobic Capacity (Flight Analog) [Dataset]. Ames Research Center. https://doi.org/10.83263/w056-8t76']),
    license: 'CC0-1.0', sampling: null
  })
]);

/** Listed so nobody wonders where it went; never loadable. */
export const UNSUPPORTED = Object.freeze([
  Object.freeze({id: 'CRF', label: 'CRF Daily Vitals (NASA)',
    reason: 'Not offered: the units of its vital-sign columns and its date handling are unconfirmed by the source, so its values cannot be shown as measurements.'})
]);

export const profileById = id => PROFILES.find(profile => profile.id === id) ?? null;

/** DOI taken from a record's own `source` text (https://doi.org/<doi>#profile=...), or null. */
export function doiOf(source) {
  if (typeof source !== 'string') return null;
  const head = source.split('#')[0];
  const prefix = 'https://doi.org/';
  return head.startsWith(prefix) && head.length > prefix.length ? head.slice(prefix.length) : null;
}

/** What the card may say about a record's source. A DOI the table does not know gets no invented citation. */
export function describeSource(source) {
  const doi = doiOf(source);
  const profile = doi ? PROFILES.find(candidate => candidate.doi === doi) ?? null : null;
  return {doi, profile, study: profile ? profile.label : 'study not recognised',
    citation: profile ? profile.citation : ['citation not available'], license: profile ? profile.license : 'licence not available'};
}
