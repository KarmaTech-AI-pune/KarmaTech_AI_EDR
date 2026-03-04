import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { Subtask, TeamMember } from "../../types/todolist";
import { IssueTypeIcon } from "./common/IssueTypeIcon";
import { PriorityIcon } from "./common/PriorityIcon";
import { InlineEdit } from "./common/InlineEdit";
import { ConfirmationDialog } from "../common/ConfirmationDialog";

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const statusOptions = [
    { value: "To Do", label: "To Do", color: "#f5fb3aff" },
    { value: "In Progress", label: "In Progress", color: "#34a1faff" },
    { value: "Review", label: "Review", color: "#fba524ff" },
    { value: "Done", label: "Done", color: "#49f54eff" },
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
      onClick={() => onSubtaskClick?.(subtask)}
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
        <Box sx={{ flex: 1, minWidth: 0, ml: 1 }}>
          <InlineEdit
            value={subtask.summary}
            onSave={(val) => onUpdateSubtask(subtask.id, { summary: val })}
            label="summary"
            renderValue={(val) => (
              <Typography
                variant="body2"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {val}
              </Typography>
            )}
          />
        </Box>
      </Box>

      {/* Priority Column */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <InlineEdit
          value={subtask.priority}
          onSave={(val) => onUpdateSubtask(subtask.id, { priority: val })}
          type="select"
          options={["Lowest", "Low", "Medium", "High", "Highest"].map(p => ({
            value: p,
            label: p,
            icon: <PriorityIcon priority={p as any} size="small" />
          }))}
          renderValue={(val) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PriorityIcon priority={val as any} size="small" />
              <Typography variant="body2">{val}</Typography>
            </Box>
          )}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <InlineEdit
          value={subtask.assignee?.name || ""}
          onSave={(val) => {
            const newAssignee = val ? {
              id: val,
              name: val,
              avatar: (val.match(/\b\w/g) || []).join('').substring(0, 2).toUpperCase() || val.substring(0, 2).toUpperCase()
            } : null;
            onUpdateSubtask(subtask.id, { assignee: newAssignee });
          }}
          label="assignee"
          renderValue={() => {
            const assignee = subtask.assignee;
            return assignee ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                    fontSize: "0.75rem",
                    bgcolor: "primary.main",
                  }}
                >
                  {assignee.avatar}
                </Avatar>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>{assignee.name}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>Unassigned</Typography>
            );
          }}
        />
      </Box>

      {/* Status Column */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <InlineEdit
          value={subtask.status}
          onSave={(val) => onUpdateSubtask(subtask.id, { status: val })}
          type="select"
          options={statusOptions}
          renderValue={(val) => (
            <Box
              sx={{
                backgroundColor: statusOptions.find(opt => opt.value === val)?.color,
                padding: "2px 8px",
                borderRadius: "3px",
                display: "inline-block",
                fontWeight: "medium",
                fontSize: "0.75rem",
                color: val === "Done" ? "white" : "text.primary",
              }}
            >
              {val}
            </Box>
          )}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          className="subtask-actions"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            justifyItems: "flex-end",
            opacity: 0,
            transition: "opacity 0.2s ease",
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
