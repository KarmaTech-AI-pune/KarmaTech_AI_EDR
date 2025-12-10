#!/bin/bash

# Test Script for Version Tagging Functionality
# Tests all environment tagging scenarios

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print colored output
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_test() {
    echo -e "${CYAN}[TEST]${NC} $1"
}

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    TESTS_RUN=$((TESTS_RUN + 1))
    log_test "Test $TESTS_RUN: $test_name"
    
    if eval "$test_command"; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        log_success "PASSED: $test_name"
        return 0
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        log_error "FAILED: $test_name"
        return 1
    fi
}

# Function to verify tag format
verify_tag_format() {
    local tag=$1
    local expected_env=$2
    
    # Expected format: v{MAJOR}.{MINOR}.{PATCH}-{ENV}.{DATE}.{BUILD}
    # Example: v1.3.0-dev.20241209.1
    
    if [[ $tag =~ ^v[0-9]+\.[0-9]+\.[0-9]+-${expected_env}\.[0-9]{8}\.[0-9]+$ ]]; then
        return 0
    else
        log_error "Tag format incorrect: $tag"
        log_error "Expected format: v{MAJOR}.{MINOR}.{PATCH}-${expected_env}.{DATE}.{BUILD}"
        return 1
    fi
}

# Function to verify clean production tag format
verify_clean_tag_format() {
    local tag=$1
    
    # Expected format: v{MAJOR}.{MINOR}.{PATCH}
    # Example: v1.3.0
    
    if [[ $tag =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        return 0
    else
        log_error "Clean tag format incorrect: $tag"
        log_error "Expected format: v{MAJOR}.{MINOR}.{PATCH}"
        return 1
    fi
}

# Function to extract environment from tag
extract_environment() {
    local tag=$1
    echo "$tag" | sed -E 's/v[0-9]+\.[0-9]+\.[0-9]+-([^.]+)\..*/\1/'
}

# Function to extract date from tag
extract_date() {
    local tag=$1
    echo "$tag" | sed -E 's/v[0-9]+\.[0-9]+\.[0-9]+-[^.]+\.([0-9]{8})\..*/\1/'
}

# Function to extract build number from tag
extract_build_number() {
    local tag=$1
    echo "$tag" | sed -E 's/v[0-9]+\.[0-9]+\.[0-9]+-[^.]+\.[0-9]{8}\.([0-9]+)/\1/'
}

# Function to simulate tag creation for testing
simulate_tag_creation() {
    local branch=$1
    local increment=${2:-patch}
    
    # Set environment variables
    export BRANCH_NAME=$branch
    export VERSION_INCREMENT=$increment
    export COMMIT_SHA=HEAD
    
    # Run the version tagging script
    bash .github/scripts/create-version-tag.sh
}

# Function to cleanup test tags
cleanup_test_tags() {
    log_info "Cleaning up test tags..."
    
    # Get all test tags created today
    local today=$(date +%Y%m%d)
    local test_tags=$(git tag -l "v*-test.${today}.*" 2>/dev/null || true)
    
    if [ -n "$test_tags" ]; then
        for tag in $test_tags; do
            git tag -d "$tag" 2>/dev/null || true
            git push origin ":refs/tags/$tag" 2>/dev/null || true
        done
        log_info "Cleaned up test tags"
    fi
}

# Main test suite
main() {
    echo ""
    echo "=========================================="
    echo "  Version Tagging Test Suite"
    echo "=========================================="
    echo ""
    
    # Ensure we're in the repository root
    if [ ! -f ".github/scripts/create-version-tag.sh" ]; then
        log_error "Must run from repository root"
        exit 1
    fi
    
    # Make script executable
    chmod +x .github/scripts/create-version-tag.sh
    
    log_info "Starting test suite..."
    echo ""
    
    # ========================================
    # Test 1: Dev Environment Tag Format
    # ========================================
    log_test "Test 1: Dev deployment creates correct tag format"
    
    # Simulate dev deployment
    export BRANCH_NAME="Saas/dev"
    export VERSION_INCREMENT="patch"
    export COMMIT_SHA=HEAD
    
    # Capture output
    output=$(bash .github/scripts/create-version-tag.sh 2>&1 || true)
    
    # Extract version tag from output
    dev_tag=$(echo "$output" | grep "VERSION_TAG=" | cut -d'=' -f2)
    
    if [ -n "$dev_tag" ]; then
        if verify_tag_format "$dev_tag" "dev"; then
            TESTS_PASSED=$((TESTS_PASSED + 1))
            log_success "PASSED: Dev tag format correct: $dev_tag"
        else
            TESTS_FAILED=$((TESTS_FAILED + 1))
            log_error "FAILED: Dev tag format incorrect: $dev_tag"
        fi
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        log_error "FAILED: No dev tag created"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    
    # ========================================
    # Test 2: Staging Environment Tag Format
    # ========================================
    log_test "Test 2: Staging deployment creates correct tag format"
    
    # Simulate staging deployment
    export BRANCH_NAME="staging"
    export VERSION_INCREMENT="patch"
    export COMMIT_SHA=HEAD
    
    # Capture output
    output=$(bash .github/scripts/create-version-tag.sh 2>&1 || true)
    
    # Extract version tag from output
    staging_tag=$(echo "$output" | grep "VERSION_TAG=" | cut -d'=' -f2)
    
    if [ -n "$staging_tag" ]; then
        if verify_tag_format "$staging_tag" "staging"; then
            TESTS_PASSED=$((TESTS_PASSED + 1))
            log_success "PASSED: Staging tag format correct: $staging_tag"
        else
            TESTS_FAILED=$((TESTS_FAILED + 1))
            log_error "FAILED: Staging tag format incorrect: $staging_tag"
        fi
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        log_error "FAILED: No staging tag created"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    
    # ========================================
    # Test 3: Production Environment Tags
    # ========================================
    log_test "Test 3: Production deployment creates both environment and clean tags"
    
    # Simulate production deployment
    export BRANCH_NAME="main"
    export VERSION_INCREMENT="patch"
    export COMMIT_SHA=HEAD
    
    # Capture output
    output=$(bash .github/scripts/create-version-tag.sh 2>&1 || true)
    
    # Extract version tag from output
    prod_tag=$(echo "$output" | grep "VERSION_TAG=" | cut -d'=' -f2)
    version=$(echo "$output" | grep "^VERSION=" | cut -d'=' -f2)
    
    if [ -n "$prod_tag" ] && [ -n "$version" ]; then
        # Check environment-specific tag
        if verify_tag_format "$prod_tag" "prod"; then
            log_success "Production environment tag format correct: $prod_tag"
            
            # Check if clean tag exists
            clean_tag="v${version}"
            if git rev-parse "$clean_tag" >/dev/null 2>&1; then
                if verify_clean_tag_format "$clean_tag"; then
                    TESTS_PASSED=$((TESTS_PASSED + 1))
                    log_success "PASSED: Both tags created - $prod_tag and $clean_tag"
                else
                    TESTS_FAILED=$((TESTS_FAILED + 1))
                    log_error "FAILED: Clean tag format incorrect: $clean_tag"
                fi
            else
                TESTS_FAILED=$((TESTS_FAILED + 1))
                log_error "FAILED: Clean tag not created: $clean_tag"
            fi
        else
            TESTS_FAILED=$((TESTS_FAILED + 1))
            log_error "FAILED: Production tag format incorrect: $prod_tag"
        fi
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        log_error "FAILED: No production tag created"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    
    # ========================================
    # Test 4: Multiple Deployments Same Day
    # ========================================
    log_test "Test 4: Multiple deployments same day increment build number"
    
    # Get current date
    today=$(date +%Y%m%d)
    
    # First deployment
    export BRANCH_NAME="Saas/dev"
    export VERSION_INCREMENT="patch"
    export COMMIT_SHA=HEAD
    
    output1=$(bash .github/scripts/create-version-tag.sh 2>&1 || true)
    tag1=$(echo "$output1" | grep "VERSION_TAG=" | cut -d'=' -f2)
    build1=$(extract_build_number "$tag1")
    
    log_info "First deployment tag: $tag1 (build: $build1)"
    
    # Second deployment (same day)
    sleep 2  # Small delay to ensure different execution
    output2=$(bash .github/scripts/create-version-tag.sh 2>&1 || true)
    tag2=$(echo "$output2" | grep "VERSION_TAG=" | cut -d'=' -f2)
    build2=$(extract_build_number "$tag2")
    
    log_info "Second deployment tag: $tag2 (build: $build2)"
    
    # Verify build number incremented
    if [ "$build2" -gt "$build1" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        log_success "PASSED: Build number incremented from $build1 to $build2"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        log_error "FAILED: Build number did not increment (was $build1, now $build2)"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    
    # ========================================
    # Test 5: Tags Visible in GitHub
    # ========================================
    log_test "Test 5: Verify tags are visible in GitHub repository"
    
    # Fetch all tags from remote
    git fetch --tags --quiet 2>/dev/null || true
    
    # Check if recent tags exist
    recent_tags=$(git tag -l "v*-dev.${today}.*" 2>/dev/null | wc -l)
    
    if [ "$recent_tags" -gt 0 ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        log_success "PASSED: Found $recent_tags tag(s) in repository"
        
        # List recent tags
        log_info "Recent dev tags:"
        git tag -l "v*-dev.${today}.*" | tail -5
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        log_error "FAILED: No tags found in repository"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    
    # ========================================
    # Test 6: Environment Detection
    # ========================================
    log_test "Test 6: Verify environment detection from branch names"
    
    test_branches=("Saas/dev:dev" "staging:staging" "qa:qa" "main:prod")
    env_tests_passed=0
    env_tests_total=${#test_branches[@]}
    
    for test_case in "${test_branches[@]}"; do
        IFS=':' read -r branch expected_env <<< "$test_case"
        
        export BRANCH_NAME=$branch
        output=$(bash .github/scripts/create-version-tag.sh 2>&1 || true)
        tag=$(echo "$output" | grep "VERSION_TAG=" | cut -d'=' -f2)
        actual_env=$(extract_environment "$tag")
        
        if [ "$actual_env" = "$expected_env" ]; then
            env_tests_passed=$((env_tests_passed + 1))
            log_success "  ✓ Branch '$branch' → Environment '$actual_env'"
        else
            log_error "  ✗ Branch '$branch' → Expected '$expected_env', got '$actual_env'"
        fi
    done
    
    if [ "$env_tests_passed" -eq "$env_tests_total" ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        log_success "PASSED: All environment detections correct ($env_tests_passed/$env_tests_total)"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        log_error "FAILED: Some environment detections incorrect ($env_tests_passed/$env_tests_total)"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    
    # ========================================
    # Test Summary
    # ========================================
    echo ""
    echo "=========================================="
    echo "  Test Summary"
    echo "=========================================="
    echo ""
    echo "Total Tests:  $TESTS_RUN"
    echo -e "${GREEN}Passed:       $TESTS_PASSED${NC}"
    echo -e "${RED}Failed:       $TESTS_FAILED${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ All tests passed!${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ Some tests failed${NC}"
        echo ""
        return 1
    fi
}

# Run main test suite
main "$@"
exit_code=$?

# Exit with appropriate code
exit $exit_code
