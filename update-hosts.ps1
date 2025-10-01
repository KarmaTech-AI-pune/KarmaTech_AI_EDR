# Run this script as Administrator
$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$hostEntries = @"

# KarmaTech-AI Local Development
127.0.0.1    karmatech-ai.com
127.0.0.1    www.karmatech-ai.com
127.0.0.1    api.karmatech-ai.com
127.0.0.1    tenant1.karmatech-ai.com
127.0.0.1    tenant2.karmatech-ai.com
"@

Add-Content -Path $hostsFile -Value $hostEntries
Write-Host "Hosts file updated successfully!"
