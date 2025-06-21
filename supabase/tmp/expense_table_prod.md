| table_name | column_name         | data_type                | character_maximum_length | numeric_precision | numeric_scale | is_nullable | column_default    | ordinal_position |
| ---------- | ------------------- | ------------------------ | ------------------------ | ----------------- | ------------- | ----------- | ----------------- | ---------------- |
| expenses   | id                  | uuid                     | null                     | null              | null          | NO          | gen_random_uuid() | 1                |
| expenses   | user_id             | uuid                     | null                     | null              | null          | NO          | null              | 2                |
| expenses   | amount              | numeric                  | null                     | 12                | 2             | NO          | null              | 3                |
| expenses   | currency            | text                     | null                     | null              | null          | YES         | null              | 4                |
| expenses   | description         | text                     | null                     | null              | null          | YES         | null              | 5                |
| expenses   | date                | timestamp with time zone | null                     | null              | null          | NO          | null              | 6                |
| expenses   | category_id         | uuid                     | null                     | null              | null          | YES         | null              | 7                |
| expenses   | subcategory_id      | uuid                     | null                     | null              | null          | YES         | null              | 8                |
| expenses   | merchant            | text                     | null                     | null              | null          | YES         | null              | 9                |
| expenses   | payment_method      | text                     | null                     | null              | null          | YES         | null              | 10               |
| expenses   | notes               | text                     | null                     | null              | null          | YES         | null              | 11               |
| expenses   | tags                | jsonb                    | null                     | null              | null          | YES         | '[]'::jsonb       | 12               |
| expenses   | source              | text                     | null                     | null              | null          | YES         | null              | 13               |
| expenses   | source_metadata     | jsonb                    | null                     | null              | null          | YES         | '{}'::jsonb       | 14               |
| expenses   | confidence_score    | numeric                  | null                     | 3                 | 2             | YES         | 1.0               | 15               |
| expenses   | needs_review        | boolean                  | null                     | null              | null          | YES         | false             | 16               |
| expenses   | transaction_hash    | character varying        | 64                       | null              | null          | YES         | null              | 17               |
| expenses   | receipt_url         | text                     | null                     | null              | null          | YES         | null              | 18               |
| expenses   | created_at          | timestamp with time zone | null                     | null              | null          | YES         | now()             | 19               |
| expenses   | updated_at          | timestamp with time zone | null                     | null              | null          | YES         | now()             | 20               |
| expenses   | type                | text                     | null                     | null              | null          | YES         | null              | 21               |
| expenses   | recurring           | boolean                  | null                     | null              | null          | YES         | false             | 22               |
| expenses   | recurring_frequency | text                     | null                     | null              | null          | YES         | null              | 23               |
| expenses   | budget_id           | uuid                     | null                     | null              | null          | YES         | null              | 24               |




| source_table | source_column  | target_table  | target_column | constraint_name              | update_rule | delete_rule |
| ------------ | -------------- | ------------- | ------------- | ---------------------------- | ----------- | ----------- |
| expenses     | category_id    | categories    | id            | expenses_category_id_fkey    | NO ACTION   | SET NULL    |
| expenses     | subcategory_id | subcategories | id            | expenses_subcategory_id_fkey | NO ACTION   | SET NULL    |
| expenses     | budget_id      | budgets       | id            | expenses_budget_id_fkey      | NO ACTION   | SET NULL    |
| expenses     | category_id    | categories    | id            | expenses_category_id_fkey    | NO ACTION   | SET NULL    |
| expenses     | subcategory_id | subcategories | id            | expenses_subcategory_id_fkey | NO ACTION   | SET NULL    |