export interface ProgramFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface ValidationErrors {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Validate program form data
 * Returns validation errors object or null if valid
 */
export const validateProgramForm = (data: ProgramFormData): ValidationErrors | null => {
  const errors: ValidationErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Program name is required';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Program name must be at least 3 characters';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Program name must not exceed 100 characters';
  }

  // Description validation
  if (!data.description.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  } else if (data.description.trim().length > 500) {
    errors.description = 'Description must not exceed 500 characters';
  }

  // Start date validation
  if (!data.startDate) {
    errors.startDate = 'Start date is required';
  }

  // End date validation
  if (!data.endDate) {
    errors.endDate = 'End date is required';
  }

  // Date range validation
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      errors.endDate = 'End date must be after start date';
    }

    // Optional: Warn if program is too short (less than 1 day)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      errors.endDate = 'Program must be at least 1 day long';
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Validate a single field
 */
export const validateField = (
  fieldName: keyof ProgramFormData,
  value: string,
  allData?: ProgramFormData
): string | undefined => {
  const errors = validateProgramForm({
    name: fieldName === 'name' ? value : allData?.name || '',
    description: fieldName === 'description' ? value : allData?.description || '',
    startDate: fieldName === 'startDate' ? value : allData?.startDate || '',
    endDate: fieldName === 'endDate' ? value : allData?.endDate || '',
  });

  return errors?.[fieldName];
};
