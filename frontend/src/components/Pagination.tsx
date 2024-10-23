import React from 'react';
import { Button, Box } from '@mui/material';

interface PaginationProps {
  projectsPerPage: number;
  totalProjects: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

export const Pagination: React.FC<PaginationProps> = ({ projectsPerPage, totalProjects, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProjects / projectsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      {pageNumbers.map(number => (
        <Button
          key={number}
          onClick={() => paginate(number)}
          variant={currentPage === number ? 'contained' : 'outlined'}
          sx={{ mx: 0.5 }}
        >
          {number}
        </Button>
      ))}
    </Box>
  );
};