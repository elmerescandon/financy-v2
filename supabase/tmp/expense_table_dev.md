| table_name | column_name      | data_type                | character_maximum_length | numeric_precision | numeric_scale | is_nullable | column_default           | ordinal_position |
| ---------- | ---------------- | ------------------------ | ------------------------ | ----------------- | ------------- | ----------- | ------------------------ | ---------------- |
| expenses   | id               | uuid                     | null                     | null              | null          | NO          | uuid_generate_v4()       | 1                |
| expenses   | user_id          | uuid                     | null                     | null              | null          | NO          | null                     | 2                |
| expenses   | amount           | numeric                  | null                     | 12                | 2             | NO          | null                     | 3                |
| expenses   | currency         | USER-DEFINED             | null                     | null              | null          | YES         | 'USD'::currency          | 4                |
| expenses   | description      | text                     | null                     | null              | null          | NO          | null                     | 5                |
| expenses   | date             | date                     | null                     | null              | null          | NO          | null                     | 6                |
| expenses   | category_id      | uuid                     | null                     | null              | null          | YES         | null                     | 7                |
| expenses   | subcategory_id   | uuid                     | null                     | null              | null          | YES         | null                     | 8                |
| expenses   | budget_id        | uuid                     | null                     | null              | null          | YES         | null                     | 9                |
| expenses   | merchant         | character varying        | 200                      | null              | null          | YES         | null                     | 10               |
| expenses   | payment_method   | USER-DEFINED             | null                     | null              | null          | NO          | null                     | 11               |
| expenses   | notes            | text                     | null                     | null              | null          | YES         | null                     | 12               |
| expenses   | tags             | ARRAY                    | null                     | null              | null          | YES         | '{}'::text[]             | 13               |
| expenses   | source           | USER-DEFINED             | null                     | null              | null          | YES         | 'manual'::expense_source | 14               |
| expenses   | source_metadata  | jsonb                    | null                     | null              | null          | YES         | '{}'::jsonb              | 15               |
| expenses   | confidence_score | numeric                  | null                     | 3                 | 2             | YES         | 1.0                      | 16               |
| expenses   | needs_review     | boolean                  | null                     | null              | null          | YES         | false                    | 17               |
| expenses   | transaction_hash | character varying        | 64                       | null              | null          | YES         | null                     | 18               |
| expenses   | receipt_url      | text                     | null                     | null              | null          | YES         | null                     | 19               |
| expenses   | created_at       | timestamp with time zone | null                     | null              | null          | YES         | now()                    | 20               |
| expenses   | updated_at       | timestamp with time zone | null                     | null              | null          | YES         | now()                    | 21               |


| source_table | source_column  | target_table  | target_column | constraint_name              | update_rule | delete_rule |
| ------------ | -------------- | ------------- | ------------- | ---------------------------- | ----------- | ----------- |
| expenses     | budget_id      | budgets       | id            | expenses_budget_id_fkey      | NO ACTION   | SET NULL    |
| expenses     | category_id    | categories    | id            | expenses_category_id_fkey    | NO ACTION   | SET NULL    |
| expenses     | subcategory_id | subcategories | id            | expenses_subcategory_id_fkey | NO ACTION   | SET NULL    |