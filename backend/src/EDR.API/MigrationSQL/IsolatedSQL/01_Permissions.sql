-- 1️ Check & create unique index if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = 'Permissions'
          AND indexname = 'ux_permissions_name'
    ) THEN
CREATE UNIQUE INDEX ux_permissions_name
    ON "Permissions" ("Name");
END IF;
END$$;

-- 2️ Insert global permissions safely
INSERT INTO "Permissions" ("Name", "Description", "Category")
VALUES
    ('VIEW_PROJECT', 'View project details', 'Project'),
    ('CREATE_PROJECT', 'Create new projects', 'Project'),
    ('EDIT_PROJECT', 'Edit existing projects', 'Project'),
    ('DELETE_PROJECT', 'Delete projects', 'Project'),
    ('REVIEW_PROJECT', 'Review project submissions', 'Project'),
    ('APPROVE_PROJECT', 'Approve projects', 'Project'),
    ('SUBMIT_PROJECT_FOR_REVIEW', 'Submit projects for review', 'Project'),
    ('SUBMIT_PROJECT_FOR_APPROVAL', 'Submit projects for approval', 'Project'),
    ('VIEW_BUSINESS_DEVELOPMENT', 'View business development items', 'Business Development'),
    ('CREATE_BUSINESS_DEVELOPMENT', 'Create business development items', 'Business Development'),
    ('EDIT_BUSINESS_DEVELOPMENT', 'Edit business development items', 'Business Development'),
    ('DELETE_BUSINESS_DEVELOPMENT', 'Delete business development items', 'Business Development'),
    ('REVIEW_BUSINESS_DEVELOPMENT', 'Review business development items', 'Business Development'),
    ('APPROVE_BUSINESS_DEVELOPMENT', 'Approve business development items', 'Business Development'),
    ('SUBMIT_FOR_APPROVAL', 'Submit items for approval', 'Business Development'),
    ('Tenant_ADMIN', 'Full system administration access', 'System'),
    ('CHECKER', 'Only the checker', 'CheckerReviewer'),
    ('REVIEWER', 'Only the Reviewer', 'CheckerReviewer')
    ON CONFLICT ("Name") DO NOTHING;
