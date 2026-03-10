import { describe, it, expect } from 'vitest';
import * as api from './api';

describe('api barrel file', () => {
  it('should export all essential services', () => {
    // We only check if the exported properties exist
    // This provides coverage for the barrel export
    expect(api.axiosInstance).toBeDefined();
    expect(api.authApi).toBeDefined();
    expect(api.goNoGoApi).toBeDefined();
    expect(api.opportunityApi).toBeDefined();
    expect(api.projectApi).toBeDefined();
  });
});
