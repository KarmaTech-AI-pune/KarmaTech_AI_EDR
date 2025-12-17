#!/usr/bin/env node

/**
 * Automatic Version Calculator
 * 
 * Calculates semantic version increments based on conventional commit messages
 * Supports MAJOR.MINOR.PATCH versioning with automatic git tag creation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VersionCalculator {
    constructor() {
        this.conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)(\(.+\))?(!)?: (.+)/;
        this.breakingChangeRegex = /BREAKING CHANGE:/;
    }

    /**
     * Parse conventional commit message
     * @param {string} commitMessage - The commit message to parse
     * @returns {Object} Parsed commit information
     */
    parseCommit(commitMessage) {
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
            scope: match[2] ? match[2].slice(1, -1) : null, // Remove parentheses
            breaking: !!match[3] || this.breakingChangeRegex.test(commitMessage),
            description: match[4],
            valid: true
        };
    }

    /**
     * Get commits from a PR or commit range
     * @param {string} base - Base branch (e.g., 'Kiro/dev')
     * @param {string} head - Head branch or commit
     * @returns {Array} Array of commit messages
     */
    getCommits(base = 'Kiro/dev', head = 'HEAD') {
        try {
            const gitLog = execSync(
                `git log ${base}..${head} --pretty=format:"%s"`,
                { encoding: 'utf8' }
            );
            
            return gitLog.split('\n').filter(line => line.trim());
        } catch (error) {
            console.error('Error getting commits:', error.message);
            return [];
        }
    }

    /**
     * Get the latest version from git tags
     * @returns {Object} Version object with major, minor, patch
     */
    getLatestVersion() {
        try {
            const tags = execSync('git tag -l "v*" --sort=-version:refname', { encoding: 'utf8' });
            const tagList = tags.split('\n').filter(tag => tag.trim());
            
            if (tagList.length === 0) {
                return { major: 1, minor: 0, patch: 0 };
            }

            // Find the first valid semantic version tag
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

            // If no valid semantic version found, check VERSION file as fallback
            try {
                const versionFilePath = path.join(process.cwd(), 'VERSION');
                if (fs.existsSync(versionFilePath)) {
                    const versionContent = fs.readFileSync(versionFilePath, 'utf8').trim();
                    const versionMatch = versionContent.match(/^(\d+)\.(\d+)\.(\d+)$/);
                    if (versionMatch) {
                        console.log(`Using version from VERSION file: ${versionContent}`);
                        return {
                            major: parseInt(versionMatch[1]),
                            minor: parseInt(versionMatch[2]),
                            patch: parseInt(versionMatch[3])
                        };
                    }
                }
            } catch (fileError) {
                console.warn('Could not read VERSION file:', fileError.message);
            }

            console.warn('No valid version tags found, starting from 1.0.0');
            return { major: 1, minor: 0, patch: 0 };
        } catch (error) {
            console.warn('Error getting version tags, starting from 1.0.0:', error.message);
            return { major: 1, minor: 0, patch: 0 };
        }
    }

    /**
     * Calculate version increment based on commit types
     * @param {Array} commits - Array of commit messages
     * @returns {string} Version increment type: 'major', 'minor', or 'patch'
     */
    calculateIncrement(commits) {
        let hasFeat = false;
        let hasFix = false;
        let hasBreaking = false;

        for (const commit of commits) {
            const parsed = this.parseCommit(commit);
            
            if (parsed.breaking) {
                hasBreaking = true;
                break; // Breaking change takes precedence
            }
            
            if (parsed.type === 'feat') {
                hasFeat = true;
            } else if (parsed.type === 'fix') {
                hasFix = true;
            }
        }

        if (hasBreaking) return 'major';
        if (hasFeat) return 'minor';
        if (hasFix) return 'patch';
        
        // Default to patch for any other changes
        return 'patch';
    }

    /**
     * Calculate next version
     * @param {Array} commits - Array of commit messages
     * @returns {Object} New version object
     */
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

    /**
     * Create git tag for version
     * @param {Object} version - Version object
     * @returns {boolean} Success status
     */
    createGitTag(version) {
        try {
            const tagMessage = `Release ${version.tagString}`;
            execSync(`git tag -a ${version.tagString} -m "${tagMessage}"`, { stdio: 'inherit' });
            console.log(`✅ Created git tag: ${version.tagString}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to create git tag: ${error.message}`);
            return false;
        }
    }

    /**
     * Update VERSION file in repository root
     * @param {Object} version - Version object
     * @returns {boolean} Success status
     */
    updateVersionFile(version) {
        try {
            const versionFilePath = path.join(process.cwd(), 'VERSION');
            fs.writeFileSync(versionFilePath, version.versionString);
            console.log(`✅ Updated VERSION file: ${version.versionString}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to update VERSION file: ${error.message}`);
            return false;
        }
    }

    /**
     * Update package.json version
     * @param {Object} version - Version object
     * @returns {boolean} Success status
     */
    updatePackageJson(version) {
        try {
            const packageJsonPath = path.join(process.cwd(), 'frontend', 'package.json');
            
            if (!fs.existsSync(packageJsonPath)) {
                console.warn('⚠️ Frontend package.json not found, skipping update');
                return true;
            }

            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            packageJson.version = version.versionString;
            
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
            console.log(`✅ Updated package.json version: ${version.versionString}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to update package.json: ${error.message}`);
            return false;
        }
    }

    /**
     * Update .NET project files with version information
     * @param {Object} version - Version object
     * @returns {boolean} Success status
     */
    updateDotNetProjects(version) {
        try {
            const projectFiles = [
                'backend/src/NJSAPI/NJSAPI.csproj',
                'backend/src/NJS.Application/NJS.Application.csproj',
                'backend/src/NJS.Domain/NJS.Domain.csproj'
            ];

            let updatedCount = 0;

            for (const projectFile of projectFiles) {
                const projectPath = path.join(process.cwd(), projectFile);
                
                if (!fs.existsSync(projectPath)) {
                    console.warn(`⚠️ Project file not found: ${projectFile}, skipping`);
                    continue;
                }

                let projectContent = fs.readFileSync(projectPath, 'utf8');
                
                // Check if PropertyGroup with version info exists
                const versionPropertyGroupRegex = /<PropertyGroup[^>]*>[\s\S]*?<Version>[\s\S]*?<\/PropertyGroup>/;
                const hasVersionPropertyGroup = versionPropertyGroupRegex.test(projectContent);

                if (hasVersionPropertyGroup) {
                    // Update existing version properties
                    projectContent = projectContent.replace(
                        /<Version>[^<]*<\/Version>/g,
                        `<Version>${version.versionString}</Version>`
                    );
                    projectContent = projectContent.replace(
                        /<AssemblyVersion>[^<]*<\/AssemblyVersion>/g,
                        `<AssemblyVersion>${version.versionString}</AssemblyVersion>`
                    );
                    projectContent = projectContent.replace(
                        /<FileVersion>[^<]*<\/FileVersion>/g,
                        `<FileVersion>${version.versionString}</FileVersion>`
                    );
                } else {
                    // Add version PropertyGroup after the first PropertyGroup
                    const firstPropertyGroupEnd = projectContent.indexOf('</PropertyGroup>');
                    if (firstPropertyGroupEnd !== -1) {
                        const insertPosition = firstPropertyGroupEnd + '</PropertyGroup>'.length;
                        const versionPropertyGroup = `

  <PropertyGroup>
    <Version>${version.versionString}</Version>
    <AssemblyVersion>${version.versionString}</AssemblyVersion>
    <FileVersion>${version.versionString}</FileVersion>
  </PropertyGroup>`;
                        
                        projectContent = projectContent.slice(0, insertPosition) + 
                                       versionPropertyGroup + 
                                       projectContent.slice(insertPosition);
                    }
                }

                fs.writeFileSync(projectPath, projectContent);
                updatedCount++;
                console.log(`✅ Updated ${projectFile} version: ${version.versionString}`);
            }

            if (updatedCount === 0) {
                console.warn('⚠️ No .NET project files were updated');
            }

            return true;
        } catch (error) {
            console.error(`❌ Failed to update .NET project files: ${error.message}`);
            return false;
        }
    }

    /**
     * Generate release notes from commits
     * @param {Array} commits - Array of commit messages
     * @param {Object} version - Version object
     * @returns {string} Release notes content
     */
    generateReleaseNotes(commits, version) {
        const features = [];
        const bugFixes = [];
        const breakingChanges = [];
        const other = [];

        for (const commit of commits) {
            const parsed = this.parseCommit(commit);
            
            if (parsed.breaking) {
                breakingChanges.push(parsed);
            } else if (parsed.type === 'feat') {
                features.push(parsed);
            } else if (parsed.type === 'fix') {
                bugFixes.push(parsed);
            } else {
                other.push(parsed);
            }
        }

        let releaseNotes = `# Release ${version.tagString}\n\n`;
        releaseNotes += `**Release Date:** ${new Date().toISOString().split('T')[0]}\n\n`;

        if (breakingChanges.length > 0) {
            releaseNotes += `## 🚨 Breaking Changes\n\n`;
            breakingChanges.forEach(commit => {
                releaseNotes += `- ${commit.description}\n`;
            });
            releaseNotes += '\n';
        }

        if (features.length > 0) {
            releaseNotes += `## ✨ New Features\n\n`;
            features.forEach(commit => {
                releaseNotes += `- ${commit.description}\n`;
            });
            releaseNotes += '\n';
        }

        if (bugFixes.length > 0) {
            releaseNotes += `## 🐛 Bug Fixes\n\n`;
            bugFixes.forEach(commit => {
                releaseNotes += `- ${commit.description}\n`;
            });
            releaseNotes += '\n';
        }

        if (other.length > 0) {
            releaseNotes += `## 🔧 Other Changes\n\n`;
            other.forEach(commit => {
                releaseNotes += `- ${commit.description}\n`;
            });
            releaseNotes += '\n';
        }

        return releaseNotes;
    }

    /**
     * Update CHANGELOG.md file
     * @param {string} releaseNotes - Release notes content
     * @returns {boolean} Success status
     */
    updateChangelog(releaseNotes) {
        try {
            const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
            let existingContent = '';
            
            if (fs.existsSync(changelogPath)) {
                existingContent = fs.readFileSync(changelogPath, 'utf8');
            } else {
                existingContent = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
            }

            // Insert new release notes after the header
            const lines = existingContent.split('\n');
            const headerEndIndex = lines.findIndex(line => line.startsWith('# ')) + 2;
            
            lines.splice(headerEndIndex, 0, releaseNotes);
            
            fs.writeFileSync(changelogPath, lines.join('\n'));
            console.log('✅ Updated CHANGELOG.md');
            return true;
        } catch (error) {
            console.error(`❌ Failed to update CHANGELOG.md: ${error.message}`);
            return false;
        }
    }

    /**
     * Main execution function
     * @param {Object} options - Configuration options
     */
    async execute(options = {}) {
        const {
            base = 'Kiro/dev',
            head = 'HEAD',
            dryRun = false,
            skipTag = false,
            skipFiles = false
        } = options;

        console.log('🚀 Starting automatic version calculation...\n');

        // Get commits
        const commits = this.getCommits(base, head);
        if (commits.length === 0) {
            console.log('ℹ️ No commits found, skipping version calculation');
            return;
        }

        console.log(`📝 Found ${commits.length} commits:`);
        commits.forEach(commit => {
            const parsed = this.parseCommit(commit);
            const icon = parsed.breaking ? '🚨' : parsed.type === 'feat' ? '✨' : parsed.type === 'fix' ? '🐛' : '🔧';
            console.log(`   ${icon} ${commit}`);
        });
        console.log();

        // Calculate version
        const currentVersion = this.getLatestVersion();
        const newVersion = this.calculateNextVersion(commits);

        console.log(`📊 Version Analysis:`);
        console.log(`   Current: v${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`);
        console.log(`   New:     ${newVersion.tagString} (${newVersion.increment} increment)`);
        console.log();

        if (dryRun) {
            console.log('🔍 Dry run mode - no changes will be made');
            return newVersion;
        }

        // Update files
        if (!skipFiles) {
            console.log('📁 Updating version files...');
            const fileUpdates = [
                this.updateVersionFile(newVersion),
                this.updatePackageJson(newVersion),
                this.updateDotNetProjects(newVersion)
            ];

            const failedUpdates = fileUpdates.filter(success => !success);
            if (failedUpdates.length > 0) {
                console.error(`❌ Failed to update ${failedUpdates.length} version files`);
                console.error('🚨 This will prevent deployment from proceeding');
                
                // Set GitHub Actions error output
                if (process.env.GITHUB_OUTPUT) {
                    const fs = require('fs');
                    fs.appendFileSync(process.env.GITHUB_OUTPUT, `version_error=true\n`);
                    fs.appendFileSync(process.env.GITHUB_OUTPUT, `error_message=Failed to update version files\n`);
                }
                
                process.exit(1);
            }
        }

        // Create git tag
        if (!skipTag) {
            console.log('🏷️ Creating git tag...');
            if (!this.createGitTag(newVersion)) {
                console.error('❌ Failed to create git tag');
                console.error('🚨 This will prevent deployment from proceeding');
                
                // Set GitHub Actions error output
                if (process.env.GITHUB_OUTPUT) {
                    const fs = require('fs');
                    fs.appendFileSync(process.env.GITHUB_OUTPUT, `tag_error=true\n`);
                    fs.appendFileSync(process.env.GITHUB_OUTPUT, `error_message=Failed to create git tag\n`);
                }
                
                process.exit(1);
            }
        }

        // Generate and update release notes
        console.log('📋 Generating release notes...');
        const releaseNotes = this.generateReleaseNotes(commits, newVersion);
        this.updateChangelog(releaseNotes);

        console.log(`\n🎉 Version calculation complete!`);
        console.log(`   New version: ${newVersion.tagString}`);
        console.log(`   Increment type: ${newVersion.increment}`);
        
        // Output for GitHub Actions
        if (process.env.GITHUB_OUTPUT) {
            const fs = require('fs');
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `increment_type=${newVersion.increment}\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_version=${newVersion.versionString}\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `version_tag=${newVersion.tagString}\n`);
            console.log('✅ GitHub Actions outputs written');
        }
        
        // Output for shell scripts
        if (process.env.GITHUB_ENV) {
            const fs = require('fs');
            fs.appendFileSync(process.env.GITHUB_ENV, `CALCULATED_VERSION=${newVersion.versionString}\n`);
            fs.appendFileSync(process.env.GITHUB_ENV, `CALCULATED_INCREMENT=${newVersion.increment}\n`);
            console.log('✅ GitHub Actions environment variables set');
        }
        
        return newVersion;
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
            case '--skip-tag':
                options.skipTag = true;
                break;
            case '--skip-files':
                options.skipFiles = true;
                break;
            case '--base':
                options.base = args[++i];
                break;
            case '--head':
                options.head = args[++i];
                break;
            case '--help':
                console.log(`
Automatic Version Calculator

Usage: node version-calculator.js [options]

Options:
  --dry-run      Show what would be done without making changes
  --skip-tag     Skip git tag creation
  --skip-files   Skip version file updates
  --base <ref>   Base branch/commit (default: Kiro/dev)
  --head <ref>   Head branch/commit (default: HEAD)
  --help         Show this help message

Examples:
  node version-calculator.js --dry-run
  node version-calculator.js --base origin/Kiro/dev --head HEAD
  node version-calculator.js --skip-tag
                `);
                process.exit(0);
        }
    }

    const calculator = new VersionCalculator();
    calculator.execute(options).catch(error => {
        console.error('❌ Version calculation failed:', error.message);
        process.exit(1);
    });
}

module.exports = VersionCalculator;