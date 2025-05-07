import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormSectionProps } from '../../types/jobStartForm';

const FormSection: React.FC<FormSectionProps> = ({
  title,
  expanded,
  onChange,
  children,
  accordionStyle
}) => {
  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      elevation={0}
      sx={accordionStyle}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ fontWeight: 'bold' }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default FormSection;
