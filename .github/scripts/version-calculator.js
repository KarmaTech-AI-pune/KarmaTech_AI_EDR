#!/usr/bin/env node

/**
 * Automatic Version Calculator with Enhanced Error Handling
 * Calculates semantic version increments based on conventional commit messages
 * Includes monitoring integration and comprehensive error handling
 * 
 * Requirements: 4.4, 7.1, 7.2, 4.5, 3.5, 8.1, 8.2, 8.4
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Error types for version calculation
const VersionErrorTypes = {
    GIT_NOT_AVAILABLE: 'GIT_NOT_AVAILABLE',
    INVALID_REPOSITORY: 'INVALID_REPOSITORY',
    BRANCH_NOT_FOUND: 'BRANCH_NOT_FOUND',
    VERSION_PARSE_ERROR: 'VERSION_PARSE_ERROR',
    FILE_UPDATE_ERROR: 'FILE_UPDATE_ERROR',
    TAG_CREATION_ERROR: 'TAG_CREATION_ERROR',
    VERSION_MISMATCH: 'VERSION_MISMATCH',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

class VersionCalculationError extends Error {
    constructor(type, message, details = {}) {
        super(message);
        this.name = 'VersionCalculationError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.recoverable = this.isRecoverable(type);
    }

    isRecoverable(type) {
        const recoverableErrors = [
            VersionErrorTypes.FILE_UPDATE_ERROR,
            VersionErrorTypes.TAG_CREATION_ERROR
        ];
        return recoverableErrors.includes(type);
    }

    toJSON() {
        return {
            name: this.name,
            type: this.type,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp,
            recoverable: this.recoverable,
            stack: this.stack
        };
    }
}

class VersionCalculator {
    constructor(options = {}) {
        this.conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)(\(.+\))?(!)?: (.+)/;
        this.breakingChangeRegex = /BREAKING CHANGE:/;
        this.timeout = options.timeout || 30000; // 30 second timeout (Requirement 7.3)
        this.errors = [];
        this.warnings = [];
        this.metrics = {
            startTime: null,
            endTime: null,
            commitsAnalyzed: 0,
            filesUpdated: 0,
            tagsCreated: 0
        };
    }

    /**
     * Add error to tracking list
     */
    addError(error) {
        this.errors.push(error);
        console.error(`❌ ERROR [${error.type}]: ${error.message}`);
        if (error.details && Object.keys(error.details).length > 0) {
            console.error('   Details:', JSON.stringify(error.details, null, 2));
        }
    }

    /**
     * Add warning to tracking list
     */
    addWarning(message, details = {}) {
        const warning = { message, details, timestamp: new Date().toISOString() };
        this.warnings.push(warning);
        console.warn(`⚠️ WARNING: ${message}`);
    }

    /**
     * Validate git repository is available and valid
     * Requirement: 4.4 - Handle version calculation failures gracefully
     */
    validateGitRepository() {
        try {
            // Check if git is available
            execSync('git --version', { stdio: 'pipe', timeout: 5000 });
        } catch (error) {
            throw new VersionCalculationError(
                VersionErrorTypes.GIT_NOT_AVAILABLE,
                'Git is not available or not installed',
                { originalError: error.message }
            );
        }

        try {
            // Check if we're in a git repository
            execSync('git rev-parse --git-dir', { stdio: 'pipe', timeout: 5000 });
            return true;
        } catch (error) {
            throw new VersionCalculationError(
                VersionErrorTypes.INVALID_REPOSITORY,
                'Not a valid git repository',
                { cwd: process.cwd(), originalError: error.message }
            );
        }
    }

    /**
     * Validate branch exists
     * Requirement: 4.4 - Handle version calculation failures gracefully
     */
    validateBranch(branchName) {
        try {
            execSync(`git rev-parse --verify ${branchName}`, { stdio: 'pipe', timeout: 5000 });
            return true;
        } catch (error) {
            throw new VersionCalculationError(
                VersionErrorTypes.BRANCH_NOT_FOUND,
                `Branch '${branchName}' does not exist`,
                { branch: branchName, originalError: error.message }
            );
        }
    }

    /**
     * Verify all version locations are synchronized
     * Requirement: 3.5, 4.5 - Ensure all version locations contain same version
     */
    verifyVersionSync() {
        const versions = {};
        const mismatches = [];

        // Read VERSION file
        try {
            const versionFilePath = path.join(process.cwd(), 'VERSION');
            if (fs.existsSync(versionFilePath)) {
                versions.versionFile = fs.readFileSync(versionFilePath, 'utf8').trim();
            }
        } catch (error) {
            this.addWarning('Could not read VERSION file', { error: error.message });
        }

        // Read package.json version
        try {
            const packageJsonPath = path.join(process.cwd(), 'frontend', 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                versions.packageJson = packageJson.version;
            }
        } catch (error) {
            this.addWarning('Could not read frontend/package.json', { error: error.message });
        }

        // Check for mismatches
        const versionValues = Object.values(versions).filter(v => v);
        const uniqueVersions = [...new Set(versionValues)];

        if (uniqueVersions.length > 1) {
            mismatches.push({
                locations: versions,
                uniqueVersions
            });
        }

        return {
            synchronized: mismatches.length === 0,
            versions,
            mismatches
        };
    }

    parseCommit(commitMessage) {
        try {
            const match = commitMessage.match(this.conventionalCommitRegex);
            if (!match) {
                return {
                    type: 'unknown',
                    scope: null,
                    breaking: this.breakingChangeRegex.test(commitMessage),
                    description: commitMessage,
                    valid: false
                };
            }
            return {
                type: match[1],
                scope: match[2] ? match[2].slice(1, -1) : null,
                breaking: !!match[3] || this.breakingChangeRegex.test(commitMessage),
                description: match[4],
                valid: true
            };
        } catch (error) {
            this.addWarning('Failed to parse commit message', { message: commitMessage, error: error.message });
            return {
                type: 'unknown',
                scope: null,
                breaking: false,
                description: commitMessage,
                valid: false
            };
        }
    }

    getCommits(base = 'Kiro/dev', head = 'HEAD') {
        try {
            const gitLog = execSync(
                `git log ${base}..${head} --pretty=format:"%H|%s|%an|%ae|%ad" --date=iso`,
                { encoding: 'utf8', timeout: this.timeout }
            );
            const commits = gitLog.split('\n').filter(line => line.trim()).map(line => {
                const parts = line.split('|');
                if (parts.length >= 5) {
                    return {
                        hash: parts[0],
                        subject: parts[1],
                        author: parts[2],
                        email: parts[3],
                        date: parts[4]
                    };
                }
                return null;
            }).filter(commit => commit !== null);
            
            this.metrics.commitsAnalyzed = commits.length;
            return commits;
        } catch (error) {
            if (error.killed) {
                throw new VersionCalculationError(
                    VersionErrorTypes.TIMEOUT_ERROR,
                    'Git log command timed out',
                    { base, head, timeout: this.timeout }
                );
            }
            this.addWarning('Error getting commits, returning empty list', { error: error.message });
            return [];
        }
    }

    getLatestVersion() {
        try {
            const tags = execSync('git tag -l "v*" --sort=-version:refname', { encoding: 'utf8' });
            const tagList = tags.split('\n').filter(tag => tag.trim());
            
            for (const tag of tagList) {
                const versionMatch = tag.match(/^v(\d+)\.(\d+)\.(\d+)(?:-.*)?$/);
                if (versionMatch) {
                    return {
                        major: parseInt(versionMatch[1]),
                        minor: parseInt(versionMatch[2]),
                        patch: parseInt(versionMatch[3])
                    };
                }
            }
            
            // Fallback to VERSION file
            const versionFilePath = path.join(process.cwd(), 'VERSION');
            if (fs.existsSync(versionFilePath)) {
                const content = fs.readFileSync(versionFilePath, 'utf8').trim();
                const match = content.match(/^(\d+)\.(\d+)\.(\d+)$/);
                if (match) {
                    return {
                        major: parseInt(match[1]),
                        minor: parseInt(match[2]),
                        patch: parseInt(match[3])
                    };
                }
            }
            
            return { major: 1, minor: 0, patch: 0 };
        } catch (error) {
            return { major: 1, minor: 0, patch: 0 };
        }
    }

    calculateIncrement(commits) {
        let hasFeat = false;
        let hasFix = false;
        let hasBreaking = false;

        for (const commit of commits) {
            const message = typeof commit === 'string' ? commit : commit.subject;
            const parsed = this.parseCommit(message);
            
            if (parsed.breaking) {
                hasBreaking = true;
                break;
            }
            if (parsed.type === 'feat') hasFeat = true;
            if (parsed.type === 'fix') hasFix = true;
        }

        if (hasBreaking) return 'major';
        if (hasFeat) return 'minor';
        return 'patch';
    }

    calculateNextVersion(commits) {
        const currentVersion = this.getLatestVersion();
        const increment = this.calculateIncrement(commits);
        const newVersion = { ...currentVersion };

        switch (increment) {
            case 'major':
                newVersion.major += 1;
                newVersion.minor = 0;
                newVersion.patch = 0;
                break;
            case 'minor':
                newVersion.minor += 1;
                newVersion.patch = 0;
                break;
            case 'patch':
                newVersion.patch += 1;
                break;
        }

        return {
            ...newVersion,
            increment,
            versionString: `${newVersion.major}.${newVersion.minor}.${newVersion.patch}`,
            tagString: `v${newVersion.major}.${newVersion.minor}.${newVersion.patch}`
        };
    }

    updateVersionFile(version) {
        try {
            const versionFilePath = path.join(process.cwd(), 'VERSION');
            fs.writeFileSync(versionFilePath, version.versionString);
            console.log(`✅ Updated VERSION file: ${version.versionString}`);
            this.metrics.filesUpdated++;
            return true;
        } catch (error) {
            const versionError = new VersionCalculationError(
                VersionErrorTypes.FILE_UPDATE_ERROR,
                `Failed to update VERSION file: ${error.message}`,
                { file: 'VERSION', version: version.versionString }
            );
            this.addError(versionError);
            return false;
        }
    }

    updatePackageJson(version) {
        try {
            const packageJsonPath = path.join(process.cwd(), 'frontend', 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                this.addWarning('Frontend package.json not found, skipping', { path: packageJsonPath });
                return true;
            }
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            packageJson.version = version.versionString;
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
            console.log(`✅ Updated package.json: ${version.versionString}`);
            this.metrics.filesUpdated++;
            return true;
        } catch (error) {
            const versionError = new VersionCalculationError(
                VersionErrorTypes.FILE_UPDATE_ERROR,
                `Failed to update package.json: ${error.message}`,
                { file: 'frontend/package.json', version: version.versionString }
            );
            this.addError(versionError);
            return false;
        }
    }

    updateDotNetProjects(version) {
        const projectFiles = [
            'backend/src/NJSAPI/NJSAPI.csproj',
            'backend/src/NJS.Application/NJS.Application.csproj',
            'backend/src/NJS.Domain/NJS.Domain.csproj'
        ];

        for (const projectFile of projectFiles) {
            const projectPath = path.join(process.cwd(), projectFile);
            if (!fs.existsSync(projectPath)) continue;

            try {
                let content = fs.readFileSync(projectPath, 'utf8');
                if (content.includes('<Version>')) {
                    content = content.replace(/<Version>[^<]*<\/Version>/g, `<Version>${version.versionString}</Version>`);
                }
                fs.writeFileSync(projectPath, content);
                console.log(`✅ Updated ${projectFile}: ${version.versionString}`);
            } catch (error) {
                console.warn(`⚠️ Could not update ${projectFile}: ${error.message}`);
            }
        }
        return true;
    }

    generateReleaseNotes(commits, version) {
        const features = [];
        const bugFixes = [];
        const other = [];

        for (const commit of commits) {
            const message = typeof commit === 'string' ? commit : commit.subject;
            const parsed = this.parseCommit(message);
            const info = { ...parsed, author: commit.author, hash: commit.hash };
            
            if (parsed.type === 'feat') features.push(info);
            else if (parsed.type === 'fix') bugFixes.push(info);
            else other.push(info);
        }

        return { version: version.versionString, features, bugFixes, other, totalCommits: commits.length };
    }

    updateChangelog(releaseNotes) {
        try {
            const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
            let content = fs.existsSync(changelogPath) 
                ? fs.readFileSync(changelogPath, 'utf8')
                : '# Changelog\n\n';

            let newEntry = `\n## v${releaseNotes.version} - ${new Date().toISOString().split('T')[0]}\n\n`;
            
            if (releaseNotes.features.length > 0) {
                newEntry += '### ✨ Features\n';
                releaseNotes.features.forEach(f => newEntry += `- ${f.description} (${f.author})\n`);
                newEntry += '\n';
            }
            if (releaseNotes.bugFixes.length > 0) {
                newEntry += '### 🐛 Bug Fixes\n';
                releaseNotes.bugFixes.forEach(f => newEntry += `- ${f.description} (${f.author})\n`);
                newEntry += '\n';
            }
            if (releaseNotes.other.length > 0) {
                newEntry += '### 🔧 Other\n';
                releaseNotes.other.forEach(f => newEntry += `- ${f.description} (${f.author})\n`);
                newEntry += '\n';
            }

            // Insert after header
            const headerEnd = content.indexOf('\n\n') + 2;
            content = content.slice(0, headerEnd) + newEntry + content.slice(headerEnd);
            
            fs.writeFileSync(changelogPath, content);
            console.log('✅ Updated CHANGELOG.md');
            return true;
        } catch (error) {
            console.error(`❌ Failed to update CHANGELOG: ${error.message}`);
            return false;
        }
    }

    async execute(options = {}) {
        const { base = 'Kiro/dev', head = 'HEAD', dryRun = false, skipTag = false, skipFiles = false } = options;
        this.metrics.startTime = Date.now();

        try {
            console.log('🚀 Starting automatic version calculation...\n');

            // Validate git repository (Requirement 4.4)
            if (!this.validateGitRepository()) {
                throw new VersionCalculationError(
                    VersionErrorTypes.INVALID_REPOSITORY,
                    'Not a valid git repository or git is not available'
                );
            }

            // Validate base branch exists (Requirement 4.4)
            try {
                this.validateBranch(base);
            } catch (branchError) {
                // Try without origin prefix
                const baseBranch = base.replace('origin/', '');
                try {
                    this.validateBranch(baseBranch);
                } catch {
                    throw branchError;
                }
            }

            // Check version synchronization before proceeding (Requirement 3.5, 4.5)
            const syncStatus = this.verifyVersionSync();
            if (!syncStatus.synchronized) {
                this.addWarning('Version files are not synchronized before update', {
                    versions: syncStatus.versions,
                    mismatches: syncStatus.mismatches
                });
            }

            const commits = this.getCommits(base, head);
            if (commits.length === 0) {
                console.log('ℹ️ No commits found, skipping version calculation');
                this.metrics.endTime = Date.now();
                return null;
            }

            console.log(`📝 Found ${commits.length} commits:`);
            commits.forEach(commit => {
                const parsed = this.parseCommit(commit.subject);
                const icon = parsed.type === 'feat' ? '✨' : parsed.type === 'fix' ? '🐛' : '🔧';
                console.log(`   ${icon} ${commit.subject} (${commit.author})`);
            });
            console.log();

            const currentVersion = this.getLatestVersion();
            if (!currentVersion) {
                throw new VersionCalculationError(
                    VersionErrorTypes.VERSION_PARSE_ERROR,
                    'Could not determine current version'
                );
            }

            const newVersion = this.calculateNextVersion(commits);

            console.log(`📊 Version Analysis:`);
            console.log(`   Current: v${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`);
            console.log(`   New:     ${newVersion.tagString} (${newVersion.increment} increment)`);
            console.log();

            if (dryRun) {
                console.log('🔍 Dry run mode - no changes will be made');
                this.metrics.endTime = Date.now();
                return newVersion;
            }

            let updateSuccess = true;
            if (!skipFiles) {
                console.log('📁 Updating version files...');
                
                const versionFileResult = this.updateVersionFile(newVersion);
                const packageJsonResult = this.updatePackageJson(newVersion);
                const dotNetResult = this.updateDotNetProjects(newVersion);
                
                updateSuccess = versionFileResult && packageJsonResult;
                
                if (!updateSuccess) {
                    // Check if errors are recoverable (Requirement 4.4)
                    const criticalErrors = this.errors.filter(e => !e.recoverable);
                    if (criticalErrors.length > 0) {
                        throw new VersionCalculationError(
                            VersionErrorTypes.FILE_UPDATE_ERROR,
                            'Critical file update errors occurred',
                            { errors: criticalErrors.map(e => e.toJSON()) }
                        );
                    }
                }
                
                const releaseNotes = this.generateReleaseNotes(commits, newVersion);
                this.updateChangelog(releaseNotes);
            }

            // Verify version synchronization after update (Requirement 3.5, 4.5)
            if (!skipFiles) {
                const postSyncStatus = this.verifyVersionSync();
                if (!postSyncStatus.synchronized) {
                    throw new VersionCalculationError(
                        VersionErrorTypes.VERSION_MISMATCH,
                        'Version files are not synchronized after update',
                        { versions: postSyncStatus.versions, mismatches: postSyncStatus.mismatches }
                    );
                }
                console.log('✅ Version synchronization verified');
            }

            this.metrics.endTime = Date.now();
            const executionTime = (this.metrics.endTime - this.metrics.startTime) / 1000;

            // Check execution time (Requirement 7.3 - within 30 seconds)
            if (executionTime > 30) {
                this.addWarning('Version calculation exceeded 30 second target', {
                    executionTime: `${executionTime.toFixed(2)}s`,
                    target: '30s'
                });
            }

            console.log('\n✅ Version calculation completed successfully');
            console.log(`   Execution time: ${executionTime.toFixed(2)}s`);
            console.log(`   Files updated: ${this.metrics.filesUpdated}`);
            console.log(`   Commits analyzed: ${this.metrics.commitsAnalyzed}`);
            
            if (this.warnings.length > 0) {
                console.log(`   Warnings: ${this.warnings.length}`);
            }

            return {
                ...newVersion,
                metrics: this.metrics,
                warnings: this.warnings,
                errors: this.errors
            };

        } catch (error) {
            this.metrics.endTime = Date.now();
            
            // Wrap non-VersionCalculationError errors
            if (!(error instanceof VersionCalculationError)) {
                error = new VersionCalculationError(
                    VersionErrorTypes.VALIDATION_ERROR,
                    error.message,
                    { originalError: error.stack }
                );
            }
            
            this.addError(error);
            
            // Generate error report for monitoring
            this.generateErrorReport(error);
            
            throw error;
        }
    }

    /**
     * Generate error report for monitoring and notifications
     * Requirement: 7.2 - Add administrator notifications for failures
     */
    generateErrorReport(error) {
        const report = {
            timestamp: new Date().toISOString(),
            error: error.toJSON ? error.toJSON() : {
                message: error.message,
                stack: error.stack
            },
            metrics: this.metrics,
            warnings: this.warnings,
            errors: this.errors.map(e => e.toJSON ? e.toJSON() : e),
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                cwd: process.cwd(),
                githubRef: process.env.GITHUB_REF_NAME,
                githubSha: process.env.GITHUB_SHA,
                githubRunId: process.env.GITHUB_RUN_ID
            }
        };

        // Write error report to file for monitoring
        try {
            const reportDir = path.join(process.cwd(), '.github', 'monitoring');
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            const reportPath = path.join(reportDir, 'version-error-report.json');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`📄 Error report saved to: ${reportPath}`);
        } catch (writeError) {
            console.error('Could not write error report:', writeError.message);
        }

        return report;
    }

    /**
     * Get execution summary for monitoring
     */
    getExecutionSummary() {
        return {
            success: this.errors.filter(e => !e.recoverable).length === 0,
            metrics: this.metrics,
            warnings: this.warnings.length,
            errors: this.errors.length,
            recoverableErrors: this.errors.filter(e => e.recoverable).length,
            criticalErrors: this.errors.filter(e => !e.recoverable).length
        };
    }
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--dry-run': options.dryRun = true; break;
            case '--skip-tag': options.skipTag = true; break;
            case '--skip-files': options.skipFiles = true; break;
            case '--base': options.base = args[++i]; break;
            case '--head': options.head = args[++i]; break;
            case '--timeout': options.timeout = parseInt(args[++i], 10); break;
            case '--help':
                console.log('Usage: node version-calculator.js [--dry-run] [--base <ref>] [--head <ref>] [--timeout <ms>]');
                console.log('\nOptions:');
                console.log('  --dry-run      Run without making changes');
                console.log('  --skip-tag     Skip git tag creation');
                console.log('  --skip-files   Skip file updates');
                console.log('  --base <ref>   Base branch/ref for comparison (default: Kiro/dev)');
                console.log('  --head <ref>   Head branch/ref for comparison (default: HEAD)');
                console.log('  --timeout <ms> Timeout for git operations in milliseconds (default: 30000)');
                process.exit(0);
        }
    }

    const calculator = new VersionCalculator(options);
    calculator.execute(options)
        .then(result => {
            if (result) {
                const summary = calculator.getExecutionSummary();
                if (!summary.success) {
                    console.error('❌ Version calculation completed with critical errors');
                    process.exit(1);
                }
                if (summary.warnings > 0) {
                    console.warn(`⚠️ Version calculation completed with ${summary.warnings} warning(s)`);
                }
            }
        })
        .catch(error => {
            console.error('❌ Version calculation failed:', error.message);
            
            // Try to send notification for critical failures
            try {
                const VersionErrorNotifier = require('./version-error-notifier');
                const notifier = new VersionErrorNotifier();
                notifier.notifyVersionCalculationFailure(error);
            } catch (notifyError) {
                console.error('Could not send error notification:', notifyError.message);
            }
            
            process.exit(1);
        });
}

// Export classes and error types
module.exports = VersionCalculator;
module.exports.VersionCalculationError = VersionCalculationError;
module.exports.VersionErrorTypes = VersionErrorTypes;
