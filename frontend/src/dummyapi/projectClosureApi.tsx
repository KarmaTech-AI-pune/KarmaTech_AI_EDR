import { dummyProjectClosures, dummyProjectClosureComments,} from './database/dummyProjectClosure';
import { ProjectClosureRow, ProjectClosureComment } from "../models";
import { v4 as uuidv4 } from 'uuid';

// Mutable arrays to store project closure data
let projectClosures = [...dummyProjectClosures];
let projectClosureComments = [...dummyProjectClosureComments];

// Type for project closure with its comments
interface ProjectClosureWithComments extends ProjectClosureRow {
    comments: ProjectClosureComment[];
}

// Project Closure Operations
export const getAllProjectClosures = (): ProjectClosureWithComments[] => {
    return projectClosures.map(closure => ({
        ...closure,
        comments: projectClosureComments.filter(comment => comment.projectId === closure.projectId)
    }));
};

export const getProjectClosureById = (projectId: string): ProjectClosureWithComments | undefined => {
    const closure = projectClosures.find(closure => closure.projectId === projectId);
    if (!closure) return undefined;

    return {
        ...closure,
        comments: projectClosureComments.filter(comment => comment.projectId === projectId)
    };
};

export const createProjectClosure = (closure: ProjectClosureRow, comments: Omit<ProjectClosureComment, 'id'>[] = []) => {
    if (projectClosures.some(pc => pc.projectId === closure.projectId)) {
        throw new Error('Project closure already exists for this project');
    }
    projectClosures.push(closure);
    
    // Add comments with generated IDs
    const commentsWithIds = comments.map(comment => ({
        ...comment,
        id: uuidv4()
    }));
    
    if (commentsWithIds.length > 0) {
        projectClosureComments.push(...commentsWithIds);
    }
    
    return getProjectClosureById(closure.projectId);
};

export const updateProjectClosure = (
    projectId: string, 
    updates: Partial<ProjectClosureRow>,
    newComments: ProjectClosureComment[]
) => {
    const index = projectClosures.findIndex(closure => closure.projectId === projectId);
    if (index === -1) {
        throw new Error('Project closure not found');
    }

    // Update project closure
    projectClosures[index] = { ...projectClosures[index], ...updates };

    // Replace all comments for this project with the new set
    projectClosureComments = [
        ...projectClosureComments.filter(comment => comment.projectId !== projectId),
        ...newComments
    ];

    return getProjectClosureById(projectId);
};

export const deleteProjectClosure = (projectId: string) => {
    const index = projectClosures.findIndex(closure => closure.projectId === projectId);
    if (index === -1) {
        throw new Error('Project closure not found');
    }
    
    // Delete project closure and all associated comments
    projectClosures.splice(index, 1);
    projectClosureComments = projectClosureComments.filter(comment => comment.projectId !== projectId);
};
