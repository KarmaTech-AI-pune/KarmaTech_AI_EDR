-- Migration script to add TwoFactorEnabled column to AspNetUsers table
-- This script adds the TwoFactorEnabled column and sets it to true for all existing users

-- Add the TwoFactorEnabled column to AspNetUsers table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUsers]') AND name = N'TwoFactorEnabled')
BEGIN
    ALTER TABLE [dbo].[AspNetUsers] 
    ADD [TwoFactorEnabled] [bit] NOT NULL DEFAULT 1
END
GO

-- Update all existing users to have TwoFactorEnabled = true
UPDATE [dbo].[AspNetUsers] 
SET [TwoFactorEnabled] = 1 
WHERE [TwoFactorEnabled] IS NULL OR [TwoFactorEnabled] = 0
GO

---- Add a comment to the column
--IF NOT EXISTS (SELECT * FROM sys.extended_properties WHERE major_id = OBJECT_ID(N'[dbo].[AspNetUsers]') AND minor_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUsers]') AND name = N'TwoFactorEnabled'))
--BEGIN
--    EXEC sys.sp_addextendedproperty 
--        @name=N'MS_Description', 
--        @value=N'Indicates whether two-factor authentication is enabled for this user' , 
--        @level0type=N'SCHEMA',@level0name=N'dbo', 
--        @level1type=N'TABLE',@level1name=N'AspNetUsers', 
--        @level2type=N'COLUMN',@level2name=N'TwoFactorEnabled'
--END
--GO

PRINT 'TwoFactorEnabled column added successfully to AspNetUsers table.'
PRINT 'All existing users have been set to TwoFactorEnabled = true.'
GO
