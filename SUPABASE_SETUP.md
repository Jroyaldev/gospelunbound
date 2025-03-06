# Gospel Unbound Supabase Integration

This document outlines the Supabase setup for the Gospel Unbound application.

## Setup Complete

The following functionality has been implemented:

1. **Supabase Authentication**
   - Email/password authentication
   - Auth middleware for protected routes
   - Auth context for user management
   - Sign-in and sign-up pages

2. **Database Schema**
   - `profiles` table for user profiles
   - `courses` table for educational content
   - `lessons` table for individual course lessons
   - `user_course_progress` table to track course completion
   - `user_lesson_progress` table to track individual lesson progress
   - `comments` table for community discussions
   - `likes` table for comment interactions
   - `user_engagement` table for analytics

3. **Server Functions**
   - Database utility functions for all CRUD operations
   - User progress tracking
   - Comment management
   - User profile management

4. **UI Components**
   - User progress dashboard
   - Profile page
   - Profile edit page

## CRUD Operations

The application implements full CRUD (Create, Read, Update, Delete) functionality:

### Create
- User profiles are automatically created on signup
- Users can create comments on courses
- Course progress records are created when a user starts a course
- Lesson progress records are created when a user views a lesson

### Read
- Public courses and lessons are readable by all users
- User profiles are readable by all users
- Progress data is only readable by the user who owns it
- Comments are readable by all users

### Update
- Users can update their own profiles
- Users can update their lesson progress (mark as complete/incomplete)
- Course progress is automatically updated based on lesson progress

### Delete
- Comments can be deleted by their authors
- User data is automatically deleted when a user deletes their account (via cascade)

### Validation
- Server-side validation for all data operations
- Client-side form validation for user inputs
- Username uniqueness is enforced
- URL validation for avatar images

## Storage Setup for Profile Pictures

To enable profile picture uploads, follow these steps in your Supabase dashboard:

1. **Create Storage Bucket**
   - Go to "Storage" in the left sidebar
   - Click "Create a new bucket"
   - Name it `avatars`
   - Select "Public" bucket type

2. **Set Up Storage Policies**
   - Go to "Storage" > "Policies"
   - Click on the "avatars" bucket
   - Create the following policies:

   **For file access (SELECT)**
   - Click "New policy"
   - Policy name: "Public avatar access"
   - Operation: SELECT only
   - Definition:
     ```sql
     bucket_id = 'avatars'
     ```
   - This makes avatar files publicly accessible

   **For file uploads (INSERT)**
   - Click "New policy"
   - Policy name: "Avatar uploads"
   - Operation: INSERT only
   - Definition:
     ```sql
     auth.uid() = auth.uid()
     ```
   - This allows authenticated users to upload files
   - Optional improvement: Add `bucket_id = 'avatars'` to the condition for extra security

   **For file updates (UPDATE)**
   - Click "New policy"
   - Policy name: "Users can update their avatars"
   - Operation: UPDATE only
   - Definition:
     ```sql
     bucket_id = 'avatars' AND auth.uid() = auth.uid()
     ```
   - This allows authenticated users to update their avatar files

   **For file deletion (DELETE)**
   - Click "New policy"
   - Policy name: "Users can delete their avatars"
   - Operation: DELETE only
   - Definition:
     ```sql
     bucket_id = 'avatars' AND auth.uid() = auth.uid()
     ```
   - This allows authenticated users to delete their avatar files

3. **Note About CORS**
   - Supabase automatically handles CORS for your project domain
   - For additional origins or to fix storage CORS issues:
     - Go to "Project Settings" > "API" > "CORS Configuration"
     - Under "Additional origins", add your application URL (e.g., `http://localhost:3000`)
     - Make sure "Storage files" is checked to allow fetching storage files from your domain
     - Save your changes

Now your Supabase storage is configured to handle profile picture uploads. The application will automatically upload images to the `avatars` bucket when users upload a new profile picture.

## Next Steps

To complete the setup:

1. **Apply Database Schema**
   - Run the SQL schema (in `supabase/schema.sql`) in your Supabase SQL Editor
   - This will create all required tables, functions, and RLS policies

2. **Configure Authentication Settings**
   - In the Supabase dashboard, go to "Authentication" > "Providers"
   - Ensure Email provider is enabled
   - Set up any additional providers (Google, GitHub, etc.) if desired

3. **Set Up Email Templates**
   - Go to "Authentication" > "Email Templates"
   - Customize the email templates for account confirmation, password reset, etc.

4. **URL Configuration**
   - Go to "Authentication" > "URL Configuration"
   - Add your site URL (in development: `http://localhost:3000`)
   - Add redirect URL: `http://localhost:3000/api/auth/callback`

5. **Environment Variables**
   - Ensure `.env.local` contains:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     NEXT_PUBLIC_SITE_URL=http://localhost:3000
     ```

## Testing Your Setup

The application includes built-in testing functionality for the Supabase connection:

1. **Development Debug Panel**
   - Available in the profile edit page when in development mode
   - Click "Show Debug Panel" at the bottom of the page
   - Use "Test Connection" to verify Supabase connectivity
   - Use "Test Profile Update" to verify CRUD operations are working

2. **Manual Testing**
   - Create a new user account to test authentication
   - Update your profile to test profile updates
   - Access courses to test data fetching
   - Complete lessons to test progress tracking

3. **Common Issues**
   - If profile updates aren't saving, check RLS policies in Supabase
   - If authentication fails, verify environment variables and URL configuration
   - If data isn't loading, check network requests for API errors

## Troubleshooting

If you encounter issues:

1. **Check Network Requests**
   - Verify Supabase API calls are successful
   - Check for CORS issues

2. **Inspect Authentication State**
   - Use browser dev tools to check cookies and local storage
   - Verify JWT tokens are being set

3. **Database Permissions**
   - Ensure Row Level Security (RLS) policies are correctly configured
   - Test queries with the Supabase API explorer

4. **API Errors**
   - Check console errors for specific Supabase error codes
   - Reference the [Supabase documentation](https://supabase.com/docs) for error resolutions

5. **TypeScript Errors**
   - If you see JSX component errors, they're related to type definitions
   - These don't affect functionality but can be fixed with type assertions

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [NextJS with Supabase Auth](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Schema Migration](https://supabase.com/docs/guides/database/migrations) 