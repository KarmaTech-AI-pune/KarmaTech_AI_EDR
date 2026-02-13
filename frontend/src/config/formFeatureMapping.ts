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
  // Project Management Forms - WBS Sub-features
  'wbs': 'Work Breakdown Structure (WBS)',
  'wbs-manpower': 'Manpower Planning',
  'wbs-odc': 'ODC (Other Direct Cost) Table',
  'wbs-todo-list': 'Sprint Planning',
  
  // Other Project Management Forms
  'job-start': 'Job Start Form',
  'input-register': 'Input/Output Register',
  'correspondence': 'Email Notifications',
  'check&review': 'Email Notifications', // Using Email Notifications as placeholder
  'change-control': 'Email Notifications', // Using Email Notifications as placeholder
  'progress-review': 'Monthly Progress Review',
  'closure': 'Email Notifications', // Using Email Notifications as placeholder
  'monthly-reports': 'monthly Reports',
  
  // Business Development Forms
  'opportunity-tracking': 'Email Notifications', // Using Email Notifications as placeholder
  'gonogo': 'Email Notifications', // Using Email Notifications as placeholder
  'bid-preparation': 'Email Notifications', // Using Email Notifications as placeholder
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
