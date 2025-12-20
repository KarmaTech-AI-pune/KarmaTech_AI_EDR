import React, { useState, useEffect } from "react";
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
    Breadcrumbs,
    Link,
    SelectChangeEvent,
} from "@mui/material";
import {
    Close,
    Delete,
} from "@mui/icons-material";
import { Issue, Subtask } from "../../../types/todolist";
import { IssueTypeIcon } from "../common/IssueTypeIcon";
import { PriorityIcon } from "../common/PriorityIcon";
import { IssueDetailRow } from "../common/IssueDetailRow";

interface SubtaskDetailModalProps {
    subtask: Subtask | null;
    parentIssue: Issue | null;
    onClose: () => void;
    onUpdateSubtask: (subtaskId: string, updates: Partial<Subtask>) => void;
    onDeleteSubtask: (subtaskId: string) => void;
    onAddComment: (subtaskId: string, commentText: string) => void;
    onUpdateComment: (subtaskId: string, commentId: string, text: string) => void;
    onDeleteComment: (subtaskId: string, commentId: string) => void;
    onFetchComments: (subtaskId: string) => void;
}

export const SubtaskDetailModal: React.FC<SubtaskDetailModalProps> = ({
    subtask,
    parentIssue,
    onClose,
    onUpdateSubtask,
    onDeleteSubtask,
    onAddComment,
    onUpdateComment,
    onDeleteComment,
    onFetchComments,
}) => {
    if (!subtask || !parentIssue) return null;

    const [newCommentText, setNewCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState("");

    useEffect(() => {
        if (subtask) {
            onFetchComments(subtask.id);
        }
    }, [subtask?.id]);

    const handleDelete = () => {
        onDeleteSubtask(subtask.id);
        onClose();
    };

    const statusOptions = [
        { value: "To Do", label: "To Do", color: "#f5fb3aff" }, // Yellow
        { value: "In Progress", label: "In Progress", color: "#34a1faff" }, // Blue
        { value: "Review", label: "Review", color: "#fba524ff" }, // Orange
        { value: "Done", label: "Done", color: "#49f54eff" }, // Green
    ];

    const handleStatusChange = (event: SelectChangeEvent) => {
        onUpdateSubtask(subtask.id, { status: event.target.value as Subtask["status"] });
    };

    const handleAddComment = () => {
        if (newCommentText.trim() && subtask) {
            onAddComment(subtask.id, newCommentText);
            setNewCommentText("");
        }
    };

    const handleStartEditComment = (commentId: string, text: string) => {
        setEditingCommentId(commentId);
        setEditingCommentText(text);
    };

    const handleSaveCommentEdit = (commentId: string) => {
        if (editingCommentText.trim() && subtask) {
            onUpdateComment(subtask.id, commentId, editingCommentText);
            setEditingCommentId(null);
            setEditingCommentText("");
        }
    };

    const handleDeleteCommentLocal = (commentId: string) => {
        if (subtask) {
            onDeleteComment(subtask.id, commentId);
        }
    };

    return (
        <Dialog
            open={!!subtask}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            sx={{ zIndex: 1400 }} // Ensure it's above the IssueDetailModal
        >
            <DialogTitle
                sx={{
                    bgcolor: "grey.50",
                    borderBottom: "1px solid",
                    borderColor: "grey.100",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.5,
                    px: 3,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Breadcrumbs separator="/" aria-label="breadcrumb" sx={{ fontSize: '0.875rem' }}>
                        <Link color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IssueTypeIcon issueType={parentIssue.issueType} size="small" />
                            {parentIssue.key}
                        </Link>
                        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IssueTypeIcon issueType="Sub-task" size="small" />
                            {subtask.key}
                        </Typography>
                    </Breadcrumbs>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={handleDelete} color="error" size="small">
                        <Delete fontSize="small" />
                    </IconButton>
                    <IconButton onClick={onClose} color="inherit" size="small">
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent
                sx={{ p: 0, display: "flex", height: "calc(90vh - 80px)" }}
            >
                <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
                    <Typography variant="h5" fontWeight="semibold" sx={{ mb: 2 }}>
                        {subtask.summary}
                    </Typography>

                    <Typography variant="body1" color="text.primary" sx={{ mb: 4 }}>
                        {subtask.description || "No description provided."}
                    </Typography>

                    <Box sx={{ borderTop: "1px solid", borderColor: "grey.100", pt: 3 }}>
                        <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                            Activity
                        </Typography>

                        {/* Existing Comments */}
                        {subtask.comments?.map((comment) => (
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
                                rows={3}
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
                                    size="small"
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
                            sx={{ border: "none" }}
                        >
                            <Select
                                value={subtask.status}
                                onChange={handleStatusChange}
                                sx={{
                                    backgroundColor: statusOptions.find(
                                        (opt) => opt.value === subtask.status
                                    )?.color || "#DFE1E6",
                                    "& .MuiSelect-select": {
                                        padding: "4px 8px",
                                        minHeight: "unset",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
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

                    <Box sx={{ overflowY: "auto", flex: 1 }}>
                        <IssueDetailRow label="Assignee">
                            {subtask.assignee ? (
                                <>
                                    <Avatar
                                        sx={{
                                            bgcolor: "primary.main",
                                            width: 24,
                                            height: 24,
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        {subtask.assignee.avatar}
                                    </Avatar>
                                    <Typography variant="body2">
                                        {subtask.assignee.name}
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
                                {subtask.reporter.avatar}
                            </Avatar>
                            <Typography variant="body2">
                                {subtask.reporter.name}
                            </Typography>
                        </IssueDetailRow>

                        <IssueDetailRow label="Priority">
                            <PriorityIcon priority={subtask.priority} />
                            <Typography variant="body2">
                                {subtask.priority}
                            </Typography>
                        </IssueDetailRow>

                        {subtask.storyPoints !== undefined && subtask.storyPoints > 0 && (
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
                                    {subtask.storyPoints}
                                </Avatar>
                                <Typography variant="body2">
                                    {subtask.storyPoints} points
                                </Typography>
                            </IssueDetailRow>
                        )}

                        <IssueDetailRow label="Created">
                            <Typography variant="body2" color="text.primary">
                                {subtask.createdDate}
                            </Typography>
                        </IssueDetailRow>

                        <IssueDetailRow label="Updated">
                            <Typography variant="body2" color="text.primary">
                                {subtask.updatedDate}
                            </Typography>
                        </IssueDetailRow>

                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};
