-- Add SaaS Tables to Existing Database
-- This script adds the new SaaS multi-tenant tables to the existing database

-- 0. Create Permissions table (if missing)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Permissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Permissions](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](100) NOT NULL,
        [Description] [nvarchar](500) NULL,
        [Category] [nvarchar](100) NULL,
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Permissions] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END

-- 0.1. Create RolePermissions table (if missing)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RolePermissions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[RolePermissions](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [RoleId] [nvarchar](450) NOT NULL,
        [PermissionId] [int] NOT NULL,
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_RolePermissions] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END

-- 1. Create SubscriptionPlans table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPlans]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SubscriptionPlans](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](100) NOT NULL,
        [Description] [nvarchar](500) NULL,
        [Price] [decimal](18,2) NOT NULL,
        [BillingCycle] [int] NOT NULL,
        [MaxUsers] [int] NOT NULL,
        [MaxProjects] [int] NOT NULL,
        [FeaturesJson] [nvarchar](max) NULL,
        [StripeProductId] [nvarchar](100) NULL,
        [StripePriceId] [nvarchar](100) NULL,
        [IsActive] [bit] NOT NULL DEFAULT 1,
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_SubscriptionPlans] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END

-- 2. Create Tenants table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Tenants]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Tenants](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Subdomain] [nvarchar](100) NOT NULL,
        [CompanyName] [nvarchar](200) NOT NULL,
        [ContactPerson] [nvarchar](100) NULL,
        [Email] [nvarchar](100) NOT NULL,
        [Phone] [nvarchar](20) NULL,
        [Address] [nvarchar](500) NULL,
        [City] [nvarchar](100) NULL,
        [State] [nvarchar](100) NULL,
        [Country] [nvarchar](100) NULL,
        [PostalCode] [nvarchar](20) NULL,
        [Status] [int] NOT NULL DEFAULT 0,
        [SubscriptionPlanId] [int] NULL,
        [StripeCustomerId] [nvarchar](100) NULL,
        [StripeSubscriptionId] [nvarchar](100) NULL,
        [CurrentPeriodStart] [datetime2](7) NULL,
        [CurrentPeriodEnd] [datetime2](7) NULL,
        [MaxUsers] [int] NOT NULL DEFAULT 10,
        [MaxProjects] [int] NOT NULL DEFAULT 5,
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Tenants] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END

-- 3. Create TenantDatabases table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TenantDatabases]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TenantDatabases](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [TenantId] [int] NOT NULL,
        [DatabaseName] [nvarchar](100) NOT NULL,
        [ConnectionString] [nvarchar](500) NULL,
        [Status] [int] NOT NULL DEFAULT 0,
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_TenantDatabases] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END

-- 4. Create TenantUsers table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TenantUsers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TenantUsers](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [TenantId] [int] NOT NULL,
        [UserId] [nvarchar](450) NOT NULL,
        [Role] [int] NOT NULL DEFAULT 0,
        [IsActive] [bit] NOT NULL DEFAULT 1,
        [CreatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_TenantUsers] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END

-- 5. Add Foreign Key Constraints
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_RolePermissions_AspNetRoles_RoleId]') AND parent_object_id = OBJECT_ID(N'[dbo].[RolePermissions]'))
BEGIN
    ALTER TABLE [dbo].[RolePermissions] WITH CHECK ADD CONSTRAINT [FK_RolePermissions_AspNetRoles_RoleId] 
    FOREIGN KEY([RoleId]) REFERENCES [dbo].[AspNetRoles] ([Id])
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_RolePermissions_Permissions_PermissionId]') AND parent_object_id = OBJECT_ID(N'[dbo].[RolePermissions]'))
BEGIN
    ALTER TABLE [dbo].[RolePermissions] WITH CHECK ADD CONSTRAINT [FK_RolePermissions_Permissions_PermissionId] 
    FOREIGN KEY([PermissionId]) REFERENCES [dbo].[Permissions] ([Id])
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Tenants_SubscriptionPlans_SubscriptionPlanId]') AND parent_object_id = OBJECT_ID(N'[dbo].[Tenants]'))
BEGIN
    ALTER TABLE [dbo].[Tenants] WITH CHECK ADD CONSTRAINT [FK_Tenants_SubscriptionPlans_SubscriptionPlanId] 
    FOREIGN KEY([SubscriptionPlanId]) REFERENCES [dbo].[SubscriptionPlans] ([Id])
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_TenantDatabases_Tenants_TenantId]') AND parent_object_id = OBJECT_ID(N'[dbo].[TenantDatabases]'))
BEGIN
    ALTER TABLE [dbo].[TenantDatabases] WITH CHECK ADD CONSTRAINT [FK_TenantDatabases_Tenants_TenantId] 
    FOREIGN KEY([TenantId]) REFERENCES [dbo].[Tenants] ([Id])
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_TenantUsers_Tenants_TenantId]') AND parent_object_id = OBJECT_ID(N'[dbo].[TenantUsers]'))
BEGIN
    ALTER TABLE [dbo].[TenantUsers] WITH CHECK ADD CONSTRAINT [FK_TenantUsers_Tenants_TenantId] 
    FOREIGN KEY([TenantId]) REFERENCES [dbo].[Tenants] ([Id])
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_TenantUsers_AspNetUsers_UserId]') AND parent_object_id = OBJECT_ID(N'[dbo].[TenantUsers]'))
BEGIN
    ALTER TABLE [dbo].[TenantUsers] WITH CHECK ADD CONSTRAINT [FK_TenantUsers_AspNetUsers_UserId] 
    FOREIGN KEY([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id])
