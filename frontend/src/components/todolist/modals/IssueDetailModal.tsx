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
import { InlineEdit } from "../common/InlineEdit";
import { TimeTrackingWidget } from "../common/TimeTrackingWidget";
import { updateIssueTimeAPI } from "../../../data/todolistData";

interface IssueDetailModalProps {
  showIssueDetail: Issue | null;
  setShowIssueDetail: React.Dispatch<React.SetStateAction<Issue | null>>;
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
  const [viewingSubtaskId, setViewingSubtaskId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  // Derive viewingSubtask from showIssueDetail.subtasks using viewingSubtaskId
  const viewingSubtask = showIssueDetail?.subtasks.find(s => s.id === viewingSubtaskId) || null;

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
  const handleToggleFlag = () => {
    if (showIssueDetail) {
      setShowIssueDetail((prev: Issue | null) => prev ? { ...prev, flagged: !prev.flagged } : null);
      onToggleFlag(showIssueDetail.id);
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (showIssueDetail) {
      setShowIssueDetail((prev: Issue | null) => prev ? {
        ...prev,
        subtasks: prev.subtasks.filter(s => s.id !== subtaskId)
      } : null);
      onDeleteSubtask(subtaskId);
    }
  };

  const handleUpdateSubtask = (
    subtaskId: string,
    updates: Partial<Subtask>
  ) => {
    if (showIssueDetail) {
      setShowIssueDetail((prev: Issue | null) => prev ? {
        ...prev,
        subtasks: prev.subtasks.map((s: Subtask) => s.id === subtaskId ? { ...s, ...updates } : s)
      } : null);

      onUpdateSubtask(subtaskId, updates);
    }
  };

  const handleUpdateIssueAndState = (issueId: string, updates: Partial<Issue>) => {
    onUpdateIssue(issueId, updates);
    if (showIssueDetail && issueId === showIssueDetail.id) {
      setShowIssueDetail((prev: Issue | null) => prev ? { ...prev, ...updates } : null);
    }
  };

  const statusOptions = [
    { value: "To Do", label: "To Do", color: "#f5fb3aff" },
    { value: "In Progress", label: "In Progress", color: "#34a1faff" },
    { value: "Review", label: "Review", color: "#fba524ff" },
    { value: "Done", label: "Done", color: "#49f54eff" },
  ];

  const handleStatusChange = (newStatus: Issue["status"]) => {
    onUpdateIssue(showIssueDetail.id, { status: newStatus });
    setShowIssueDetail((prev: Issue | null) => prev ? { ...prev, status: newStatus } : null);
  };

  const handleAddComment = () => {
    if (newCommentText.trim() && showIssueDetail) {
      const newComment: Comment = {
        id: `comment-${Date.now()}`, // Simple unique ID
        author: showIssueDetail.reporter, // Assuming reporter is the commenter for now
        text: newCommentText,
        createdDate: new Date().toISOString().split("T")[0],
      };

      setShowIssueDetail((prev: Issue | null) => prev ? {
        ...prev,
        comments: [...prev.comments, newComment]
      } : null);
      onAddComment(showIssueDetail.id, newCommentText);
      setNewCommentText("");
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

      setShowIssueDetail((prev: Issue | null) => {
        if (!prev) return null;
        return {
          ...prev,
          subtasks: prev.subtasks.map((s: Subtask) =>
            s.id === subtaskId
              ? { ...s, comments: [...s.comments, newComment] }
              : s
          )
        };
      });

      onAddSubtaskComment(subtaskId, text);
    }
  };

  const handleSubtaskUpdateComment = (subtaskId: string, commentId: string, text: string) => {
    if (showIssueDetail) {
      // Update subtask comment in showIssueDetail
      setShowIssueDetail((prev: Issue | null) => {
        if (!prev) return null;
        return {
          ...prev,
          subtasks: prev.subtasks.map((s: Subtask) =>
            s.id === subtaskId
              ? { ...s, comments: s.comments.map((c: Comment) => c.id === commentId ? { ...c, text } : c) }
              : s
          )
        };
      });

      onUpdateSubtaskComment(subtaskId, commentId, text);
    }
  };

  const handleSubtaskDeleteComment = (subtaskId: string, commentId: string) => {
    if (showIssueDetail) {
      setShowIssueDetail((prev: Issue | null) => {
        if (!prev) return null;
        return {
          ...prev,
          subtasks: prev.subtasks.map((s: Subtask) =>
            s.id === subtaskId
              ? { ...s, comments: s.comments.filter((c: Comment) => c.id !== commentId) }
              : s
          )
        };
      });

      onDeleteSubtaskComment(subtaskId, commentId);
    }
  };

  const handleStartEditComment = (commentId: string, text: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(text);
  };

  const handleSaveCommentEdit = (commentId: string) => {
    if (editingCommentText.trim() && showIssueDetail) {
      setShowIssueDetail((prev: Issue | null) => prev ? {
        ...prev,
        comments: prev.comments.map((c: Comment) => c.id === commentId ? { ...c, text: editingCommentText } : c)
      } : null);

      onUpdateComment(showIssueDetail.id, commentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText("");
    }
  };

  const handleDeleteCommentLocal = (commentId: string) => {
    if (showIssueDetail) {
      setShowIssueDetail((prev: Issue | null) => prev ? {
        ...prev,
        comments: prev.comments.filter((c: Comment) => c.id !== commentId)
      } : null);

      onDeleteComment(showIssueDetail.id, commentId);
    }
  };



  const handleLogWork = async (timeSpent: number, remainingEstimate: number) => {
    if (showIssueDetail) {
      const newActual = (showIssueDetail.actualHours || 0) + timeSpent;

      // Optimistic update
      const updatedIssue = {
        ...showIssueDetail,
        actualHours: newActual,
        remainingHours: remainingEstimate
      };

      setShowIssueDetail(updatedIssue);
      // Update the issue in the main list as well
      handleUpdateIssueAndState(showIssueDetail.id, {
        actualHours: newActual,
        remainingHours: remainingEstimate
      });

      // Call the dedicated API for time tracking
      await updateIssueTimeAPI(updatedIssue);
    }
  };

  const handleUpdateOriginalEstimate = (newEstimate: number) => {
    handleUpdateIssueAndState(showIssueDetail.id, { estimatedHours: newEstimate });
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
          <Box sx={{ mb: 2 }}>
            <InlineEdit
              value={showIssueDetail.summary}
              onSave={(val) => handleUpdateIssueAndState(showIssueDetail.id, { summary: val })}
              label="summary"
              renderValue={(val) => (
                <Typography variant="h5" fontWeight="semibold">
                  {val}
                </Typography>
              )}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
              Description
            </Typography>
            <InlineEdit
              value={showIssueDetail.description}
              onSave={(val) => handleUpdateIssueAndState(showIssueDetail.id, { description: val })}
              type="textarea"
              label="description"
              renderValue={(val) => (
                <Typography variant="body1" color="text.primary">
                  {val || "No description provided."}
                </Typography>
              )}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
              Acceptance Criteria
            </Typography>
            <InlineEdit
              value={showIssueDetail.acceptanceCriteria || ""}
              onSave={(val) => handleUpdateIssueAndState(showIssueDetail.id, { acceptanceCriteria: val })}
              type="textarea"
              label="acceptance criteria"
              renderValue={(val) => (
                <Typography variant="body1" color="text.primary">
                  {val || "Add acceptance criteria..."}
                </Typography>
              )}
            />
          </Box>

          {/* Subtask Management */}
          <SubtaskList
            issue={showIssueDetail}
            teamMembers={teamMembers}
            onUpdateIssue={handleUpdateIssueAndState}
            onCreateSubtask={onCreateSubtask}
            onUpdateSubtask={handleUpdateSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onSubtaskClick={(s) => setViewingSubtaskId(s.id)}
          />

          <SubtaskDetailModal
            subtask={viewingSubtask}
            parentIssue={showIssueDetail}
            onClose={() => setViewingSubtaskId(null)}
            onUpdateSubtask={handleUpdateSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onAddComment={handleSubtaskAddComment}
            onUpdateComment={handleSubtaskUpdateComment}
            onDeleteComment={handleSubtaskDeleteComment}
            onFetchComments={onFetchSubtaskComments}
            teamMembers={teamMembers}
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
            {/* Time Tracking Widget */}
            <TimeTrackingWidget
              originalEstimate={showIssueDetail.estimatedHours || 0}
              remainingEstimate={showIssueDetail.remainingHours || 0}
              timeSpent={showIssueDetail.actualHours || 0}
              onLogWork={handleLogWork}
              onUpdateOriginalEstimate={handleUpdateOriginalEstimate}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
              Status
            </Typography>
            <InlineEdit
              value={showIssueDetail.status}
              onSave={handleStatusChange}
              type="select"
              options={statusOptions}
              renderValue={(val) => (
                <Box
                  sx={{
                    backgroundColor: statusOptions.find(opt => opt.value === val)?.color,
                    padding: "4px 12px",
                    borderRadius: "4px",
                    display: "inline-block",
                    fontWeight: "medium",
                    fontSize: "0.875rem",
                  }}
                >
                  {val}
                </Box>
              )}
            />
          </Box>

          <Box sx={{ overflowY: "auto", flex: 1 }}>
            <IssueDetailRow label="Assignee">
              <InlineEdit
                value={showIssueDetail.assignee?.id || ""}
                onSave={(val) => {
                  const member = teamMembers.find(m => m.id === val);
                  handleUpdateIssueAndState(showIssueDetail.id, { assignee: member || null });
                }}
                type="select"
                options={teamMembers.map(m => ({
                  value: m.id,
                  label: m.name,
                  icon: <Avatar sx={{ width: 16, height: 16, fontSize: '0.5rem' }}>{m.avatar}</Avatar>
                }))}
                renderValue={(val) => {
                  const assignee = teamMembers.find(m => m.id === val);
                  return assignee ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ bgcolor: "primary.main", width: 24, height: 24, fontSize: "0.75rem" }}>
                        {assignee.avatar}
                      </Avatar>
                      <Typography variant="body2">{assignee.name}</Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Unassigned</Typography>
                  );
                }}
              />
            </IssueDetailRow>

            <IssueDetailRow label="Reporter">
              <InlineEdit
                value={showIssueDetail.reporter.id}
                onSave={(val) => {
                  const member = teamMembers.find(m => m.id === val);
                  if (member) handleUpdateIssueAndState(showIssueDetail.id, { reporter: member });
                }}
                type="select"
                options={teamMembers.map(m => ({
                  value: m.id,
                  label: m.name,
                  icon: <Avatar sx={{ width: 16, height: 16, fontSize: '0.5rem' }}>{m.avatar}</Avatar>
                }))}
                renderValue={(val) => {
                  const reporter = teamMembers.find(m => m.id === val) || showIssueDetail.reporter;
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ bgcolor: "primary.main", width: 24, height: 24, fontSize: "0.75rem" }}>
                        {reporter.avatar}
                      </Avatar>
                      <Typography variant="body2">{reporter.name}</Typography>
                    </Box>
                  );
                }}
              />
            </IssueDetailRow>

