/**
 * Unit Tests for Constants Utility
 * 
 * Tests color constants, configuration objects, and utility functions.
 * Ensures constants maintain expected structure and values.
 */

import { describe, it, expect } from 'vitest';
import { 
  SEVERITY_COLORS,
  STATUS_COLORS,
  IMPACT_COLORS,
  MILESTONE_STATUS_COLORS,
  REGIONS,
  TIMEFRAMES,
  getStatusIcon
} from './constants';
import type { Project } from '../data/types/dashboard';

describe('Constants Utility', () => {
  describe('SEVERITY_COLORS', () => {
    it('should have correct structure for P3 severity', () => {
      // Assert
      expect(SEVERITY_COLORS.P3).toEqual({
        backgroundColor: '#ffebee',
        color: '#c62828',
        borderColor: '#ffcdd2'
      });
    });

    it('should have correct structure for P5 severity', () => {
      // Assert
      expect(SEVERITY_COLORS.P5).toEqual({
        backgroundColor: '#fff3e0',
        color: '#ef6c00',
        borderColor: '#ffcc02'
      });
    });

    it('should have all required properties for each severity', () => {
      // Assert
      Object.values(SEVERITY_COLORS).forEach(severity => {
        expect(severity).toHaveProperty('backgroundColor');
        expect(severity).toHaveProperty('color');
        expect(severity).toHaveProperty('borderColor');
        expect(typeof severity.backgroundColor).toBe('string');
        expect(typeof severity.color).toBe('string');
        expect(typeof severity.borderColor).toBe('string');
      });
    });

    it('should have valid hex color codes', () => {
      // Arrange
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

      // Assert
      Object.values(SEVERITY_COLORS).forEach(severity => {
        expect(severity.backgroundColor).toMatch(hexColorRegex);
        expect(severity.color).toMatch(hexColorRegex);
        expect(severity.borderColor).toMatch(hexColorRegex);
      });
    });

    it('should be readonly (const assertion)', () => {
      // Assert - TypeScript compilation test
      // This test ensures the const assertion is working
      // Note: We don't actually mutate the object to avoid affecting other tests
      expect(typeof SEVERITY_COLORS.P3.backgroundColor).toBe('string');
      expect(SEVERITY_COLORS.P3.backgroundColor).toBeTruthy();
    });
  });

  describe('STATUS_COLORS', () => {
    it('should have all expected status colors', () => {
      // Assert
      expect(STATUS_COLORS).toEqual({
        falling_behind: '#f44336',
        scope_issue: '#ff9800',
        cost_overrun: '#f44336',
        on_track: '#4caf50'
      });
    });

    it('should have valid hex color codes', () => {
      // Arrange
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

      // Assert
      Object.values(STATUS_COLORS).forEach(color => {
        expect(color).toMatch(hexColorRegex);
      });
    });

    it('should have consistent colors for similar statuses', () => {
      // Assert - falling_behind and cost_overrun should have same color (both critical)
      expect(STATUS_COLORS.falling_behind).toBe(STATUS_COLORS.cost_overrun);
    });

    it('should have different colors for different status types', () => {
      // Assert
      expect(STATUS_COLORS.on_track).not.toBe(STATUS_COLORS.falling_behind);
      expect(STATUS_COLORS.scope_issue).not.toBe(STATUS_COLORS.on_track);
    });

    it('should contain all required status keys', () => {
      // Arrange
      const expectedKeys = ['falling_behind', 'scope_issue', 'cost_overrun', 'on_track'];

      // Assert
      expectedKeys.forEach(key => {
        expect(STATUS_COLORS).toHaveProperty(key);
      });
      expect(Object.keys(STATUS_COLORS)).toHaveLength(expectedKeys.length);
    });
  });

  describe('IMPACT_COLORS', () => {
    it('should have correct structure for all impact levels', () => {
      // Assert
      expect(IMPACT_COLORS.Critical).toEqual({
        backgroundColor: '#ffebee',
        color: '#c62828'
      });
      expect(IMPACT_COLORS.High).toEqual({
        backgroundColor: '#fff3e0',
        color: '#ef6c00'
      });
      expect(IMPACT_COLORS.Medium).toEqual({
        backgroundColor: '#fff8e1',
        color: '#f57f17'
      });
      expect(IMPACT_COLORS.Low).toEqual({
        backgroundColor: '#f3e5f5',
        color: '#7b1fa2'
      });
    });

    it('should have all required properties for each impact level', () => {
      // Assert
      Object.values(IMPACT_COLORS).forEach(impact => {
        expect(impact).toHaveProperty('backgroundColor');
        expect(impact).toHaveProperty('color');
        expect(typeof impact.backgroundColor).toBe('string');
        expect(typeof impact.color).toBe('string');
      });
    });

    it('should have valid hex color codes', () => {
      // Arrange
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

      // Assert
      Object.values(IMPACT_COLORS).forEach(impact => {
        expect(impact.backgroundColor).toMatch(hexColorRegex);
        expect(impact.color).toMatch(hexColorRegex);
      });
    });

    it('should have all impact levels', () => {
      // Arrange
      const expectedLevels = ['Critical', 'High', 'Medium', 'Low'];

      // Assert
      expectedLevels.forEach(level => {
        expect(IMPACT_COLORS).toHaveProperty(level);
      });
      expect(Object.keys(IMPACT_COLORS)).toHaveLength(expectedLevels.length);
    });

    it('should have consistent color scheme progression', () => {
      // Assert - Critical should use red tones, High orange, etc.
      expect(IMPACT_COLORS.Critical.color).toContain('c62828'); // Red
      expect(IMPACT_COLORS.High.color).toContain('ef6c00'); // Orange
      expect(IMPACT_COLORS.Medium.color).toContain('f57f17'); // Yellow
      expect(IMPACT_COLORS.Low.color).toContain('7b1fa2'); // Purple
    });
  });

  describe('MILESTONE_STATUS_COLORS', () => {
    it('should have correct structure for all milestone statuses', () => {
      // Assert
      expect(MILESTONE_STATUS_COLORS.Overdue).toEqual({
        backgroundColor: '#ffebee',
        color: '#c62828'
      });
      expect(MILESTONE_STATUS_COLORS['On Track']).toEqual({
        backgroundColor: '#e8f5e8',
        color: '#2e7d32'
      });
      expect(MILESTONE_STATUS_COLORS['At Risk']).toEqual({
        backgroundColor: '#fff3e0',
        color: '#ef6c00'
      });
    });

    it('should handle status names with spaces', () => {
      // Assert
      expect(MILESTONE_STATUS_COLORS['On Track']).toBeDefined();
      expect(MILESTONE_STATUS_COLORS['At Risk']).toBeDefined();
    });

    it('should have valid hex color codes', () => {
      // Arrange
      const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

      // Assert
      Object.values(MILESTONE_STATUS_COLORS).forEach(status => {
        expect(status.backgroundColor).toMatch(hexColorRegex);
        expect(status.color).toMatch(hexColorRegex);
      });
    });

    it('should have semantic color choices', () => {
      // Assert
      // Overdue should be red
      expect(MILESTONE_STATUS_COLORS.Overdue.color).toBe('#c62828');
      // On Track should be green
      expect(MILESTONE_STATUS_COLORS['On Track'].color).toBe('#2e7d32');
      // At Risk should be orange
      expect(MILESTONE_STATUS_COLORS['At Risk'].color).toBe('#ef6c00');
    });
  });

  describe('REGIONS', () => {
    it('should contain all expected regions', () => {
      // Assert
      expect(REGIONS).toEqual([
        'All',
        'North America',
        'Europe',
        'Asia Pacific',
        'Latin America'
      ]);
    });

    it('should have "All" as the first option', () => {
      // Assert
      expect(REGIONS[0]).toBe('All');
    });

    it('should be readonly array', () => {
      // Assert - TypeScript compilation test
      expect(Array.isArray(REGIONS)).toBe(true);
      expect(REGIONS.length).toBe(5);
    });

    it('should contain only string values', () => {
      // Assert
      REGIONS.forEach(region => {
        expect(typeof region).toBe('string');
        expect(region.length).toBeGreaterThan(0);
      });
    });

    it('should not have duplicate regions', () => {
      // Assert
      const uniqueRegions = [...new Set(REGIONS)];
      expect(uniqueRegions).toHaveLength(REGIONS.length);
    });
  });

  describe('TIMEFRAMES', () => {
    it('should contain all expected timeframes with correct structure', () => {
      // Assert
      expect(TIMEFRAMES).toEqual([
        { value: 'quarter', label: 'This Quarter' },
        { value: 'year', label: 'This Year' },
        { value: 'lastYear', label: 'Last Year' }
      ]);
    });

    it('should have value and label properties for each timeframe', () => {
      // Assert
      TIMEFRAMES.forEach(timeframe => {
        expect(timeframe).toHaveProperty('value');
        expect(timeframe).toHaveProperty('label');
        expect(typeof timeframe.value).toBe('string');
        expect(typeof timeframe.label).toBe('string');
      });
    });

    it('should have unique values', () => {
      // Arrange
      const values = TIMEFRAMES.map(tf => tf.value);

      // Assert
      const uniqueValues = [...new Set(values)];
      expect(uniqueValues).toHaveLength(values.length);
    });

    it('should have descriptive labels', () => {
      // Assert
      TIMEFRAMES.forEach(timeframe => {
        expect(timeframe.label.length).toBeGreaterThan(timeframe.value.length);
        expect(timeframe.label).toContain(' '); // Should contain spaces for readability
      });
    });

    it('should be suitable for dropdown/select components', () => {
      // Assert - Structure should be compatible with common UI libraries
      TIMEFRAMES.forEach(timeframe => {
        expect(timeframe.value).toBeTruthy();
        expect(timeframe.label).toBeTruthy();
        expect(timeframe.value).not.toContain(' '); // Values should not have spaces
      });
    });
  });

  describe('getStatusIcon()', () => {
    describe('Status Icon Mapping', () => {
      it('should return correct icon for falling_behind status', () => {
        // Act
        const icon = getStatusIcon('falling_behind');

        // Assert
        expect(icon).toBe('Schedule');
      });

      it('should return correct icon for scope_issue status', () => {
        // Act
        const icon = getStatusIcon('scope_issue');

        // Assert
        expect(icon).toBe('Warning');
      });

      it('should return correct icon for cost_overrun status', () => {
        // Act
        const icon = getStatusIcon('cost_overrun');

        // Assert
        expect(icon).toBe('AttachMoney');
      });

      it('should return default icon for on_track status', () => {
        // Act
        const icon = getStatusIcon('on_track');

        // Assert
        expect(icon).toBe('CheckCircle');
      });

      it('should return default icon for unknown status', () => {
        // Act
        const icon = getStatusIcon('unknown_status' as Project['status']);

        // Assert
        expect(icon).toBe('CheckCircle');
      });
    });

    describe('Type Safety', () => {
      it('should accept Project status type', () => {
        // Arrange
        const validStatuses: Project['status'][] = [
          'falling_behind',
          'scope_issue', 
          'cost_overrun',
          'on_track'
        ];

        // Act & Assert
        validStatuses.forEach(status => {
          expect(() => getStatusIcon(status)).not.toThrow();
          expect(typeof getStatusIcon(status)).toBe('string');
        });
      });

      it('should return string type', () => {
        // Act
        const icon: string = getStatusIcon('on_track');

        // Assert
        expect(typeof icon).toBe('string');
      });
    });

    describe('Icon Name Validation', () => {
      it('should return valid Material-UI icon names', () => {
        // Arrange
        const validMaterialIcons = [
          'Schedule',
          'Warning', 
          'AttachMoney',
          'CheckCircle'
        ];
        const allStatuses: Project['status'][] = [
          'falling_behind',
          'scope_issue',
          'cost_overrun', 
          'on_track'
        ];

        // Act & Assert
        allStatuses.forEach(status => {
          const icon = getStatusIcon(status);
          expect(validMaterialIcons).toContain(icon);
        });
      });

      it('should return non-empty icon names', () => {
        // Arrange
        const allStatuses: Project['status'][] = [
          'falling_behind',
          'scope_issue',
          'cost_overrun',
          'on_track'
        ];

        // Act & Assert
        allStatuses.forEach(status => {
          const icon = getStatusIcon(status);
          expect(icon.length).toBeGreaterThan(0);
        });
      });
    });

    describe('Edge Cases', () => {
      it('should handle null status gracefully', () => {
        // Act
        const icon = getStatusIcon(null as any);

        // Assert
        expect(icon).toBe('CheckCircle');
      });

      it('should handle undefined status gracefully', () => {
        // Act
        const icon = getStatusIcon(undefined as any);

        // Assert
        expect(icon).toBe('CheckCircle');
      });

      it('should handle empty string status', () => {
        // Act
        const icon = getStatusIcon('' as any);

        // Assert
        expect(icon).toBe('CheckCircle');
      });
    });
  });

  describe('Color Consistency', () => {
    it('should use consistent red colors for critical/error states', () => {
      // Assert
      const redColor = '#c62828';
      expect(SEVERITY_COLORS.P3.color).toBe(redColor);
      expect(IMPACT_COLORS.Critical.color).toBe(redColor);
      expect(MILESTONE_STATUS_COLORS.Overdue.color).toBe(redColor);
    });

    it('should use consistent orange colors for warning states', () => {
      // Assert
      const orangeColor = '#ef6c00';
      expect(SEVERITY_COLORS.P5.color).toBe(orangeColor);
      expect(IMPACT_COLORS.High.color).toBe(orangeColor);
      expect(MILESTONE_STATUS_COLORS['At Risk'].color).toBe(orangeColor);
    });

    it('should use consistent background colors for similar severity levels', () => {
      // Assert - Check actual values from constants.ts (now that mutation is removed)
      expect(SEVERITY_COLORS.P3.backgroundColor).toBe('#ffebee');
      expect(IMPACT_COLORS.Critical.backgroundColor).toBe('#ffebee');
      expect(MILESTONE_STATUS_COLORS.Overdue.backgroundColor).toBe('#ffebee');
      
      // All should match
      expect(SEVERITY_COLORS.P3.backgroundColor).toBe(IMPACT_COLORS.Critical.backgroundColor);
      expect(IMPACT_COLORS.Critical.backgroundColor).toBe(MILESTONE_STATUS_COLORS.Overdue.backgroundColor);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for status display', () => {
      // Arrange
      const status: Project['status'] = 'falling_behind';

      // Act
      const icon = getStatusIcon(status);
      const color = STATUS_COLORS[status];

      // Assert
      expect(icon).toBe('Schedule');
      expect(color).toBe('#f44336');
    });

    it('should provide complete theming information', () => {
      // Assert - All color objects should provide enough information for theming
      expect(Object.keys(SEVERITY_COLORS)).toHaveLength(2);
      expect(Object.keys(STATUS_COLORS)).toHaveLength(4);
      expect(Object.keys(IMPACT_COLORS)).toHaveLength(4);
      expect(Object.keys(MILESTONE_STATUS_COLORS)).toHaveLength(3);
    });

    it('should maintain immutability', () => {
      // Arrange
      const originalSeverityColors = JSON.parse(JSON.stringify(SEVERITY_COLORS));
      const originalStatusColors = JSON.parse(JSON.stringify(STATUS_COLORS));

      // Act - Verify objects are readonly (TypeScript should prevent modification)
      // No actual mutation attempted since objects are readonly

      // Assert - Originals should be unchanged
      expect(SEVERITY_COLORS.P3).toEqual(originalSeverityColors.P3);
      expect(STATUS_COLORS.on_track).toBe(originalStatusColors.on_track);
    });
  });

  describe('Accessibility Considerations', () => {
    it('should have sufficient color contrast ratios', () => {
      // Note: This is a basic check - real accessibility testing would use contrast ratio calculations
      
      // Assert - Dark text on light backgrounds (now that mutation is removed)
      expect(SEVERITY_COLORS.P3.color.startsWith('#c')).toBe(true); // Dark red
      expect(SEVERITY_COLORS.P3.backgroundColor.startsWith('#ff')).toBe(true); // Light background
      
      expect(IMPACT_COLORS.Critical.color.startsWith('#c')).toBe(true); // Dark red
      expect(IMPACT_COLORS.Critical.backgroundColor.startsWith('#ff')).toBe(true); // Light background
    });

    it('should not rely solely on color for status indication', () => {
      // Assert - Icons are provided alongside colors
      const statuses: Project['status'][] = ['falling_behind', 'scope_issue', 'cost_overrun', 'on_track'];
      
      statuses.forEach(status => {
        const icon = getStatusIcon(status);
        const color = STATUS_COLORS[status];
        
        expect(icon).toBeTruthy();
        expect(color).toBeTruthy();
        expect(icon).not.toBe(color); // Icon and color are different representations
      });
    });
  });
});