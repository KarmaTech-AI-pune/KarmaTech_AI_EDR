#!/bin/bash

# Version Tagging Script for EDR Deployment Pipeline
# Creates environment-specific version tags with format: v{MAJOR}.{MINOR}.{PATCH}-{ENV}.{DATE}.{BUILD}

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to determine environment from branch name
determine_environment() {
    local branch_name=$1
    
    case "$branch_name" in
        "Kiro/dev"|"kiro/dev"|"dev")
            echo "dev"
            ;;
        "staging")
            echo "staging"
            ;;
        "qa")
            echo "qa"
            ;;
        "main"|"master"|"production")
            echo "prod"
            ;;
        *)
            log_error "Unknown branch: $branch_name. Cannot determine environment."
            exit 1
            ;;
    esac
}

# Function to get the latest version tag for an environment
get_latest_version() {
    local env=$1
    
    # Fetch all tags from remote
    git fetch --tags --quiet 2>/dev/null || true
    
    # Get all tags matching the environment pattern
    local tags=$(git tag -l "v*-${env}.*" 2>/dev/null | sort -V | tail -n 1)
    
    if [ -z "$tags" ]; then
        # No existing tags for this environment, start with v1.0.0
        echo "1.0.0"
    else
        # Extract version from tag (e.g., v1.2.3-dev.20241209.1 -> 1.2.3)
        echo "$tags" | sed -E 's/v([0-9]+\.[0-9]+\.[0-9]+)-.*/\1/'
    fi
}

# Function to increment version number
increment_version() {
    local version=$1
    local increment_type=${2:-patch}  # Default to patch increment
    
    IFS='.' read -r major minor patch <<< "$version"
    
    case "$increment_type" in
        "major")
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        "minor")
            minor=$((minor + 1))
            patch=0
            ;;
        "patch"|*)
            patch=$((patch + 1))
            ;;
    esac
    
    echo "${major}.${minor}.${patch}"
}

# Function to get current date in YYYYMMDD format
get_date_string() {
    date +%Y%m%d
}

# Function to calculate build number for today
calculate_build_number() {
    local env=$1
    local date_str=$2
    
    # Fetch all tags from remote
    git fetch --tags --quiet 2>/dev/null || true
    
    # Get all tags for this environment and date
    local existing_tags=$(git tag -l "v*-${env}.${date_str}.*" 2>/dev/null)
    
    if [ -z "$existing_tags" ]; then
        echo "1"
    else
        # Extract build numbers and find the maximum
        local max_build=$(echo "$existing_tags" | sed -E "s/v[0-9]+\.[0-9]+\.[0-9]+-${env}\.${date_str}\.([0-9]+)/\1/" | sort -n | tail -n 1)
        echo $((max_build + 1))
    fi
}

# Function to create and push Git tag
create_and_push_tag() {
    local tag_name=$1
    local commit_sha=${2:-HEAD}
    local message=$3
    
    log_info "Creating annotated tag: $tag_name"
    
    # Create annotated tag
    git tag -a "$tag_name" "$commit_sha" -m "$message"
    
    if [ $? -eq 0 ]; then
        log_success "Tag created locally: $tag_name"
    else
        log_error "Failed to create tag: $tag_name"
        exit 1
    fi
    
    # Push tag to remote
    log_info "Pushing tag to remote repository..."
    git push origin "$tag_name"
    
    if [ $? -eq 0 ]; then
        log_success "Tag pushed to remote: $tag_name"
    else
        log_error "Failed to push tag: $tag_name"
        exit 1
    fi
}

