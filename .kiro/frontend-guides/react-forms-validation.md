---
inclusion: manual
keywords: react, forms, validation, react-hook-form, zod, formik
---

# React Forms and Validation Patterns

## Form Libraries in Use

Your project uses multiple form libraries:
- **React Hook Form** (`react-hook-form`) - Primary form library
- **Formik** (`formik`) - Legacy forms (being migrated)
- **Yup** (`yup`) - Schema validation
- **Zod** (`zod`) - TypeScript-first schema validation
- **@hookform/resolvers** - Integrates Yup/Zod with React Hook Form

## Preferred Form Pattern: React Hook Form + Zod

### Why React Hook Form?
- ✅ Better performance (fewer re-renders)
- ✅ Smaller bundle size
- ✅ Built-in TypeScript support
- ✅ Less boilerplate code
- ✅ Better integration with Material-UI

### Basic Form Structure

```typescript
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Button,
  Typography
} from '@mui/material';

// 1. Define Zod schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be 18 or older').optional(),
  status: z.enum(['active', 'inactive', 'pending'])
});

// 2. Infer TypeScript type from schema
type FormData = z.infer<typeof formSchema>;

// 3. Component
const MyForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'active'
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await apiService.submitForm(data);
      reset();
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Form Title
      </Typography>

      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Name"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            sx={{ mb: 2 }}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 2 }}
          />
        )}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        fullWidth
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </Box>
  );
};

export default MyForm;
```

## Zod Schema Patterns

### String Validation
```typescript
const schema = z.object({
  // Required string
  name: z.string().min(1, 'Name is required'),
  
  // String with length constraints
  username: z.string().min(3).max(20),
  
  // Email validation
  email: z.string().email('Invalid email'),
  
  // URL validation
  website: z.string().url('Invalid URL').optional(),
  
  // Pattern matching (regex)
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  
  // Custom validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
});
```

### Number Validation
```typescript
const schema = z.object({
  // Required number
  age: z.number().min(18, 'Must be 18+'),
  
  // Number with range
  rating: z.number().min(1).max(5),
  
  // Positive number
  price: z.number().positive('Price must be positive'),
  
  // Integer only
  quantity: z.number().int('Must be whole number'),
  
  // Optional number with default
  discount: z.number().default(0),
});
```

### Date Validation
```typescript
const schema = z.object({
  // Date validation
  birthDate: z.date(),
  
  // Date with constraints
  startDate: z.date().min(new Date(), 'Must be future date'),
  
  // Date string (from input)
  dateString: z.string().transform((str) => new Date(str)),
});
```

### Array Validation
```typescript
const schema = z.object({
  // Array of strings
  tags: z.array(z.string()).min(1, 'At least one tag required'),
  
  // Array of objects
  items: z.array(z.object({
    id: z.number(),
    name: z.string(),
    quantity: z.number().positive()
  })),
  
  // Array with max length
  categories: z.array(z.string()).max(5, 'Maximum 5 categories'),
});
```

### Object Validation
```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/)
});

const schema = z.object({
  // Nested object
  address: addressSchema,
  
  // Optional nested object
  billingAddress: addressSchema.optional(),
});
```

### Enum Validation
```typescript
const schema = z.object({
  // Enum with specific values
  status: z.enum(['active', 'inactive', 'pending']),
  
  // Union type
  role: z.union([
    z.literal('admin'),
    z.literal('user'),
    z.literal('guest')
  ]),
});
```

### Conditional Validation
```typescript
const schema = z.object({
  hasShipping: z.boolean(),
  shippingAddress: z.string().optional()
}).refine(
  (data) => {
    if (data.hasShipping) {
      return !!data.shippingAddress;
    }
    return true;
  },
  {
    message: 'Shipping address required when shipping is selected',
    path: ['shippingAddress']
  }
);
```

## Material-UI Form Components

### TextField (Text Input)
```typescript
<Controller
  name="fieldName"
  control={control}
  render={({ field }) => (
    <TextField
      {...field}
      label="Field Label"
      placeholder="Enter value"
      fullWidth
      required
      error={!!errors.fieldName}
      helperText={errors.fieldName?.message}
      sx={{ mb: 2 }}
    />
  )}
/>
```

