/**
 * Form Feature Mapping Configuration
 * Maps form IDs to their corresponding backend feature names for feature gating
 */

export interface FormFeatureMap {
  [formId: string]: string;
}

/**
 * Mapping of form IDs to backend feature names
 * Feature names must match exactly with the backend Feature.Name values
 */
export const FORM_FEATURE_MAP: FormFeatureMap = {
  // Dashboard & Program
  'dashboard': 'Dashboard',
  'program': 'Program Management',

  // WBS & Sub-features
  'wbs': 'Work Breakdown Structure (WBS)',
  'wbs-manpower': 'Manpower Planning',
  'wbs-odc': 'ODC (Other Direct Cost) Table',
  'wbs-todo-list': 'Sprint Planning',

  // Project Management Forms
  'job-start': 'Job Start Form',
  'input-register': 'Input/Output Register',
  'correspondence': 'Correspondence',
  'check&review': 'Check & Review',
  'change-control': 'Change Control',
  'progress-review': 'Monthly Progress Review',
  'closure': 'Project Closure',
  'monthly-reports': 'Monthly Reports',

  // Business Development Forms
  'opportunity-tracking': 'Opportunity Tracking',
  'gonogo': 'Go/No Go Decision',
  'bid-preparation': 'Bid Preparation',
};

/**
 * Get all valid form IDs
 */
export const getValidFormIds = (): string[] => {
  return Object.keys(FORM_FEATURE_MAP);
};

/**
 * Check if a form ID is valid
 */
export const isValidFormId = (formId: string): boolean => {
  return formId in FORM_FEATURE_MAP;
};

/**
 * Get the feature name for a given form ID
 */
export const getFormFeatureName = (formId: string): string | undefined => {
  return FORM_FEATURE_MAP[formId];
};
