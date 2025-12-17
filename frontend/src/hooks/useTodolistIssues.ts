import { useState, useEffect } from 'react';
import { fetchIssuesFromAPI, teamMembers } from '../data/todolistData';
import { Issue, NewIssueFormState, Subtask, NewSubtaskFormState, Comment } from '../types/todolist'; // Added Comment

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

  const createIssue = (newIssueData: NewIssueFormState) => {
    if (!newIssueData.summary.trim()) return;

    const assignedMember = teamMembers.find(member => member.id === newIssueData.assignee);
    const issue: Issue = {
      id: Date.now().toString(),
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
  };

  const createSubtask = (parentIssueId: string, subtaskData: NewSubtaskFormState) => {
    if (!subtaskData.summary.trim()) return;

    setIssues(prevIssues => 
      prevIssues.map(issue => {
        if (issue.id === parentIssueId) {
          const assignedMember = teamMembers.find(member => member.id === subtaskData.assignee);
          const newSubtask: Subtask = {
            id: `sub-${Date.now()}`,
            parentIssueId,
            key: getNextSubtaskKey(issue),
            summary: subtaskData.summary,
            description: subtaskData.description,
            status: 'To Do',
            assignee: assignedMember || null,
            reporter: teamMembers[0], // Current user
            priority: subtaskData.priority,
            issueType: 'Sub-task',
            storyPoints: subtaskData.storyPoints ? parseInt(subtaskData.storyPoints) : undefined,
            createdDate: new Date().toISOString().split('T')[0],
            updatedDate: new Date().toISOString().split('T')[0]
          };

          return {
            ...issue,
            subtasks: [...issue.subtasks, newSubtask],
            updatedDate: new Date().toISOString().split('T')[0]
          };
        }
        return issue;
      })
    );
  };

  const updateSubtask = (subtaskId: string, updates: Partial<Subtask>) => {
    setIssues(prevIssues =>
      prevIssues.map(issue => ({
        ...issue,
        subtasks: issue.subtasks.map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, ...updates, updatedDate: new Date().toISOString().split('T')[0] }
            : subtask
        ),
        updatedDate: issue.subtasks.some(s => s.id === subtaskId) 
          ? new Date().toISOString().split('T')[0] 
          : issue.updatedDate
      }))
    );
  };

  const deleteSubtask = (subtaskId: string) => {
    setIssues(prevIssues =>
      prevIssues.map(issue => ({
        ...issue,
        subtasks: issue.subtasks.filter(subtask => subtask.id !== subtaskId),
        updatedDate: issue.subtasks.some(s => s.id === subtaskId)
          ? new Date().toISOString().split('T')[0]
          : issue.updatedDate
      }))
    );
  };

  const updateIssue = (issueId: string, updates: Partial<Issue>) => {
    setIssues(issues.map(issue => 
      issue.id === issueId 
        ? { ...issue, ...updates, updatedDate: new Date().toISOString().split('T')[0] }
        : issue
    ));
  };

  const deleteIssue = (issueId: string) => {
    setIssues(issues.filter(issue => issue.id !== issueId));
  };

  const moveIssue = (issueId: string, newStatus: Issue['status']) => {
    updateIssue(issueId, { status: newStatus });
  };

  const toggleFlag = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      updateIssue(issueId, { flagged: !issue.flagged });
    }
  };

  const addComment = (issueId: string, commentText: string) => {
    setIssues(prevIssues =>
      prevIssues.map(issue => {
        if (issue.id === issueId) {
          const newComment: Comment = {
            id: `comment-${Date.now()}`,
            author: teamMembers[0], // Assuming current user is the first team member
            text: commentText,
            createdDate: new Date().toISOString().split('T')[0],
          };
          return {
            ...issue,
            comments: [...issue.comments, newComment],
            updatedDate: new Date().toISOString().split('T')[0],
          };
        }
        return issue;
      })
    );
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
    addComment, // Expose addComment
    teamMembers // Expose teamMembers for assignee selection
  };
};
