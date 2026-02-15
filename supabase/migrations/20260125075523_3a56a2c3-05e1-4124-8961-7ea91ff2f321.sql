-- Add role status enum for tracking approval workflow
CREATE TYPE public.role_status AS ENUM ('pending', 'approved', 'rejected');

-- Add status column to user_roles table with default 'pending'
ALTER TABLE public.user_roles 
ADD COLUMN status role_status NOT NULL DEFAULT 'pending',
ADD COLUMN reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN reviewed_at timestamp with time zone;

-- Update existing roles to 'approved' status (for existing users)
UPDATE public.user_roles SET status = 'approved' WHERE status = 'pending';

-- Create a function to check if user has an approved role
CREATE OR REPLACE FUNCTION public.has_approved_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id 
          AND role = _role 
          AND status = 'approved'
    )
$$;

-- Create a function to check if user is staff with approved role
CREATE OR REPLACE FUNCTION public.is_approved_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id 
          AND role IN ('pastor', 'worship_team', 'admin')
          AND status = 'approved'
    )
$$;

-- Update RLS policies to use approved roles for sensitive operations
-- Drop and recreate policies for events
DROP POLICY IF EXISTS "Staff can manage events" ON public.events;
CREATE POLICY "Staff can manage events" ON public.events
FOR ALL USING (is_approved_staff(auth.uid()));

-- Update sermons policies
DROP POLICY IF EXISTS "Pastors can manage sermons" ON public.sermons;
CREATE POLICY "Pastors can manage sermons" ON public.sermons
FOR ALL USING (has_approved_role(auth.uid(), 'pastor') OR has_approved_role(auth.uid(), 'admin'));

-- Update songs policies
DROP POLICY IF EXISTS "Worship team can manage songs" ON public.songs;
CREATE POLICY "Worship team can manage songs" ON public.songs
FOR ALL USING (has_approved_role(auth.uid(), 'worship_team') OR has_approved_role(auth.uid(), 'admin'));

-- Update song_lists policies
DROP POLICY IF EXISTS "Worship team can manage song lists" ON public.song_lists;
CREATE POLICY "Worship team can manage song lists" ON public.song_lists
FOR ALL USING (has_approved_role(auth.uid(), 'worship_team') OR has_approved_role(auth.uid(), 'admin'));

-- Update song_list_items policies  
DROP POLICY IF EXISTS "Worship team can manage song list items" ON public.song_list_items;
CREATE POLICY "Worship team can manage song list items" ON public.song_list_items
FOR ALL USING (has_approved_role(auth.uid(), 'worship_team') OR has_approved_role(auth.uid(), 'admin'));

-- Update missions policies
DROP POLICY IF EXISTS "Admins can manage missions" ON public.missions;
CREATE POLICY "Admins can manage missions" ON public.missions
FOR ALL USING (has_approved_role(auth.uid(), 'admin'));

-- Update financial_records policies
DROP POLICY IF EXISTS "Admins can manage financial records" ON public.financial_records;
CREATE POLICY "Admins can manage financial records" ON public.financial_records
FOR ALL USING (has_approved_role(auth.uid(), 'admin'));

-- Update user_roles admin policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL USING (has_approved_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (has_approved_role(auth.uid(), 'admin'));