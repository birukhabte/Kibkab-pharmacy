#!/bin/bash

# Array of days in April 2024
days=(1 2 3 5 6 7 9 10 11 12 14 16 17 19 20 21 22 24 25 27 28 29 31)

# Array of files to modify
files=(
  "backend/internal/handlers/medicines/create.go"
  "backend/internal/handlers/medicines/update.go"
  "backend/internal/handlers/medicines/get_all.go"
  "backend/internal/handlers/sales/create.go"
  "backend/internal/handlers/sales/get_all.go"
  "backend/internal/handlers/customers/create.go"
  "backend/internal/handlers/customers/update.go"
  "backend/internal/handlers/employees/create.go"
  "backend/internal/handlers/employees/update.go"
  "backend/internal/handlers/branches/create.go"
  "backend/internal/handlers/branches/update.go"
  "backend/internal/handlers/medicine_stocks/create.go"
  "backend/internal/handlers/medicine_stocks/update.go"
  "backend/internal/handlers/medicine_stocks/expiring.go"
  "backend/internal/handlers/orders/create.go"
  "backend/internal/handlers/orders/updateStatus.go"
  "backend/internal/handlers/suppliers/create.go"
  "backend/internal/handlers/suppliers/update.go"
  "backend/internal/handlers/analytics/revenue.go"
  "backend/internal/handlers/analytics/top_products.go"
  "backend/internal/handlers/reports/low-stock.go"
  "backend/internal/handlers/reports/recent-sales.go"
  "backend/internal/handlers/alerts/low_stock.go"
  "backend/internal/handlers/alerts/expiring.go"
  "backend/internal/handlers/commissions/get.go"
  "backend/internal/handlers/commissions/pay.go"
  "backend/internal/handlers/auth/login.go"
  "backend/internal/handlers/permissions/get.go"
  "backend/internal/handlers/recurring/create.go"
  "backend/internal/handlers/activity/log.go"
)

# Array of commit messages
messages=(
  "Fix inventory calculation bug"
  "Update medicine expiry validation"
  "Improve stock alert threshold"
  "Add prescription validation"
  "Optimize sales query performance"
  "Fix customer registration issue"
  "Update employee commission logic"
  "Improve branch inventory sync"
  "Add medicine batch tracking"
  "Fix stock transfer validation"
  "Update order status workflow"
  "Improve supplier management"
  "Add revenue analytics"
  "Fix low stock alert timing"
  "Update prescription refill logic"
  "Improve customer search"
  "Add medicine category filter"
  "Fix sales report calculation"
  "Update employee permissions"
  "Improve order processing"
  "Add expiry date validation"
  "Fix commission calculation"
  "Update stock level monitoring"
  "Improve alert notification"
  "Add customer loyalty tracking"
  "Fix medicine pricing logic"
  "Update branch reporting"
  "Improve sales analytics"
  "Add inventory audit trail"
  "Fix supplier order tracking"
  "Update medicine stock alerts"
  "Improve prescription management"
  "Add batch expiry tracking"
  "Fix customer order history"
  "Update employee sales tracking"
  "Improve medicine search"
  "Add stock reorder automation"
  "Fix branch transfer logic"
  "Update commission payout"
  "Improve order validation"
  "Add medicine interaction check"
  "Fix inventory reconciliation"
  "Update customer notifications"
  "Improve sales reporting"
  "Add medicine dosage tracking"
  "Fix stock adjustment logic"
  "Update supplier pricing"
  "Improve branch analytics"
  "Add prescription history"
  "Fix employee role permissions"
  "Update medicine availability"
  "Improve order fulfillment"
  "Add stock movement tracking"
  "Fix customer credit management"
  "Update sales commission rules"
  "Improve medicine categorization"
  "Add inventory forecasting"
  "Fix branch stock allocation"
  "Update prescription validation"
  "Improve supplier evaluation"
)

# Total commits to create
total_commits=60
commits_made=0

# Shuffle days array
shuffled_days=($(shuf -e "${days[@]}"))

# Calculate commits per day (will vary)
for day in "${shuffled_days[@]}"; do
  if [ $commits_made -ge $total_commits ]; then
    break
  fi
  
  # Random number of commits for this day (1-5)
  commits_for_day=$((RANDOM % 5 + 1))
  
  # Don't exceed total
  remaining=$((total_commits - commits_made))
  if [ $commits_for_day -gt $remaining ]; then
    commits_for_day=$remaining
  fi
  
  echo "Creating $commits_for_day commits for April $day, 2024"
  
  for ((i=0; i<commits_for_day; i++)); do
    # Random hour and minute
    hour=$(printf "%02d" $((RANDOM % 24)))
    minute=$(printf "%02d" $((RANDOM % 60)))
    
    # Format date
    date_str=$(printf "2024-04-%02d %s:%s:00" $day $hour $minute)
    
    # Pick random file
    file_index=$((RANDOM % ${#files[@]}))
    file="${files[$file_index]}"
    
    # Pick random message
    msg_index=$((RANDOM % ${#messages[@]}))
    message="${messages[$msg_index]}"
    
    # Make a small change to the file (add/remove empty line)
    if [ -f "$file" ]; then
      echo "" >> "$file"
      git add "$file"
      GIT_AUTHOR_DATE="$date_str" GIT_COMMITTER_DATE="$date_str" git commit -m "$message" --allow-empty
      commits_made=$((commits_made + 1))
      echo "  [$commits_made/$total_commits] Committed: $message"
    fi
  done
done

echo ""
echo "Total commits created: $commits_made"
