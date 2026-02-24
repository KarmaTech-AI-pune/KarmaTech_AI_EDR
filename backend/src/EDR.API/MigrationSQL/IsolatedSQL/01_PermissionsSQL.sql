------- Please select traget DATABASE prior run this SQL script---- 
-------Explicitly we removed the Sys_ADMIN permission for Tenant 

INSERT INTO Permissions (Name, Description, Category) VALUES
-- Project Permissions
('VIEW_PROJECT', 'View project details', 'Project'),
('CREATE_PROJECT', 'Create new projects', 'Project'),
('EDIT_PROJECT', 'Edit existing projects', 'Project'),
('DELETE_PROJECT', 'Delete projects', 'Project'),
('REVIEW_PROJECT', 'Review project submissions', 'Project'),
('APPROVE_PROJECT', 'Approve projects', 'Project'),
('SUBMIT_PROJECT_FOR_REVIEW', 'Submit projects for review', 'Project'),
('SUBMIT_PROJECT_FOR_APPROVAL', 'Submit projects for approval', 'Project'),

-- Business Development Permissions
('VIEW_BUSINESS_DEVELOPMENT', 'View business development items', 'Business Development'),
('CREATE_BUSINESS_DEVELOPMENT', 'Create business development items', 'Business Development'),
('EDIT_BUSINESS_DEVELOPMENT', 'Edit business development items', 'Business Development'),
('DELETE_BUSINESS_DEVELOPMENT', 'Delete business development items', 'Business Development'),
('REVIEW_BUSINESS_DEVELOPMENT', 'Review business development items', 'Business Development'),
('APPROVE_BUSINESS_DEVELOPMENT', 'Approve business development items', 'Business Development'),
('SUBMIT_FOR_APPROVAL', 'Submit items for approval', 'Business Development'),

-- System Permissions
('Tenant_ADMIN', 'Full system administration access', 'System'),

-- Checker/Reviewer Permissions
('CHECKER', 'Only the checker', 'CheckerReviewer'),
('REVIEWER', 'Only  the Reviewer', 'CheckerReviewer');