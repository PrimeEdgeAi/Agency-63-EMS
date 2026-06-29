/**
 * Supabase Client
 *
 * PRODUCTION SETUP:
 * 1. Create a .env file in the project root with:
 *      VITE_SUPABASE_URL=https://your-project.supabase.co
 *      VITE_SUPABASE_ANON_KEY=your-anon-key
 *
 * 2. Uncomment the real client import below and remove the mock.
 *
 * 3. In your Supabase dashboard:
 *    - Enable Google OAuth under Authentication → Providers
 *    - Add approved emails to a custom table or use RLS policies
 *    - Set the redirect URL to your domain
 */

//how do i add the step 3 am stuck



// ─── Real Client (uncomment for production) ───────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string || 'https://gyujseqpdxnjbaudrjgh.supabase.co'
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5dWpzZXFwZHhuamJhdWRyamdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODg1MTUsImV4cCI6MjA5MzQ2NDUxNX0.FGxgtHExl_h1O53zD5YmqqHl-0oMKt1egWIrMDesucQ'

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Mock Client (development / demo) ────────────────────────────────────────
// import { APPROVED_EMAILS } from '../data'
// import type { AppUser } from '../types'

// interface AuthResult {
//   data: { user: AppUser | null }
//   error: { message: string } | null
// }

// export const supabase = {
//   auth: {
//     signInWithOAuth: async (_opts: { provider: string }): Promise<AuthResult> => {
//       await new Promise((r) => setTimeout(r, 1600))
//       const mockEmail = 'demo@eventportal.com'
//       if (APPROVED_EMAILS.includes(mockEmail)) {
//         return {
//           data: {
//             user: {
//               email: mockEmail,
//               user_metadata: { full_name: 'Alex Kamau', avatar_url: undefined },
//             },
//           },
//           error: null,
//         }
//       }
//       return { data: { user: null }, error: { message: 'Email not approved.' } }
//     },

//     signOut: async (): Promise<{ error: null }> => ({ error: null }),

//     getUser: async (): Promise<AuthResult> => ({
//       data: { user: null },
//       error: null,
//     }),
//   },
// }
