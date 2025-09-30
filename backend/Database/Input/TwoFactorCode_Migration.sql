-- Migration script for TwoFactorCode table
-- This table stores OTP codes for two-factor authentication

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TwoFactorCodes](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [UserId] [nvarchar](450) NOT NULL,
        [Code] [nvarchar](6) NOT NULL,
        [ExpiresAt] [datetime2](7) NOT NULL,
        [CreatedAt] [datetime2](7) NOT NULL,
        [IsUsed] [bit] NOT NULL DEFAULT 0,
        [TenantId] [int] NOT NULL DEFAULT 1,
        CONSTRAINT [PK_TwoFactorCodes] PRIMARY KEY CLUSTERED ([Id] ASC)
    )
END
GO

-- Add foreign key constraint to AspNetUsers table
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_TwoFactorCodes_AspNetUsers]') AND parent_object_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]'))
BEGIN
    ALTER TABLE [dbo].[TwoFactorCodes] 
    ADD CONSTRAINT [FK_TwoFactorCodes_AspNetUsers] 
    FOREIGN KEY([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
END
GO

-- Create index for faster lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND name = N'IX_TwoFactorCodes_UserId_Code')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TwoFactorCodes_UserId_Code] ON [dbo].[TwoFactorCodes]
    (
        [UserId] ASC,
        [Code] ASC
    )
END
GO

-- Create index for expiration cleanup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND name = N'IX_TwoFactorCodes_ExpiresAt')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TwoFactorCodes_ExpiresAt] ON [dbo].[TwoFactorCodes]
    (
        [ExpiresAt] ASC
    )
END
GO

-- Create index for tenant filtering
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND name = N'IX_TwoFactorCodes_TenantId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TwoFactorCodes_TenantId] ON [dbo].[TwoFactorCodes]
    (
        [TenantId] ASC
    )
END
GO

---- Add comments to the table and columns
--IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND minor_id = 0)
--BEGIN
--    EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Table for storing two-factor authentication OTP codes' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'TwoFactorCodes'
--END
--GO

--IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND minor_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND name = N'UserId'))
--BEGIN
--    EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Foreign key to AspNetUsers table' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'TwoFactorCodes', @level2type=N'COLUMN',@level2name=N'UserId'
--END
--GO

--IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND minor_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND name = N'Code'))
--BEGIN
--    EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'6-digit OTP code' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'TwoFactorCodes', @level2type=N'COLUMN',@level2name=N'Code'
--END
--GO

--IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND minor_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND name = N'ExpiresAt'))
--BEGIN
--    EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Expiration timestamp for the OTP code' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'TwoFactorCodes', @level2type=N'COLUMN',@level2name=N'ExpiresAt'
--END
--GO

--IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND minor_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND name = N'IsUsed'))
--BEGIN
--    EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Flag indicating if the OTP code has been used' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'TwoFactorCodes', @level2type=N'COLUMN',@level2name=N'IsUsed'
--END
--GO

--IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND minor_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[TwoFactorCodes]') AND name = N'TenantId'))
--BEGIN
--    EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Tenant ID for multi-tenancy support' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'TwoFactorCodes', @level2type=N'COLUMN',@level2name=N'TenantId'
--END
--GO

PRINT 'TwoFactorCode table migration completed successfully.'
GO


