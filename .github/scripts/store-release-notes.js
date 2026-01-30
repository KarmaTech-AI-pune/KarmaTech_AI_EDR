#!/usr/bin/env node

/**
 * Release Notes Database Storage Script
 * 
 * This script stores generated release notes in the database via API call.
 * It's designed to be called from GitHub Actions workflows.
 * 
 * Usage: node store-release-notes.js --api-url <url> --data-file <path> [--api-key <key>]
 */

const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

class ReleaseNotesStorage {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 2000; // 2 seconds
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
        
        // Set defaults
        options['api-url'] = options['api-url'] || 'https://api.app.karmatech-ai.com/api/release-notes';
        options['data-file'] = options['data-file'] || '.github/release-notes/api-data.json';
        
        return options;
    }

    /**
     * Read release notes data from file
     */
    readReleaseNotesData(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Release notes data file not found: ${filePath}`);
            }
            
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Failed to read release notes data: ${error.message}`);
        }
    }

    /**
     * Make HTTP request with retry logic
     */
    async makeRequest(url, data, apiKey, attempt = 1) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const postData = JSON.stringify(data);
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'User-Agent': 'GitHub-Actions-Release-Notes-Storage/1.0'
                }
            };
            
            // Add API key if provided
            if (apiKey) {
                options.headers['Authorization'] = `Bearer ${apiKey}`;
            }
            
            const req = client.request(options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`✅ Release notes stored successfully (HTTP ${res.statusCode})`);
                        try {
                            const response = JSON.parse(responseData);
                            resolve(response);
                        } catch (e) {
                            resolve({ success: true, statusCode: res.statusCode });
                        }
                    } else {
                        const error = new Error(`HTTP ${res.statusCode}: ${responseData}`);
                        error.statusCode = res.statusCode;
                        error.response = responseData;
                        reject(error);
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.setTimeout(30000); // 30 second timeout
            req.write(postData);
            req.end();
        });
    }

    /**
     * Store release notes with retry logic
     */
    async storeReleaseNotes(apiUrl, releaseNotesData, apiKey) {
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🚀 Attempt ${attempt}/${this.maxRetries}: Storing release notes...`);
                console.log(`📡 API URL: ${apiUrl}`);
                console.log(`📊 Data size: ${JSON.stringify(releaseNotesData).length} bytes`);
                
                const response = await this.makeRequest(apiUrl, releaseNotesData, apiKey, attempt);
                
                console.log(`✅ Release notes stored successfully on attempt ${attempt}`);
                return response;
                
            } catch (error) {
                console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt === this.maxRetries) {
                    throw error;
                }
                
                // Check if it's a retryable error
                if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                    // Client errors (4xx) are not retryable
                    throw error;
                }
                
                console.log(`⏳ Waiting ${this.retryDelay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                
                // Exponential backoff
                this.retryDelay *= 2;
            }
        }
    }

    /**
     * Validate release notes data
     */
    validateReleaseNotesData(data) {
        const required = ['version', 'environment', 'releaseDate'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
        
        // Validate arrays
        const arrays = ['features', 'bugFixes', 'improvements', 'breakingChanges', 'knownIssues'];
        arrays.forEach(field => {
            if (data[field] && !Array.isArray(data[field])) {
                throw new Error(`Field '${field}' must be an array`);
            }
        });
        
        console.log(`✅ Release notes data validation passed`);
        console.log(`📋 Version: ${data.version}`);
        console.log(`🌍 Environment: ${data.environment}`);
        console.log(`📅 Release Date: ${data.releaseDate}`);
        console.log(`✨ Features: ${data.features?.length || 0}`);
        console.log(`🐛 Bug Fixes: ${data.bugFixes?.length || 0}`);
        console.log(`♻️ Improvements: ${data.improvements?.length || 0}`);
        console.log(`💥 Breaking Changes: ${data.breakingChanges?.length || 0}`);
    }

    /**
     * Main execution function
     */
    async run() {
        console.log('🚀 Starting release notes storage...');
        
        try {
            const options = this.parseArguments();
            const apiUrl = options['api-url'];
            const dataFile = options['data-file'];
            const apiKey = options['api-key'] || process.env.RELEASE_NOTES_API_KEY;
            
            console.log(`📁 Reading release notes from: ${dataFile}`);
            
            // Read and validate release notes data
            const releaseNotesData = this.readReleaseNotesData(dataFile);
            this.validateReleaseNotesData(releaseNotesData);
            
            // Store release notes
            const response = await this.storeReleaseNotes(apiUrl, releaseNotesData, apiKey);
            
            console.log('✅ Release notes storage completed successfully');
            
            // Set GitHub Actions outputs
            if (process.env.GITHUB_ACTIONS) {
                console.log(`::set-output name=storage-success::true`);
                console.log(`::set-output name=release-version::${releaseNotesData.version}`);
                console.log(`::set-output name=release-environment::${releaseNotesData.environment}`);
            }
            
        } catch (error) {
            console.error('❌ Error storing release notes:', error.message);
            
            // Set GitHub Actions outputs for failure
            if (process.env.GITHUB_ACTIONS) {
                console.log(`::set-output name=storage-success::false`);
                console.log(`::set-output name=error-message::${error.message}`);
            }
            
            process.exit(1);
        }
    }
}

// Run the script if called directly
if (require.main === module) {
    const storage = new ReleaseNotesStorage();
    storage.run().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = ReleaseNotesStorage;