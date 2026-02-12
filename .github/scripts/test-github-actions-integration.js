#!/usr/bin/env node

/**
 * Test script for GitHub Actions Version Integration
 */

const { execSync } = require('child_process');
const fs = require('fs');

async function runIntegrationTests() {
    console.log('🧪 Running GitHub Actions Integration Tests...\n');
    
    let testsPassed = 0;
    let testsTotal = 0;

    // Test 1: Help command
    testsTotal++;
    console.log('Test 1: Help command');
    try {
        const result = execSync('node .github/scripts/github-actions-version-integration.js --help', { encoding: 'utf8' });
        if (result.includes('GitHub Actions Version Integration')) {
            console.log('  ✅ Help command works correctly');
            testsPassed++;
        } else {
            console.log('  ❌ Help command output incorrect');
        }
    } catch (error) {
        console.log('  ❌ Help command failed:', error.message);
    }

    // Test 2: Dry run mode
    testsTotal++;
    console.log('\nTest 2: Dry run mode');
    try {
        const result = execSync('node .github/scripts/github-actions-version-integration.js --dry-run', { 
            encoding: 'utf8',
            timeout: 30000
        });
        if (result.includes('Version integration completed successfully') && result.includes('Dry run completed')) {
            console.log('  ✅ Dry run mode works correctly');
            testsPassed++;
        } else {
            console.log('  ❌ Dry run mode output incorrect');
        }
    } catch (error) {
        console.log('  ❌ Dry run mode failed:', error.message);
    }

    // Test 3: Manual increment
    testsTotal++;
    console.log('\nTest 3: Manual increment');
    try {
        const result = execSync('node .github/scripts/github-actions-version-integration.js --increment minor --dry-run', { 
            encoding: 'utf8',
            timeout: 30000
        });
        if (result.includes('Using manual increment override: minor')) {
            console.log('  ✅ Manual increment works correctly');
            testsPassed++;
        } else {
            console.log('  ❌ Manual increment not detected');
        }
    } catch (error) {
        console.log('  ❌ Manual increment failed:', error.message);
    }

    // Test 4: Prerequisites validation
    testsTotal++;
    console.log('\nTest 4: Prerequisites validation');
    try {
        const result = execSync('node .github/scripts/github-actions-version-integration.js --dry-run', { 
            encoding: 'utf8',
            timeout: 30000
        });
        if (result.includes('All prerequisites validated')) {
            console.log('  ✅ Prerequisites validation works correctly');
            testsPassed++;
        } else {
            console.log('  ❌ Prerequisites validation not found');
        }
    } catch (error) {
        console.log('  ❌ Prerequisites validation failed:', error.message);
    }

    // Test 5: Version calculator integration
    testsTotal++;
    console.log('\nTest 5: Version calculator integration');
    try {
        const VersionCalculator = require('./version-calculator');
        const calculator = new VersionCalculator();
        
        // Test that the integration can load the version calculator
        const commits = ['feat: test feature', 'fix: test fix'];
        const version = calculator.calculateNextVersion(commits);
        
        if (version && version.versionString && version.increment) {
            console.log('  ✅ Version calculator integration works correctly');
            testsPassed++;
        } else {
            console.log('  ❌ Version calculator integration failed');
        }
    } catch (error) {
        console.log('  ❌ Version calculator integration error:', error.message);
    }

    // Summary
    console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
    
    if (testsPassed === testsTotal) {
        console.log('🎉 All integration tests passed!');
        console.log('\n✅ GitHub Actions integration is ready for production use');
        return true;
    } else {
        console.log('❌ Some integration tests failed');
        console.log('\n⚠️ Please review and fix issues before using in production');
        return false;
    }
}

// Run tests if called directly
if (require.main === module) {
    runIntegrationTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Integration test execution failed:', error.message);
        process.exit(1);
    });
}

module.exports = { runIntegrationTests };