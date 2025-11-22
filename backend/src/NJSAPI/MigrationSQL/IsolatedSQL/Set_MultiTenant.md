Great 👍 Here’s the **extended step-by-step checklist** including adding new tenants:

---

# Multi-Tenant Setup Guide

### **Step 1: Domain & DNS Setup**

1. Go to **GoDaddy DNS Management** for `karmatech-ai.com`.
2. Create **A records** pointing to your server:

   * `edradmin.karmatech-ai.com` → Admin portal
   * `tenant1.karmatech-ai.com` → Tenant 1 UI
   * `tenant2.karmatech-ai.com` → Tenant 2 UI
   * (Repeat for future tenants: `tenant3`, `tenant4`, etc.)
3. Verify DNS resolution with:

   ```bash
   nslookup edradmin.karmatech-ai.com
   nslookup tenant1.karmatech-ai.com
   nslookup tenant2.karmatech-ai.com
   ```

---

### **Step 2: Default Admin Tenant Setup**

1. The subdomain `edradmin.karmatech-ai.com` is reserved for **Admin Login**.
2. By default, this maps to **Tenant ID = 1** in the system.

---

### **Step 3: Database Record for Admin Tenant**

1. Our application uses **DomainMiddleware Resolver Strategy** to detect tenants based on the subdomain.
2. To enable this, add a record for **Tenant ID = 1** in the `TenantDatabases` SQL table.

SQL Example:

```sql
INSERT INTO TenantDatabases (TenantId, DatabaseName, ConnectionString, IsDeleted, CreatedOn)
VALUES 
(
    1,
    'KarmaTechAISAAS_EdrAdmin',
    'Data Source=SERVER2016;Initial Catalog=KarmaTechAISAAS_EdrAdmin;User ID=sa;Password=Admin@2024;Multiple Active Result Sets=True;Trust Server Certificate=True',
    0,
    GETDATE()
);
```

---

### **Step 4: Match Connection String with appsettings.json**

* Ensure that the connection string for **Tenant ID = 1** matches the entry in `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=SERVER2016;Initial Catalog=KarmaTechAISAAS_EdrAdmin;User ID=sa;Password=Admin@2024;Multiple Active Result Sets=True;Trust Server Certificate=True"
}
```

---

### **Step 5: Adding New Tenants (tenant2, tenant3, …)**

1. **DNS Setup**

   * Add a new **A record** in GoDaddy for the tenant:

     * `tenant2.karmatech-ai.com` → server IP
     * `tenant3.karmatech-ai.com` → server IP

2. **Database Creation**

    If we are unable to create database thru edradmin.karmatech-ai.com
	please follow step-by-step
   * Create a new database for the tenant:

     ```sql
     CREATE DATABASE KarmaTechAISAAS_Tenant2;
     ```
   * Run seeding for the new tenant. for that we have seeding SQL scripts please run one-by-one

3. **Add Tenant Record in SQL Table**

   * Insert a new record in the `TenantDatabases` table:

     ```sql
     INSERT INTO TenantDatabases (TenantId, DatabaseName, ConnectionString, IsDeleted, CreatedOn)
     VALUES 
     (
         2,
         'KarmaTechAISAAS_Tenant2',
         'Data Source=SERVER2016;Initial Catalog=KarmaTechAISAAS_Tenant2;User ID=sa;Password=Admin@2024;Multiple Active Result Sets=True;Trust Server Certificate=True',
         0,
         GETDATE()
     );
     ```

   * Repeat for each new tenant (`TenantId = 3`, `TenantId = 4`, etc.).

4. **Verify Resolution**

   * Visit:

     * `https://tenant2.karmatech-ai.com`
     * `https://tenant3.karmatech-ai.com`
   * Confirm that the middleware correctly resolves to the respective tenant database.

---

### **Step 6: Validation**

* Log in as Admin on `edradmin.karmatech-ai.com`.
* Ensure you can manage tenants and verify connections.
* Test tenant-specific UIs (`tenant1`, `tenant2`, …) to confirm each connects to its own DB.

---

✅ With this process, you can easily add new tenants just by:

1. Adding a DNS record
2. Creating a tenant database
3. Inserting a record in `TenantDatabases`

---
