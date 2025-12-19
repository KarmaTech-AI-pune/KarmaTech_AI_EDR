#!/usr/bin/env node

/**
 * Automatic Version Calculator
 * Calculates semantic version increments based on conventional commit messages
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class VersionCalculator {
    constructor() {
        this.conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|ci|build)(\(.+\))?(!)?: (.+)/;
        this.breakingChangeRegex = /BREAKING CHANGE:/;
    }

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
            scope: match[2] ? match[2].slice(1, -1) : null,
            breaking: !!match[3] || this.breakingChangeRegex.test(commitMessage),
            description: match[4],
            valid: true
        };
    }

    getCommits(base = 'Kiro/dev', head = 'HEAD') {
        try {
            const gitLog = execSync(
                `git log ${base}..${head} --pretty=format:"%H|%s|%an|%ae|%ad" --date=iso`,
                { encoding: 'utf8' }
            );
            return gitLog.split('\n').filter(line => line.trim()).map(line => {
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
        } catch (error) {
            console.error('Error getting commits:', error.message);
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
            return true;
        } catch (error) {
            console.error(`❌ Failed to update VERSION file: ${error.message}`);
            return false;
        }
    }

    updatePackageJson(version) {
        try {
            const packageJsonPath = path.join(process.cwd(), 'frontend', 'package.json');
            if (!fs.existsSync(packageJsonPath)) {
                console.warn('⚠️ Frontend package.json not found, skipping');
                return true;
            }
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            packageJson.version = version.versionString;
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
            console.log(`✅ Updated package.json: ${version.versionString}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to update package.json: ${error.message}`);
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

        console.log('🚀 Starting automatic version calculation...\n');

        const commits = this.getCommits(base, head);
        if (commits.length === 0) {
            console.log('ℹ️ No commits found, skipping version calculation');
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
        const newVersion = this.calculateNextVersion(commits);

        console.log(`📊 Version Analysis:`);
        console.log(`   Current: v${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`);
        console.log(`   New:     ${newVersion.tagString} (${newVersion.increment} increment)`);
        console.log();

        if (dryRun) {
            console.log('🔍 Dry run mode - no changes will be made');
            return newVersion;
        }

        if (!skipFiles) {
            console.log('📁 Updating version files...');
            this.updateVersionFile(newVersion);
            this.updatePackageJson(newVersion);
            this.updateDotNetProjects(newVersion);
            
            const releaseNotes = this.generateReleaseNotes(commits, newVersion);
            this.updateChangelog(releaseNotes);
        }

        console.log('\n✅ Version calculation completed successfully');
        return newVersion;
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
            case '--help':
                console.log('Usage: node version-calculator.js [--dry-run] [--base <ref>] [--head <ref>]');
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
