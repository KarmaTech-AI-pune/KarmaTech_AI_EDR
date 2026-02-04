#!/usr/bin/env node

/**
 * Release Notes Generator for GitHub Actions
 * 
 * This script generates release notes from Git commits and stores them in the database.
 * It integrates with the existing version tagging workflow.
 * 
 * Usage: node generate-release-notes.js --version <version> --environment <env> [--commit-sha <sha>]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ReleaseNotesGenerator {
    constructor() {
        this.conventionalCommitTypes = {
            'feat': { category: 'Features', emoji: '✨' },
            'fix': { category: 'Bug Fixes', emoji: '🐛' },
            'docs': { category: 'Documentation', emoji: '📚' },
            'style': { category: 'Improvements', emoji: '💄' },
            'refactor': { category: 'Improvements', emoji: '♻️' },
            'perf': { category: 'Performance', emoji: '⚡' },
            'test': { category: 'Testing', emoji: '✅' },
            'chore': { category: 'Maintenance', emoji: '🔧' },
            'ci': { category: 'CI/CD', emoji: '👷' },
            'build': { category: 'Build', emoji: '📦' },
            'revert': { category: 'Reverts', emoji: '⏪' }
        };
    }

    /**
     * Parse command line arguments
     */
    parseArguments() {
        const args = process.argv.slice(2);
        const options = {};
        
        for (let i = 0; i < args.length; i += 2) {
            const key = args[i].replace('--', '');
            const value = args[i + 1];
            options[key] = value;
        }
        
        if (!options.version || !options.environment) {
            console.error('❌ Missing required arguments: --version and --environment');
            process.exit(1);
        }
        
        return options;
    }

    /**
     * Get commits since last tag
     */
    getCommitsSinceLastTag(currentTag) {
        try {
            // Get the previous tag
            const previousTag = execSync(
                `git describe --tags --abbrev=0 ${currentTag}^`,
                { encoding: 'utf8' }
            ).trim();
            
            console.log(`📋 Getting commits between ${previousTag} and ${currentTag}`);
            
            // Get commits between tags
            const commits = execSync(
                `git log ${previousTag}..${currentTag} --pretty=format:"%H|%s|%an|%ae|%ad" --date=iso`,
                { encoding: 'utf8' }
            ).trim();
            
            return commits ? commits.split('\n') : [];
        } catch (error) {
            console.log('📋 No previous tag found, getting all commits from HEAD~10');
            // If no previous tag, get recent commits
            const commits = execSync(
                `git log HEAD~10..HEAD --pretty=format:"%H|%s|%an|%ae|%ad" --date=iso`,
                { encoding: 'utf8' }
            ).trim();
            
            return commits ? commits.split('\n') : [];
        }
    }

    /**
     * Parse a single commit message
     */
    parseCommit(commitLine) {
        const [sha, message, author, email, date] = commitLine.split('|');
        
        // Extract conventional commit type and description
        const conventionalMatch = message.match(/^(\w+)(\(.+\))?\s*:\s*(.+)$/);
        let type = 'other';
        let description = message;
        let scope = null;
        
        if (conventionalMatch) {
            type = conventionalMatch[1].toLowerCase();
            scope = conventionalMatch[2] ? conventionalMatch[2].slice(1, -1) : null;
            description = conventionalMatch[3];
        }
        
        // Extract JIRA ticket references
        const jiraMatch = message.match(/([A-Z]+-\d+)/g);
        const jiraTickets = jiraMatch || [];
        
        // Determine if this is a breaking change
        const isBreaking = message.includes('BREAKING CHANGE') || 
                          message.includes('!:') || 
                          description.toLowerCase().includes('breaking');
        
        return {
            sha: sha.substring(0, 8),
            fullSha: sha,
            type,
            scope,
            description,
            author,
            email,
            date: new Date(date),
            jiraTickets,
            isBreaking,
            rawMessage: message
        };
    }

    /**
     * Categorize commits into release notes sections
     */
    categorizeCommits(commits) {
        const categories = {
            'Features': [],
            'Bug Fixes': [],
            'Improvements': [],
            'Performance': [],
            'Documentation': [],
            'Testing': [],
            'CI/CD': [],
            'Build': [],
            'Maintenance': [],
            'Breaking Changes': [],
            'Other': []
        };
        
        commits.forEach(commit => {
            const typeInfo = this.conventionalCommitTypes[commit.type];
            let category = typeInfo ? typeInfo.category : 'Other';
            
            // Handle breaking changes separately
            if (commit.isBreaking) {
                categories['Breaking Changes'].push(commit);
                return;
            }
            
            // Map performance improvements
            if (commit.type === 'perf') {
                category = 'Performance';
            }
            
            categories[category].push(commit);
        });
        
        return categories;
    }

    /**
     * Generate release notes content
     */
    generateReleaseNotesContent(version, environment, categories, buildInfo) {
        const sections = [];
        
        // Add header
        sections.push(`# Release Notes - ${version}`);
        sections.push('');
        sections.push(`**Environment:** ${environment}`);
        sections.push(`**Release Date:** ${new Date().toISOString().split('T')[0]}`);
        sections.push(`**Build:** ${buildInfo.buildNumber || 'N/A'}`);
        sections.push(`**Commit:** ${buildInfo.commitSha || 'N/A'}`);
        sections.push('');
        
        // Add each category that has commits
        Object.entries(categories).forEach(([categoryName, commits]) => {
            if (commits.length === 0) return;
            
            sections.push(`## ${categoryName}`);
            sections.push('');
            
            commits.forEach(commit => {
                const typeInfo = this.conventionalCommitTypes[commit.type];
                const emoji = typeInfo ? typeInfo.emoji : '📝';
                
                let line = `- ${emoji} ${commit.description}`;
                
                if (commit.scope) {
                    line += ` (${commit.scope})`;
                }
                
                if (commit.jiraTickets.length > 0) {
                    line += ` [${commit.jiraTickets.join(', ')}]`;
                }
                
                line += ` (${commit.sha})`;
                
                sections.push(line);
            });
            
            sections.push('');
        });
        
        return sections.join('\n');
    }

    /**
     * Generate structured release notes data for API
     */
    generateStructuredReleaseNotes(version, environment, categories, buildInfo) {
        const releaseNotes = {
            version,
            environment,
            releaseDate: new Date().toISOString(),
            buildNumber: buildInfo.buildNumber || null,
            commitSha: buildInfo.commitSha || null,
            branch: buildInfo.branch || null,
            features: [],
            bugFixes: [],
            improvements: [],
            breakingChanges: [],
            knownIssues: []
        };
        
        // Map categories to API structure
        const categoryMapping = {
            'Features': 'features',
            'Bug Fixes': 'bugFixes',
            'Improvements': 'improvements',
            'Performance': 'improvements',
            'Breaking Changes': 'breakingChanges'
        };
        
        Object.entries(categories).forEach(([categoryName, commits]) => {
            const apiField = categoryMapping[categoryName];
            if (!apiField || commits.length === 0) return;
            
            commits.forEach(commit => {
                const changeItem = {
                    description: commit.description,
                    commitSha: commit.fullSha,
                    jiraTicket: commit.jiraTickets.length > 0 ? commit.jiraTickets[0] : null,
                    impact: commit.isBreaking ? 'High' : 'Medium',
                    author: commit.author,
                    scope: commit.scope
                };
                
                releaseNotes[apiField].push(changeItem);
            });
        });
        
        return releaseNotes;
    }

    /**
     * Save release notes to file
     */
    saveReleaseNotes(content, version, environment) {
        const outputDir = path.join(process.cwd(), '.github', 'release-notes');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const filename = `${version}-${environment}.md`;
        const filepath = path.join(outputDir, filename);
        
        fs.writeFileSync(filepath, content);
        console.log(`📝 Release notes saved to: ${filepath}`);
        
        return filepath;
    }

    /**
     * Save structured release notes for API consumption
     */
    saveStructuredReleaseNotes(data, version, environment) {
        const outputDir = path.join(process.cwd(), '.github', 'release-notes');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const filename = `${version}-${environment}.json`;
        const filepath = path.join(outputDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`📊 Structured release notes saved to: ${filepath}`);
        
        return filepath;
    }

    /**
     * Call backend API to store release notes
     */
    async callReleaseNotesAPI(releaseNotesData) {
        // This would be implemented to call the actual API endpoint
        // For now, we'll just log the data and save it to a file for the API to pick up
        
        console.log('🚀 Preparing release notes for API storage...');
        
        const apiDataFile = path.join(process.cwd(), '.github', 'release-notes', 'api-data.json');
        fs.writeFileSync(apiDataFile, JSON.stringify(releaseNotesData, null, 2));
        
        console.log(`💾 Release notes data prepared for API at: ${apiDataFile}`);
        
        // Set GitHub Actions output for the API data file path
        if (process.env.GITHUB_ACTIONS) {
            console.log(`::set-output name=api-data-file::${apiDataFile}`);
            console.log(`::set-output name=release-notes-generated::true`);
        }
    }

    /**
     * Main execution function
     */
    async run() {
        console.log('🚀 Starting release notes generation...');
        
        const options = this.parseArguments();
        const { version, environment } = options;
        const commitSha = options['commit-sha'] || process.env.GITHUB_SHA;
        const branch = process.env.GITHUB_REF_NAME || 'unknown';
        const buildNumber = process.env.GITHUB_RUN_NUMBER;
        
        console.log(`📋 Generating release notes for ${version} (${environment})`);
        
        try {
            // Get commits since last tag
            const commitLines = this.getCommitsSinceLastTag(version);
            console.log(`📊 Found ${commitLines.length} commits to analyze`);
            
            if (commitLines.length === 0) {
                console.log('⚠️ No commits found, creating minimal release notes');
                const minimalNotes = {
                    version,
                    environment,
                    releaseDate: new Date().toISOString(),
                    buildNumber,
                    commitSha,
                    branch,
                    features: [],
                    bugFixes: [],
                    improvements: [],
                    breakingChanges: [],
                    knownIssues: []
                };
                
                await this.callReleaseNotesAPI(minimalNotes);
                return;
            }
            
            // Parse commits
            const commits = commitLines.map(line => this.parseCommit(line));
            console.log(`✅ Parsed ${commits.length} commits`);
            
            // Categorize commits
            const categories = this.categorizeCommits(commits);
            
            // Log summary
            Object.entries(categories).forEach(([category, commits]) => {
                if (commits.length > 0) {
                    console.log(`  ${category}: ${commits.length} commits`);
                }
            });
            
            // Generate build info
            const buildInfo = {
                buildNumber,
                commitSha,
                branch
            };
            
            // Generate markdown content
            const markdownContent = this.generateReleaseNotesContent(version, environment, categories, buildInfo);
            this.saveReleaseNotes(markdownContent, version, environment);
            
            // Generate structured data for API
            const structuredData = this.generateStructuredReleaseNotes(version, environment, categories, buildInfo);
            this.saveStructuredReleaseNotes(structuredData, version, environment);
            
            // Call API to store release notes
            await this.callReleaseNotesAPI(structuredData);
            
            console.log('✅ Release notes generation completed successfully');
            
        } catch (error) {
            console.error('❌ Error generating release notes:', error.message);
            process.exit(1);
        }
    }
}

// Run the script if called directly
if (require.main === module) {
    const generator = new ReleaseNotesGenerator();
    generator.run().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = ReleaseNotesGenerator;