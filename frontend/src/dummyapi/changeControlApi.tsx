import { ChangeControl } from '../models';
import { dummyChangeControl } from './database/dummyChangeControl';

// Mutable array to store change control data
let changeControlData = [...dummyChangeControl];

// Create
export const createChangeControl = (changeControl: Omit<ChangeControl, 'id'>): ChangeControl => {
    const newId = changeControlData.length > 0 ? Math.max(...changeControlData.map(cc => cc.id)) + 1 : 1;
    const newChangeControl = { ...changeControl, id: newId };
    changeControlData.push(newChangeControl);
    return newChangeControl;
};

// Read
export const getAllChangeControls = (): ChangeControl[] => {
    return [...changeControlData];
};

export const getChangeControlById = (id: number): ChangeControl | undefined => {
    return changeControlData.find(cc => cc.id === id);
};

export const getChangeControlsByProjectId = (projectId: number): ChangeControl[] => {
    return changeControlData.filter(cc => cc.projectId === projectId);
};

// Update
export const updateChangeControl = (id: number, updates: Partial<ChangeControl>): ChangeControl | undefined => {
    const index = changeControlData.findIndex(cc => cc.id === id);
    if (index === -1) return undefined;

    changeControlData[index] = { ...changeControlData[index], ...updates };
    return changeControlData[index];
};

// Delete
export const deleteChangeControl = (id: number): boolean => {
    const initialLength = changeControlData.length;
    changeControlData = changeControlData.filter(cc => cc.id !== id);
    return changeControlData.length !== initialLength;
};

// Reset (for testing purposes)
export const resetChangeControlData = () => {
    changeControlData = [...dummyChangeControl];
};
