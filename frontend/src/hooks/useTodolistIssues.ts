import { useState, useEffect } from 'react';
import { fetchIssuesForSprintAPI, teamMembers, updateIssueAPI, updateSubtaskAPI, createIssueAPI, deleteIssueAPI, createSubtaskAPI, deleteSubtaskAPI, SprintEmployee, SprintPlanDto, fetchActiveSprintIdAPI, updateSprintPlanAPI, fetchNextSprintAPI } from '../data/todolistData';
import { Issue, NewIssueFormState, Subtask, NewSubtaskFormState, Comment, TeamMember } from '../types/todolist';
import { commentService } from '../services/commentService';
import { useProject } from '../context/ProjectContext';

export const useTodolistIssues = () => {
  const { projectId: contextProjectId } = useProject();
  const projectId = contextProjectId ? parseInt(contextProjectId) : null;

  const [sprintId, setSprintId] = useState<number | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [sprintPlan, setSprintPlan] = useState<SprintPlanDto | null>(null);
  const [sprintEmployees, setSprintEmployees] = useState<SprintEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Watch projectId change (RESET & FETCH ACTIVE SPRINT)
  useEffect(() => {
    const fetchSprintId = async () => {
      if (!projectId) {
        setSprintId(null);
        setIssues([]);
        setSprintPlan(null);
        setSprintEmployees([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Reset state immediately to prevent mixing
        setIssues([]);
        setSprintPlan(null);
        setSprintEmployees([]);
        setError(null);

        const activeId = await fetchActiveSprintIdAPI(projectId);
        setSprintId(activeId);

        if (!activeId) {
          setLoading(false); // If no sprint, stop loading (empty state)
        }
      } catch (err) {
        console.error('Failed to fetch active sprint:', err);
        setError('Failed to load project schedule');
        setLoading(false);
      }
    };

    fetchSprintId();
  }, [projectId]);

  // 2. Load Sprint Data when sprintId changes
  useEffect(() => {
    const loadIssues = async () => {
      if (!sprintId) return;

      try {
        setLoading(true);
        // Pass projectId for validation to prevent sprint mixing across projects
        const data = await fetchIssuesForSprintAPI(sprintId, projectId || undefined);

        setIssues(data.issues);
        setSprintPlan(data.sprintPlan);
        setSprintEmployees(data.sprintEmployees);
        setError(null);
      } catch (err) {
        console.error('Failed to load issues:', err);
        setError('Failed to load issues from server');
        setIssues([]);
        setSprintPlan(null);
        setSprintEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    loadIssues();
  }, [sprintId, projectId]);  // Add projectId to dependencies for proper re-fetching

  const getNextIssueKey = () => {
    if (!issues || issues.length === 0) return 'PROJ-001';

    const numericIndices = issues
      .map(issue => {
        const parts = issue.key.split('-');
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart);
      })
      .filter(num => !isNaN(num));

    const maxNum = numericIndices.length > 0 ? Math.max(...numericIndices) : 0;
    return `PROJ-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const getNextSubtaskKey = (parentIssue: Issue) => {
    if (!parentIssue.subtasks || parentIssue.subtasks.length === 0) {
      return `${parentIssue.key}-1`;
    }

    const numericIndices = parentIssue.subtasks
      .map(subtask => {
        const parts = subtask.key.split('-');
        const lastPart = parts[parts.length - 1];
        return parseInt(lastPart);
      })
      .filter(num => !isNaN(num));

    const maxSubtaskNum = numericIndices.length > 0 ? Math.max(...numericIndices) : 0;
    return `${parentIssue.key}-${maxSubtaskNum + 1}`;
  };

  const createIssue = async (newIssueData: NewIssueFormState) => {
    if (!newIssueData.summary.trim()) return;

    if (!sprintId) {
      console.error("No active sprint selected");
      setError("Cannot create task: No active sprint selected");
      return;
    }

    const assignedMember = newIssueData.assignee ? {
      name: newIssueData.assignee,
      id: newIssueData.assignee,
      avatar: (newIssueData.assignee.match(/\b\w/g) || []).join('').substring(0, 2).toUpperCase() || newIssueData.assignee.substring(0, 2).toUpperCase()
    } : null;

    const reporterMember: TeamMember = {
      name: 'Current User',
      id: 'current-user',
      avatar: 'CU'
    };

    const tempId = Date.now().toString();
    const issue: Issue = {
      id: tempId,
      key: getNextIssueKey(),
      summary: newIssueData.summary,
      description: newIssueData.description,
      issueType: newIssueData.issueType,
      priority: newIssueData.priority,
      assignee: assignedMember || null,
      reporter: reporterMember,
      status: 'To Do',
      storyPoints: parseInt(newIssueData.storyPoints) || 0,
      estimatedHours: parseInt(newIssueData.estimatedHours) || 0,
      remainingHours: parseInt(newIssueData.remainingHours) || 0,
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
      console.log('Creating task with payload:', { issue, sprintId });
      const realId = await createIssueAPI(issue, sprintId);
      console.log('Task created successfully. Real ID:', realId);

      if (!realId) {
        throw new Error("Backend did not return a valid task ID");
      }

      setIssues(prevIssues => prevIssues.map(i =>
        i.id === tempId ? { ...i, id: realId.toString() } : i
      ));
    } catch (error: any) {
      console.error('Failed to persist new issue:', error);
      setError(`Failed to create task: ${error.message || 'Server error'}`);
      // Revert optimistic update
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
            isExpanded: true,
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return issue;
      })
    );

    try {
      console.log('Creating subtask with payload:', { parentIssueId, newSubtask });
      const realId = await createSubtaskAPI(parentIssueId, newSubtask);
      console.log('Subtask created successfully. Real ID:', realId);

      if (!realId) {
        throw new Error("Backend did not return a valid subtask ID");
      }

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
    } catch (error: any) {
      console.error('Failed to persist new subtask:', error);
      setError(`Failed to create subtask: ${error.message || 'Server error'}`);
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

      // Auto-zero remaining hours if status is Done
      if (updates.status === 'Done') {
        updatedIssue.remainingHours = 0;
      }

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

      // Find parent task to get ID
      const parentIssue = issues.find(i => i.subtasks.some(s => s.id === subtaskId));
      if (!parentIssue) {
        console.error('Parent task not found for subtask:', subtaskId);
        return;
      }
      const taskId = parseInt(parentIssue.id);
      if (isNaN(taskId)) return;

      const response = await commentService.getCommentsBySubtaskId(taskId, numericId);
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
    // Resolve the assignee of the task to use as the comment author
    const issue = issues.find(i => i.id === issueId);
    const assignee = issue?.assignee
      ? { id: issue.assignee.id, name: issue.assignee.name, avatar: issue.assignee.avatar }
      : teamMembers[0];

    // Optimistic Update
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: assignee,
      text: commentText,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setIssues(prevIssues =>
      prevIssues.map(i => {
        if (i.id === issueId) {
          return {
            ...i,
            comments: [...i.comments, newComment],
            updatedDate: new Date().toISOString().split('T')[0],
          };
        }
        return i;
      })
    );

    try {
      await commentService.addTaskComment(
        parseInt(issueId),
        {
          commentText,
          createdBy: assignee.name,
        }
      );
    } catch (error) {
      console.error('Failed to add task comment:', error);
      // Revert if failed (optional: refresh issues)
    }
  };

  const addSubtaskComment = async (subtaskId: string, commentText: string) => {
    // Find the parent task and the subtask itself
    let parentTaskId: string | null = null;
    let subtaskAssignee = teamMembers[0]; // default fallback

    for (const issue of issues) {
      const subtask = issue.subtasks.find(s => s.id === subtaskId);
      if (subtask) {
        parentTaskId = issue.id;
        // Use the subtask's assignee if set, otherwise fall back to teamMembers[0]
        if (subtask.assignee) {
          subtaskAssignee = {
            id: subtask.assignee.id,
            name: subtask.assignee.name,
            avatar: subtask.assignee.avatar,
          };
        }
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
      author: subtaskAssignee,
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
          createdBy: subtaskAssignee.name,
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

  const completeSprint = async () => {
    if (!sprintPlan || !projectId) {
      console.warn("Cannot complete sprint: No active sprint or project context");
      return;
    }

    try {
      setLoading(true);

      // 1. Clear Sprint UI State immediately as requested
      setIssues([]);
      setSprintPlan(null);
      setSprintEmployees([]);
      setError(null);

      // 2. Mark current sprint as completed (Status 2)
      await updateSprintPlanAPI({
        ...sprintPlan,
        status: 1, // 1 = Completed
        completedAt: new Date().toISOString()
      });

      // 3. Load Next Sprint for Same Project
      const nextSprint = await fetchNextSprintAPI(projectId, sprintPlan.sprintId);

      if (!nextSprint) {
        setLoading(false);
        window.alert("This project has no other sprint");
        setSprintId(null);
        return;
      }

      // 4. Next sprint exists -> Load it
      setSprintId(nextSprint.sprintId);

    } catch (err: any) {
      console.error('Failed to complete sprint:', err);
      setLoading(false);
      window.alert("Failed to complete sprint or load next sprint.");
    }
  };

  return {
    sprintId,
    sprintPlan,
    sprintEmployees,
    completeSprint,
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
    teamMembers,
    navigateToSprint: setSprintId // Expose setter to allow manual navigation
  };
};
