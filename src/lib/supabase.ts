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

// ─── Real Client (uncomment for production) ───────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

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
