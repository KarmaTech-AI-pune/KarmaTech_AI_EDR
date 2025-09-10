import { useState } from 'react';
import { initialIssues, teamMembers } from '../data/todolistData';
import { Issue, TeamMember, NewIssueFormState } from '../types/todolist';

export const useTodolistIssues = () => {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);

  const getNextIssueKey = () => {
    const maxNum = Math.max(...issues.map(issue => parseInt(issue.key.split('-')[1])));
    return `PROJ-${String(maxNum + 1).padStart(3, '0')}`;
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
      comments: 0,
      subtasks: 0,
      completedSubtasks: 0,
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0]
    };

    setIssues([...issues, issue]);
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

  return {
    issues,
    createIssue,
    updateIssue,
    deleteIssue,
    moveIssue,
    toggleFlag,
    teamMembers // Expose teamMembers for assignee selection
  };
};
