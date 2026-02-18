# IIS .NET Hosting Version Conflict - Resolution

## Issue
IIS was not working for several weeks due to .NET hosting bundle version conflict.

## Root Cause
Conflicting .NET hosting bundle versions installed on the system:
- Old version: 8.0.21
- New version: 8.0.24

## Solution Steps

1. **Uninstall old .NET hosting bundle**
   - Removed version 8.0.21 from system

2. **Install correct .NET hosting bundle**
   - Installed version 8.0.24

3. **Restart system**
   - Performed multiple machine restarts to ensure clean state

4. **Restart IIS**
   - Restarted IIS service
   - Created/restarted website

## Verification
✅ Swagger UI now running successfully  
✅ IIS functioning properly

## Prevention
- Keep only one .NET hosting bundle version installed
- Update to latest version when upgrading
- Remove old versions after successful upgrade

---

**Resolved:** February 14, 2026  
**Issue Duration:** Several weeks  
**Resolution Time:** ~3 hour after identifying root cause
