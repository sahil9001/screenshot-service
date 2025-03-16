import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
export async function signUpAndCreateProfile(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        total_screenshots: 0,
        screenshots_this_month: 0,
        subscription: 'Free'
      });
      if (profileError) throw profileError;
    }

    return data;
  } catch (error) {
    console.error('Error in signUpAndCreateProfile:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}