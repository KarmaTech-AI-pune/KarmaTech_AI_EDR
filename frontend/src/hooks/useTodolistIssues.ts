import { useState, useEffect } from 'react';
import { fetchIssuesFromAPI, teamMembers, updateIssueAPI, updateSubtaskAPI, createIssueAPI, deleteIssueAPI, createSubtaskAPI, deleteSubtaskAPI } from '../data/todolistData';
import { Issue, NewIssueFormState, Subtask, NewSubtaskFormState, Comment } from '../types/todolist';
import { commentService } from '../services/commentService';

export const useTodolistIssues = (projectId: number = 1) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load issues from API on mount
  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoading(true);
        const fetchedIssues = await fetchIssuesFromAPI(projectId);
        setIssues(fetchedIssues);
        setError(null);
      } catch (err) {
        console.error('Failed to load issues:', err);
        setError('Failed to load issues from server');
        // Fallback to empty array if API fails
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [projectId]);

  const getNextIssueKey = () => {
    const maxNum = Math.max(...issues.map(issue => parseInt(issue.key.split('-')[1])));
    return `PROJ-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const getNextSubtaskKey = (parentIssue: Issue) => {
    const maxSubtaskNum = parentIssue.subtasks.length > 0
      ? Math.max(...parentIssue.subtasks.map(subtask => parseInt(subtask.key.split('-')[2])))
      : 0;
    return `${parentIssue.key}-${maxSubtaskNum + 1}`;
  };

  const createIssue = async (newIssueData: NewIssueFormState) => {
    if (!newIssueData.summary.trim()) return;

    const assignedMember = teamMembers.find(member => member.id === newIssueData.assignee);
    const tempId = Date.now().toString();
    const issue: Issue = {
      id: tempId,
      key: getNextIssueKey(),
      summary: newIssueData.summary,
      description: newIssueData.description,
      issueType: newIssueData.issueType,
      priority: newIssueData.priority,
      assignee: assignedMember || null,
      reporter: teamMembers[0], // Current user
      status: 'To Do',
      storyPoints: parseInt(newIssueData.storyPoints) || 0,
      fixVersion: newIssueData.fixVersion,
      components: [newIssueData.components], // Convert string to array
      flagged: false,
      attachments: 0,
      comments: [], // Initialize as empty array
      subtasks: [],
      isExpanded: false,
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0]
    };

    setIssues([...issues, issue]);

    try {
      const realId = await createIssueAPI(issue);
      setIssues(prevIssues => prevIssues.map(i =>
        i.id === tempId ? { ...i, id: realId.toString() } : i
      ));
    } catch (error) {
      console.error('Failed to persist new issue:', error);
      // Optional: Revert state if needed
      setIssues(prevIssues => prevIssues.filter(i => i.id !== tempId));
    }
  };

  const createSubtask = async (parentIssueId: string, subtaskData: NewSubtaskFormState) => {
    if (!subtaskData.summary.trim()) return;

    const assignedMember = teamMembers.find(member => member.id === subtaskData.assignee);
    const tempId = `sub-${Date.now()}`;

    // Find parent issue to get the key
    const parentIssue = issues.find(i => i.id === parentIssueId);
    if (!parentIssue) return;

    const newSubtask: Subtask = {
      id: tempId,
      parentIssueId,
      key: getNextSubtaskKey(parentIssue),
      summary: subtaskData.summary,
      description: subtaskData.description,
      status: 'To Do',
      assignee: assignedMember || null,
      reporter: teamMembers[0], // Current user
      priority: subtaskData.priority,
      issueType: 'Sub-task',
      storyPoints: subtaskData.storyPoints ? parseInt(subtaskData.storyPoints) : undefined,
      comments: [],
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0]
    };

    setIssues(prevIssues =>
      prevIssues.map(issue => {
        if (issue.id === parentIssueId) {
          return {
            ...issue,
            subtasks: [...issue.subtasks, newSubtask],
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return issue;
      })
    );

    try {
      const realId = await createSubtaskAPI(parentIssueId, newSubtask);
      setIssues(prevIssues =>
        prevIssues.map(issue => {
          if (issue.id === parentIssueId) {
            return {
              ...issue,
              subtasks: issue.subtasks.map(s =>
                s.id === tempId ? { ...s, id: realId.toString() } : s
              )
            };
          }
          return issue;
        })
      );
    } catch (error) {
      console.error('Failed to persist new subtask:', error);
      setIssues(prevIssues =>
        prevIssues.map(issue => {
          if (issue.id === parentIssueId) {
            return {
              ...issue,
              subtasks: issue.subtasks.filter(s => s.id !== tempId)
            };
          }
          return issue;
        })
      );
    }
  };

  const updateSubtask = (subtaskId: string, updates: Partial<Subtask>) => {
    setIssues(prevIssues => {
      // Find the issue that contains this subtask
      const issue = prevIssues.find(i => i.subtasks.some(s => s.id === subtaskId));
      if (!issue) return prevIssues;

      const subtask = issue.subtasks.find(s => s.id === subtaskId)!;
      const updatedSubtask = { ...subtask, ...updates, updatedDate: new Date().toISOString() };

      // Persist to API with the full updated object
      updateSubtaskAPI(updatedSubtask).catch(err => {
        console.error('Failed to persist subtask update:', err);
      });

      return prevIssues.map(i => {
        if (i.id === issue.id) {
          return {
            ...i,
            subtasks: i.subtasks.map(s => s.id === subtaskId ? updatedSubtask : s),
            updatedDate: new Date().toISOString()
          };
        }
        return i;
      });
    });
  };

  const deleteSubtask = async (subtaskId: string) => {
    setIssues(prevIssues =>
      prevIssues.map(issue => ({
        ...issue,
        subtasks: issue.subtasks.filter(subtask => subtask.id !== subtaskId),
        updatedDate: issue.subtasks.some(s => s.id === subtaskId)
          ? new Date().toISOString().split('T')[0]
          : issue.updatedDate
      }))
    );

    try {
      await deleteSubtaskAPI(subtaskId);
    } catch (error) {
      console.error(`Failed to delete subtask ${subtaskId}:`, error);
      // Optional: Refresh issues to sync with server
    }
  };

  const updateIssue = (issueId: string, updates: Partial<Issue>) => {
    setIssues(prevIssues => {
      const issue = prevIssues.find(i => i.id === issueId);
      if (!issue) return prevIssues;

      const updatedIssue = { ...issue, ...updates, updatedDate: new Date().toISOString() };

      // Persist to API
      updateIssueAPI(updatedIssue).catch(err => {
        console.error('Failed to persist issue update:', err);
      });

      return prevIssues.map(i => i.id === issueId ? updatedIssue : i);
    });
  };

  const deleteIssue = async (issueId: string) => {
    setIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));

    try {
      await deleteIssueAPI(issueId);
    } catch (error) {
      console.error(`Failed to delete issue ${issueId}:`, error);
    }
  };

  const moveIssue = (issueId: string, newStatus: Issue['status']) => {
    updateIssue(issueId, { status: newStatus });
  };

  const fetchTaskComments = async (issueId: string) => {
    try {
      const { commentService } = await import('../services/commentService');
      const numericId = parseInt(issueId);
      if (isNaN(numericId)) return;

      const response = await commentService.getTaskComments(numericId);
      const transformedComments: Comment[] = response.map(c => ({
        id: c.commentId.toString(),
        author: teamMembers.find(m => m.name === c.createdBy) || teamMembers[0],
        text: c.commentText,
        createdDate: c.createdDate.split('T')[0]
      }));

      setIssues(prevIssues => prevIssues.map(issue =>
        issue.id === issueId ? { ...issue, comments: transformedComments } : issue
      ));
    } catch (error) {
      console.error('Failed to fetch task comments:', error);
    }
  };

  const fetchSubtaskComments = async (subtaskId: string) => {
    try {
      const { commentService } = await import('../services/commentService');
      const numericId = parseInt(subtaskId);
      if (isNaN(numericId)) return;

      const response = await commentService.getCommentsBySubtaskId(numericId);
      const transformedComments: Comment[] = response.map(c => ({
        id: c.subtaskCommentId.toString(),
        author: teamMembers.find(m => m.name === c.createdBy) || teamMembers[0],
        text: c.commentText,
        createdDate: c.createdDate.split('T')[0]
      }));

      setIssues(prevIssues => prevIssues.map(issue => {
        const subtask = issue.subtasks.find(s => s.id === subtaskId);
        if (subtask) {
          return {
            ...issue,
            subtasks: issue.subtasks.map(s =>
              s.id === subtaskId ? { ...s, comments: transformedComments } : s
            )
          };
        }
        return issue;
      }));
    } catch (error) {
      console.error('Failed to fetch subtask comments:', error);
    }
  };

  const toggleFlag = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      updateIssue(issueId, { flagged: !issue.flagged });
    }
  };

  const addComment = async (issueId: string, commentText: string) => {
    // Optimistic Update
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: teamMembers[0],
      text: commentText,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setIssues(prevIssues =>
      prevIssues.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            comments: [...issue.comments, newComment],
            updatedDate: new Date().toISOString().split('T')[0],
          };
        }
        return issue;
      })
    );

    try {
      await commentService.addTaskComment(
        parseInt(issueId),
        {
          commentText,
          createdBy: teamMembers[0].name,
        }
      );
    } catch (error) {
      console.error('Failed to add task comment:', error);
      // Revert if failed (optional: refresh issues)
    }
  };

  const addSubtaskComment = async (subtaskId: string, commentText: string) => {
    // Find the parent task ID for this subtask
    let parentTaskId: string | null = null;
    for (const issue of issues) {
      const subtask = issue.subtasks.find(s => s.id === subtaskId);
      if (subtask) {
        parentTaskId = issue.id;
        break;
      }
    }

    if (!parentTaskId) {
      console.error('Parent task not found for subtask:', subtaskId);
      return;
    }

    // Optimistic Update
    const newComment: Comment = {
      id: `subcomment-${Date.now()}`,
      author: teamMembers[0],
      text: commentText,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setIssues(prevIssues =>
      prevIssues.map(issue => {
        const subtaskIndex = issue.subtasks.findIndex(s => s.id === subtaskId);
        if (subtaskIndex !== -1) {
          const updatedSubtasks = issue.subtasks.map(s =>
            s.id === subtaskId
              ? { ...s, comments: [...s.comments, newComment], updatedDate: new Date().toISOString().split('T')[0] }
              : s
          );

          return {
            ...issue,
            subtasks: updatedSubtasks,
            updatedDate: new Date().toISOString().split('T')[0],
          };
        }
        return issue;
      })
    );

    try {
      await commentService.addSubtaskComment(
        parseInt(parentTaskId),
        parseInt(subtaskId),
        {
          commentText,
          createdBy: teamMembers[0].name,
        }
      );
    } catch (error) {
      console.error('Failed to add subtask comment:', error);
    }
  };

  const updateComment = async (issueId: string, commentId: string, text: string) => {
    // Optimistic Update
    setIssues(prevIssues =>
      prevIssues.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            comments: issue.comments.map(c => c.id === commentId ? { ...c, text } : c),
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return issue;
      })
    );

    try {
      const taskNumericId = parseInt(issueId);
      const commentNumericId = parseInt(commentId.replace('comment-', '').replace('subcomment-', ''));

      if (!isNaN(taskNumericId) && !isNaN(commentNumericId)) {
        await commentService.updateTaskComment(taskNumericId, commentNumericId, {
          commentText: text,
          updatedBy: teamMembers[0].name
        });
      }
    } catch (error) {
      console.error('Failed to update task comment:', error);
    }
  };

  const deleteComment = async (issueId: string, commentId: string) => {
    // Optimistic Update
    setIssues(prevIssues =>
      prevIssues.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            comments: issue.comments.filter(c => c.id !== commentId),
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return issue;
      })
    );

    try {
      const commentNumericId = parseInt(commentId.replace('comment-', '').replace('subcomment-', ''));

      if (!isNaN(commentNumericId)) {
        await commentService.deleteTaskComment(commentNumericId);
      }
    } catch (error) {
      console.error('Failed to delete task comment:', error);
    }
  };

  const updateSubtaskComment = async (subtaskId: string, commentId: string, text: string) => {
    let parentTaskId: string | null = null;
    for (const issue of issues) {
      if (issue.subtasks.find(s => s.id === subtaskId)) {
        parentTaskId = issue.id;
        break;
      }
    }

    if (!parentTaskId) return;

    // Optimistic Update
    setIssues(prevIssues =>
      prevIssues.map(issue => {
        if (issue.id === parentTaskId) {
          return {
            ...issue,
            subtasks: issue.subtasks.map(s =>
              s.id === subtaskId
                ? { ...s, comments: s.comments.map(c => c.id === commentId ? { ...c, text } : c) }
                : s
            ),
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return issue;
      })
    );

    try {
      const taskNumericId = parseInt(parentTaskId);
      const subtaskNumericId = parseInt(subtaskId);
      const commentNumericId = parseInt(commentId.replace('comment-', '').replace('subcomment-', ''));

      if (!isNaN(taskNumericId) && !isNaN(subtaskNumericId) && !isNaN(commentNumericId)) {
        await commentService.updateSubtaskComment(taskNumericId, subtaskNumericId, commentNumericId, {
          commentText: text,
          updatedBy: teamMembers[0].name
        });
      }
    } catch (error) {
      console.error('Failed to update subtask comment:', error);
    }
  };

  const deleteSubtaskComment = async (subtaskId: string, commentId: string) => {
    // Optimistic Update
    setIssues(prevIssues =>
      prevIssues.map(issue => {
        if (issue.subtasks.find(s => s.id === subtaskId)) {
          return {
            ...issue,
            subtasks: issue.subtasks.map(s =>
              s.id === subtaskId
                ? { ...s, comments: s.comments.filter(c => c.id !== commentId) }
                : s
            ),
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return issue;
      })
    );

    try {
      const commentNumericId = parseInt(commentId.replace('comment-', '').replace('subcomment-', ''));

      if (!isNaN(commentNumericId)) {
        await commentService.deleteSubtaskComment(commentNumericId);
      }
    } catch (error) {
      console.error('Failed to delete subtask comment:', error);
    }
  };

  return {
    issues,
    loading,
    error,
    createIssue,
    updateIssue,
    deleteIssue,
    moveIssue,
    toggleFlag,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    addComment,
    updateComment,
    deleteComment,
    fetchTaskComments,
    addSubtaskComment,
    updateSubtaskComment,
    deleteSubtaskComment,
    fetchSubtaskComments,
    teamMembers
  };
};