            <IssueDetailRow label="Priority">
              <InlineEdit
                value={showIssueDetail.priority}
                onSave={(val) => handleUpdateIssueAndState(showIssueDetail.id, { priority: val })}
                type="select"
                options={["Lowest", "Low", "Medium", "High", "Highest"].map(p => ({
                  value: p,
                  label: p,
                  icon: <PriorityIcon priority={p as any} />
                }))}
                renderValue={(val) => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PriorityIcon priority={val as any} />
                    <Typography variant="body2">{val}</Typography>
                  </Box>
                )}
              />
            </IssueDetailRow>

            <IssueDetailRow label="Story Points">
              <InlineEdit
                value={showIssueDetail.storyPoints}
                onSave={(val) => handleUpdateIssueAndState(showIssueDetail.id, { storyPoints: parseInt(val) || 0 })}
                type="number"
                label="story points"
                renderValue={(val) => (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 20, height: 20, bgcolor: "grey.100", color: "grey.600", fontSize: "0.75rem", fontWeight: "medium" }}>
                      {val}
                    </Avatar>
                    <Typography variant="body2">{val} points</Typography>
                  </Box>
                )}
              />
            </IssueDetailRow>

            <IssueDetailRow label="Components">
              <Typography variant="body2" color="text.primary">
                {showIssueDetail.components?.join(", ") || "None"}
              </Typography>
            </IssueDetailRow>

            <IssueDetailRow label="Fix Version">
              <InlineEdit
                value={showIssueDetail.fixVersion}
                onSave={(val) => handleUpdateIssueAndState(showIssueDetail.id, { fixVersion: val })}
                label="fix version"
                renderValue={(val) => (
                  <Typography variant="body2" color="text.primary">
                    {val || "None"}
                  </Typography>
                )}
              />
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
