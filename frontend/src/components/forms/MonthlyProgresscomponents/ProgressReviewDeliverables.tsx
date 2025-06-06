import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormHelperText,
  Box,
  IconButton,
  TextareaAutosize
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';




const deliverableSchema = z.object({
  milestone: z
    .string()
    .min(1, "Milestone is required")
    .max(200, "Milestone must be less than 200 characters"),
  dueDateContract: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid date format"),
  dueDatePlanned: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid date format"),
  achievedDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid date format"),
  paymentDue: z.number().min(0, "Payment due must be positive").optional(),
  invoiceDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid date format"),
  paymentReceivedDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), "Invalid date format"),
  comments: z
    .string()
    .max(500, "Comments must be less than 500 characters")
    .optional(),
});


const formSchema = z.object({
  deliverables: z
    .array(deliverableSchema)
    .min(1, "At least one deliverable is required")
    .max(20, "Maximum 20 deliverables allowed"),
});

type FormData = z.infer<typeof formSchema>;

const ProgressReviewDeliverables = () => {

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "deliverables",
  });

  const addDeliverable = () => {
    append({
      milestone: "",
      dueDateContract: "",
      dueDatePlanned: "",
      achievedDate: "",
      paymentDue: 0,
      invoiceDate: "",
      paymentReceivedDate: "",
      comments: "",
    });
  };

  const removeDeliverable = (index: number) => {

    remove(index);
  };

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    // Handle form submission here
  };

  return(
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 1200 }}>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 200, width: '25%' }}>MileStone</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 150, width: '12%' }}>Due date as per contract</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 150, width: '12%' }}>Due date as planned</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 150, width: '12%' }}>Achieved date</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 120, width: '5%' }}>Payment due</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 150, width: '12%' }}>Invoice date</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 150, width: '12%' }}>Payment received date</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 150, width: '15%' }}>Comments</TableCell>
            <TableCell sx={{ fontWeight: 'bold', minWidth: 80, width: '5%' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              {/* Milestone */}
              <TableCell>
                <TextField
                  {...register(`deliverables.${index}.milestone`)}
                  fullWidth
                  size="small"
                  rows={2}
                  placeholder="Enter milestone"
                  error={!!errors.deliverables?.[index]?.milestone}
                  helperText={errors.deliverables?.[index]?.milestone?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                    }
                  }}
                />
              </TableCell>

              {/* Due date as per contract */}
              <TableCell>
                <TextField
                  {...register(`deliverables.${index}.dueDateContract`)}
                  fullWidth
                  size="small"
                  type="date"
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  error={!!errors.deliverables?.[index]?.dueDateContract}
                  helperText={errors.deliverables?.[index]?.dueDateContract?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                    }
                  }}
                />
              </TableCell>

               {/* Due date as planned */}
              <TableCell>
                <TextField
                  {...register(`deliverables.${index}.dueDatePlanned`)}
                  fullWidth
                  size="small"
                  type="date"
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  error={!!errors.deliverables?.[index]?.dueDatePlanned}
                  helperText={errors.deliverables?.[index]?.dueDatePlanned?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                    }
                  }}
                />
              </TableCell>

              {/* Achieved date */}
              <TableCell>
                <TextField
                  {...register(`deliverables.${index}.achievedDate`)}
                  fullWidth
                  size="small"
                  type="date"
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  error={!!errors.deliverables?.[index]?.achievedDate}
                  helperText={errors.deliverables?.[index]?.achievedDate?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                    }
                  }}
                />
              </TableCell>

              {/* Payment due */}
              <TableCell>
                <TextField
                  {...register(`deliverables.${index}.paymentDue`, { valueAsNumber: true })}
                  fullWidth
                  size="small"
                  type="text"
                inputProps={{ 
                  inputMode: 'numeric', 
                  pattern: '[0-9]*',
                  onInput: (e: React.FormEvent<HTMLInputElement>) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                  }
                }}
                  error={!!errors.deliverables?.[index]?.paymentDue}
                  helperText={errors.deliverables?.[index]?.paymentDue?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                    }
                  }}
                />
              </TableCell>

              {/* Invoice date */}
              <TableCell>
                <TextField
                  {...register(`deliverables.${index}.invoiceDate`)}
                  fullWidth
                  size="small"
                  type="date"
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  error={!!errors.deliverables?.[index]?.invoiceDate}
                  helperText={errors.deliverables?.[index]?.invoiceDate?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                    }
                  }}
                />
              </TableCell>

              {/* Payment received date */}
              <TableCell>
                <TextField
                  {...register(`deliverables.${index}.paymentReceivedDate`)}
                  fullWidth
                  size="small"
                  type="date"
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  error={!!errors.deliverables?.[index]?.paymentReceivedDate}
                  helperText={errors.deliverables?.[index]?.paymentReceivedDate?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                    }
                  }}
                />
              </TableCell>

              {/* Comments */}
              <TableCell>
                <TextareaAutosize
                  {...register(`deliverables.${index}.comments`)}
                  aria-label="maximum height"
                  minRows={2}
                  maxRows={3}
                  placeholder="Comments"
                />
              </TableCell>

              {/* Actions */}
              <TableCell>
                <IconButton
                  color="error"
                  onClick={() => removeDeliverable(index)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addDeliverable}
        >
          Add Deliverable
        </Button>
      </Box>

      {/* Display form-level errors */}
      {errors.deliverables && (
        <FormHelperText error sx={{ mt: 1 }}>
          {errors.deliverables.message}
        </FormHelperText>
      )}
    </TableContainer>
    </Box>
  );
};

export default ProgressReviewDeliverables;
