import { z } from 'zod';

export const signupSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  companyAddress: z.string().min(1, 'Company Address is required'),
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  phoneNumber: z.string()
    .min(1, 'Phone Number is required')
    .regex(/^\d{10}$/, 'Invalid phone number format (e.g., 9012345678)'),
  emailAddress: z.string().min(1, 'Email Address is required').email('Invalid email address'),
  subdomain: z.string().min(1, 'Subdomain is required'),
  subscriptionPlan: z.enum(["starter", "professional", "enterprises"])
});

export type signupSchemaType= z.infer<typeof signupSchema>;