END

-- 6. Add Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[RolePermissions]') AND name = N'IX_RolePermissions_RoleId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_RolePermissions_RoleId] ON [dbo].[RolePermissions] ([RoleId] ASC)
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[RolePermissions]') AND name = N'IX_RolePermissions_PermissionId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_RolePermissions_PermissionId] ON [dbo].[RolePermissions] ([PermissionId] ASC)
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Tenants]') AND name = N'IX_Tenants_SubscriptionPlanId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Tenants_SubscriptionPlanId] ON [dbo].[Tenants] ([SubscriptionPlanId] ASC)
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[TenantDatabases]') AND name = N'IX_TenantDatabases_TenantId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TenantDatabases_TenantId] ON [dbo].[TenantDatabases] ([TenantId] ASC)
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[TenantUsers]') AND name = N'IX_TenantUsers_TenantId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TenantUsers_TenantId] ON [dbo].[TenantUsers] ([TenantId] ASC)
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[TenantUsers]') AND name = N'IX_TenantUsers_UserId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TenantUsers_UserId] ON [dbo].[TenantUsers] ([UserId] ASC)
END

-- 7. Add Unique Constraints
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Tenants]') AND name = N'IX_Tenants_Subdomain')
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Tenants_Subdomain] ON [dbo].[Tenants] ([Subdomain] ASC)
END

-- 8. Insert Default Permissions (if table is empty)
IF NOT EXISTS (SELECT * FROM [dbo].[Permissions])
BEGIN
    INSERT INTO [dbo].[Permissions] ([Name], [Description], [Category]) VALUES
    -- Project Permissions
    ('PROJECT_CREATE', 'Create new projects', 'Project'),
    ('PROJECT_READ', 'View projects', 'Project'),
    ('PROJECT_UPDATE', 'Update projects', 'Project'),
    ('PROJECT_DELETE', 'Delete projects', 'Project'),
    ('PROJECT_APPROVE', 'Approve projects', 'Project'),
    
    -- Business Development Permissions
    ('OPPORTUNITY_CREATE', 'Create opportunities', 'Business Development'),
    ('OPPORTUNITY_READ', 'View opportunities', 'Business Development'),
    ('OPPORTUNITY_UPDATE', 'Update opportunities', 'Business Development'),
    ('OPPORTUNITY_DELETE', 'Delete opportunities', 'Business Development'),
    ('BID_PREPARATION', 'Manage bid preparations', 'Business Development'),
    
    -- System Permissions
    ('USER_MANAGE', 'Manage users', 'System'),
    ('ROLE_MANAGE', 'Manage roles', 'System'),
    ('SYSTEM_SETTINGS', 'Manage system settings', 'System'),
    ('ADMIN_PANEL', 'Access admin panel', 'System'),
    
    -- Reviewer/Checker Permissions
    ('REVIEWER', 'Review forms', 'Review'),
    ('CHECKER', 'Check forms', 'Review')
END

-- 9. Insert Default Subscription Plans
IF NOT EXISTS (SELECT * FROM [dbo].[SubscriptionPlans] WHERE [Name] = 'Basic')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([Name], [Description], [Price], [BillingCycle], [MaxUsers], [MaxProjects], [FeaturesJson], [IsActive])
    VALUES ('Basic', 'Basic plan for small teams', 29.99, 1, 5, 3, '{"feature1": true, "feature2": false}', 1)
END

IF NOT EXISTS (SELECT * FROM [dbo].[SubscriptionPlans] WHERE [Name] = 'Professional')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([Name], [Description], [Price], [BillingCycle], [MaxUsers], [MaxProjects], [FeaturesJson], [IsActive])
    VALUES ('Professional', 'Professional plan for growing businesses', 99.99, 1, 20, 15, '{"feature1": true, "feature2": true, "feature3": true}', 1)
END

IF NOT EXISTS (SELECT * FROM [dbo].[SubscriptionPlans] WHERE [Name] = 'Enterprise')
BEGIN
    INSERT INTO [dbo].[SubscriptionPlans] ([Name], [Description], [Price], [BillingCycle], [MaxUsers], [MaxProjects], [FeaturesJson], [IsActive])
    VALUES ('Enterprise', 'Enterprise plan for large organizations', 299.99, 1, 100, 50, '{"feature1": true, "feature2": true, "feature3": true, "feature4": true}', 1)
END

PRINT 'SaaS tables and permissions created successfully!' 