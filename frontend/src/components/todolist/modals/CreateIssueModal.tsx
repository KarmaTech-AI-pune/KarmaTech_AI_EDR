import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl, Grid, Box, Typography } from '@mui/material';
import { Close, Book, CheckCircle, BugReport, Adjust } from '@mui/icons-material';
import { Issue, TeamMember, NewIssueFormState } from '../../../types/todolist';

interface CreateIssueModalProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  newIssue: NewIssueFormState;
  setNewIssue: React.Dispatch<React.SetStateAction<NewIssueFormState>>;
  createIssue: () => void;
  teamMembers: TeamMember[];
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  showCreateModal,
  setShowCreateModal,
  newIssue,
  setNewIssue,
  createIssue,
  teamMembers,
}) => {
  const handleClose = () => setShowCreateModal(false);

  return (
    <Dialog open={showCreateModal} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Create issue</Typography>
        <Button color="inherit" onClick={handleClose}>
          <Close />
        </Button>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Box component="form" sx={{ '& .MuiTextField-root': { mb: 2 }, '& .MuiFormControl-root': { mb: 2 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Project *</InputLabel>
                <Select value="Sample Project (PROJ)" label="Project *" disabled>
                  <MenuItem value="Sample Project (PROJ)">Sample Project (PROJ)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="issue-type-label">Issue Type *</InputLabel>
                <Select
                  labelId="issue-type-label"
                  value={newIssue.issueType}
                  label="Issue Type *"
                  onChange={(e) => setNewIssue({ ...newIssue, issueType: e.target.value as Issue['issueType'] })}
                >
                  <MenuItem value="Story"><Book sx={{ mr: 1 }} /> Story</MenuItem>
                  <MenuItem value="Task"><CheckCircle sx={{ mr: 1 }} /> Task</MenuItem>
                  <MenuItem value="Bug"><BugReport sx={{ mr: 1 }} /> Bug</MenuItem>
                  <MenuItem value="Epic"><Adjust sx={{ mr: 1 }} /> Epic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Summary *"
            value={newIssue.summary}
            onChange={(e) => setNewIssue({ ...newIssue, summary: e.target.value })}
            placeholder="Enter a concise summary..."
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={newIssue.description}
            onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
            placeholder="Describe the issue in detail..."
            margin="normal"
          />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={newIssue.priority}
                  label="Priority"
                  onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value as Issue['priority'] })}
                >
                  <MenuItem value="Lowest">⏬ Lowest</MenuItem>
                  <MenuItem value="Low">🔻 Low</MenuItem>
                  <MenuItem value="Medium">🔶 Medium</MenuItem>
                  <MenuItem value="High">🔺 High</MenuItem>
                  <MenuItem value="Highest">⏫ Highest</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Assignee"
                value={newIssue.assignee}
                onChange={(e) => setNewIssue({ ...newIssue, assignee: e.target.value })}
                placeholder="Type assignee name"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="story-points-label">Story Points</InputLabel>
                <Select
                  labelId="story-points-label"
                  value={newIssue.storyPoints}
                  label="Story Points"
                  onChange={(e) => setNewIssue({ ...newIssue, storyPoints: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="1">1</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                  <MenuItem value="3">3</MenuItem>
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="8">8</MenuItem>
                  <MenuItem value="13">13</MenuItem>
                  <MenuItem value="21">21</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Estimated Hours"
                type="number"
                value={newIssue.estimatedHours || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewIssue({
                    ...newIssue,
                    estimatedHours: val,
                    // Auto-sync remaining hours to estimated hours if remaining is empty or user hasn't explicitly changed it yet?
                    // User request: "remainingHours: '', must be same as estimatedHours"
                    // Simplest interpretation: Set both when estimated changes.
                    remainingHours: val
                  });
                }}
                placeholder="e.g. 8"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Remaining Hours"
                type="number"
                value={newIssue.remainingHours || ''}
                onChange={(e) => setNewIssue({ ...newIssue, remainingHours: e.target.value })}
                placeholder="e.g. 8"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'grey.100', p: 2, justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">* Required fields</Typography>
        <Box>
          <Button onClick={handleClose} color="inherit" sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={createIssue}
            disabled={!newIssue.summary.trim()}
          >
            Create
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
