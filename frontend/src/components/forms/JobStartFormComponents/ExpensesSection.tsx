import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import FormSection from '../../common/FormSection';
import SectionSummaryRow from '../../common/SectionSummaryRow';
import RegularExpensesTable from './RegularExpensesTable';
import OutsideAgencyTable from './OutsideAgencyTable';
import SurveyWorksRow from './SurveyWorksRow';
import ProjectSpecificTable from './ProjectSpecificTable';
import ExpenseContingenciesRow from './ExpenseContingenciesRow';
import { ExpensesSectionProps } from '../../../types/jobStartForm';

const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  expenses,
  surveyWorks,
  outsideAgency,
  projectSpecific,
  onExpenseChange,
  onSurveyWorksChange,
  onOutsideAgencyChange,
  onProjectSpecificChange,
  calculateOutsideAgencyCost,
  calculateExpensesTotal,
  expanded,
  handleAccordionChange,
  textFieldStyle,
  tableHeaderStyle,
  tableCellStyle,
  accordionStyle,
  sectionStyle,
  summaryRowStyle
}) => {
  return (
    <Box sx={{ ...sectionStyle, mb: 3 }}>
      <FormSection
        title="2.0 ESTIMATED EXPENSES"
        expanded={expanded.includes('expenses')}
        onChange={() => handleAccordionChange('expenses')}
        accordionStyle={accordionStyle}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={tableHeaderStyle}>
                <TableCell sx={tableCellStyle}>Sr. No.</TableCell>
                <TableCell sx={tableCellStyle}>Description</TableCell>
                <TableCell align="right" sx={tableCellStyle}>Rate (Rs)</TableCell>
                <TableCell align="right" sx={tableCellStyle}>Units</TableCell>
                <TableCell align="right" sx={tableCellStyle}>Budgeted Cost (Rs.)</TableCell>
                <TableCell sx={tableCellStyle}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Regular Expenses */}
              <RegularExpensesTable
                expenses={expenses}
                onExpenseChange={onExpenseChange}
                textFieldStyle={textFieldStyle}
                tableCellStyle={tableCellStyle}
              />

              {/* Outside Agency Section */}
              <OutsideAgencyTable
                outsideAgency={outsideAgency}
                onOutsideAgencyChange={onOutsideAgencyChange}
                calculateOutsideAgencyCost={calculateOutsideAgencyCost}
                textFieldStyle={textFieldStyle}
                tableCellStyle={tableCellStyle}
              />

              {/* Survey Works Section */}
              <SurveyWorksRow
                surveyWorks={surveyWorks}
                onSurveyWorksChange={onSurveyWorksChange}
                textFieldStyle={textFieldStyle}
                tableCellStyle={tableCellStyle}
              />

              {/* Project Specific Items */}
              <ProjectSpecificTable
                projectSpecific={projectSpecific}
                onProjectSpecificChange={onProjectSpecificChange}
                textFieldStyle={textFieldStyle}
                tableCellStyle={tableCellStyle}
              />

              {/* Expense Contingencies */}
              <ExpenseContingenciesRow
                expenses={expenses}
                onExpenseChange={onExpenseChange}
                textFieldStyle={textFieldStyle}
                tableCellStyle={tableCellStyle}
              />
            </TableBody>
          </Table>
        </TableContainer>
      </FormSection>
      <TableContainer>
        <Table>
          <TableBody>
            <SectionSummaryRow
              label="TOTAL EXPENSES (ODC)"
              value={calculateExpensesTotal()}
              tableCellStyle={tableCellStyle}
              summaryRowStyle={summaryRowStyle}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ExpensesSection;
