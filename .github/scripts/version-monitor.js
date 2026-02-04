#!/usr/bin/env node

/**
 * Version System Monitoring and Error Handling Script
 * Monitors version consistency, API health, and deployment status
 * 
 * Requirements: 4.4, 7.1, 7.2, 4.5, 3.5, 8.1, 8.2, 8.4
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

class VersionMonitor {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.checks = [];
        this.metrics = {
            startTime: Date.now(),
            checksPerformed: 0,
            apiResponseTimes: []
        };
    }

    /**
     * Main monitoring function
     * Requirement: 8.1, 8.2 - Monitor version calculation success rate
     */
    async monitor() {
        console.log('🔍 Starting version system monitoring...');
        console.log(`   Timestamp: ${new Date().toISOString()}`);
        
        try {
            await this.checkVersionConsistency();
            await this.checkAPIHealth();
            await this.checkDeploymentStatus();
            await this.checkVersionFiles();
            await this.validateGitTags();
            await this.checkVersionCalculationMetrics();
            
            this.generateReport();
            
            // Send alerts if needed (Requirement: 7.2, 8.4)
            if (this.errors.length > 0) {
                await this.sendAlerts();
                console.error('❌ Monitoring failed with errors');
                process.exit(1);
            } else if (this.warnings.length > 0) {
                console.warn('⚠️ Monitoring completed with warnings');
                process.exit(0);
            } else {
                console.log('✅ All version system checks passed');
                process.exit(0);
            }
        } catch (error) {
            console.error('💥 Monitoring script failed:', error.message);
            await this.sendCriticalAlert(error);
            process.exit(1);
        }
    }

    /**
     * Send alerts for errors
     * Requirement: 7.2 - Add administrator notifications for failures
     */
    async sendAlerts() {
        try {
            const VersionErrorNotifier = require('./version-error-notifier');
            const notifier = new VersionErrorNotifier();
            
            for (const error of this.errors) {
                await notifier.notifyError({
                    type: 'VERSION_MONITORING_ERROR',
                    message: error,
                    severity: 'HIGH',
                    details: {
                        totalErrors: this.errors.length,
                        totalWarnings: this.warnings.length,
                        checksPerformed: this.metrics.checksPerformed
                    }
                });
            }
            
            console.log(`📢 Sent ${this.errors.length} alert notification(s)`);
        } catch (notifyError) {
            console.error('Could not send alert notifications:', notifyError.message);
        }
    }

    /**
     * Send critical alert for monitoring failures
     */
    async sendCriticalAlert(error) {
        try {
            const VersionErrorNotifier = require('./version-error-notifier');
            const notifier = new VersionErrorNotifier();
            
            await notifier.notifyError({
                type: 'MONITORING_SCRIPT_FAILURE',
                message: `Version monitoring script failed: ${error.message}`,
                severity: 'HIGH',
                details: {
                    error: error.message,
                    stack: error.stack
                }
            });
        } catch (notifyError) {
            console.error('Could not send critical alert:', notifyError.message);
        }
    }

    /**
     * Check version consistency across all files
     * Requirement: 3.5, 4.5 - Ensure all version locations contain same version
     */
    async checkVersionConsistency() {
        console.log('📋 Checking version consistency...');
        this.metrics.checksPerformed++;
        
        try {
            // Read VERSION file
            const versionFile = this.readVersionFile();
            if (!versionFile) {
                this.addError('VERSION file not found or empty');
                return;
            }

            // Read package.json version
            const packageVersion = this.readPackageVersion();
            if (!packageVersion) {
                this.addError('frontend/package.json version not found');
                return;
            }

            // Check if versions match (Requirement: 3.5)
            if (versionFile !== packageVersion) {
                this.addError(`Version mismatch: VERSION file (${versionFile}) != package.json (${packageVersion})`);
                
                // Send specific mismatch notification (Requirement: 8.4)
                try {
                    const VersionErrorNotifier = require('./version-error-notifier');
                    const notifier = new VersionErrorNotifier();
                    await notifier.notifyVersionMismatch(versionFile, packageVersion, 'VERSION file vs package.json');
                } catch (e) {
                    console.error('Could not send mismatch notification:', e.message);
                }
            } else {
                this.addCheck('Version consistency', 'PASS', `All files show version ${versionFile}`);
            }

            // Check CHANGELOG.md exists and is recent
            if (fs.existsSync('CHANGELOG.md')) {
                const changelogContent = fs.readFileSync('CHANGELOG.md', 'utf8');
                if (changelogContent.includes(versionFile)) {
                    this.addCheck('CHANGELOG.md', 'PASS', `Contains current version ${versionFile}`);
                } else {
                    this.addWarning(`CHANGELOG.md does not contain current version ${versionFile}`);
                }
            } else {
                this.addWarning('CHANGELOG.md not found');
            }

        } catch (error) {
            this.addError(`Version consistency check failed: ${error.message}`);
        }
    }

    /**
     * Check API health and version endpoints
     * Requirement: 8.4 - Alert on version API endpoint failures
     */
    async checkAPIHealth() {
        console.log('🏥 Checking API health...');
        this.metrics.checksPerformed++;
        
        const endpoints = [
            { url: 'https://api.app.karmatech-ai.com/api/version', name: 'Version API' },
            { url: 'https://api.app.karmatech-ai.com/api/version/health', name: 'Health API' },
            { url: 'https://api.app.karmatech-ai.com/api/version/sync-status', name: 'Sync Status API' }
        ];

        for (const endpoint of endpoints) {
            try {
                const startTime = Date.now();
                const response = await this.httpGet(endpoint.url);
                const responseTime = Date.now() - startTime;
                
                this.metrics.apiResponseTimes.push({ endpoint: endpoint.name, responseTime });
                
                const data = JSON.parse(response);
                
                // Check response time (Requirement: 8.5 - respond within 100ms)
                if (responseTime > 100) {
                    this.addWarning(`${endpoint.name} response time (${responseTime}ms) exceeded 100ms target`);
                }
                
                if (data.success) {
                    this.addCheck(`API Health (${endpoint.name})`, 'PASS', `Response time: ${responseTime}ms`);
                    
                    // Check version in response
                    if (data.data && data.data.version) {
                        const expectedVersion = this.readVersionFile();
                        if (data.data.version === expectedVersion) {
                            this.addCheck('API Version Match', 'PASS', `API reports correct version: ${data.data.version}`);
                        } else {
                            this.addWarning(`API version mismatch: API (${data.data.version}) != Expected (${expectedVersion})`);
                        }
                    }
                } else {
                    this.addError(`API health check failed for ${endpoint.name}: ${data.message || 'Unknown error'}`);
                    
                    // Send API failure notification (Requirement: 8.4)
                    try {
                        const VersionErrorNotifier = require('./version-error-notifier');
                        const notifier = new VersionErrorNotifier();
                        await notifier.notifyAPIHealthFailure(endpoint.url, new Error(data.message || 'API returned failure'));
                    } catch (e) {
                        console.error('Could not send API failure notification:', e.message);
                    }
                }
            } catch (error) {
                this.addError(`API health check failed for ${endpoint.name}: ${error.message}`);
                
                // Send API failure notification (Requirement: 8.4)
                try {
                    const VersionErrorNotifier = require('./version-error-notifier');
                    const notifier = new VersionErrorNotifier();
                    await notifier.notifyAPIHealthFailure(endpoint.url, error);
                } catch (e) {
                    console.error('Could not send API failure notification:', e.message);
                }
            }
        }
    }

    /**
     * Check version calculation metrics
     * Requirement: 8.1, 8.2 - Monitor version calculation success rate
     */
    async checkVersionCalculationMetrics() {
        console.log('📊 Checking version calculation metrics...');
        this.metrics.checksPerformed++;
        
        try {
            const metricsFile = path.join(process.cwd(), '.github', 'monitoring', 'version-integration-metrics.json');
            
            if (!fs.existsSync(metricsFile)) {
                this.addWarning('Version integration metrics file not found');
                return;
            }
            
            const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
            
            if (metrics.successRate) {
                const successRate = parseFloat(metrics.successRate);
                
                if (successRate < 90) {
                    this.addError(`Version calculation success rate (${successRate}%) is below 90% threshold`);
                } else if (successRate < 95) {
                    this.addWarning(`Version calculation success rate (${successRate}%) is below 95% target`);
                } else {
                    this.addCheck('Version Calculation Success Rate', 'PASS', `${successRate}%`);
                }
            }
            
            // Check recent failures
            if (metrics.runs && metrics.runs.length > 0) {
                const recentRuns = metrics.runs.slice(-5);
                const recentFailures = recentRuns.filter(r => !r.success);
                
                if (recentFailures.length >= 3) {
                    this.addError(`${recentFailures.length} of last 5 version calculations failed`);
                } else if (recentFailures.length > 0) {
                    this.addWarning(`${recentFailures.length} of last 5 version calculations failed`);
                } else {
                    this.addCheck('Recent Version Calculations', 'PASS', 'All recent calculations successful');
                }
            }
            
        } catch (error) {
            this.addWarning(`Could not check version calculation metrics: ${error.message}`);
        }
    }

    /**
     * Check deployment status and version manifests
     */
    async checkDeploymentStatus() {
        console.log('🚀 Checking deployment status...');
        
        const versionManifests = [
            'https://edr-admin.app.karmatech-ai.com/version.json',
            'https://app.karmatech-ai.com/version.json'
        ];

        for (const manifest of versionManifests) {
            try {
                const response = await this.httpGet(manifest);
                const data = JSON.parse(response);
                
                if (data.version) {
                    const expectedVersion = this.readVersionFile();
                    const manifestVersion = data.semanticVersion || data.version;
                    
                    if (manifestVersion.includes(expectedVersion)) {
                        this.addCheck(`Deployment Version (${manifest})`, 'PASS', `Deployed version: ${manifestVersion}`);
                    } else {
                        this.addWarning(`Deployment version mismatch: Deployed (${manifestVersion}) != Expected (${expectedVersion})`);
                    }
                    
                    // Check deployment freshness (within last 24 hours)
                    if (data.buildDate) {
                        const buildDate = new Date(data.buildDate);
                        const hoursSinceBuild = (Date.now() - buildDate.getTime()) / (1000 * 60 * 60);
                        
                        if (hoursSinceBuild < 24) {
                            this.addCheck('Deployment Freshness', 'PASS', `Built ${hoursSinceBuild.toFixed(1)} hours ago`);
                        } else {
                            this.addWarning(`Deployment is ${hoursSinceBuild.toFixed(1)} hours old`);
                        }
                    }
                } else {
                    this.addError(`Invalid version manifest at ${manifest}`);
                }
            } catch (error) {
                this.addError(`Could not fetch version manifest ${manifest}: ${error.message}`);
            }
        }
    }

    /**
     * Check version files exist and are valid
     */
    async checkVersionFiles() {
        console.log('📁 Checking version files...');
        
        const requiredFiles = [
            { path: 'VERSION', description: 'Main version file' },
            { path: 'frontend/package.json', description: 'Frontend package file' },
            { path: 'version-history.json', description: 'Version history file' }
        ];

        for (const file of requiredFiles) {
            if (fs.existsSync(file.path)) {
                try {
                    const content = fs.readFileSync(file.path, 'utf8');
                    if (content.trim().length > 0) {
                        this.addCheck(`File Exists (${file.path})`, 'PASS', file.description);
                    } else {
                        this.addError(`${file.path} is empty`);
                    }
                } catch (error) {
                    this.addError(`Could not read ${file.path}: ${error.message}`);
                }
            } else {
                if (file.path === 'version-history.json') {
                    this.addWarning(`${file.path} not found (optional)`);
                } else {
                    this.addError(`${file.path} not found`);
                }
            }
        }
    }

    /**
     * Validate git tags
     */
    async validateGitTags() {
        console.log('🏷️ Validating git tags...');
        
        try {
            const currentVersion = this.readVersionFile();
            if (!currentVersion) return;

            // Check if tag exists for current version
            const tagExists = this.checkGitTag(`v${currentVersion}`);
            if (tagExists) {
                this.addCheck('Git Tag Exists', 'PASS', `Tag v${currentVersion} found`);
            } else {
                this.addWarning(`Git tag v${currentVersion} not found`);
            }

            // Check recent tags
            try {
                const recentTags = execSync('git tag --sort=-version:refname | head -5', { encoding: 'utf8' }).trim().split('\n');
                this.addCheck('Recent Tags', 'PASS', `Latest tags: ${recentTags.join(', ')}`);
            } catch (error) {
                this.addWarning('Could not fetch recent git tags');
            }

        } catch (error) {
            this.addError(`Git tag validation failed: ${error.message}`);
        }
    }

    /**
     * Generate monitoring report
     */
    generateReport() {
        console.log('\n📊 === VERSION SYSTEM MONITORING REPORT ===');
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`Total Checks: ${this.checks.length}`);
        console.log(`Errors: ${this.errors.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        
        if (this.checks.length > 0) {
            console.log('\n✅ PASSED CHECKS:');
            this.checks.forEach(check => {
                console.log(`   ${check.name}: ${check.status} - ${check.details}`);
            });
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️ WARNINGS:');
            this.warnings.forEach(warning => {
                console.log(`   ${warning}`);
            });
        }

        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.errors.forEach(error => {
                console.log(`   ${error}`);
            });
        }

        // Save report to file
        const report = {
            timestamp: new Date().toISOString(),
            status: this.errors.length > 0 ? 'FAILED' : (this.warnings.length > 0 ? 'WARNING' : 'PASSED'),
            checks: this.checks,
            warnings: this.warnings,
            errors: this.errors,
            summary: {
                totalChecks: this.checks.length,
                errorCount: this.errors.length,
                warningCount: this.warnings.length
            }
        };

        try {
            fs.writeFileSync('.github/monitoring/version-monitor-report.json', JSON.stringify(report, null, 2));
            console.log('\n📄 Report saved to .github/monitoring/version-monitor-report.json');
        } catch (error) {
            console.warn('Could not save report file:', error.message);
        }
    }

    // Helper methods
    readVersionFile() {
        try {
            return fs.readFileSync('VERSION', 'utf8').trim();
        } catch {
            return null;
        }
    }

    readPackageVersion() {
        try {
            const pkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
            return pkg.version;
        } catch {
            return null;
        }
    }

    checkGitTag(tag) {
        try {
            execSync(`git rev-parse ${tag}`, { stdio: 'pipe' });
            return true;
        } catch {
            return false;
        }
    }

    httpGet(url) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, { timeout: 10000 }, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    }
                });
            });

            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });

            request.on('error', reject);
        });
    }

    addCheck(name, status, details) {
        this.checks.push({ name, status, details });
    }

    addWarning(message) {
        this.warnings.push(message);
    }

    addError(message) {
        this.errors.push(message);
    }
}

// CLI execution
if (require.main === module) {
    const monitor = new VersionMonitor();
    monitor.monitor();
}

module.exports = VersionMonitor;