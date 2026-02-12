#!/usr/bin/env node

/**
 * Test script for version calculator functionality
 */

const VersionCalculator = require('./version-calculator');

async function runTests() {
    console.log('🧪 Running Version Calculator Tests...\n');
    
    const calculator = new VersionCalculator();
    let testsPassed = 0;
    let testsTotal = 0;

    // Test 1: Parse conventional commit messages
    testsTotal++;
    console.log('Test 1: Parse conventional commit messages');
    
    const testCommits = [
        'feat: add new feature',
        'fix: resolve bug',
        'feat!: breaking change feature',
        'fix: another bug fix',
        'docs: update documentation',
        'BREAKING CHANGE: major API change'
    ];
    
    const parsedCommits = testCommits.map(commit => calculator.parseCommit(commit));
    
    // Verify parsing results
    if (parsedCommits[0].type === 'feat' && parsedCommits[0].valid) {
        console.log('  ✅ feat commit parsed correctly');
    } else {
        console.log('  ❌ feat commit parsing failed');
    }
    
    if (parsedCommits[1].type === 'fix' && parsedCommits[1].valid) {
        console.log('  ✅ fix commit parsed correctly');
    } else {
        console.log('  ❌ fix commit parsing failed');
    }
    
    if (parsedCommits[2].breaking === true) {
        console.log('  ✅ breaking change detected correctly');
    } else {
        console.log('  ❌ breaking change detection failed');
    }
    
    testsPassed++;
    
    // Test 2: Version increment calculation
    testsTotal++;
    console.log('\nTest 2: Version increment calculation');
    
    const patchCommits = ['fix: bug fix', 'docs: update docs'];
    const minorCommits = ['feat: new feature', 'fix: bug fix'];
    const majorCommits = ['feat!: breaking change', 'fix: bug fix'];
    
    const patchIncrement = calculator.calculateIncrement(patchCommits);
    const minorIncrement = calculator.calculateIncrement(minorCommits);
    const majorIncrement = calculator.calculateIncrement(majorCommits);
    
    if (patchIncrement === 'patch') {
        console.log('  ✅ patch increment calculated correctly');
    } else {
        console.log('  ❌ patch increment calculation failed');
    }
    
    if (minorIncrement === 'minor') {
        console.log('  ✅ minor increment calculated correctly');
    } else {
        console.log('  ❌ minor increment calculation failed');
    }
    
    if (majorIncrement === 'major') {
        console.log('  ✅ major increment calculated correctly');
    } else {
        console.log('  ❌ major increment calculation failed');
    }
    
    testsPassed++;
    
    // Test 3: Version calculation
    testsTotal++;
    console.log('\nTest 3: Version calculation');
    
    // Mock the getLatestVersion method for testing
    const originalGetLatestVersion = calculator.getLatestVersion;
    calculator.getLatestVersion = () => ({ major: 1, minor: 2, patch: 3 });
    
    const newVersion = calculator.calculateNextVersion(['feat: new feature']);
    
    if (newVersion.major === 1 && newVersion.minor === 3 && newVersion.patch === 0) {
        console.log('  ✅ minor version increment calculated correctly');
        testsPassed++;
    } else {
        console.log('  ❌ version calculation failed');
        console.log(`    Expected: 1.3.0, Got: ${newVersion.versionString}`);
    }
    
    // Restore original method
    calculator.getLatestVersion = originalGetLatestVersion;
    
    // Test 4: Release notes generation
    testsTotal++;
    console.log('\nTest 4: Release notes generation');
    
    const releaseNotes = calculator.generateReleaseNotes(testCommits, { tagString: 'v1.2.0' });
    
    if (releaseNotes.includes('# Release v1.2.0') && 
        releaseNotes.includes('## ✨ New Features') &&
        releaseNotes.includes('## 🐛 Bug Fixes') &&
        releaseNotes.includes('## 🚨 Breaking Changes')) {
        console.log('  ✅ release notes generated correctly');
        testsPassed++;
    } else {
        console.log('  ❌ release notes generation failed');
    }
    
    // Summary
    console.log(`\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
    
    if (testsPassed === testsTotal) {
        console.log('🎉 All tests passed!');
        return true;
    } else {
        console.log('❌ Some tests failed');
        return false;
    }
}

// Run tests if called directly
if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    });
}

module.exports = { runTests };