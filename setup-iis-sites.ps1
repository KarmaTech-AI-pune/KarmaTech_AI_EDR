# Run this script as Administrator
Import-Module WebAdministration

# =============================
# Configurable Parameters
# =============================
$mainSiteName   = "karmatech-ai"
$apiSiteName    = "api.karmatech-ai"
$tenantSiteName = "tenants.karmatech-ai"

$basePath       = "D:\Disha Project\EDRProjectManagementApp"
$frontendPath   = "$basePath\frontend\dist"
$backendPath    = "$basePath\backend"

# SSL certificate thumbprint (Wildcard SSL: *.karmatech-ai.com must be installed in LocalMachine\My)
$sslThumbprint = "<PUT-YOUR-WILDCARD-CERT-THUMBPRINT-HERE>"

# Backend Type: "Core" or "Framework"
$backendType = "Core"

# =============================
# Create App Pools
# =============================
New-WebAppPool -Name $mainSiteName   -Force
New-WebAppPool -Name $apiSiteName    -Force
New-WebAppPool -Name $tenantSiteName -Force

# Main & Tenant = static SPA → No Managed Code
Set-ItemProperty "IIS:\AppPools\$mainSiteName"   -Name managedRuntimeVersion -Value ""
Set-ItemProperty "IIS:\AppPools\$tenantSiteName" -Name managedRuntimeVersion -Value ""

# API pool depends on backend type
if ($backendType -eq "Framework") {
    Set-ItemProperty "IIS:\AppPools\$apiSiteName" -Name managedRuntimeVersion -Value "v4.0"
} else {
    Set-ItemProperty "IIS:\AppPools\$apiSiteName" -Name managedRuntimeVersion -Value ""
}

# =============================
# Create Websites
# =============================
# Main Site
if (-not (Get-Website | Where-Object { $_.Name -eq $mainSiteName })) {
    New-Website -Name $mainSiteName `
        -PhysicalPath $frontendPath `
        -ApplicationPool $mainSiteName `
        -Port 80 -HostHeader "karmatech-ai.com"
}
# Add www binding
if (-not (Get-WebBinding -Name $mainSiteName -HostHeader "www.karmatech-ai.com" -ErrorAction SilentlyContinue)) {
    New-WebBinding -Name $mainSiteName -IPAddress "*" -Port 80 -HostHeader "www.karmatech-ai.com"
}

# API Site
if (-not (Get-Website | Where-Object { $_.Name -eq $apiSiteName })) {
    New-Website -Name $apiSiteName `
        -PhysicalPath $backendPath `
        -ApplicationPool $apiSiteName `
        -Port 80 -HostHeader "api.karmatech-ai.com"
}

# Tenant Site
if (-not (Get-Website | Where-Object { $_.Name -eq $tenantSiteName })) {
    New-Website -Name $tenantSiteName `
        -PhysicalPath $frontendPath `
        -ApplicationPool $tenantSiteName `
        -Port 80 -HostHeader "*.karmatech-ai.com"
}

# =============================
# SSL Bindings (Wildcard)
# =============================
if ($sslThumbprint -ne "<PUT-YOUR-WILDCARD-CERT-THUMBPRINT-HERE>") {
    # Tenant wildcard
    if (-not (Get-WebBinding -Name $tenantSiteName -Port 443 -Protocol "https" -ErrorAction SilentlyContinue)) {
        New-WebBinding -Name $tenantSiteName -IPAddress "*" -Port 443 -HostHeader "*.karmatech-ai.com" -Protocol https
        Get-Item "cert:\LocalMachine\My\$sslThumbprint" | New-Item "IIS:\SslBindings\0.0.0.0!443!*.karmatech-ai.com"
    }

    # Main site
    if (-not (Get-WebBinding -Name $mainSiteName -Port 443 -HostHeader "karmatech-ai.com" -Protocol "https" -ErrorAction SilentlyContinue)) {
        New-WebBinding -Name $mainSiteName -IPAddress "*" -Port 443 -HostHeader "karmatech-ai.com" -Protocol https
        Get-Item "cert:\LocalMachine\My\$sslThumbprint" | New-Item "IIS:\SslBindings\0.0.0.0!443!karmatech-ai.com"
    }

    if (-not (Get-WebBinding -Name $mainSiteName -Port 443 -HostHeader "www.karmatech-ai.com" -Protocol "https" -ErrorAction SilentlyContinue)) {
        New-WebBinding -Name $mainSiteName -IPAddress "*" -Port 443 -HostHeader "www.karmatech-ai.com" -Protocol https
        Get-Item "cert:\LocalMachine\My\$sslThumbprint" | New-Item "IIS:\SslBindings\0.0.0.0!443!www.karmatech-ai.com"
    }

    # API site
    if (-not (Get-WebBinding -Name $apiSiteName -Port 443 -HostHeader "api.karmatech-ai.com" -Protocol "https" -ErrorAction SilentlyContinue)) {
        New-WebBinding -Name $apiSiteName -IPAddress "*" -Port 443 -HostHeader "api.karmatech-ai.com" -Protocol https
        Get-Item "cert:\LocalMachine\My\$sslThumbprint" | New-Item "IIS:\SslBindings\0.0.0.0!443!api.karmatech-ai.com"
    }
}

# =============================
# Add/Update Rewrite Rule for Tenant SPA
# =============================
$webConfig = Join-Path $frontendPath "web.config"

if (-not (Test-Path $webConfig)) {
    # Create fresh web.config if missing
    @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="Tenant Routing" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{HTTP_HOST}" pattern="^([^.]+)\.karmatech-ai\.com$" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
          <serverVariables>
            <set name="HTTP_X_TENANT_CONTEXT" value="{C:1}" />
          </serverVariables>
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
"@ | Out-File -FilePath $webConfig -Encoding UTF8
} else {
    # Merge: check if rule exists
    [xml]$xml = Get-Content $webConfig
    $rewriteNode = $xml.configuration.'system.webServer'.rewrite
    if (-not $rewriteNode) {
        $rewriteNode = $xml.CreateElement("rewrite")
        $xml.configuration.'system.webServer'.AppendChild($rewriteNode) | Out-Null
    }
    $rulesNode = $rewriteNode.rules
    if (-not $rulesNode) {
        $rulesNode = $xml.CreateElement("rules")
        $rewriteNode.AppendChild($rulesNode) | Out-Null
    }
    $existingRule = $rulesNode.rule | Where-Object { $_.name -eq "Tenant Routing" }
    if (-not $existingRule) {
        $ruleXml = @"
<rule name="Tenant Routing" stopProcessing="true">
  <match url=".*" />
  <conditions>
    <add input="{HTTP_HOST}" pattern="^([^.]+)\.karmatech-ai\.com$" />
  </conditions>
  <action type="Rewrite" url="/index.html" />
  <serverVariables>
    <set name="HTTP_X_TENANT_CONTEXT" value="{C:1}" />
  </serverVariables>
</rule>
"@
        $fragment = [xml]("<rules>$ruleXml</rules>")
        $rulesNode.AppendChild($xml.ImportNode($fragment.rules.rule, $true)) | Out-Null
        $xml.Save($webConfig)
    }
}

Write-Host "✅ IIS Setup completed successfully!"
