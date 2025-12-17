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
     * @returns {Array} Array of commit objects with detailed information
     */
    getCommits(base = 'Kiro/dev', head = 'HEAD') {
        try {
            const gitLog = execSync(
                `git log ${base}..${head} --pretty=format:"%H|%s|%an|%ae|%ad|%B" --date=iso`,
                { encoding: 'utf8' }
            );
            
            const commits = gitLog.split('\n').filter(line => line.trim()).map(line => {
                const parts = line.split('|');
                if (parts.length >= 5) {
                    return {
                        hash: parts[0],
                        subject: parts[1],
                        author: parts[2],
                        email: parts[3],
                        date: parts[4],
                        body: parts[5] || ''
                    };
                }
                return null;
            }).filter(commit => commit !== null);
            
            return commits;
        } catch (error) {
            console.error('Error getting commits:', error.message);
            return [];
        }
    }

    /**
     * Get commits between two versions
     * @param {string} fromVersion - Starting version tag (e.g., 'v1.0.0')
     * @param {string} toVersion - Ending version tag (e.g., 'v1.1.0') or 'HEAD'
     * @returns {Array} Array of commit objects
     */
    getCommitsBetweenVersions(fromVersion, toVersion = 'HEAD') {
        try {
            const gitLog = execSync(
                `git log ${fromVersion}..${toVersion} --pretty=format:"%H|%s|%an|%ae|%ad|%B" --date=iso`,
                { encoding: 'utf8' }
            );
            
            const commits = gitLog.split('\n').filter(line => line.trim()).map(line => {
                const parts = line.split('|');
                if (parts.length >= 5) {
                    return {
                        hash: parts[0],
                        subject: parts[1],
                        author: parts[2],
                        email: parts[3],
                        date: parts[4],
                        body: parts[5] || ''
                    };
                }
                return null;
            }).filter(commit => commit !== null);
            
            return commits;
        } catch (error) {
            console.error('Error getting commits between versions:', error.message);
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
     * @param {Array} commits - Array of commit objects or messages
     * @returns {string} Version increment type: 'major', 'minor', or 'patch'
     */
    calculateIncrement(commits) {
        let hasFeat = false;
        let hasFix = false;
        let hasBreaking = false;

        for (const commit of commits) {
            const message = typeof commit === 'string' ? commit : commit.subject;
            const parsed = this.parseCommit(message);
            
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
     * @param {Array} commits - Array of commit objects
     * @param {Object} version - Version object
     * @returns {Object} Release notes object with structured data
     */
    generateReleaseNotes(commits, version) {
        const features = [];
        const bugFixes = [];
        const breakingChanges = [];
        const other = [];

        for (const commit of commits) {
            const message = typeof commit === 'string' ? commit : commit.subject;
            const parsed = this.parseCommit(message);
            
            const commitInfo = {
                ...parsed,
                hash: typeof commit === 'object' ? commit.hash : null,
                author: typeof commit === 'object' ? commit.author : null,
                email: typeof commit === 'object' ? commit.email : null,
                date: typeof commit === 'object' ? commit.date : null,
                body: typeof commit === 'object' ? commit.body : null
            };
            
            if (parsed.breaking) {
                breakingChanges.push(commitInfo);
            } else if (parsed.type === 'feat') {
                features.push(commitInfo);
            } else if (parsed.type === 'fix') {
                bugFixes.push(commitInfo);
            } else {
                other.push(commitInfo);
            }
        }

        const releaseDate = new Date().toISOString();
        
        return {
            version: version.versionString,
            tag: version.tagString,
            date: releaseDate,
            features,
            bugFixes,
            breakingChanges,
            other,
            totalCommits: commits.length
        };
    }

    /**
     * Format release notes as markdown
     * @param {Object} releaseNotesData - Structured release notes data
     * @returns {string} Formatted markdown content
     */
    formatReleaseNotesAsMarkdown(releaseNotesData) {
        let releaseNotes = `# Release ${releaseNotesData.tag}\n\n`;
        releaseNotes += `**Release Date:** ${releaseNotesData.date.split('T')[0]}\n`;
        releaseNotes += `**Total Commits:** ${releaseNotesData.totalCommits}\n\n`;

        if (releaseNotesData.breakingChanges.length > 0) {
            releaseNotes += `## 🚨 Breaking Changes\n\n`;
            releaseNotesData.breakingChanges.forEach(commit => {
                releaseNotes += `- ${commit.description}`;
                if (commit.author) {
                    releaseNotes += ` (${commit.author})`;
                }
                if (commit.hash) {
                    releaseNotes += ` [${commit.hash.substring(0, 7)}]`;
                }
                releaseNotes += '\n';
            });
            releaseNotes += '\n';
        }

        if (releaseNotesData.features.length > 0) {
            releaseNotes += `## ✨ New Features\n\n`;
            releaseNotesData.features.forEach(commit => {
                releaseNotes += `- ${commit.description}`;
                if (commit.author) {
                    releaseNotes += ` (${commit.author})`;
                }
                if (commit.hash) {
                    releaseNotes += ` [${commit.hash.substring(0, 7)}]`;
                }
                releaseNotes += '\n';
            });
            releaseNotes += '\n';
        }

        if (releaseNotesData.bugFixes.length > 0) {
            releaseNotes += `## 🐛 Bug Fixes\n\n`;
            releaseNotesData.bugFixes.forEach(commit => {
                releaseNotes += `- ${commit.description}`;
                if (commit.author) {
                    releaseNotes += ` (${commit.author})`;
                }
                if (commit.hash) {
                    releaseNotes += ` [${commit.hash.substring(0, 7)}]`;
                }
                releaseNotes += '\n';
            });
            releaseNotes += '\n';
        }

        if (releaseNotesData.other.length > 0) {
            releaseNotes += `## 🔧 Other Changes\n\n`;
            releaseNotesData.other.forEach(commit => {
                releaseNotes += `- ${commit.description}`;
                if (commit.author) {
                    releaseNotes += ` (${commit.author})`;
                }
                if (commit.hash) {
                    releaseNotes += ` [${commit.hash.substring(0, 7)}]`;
                }
                releaseNotes += '\n';
            });
            releaseNotes += '\n';
        }

        return releaseNotes;
    }

    /**
     * Get all version history from git tags
     * @param {number} limit - Maximum number of versions to return
     * @returns {Array} Array of version history objects
     */
    getVersionHistory(limit = 50) {
        try {
            const tags = execSync('git tag -l "v*" --sort=-version:refname', { encoding: 'utf8' });
            const tagList = tags.split('\n').filter(tag => tag.trim()).slice(0, limit);
            
            const versionHistory = [];
            
            for (let i = 0; i < tagList.length; i++) {
                const tag = tagList[i];
                const versionMatch = tag.match(/^v(\d+)\.(\d+)\.(\d+)(?:-.*)?$/);
                
                if (!versionMatch) continue;
                
                try {
                    // Get tag information
                    const tagInfo = execSync(`git show ${tag} --format="%H|%an|%ae|%ad|%s" --no-patch --date=iso`, { encoding: 'utf8' }).trim();
                    const [commitHash, author, email, date, subject] = tagInfo.split('|');
                    
                    // Get commits for this version (between this tag and the previous one)
                    let commits = [];
                    if (i < tagList.length - 1) {
                        const previousTag = tagList[i + 1];
                        commits = this.getCommitsBetweenVersions(previousTag, tag);
                    } else {
                        // For the first version, get all commits up to this tag
                        try {
                            commits = this.getCommitsBetweenVersions('', tag);
                        } catch (error) {
                            // If no previous commits, just use empty array
                            commits = [];
                        }
                    }
                    
                    // Generate release notes for this version
                    const releaseNotesData = this.generateReleaseNotes(commits, {
                        versionString: `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}`,
                        tagString: tag
                    });
                    
                    versionHistory.push({
                        version: `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}`,
                        tag: tag,
                        releaseDate: date,
                        commitHash: commitHash,
                        author: author,
                        email: email,
                        subject: subject,
                        commits: commits,
                        releaseNotes: releaseNotesData,
                        isCurrent: i === 0
                    });
                } catch (error) {
                    console.warn(`Warning: Could not get details for tag ${tag}:`, error.message);
                }
            }
            
            return versionHistory;
        } catch (error) {
            console.error('Error getting version history:', error.message);
            return [];
        }
    }

    /**
     * Save version history to JSON file
     * @param {Array} versionHistory - Array of version history objects
     * @returns {boolean} Success status
     */
    saveVersionHistoryToFile(versionHistory) {
        try {
            const historyPath = path.join(process.cwd(), 'version-history.json');
            const historyData = {
                lastUpdated: new Date().toISOString(),
                totalVersions: versionHistory.length,
                versions: versionHistory
            };
            
            fs.writeFileSync(historyPath, JSON.stringify(historyData, null, 2));
            console.log(`✅ Saved version history to version-history.json (${versionHistory.length} versions)`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to save version history: ${error.message}`);
            return false;
        }
    }

    /**
     * Update CHANGELOG.md file
     * @param {Object} releaseNotesData - Structured release notes data
     * @returns {boolean} Success status
     */
    updateChangelog(releaseNotesData) {
        try {
            const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
            let existingContent = '';
            
            if (fs.existsSync(changelogPath)) {
                existingContent = fs.readFileSync(changelogPath, 'utf8');
            } else {
                existingContent = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
            }

            // Format release notes as markdown
            const releaseNotesMarkdown = this.formatReleaseNotesAsMarkdown(releaseNotesData);

            // Insert new release notes after the header
            const lines = existingContent.split('\n');
            const headerEndIndex = lines.findIndex(line => line.startsWith('# ')) + 2;
            
            lines.splice(headerEndIndex, 0, releaseNotesMarkdown);
            
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
            const message = typeof commit === 'string' ? commit : commit.subject;
            const parsed = this.parseCommit(message);
            const icon = parsed.breaking ? '🚨' : parsed.type === 'feat' ? '✨' : parsed.type === 'fix' ? '🐛' : '🔧';
            const author = typeof commit === 'object' && commit.author ? ` (${commit.author})` : '';
            console.log(`   ${icon} ${message}${author}`);
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
        const releaseNotesData = this.generateReleaseNotes(commits, newVersion);
        this.updateChangelog(releaseNotesData);
        
        // Update version history
        console.log('📚 Updating version history...');
        const versionHistory = this.getVersionHistory();
        this.saveVersionHistoryToFile(versionHistory);

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