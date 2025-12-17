import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { Subtask, TeamMember } from "../../types/todolist";
import { IssueTypeIcon } from "./common/IssueTypeIcon";
import { PriorityIcon } from "./common/PriorityIcon";
import { ConfirmationDialog } from "../common/ConfirmationDialog"; // Import the new component

interface SubtaskItemProps {
  subtask: Subtask;
  teamMembers: TeamMember[];
  onUpdateSubtask: (subtaskId: string, updates: Partial<Subtask>) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onSubtaskClick?: (subtask: Subtask) => void;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  teamMembers,
  onUpdateSubtask,
  onDeleteSubtask,
  onSubtaskClick,
}) => {
  console.log('SubtaskItem received subtask:', subtask); // Debug log

  const [isEditing, _setIsEditing] = useState(false);
  const [editingSummary, setEditingSummary] = useState(subtask.summary);
  const [_editingStatus, _setEditingStatus] = useState(subtask.status);
  const [editingAssignee, setEditingAssignee] = useState(
    subtask.assignee?.id || ""
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // New state for dialog

  const statusOptions = [
    { value: "To Do", label: "To Do", color: "#DFE1E6" },
    { value: "In Progress", label: "In Progress", color: "#0065FF" },
    { value: "Review", label: "Review", color: "#FF991F" },
    { value: "Done", label: "Done", color: "#36B37E" },
  ];

 

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true); // Open the dialog instead of window.confirm
  };

  const handleConfirmDelete = () => {
    onDeleteSubtask(subtask.id);
    setIsDeleteDialogOpen(false); // Close the dialog after confirming
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false); // Close the dialog if cancelled
  };


  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr auto", // Work, Priority, Assignee, Status, Actions (Adjusted for explicit actions column)
        alignItems: "center",
        py: 0.5,
        px: 1,
        backgroundColor: "grey.50",
        borderRadius: 1,
        cursor: onSubtaskClick ? "pointer" : "default",
        "&:hover": {
          backgroundColor: "grey.100",
          "& .subtask-actions": {
            opacity: 1,
          },
        },
        transition: "background-color 0.2s ease",
      }}
      onClick={() => !isEditing && onSubtaskClick?.(subtask)}
    >
      {/* Work Column */}
      <Box sx={{ display: "flex", alignItems: "center", }}>
        <IssueTypeIcon issueType="Sub-task" size="small" />
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: "medium",
            minWidth: "fit-content",
          }}
        >
          {subtask.key}
        </Typography>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <TextField
              value={editingSummary}
              onChange={(e) => setEditingSummary(e.target.value)}
              size="small"
              fullWidth
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.875rem",
                },
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{
                
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subtask.summary}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Priority Column */}
      <Box sx={{ display: "flex", alignItems: "center", }}>
        <PriorityIcon priority={subtask.priority} size="small" />
        <Typography variant="body2">{subtask.priority}</Typography>
      </Box>

      {/* Assignee Column */}
      <Box sx={{ display: "flex", alignItems: "center",  }}>
        {isEditing ? (
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={editingAssignee}
              onChange={(e) => setEditingAssignee(e.target.value)}
              displayEmpty
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {teamMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 20,
                        height: 20,
                        fontSize: "0.75rem",
                        bgcolor: "primary.main",
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    {member.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : subtask.assignee ? (
          <Tooltip title={subtask.assignee.name}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: "0.75rem",
                  bgcolor: "primary.main",
                  color: "white",
                }}
              >
                {subtask.assignee.avatar}
              </Avatar>
              <Typography variant="body2">{subtask.assignee.name}</Typography>
            </Box>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Unassigned
          </Typography>
        )}
      </Box>

      {/* Status Column */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 50 }}>
          <Select
            value={subtask.status} // Use subtask.status directly
            onChange={(e) => {
              const newStatus = e.target.value as Subtask["status"];
              onUpdateSubtask(subtask.id, { status: newStatus });
            }}
            onClick={(e) => e.stopPropagation()}
            sx={{
              backgroundColor: statusOptions.find(
                (opt) => opt.value === subtask.status
              )?.color,
              color: subtask.status === "Done" ? "white" : "text.primary",
              "& .MuiSelect-select": {
                padding: "2px 4px",
                minHeight: "unset",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center"}}>
        <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                justifyItems: "flex-end",
              }}
            >
              <IconButton
                size="small"
                onClick={handleDelete}
                sx={{ color: "error.main" }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
      </Box>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Subtask"
        description={`Are you sure you want to delete the subtask "${subtask.summary}"? This action cannot be undone.`}
      />
    </Box>
  );
};
