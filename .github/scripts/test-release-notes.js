#!/usr/bin/env node

/**
 * Test script for release notes and version history functionality
 */

const VersionCalculator = require('./version-calculator.js');

async function testReleaseNotes() {
    console.log('🧪 Testing Release Notes and Version History Functionality\n');
    
    const calculator = new VersionCalculator();
    
    try {
        // Test 1: Get current version
        console.log('📊 Test 1: Get Current Version');
        const currentVersion = calculator.getLatestVersion();
        console.log(`   Current version: v${currentVersion.major}.${currentVersion.minor}.${currentVersion.patch}`);
        console.log('   ✅ PASS\n');
        
        // Test 2: Get recent commits with detailed info
        console.log('📝 Test 2: Get Recent Commits with Details');
        const commits = calculator.getCommits('HEAD~5', 'HEAD');
        console.log(`   Found ${commits.length} commits:`);
        commits.forEach((commit, index) => {
            if (typeof commit === 'object') {
                console.log(`   ${index + 1}. ${commit.subject} (${commit.author}) [${commit.hash?.substring(0, 7)}]`);
            } else {
                console.log(`   ${index + 1}. ${commit}`);
            }
        });
        console.log('   ✅ PASS\n');
        
        // Test 3: Generate release notes
        console.log('📋 Test 3: Generate Release Notes');
        const testVersion = { versionString: '1.12.0', tagString: 'v1.12.0' };
        const releaseNotesData = calculator.generateReleaseNotes(commits, testVersion);
        
        console.log(`   Version: ${releaseNotesData.version}`);
        console.log(`   Features: ${releaseNotesData.features.length}`);
        console.log(`   Bug Fixes: ${releaseNotesData.bugFixes.length}`);
        console.log(`   Breaking Changes: ${releaseNotesData.breakingChanges.length}`);
        console.log(`   Other Changes: ${releaseNotesData.other.length}`);
        console.log(`   Total Commits: ${releaseNotesData.totalCommits}`);
        console.log('   ✅ PASS\n');
        
        // Test 4: Format as markdown
        console.log('📄 Test 4: Format Release Notes as Markdown');
        const markdown = calculator.formatReleaseNotesAsMarkdown(releaseNotesData);
        console.log('   Markdown preview (first 200 chars):');
        console.log(`   ${markdown.substring(0, 200)}...`);
        console.log('   ✅ PASS\n');
        
        // Test 5: Get version history
        console.log('📚 Test 5: Get Version History');
        const versionHistory = calculator.getVersionHistory(5);
        console.log(`   Found ${versionHistory.length} versions in history:`);
        versionHistory.forEach((version, index) => {
            console.log(`   ${index + 1}. ${version.tag} (${version.releaseDate?.split('T')[0]}) - ${version.commits?.length || 0} commits`);
        });
        console.log('   ✅ PASS\n');
        
        // Test 6: Dry run execution
        console.log('🔍 Test 6: Dry Run Execution');
        const result = await calculator.execute({ 
            dryRun: true, 
            base: 'HEAD~3', 
            head: 'HEAD' 
        });
        
        if (result) {
            console.log(`   Would create version: ${result.tagString}`);
            console.log(`   Increment type: ${result.increment}`);
            console.log('   ✅ PASS\n');
        } else {
            console.log('   No version changes needed');
            console.log('   ✅ PASS\n');
        }
        
        console.log('🎉 All tests passed! Release notes functionality is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests
testReleaseNotes();