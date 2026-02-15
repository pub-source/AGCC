-- Create churches table
CREATE TABLE public.churches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

-- Anyone can view churches
CREATE POLICY "Anyone can view churches" ON public.churches
FOR SELECT USING (true);

-- Only super admins can manage churches
CREATE POLICY "Super admins can manage churches" ON public.churches
FOR ALL USING (has_approved_role(auth.uid(), 'admin'::app_role));

-- Insert the initial churches
INSERT INTO public.churches (name, slug) VALUES
    ('AGCC Lakeside', 'agcc-lakeside'),
    ('AGCC Mabuhay', 'agcc-mabuhay'),
    ('AGCC Mercedes', 'agcc-mercedes');

-- Add church_id to user_roles
ALTER TABLE public.user_roles 
ADD COLUMN church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL;

-- Add church_id to sermons
ALTER TABLE public.sermons 
ADD COLUMN church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

-- Add church_id to events
ALTER TABLE public.events 
ADD COLUMN church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

-- Add church_id to songs
ALTER TABLE public.songs 
ADD COLUMN church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

-- Add church_id to song_lists
ALTER TABLE public.song_lists 
ADD COLUMN church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

-- Add church_id to missions
ALTER TABLE public.missions 
ADD COLUMN church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

-- Add church_id to financial_records
ALTER TABLE public.financial_records 
ADD COLUMN church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;

-- Create function to get user's church_id
CREATE OR REPLACE FUNCTION public.get_user_church_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT church_id FROM public.user_roles
    WHERE user_id = _user_id
    AND status = 'approved'
    LIMIT 1
$$;

-- Create function to check if user belongs to a church
CREATE OR REPLACE FUNCTION public.belongs_to_church(_user_id UUID, _church_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id
        AND church_id = _church_id
        AND status = 'approved'
    )
$$;

-- Drop old RLS policies and create new church-scoped ones

-- Sermons: Only users from same church can view, pastors from church can manage
DROP POLICY IF EXISTS "Anyone can view sermons" ON public.sermons;
DROP POLICY IF EXISTS "Pastors can manage sermons" ON public.sermons;

CREATE POLICY "Users can view their church sermons" ON public.sermons
FOR SELECT USING (
    belongs_to_church(auth.uid(), church_id) 
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Pastors can manage their church sermons" ON public.sermons
FOR ALL USING (
    (belongs_to_church(auth.uid(), church_id) AND has_approved_role(auth.uid(), 'pastor'::app_role))
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

-- Events: Church-scoped
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Staff can manage events" ON public.events;

CREATE POLICY "Users can view their church events" ON public.events
FOR SELECT USING (
    belongs_to_church(auth.uid(), church_id) 
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Staff can manage their church events" ON public.events
FOR ALL USING (
    (belongs_to_church(auth.uid(), church_id) AND is_approved_staff(auth.uid()))
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

-- Songs: Church-scoped
DROP POLICY IF EXISTS "Anyone can view songs" ON public.songs;
DROP POLICY IF EXISTS "Worship team can manage songs" ON public.songs;

CREATE POLICY "Users can view their church songs" ON public.songs
FOR SELECT USING (
    belongs_to_church(auth.uid(), church_id) 
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Worship team can manage their church songs" ON public.songs
FOR ALL USING (
    (belongs_to_church(auth.uid(), church_id) AND (has_approved_role(auth.uid(), 'worship_team'::app_role) OR has_approved_role(auth.uid(), 'pastor'::app_role)))
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

-- Song lists: Church-scoped
DROP POLICY IF EXISTS "Anyone can view song lists" ON public.song_lists;
DROP POLICY IF EXISTS "Worship team can manage song lists" ON public.song_lists;

CREATE POLICY "Users can view their church song lists" ON public.song_lists
FOR SELECT USING (
    belongs_to_church(auth.uid(), church_id) 
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Worship team can manage their church song lists" ON public.song_lists
FOR ALL USING (
    (belongs_to_church(auth.uid(), church_id) AND (has_approved_role(auth.uid(), 'worship_team'::app_role) OR has_approved_role(auth.uid(), 'pastor'::app_role)))
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

-- Song list items: inherit from parent song_list
DROP POLICY IF EXISTS "Anyone can view song list items" ON public.song_list_items;
DROP POLICY IF EXISTS "Worship team can manage song list items" ON public.song_list_items;

CREATE POLICY "Users can view song list items" ON public.song_list_items
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.song_lists sl
        WHERE sl.id = song_list_id
        AND (belongs_to_church(auth.uid(), sl.church_id) OR has_approved_role(auth.uid(), 'admin'::app_role))
    )
);

CREATE POLICY "Worship team can manage song list items" ON public.song_list_items
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.song_lists sl
        WHERE sl.id = song_list_id
        AND (
            (belongs_to_church(auth.uid(), sl.church_id) AND (has_approved_role(auth.uid(), 'worship_team'::app_role) OR has_approved_role(auth.uid(), 'pastor'::app_role)))
            OR has_approved_role(auth.uid(), 'admin'::app_role)
        )
    )
);

-- Missions: Church-scoped
DROP POLICY IF EXISTS "Anyone can view missions" ON public.missions;
DROP POLICY IF EXISTS "Admins can manage missions" ON public.missions;

CREATE POLICY "Users can view their church missions" ON public.missions
FOR SELECT USING (
    belongs_to_church(auth.uid(), church_id) 
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Pastors can manage their church missions" ON public.missions
FOR ALL USING (
    (belongs_to_church(auth.uid(), church_id) AND has_approved_role(auth.uid(), 'pastor'::app_role))
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

-- Financial records: Church-scoped
DROP POLICY IF EXISTS "Anyone can view public financial records" ON public.financial_records;
DROP POLICY IF EXISTS "Admins can manage financial records" ON public.financial_records;

CREATE POLICY "Users can view their church public financial records" ON public.financial_records
FOR SELECT USING (
    (is_public = true AND belongs_to_church(auth.uid(), church_id))
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Pastors can manage their church financial records" ON public.financial_records
FOR ALL USING (
    (belongs_to_church(auth.uid(), church_id) AND has_approved_role(auth.uid(), 'pastor'::app_role))
    OR has_approved_role(auth.uid(), 'admin'::app_role)
);

-- Update trigger for churches
CREATE TRIGGER update_churches_updated_at
BEFORE UPDATE ON public.churches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();