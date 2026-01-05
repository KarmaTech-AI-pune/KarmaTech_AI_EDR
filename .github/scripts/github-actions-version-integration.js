#!/usr/bin/env node

/**
 * GitHub Actions Version Integration Script
 * Enhanced version with comprehensive error handling and deployment prevention
 * 
 * Requirements: 4.4, 7.1, 7.2, 4.5, 3.5, 8.1, 8.2, 8.4
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitHubActionsVersionIntegration {
    constructor() {
        this.githubOutput = process.env.GITHUB_OUTPUT;
        this.errors = [];
        this.warnings = [];
    }

    setOutput(name, value) {
        if (this.githubOutput) {
            fs.appendFileSync(this.githubOutput, `${name}=${value}\n`);
        }
        console.log(`Output: ${name}=${value}`);
    }

    /**
     * Send error notification to administrators
     * Requirement: 7.2 - Add administrator notifications for failures
     */
    async sendErrorNotification(error, context = {}) {
        try {
            const VersionErrorNotifier = require('./version-error-notifier');
            const notifier = new VersionErrorNotifier();
            
            await notifier.notifyError({
                type: 'VERSION_INTEGRATION_FAILURE',
                message: error.message || 'Version integration failed',
                details: {
                    ...context,
                    error: error.message,
                    stack: error.stack,
                    branch: process.env.GITHUB_REF_NAME,
                    commit: process.env.GITHUB_SHA,
                    runId: process.env.GITHUB_RUN_ID,
                    actor: process.env.GITHUB_ACTOR
                },
                severity: 'HIGH'
            });
            
            console.log('📢 Error notification sent to administrators');
        } catch (notifyError) {
            console.error('⚠️ Could not send error notification:', notifyError.message);
        }
    }

    /**
     * Verify version synchronization across all locations
     * Requirement: 3.5, 4.5 - Ensure all version locations contain same version
     */
    verifyVersionSync(expectedVersion) {
        const locations = {};
        const mismatches = [];

        // Check VERSION file
        try {
            const versionFilePath = path.join(process.cwd(), 'VERSION');
            if (fs.existsSync(versionFilePath)) {
                locations.versionFile = fs.readFileSync(versionFilePath, 'utf8').trim();
            }
        } catch (error) {
            this.warnings.push(`Could not read VERSION file: ${error.message}`);
        }

        // Check package.json
        try {
            const packageJsonPath = path.join(process.cwd(), 'frontend', 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                locations.packageJson = packageJson.version;
            }
        } catch (error) {
            this.warnings.push(`Could not read package.json: ${error.message}`);
        }

        // Check for mismatches
        for (const [location, version] of Object.entries(locations)) {
            if (expectedVersion && version !== expectedVersion) {
                mismatches.push({
                    location,
                    expected: expectedVersion,
                    actual: version
                });
            }
        }

        // Check if all locations have the same version
        const versions = Object.values(locations);
        const uniqueVersions = [...new Set(versions)];
        
        if (uniqueVersions.length > 1) {
            return {
                synchronized: false,
                locations,
                mismatches,
                message: `Version mismatch detected: ${JSON.stringify(locations)}`
            };
        }

        return {
            synchronized: true,
            locations,
            mismatches: [],
            version: uniqueVersions[0]
        };
    }

    /**
     * Prevent deployment on version errors
     * Requirement: 4.4 - Prevent deployment on version errors
     */
    preventDeployment(reason, details = {}) {
        console.error('🚫 DEPLOYMENT BLOCKED');
        console.error(`   Reason: ${reason}`);
        if (Object.keys(details).length > 0) {
            console.error('   Details:', JSON.stringify(details, null, 2));
        }

        this.setOutput('integration_success', 'false');
        this.setOutput('deployment_blocked', 'true');
        this.setOutput('block_reason', reason);
        this.setOutput('error_message', reason);

        // Create blocking file for workflow to check
        try {
            const blockFile = path.join(process.cwd(), '.github', 'monitoring', 'deployment-blocked.json');
            const blockDir = path.dirname(blockFile);
            if (!fs.existsSync(blockDir)) {
                fs.mkdirSync(blockDir, { recursive: true });
            }
            fs.writeFileSync(blockFile, JSON.stringify({
                blocked: true,
                reason,
                details,
                timestamp: new Date().toISOString(),
                branch: process.env.GITHUB_REF_NAME,
                commit: process.env.GITHUB_SHA
            }, null, 2));
        } catch (error) {
            console.error('Could not create block file:', error.message);
        }

        return false;
    }

    async execute(options = {}) {
        const { base = 'origin/Kiro/dev', head = 'HEAD', dryRun = false } = options;
        const startTime = Date.now();

        console.log('🚀 GitHub Actions Version Integration Starting...');
        console.log(`   Base: ${base}`);
        console.log(`   Head: ${head}`);
        console.log(`   Dry Run: ${dryRun}`);

        try {
            // Import and run version calculator
            const VersionCalculator = require('./version-calculator');
            const calculator = new VersionCalculator({ timeout: 30000 });

            // Run version calculation (this updates files)
            let newVersion;
            try {
                newVersion = await calculator.execute({ base, head, dryRun, skipTag: true });
            } catch (calcError) {
                // Version calculation failed - prevent deployment (Requirement 4.4)
                await this.sendErrorNotification(calcError, { phase: 'version_calculation' });
                this.preventDeployment(`Version calculation failed: ${calcError.message}`, {
                    error: calcError.message,
                    type: calcError.type || 'UNKNOWN'
                });
                throw calcError;
            }

            if (!newVersion) {
                console.log('ℹ️ No version changes needed');
                this.setOutput('integration_success', 'true');
                this.setOutput('new_version', 'unchanged');
                this.setOutput('deployment_blocked', 'false');
                return;
            }

            // Verify version synchronization (Requirement 3.5, 4.5)
            const syncStatus = this.verifyVersionSync(newVersion.versionString);
            if (!syncStatus.synchronized) {
                const error = new Error(`Version mismatch detected: ${syncStatus.message}`);
                await this.sendErrorNotification(error, { 
                    phase: 'version_sync',
                    locations: syncStatus.locations,
                    mismatches: syncStatus.mismatches
                });
                
                // Try to send specific mismatch notification
                try {
                    const VersionErrorNotifier = require('./version-error-notifier');
                    const notifier = new VersionErrorNotifier();
                    for (const mismatch of syncStatus.mismatches) {
                        await notifier.notifyVersionMismatch(
                            mismatch.expected,
                            mismatch.actual,
                            mismatch.location
                        );
                    }
                } catch (notifyError) {
                    console.error('Could not send mismatch notification:', notifyError.message);
                }
                
                this.preventDeployment('Version files are not synchronized', syncStatus);
                throw error;
            }

            // Set outputs for GitHub Actions
            this.setOutput('new_version', newVersion.versionString);
            this.setOutput('version_tag', newVersion.tagString);
            this.setOutput('increment_type', newVersion.increment);
            this.setOutput('commits_analyzed', newVersion.metrics?.commitsAnalyzed || '0');
            this.setOutput('deployment_blocked', 'false');

            if (!dryRun) {
                // Create git tags using the shell script
                console.log('🏷️ Creating git tags...');
                try {
                    const scriptPath = path.join(__dirname, 'create-version-tag.sh');
                    execSync(`bash "${scriptPath}"`, { 
                        stdio: 'inherit',
                        env: { ...process.env, VERSION_INCREMENT: newVersion.increment },
                        timeout: 60000 // 60 second timeout for tag creation
                    });
                    console.log('✅ Git tags created');
                } catch (tagError) {
                    console.log('⚠️ Tag creation via script failed, creating manually...');
                    // Create simple tag manually
                    try {
                        execSync(`git tag -a ${newVersion.tagString} -m "Release ${newVersion.tagString}"`, { 
                            stdio: 'inherit',
                            timeout: 30000
                        });
                        execSync(`git push origin ${newVersion.tagString}`, { 
                            stdio: 'inherit',
                            timeout: 30000
                        });
                        console.log(`✅ Created and pushed tag: ${newVersion.tagString}`);
                    } catch (e) {
                        // Tag creation failure is a warning, not a blocker
                        this.warnings.push(`Could not create tag: ${e.message}`);
                        console.log(`⚠️ Could not create tag: ${e.message}`);
                    }
                }

                // Commit updated files
                console.log('📝 Committing version updates...');
                try {
                    execSync('git add VERSION frontend/package.json CHANGELOG.md', { stdio: 'pipe', timeout: 10000 });
                    execSync(`git commit -m "chore: bump version to ${newVersion.versionString}" --allow-empty`, { stdio: 'pipe', timeout: 10000 });
                    execSync('git push', { stdio: 'pipe', timeout: 30000 });
                    console.log('✅ Version files committed and pushed');
                } catch (commitError) {
                    console.log('⚠️ Could not commit (files may already be committed)');
                }
            }

            // Get environment info
            const branchName = process.env.GITHUB_REF_NAME || 'dev';
            const environment = branchName.includes('prod') ? 'prod' : 'dev';
            const buildNumber = Date.now().toString().slice(-6);
            const envTag = `v${newVersion.versionString}-${environment}.${new Date().toISOString().slice(0,10).replace(/-/g,'')}.${buildNumber}`;

            this.setOutput('environment', environment);
            this.setOutput('build_number', buildNumber);
            this.setOutput('environment_version_tag', envTag);
            this.setOutput('commit_sha', process.env.GITHUB_SHA || 'local');
            this.setOutput('version_sync_status', 'synchronized');
            this.setOutput('integration_success', 'true');

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            this.setOutput('execution_time', duration);

            // Check if execution time exceeded target (Requirement 7.3)
            if (parseFloat(duration) > 30) {
                this.warnings.push(`Execution time (${duration}s) exceeded 30 second target`);
            }

            console.log(`\n✅ Version integration completed in ${duration}s`);
            console.log(`   Version: ${newVersion.versionString}`);
            console.log(`   Tag: ${newVersion.tagString}`);
            console.log(`   Environment Tag: ${envTag}`);
            
            if (this.warnings.length > 0) {
                console.log(`   Warnings: ${this.warnings.length}`);
                this.warnings.forEach(w => console.log(`      ⚠️ ${w}`));
            }

            // Record success metrics for monitoring (Requirement 8.1, 8.2)
            this.recordMetrics({
                success: true,
                version: newVersion.versionString,
                duration: parseFloat(duration),
                warnings: this.warnings.length,
                environment
            });

        } catch (error) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            console.error('❌ Version integration failed:', error.message);
            this.setOutput('integration_success', 'false');
            this.setOutput('error_message', error.message);
            this.setOutput('execution_time', duration);

            // Record failure metrics for monitoring (Requirement 8.1, 8.2)
            this.recordMetrics({
                success: false,
                error: error.message,
                duration: parseFloat(duration),
                warnings: this.warnings.length
            });

            process.exit(1);
        }
    }

    /**
     * Record metrics for monitoring
     * Requirement: 8.1, 8.2 - Monitor version calculation success rate
     */
    recordMetrics(metrics) {
        try {
            const metricsDir = path.join(process.cwd(), '.github', 'monitoring');
            if (!fs.existsSync(metricsDir)) {
                fs.mkdirSync(metricsDir, { recursive: true });
            }

            const metricsFile = path.join(metricsDir, 'version-integration-metrics.json');
            let existingMetrics = { runs: [] };
            
            if (fs.existsSync(metricsFile)) {
                try {
                    existingMetrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
                } catch {
                    existingMetrics = { runs: [] };
                }
            }

            // Add new run metrics
            existingMetrics.runs.push({
                timestamp: new Date().toISOString(),
                ...metrics,
                branch: process.env.GITHUB_REF_NAME,
                commit: process.env.GITHUB_SHA,
                runId: process.env.GITHUB_RUN_ID
            });

            // Keep only last 100 runs
            if (existingMetrics.runs.length > 100) {
                existingMetrics.runs = existingMetrics.runs.slice(-100);
            }

            // Calculate success rate
            const recentRuns = existingMetrics.runs.slice(-20);
            const successCount = recentRuns.filter(r => r.success).length;
            existingMetrics.successRate = (successCount / recentRuns.length * 100).toFixed(1);
            existingMetrics.lastUpdated = new Date().toISOString();

            fs.writeFileSync(metricsFile, JSON.stringify(existingMetrics, null, 2));
            console.log(`📊 Metrics recorded (Success rate: ${existingMetrics.successRate}%)`);
        } catch (error) {
            console.error('Could not record metrics:', error.message);
        }
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--dry-run': options.dryRun = true; break;
            case '--base': options.base = args[++i]; break;
            case '--head': options.head = args[++i]; break;
        }
    }

    const integration = new GitHubActionsVersionIntegration();
    integration.execute(options);
}

module.exports = GitHubActionsVersionIntegration;
