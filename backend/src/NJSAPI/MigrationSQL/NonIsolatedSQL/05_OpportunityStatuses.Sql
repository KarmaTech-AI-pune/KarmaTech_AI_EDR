-- ----------------------------------------------------
-- Seed OpportunityStatuses per Tenant
-- ----------------------------------------------------

DO $$
DECLARE
v_tenant_id INT := 0;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM "OpportunityStatuses"
        WHERE "TenantId" = v_tenant_id
        LIMIT 1
    ) THEN

        INSERT INTO "OpportunityStatuses" ("TenantId", "Status")
        VALUES
            (v_tenant_id, 'Initial'),
            (v_tenant_id, 'Sent for Review'),
            (v_tenant_id, 'Review Changes'),
            (v_tenant_id, 'Sent for Approval'),
            (v_tenant_id, 'Approval Changes'),
            (v_tenant_id, 'Approved');

        RAISE NOTICE 'OpportunityStatuses data inserted successfully';

ELSE
        RAISE NOTICE 'OpportunityStatuses data already exists, skipping insert';
END IF;
END $$;
