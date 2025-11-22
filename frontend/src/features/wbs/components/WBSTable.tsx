import React from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Button, // Import Button for AddButtonRow
  TableCell // Import TableCell for AddButtonRow
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Import AddIcon for AddButtonRow
import { useWBSTableLogic, HeaderCell, StickyHeaderCell, SummaryHeaderCell, AddButtonRow } from '../hooks/useWBSTableLogic'; // Import AddButtonRow
import WBSRow from './WBSRow'; // Import WBSRow to render data rows
import { TaskType, WBSRowData, WBSChildTotals } from '../types/wbs'; // Import types needed for rendering


const WBSTable: React.FC = () => {
  const {
    months,
    formType,
    editMode,
    tableData, // Use tableData now
    addNewRow, // Use addNewRow from the hook
  } = useWBSTableLogic();

  return (
    <TableContainer sx={{
      overflowX: 'auto',
      '& .MuiTableCell-root': {
        px: 1.5,
        py: 1,
        fontSize: '0.875rem'
      }
    }}>
      <Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow>
            {!editMode && (
              <HeaderCell sx={{ width: '48px', backgroundColor: '#FFFFFF' }}>

              </HeaderCell>
            )}
            <StickyHeaderCell sx={{ minWidth: '300px', backgroundColor: '#FFFFFF' }}>Work Description</StickyHeaderCell>
            {formType === 'odc' ? ( // Corrected comparison
              <HeaderCell sx={{ minWidth: '150px' }}>Name</HeaderCell>
            ) : (
              <>
                <HeaderCell sx={{ minWidth: '150px' }}>Resource Role</HeaderCell>
                <HeaderCell sx={{ minWidth: '170px' }}>Resource Name</HeaderCell>
              </>
            )}
            <HeaderCell sx={{ minWidth: 100 }}>Rate</HeaderCell>
            <HeaderCell sx={{ minWidth: '150px' }}>Unit</HeaderCell>
            {months.map((month: string) => (
              <HeaderCell key={month} sx={{ minWidth: 100 }}>{month}</HeaderCell>
            ))}
            {formType === 'odc' ? ( // Corrected comparison
              <>
                <SummaryHeaderCell sx={{ minWidth: '100px' }}>ODC Hours</SummaryHeaderCell>
                <SummaryHeaderCell sx={{ minWidth: '100px' }}>ODC Cost</SummaryHeaderCell>
              </>
            ) : (
              <>
                {formType !== 'manpower' && ( // Corrected comparison
                  <SummaryHeaderCell sx={{ minWidth: '100px' }}>ODCs</SummaryHeaderCell>
                )}
                <SummaryHeaderCell sx={{ minWidth: '100px' }}>Total Hours</SummaryHeaderCell>
                <SummaryHeaderCell sx={{ minWidth: '100px' }}>Total Cost</SummaryHeaderCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map(item => {
            if (item.type === 'data' && item.id && item.row) {
              return (
                <WBSRow
                  key={item.id}
                  row={item.row}
                  childTotals={item.childTotals || null}
                  sequenceNumber={item.sequenceNumber || ''}
                  stickyColumn={item.stickyColumn}
                />
              );
            } else if (item.type === 'button' && item.level) {
              return (
                <AddButtonRow
                  key={`add-button-level-${item.level}${item.parentId ? `-parent-${item.parentId}` : ''}`}
                >
                  <TableCell
                    colSpan={item.colspan}
                    sx={{ bgcolor: item.bgColor }}
                  >
                    <Button
                      fullWidth
                      size="small"
                      sx={{
                        height: '32px',
                        textTransform: 'none',
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: '#F5F5F5'
                        }
                      }}
                      onClick={() => addNewRow(item.level!, item.parentId)}
                    >
                      <AddIcon fontSize="small" sx={{ mr: 1 }} />
                      Add Level {item.level}
                    </Button>
                  </TableCell>
                </AddButtonRow>
              );
            }
            return null;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WBSTable;
