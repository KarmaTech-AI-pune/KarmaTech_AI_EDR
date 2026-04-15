import React, { useState, useEffect, useMemo } from 'react';
import {
  styled,
  tooltipClasses,
  TooltipProps,
  Box, Typography, Paper, Container, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Tooltip, CircularProgress, Alert, Avatar, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useProject } from '../../../context/ProjectContext';
import { axiosInstance } from '../../../services/axiosConfig';

// Matches backend EDR.Domain.Entities.SprintWbsPlan
interface SprintWbsPlanItem {
  sprintWbsPlanId: number;
  tenantId: number;
  projectId: number;
  wbsTaskId: number | null;
  wbsTaskName: string;
  parentWBSTaskId: number | null;
  assignedUserId: string | null;
  assignedUserName: string | null;
  roleId: string | null;
  roleName: string | null;
  monthYear: string;
  sprintNumber: number;
  plannedHours: number;
  remainingHours: number;
  programSequence: number;
  isConsumed: boolean;
  acceptanceCriteria: string | null;
  taskDescription: string | null;
  backlogVersion: number;
  isCarryoverApplied: boolean;
  createdOn: string;
  updatedOn: string | null;
}

// Helper to get user initials for avatar
const getInitials = (name: string | null): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// Helper to derive task type from hierarchy
const getTaskType = (item: SprintWbsPlanItem, items: SprintWbsPlanItem[]): 'Epic' | 'Task' | 'Subtask' => {
  const hasChildren = items.some(i => i.parentWBSTaskId === item.wbsTaskId);
  if (!item.parentWBSTaskId) return hasChildren ? 'Epic' : 'Task';
  const parent = items.find(i => i.wbsTaskId === item.parentWBSTaskId);
  if (parent && !parent.parentWBSTaskId) return 'Task';
  return 'Subtask';
};

const taskTypeColors: Record<string, { bg: string; color: string }> = {
  Epic: { bg: '#e8f5e9', color: '#2e7d32' },
  Task: { bg: '#e3f2fd', color: '#1565c0' },
  Subtask: { bg: '#f3e5f5', color: '#7b1fa2' },
};

// Styled Tooltip for the dark background details
const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#1a2332',
    color: '#ffffff',
    maxWidth: 500,
    fontSize: theme.typography.pxToRem(13),
    border: '1px solid #334155',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
}));

// Helper to format "MM-YYYY" to "Month Name YYYY"
const formatMonthYear = (my: string | null): string => {
  if (!my || !my.includes('-')) return my || '—';
  try {
    const [month, year] = my.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  } catch (e) {
    return my;
  }
};

