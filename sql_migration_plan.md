# Schema Update Plan

The following schema updates are required to fully support the advanced features (Multi-currency, Debt & EMI Management, Recurring Transactions).

## 1. Profiles Table
Add a `currency` column to store user preferences.

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
```

## 2. Transactions Table
Add a `currency` column to record the currency used for each transaction.

```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
```

## 3. Recurring Transactions Table
Add a `currency` column for recurring bills and subscriptions.

```sql
ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
```

## 4. Debts Table (Verification)
Ensure the `debts` table is created with all necessary fields if it doesn't already exist.

```sql
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    total_amount DECIMAL NOT NULL,
    remaining_amount DECIMAL NOT NULL,
    interest_rate DECIMAL,
    next_emi_date DATE,
    emi_amount DECIMAL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 5. Row Level Security (RLS)
Ensure RLS is enabled and policies are set for the new tables.

```sql
-- Debts RLS
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own debts" 
ON debts FOR ALL 
USING (auth.uid() = user_id);

-- Recurring Transactions RLS
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own recurring transactions" 
ON recurring_transactions FOR ALL 
USING (auth.uid() = user_id);
```
