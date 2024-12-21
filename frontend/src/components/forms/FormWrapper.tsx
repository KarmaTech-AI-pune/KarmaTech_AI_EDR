import React from 'react';
import { Box } from '@mui/material';
import { ProjectHeaderWidget } from '../widgets/ProjectHeaderWidget';
import { Project } from '../../models/projectModel';
import { projectManagementAppContext } from '../../App';

interface FormWrapperProps {
    children: React.ReactNode;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({ children }) => {
    const context = React.useContext(projectManagementAppContext);
    const project = context?.selectedProject as Project;

    if (!project) {
        return <>{children}</>;
    }

    return (
        <Box>
            <ProjectHeaderWidget project={project} />
            {children}
        </Box>
    );
};
