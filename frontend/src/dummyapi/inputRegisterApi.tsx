import { dummyInputRegister } from './database/dummyInputRegister';
import { InputRegisterRow} from '../models';
import { v4 as uuidv4 } from 'uuid';

// Mutable array to store input register entries
let inputRegisterData = [...dummyInputRegister];

// Create a new input register entry
export const createInputRegister = (data: Omit<InputRegisterRow, 'id'>): InputRegisterRow => {
  const newEntry = {
    ...data,
    id: uuidv4()
  };
  inputRegisterData.push(newEntry);
  return newEntry;
};

// Get all input register entries for a specific project
export const getInputRegisterByProject = (projectId: string): InputRegisterRow[] => {
  return inputRegisterData.filter(entry => entry.projectId === projectId);
};

// Get a specific input register entry by ID
export const getInputRegisterById = (id: string): InputRegisterRow | undefined => {
  return inputRegisterData.find(entry => entry.id === id);
};

// Update an input register entry
export const updateInputRegister = (id: string, data: Partial<InputRegisterRow>): InputRegisterRow | undefined => {
  const index = inputRegisterData.findIndex(entry => entry.id === id);
  if (index === -1) return undefined;

  inputRegisterData[index] = {
    ...inputRegisterData[index],
    ...data
  };

  return inputRegisterData[index];
};

// Delete an input register entry
export const deleteInputRegister = (id: string): boolean => {
  const initialLength = inputRegisterData.length;
  inputRegisterData = inputRegisterData.filter(entry => entry.id !== id);
  return initialLength > inputRegisterData.length;
};

// Delete all input register entries for a project
export const deleteInputRegisterByProject = (projectId: string): boolean => {
  const initialLength = inputRegisterData.length;
  inputRegisterData = inputRegisterData.filter(entry => entry.projectId !== projectId);
  return initialLength > inputRegisterData.length;
};
