import { useState } from 'react';
import { Issue } from '../types/todolist';

export const useModalState = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIssueDetail, setShowIssueDetail] = useState<Issue | null>(null);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);

  return {
    showCreateModal,
    setShowCreateModal,
    showIssueDetail,
    setShowIssueDetail,
    editingIssue,
    setEditingIssue,
  };
};
