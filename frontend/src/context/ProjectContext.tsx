import { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface ProjectContextType {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  programId: string | null;
  setProgramId: (id: string | null) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectId, setProjectId] = useState<string | null>(() => {
    return sessionStorage.getItem('projectId');
  });

  const [programId, setProgramId] = useState<string | null>(() => {
    return sessionStorage.getItem('programId');
  });

  useEffect(() => {
    if (projectId) {
      sessionStorage.setItem('projectId', projectId);
    } else {
      sessionStorage.removeItem('projectId');
    }
  }, [projectId]);

  useEffect(() => {
    if (programId) {
      sessionStorage.setItem('programId', programId);
    } else {
      sessionStorage.removeItem('programId');
    }
  }, [programId]);

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId, programId, setProgramId }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
