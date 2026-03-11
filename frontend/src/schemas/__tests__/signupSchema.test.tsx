import { describe, it, expect } from 'vitest';
import { signupSchema } from '../signupSchema';

describe('signupSchema', () => {
  const validData = {
    companyName: 'Test Company',
    companyAddress: '123 Test St',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '9012345678',
    emailAddress: 'test@example.com',
    subdomain: 'test-company',
    subscriptionPlan: 'Starter' as const,
  };

  it('should validate successfully with correct data', () => {
    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe('companyName validation', () => {
    it('should fail if companyName is empty', () => {
      const data = { ...validData, companyName: '' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Company Name is required');
      }
    });

    it('should fail if companyName is missing', () => {
      const { companyName, ...data } = validData;
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('phoneNumber validation', () => {
    it('should fail if phoneNumber format is wrong (less than 10 digits)', () => {
      const data = { ...validData, phoneNumber: '123456789' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid phone number format (e.g., 9012345678)');
      }
    });

    it('should fail if phoneNumber format is wrong (contains letters)', () => {
      const data = { ...validData, phoneNumber: '901234567a' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('emailAddress validation', () => {
    it('should fail if email is invalid format', () => {
      const data = { ...validData, emailAddress: 'not_an_email' };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });
  });

  describe('subscriptionPlan validation', () => {
    it('should fail if subscriptionPlan is invalid', () => {
      const data = { ...validData, subscriptionPlan: 'Premium' };
      const result = signupSchema.safeParse(data as any);
      expect(result.success).toBe(false);
    });

    it('should pass for all valid subscription plans', () => {
      const plans = ['Starter', 'Professional', 'Enterprises'] as const;
      plans.forEach((plan) => {
        const data = { ...validData, subscriptionPlan: plan };
        const result = signupSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });
});
