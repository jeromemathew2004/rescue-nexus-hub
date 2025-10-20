-- Step 1: Create app_role enum (replacing user_role)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Step 2: Create user_roles table with strict RLS
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 4: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role = 'admin'::user_role THEN 'admin'::app_role
    ELSE 'user'::app_role
  END
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 5: Drop ALL existing admin-checking policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage volunteer calls" ON public.volunteer_calls;
DROP POLICY IF EXISTS "Admins can manage applications" ON public.volunteer_call_applications;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.victim_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.victim_requests;
DROP POLICY IF EXISTS "Admins can view all volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can update volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Admins can manage resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can manage allocations" ON public.resource_allocations;
DROP POLICY IF EXISTS "Admins can manage fundraisers" ON public.fundraisers;
DROP POLICY IF EXISTS "Admins can view all donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;

-- Step 6: Drop the role column from profiles (removing privilege escalation vector)
ALTER TABLE public.profiles DROP COLUMN role;

-- Step 7: Update profiles policies to prevent role modification
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 8: Recreate ALL admin policies using the secure function

-- Profiles policies
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Volunteer Calls policies
CREATE POLICY "Admins can manage volunteer calls"
ON public.volunteer_calls
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Volunteer Call Applications policies
CREATE POLICY "Admins can manage applications"
ON public.volunteer_call_applications
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Victim Requests policies
CREATE POLICY "Admins can view all requests"
ON public.victim_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
ON public.victim_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Volunteers policies
CREATE POLICY "Admins can view all volunteers"
ON public.volunteers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update volunteers"
ON public.volunteers
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Resources policies
CREATE POLICY "Admins can manage resources"
ON public.resources
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Resource Allocations policies
CREATE POLICY "Admins can manage allocations"
ON public.resource_allocations
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Fundraisers policies
CREATE POLICY "Admins can manage fundraisers"
ON public.fundraisers
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Donations policies
CREATE POLICY "Admins can view all donations"
ON public.donations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Reports policies
CREATE POLICY "Admins can view all reports"
ON public.reports
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Step 9: Make critical user_id columns NOT NULL (data integrity fix)
-- First set any NULL values to a system user or handle them
UPDATE public.victim_requests SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
UPDATE public.volunteers SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
UPDATE public.reports SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;

-- Now make them NOT NULL
ALTER TABLE public.victim_requests ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.volunteers ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.reports ALTER COLUMN user_id SET NOT NULL;

-- Step 10: Update the handle_new_user function to use new role system
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into profiles (without role)
  INSERT INTO public.profiles (id, name, contact)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email
  );
  
  -- Insert default 'user' role into user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Step 11: Add RLS policy for user_roles (users can view their own roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));