const ProductBacklog: React.FC = () => {
  const { projectId } = useProject();
  const [backlogItems, setBacklogItems] = useState<SprintWbsPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sprintFilter, setSprintFilter] = useState<string>('all');
  const [versionFilter, setVersionFilter] = useState<string>('latest'); // Default to 'latest'
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [availableVersions, setAvailableVersions] = useState<number[]>([]);

  const fetchBacklog = async (selectedVersion: string = 'latest') => {
    if (!projectId) {
      setLoading(false);
      setError('No project selected.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      let apiUrl = `/api/ProgramSprint/${projectId}`;
      if (selectedVersion !== 'latest') {
        apiUrl = `/api/ProgramSprint/${projectId}/version/${selectedVersion}`;
      }
      const response = await axiosInstance.get(apiUrl);
      setBacklogItems(response.data);
      // Auto-expand all parent rows
      const parents = new Set<number>();
      (response.data as SprintWbsPlanItem[]).forEach(item => {
        if ((response.data as SprintWbsPlanItem[]).some(i => i.parentWBSTaskId === item.wbsTaskId)) {
          if (item.wbsTaskId) parents.add(item.wbsTaskId);
        }
      });
      setExpandedRows(parents);
    } catch (err: any) {
      console.error('Failed to fetch product backlog:', err);
      setError(err.response?.data?.message || 'Failed to load product backlog.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    if (!projectId) return;
    try {
      const response = await axiosInstance.get(`/api/ProgramSprint/${projectId}/versions`);
      setAvailableVersions(response.data);
      // Set the initial version filter to 'latest' and fetch backlog
      setVersionFilter('latest');
      fetchBacklog('latest');
    } catch (err: any) {
      console.error('Failed to fetch backlog versions:', err);
      setError(err.response?.data?.message || 'Failed to load backlog versions.');
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [projectId]);

  // Derived data
  const sprintOptions = useMemo(() => {
    const sprints = [...new Set(backlogItems.map(i => i.sprintNumber))].sort((a, b) => a - b);
    return sprints;
  }, [backlogItems]);

  const totalHours = useMemo(() => backlogItems.reduce((sum, i) => sum + i.plannedHours, 0), [backlogItems]);
  const totalRemaining = useMemo(() => backlogItems.reduce((sum, i) => sum + i.remainingHours, 0), [backlogItems]);
  const completionPct = useMemo(() => totalHours > 0 ? Math.round(((totalHours - totalRemaining) / totalHours) * 100) : 0, [totalHours, totalRemaining]);

  const handleVersionChange = (event: SelectChangeEvent) => {
    const selected = event.target.value;
    setVersionFilter(selected);
    fetchBacklog(selected);
  };

  const filteredItems = useMemo(() => {
    return backlogItems.filter(item => {
      if (sprintFilter !== 'all' && item.sprintNumber !== parseInt(sprintFilter)) return false;
      // Update version filter logic to handle 'latest' string
      if (versionFilter !== 'latest' && versionFilter !== 'all' && item.backlogVersion !== parseInt(versionFilter)) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          item.wbsTaskName?.toLowerCase().includes(term) ||
          item.assignedUserName?.toLowerCase().includes(term)
        );
      }
      return true;
    }).sort((a, b) => a.sprintNumber - b.sprintNumber);
  }, [backlogItems, sprintFilter, versionFilter, searchTerm]);

  // Build hierarchy: top-level items, then children
  const topLevelItems = useMemo(() => filteredItems.filter(i => !i.parentWBSTaskId), [filteredItems]);

  const getChildren = (parentId: number | null): SprintWbsPlanItem[] => {
    if (!parentId) return [];
    return filteredItems.filter(i => i.parentWBSTaskId === parentId);
  };

  const toggleExpand = (wbsTaskId: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(wbsTaskId)) next.delete(wbsTaskId);
      else next.add(wbsTaskId);
      return next;
    });
  };

  const getStatusLabel = (item: SprintWbsPlanItem): string => {
    if (item.isConsumed) return 'Consumed';
    if (item.remainingHours <= 0 && item.plannedHours > 0) return 'Done';
    if (item.remainingHours < item.plannedHours) return 'In Progress';
    return 'In Backlog';
  };

  const statusStyles: Record<string, { bg: string; color: string }> = {
    Done: { bg: '#e8f5e9', color: '#2e7d32' },
    'In Progress': { bg: '#fff3e0', color: '#e65100' },
    'In Backlog': { bg: '#e3f2fd', color: '#1565c0' },
    Consumed: { bg: '#f5f5f5', color: '#757575' },
  };

  const renderRow = (item: SprintWbsPlanItem, depth: number = 0) => {
    const hasChildren = backlogItems.some(i => i.parentWBSTaskId === item.wbsTaskId);
    const isExpanded = item.wbsTaskId ? expandedRows.has(item.wbsTaskId) : false;
    const taskType = getTaskType(item, backlogItems);
    const typeStyle = taskTypeColors[taskType];
    const status = getStatusLabel(item);
    const sStyle = statusStyles[status] || statusStyles['In Backlog'];
    const children = item.wbsTaskId ? getChildren(item.wbsTaskId) : [];

    const tooltipContent = (
      <Box sx={{ p: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem' }}>
          Task Name:
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
          {item.wbsTaskName}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem' }}>
          Description:
        </Typography>
        <Typography variant="body2" sx={{ mb: 1.5, color: '#cbd5e1' }}>
          {item.taskDescription || 'No description available'}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.7rem' }}>
          Month Year:
        </Typography>
        <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
          {formatMonthYear(item.monthYear)}
        </Typography>
      </Box>
    );

    return (
      <React.Fragment key={item.sprintWbsPlanId}>
        <StyledTooltip title={tooltipContent} placement="bottom-start" enterDelay={400}>
          <TableRow
            sx={{
              '&:hover': { bgcolor: '#f1f5f9', cursor: 'pointer' },
              borderLeft: depth === 0 ? '3px solid #26a69a' : 'none',
              transition: 'background-color 0.2s',
            }}
          >
          {/* Task Name */}
          <TableCell sx={{ pl: 2 + depth * 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {hasChildren ? (
                <IconButton size="small" onClick={() => item.wbsTaskId && toggleExpand(item.wbsTaskId)} sx={{ p: 0.25 }}>
                  {isExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                </IconButton>
              ) : (
                <CheckCircleOutlineIcon fontSize="small" sx={{ color: '#26a69a', ml: 0.25 }} />
              )}
              <Typography variant="body2" sx={{ fontWeight: depth === 0 ? 600 : 400 }}>
                {item.wbsTaskName}
              </Typography>
              <Chip
                label={taskType}
                size="small"
                sx={{
                  bgcolor: typeStyle.bg,
                  color: typeStyle.color,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                  ml: 0.5,
                }}
              />
            </Box>
          </TableCell>

          {/* Sprint */}
          <TableCell>
            <Typography variant="body2" color="text.secondary">Sprint {item.sprintNumber}</Typography>
          </TableCell>

          {/* Assigned User */}
          <TableCell>
            {item.assignedUserName ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#5c6bc0' }}>
                  {getInitials(item.assignedUserName)}
                </Avatar>
                <Typography variant="body2">{item.assignedUserName}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.disabled">—</Typography>
            )}
          </TableCell>

          {/* Role */}
          <TableCell>
            <Typography variant="body2" color="text.secondary">{item.roleName || '—'}</Typography>
          </TableCell>

          {/* Planned */}
          <TableCell align="center">
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.plannedHours}h</Typography>
          </TableCell>

          {/* Remaining */}
          <TableCell align="center">
            <Typography variant="body2" sx={{ fontWeight: 700, color: item.remainingHours > 0 ? '#10b981' : '#64748b' }}>
              {item.remainingHours}h
            </Typography>
          </TableCell>

          {/* Month Year */}
          <TableCell>
            <Typography variant="body2" color="text.secondary">{formatMonthYear(item.monthYear)}</Typography>
          </TableCell>

          {/* Status */}
          <TableCell>
            <Chip
              label={status}
              size="small"
              sx={{
                bgcolor: sStyle.bg,
                color: sStyle.color,
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
                borderRadius: '6px',
              }}
            />
          </TableCell>
        </TableRow>
      </StyledTooltip>

        {/* Render children if expanded */}
        {isExpanded && children.map(child => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a2332' }}>
              Product Backlog
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Product Backlog Management
            </Typography>
          </Box>

          {/* Summary Cards */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Paper
              elevation={0}
              sx={{
                px: 3, py: 1.5, borderRadius: 2,
                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                color: 'white', textAlign: 'center', minWidth: 120,
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>Total Hours</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalHours}h</Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                px: 3, py: 1.5, borderRadius: 2,
                background: 'linear-gradient(135deg, #ef6c00, #e65100)',
                color: 'white', textAlign: 'center', minWidth: 120,
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>Remaining</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{totalRemaining}h</Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                px: 3, py: 1.5, borderRadius: 2,
                background: 'linear-gradient(135deg, #43a047, #2e7d32)',
                color: 'white', textAlign: 'center', minWidth: 120,
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>Completion</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{completionPct}%</Typography>
            </Paper>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Filters */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <FilterListIcon sx={{ color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mr: 1 }}>Filters:</Typography>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Backlog Version</InputLabel>
            <Select
              value={versionFilter}
              label="Backlog Version"
              onChange={handleVersionChange}
            >
              <MenuItem value="latest">Latest</MenuItem>
              {availableVersions.map(v => (
                <MenuItem key={v} value={v.toString()}>Version {v}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Sprint</InputLabel>
            <Select
              value={sprintFilter}
              label="Sprint"
              onChange={(e: SelectChangeEvent) => setSprintFilter(e.target.value)}
            >
              <MenuItem value="all">All Sprints</MenuItem>
              {sprintOptions.map(s => (
                <MenuItem key={s} value={s.toString()}>Sprint {s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by task name or assignee..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 280 }}
          />

          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Refresh Backlog">
              <IconButton color="primary" onClick={() => fetchBacklog(versionFilter)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Table */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                  <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569', letterSpacing: 0.5 }}>Task Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569', letterSpacing: 0.5 }}>Sprint</TableCell>
                  <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569', letterSpacing: 0.5 }}>Assigned User</TableCell>
                  <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569', letterSpacing: 0.5 }}>Role</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569', letterSpacing: 0.5 }}>Planned</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569', letterSpacing: 0.5 }}>Remaining</TableCell>
                  <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569', letterSpacing: 0.5 }}>Month Year</TableCell>
                  <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', color: '#475569', letterSpacing: 0.5 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topLevelItems.map(item => renderRow(item, 0))}
                {filteredItems.length === 0 && !error && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        No backlog items found for this project.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProductBacklog;
