#!/bin/bash

# Log Level Adjustment Script for CEO Communication Backend
# Usage: ./scripts/adjust-logging.sh [quiet|normal|verbose|debug]

set -e

ENV_FILE=".env"
ENV_EXAMPLE_FILE=".env.example"

# Function to update log level in .env file
update_log_level() {
    local level=$1
    local format=$2
    local file=$3
    
    if [[ -f "$file" ]]; then
        # Update LOG_LEVEL
        if grep -q "^LOG_LEVEL=" "$file"; then
            sed -i.bak "s/^LOG_LEVEL=.*/LOG_LEVEL=$level/" "$file"
        else
            echo "LOG_LEVEL=$level" >> "$file"
        fi
        
        # Update LOG_FORMAT
        if grep -q "^LOG_FORMAT=" "$file"; then
            sed -i.bak "s/^LOG_FORMAT=.*/LOG_FORMAT=$format/" "$file"
        else
            echo "LOG_FORMAT=$format" >> "$file"
        fi
        
        echo "✅ Updated $file with LOG_LEVEL=$level and LOG_FORMAT=$format"
    else
        echo "❌ File $file not found"
    fi
}

# Main logic
case "${1:-normal}" in
    "quiet")
        echo "🔇 Setting logging to QUIET mode (errors only)"
        update_log_level "error" "json" "$ENV_FILE"
        echo "   - Only error messages will be logged"
        echo "   - JSON format for production-like output"
        ;;
    
    "normal")
        echo "📋 Setting logging to NORMAL mode (info level)"
        update_log_level "info" "pretty" "$ENV_FILE"
        echo "   - Important info, warnings, and errors"
        echo "   - Pretty format with colors"
        echo "   - Reduced startup noise"
        ;;
    
    "verbose")
        echo "📢 Setting logging to VERBOSE mode (debug level)"
        update_log_level "debug" "pretty" "$ENV_FILE"
        echo "   - All messages including debug info"
        echo "   - Pretty format with colors"
        echo "   - Full operational details"
        ;;
    
    "debug")
        echo "🔍 Setting logging to DEBUG mode (maximum verbosity)"
        update_log_level "debug" "json" "$ENV_FILE"
        echo "   - All messages with full JSON context"
        echo "   - Useful for troubleshooting"
        echo "   - JSON format for log analysis"
        ;;
    
    "production")
        echo "🏭 Setting logging to PRODUCTION mode"
        update_log_level "warn" "json" "$ENV_FILE"
        echo "   - Warnings and errors only"
        echo "   - JSON format for log aggregation"
        echo "   - Minimal performance impact"
        ;;
    
    *)
        echo "🔧 Log Level Adjustment Tool"
        echo ""
        echo "Usage: $0 [mode]"
        echo ""
        echo "Available modes:"
        echo "  quiet      - Errors only (level: error, format: json)"
        echo "  normal     - Important messages (level: info, format: pretty) [DEFAULT]"
        echo "  verbose    - Detailed logging (level: debug, format: pretty)"
        echo "  debug      - Full debug info (level: debug, format: json)"
        echo "  production - Production ready (level: warn, format: json)"
        echo ""
        echo "Current settings:"
        if [[ -f "$ENV_FILE" ]]; then
            echo "  LOG_LEVEL: $(grep '^LOG_LEVEL=' $ENV_FILE | cut -d'=' -f2 || echo 'not set')"
            echo "  LOG_FORMAT: $(grep '^LOG_FORMAT=' $ENV_FILE | cut -d'=' -f2 || echo 'not set')"
        else
            echo "  .env file not found"
        fi
        exit 1
        ;;
esac

echo ""
echo "💡 Tip: Restart your server to apply the new logging settings"
echo "   npm run dev"