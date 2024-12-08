import { InwardRow, OutwardRow, dummyInwardRows, dummyOutwardRows } from './database/dummyCorrespondence';
import { v4 as uuidv4 } from 'uuid';

// Inward Correspondence CRUD operations
export const createInwardRow = (data: Omit<InwardRow, 'id'>): InwardRow => {
    const newRow: InwardRow = {
        ...data,
        id: uuidv4()
    };
    dummyInwardRows.push(newRow);
    return newRow;
};

export const getInwardRows = (projectId: string): InwardRow[] => {
    return dummyInwardRows.filter(row => row.projectId === projectId);
};

export const updateInwardRow = (id: string, data: Partial<InwardRow>): InwardRow | null => {
    const index = dummyInwardRows.findIndex(row => row.id === id);
    if (index === -1) return null;

    const updatedRow = {
        ...dummyInwardRows[index],
        ...data
    };
    dummyInwardRows[index] = updatedRow;
    return updatedRow;
};

export const deleteInwardRow = (id: string): boolean => {
    const index = dummyInwardRows.findIndex(row => row.id === id);
    if (index === -1) return false;

    dummyInwardRows.splice(index, 1);
    return true;
};

// Outward Correspondence CRUD operations
export const createOutwardRow = (data: Omit<OutwardRow, 'id'>): OutwardRow => {
    const newRow: OutwardRow = {
        ...data,
        id: uuidv4()
    };
    dummyOutwardRows.push(newRow);
    return newRow;
};

export const getOutwardRows = (projectId: string): OutwardRow[] => {
    return dummyOutwardRows.filter(row => row.projectId === projectId);
};

export const updateOutwardRow = (id: string, data: Partial<OutwardRow>): OutwardRow | null => {
    const index = dummyOutwardRows.findIndex(row => row.id === id);
    if (index === -1) return null;

    const updatedRow = {
        ...dummyOutwardRows[index],
        ...data
    };
    dummyOutwardRows[index] = updatedRow;
    return updatedRow;
};

export const deleteOutwardRow = (id: string): boolean => {
    const index = dummyOutwardRows.findIndex(row => row.id === id);
    if (index === -1) return false;

    dummyOutwardRows.splice(index, 1);
    return true;
};
