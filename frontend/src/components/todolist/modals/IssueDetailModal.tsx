import React, { useState } from "react"; // Added useState
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  Avatar,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  Close,
  Delete,
  Flag,
} from "@mui/icons-material";
import { Issue, TeamMember, Subtask, NewSubtaskFormState, Comment } from "../../../types/todolist"; // Added Comment
import { IssueTypeIcon } from "../common/IssueTypeIcon";
import { PriorityIcon } from "../common/PriorityIcon";
import { IssueDetailRow } from "../common/IssueDetailRow";
import { SubtaskList } from "../SubtaskList";
import { SubtaskDetailModal } from "./SubtaskDetailModal";

interface IssueDetailModalProps {
  showIssueDetail: Issue | null;
  setShowIssueDetail: (issue: Issue | null) => void;
  setEditingIssue: (issue: Issue | null) => void;
  onDeleteIssue: (issueId: string) => void;
  onToggleFlag: (issueId: string) => void;
  onUpdateIssue: (issueId: string, updates: Partial<Issue>) => void; // Original onUpdateIssue from parent
  onCreateSubtask: (parentIssueId: string, subtaskData: NewSubtaskFormState) => void;
  onUpdateSubtask: (subtaskId: string, updates: Partial<Subtask>) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddComment: (issueId: string, commentText: string) => void;
  onUpdateComment: (issueId: string, commentId: string, text: string) => void;
  onDeleteComment: (issueId: string, commentId: string) => void;
  onAddSubtaskComment: (subtaskId: string, commentText: string) => void;
  onUpdateSubtaskComment: (subtaskId: string, commentId: string, text: string) => void;
  onDeleteSubtaskComment: (subtaskId: string, commentId: string) => void;
  onFetchTaskComments: (issueId: string) => void;
  onFetchSubtaskComments: (subtaskId: string) => void;
  teamMembers: TeamMember[];
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  showIssueDetail,
  setShowIssueDetail,
  onDeleteIssue,
  onToggleFlag,
  onUpdateIssue,
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddSubtaskComment,
  onUpdateSubtaskComment,
  onDeleteSubtaskComment,
  onFetchTaskComments,
  onFetchSubtaskComments,
  teamMembers,
}) => {
  if (!showIssueDetail) return null;

  const [newCommentText, setNewCommentText] = useState("");
  const [viewingSubtask, setViewingSubtask] = useState<Subtask | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  React.useEffect(() => {
    if (showIssueDetail) {
      onFetchTaskComments(showIssueDetail.id);
    }
  }, [showIssueDetail?.id]);

  const handleClose = () => setShowIssueDetail(null);
  const handleDelete = () => {
    onDeleteIssue(showIssueDetail.id);
    handleClose();
  };
  const handleToggleFlag = () => onToggleFlag(showIssueDetail.id);

  const handleDeleteSubtask = (subtaskId: string) => {
    if (showIssueDetail) {
      const updatedSubtasks = showIssueDetail.subtasks.filter(
        (subtask) => subtask.id !== subtaskId
      );
      setShowIssueDetail({ ...showIssueDetail, subtasks: updatedSubtasks });
      onDeleteSubtask(subtaskId); // Call parent's onDeleteSubtask for persistence
    }
  };

  const handleUpdateSubtask = (
    subtaskId: string,
    updates: Partial<Subtask>
  ) => {
    if (showIssueDetail) {
      const updatedSubtasks = showIssueDetail.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
      );
      setShowIssueDetail({ ...showIssueDetail, subtasks: updatedSubtasks });
      onUpdateSubtask(subtaskId, updates); // Call parent's onUpdateSubtask for persistence
    }
  };

  const handleUpdateIssueAndState = (issueId: string, updates: Partial<Issue>) => {
    onUpdateIssue(issueId, updates);
    if (showIssueDetail && issueId === showIssueDetail.id) {
      setShowIssueDetail({ ...showIssueDetail, ...updates });
    }
  };

  const statusOptions = [
    { value: "To Do", label: "To Do", color: "#f5fb3aff" },
    { value: "In Progress", label: "In Progress", color: "#34a1faff" },
    { value: "Review", label: "Review", color: "#fba524ff" },
    { value: "Done", label: "Done", color: "#49f54eff" },
  ];

  const handleStatusChange = (event: any) => {
    const newStatus = event.target.value as Issue["status"];
    onUpdateIssue(showIssueDetail.id, { status: newStatus });
    setShowIssueDetail({ ...showIssueDetail, status: newStatus });
  };

  const handleAddComment = () => {
    if (newCommentText.trim() && showIssueDetail) {
      const newComment: Comment = {
        id: `comment-${Date.now()}`, // Simple unique ID
        author: showIssueDetail.reporter, // Assuming reporter is the commenter for now
        text: newCommentText,
        createdDate: new Date().toISOString().split("T")[0],
      };

      const updatedComments = [...showIssueDetail.comments, newComment];
      setShowIssueDetail({ ...showIssueDetail, comments: updatedComments });
      onAddComment(showIssueDetail.id, newCommentText); // Call parent's onAddComment for persistence
      setNewCommentText(""); // Clear input
    }
  };

  const handleSubtaskAddComment = (subtaskId: string, text: string) => {
    if (showIssueDetail) {
      // Optimistic update for subtask comment addition
      const newComment: Comment = {
        id: `subcomment-${Date.now()}`,
        author: teamMembers[0], // Current user
        text: text,
        createdDate: new Date().toISOString().split("T")[0],
      };

      const updatedSubtasks = showIssueDetail.subtasks.map(s =>
        s.id === subtaskId
          ? { ...s, comments: [...s.comments, newComment] }
          : s
      );
      setShowIssueDetail({ ...showIssueDetail, subtasks: updatedSubtasks });

      // Update viewingSubtask if it's the one we're looking at
      if (viewingSubtask && viewingSubtask.id === subtaskId) {
        setViewingSubtask({
          ...viewingSubtask,
          comments: [...viewingSubtask.comments, newComment]
        });
      }

      onAddSubtaskComment(subtaskId, text);
    }
  };

  const handleSubtaskUpdateComment = (subtaskId: string, commentId: string, text: string) => {
    if (showIssueDetail) {
      // Update subtask comment in showIssueDetail
      const updatedSubtasks = showIssueDetail.subtasks.map(s =>
        s.id === subtaskId
          ? { ...s, comments: s.comments.map(c => c.id === commentId ? { ...c, text } : c) }
          : s
      );
      setShowIssueDetail({ ...showIssueDetail, subtasks: updatedSubtasks });

      // Update subtask comment in viewingSubtask
      if (viewingSubtask && viewingSubtask.id === subtaskId) {
        setViewingSubtask({
          ...viewingSubtask,
          comments: viewingSubtask.comments.map(c => c.id === commentId ? { ...c, text } : c)
        });
      }

      onUpdateSubtaskComment(subtaskId, commentId, text);
    }
  };

  const handleSubtaskDeleteComment = (subtaskId: string, commentId: string) => {
    if (showIssueDetail) {
      // Update subtask comment in showIssueDetail
      const updatedSubtasks = showIssueDetail.subtasks.map(s =>
        s.id === subtaskId
          ? { ...s, comments: s.comments.filter(c => c.id !== commentId) }
          : s
      );
      setShowIssueDetail({ ...showIssueDetail, subtasks: updatedSubtasks });

      // Update subtask comment in viewingSubtask
      if (viewingSubtask && viewingSubtask.id === subtaskId) {
        setViewingSubtask({
          ...viewingSubtask,
          comments: viewingSubtask.comments.filter(c => c.id !== commentId)
        });
      }

      onDeleteSubtaskComment(subtaskId, commentId);
    }
  };

  const handleStartEditComment = (commentId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(text);
  };

  const handleSaveCommentEdit = (commentId: string) => {
    if (editingCommentText.trim() && showIssueDetail) {
      // Optimistic update
      const updatedComments = showIssueDetail.comments.map(c =>
        c.id === commentId ? { ...c, text: editingCommentText } : c
      );
      setShowIssueDetail({ ...showIssueDetail, comments: updatedComments });

      onUpdateComment(showIssueDetail.id, commentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText("");
    }
  };

  const handleDeleteCommentLocal = (commentId: string) => {
    if (showIssueDetail) {
      // Optimistic update
      const updatedComments = showIssueDetail.comments.filter(c => c.id !== commentId);
      setShowIssueDetail({ ...showIssueDetail, comments: updatedComments });

      onDeleteComment(showIssueDetail.id, commentId);
    }
  };

  return (
    <Dialog
      open={!!showIssueDetail}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle
        sx={{
          bgcolor: "grey.50",
          borderBottom: "1px solid",
          borderColor: "grey.100",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IssueTypeIcon issueType={showIssueDetail.issueType} />
          <Typography variant="h6" fontWeight="medium">
            {showIssueDetail.key}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {showIssueDetail.issueType}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleToggleFlag}
            sx={{
              color: showIssueDetail.flagged ? "error.main" : "inherit",
              bgcolor: showIssueDetail.flagged ? "error.light" : "inherit",
            }}
          >
            <Flag fontSize="small" />
          </IconButton>
          <IconButton onClick={handleDelete} color="error">
            <Delete fontSize="small" />
          </IconButton>
          <IconButton onClick={handleClose} color="inherit">
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{ p: 0, display: "flex", height: "calc(90vh - 80px)" }}
      >
        <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
          <Typography variant="h5" fontWeight="semibold" sx={{ mb: 2 }}>
            {showIssueDetail.summary}
          </Typography>

          <Typography variant="body1" color="text.primary" sx={{ mb: 4 }}>
            {showIssueDetail.description || "No description provided."}
          </Typography>

          {/* Subtask Management */}
          <SubtaskList
            issue={showIssueDetail}
            teamMembers={teamMembers}
            onUpdateIssue={handleUpdateIssueAndState}
            onCreateSubtask={onCreateSubtask}
            onUpdateSubtask={handleUpdateSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onSubtaskClick={(s) => setViewingSubtask(s)}
          />

          <SubtaskDetailModal
            subtask={viewingSubtask}
            parentIssue={showIssueDetail}
            onClose={() => setViewingSubtask(null)}
            onUpdateSubtask={handleUpdateSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onAddComment={handleSubtaskAddComment}
            onUpdateComment={handleSubtaskUpdateComment}
            onDeleteComment={handleSubtaskDeleteComment}
            onFetchComments={onFetchSubtaskComments}
          />

          <Box sx={{ borderTop: "1px solid", borderColor: "grey.100", pt: 3 }}>
            <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
              Activity
            </Typography>

            {/* Existing Comments */}
            {showIssueDetail.comments.map((comment) => (
              <Box key={comment.id} sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 32,
                    height: 32,
                    fontSize: "0.75rem",
                  }}
                >
                  {comment.author.avatar}
                </Avatar>
                <Box
                  sx={{ flex: 1, bgcolor: "grey.50", borderRadius: 1, p: 1.5 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {comment.author.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {comment.createdDate}
                      </Typography>
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        onClick={() => handleStartEditComment(comment.id, comment.text)}
                        sx={{ minWidth: "auto", mr: 1, textTransform: "none", p: 0 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteCommentLocal(comment.id)}
                        sx={{ minWidth: "auto", textTransform: "none", p: 0 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>

                  {editingCommentId === comment.id ? (
                    <Box>
                      <TextField
                        fullWidth
                        multiline
                        size="small"
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        sx={{ mb: 1, bgcolor: "white" }}
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSaveCommentEdit(comment.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setEditingCommentId(null)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.primary">
                      {comment.text}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}

            {/* Add New Comment */}
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Add a comment..."
                variant="outlined"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!newCommentText.trim()}
                >
                  Comment
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right section  */}
        <Box
          sx={{
            width: 300,
            bgcolor: "grey.50",
            borderLeft: "1px solid",
            borderColor: "grey.100",
            p: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <FormControl
              fullWidth
              margin="dense"
              sx={{ width: "45%", border: "none" }}
            >
              <Select
                labelId="status-label"
                value={showIssueDetail.status}
                onChange={handleStatusChange}
                sx={{
                  backgroundColor: statusOptions.find(
                    (opt) => opt.value === showIssueDetail.status
                  )?.color,
                  "& .MuiSelect-select": {
                    padding: "4px 8px", // Reduce padding (default is usually 16px 14px)
                    minHeight: "unset",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none", // Remove default border
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "none", // Remove focus border
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  // sx={{ backgroundColor: option.color }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ overflowY: "auto", flex: 1 }}>
            <IssueDetailRow label="Assignee">
              {showIssueDetail.assignee ? (
                <>
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 24,
                      height: 24,
                      fontSize: "0.75rem",
                    }}
                  >
                    {showIssueDetail.assignee.avatar}
                  </Avatar>
                  <Typography variant="body2">
                    {showIssueDetail.assignee.name}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Unassigned
                </Typography>
              )}
            </IssueDetailRow>

            <IssueDetailRow label="Reporter">
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 24,
                  height: 24,
                  fontSize: "0.75rem",
                }}
              >
                {showIssueDetail.reporter.avatar}
              </Avatar>
              <Typography variant="body2">
                {showIssueDetail.reporter.name}
              </Typography>
            </IssueDetailRow>

            <IssueDetailRow label="Priority">
              <PriorityIcon priority={showIssueDetail.priority} />
              <Typography variant="body2">
                {showIssueDetail.priority}
              </Typography>
            </IssueDetailRow>

            {showIssueDetail.storyPoints > 0 && (
              <IssueDetailRow label="Story Points">
                <Avatar
                  sx={{
                    width: 20,
                    height: 20,
                    bgcolor: "grey.100",
                    color: "grey.600",
                    fontSize: "0.75rem",
                    fontWeight: "medium",
                  }}
                >
                  {showIssueDetail.storyPoints}
                </Avatar>
                <Typography variant="body2">
                  {showIssueDetail.storyPoints} points
                </Typography>
              </IssueDetailRow>
            )}

            <IssueDetailRow label="Components">
              <Typography variant="body2" color="text.primary">
                {showIssueDetail.components?.join(", ") || "None"}
              </Typography>
            </IssueDetailRow>

            <IssueDetailRow label="Fix Version">
              <Typography variant="body2" color="text.primary">
                {showIssueDetail.fixVersion || "None"}
              </Typography>
            </IssueDetailRow>

            <IssueDetailRow label="Created">
              <Typography variant="body2" color="text.primary">
                {showIssueDetail.createdDate}
              </Typography>
            </IssueDetailRow>

            <IssueDetailRow label="Updated">
              <Typography variant="body2" color="text.primary">
                {showIssueDetail.updatedDate}
              </Typography>
            </IssueDetailRow>

          </Box>

        </Box>
      </DialogContent>
    </Dialog>
  );
};
