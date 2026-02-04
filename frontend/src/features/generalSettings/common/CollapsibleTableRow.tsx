import React from 'react';
import { TableRow, TableCell, Collapse, Table, TableBody } from '@mui/material';

interface CollapsibleTableRowProps {
  isOpen: boolean;
  colSpan: number;
  children: React.ReactNode;
}

export const CollapsibleTableRow: React.FC<CollapsibleTableRowProps> = ({
  isOpen,
  colSpan,
  children,
}) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ padding: 0, border: 0 }}>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableBody>{children}</TableBody>
          </Table>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};
