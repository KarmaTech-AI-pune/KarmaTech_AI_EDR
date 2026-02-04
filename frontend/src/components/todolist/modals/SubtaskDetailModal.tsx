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
    TextField,
    Breadcrumbs,
    Link,
} from "@mui/material";
import {
    Close,
    Delete,
} from "@mui/icons-material";
import { Issue, Subtask, TeamMember } from "../../../types/todolist";
import { IssueTypeIcon } from "../common/IssueTypeIcon";
import { PriorityIcon } from "../common/PriorityIcon";
import { IssueDetailRow } from "../common/IssueDetailRow";
import { InlineEdit } from "../common/InlineEdit";
import { ConfirmationDialog } from "../../../components/common/ConfirmationDialog";

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
    teamMembers: TeamMember[];
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
    teamMembers,
}) => {
    if (!subtask || !parentIssue) return null;

    const [newCommentText, setNewCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (subtask) {
            onFetchComments(subtask.id);
        }
    }, [subtask?.id]);

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (subtask) {
            onDeleteSubtask(subtask.id);
            setIsDeleteDialogOpen(false);
            onClose();
        }
    };

    const statusOptions = [
        { value: "To Do", label: "To Do", color: "#f5fb3aff" }, // Yellow
        { value: "In Progress", label: "In Progress", color: "#34a1faff" }, // Blue
        { value: "Review", label: "Review", color: "#fba524ff" }, // Orange
        { value: "Done", label: "Done", color: "#49f54eff" }, // Green
    ];

    const handleStatusChange = (newStatus: Subtask["status"]) => {
        onUpdateSubtask(subtask.id, { status: newStatus });
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
            sx={{ '& .MuiDialog-paper': { zIndex: 1400 } }} // Ensure paper is on top but allow natural portal stacking
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
                    <Box sx={{ mb: 2 }}>
                        <InlineEdit
                            value={subtask.summary}
                            onSave={(val) => onUpdateSubtask(subtask.id, { summary: val })}
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
                            value={subtask.description}
                            onSave={(val) => onUpdateSubtask(subtask.id, { description: val })}
                            type="textarea"
                            label="description"
                            renderValue={(val) => (
                                <Typography variant="body1" color="text.primary">
                                    {val || "No description provided."}
                                </Typography>
                            )}
                        />
                    </Box>

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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'medium' }}>
                            Status
                        </Typography>
                        <InlineEdit
                            value={subtask.status}
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
                                    if (assignee) {
                                        return (
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Avatar sx={{ bgcolor: "primary.main", width: 24, height: 24, fontSize: "0.75rem" }}>
                                                    {assignee.avatar}
                                                </Avatar>
                                                <Typography variant="body2">{assignee.name}</Typography>
                                            </Box>
                                        );
                                    }
                                    return <Typography variant="body2" color="text.secondary">Unassigned</Typography>;
                                }}
                            />
                        </IssueDetailRow>

                        <IssueDetailRow label="Reporter">
                            <InlineEdit
                                value={subtask.reporter.id}
                                onSave={(val) => {
                                    const member = teamMembers.find(m => m.id === val);
                                    if (member) onUpdateSubtask(subtask.id, { reporter: member });
                                }}
                                type="select"
                                options={teamMembers.map(m => ({
                                    value: m.id,
                                    label: m.name,
                                    icon: <Avatar sx={{ width: 16, height: 16, fontSize: '0.5rem' }}>{m.avatar}</Avatar>
                                }))}
                                renderValue={(val) => {
                                    const reporter = teamMembers.find(m => m.id === val) || subtask.reporter;
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
                                value={subtask.priority}
                                onSave={(val) => onUpdateSubtask(subtask.id, { priority: val })}
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
                                value={subtask.storyPoints || 0}
                                onSave={(val) => onUpdateSubtask(subtask.id, { storyPoints: parseInt(val) || 0 })}
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
            {subtask && (
                <ConfirmationDialog
                    open={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Subtask"
                    description={`Are you sure you want to delete the subtask "${subtask.summary}"? This action cannot be undone.`}
                />
            )}
        </Dialog>
    );
};
