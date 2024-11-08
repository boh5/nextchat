'use server'

import { createClient } from '@/lib/supabase/server'
import { encodedRedirect } from '@/lib/utils'
import { signinFormSchema, signupFormSchema } from '@/lib/validations/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export const signInAction = async (data: z.infer<typeof signinFormSchema>) => {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return encodedRedirect('error', '/signin', error.message)
  }

  return redirect('/chat')
}

export const signUpAction = async (data: z.infer<typeof signupFormSchema>) => {
  const supabase = await createClient()
  const origin = (await headers())?.get('origin')

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error) {
    return encodedRedirect('error', '/signup', error.message)
  }

  return encodedRedirect('success', '/signin', 'Check your email for verification')
}
