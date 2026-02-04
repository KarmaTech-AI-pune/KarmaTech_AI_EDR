#!/usr/bin/env node

/**
 * Version Error Notification Script
 * Sends notifications when version system errors occur
 */

const https = require('https');
const fs = require('fs');

class VersionErrorNotifier {
    constructor() {
        this.webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.TEAMS_WEBHOOK_URL;
        this.emailEndpoint = process.env.EMAIL_NOTIFICATION_ENDPOINT;
        this.environment = process.env.ENVIRONMENT || 'dev';
    }

    /**
     * Send error notification
     */
    async notifyError(errorDetails) {
        console.log('📢 Sending version system error notification...');

        const notification = this.formatNotification(errorDetails);

        try {
            // Send to Slack/Teams if webhook configured
            if (this.webhookUrl) {
                await this.sendWebhookNotification(notification);
            }

            // Send email if endpoint configured
            if (this.emailEndpoint) {
                await this.sendEmailNotification(notification);
            }

            // Log to console as fallback
            this.logNotification(notification);

            console.log('✅ Error notification sent successfully');
        } catch (error) {
            console.error('❌ Failed to send error notification:', error.message);
            // Always log to console as final fallback
            this.logNotification(notification);
        }
    }

    /**
     * Format notification message
     */
    formatNotification(errorDetails) {
        const {
            type = 'VERSION_ERROR',
            message = 'Version system error occurred',
            details = {},
            severity = 'HIGH',
            timestamp = new Date().toISOString()
        } = errorDetails;

        return {
            type,
            message,
            details,
            severity,
            timestamp,
            environment: this.environment,
            repository: process.env.GITHUB_REPOSITORY || 'KarmaTech_AI_EDR',
            runId: process.env.GITHUB_RUN_ID,
            actor: process.env.GITHUB_ACTOR || 'system'
        };
    }

