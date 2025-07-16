import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface ProjectContextType {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode; projectId: string | null }> = ({ children, projectId: initialProjectId }) => {
  const [projectId, setProjectId] = useState<string | null>(initialProjectId);

  useEffect(() => {
    setProjectId(initialProjectId);
  }, [initialProjectId]);

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>
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
