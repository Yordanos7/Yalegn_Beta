#!/bin/bash
set -e

echo "Cleaning duplicate dynamic exports..."

# Remove all existing dynamic exports
files=(
  "apps/web/src/app/analytics/page.tsx"
  "apps/web/src/app/profile/page.tsx"
  "apps/web/src/app/dashboard/page.tsx"
  "apps/web/src/app/admin/page.tsx"
  "apps/web/src/app/admin/finance/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Remove existing dynamic exports and empty lines at the end
    sed -i '/^\/\/ Disable static generation for this page$/d' "$file"
    sed -i '/^export const dynamic = /d' "$file"
    # Remove trailing empty lines
    sed -i -e :a -e '/^\s*$/N;ba' -e 's/\n\s*$//' "$file"
    echo "Cleaned $file"
  fi
done

echo "All dynamic exports cleaned!"