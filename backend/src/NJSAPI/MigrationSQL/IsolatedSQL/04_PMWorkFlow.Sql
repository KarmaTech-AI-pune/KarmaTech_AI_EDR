-- ----------------------------------------------------
-- Seed PMWorkflowStatuses (only if table is empty)
-- ----------------------------------------------------

DO $$
DECLARE
v_tenant_id INT := {{TENANT_ID}};
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "PMWorkflowStatuses" LIMIT 1) THEN

        INSERT INTO "PMWorkflowStatuses" ("Id", "TenantId", "Status")
        VALUES
            (1, v_tenant_id, 'Initial'),
            (2, v_tenant_id, 'Sent for Review'),
            (3, v_tenant_id, 'Review Changes'),
            (4, v_tenant_id, 'Sent for Approval'),
            (5, v_tenant_id, 'Approval Changes'),
            (6, v_tenant_id, 'Approved');

        RAISE NOTICE 'PMWorkflowStatuses data inserted successfully';

ELSE
        RAISE NOTICE 'PMWorkflowStatuses data already exists, skipping insert';
END IF;
END $$;