### Select (Dropdown)
```typescript
import { MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';

<Controller
  name="status"
  control={control}
  render={({ field }) => (
    <FormControl fullWidth error={!!errors.status} sx={{ mb: 2 }}>
      <InputLabel>Status</InputLabel>
      <Select {...field} label="Status">
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
      </Select>
      {errors.status && (
        <FormHelperText>{errors.status.message}</FormHelperText>
      )}
    </FormControl>
  )}
/>
```

### Checkbox
```typescript
import { FormControlLabel, Checkbox } from '@mui/material';

<Controller
  name="agreeToTerms"
  control={control}
  render={({ field }) => (
    <FormControlLabel
      control={
        <Checkbox
          {...field}
          checked={field.value}
          color="primary"
        />
      }
      label="I agree to terms and conditions"
    />
  )}
/>
```

### Radio Group
```typescript
import { RadioGroup, FormControlLabel, Radio, FormLabel } from '@mui/material';

<Controller
  name="gender"
  control={control}
  render={({ field }) => (
    <FormControl component="fieldset" sx={{ mb: 2 }}>
      <FormLabel component="legend">Gender</FormLabel>
      <RadioGroup {...field}>
        <FormControlLabel value="male" control={<Radio />} label="Male" />
        <FormControlLabel value="female" control={<Radio />} label="Female" />
        <FormControlLabel value="other" control={<Radio />} label="Other" />
      </RadioGroup>
    </FormControl>
  )}
/>
```

### Date Picker (Material-UI X)
```typescript
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

<LocalizationProvider dateAdapter={AdapterDateFns}>
  <Controller
    name="startDate"
    control={control}
    render={({ field }) => (
      <DatePicker
        {...field}
        label="Start Date"
        slotProps={{
          textField: {
            fullWidth: true,
            error: !!errors.startDate,
            helperText: errors.startDate?.message
          }
        }}
      />
    )}
  />
</LocalizationProvider>
```

### Autocomplete
```typescript
import { Autocomplete } from '@mui/material';

<Controller
  name="country"
  control={control}
  render={({ field: { onChange, value } }) => (
    <Autocomplete
      options={countries}
      getOptionLabel={(option) => option.name}
      value={value}
      onChange={(_, data) => onChange(data)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Country"
          error={!!errors.country}
          helperText={errors.country?.message}
        />
      )}
    />
  )}
/>
```

## Form Layout Patterns

### Single Column Form
```typescript
<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
  <Typography variant="h5" sx={{ mb: 3 }}>Form Title</Typography>
  
  <TextField {...} sx={{ mb: 2 }} />
  <TextField {...} sx={{ mb: 2 }} />
  <TextField {...} sx={{ mb: 2 }} />
  
  <Button type="submit" variant="contained" fullWidth>
    Submit
  </Button>
</Box>
```

### Two Column Form
```typescript
<Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
  <Typography variant="h5" sx={{ mb: 3 }}>Form Title</Typography>
  
  <Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      <TextField {...} fullWidth />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField {...} fullWidth />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField {...} fullWidth />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField {...} fullWidth />
    </Grid>
  </Grid>
  
  <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
    <Button variant="outlined" onClick={() => reset()}>
      Reset
    </Button>
    <Button type="submit" variant="contained">
      Submit
    </Button>
  </Box>
</Box>
```

### Multi-Step Form
```typescript
const MultiStepForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { control, handleSubmit, trigger } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const handleNext = async () => {
    const isValid = await trigger(); // Validate current step
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        <Step><StepLabel>Personal Info</StepLabel></Step>
        <Step><StepLabel>Address</StepLabel></Step>
        <Step><StepLabel>Review</StepLabel></Step>
      </Stepper>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {activeStep === 0 && <Step1Fields control={control} />}
        {activeStep === 1 && <Step2Fields control={control} />}
        {activeStep === 2 && <ReviewStep />}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          {activeStep === 2 ? (
            <Button type="submit" variant="contained">
              Submit
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};
```