    /**
     * Send webhook notification (Slack/Teams)
     */
    async sendWebhookNotification(notification) {
        const payload = this.formatWebhookPayload(notification);
        
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(payload);
            const url = new URL(this.webhookUrl);
            
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(responseData);
                    } else {
                        reject(new Error(`Webhook failed: ${res.statusCode} ${res.statusMessage}`));
                    }
                });
            });

            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }

    /**
     * Format webhook payload for Slack/Teams
     */
    formatWebhookPayload(notification) {
        const { type, message, details, severity, timestamp, environment, repository, runId, actor } = notification;
        
        const color = severity === 'HIGH' ? '#ff0000' : severity === 'MEDIUM' ? '#ff9900' : '#ffcc00';
        const emoji = severity === 'HIGH' ? '🚨' : severity === 'MEDIUM' ? '⚠️' : '💡';
        
        // Slack format (also works with many other webhook services)
        return {
            text: `${emoji} Version System Alert - ${type}`,
            attachments: [
                {
                    color: color,
                    title: `${emoji} ${type} - ${environment.toUpperCase()}`,
                    text: message,
                    fields: [
                        {
                            title: 'Environment',
                            value: environment,
                            short: true
                        },
                        {
                            title: 'Severity',
                            value: severity,
                            short: true
                        },
                        {
                            title: 'Repository',
                            value: repository,
                            short: true
                        },
                        {
                            title: 'Triggered By',
                            value: actor,
                            short: true
                        },
                        {
                            title: 'Timestamp',
                            value: timestamp,
                            short: false
                        }
                    ],
                    actions: runId ? [
                        {
                            type: 'button',
                            text: 'View Workflow Run',
                            url: `https://github.com/${repository}/actions/runs/${runId}`
                        },
                        {
                            type: 'button',
                            text: 'Check API Health',
                            url: 'https://api.app.karmatech-ai.com/api/version/health'
                        }
                    ] : []
                }
            ]
        };
    }

    /**
     * Send email notification
     */
    async sendEmailNotification(notification) {
        const emailData = {
            to: process.env.ADMIN_EMAIL || 'admin@karmatech-ai.com',
            subject: `🚨 Version System Alert - ${notification.type}`,
            html: this.formatEmailHTML(notification)
        };

        return new Promise((resolve, reject) => {
            const data = JSON.stringify(emailData);
            const url = new URL(this.emailEndpoint);
            
            const options = {
                hostname: url.hostname,
                port: url.port || 443,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data),
                    'Authorization': process.env.EMAIL_API_KEY ? `Bearer ${process.env.EMAIL_API_KEY}` : undefined
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(responseData);
                    } else {
                        reject(new Error(`Email notification failed: ${res.statusCode} ${res.statusMessage}`));
                    }
                });
            });

            req.on('error', reject);
            req.write(data);
            req.end();
        });
    }

    /**
     * Format email HTML
     */
    formatEmailHTML(notification) {
        const { type, message, details, severity, timestamp, environment, repository, runId } = notification;
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .alert { padding: 15px; border-radius: 5px; margin: 10px 0; }
                .high { background-color: #ffebee; border-left: 5px solid #f44336; }
                .medium { background-color: #fff3e0; border-left: 5px solid #ff9800; }
                .low { background-color: #f3e5f5; border-left: 5px solid #9c27b0; }
                .details { background-color: #f5f5f5; padding: 10px; border-radius: 3px; margin: 10px 0; }
                .button { display: inline-block; padding: 10px 20px; background-color: #2196f3; color: white; text-decoration: none; border-radius: 3px; margin: 5px; }
            </style>
        </head>
        <body>
            <h2>🚨 Version System Alert</h2>
            
            <div class="alert ${severity.toLowerCase()}">
                <h3>${type}</h3>
                <p><strong>Message:</strong> ${message}</p>
                <p><strong>Environment:</strong> ${environment}</p>
                <p><strong>Severity:</strong> ${severity}</p>
                <p><strong>Timestamp:</strong> ${timestamp}</p>
            </div>
            
            ${Object.keys(details).length > 0 ? `
            <div class="details">
                <h4>Details:</h4>
                <pre>${JSON.stringify(details, null, 2)}</pre>
            </div>
            ` : ''}
            
            <div style="margin: 20px 0;">
                ${runId ? `<a href="https://github.com/${repository}/actions/runs/${runId}" class="button">View Workflow Run</a>` : ''}
                <a href="https://api.app.karmatech-ai.com/api/version/health" class="button">Check API Health</a>
                <a href="https://edr-admin.app.karmatech-ai.com" class="button">Admin Portal</a>
            </div>
            
            <hr>
            <p><small>This alert was automatically generated by the KarmaTech AI EDR version monitoring system.</small></p>
        </body>
        </html>
        `;
    }

    /**
     * Log notification to console
     */
    logNotification(notification) {
        console.log('\n🚨 === VERSION SYSTEM ALERT ===');
        console.log(`Type: ${notification.type}`);
        console.log(`Message: ${notification.message}`);
        console.log(`Severity: ${notification.severity}`);
        console.log(`Environment: ${notification.environment}`);
        console.log(`Timestamp: ${notification.timestamp}`);
        
        if (Object.keys(notification.details).length > 0) {
            console.log('Details:', JSON.stringify(notification.details, null, 2));
        }
        
        console.log('=================================\n');
    }

    /**
     * Notify version calculation failure
     */
    async notifyVersionCalculationFailure(error) {
        await this.notifyError({
            type: 'VERSION_CALCULATION_FAILURE',
            message: 'Automatic version calculation failed during deployment',
            details: {
                error: error.message,
                stack: error.stack,
                branch: process.env.GITHUB_REF_NAME,
                commit: process.env.GITHUB_SHA
            },
            severity: 'HIGH'
        });
    }

    /**
     * Notify version mismatch
     */
    async notifyVersionMismatch(expected, actual, location) {
        await this.notifyError({
            type: 'VERSION_MISMATCH',
            message: `Version mismatch detected in ${location}`,
            details: {
                expected,
                actual,
                location,
                branch: process.env.GITHUB_REF_NAME
            },
            severity: 'MEDIUM'
        });
    }

    /**
     * Notify API health failure
     */
    async notifyAPIHealthFailure(endpoint, error) {
        await this.notifyError({
            type: 'API_HEALTH_FAILURE',
            message: `Version API health check failed for ${endpoint}`,
            details: {
                endpoint,
                error: error.message,
                timestamp: new Date().toISOString()
            },
            severity: 'HIGH'
        });
    }

    /**
     * Notify deployment version mismatch
     */
    async notifyDeploymentVersionMismatch(expected, deployed, environment) {
        await this.notifyError({
            type: 'DEPLOYMENT_VERSION_MISMATCH',
            message: `Deployed version does not match expected version in ${environment}`,
            details: {
                expected,
                deployed,
                environment,
                deploymentUrls: {
                    admin: 'https://edr-admin.app.karmatech-ai.com',
                    tenant: 'https://app.karmatech-ai.com'
                }
            },
            severity: 'MEDIUM'
        });
    }
}

// CLI execution
if (require.main === module) {
    const notifier = new VersionErrorNotifier();
    
    // Example usage from command line
    const args = process.argv.slice(2);
    if (args.length > 0) {
        const errorType = args[0];
        const message = args[1] || 'Version system error occurred';
        
        notifier.notifyError({
            type: errorType,
            message: message,
            severity: 'HIGH'
        });
    } else {
        console.log('Usage: node version-error-notifier.js <error-type> [message]');
        console.log('Example: node version-error-notifier.js VERSION_MISMATCH "VERSION file does not match package.json"');
    }
}

module.exports = VersionErrorNotifier;