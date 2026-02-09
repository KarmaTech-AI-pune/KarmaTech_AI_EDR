-- ----------------------------------------------------
-- Seed PMWorkflowStatuses per Tenant
-- ----------------------------------------------------

DO $$
DECLARE
v_tenant_id INT := {{TENANT_ID}};
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM "PMWorkflowStatuses"
        WHERE "TenantId" = v_tenant_id
        LIMIT 1
    ) THEN

        INSERT INTO "PMWorkflowStatuses" ("TenantId", "Status")
        VALUES
            (v_tenant_id, 'Initial'),
            (v_tenant_id, 'Sent for Review'),
            (v_tenant_id, 'Review Changes'),
            (v_tenant_id, 'Sent for Approval'),
            (v_tenant_id, 'Approval Changes'),
            (v_tenant_id, 'Approved');

        RAISE NOTICE
            'PMWorkflowStatuses data inserted successfully for TenantId = %',
            v_tenant_id;

ELSE
        RAISE NOTICE
            'PMWorkflowStatuses already exists for TenantId = %, skipping insert',
            v_tenant_id;
END IF;
END $$;