## Form State Management

### Watch Field Values
```typescript
const { watch } = useForm<FormData>();

// Watch single field
const emailValue = watch('email');

// Watch multiple fields
const [name, email] = watch(['name', 'email']);

// Watch all fields
const formValues = watch();

// Use watched value
useEffect(() => {
  if (emailValue) {
    // Do something when email changes
  }
}, [emailValue]);
```

### Set Field Values Programmatically
```typescript
const { setValue, reset } = useForm<FormData>();

// Set single field
setValue('name', 'John Doe');

// Set multiple fields
setValue('email', 'john@example.com');
setValue('age', 30);

// Reset form with new values
reset({
  name: 'Jane Doe',
  email: 'jane@example.com'
});
```

### Field Arrays (Dynamic Fields)
```typescript
import { useFieldArray } from 'react-hook-form';

const { control } = useForm<FormData>();
const { fields, append, remove } = useFieldArray({
  control,
  name: 'items'
});

return (
  <Box>
    {fields.map((field, index) => (
      <Box key={field.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Controller
          name={`items.${index}.name`}
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Item Name" />
          )}
        />
        <Controller
          name={`items.${index}.quantity`}
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Quantity" type="number" />
          )}
        />
        <Button onClick={() => remove(index)} color="error">
          Remove
        </Button>
      </Box>
    ))}
    <Button onClick={() => append({ name: '', quantity: 0 })}>
      Add Item
    </Button>
  </Box>
);
```

## Form Submission Patterns

### Basic Submission
```typescript
const onSubmit = async (data: FormData) => {
  try {
    await apiService.submitForm(data);
    // Show success message
    reset();
  } catch (error) {
    // Show error message
    console.error('Submission failed:', error);
  }
};
```

### Submission with Loading State
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const onSubmit = async (data: FormData) => {
  setIsSubmitting(true);
  try {
    await apiService.submitForm(data);
    // Success
  } catch (error) {
    // Error
  } finally {
    setIsSubmitting(false);
  }
};

<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

### Submission with Server Validation
```typescript
const { setError } = useForm<FormData>();

const onSubmit = async (data: FormData) => {
  try {
    await apiService.submitForm(data);
  } catch (error: any) {
    // Handle server validation errors
    if (error.response?.data?.errors) {
      Object.entries(error.response.data.errors).forEach(([field, message]) => {
        setError(field as keyof FormData, {
          type: 'server',
          message: message as string
        });
      });
    }
  }
};
```

## Legacy Formik Pattern (For Existing Forms)

**Note: New forms should use React Hook Form. This is for maintaining existing Formik forms.**

```typescript
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required')
});

const MyFormikForm: React.FC = () => {
  return (
    <Formik
      initialValues={{ name: '', email: '' }}
      validationSchema={validationSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          await apiService.submitForm(values);
          resetForm();
        } catch (error) {
          console.error(error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form>
          <Field
            as={TextField}
            name="name"
            label="Name"
            error={touched.name && !!errors.name}
            helperText={touched.name && errors.name}
            fullWidth
            sx={{ mb: 2 }}
          />
          
          <Button type="submit" disabled={isSubmitting}>
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};
```

## Form Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyForm from './MyForm';

describe('MyForm', () => {
  it('validates required fields', async () => {
    render(<MyForm />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
  });
  
  it('submits form with valid data', async () => {
    const mockSubmit = vi.fn();
    render(<MyForm onSubmit={mockSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      });
    });
  });
});
```

## Best Practices Summary

✅ **DO:**
- Use React Hook Form + Zod for new forms
- Define Zod schemas before component
- Use Controller for Material-UI components
- Show validation errors inline
- Disable submit button during submission
- Reset form after successful submission
- Handle server validation errors
- Test form validation and submission

❌ **DON'T:**
- Use uncontrolled inputs
- Validate on every keystroke (use onBlur)
- Forget to handle loading states
- Submit forms without validation
- Use inline validation logic
- Forget accessibility attributes
- Skip error handling
