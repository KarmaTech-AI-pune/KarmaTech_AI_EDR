import React from 'react'
import { FormWrapper } from './FormWrapper'
import JobstartTime from './jobstartFormComponent/JobstartTime'
import EstimatedExpenses from './jobstartFormComponent/EstimatedExpenses'
import JobstartGrandTotal from './jobstartFormComponent/JobstartGrandTotal'
import JobstartSummary from './jobstartFormComponent/JobstartSummary'
import { Container, Box, Paper, Typography } from '@mui/material'

const JobStartForm: React.FC = () => {
  return (
    <FormWrapper>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{
          width: '100%',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 1,
          pb: 4
        }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 1
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                color: '#1976d2',
                fontWeight: 500,
                mb: 3
              }}
            >
              PMD1. Job Start Form
            </Typography>

            <JobstartTime/>
            <EstimatedExpenses/>
            <JobstartGrandTotal/>
            <JobstartSummary/>
          </Paper>
        </Box>
      </Container>
    </FormWrapper>
  )
}

export default JobStartForm
