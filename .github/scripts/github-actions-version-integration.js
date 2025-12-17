#!/usr/bin/env node

/**
 * GitHub Actions Version Integration Script
 * 
 * Provides enhanced integration between version calculator and GitHub Actions workflow
 * Includes comprehensive error handling and administrator notifications
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitHubActionsVersionIntegration {
    constructor() {
        this.isGitHubActions = !!process.env.GITHUB_ACTIONS;
        this.githubOutput = process.env.GITHUB_OUTPUT;
        this.githubEnv = process.env.GITHUB_ENV;
        this.githubStepSummary = process.env.GITHUB_STEP_SUMMARY;
    }

    /**
     * Set GitHub Actions output
     * @param {string} name - Output name
     * @param {string} value - Output value
     */
    setOutput(name, value) {
        if (this.githubOutput) {
            fs.appendFileSync(this.githubOutput, `${name}=${value}\n`);
        }
        console.log(`::set-output name=${name}::${value}`);
    }

    /**
     * Set GitHub Actions environment variable
     * @param {string} name - Variable name
     * @param {string} value - Variable value
     */
    setEnv(name, value) {
        if (this.githubEnv) {
            fs.appendFileSync(this.githubEnv, `${name}=${value}\n`);
        }
        console.log(`::set-env name=${name}::${value}`);
    }

    /**
     * Add content to GitHub Actions step summary
     * @param {string} content - Markdown content
     */
    addStepSummary(content) {
        if (this.githubStepSummary) {
            fs.appendFileSync(this.githubStepSummary, content + '\n');
        }
    }

    /**
     * Log error in GitHub Actions format
     * @param {string} message - Error message
     * @param {string} file - File path (optional)
     * @param {number} line - Line number (optional)
     */
    logError(message, file = '', line = '') {
        const errorMsg = `::error${file ? ` file=${file}` : ''}${line ? `,line=${line}` : ''}::${message}`;
        console.log(errorMsg);
    }

    /**
     * Log warning in GitHub Actions format
     * @param {string} message - Warning message
     * @param {string} file - File path (optional)
     * @param {number} line - Line number (optional)
     */
    logWarning(message, file = '', line = '') {
        const warningMsg = `::warning${file ? ` file=${file}` : ''}${line ? `,line=${line}` : ''}::${message}`;
        console.log(warningMsg);
    }

    /**
     * Log notice in GitHub Actions format
     * @param {string} message - Notice message
     */
    logNotice(message) {
        console.log(`::notice::${message}`);
    }

    /**
     * Validate version calculation prerequisites
     * @returns {boolean} True if all prerequisites are met
     */
    validatePrerequisites() {
        console.log('🔍 Validating version calculation prerequisites...');

        // Check if git is available
        try {
            execSync('git --version', { stdio: 'pipe' });
        } catch (error) {
            this.logError('Git is not available or not configured properly');
            return false;
        }

        // Check if we're in a git repository
        try {
            execSync('git rev-parse --git-dir', { stdio: 'pipe' });
        } catch (error) {
            this.logError('Not in a git repository');
            return false;
        }

        // Check if version calculator script exists
        const versionCalculatorPath = path.join(__dirname, 'version-calculator.js');
        if (!fs.existsSync(versionCalculatorPath)) {
            this.logError('Version calculator script not found', versionCalculatorPath);
            return false;
        }

        // Check if create-version-tag script exists
        const versionTagPath = path.join(__dirname, 'create-version-tag.sh');
        if (!fs.existsSync(versionTagPath)) {
            this.logError('Version tag script not found', versionTagPath);
            return false;
        }

        console.log('✅ All prerequisites validated');
        return true;
    }

    /**
     * Run version calculation with enhanced error handling
     * @param {Object} options - Configuration options
     * @returns {Promise<Object>} Version calculation results
     */
    async runVersionCalculation(options = {}) {
        const {
            base = 'origin/Kiro/dev',
            head = 'HEAD',
            dryRun = false,
            manualIncrement = null
        } = options;

        console.log('🚀 Starting enhanced version calculation...');

        try {
            // Import and run version calculator
            const VersionCalculator = require('./version-calculator');
            const calculator = new VersionCalculator();

            // Get commits for analysis
            const commits = calculator.getCommits(base, head);
            
            if (commits.length === 0) {
                this.logWarning('No commits found for version calculation');
                this.setOutput('increment_type', 'patch');
                this.setOutput('commits_analyzed', '0');
                return { increment: 'patch', commits: [] };
            }

            console.log(`📝 Analyzing ${commits.length} commits...`);
            this.setOutput('commits_analyzed', commits.length.toString());

            // Calculate version (with manual override if specified)
            let newVersion;
            if (manualIncrement || process.env.MANUAL_INCREMENT) {
                const increment = manualIncrement || process.env.MANUAL_INCREMENT;
                console.log(`🔧 Using manual increment override: ${increment}`);
                
                // Create a mock commit array with the manual increment
                const mockCommits = [`${increment}: manual version increment`];
                newVersion = calculator.calculateNextVersion(mockCommits);
                newVersion.increment = increment; // Override the calculated increment
            } else {
                newVersion = calculator.calculateNextVersion(commits);
            }
            
            console.log(`📊 Version calculation results:`);
            console.log(`   Current version: ${calculator.getLatestVersion().major}.${calculator.getLatestVersion().minor}.${calculator.getLatestVersion().patch}`);
            console.log(`   New version: ${newVersion.versionString}`);
            console.log(`   Increment type: ${newVersion.increment}`);

            // Set GitHub Actions outputs
            this.setOutput('increment_type', newVersion.increment);
            this.setOutput('new_version', newVersion.versionString);
            this.setOutput('version_tag', newVersion.tagString);
            this.setOutput('calculation_success', 'true');

            // Add to step summary
            this.addStepSummary(`## 📊 Version Calculation Results`);
            this.addStepSummary(`- **New Version:** ${newVersion.versionString}`);
            this.addStepSummary(`- **Increment Type:** ${newVersion.increment}`);
            this.addStepSummary(`- **Commits Analyzed:** ${commits.length}`);

            if (!dryRun) {
                // Execute version calculator to update files
                console.log('📁 Updating version files...');
                await calculator.execute({ base, head, skipTag: true });
                
                console.log('✅ Version calculation completed successfully');
                this.logNotice(`Version updated to ${newVersion.versionString}`);
            } else {
                console.log('🔍 Dry run completed - no files updated');
            }

            return {
                version: newVersion.versionString,
                increment: newVersion.increment,
                tag: newVersion.tagString,
                commits: commits
            };

        } catch (error) {
            this.logError(`Version calculation failed: ${error.message}`);
            this.setOutput('calculation_success', 'false');
            this.setOutput('error_message', error.message);
            
            // Add error to step summary
            this.addStepSummary(`## ❌ Version Calculation Failed`);
            this.addStepSummary(`**Error:** ${error.message}`);
            
            throw error;
        }
    }

    /**
     * Create git tags with enhanced error handling
     * @param {Object} versionInfo - Version information
     * @returns {Promise<boolean>} Success status
     */
    async createGitTags(versionInfo) {
        console.log('🏷️ Creating git tags...');

        try {
            // Run create-version-tag script
            const scriptPath = path.join(__dirname, 'create-version-tag.sh');
            
            // Make script executable
            execSync(`chmod +x "${scriptPath}"`);
            
            // Execute script
            const result = execSync(`"${scriptPath}"`, { 
                encoding: 'utf8',
                env: {
                    ...process.env,
                    VERSION_INCREMENT: versionInfo.increment
                }
            });

            console.log('✅ Git tags created successfully');
            this.logNotice(`Git tags created for version ${versionInfo.version}`);
            
            // Parse script output for tag information
            const lines = result.split('\n');
            for (const line of lines) {
                if (line.startsWith('VERSION_TAG=')) {
                    const versionTag = line.split('=')[1];
                    this.setOutput('environment_version_tag', versionTag);
                }
                if (line.startsWith('ENVIRONMENT=')) {
                    const environment = line.split('=')[1];
                    this.setOutput('environment', environment);
                }
                if (line.startsWith('BUILD_NUMBER=')) {
                    const buildNumber = line.split('=')[1];
                    this.setOutput('build_number', buildNumber);
                }
            }

            return true;

        } catch (error) {
            this.logError(`Git tag creation failed: ${error.message}`);
            this.setOutput('tag_creation_success', 'false');
            this.setOutput('tag_error_message', error.message);
            
            // Add error to step summary
            this.addStepSummary(`## ❌ Git Tag Creation Failed`);
            this.addStepSummary(`**Error:** ${error.message}`);
            
            return false;
        }
    }

    /**
     * Validate version synchronization across all files
     * @param {string} expectedVersion - Expected version string
     * @returns {boolean} True if all files are synchronized
     */
    validateVersionSynchronization(expectedVersion) {
        console.log('🔍 Validating version synchronization...');

        const checks = [];

        // Check VERSION file
        try {
            const versionFile = fs.readFileSync('VERSION', 'utf8').trim();
            if (versionFile === expectedVersion) {
                checks.push({ file: 'VERSION', status: 'OK', version: versionFile });
            } else {
                checks.push({ file: 'VERSION', status: 'MISMATCH', version: versionFile, expected: expectedVersion });
            }
        } catch (error) {
            checks.push({ file: 'VERSION', status: 'ERROR', error: error.message });
        }

        // Check package.json
        try {
            const packageJsonPath = 'frontend/package.json';
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.version === expectedVersion) {
                    checks.push({ file: 'package.json', status: 'OK', version: packageJson.version });
                } else {
                    checks.push({ file: 'package.json', status: 'MISMATCH', version: packageJson.version, expected: expectedVersion });
                }
            } else {
                checks.push({ file: 'package.json', status: 'NOT_FOUND' });
            }
        } catch (error) {
            checks.push({ file: 'package.json', status: 'ERROR', error: error.message });
        }

        // Report results
        let allSynced = true;
        for (const check of checks) {
            if (check.status === 'OK') {
                console.log(`✅ ${check.file}: ${check.version}`);
            } else if (check.status === 'MISMATCH') {
                console.log(`❌ ${check.file}: ${check.version} (expected: ${check.expected})`);
                this.logError(`Version mismatch in ${check.file}: got ${check.version}, expected ${check.expected}`);
                allSynced = false;
            } else if (check.status === 'ERROR') {
                console.log(`⚠️ ${check.file}: Error - ${check.error}`);
                this.logWarning(`Could not validate ${check.file}: ${check.error}`);
            } else if (check.status === 'NOT_FOUND') {
                console.log(`⚠️ ${check.file}: Not found`);
                this.logWarning(`${check.file} not found`);
            }
        }

        this.setOutput('version_sync_status', allSynced ? 'synchronized' : 'mismatched');
        
        if (allSynced) {
            console.log('✅ All version files are synchronized');
            this.logNotice('Version synchronization validated successfully');
        } else {
            this.logError('Version files are not synchronized');
        }

        return allSynced;
    }

    /**
     * Send administrator notification on failure
     * @param {string} errorType - Type of error
     * @param {string} errorMessage - Error message
     */
    notifyAdministrators(errorType, errorMessage) {
        console.log('📧 Notifying administrators of version calculation failure...');
        
        // In a real implementation, this would send notifications via:
        // - Slack webhook
        // - Email
        // - Teams webhook
        // - PagerDuty alert
        
        // For now, we'll create a GitHub issue or add to step summary
        this.addStepSummary(`## 🚨 Administrator Notification Required`);
        this.addStepSummary(`**Error Type:** ${errorType}`);
        this.addStepSummary(`**Error Message:** ${errorMessage}`);
        this.addStepSummary(`**Action Required:** Manual intervention needed to resolve version calculation issues`);
        this.addStepSummary(`**Deployment Status:** BLOCKED until version issues are resolved`);
        
        this.logError(`ADMINISTRATOR NOTIFICATION: ${errorType} - ${errorMessage}`);
        
        // Set output to indicate admin notification was sent
        this.setOutput('admin_notified', 'true');
        this.setOutput('deployment_blocked', 'true');
    }

    /**
     * Main execution function
     * @param {Object} options - Configuration options
     */
    async execute(options = {}) {
        const startTime = Date.now();
        
        try {
            console.log('🚀 GitHub Actions Version Integration Starting...');
            
            // Validate prerequisites
            if (!this.validatePrerequisites()) {
                this.notifyAdministrators('PREREQUISITE_FAILURE', 'Version calculation prerequisites not met');
                process.exit(1);
            }

            // Run version calculation
            const versionInfo = await this.runVersionCalculation(options);
            
            // Create git tags
            if (!options.dryRun) {
                const tagSuccess = await this.createGitTags(versionInfo);
                if (!tagSuccess) {
                    this.notifyAdministrators('TAG_CREATION_FAILURE', 'Failed to create git tags');
                    process.exit(1);
                }

                // Validate version synchronization
                if (!this.validateVersionSynchronization(versionInfo.version)) {
                    this.notifyAdministrators('VERSION_SYNC_FAILURE', 'Version files are not synchronized');
                    process.exit(1);
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ Version integration completed successfully in ${duration}s`);
            
            this.setOutput('integration_success', 'true');
            this.setOutput('execution_time', duration);
            
            this.addStepSummary(`## ✅ Version Integration Complete`);
            this.addStepSummary(`**Execution Time:** ${duration} seconds`);
            this.addStepSummary(`**Status:** Ready for deployment`);

        } catch (error) {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.error(`❌ Version integration failed after ${duration}s:`, error.message);
            
            this.setOutput('integration_success', 'false');
            this.setOutput('execution_time', duration);
            
            this.notifyAdministrators('INTEGRATION_FAILURE', error.message);
            process.exit(1);
        }
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--dry-run':
                options.dryRun = true;
                break;
            case '--base':
                options.base = args[++i];
                break;
            case '--head':
                options.head = args[++i];
                break;
            case '--increment':
                options.manualIncrement = args[++i];
                break;
            case '--help':
                console.log(`
GitHub Actions Version Integration

Usage: node github-actions-version-integration.js [options]

Options:
  --dry-run         Show what would be done without making changes
  --base <ref>      Base branch/commit (default: origin/Kiro/dev)
  --head <ref>      Head branch/commit (default: HEAD)
  --increment <type> Manual version increment (patch|minor|major)
  --help            Show this help message

This script provides enhanced integration between the version calculator
and GitHub Actions workflows with comprehensive error handling.
                `);
                process.exit(0);
        }
    }

    const integration = new GitHubActionsVersionIntegration();
    integration.execute(options);
}

module.exports = GitHubActionsVersionIntegration;