#!/bin/bash
set -e

echo "Fixing SSR issues for all client-side pages..."

# Add dynamic export to pages that use client-side features
pages=(
  "apps/web/src/app/admin/page.tsx"
  "apps/web/src/app/admin/finance/page.tsx"
  "apps/web/src/app/dashboard/page.tsx"
  "apps/web/src/app/profile/page.tsx"
  "apps/web/src/app/jobs/page.tsx"
  "apps/web/src/app/listings/page.tsx"
)

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    # Check if dynamic export already exists
    if ! grep -q "export const dynamic" "$page"; then
      echo "" >> "$page"
      echo "// Disable static generation for this page" >> "$page"
      echo "export const dynamic = 'force-dynamic';" >> "$page"
      echo "Added dynamic export to $page"
    fi
  fi
done

echo "SSR fixes applied successfully!"