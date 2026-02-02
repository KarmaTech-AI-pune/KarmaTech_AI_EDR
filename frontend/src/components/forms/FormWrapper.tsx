import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ProjectHeaderWidget } from '../widgets/ProjectHeaderWidget';
import { Project } from '../../models/projectModel';
import { projectManagementAppContext } from '../../App';
import { projectApi } from '../../services/projectApi';
import { useProject } from '../../context/ProjectContext';

interface FormWrapperProps {
    children: React.ReactNode;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({ children }) => {
    const context = React.useContext(projectManagementAppContext);
    const { projectId } = useProject();
    const [project, setProject] = useState<Project | null>(context?.selectedProject as unknown as Project);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If context project is available, update local state and finish
        if (context?.selectedProject) {
            setProject(context.selectedProject as unknown as Project);
            return;
        }

        // If context project is missing but projectId exists in sessionStorage (via ProjectContext)
        const fetchProject = async () => {
            if (projectId && !project) {
                try {
                    setLoading(true);
                    const projectData = await projectApi.getById(projectId);
                    if (projectData) {
                        setProject(projectData as Project);
                        // Sync with global context for state consistency
                        context?.setSelectedProject(projectData);
                    }
                } catch (error) {
                    console.error("Error fetching project in FormWrapper:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProject();
    }, [projectId, context?.selectedProject, project, context]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {project && <ProjectHeaderWidget project={project} />}
            {children}
        </Box>
    );
};

