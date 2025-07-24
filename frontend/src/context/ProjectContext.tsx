import { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface ProjectContextType {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projectId, setProjectId] = useState<string | null>(() => {
    return sessionStorage.getItem('projectId');
  });

  useEffect(() => {
    if (projectId) {
      sessionStorage.setItem('projectId', projectId);
    } else {
      sessionStorage.removeItem('projectId');
    }
  }, [projectId]);

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  console.log("nani id", context)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
