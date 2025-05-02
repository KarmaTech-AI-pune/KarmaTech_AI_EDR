import { ChangeControl } from '../models';
import { dummyChangeControl } from './database/dummyChangeControl';

// Mutable array to store change control data
let changeControlData = [...dummyChangeControl];

// Create
export const createChangeControl = (changeControl: Omit<ChangeControl, 'id'>): ChangeControl => {
    const newId = (changeControlData.length > 0 
        ? Math.max(...changeControlData.map(cc => parseInt(cc.id.toString()))) + 1 
        : 1);
    const newChangeControl = { ...changeControl, id: newId };
    changeControlData.push(newChangeControl);
    return newChangeControl;
};

// Read
export const getAllChangeControls = (): ChangeControl[] => {
    return [...changeControlData];
};

export const getChangeControlById = (id: string): ChangeControl | undefined => {
    return changeControlData.find(cc => cc.id.toString() === id);
};

export const getChangeControlsByProjectId = (projectId: string): ChangeControl[] => {
    return changeControlData.filter(cc => cc.projectId.toString() === projectId);
};

// Update
export const updateChangeControl = (id: string, updates: Partial<ChangeControl>): ChangeControl | undefined => {
    const index = changeControlData.findIndex(cc => cc.id.toString() === id);
    if (index === -1) return undefined;

    changeControlData[index] = { ...changeControlData[index], ...updates };
    return changeControlData[index];
};

// Delete
export const deleteChangeControl = (id: string): boolean => {
    const initialLength = changeControlData.length;
    changeControlData = changeControlData.filter(cc => cc.id.toString() !== id);
    return changeControlData.length !== initialLength;
};

// Reset (for testing purposes)
export const resetChangeControlData = () => {
    changeControlData = [...dummyChangeControl];
};
