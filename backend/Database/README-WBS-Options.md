# WBS Options Setup Guide

This guide explains how to set up the Work Breakdown Structure (WBS) options in the database to fix the issue with empty "Work Description" dropdowns in the WBS form.

## The Issue

The "Work Description" dropdown in the WBS form was showing as empty because:

1. The frontend was trying to fetch WBS options from the backend API
2. The backend API was not returning any options
3. The fallback data mechanism has been disabled

## Solution

We've implemented the following changes to fix this issue:

1. Updated the frontend API services to remove fallback data usage and improve error handling
2. Created a SQL script to populate the WBS options in the database
3. Created a PowerShell script to execute the SQL script

## How to Apply the Fix

### Step 1: Run the SQL Script to Populate WBS Options

Run the provided PowerShell script to populate the WBS options in the database:

```powershell
cd backend
.\populate-wbs-options.ps1
```

This script will:
1. Read the connection string from your appsettings.Development.json
2. Connect to your database
3. Execute the WBSOptions.sql script to populate the WBS options

### Step 2: Verify the Data

You can verify that the WBS options were correctly inserted by running the following SQL query:

```sql
SELECT * FROM WBSOptions ORDER BY Level, Value;
```

You should see entries for:
- Level 1 options (Inception Report, Feasibility Report, etc.)
- Level 2 options (Surveys, Design, Cost Estimation)
- Level 3 options (specific to each Level 2 option)

### Step 3: Restart the Backend API

Restart your backend API service to ensure it picks up the new database changes:

```powershell
cd backend/src/NJSAPI
dotnet run
```

### Step 4: Test the WBS Form

1. Start the frontend application
2. Navigate to a project
3. Open the WBS form
4. Verify that the "Work Description" dropdowns are now populated with options

## Customizing WBS Options

If you need to customize the WBS options, you can:

1. Modify the `backend/Database/Input/WBSOptions.sql` script
2. Run the `populate-wbs-options.ps1` script again

## Troubleshooting

If you still see empty dropdowns:

1. Check the browser console for error messages
2. Verify that the backend API is running
3. Ensure the database connection is working
4. Check that the WBSOptions table is properly populated
5. Verify that the WBSOptionsController endpoints are returning data

## Database Schema

The WBSOption entity has the following structure:

```csharp
public class WBSOption
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Value { get; set; }

    [Required]
    [StringLength(255)]
    public string Label { get; set; }

    [Required]
    public int Level { get; set; }

    [StringLength(100)]
    public string ParentValue { get; set; }
}
```

- Level 1 options have Level=1 and ParentValue=NULL
- Level 2 options have Level=2 and ParentValue=NULL
- Level 3 options have Level=3 and ParentValue=<Level2Value>