# Function to create clean production tag (without environment suffix)
create_clean_prod_tag() {
    local version=$1
    local commit_sha=${2:-HEAD}
    local message=$3
    
    local clean_tag="v${version}"
    
    log_info "Creating clean production tag: $clean_tag"
    
    # Check if clean tag already exists
    if git rev-parse "$clean_tag" >/dev/null 2>&1; then
        log_warning "Clean tag $clean_tag already exists. Skipping."
        return 0
    fi
    
    # Create annotated tag
    git tag -a "$clean_tag" "$commit_sha" -m "$message"
    
    if [ $? -eq 0 ]; then
        log_success "Clean tag created locally: $clean_tag"
    else
        log_error "Failed to create clean tag: $clean_tag"
        exit 1
    fi
    
    # Push tag to remote
    log_info "Pushing clean tag to remote repository..."
    git push origin "$clean_tag"
    
    if [ $? -eq 0 ]; then
        log_success "Clean tag pushed to remote: $clean_tag"
    else
        log_error "Failed to push clean tag: $clean_tag"
        exit 1
    fi
}

# Main script execution
main() {
    log_info "=== Version Tagging Script Started ==="
    
    # Get current branch name
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    log_info "Current branch: $current_branch"
    
    # Allow override via environment variable or parameter
    local branch_name=${BRANCH_NAME:-${1:-$current_branch}}
    log_info "Using branch: $branch_name"
    
    # Determine environment
    local environment=$(determine_environment "$branch_name")
    log_info "Environment: $environment"
    
    # Get latest version for this environment
    local current_version=$(get_latest_version "$environment")
    log_info "Current version: $current_version"
    
    # Determine version increment type (default to patch)
    local increment_type=${VERSION_INCREMENT:-${2:-patch}}
    log_info "Increment type: $increment_type"
    
    # Calculate next version
    local next_version=$(increment_version "$current_version" "$increment_type")
    log_info "Next version: $next_version"
    
    # Get current date
    local date_str=$(get_date_string)
    log_info "Date: $date_str"
    
    # Calculate build number
    local build_number=$(calculate_build_number "$environment" "$date_str")
    log_info "Build number: $build_number"
    
    # Generate full version tag
    local version_tag="v${next_version}-${environment}.${date_str}.${build_number}"
    log_info "Generated version tag: $version_tag"
    
    # Get commit SHA (default to HEAD)
    local commit_sha=${COMMIT_SHA:-HEAD}
    local commit_sha_full=$(git rev-parse "$commit_sha")
    log_info "Commit SHA: $commit_sha_full"
    
    # Create tag message
    local tag_message="Release ${version_tag} for ${environment} environment
    
Deployment Details:
- Version: ${next_version}
- Environment: ${environment}
- Date: ${date_str}
- Build: ${build_number}
- Commit: ${commit_sha_full}
- Branch: ${branch_name}"
    
    # Create and push the environment-specific tag
    create_and_push_tag "$version_tag" "$commit_sha" "$tag_message"
    
    # For production, also create clean tag (v1.2.3)
    if [ "$environment" = "prod" ]; then
        log_info "Production deployment detected. Creating clean release tag..."
        create_clean_prod_tag "$next_version" "$commit_sha" "Production Release ${next_version}

Commit: ${commit_sha_full}
Environment Tag: ${version_tag}"
    fi
    
    # Output version tag for use in CI/CD pipeline
    echo ""
    log_success "=== Version Tagging Complete ==="
    echo "VERSION_TAG=${version_tag}"
    echo "VERSION=${next_version}"
    echo "ENVIRONMENT=${environment}"
    echo "BUILD_NUMBER=${build_number}"
    echo "COMMIT_SHA=${commit_sha_full}"
    
    # Export for GitHub Actions
    if [ -n "$GITHUB_OUTPUT" ]; then
        echo "version_tag=${version_tag}" >> "$GITHUB_OUTPUT"
        echo "version=${next_version}" >> "$GITHUB_OUTPUT"
        echo "environment=${environment}" >> "$GITHUB_OUTPUT"
        echo "build_number=${build_number}" >> "$GITHUB_OUTPUT"
        echo "commit_sha=${commit_sha_full}" >> "$GITHUB_OUTPUT"
    fi
}

# Run main function
main "$@"
