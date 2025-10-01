import { useState, useRef } from 'react';
import { Issue } from '../types/todolist';

export const useDragAndDrop = (onDropIssue: (issueId: string, newStatus: Issue['status']) => void) => {
  const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, issue: Issue) => {
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIssue(null);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current++;
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    dragCounter.current--;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: Issue['status']) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (draggedIssue && draggedIssue.status !== status) {
      onDropIssue(draggedIssue.id, status);
    }
  };

  return {
    draggedIssue,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
};
