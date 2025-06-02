'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const dataLogin = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data, error } = await supabase.auth.signInWithPassword(dataLogin)

    if (error) {
        if (error?.code === 'invalid_credentials') {
            throw new Error("Credenciales incorrectas, por favor intenta nuevamente.")
        }

        throw new Error("No se pudo iniciar sesión, por favor intenta nuevamente.")
    }

    revalidatePath('/', 'layout')
    redirect('/home')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const dataSignup = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data, error } = await supabase.auth.signUp(dataSignup)

    if (error) {
        if (error?.code === 'email_exists') {
            throw new Error("El correo electrónico ya está en uso, por favor intenta con otro.")
        }

        throw new Error("No se pudo crear la cuenta, por favor intenta nuevamente.")
    }

    revalidatePath('/', 'layout')
}