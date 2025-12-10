# SSL Certificate Renewal Documentation

## FULL, COMPLETE STEPS TO RENEW SSL USING win-acme (wacs.exe)

### PART 1 — PREPARATION

Before renewal, confirm:
*   Port 80 is open (win-acme uses HTTP-01 validation)
*   Your domain is pointing correctly (e.g. edradmin.karmatech-ai.com → your server IP)

**Run as Administrator**

Go to SSL tool folder → Right-click → Run as Administrator

### PART 2 — OPEN THE win-acme TOOL

Navigate to your folder:

    E:\SSL Tool Free>

Run:

    wacs.exe

### PART 3 — OPEN THE RENEWAL MANAGER

Main menu appears:

    N: Create certificate (default)
    M: Create certificate (full options)
    R: Run renewals
    A: Manage renewals
    O: More options
    Q: Quit

Choose: **A**

This opens renewal manager.

### PART 4 — SELECT WHICH CERTIFICATE TO RENEW

You will see a list:

    1: [IIS] EdrAdmin - due 2025/12/12
    2: MultiTenantSSL - due now (ERRORS)

Choose the one you want:

Example: **1**
Now only that certificate is selected.

### PART 5 — CHOOSE HOW YOU WANT TO RENEW

After selecting:

    E: Edit renewal
    R: Run renewal
    S: Run renewal (force)
    T: Run renewal (force, no cache)

There are 3 renewal types:

*   **R — Normal renewal**
    Uses cache + reuses authorizations (fastest).
*   **S — Force renewal**
    Revalidates domain, issues new certificate. Recommended for manual renewal.
*   **T — Force, no cache**
    Full clean reissue (no cached cert/order). Best when debugging problems.

Choose normally → **S**

So type: **S**

### PART 6 — LET win-acme PROCESS RENEWAL

win-acme will:

*   ✔ Validate domain with http-01
    *   Authorizing using http-01 validation (SelfHosting)
    *   Authorization result: valid
*   ✔ Contact Let's Encrypt
*   ✔ Issue a new certificate
*   ✔ Add it to Windows certificate store
    *   Store with CertificateStore...
    *   Adding certificate ... in WebHosting store
*   ✔ Update IIS HTTPS binding
    *   Updating existing https binding domain:443:IP
*   ✔ Remove old certificate
    *   Removing old certificate from store...
*   ✔ Show next renewal date
    *   Next renewal due after 2026/01/24
    *   Renewal succeeded

### PART 7 — VERIFY CERTIFICATE IN IIS

Open IIS Manager:

1.  Click your server (top left).
2.  Open **Server Certificates**.
3.  Look for the certificate with the new expiry date.
4.  Open your site → **Bindings** → **HTTPS** → **Edit** → **View Certificate**

Confirm correct one is used.

### PART 8 — CONFIRM AUTO-RENEWAL IS ENABLED (Nice to have is not implemented)

win-acme automatically installs a Windows Task:

Open:

**Task Scheduler** → **Task Scheduler Library**

Find:

**win-acme renew task**

It runs daily.
It auto-renews when expiry < 30 days.

### PART 9 — OPTIONAL: TEST AUTO-RENEW MANUALLY(Nice to have)

Run this (safe test):

    wacs.exe --test

Full renewal test:

    wacs.exe --renew --force

### PART 10 — IF A CERTIFICATE HAS ERRORS

For example:

    MultiTenantSSL - 41 errors

Fix by editing or recreating:

**A** → select the renewal → **E** (Edit)

Or delete and recreate:

**C** (Cancel renewal)

Then create new:

**M** (Create certificate with full options)
