import React from 'react';
import { Box } from '@mui/material';
import { useTodolistIssues } from '../../../hooks/useTodolistIssues';
import { useIssueFiltering } from '../../../hooks/useIssueFiltering';
import { useModalState } from '../../../hooks/useModalState';
import { useDragAndDrop } from '../../../hooks/useDragAndDrop';
import { TodolistHeader } from '../../../components/todolist/TodolistHeader';
import { TodolistColumn } from '../../../components/todolist/TodolistColumn';
import { CreateIssueModal } from '../../../components/todolist/modals/CreateIssueModal';
import { IssueDetailModal } from '../../../components/todolist/modals/IssueDetailModal';
import { Issue } from '../../../types/todolist';

export default function TodoList() {
  const {
    issues,
    createIssue,
    updateIssue,
    deleteIssue,
    moveIssue,
    toggleFlag,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    addComment, // Destructure new function
    teamMembers,
  } = useTodolistIssues();

  const {
    searchTerm,
    setSearchTerm,
    quickFilters,
    setQuickFilters,
    filteredIssues,
  } = useIssueFiltering(issues);

  const {
    showCreateModal,
    setShowCreateModal,
    showIssueDetail,
    setShowIssueDetail,
    setEditingIssue,
  } = useModalState();

  const {
    handleDrop,
  } = useDragAndDrop(moveIssue);

  const columns = [
    { id: 'To Do', title: 'TO DO', color: '#DFE1E6', issues: filteredIssues.filter(i => i.status === 'To Do') },
    { id: 'In Progress', title: 'IN PROGRESS', color: '#0065FF', issues: filteredIssues.filter(i => i.status === 'In Progress') },
    { id: 'Review', title: 'REVIEW', color: '#FF991F', issues: filteredIssues.filter(i => i.status === 'Review') },
    { id: 'Done', title: 'DONE', color: '#36B37E', issues: filteredIssues.filter(i => i.status === 'Done') }
  ];

  const [newIssueFormState, setNewIssueFormState] = React.useState({
    summary: '',
    description: '',
    issueType: 'Story' as Issue['issueType'],
    priority: 'Medium' as Issue['priority'],
    assignee: '',
    labels: '',
    storyPoints: '',
    components: 'UI',
    fixVersion: 'Version 1.0',
  });

  const handleCreateIssue = () => {
    createIssue(newIssueFormState);
    setNewIssueFormState({
      summary: '',
      description: '',
      issueType: 'Story',
      priority: 'Medium',
      assignee: '',
      labels: '',
      storyPoints: '',
      components: 'UI',
      fixVersion: 'Version 1.0',
    });
    setShowCreateModal(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white' }}>
      <TodolistHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        quickFilters={quickFilters}
        setQuickFilters={(filters) => setQuickFilters(filters)}
        setShowCreateModal={setShowCreateModal}
      />

      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {columns.map((column) => (
            <TodolistColumn
              key={column.id}
              id={column.id as Issue['status']}
              title={column.title}
              color={column.color}
              issues={column.issues}
              onIssueClick={setShowIssueDetail}
              onToggleFlag={toggleFlag}
              onDrop={handleDrop}
              setShowCreateModal={setShowCreateModal}
            />
          ))}
        </Box>
      </Box>

      <CreateIssueModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        newIssue={newIssueFormState}
        setNewIssue={setNewIssueFormState}
        createIssue={handleCreateIssue}
        teamMembers={teamMembers}
      />

      <IssueDetailModal
        showIssueDetail={showIssueDetail}
        setShowIssueDetail={setShowIssueDetail}
        setEditingIssue={setEditingIssue}
        onDeleteIssue={deleteIssue}
        onToggleFlag={toggleFlag}
        onUpdateIssue={updateIssue}
        onCreateSubtask={createSubtask}
        onUpdateSubtask={updateSubtask}
        onDeleteSubtask={deleteSubtask}
        onAddComment={addComment} // Pass the new function
        teamMembers={teamMembers}
      />

    </Box>
  );
}
