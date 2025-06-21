import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/'

    if (token_hash && type) {
        const supabase = await createClient()
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            // Check if user has categories (indicates if they've completed onboarding)
            const { data: { user } } = await supabase.auth.getUser()
            console.log('user', user)
            if (user) {
                const { data: categories } = await supabase
                    .from('categories')
                    .select('id')
                    .eq('user_id', user.id)
                    .limit(1)

                // If no categories exist, redirect to onboarding
                if (!categories || categories.length === 0) {
                    redirect('/onboarding')
                }
            }

            // redirect user to specified redirect URL or root of app
            redirect(next)
        }
    }
    // redirect the user to an error page with some instructions
    redirect('/error')
}