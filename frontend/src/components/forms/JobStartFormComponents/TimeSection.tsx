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
import EmployeePersonnelTable from './EmployeePersonnelTable';
import TimeContingencyRow from './TimeContingencyRow';
import { TimeSectionProps } from '../../../types/jobStartForm';

const TimeSection: React.FC<TimeSectionProps> = ({
  employeeAllocations,
  timeContingency,
  onRemarksChange,
  onTimeContingencyChange,
  calculateTotalCost,
  calculateTimeContingencyCost,
  calculateTotalTimeCost,
  expanded,
  handleAccordionChange,
  textFieldStyle,
  tableHeaderStyle,
  tableCellStyle,
  accordionStyle,
  sectionStyle,
  summaryRowStyle,
  formatTitle
}) => {
  return (
    <Box sx={{ ...sectionStyle, mb: 3 }}>
      <FormSection
        title="1.0 TIME"
        expanded={expanded.includes('time')}
        onChange={() => handleAccordionChange('time')}
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
              {/* Employee Personnel Section */}
              <EmployeePersonnelTable
                employeeAllocations={employeeAllocations}
                isConsultant={false}
                onRemarksChange={onRemarksChange}
                calculateTotalCost={calculateTotalCost}
                textFieldStyle={textFieldStyle}
                tableCellStyle={tableCellStyle}
                formatTitle={formatTitle}
              />

              {/* Contract Employee Section */}
              <EmployeePersonnelTable
                employeeAllocations={employeeAllocations}
                isConsultant={true}
                onRemarksChange={onRemarksChange}
                calculateTotalCost={calculateTotalCost}
                textFieldStyle={textFieldStyle}
                tableCellStyle={tableCellStyle}
                formatTitle={formatTitle}
              />

              {/* Time Contingencies Row */}
              <TimeContingencyRow
                timeContingency={timeContingency}
                onTimeContingencyChange={onTimeContingencyChange}
                calculateTimeContingencyCost={calculateTimeContingencyCost}
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
              label="TOTAL TIME COST"
              value={calculateTotalTimeCost()}
              tableCellStyle={tableCellStyle}
              summaryRowStyle={summaryRowStyle}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TimeSection;
