import { createSupabaseClient } from '@/lib/api/database'

export async function GET(request: Request) {
    const url = new URL(request.url)
    const testUserId = url.searchParams.get('user_id')

    if (!testUserId) {
        return Response.json({ error: 'user_id required' }, { status: 400 })
    }

    try {
        const supabase = await createSupabaseClient()

        // Check what auth.uid() returns (should be null for test)
        const { data: authData } = await supabase.auth.getUser()

        // Try querying categories with RLS active
        const { data: categories, error, count } = await supabase
            .from('categories')
            .select('*', { count: 'exact' })
            .eq('user_id', testUserId)

        // Check if data exists by temporarily disabling RLS (using service role if possible)
        // Or use a different approach to verify data exists
        let rawDataCheck = null
        let rawError = null

        try {
            // Try with a raw SQL query that bypasses RLS policies
            const { data: rawResult, error: rawErr } = await supabase
                .rpc('exec_sql', {
                    query: `SELECT COUNT(*) as count, array_agg(name) as names FROM categories WHERE user_id = '${testUserId}'`
                })
            rawDataCheck = rawResult
            rawError = rawErr
        } catch (e) {
            // exec_sql might not exist, that's ok
            rawError = 'exec_sql not available'
        }

        // Check total categories in DB (regardless of user)
        const { count: totalCount } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })

        return Response.json({
            debug: {
                test_user_id: testUserId,
                auth_user: authData?.user?.id || 'no auth user',

                // Current query results
                categories_count: count,
                categories_data: categories?.slice(0, 3), // Only first 3 for brevity
                error: error,

                // Raw data check
                raw_data_check: rawDataCheck,
                raw_error: rawError,

                // Total categories in system
                total_categories_in_db: totalCount,

                // Analysis
                rls_active: error?.code === 'PGRST301',
                likely_issue: count === 0 && !error
                    ? 'RLS filtering data (auth.uid() is null)'
                    : 'Unknown issue'
            }
        })

    } catch (error) {
        return Response.json({
            error: 'Debug failed',
            details: error
        }, { status: 500 })
    }
} 