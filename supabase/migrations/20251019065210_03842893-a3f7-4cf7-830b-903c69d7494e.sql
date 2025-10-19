-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create enum for request status
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'in_progress', 'completed', 'rejected');

-- Create enum for fundraiser status
CREATE TYPE public.fundraiser_status AS ENUM ('active', 'completed', 'cancelled');

-- Create enum for volunteer call status
CREATE TYPE public.volunteer_call_status AS ENUM ('active', 'closed');

-- Create enum for application status
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'assigned');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(50),
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create volunteers table
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills TEXT[] NOT NULL DEFAULT '{}',
  location VARCHAR(255),
  availability VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Volunteers policies
CREATE POLICY "Users can view their own volunteer profile"
  ON public.volunteers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own volunteer profile"
  ON public.volunteers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own volunteer profile"
  ON public.volunteers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all volunteers"
  ON public.volunteers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update volunteers"
  ON public.volunteers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create volunteer calls table (NEW FEATURE)
CREATE TABLE public.volunteer_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_name VARCHAR(255) NOT NULL,
  disaster_location VARCHAR(255) NOT NULL,
  required_skills TEXT[] NOT NULL,
  volunteers_needed INTEGER NOT NULL,
  priority_level VARCHAR(50) DEFAULT 'medium',
  status volunteer_call_status DEFAULT 'active',
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

ALTER TABLE public.volunteer_calls ENABLE ROW LEVEL SECURITY;

-- Volunteer calls policies
CREATE POLICY "Anyone can view active volunteer calls"
  ON public.volunteer_calls FOR SELECT
  USING (status = 'active' OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage volunteer calls"
  ON public.volunteer_calls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create volunteer call applications table
CREATE TABLE public.volunteer_call_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.volunteer_calls(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
  status application_status DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  UNIQUE(call_id, volunteer_id)
);

ALTER TABLE public.volunteer_call_applications ENABLE ROW LEVEL SECURITY;

-- Applications policies
CREATE POLICY "Volunteers can view their own applications"
  ON public.volunteer_call_applications FOR SELECT
  USING (
    volunteer_id IN (
      SELECT id FROM public.volunteers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Volunteers can create applications"
  ON public.volunteer_call_applications FOR INSERT
  WITH CHECK (
    volunteer_id IN (
      SELECT id FROM public.volunteers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage applications"
  ON public.volunteer_call_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create victim requests table
CREATE TABLE public.victim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_volunteer_id UUID REFERENCES public.volunteers(id),
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  urgent_needs TEXT,
  status request_status DEFAULT 'pending',
  request_date TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.victim_requests ENABLE ROW LEVEL SECURITY;

-- Victim requests policies
CREATE POLICY "Users can view their own requests"
  ON public.victim_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create requests"
  ON public.victim_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all requests"
  ON public.victim_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update requests"
  ON public.victim_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create resources table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Resources policies
CREATE POLICY "Anyone can view resources"
  ON public.resources FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage resources"
  ON public.resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create resource allocations table
CREATE TABLE public.resource_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.victim_requests(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  quantity_allocated INTEGER NOT NULL,
  allocation_date TIMESTAMPTZ DEFAULT NOW(),
  allocated_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;

-- Resource allocations policies
CREATE POLICY "Users can view allocations for their requests"
  ON public.resource_allocations FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM public.victim_requests WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage allocations"
  ON public.resource_allocations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create fundraisers table
CREATE TABLE public.fundraisers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(12,2) NOT NULL,
  raised_amount DECIMAL(12,2) DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  status fundraiser_status DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.fundraisers ENABLE ROW LEVEL SECURITY;

-- Fundraisers policies
CREATE POLICY "Anyone can view active fundraisers"
  ON public.fundraisers FOR SELECT
  USING (status = 'active' OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage fundraisers"
  ON public.fundraisers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fundraiser_id UUID REFERENCES public.fundraisers(id) ON DELETE CASCADE,
  donor_user_id UUID REFERENCES public.profiles(id),
  donor_name VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  donation_date TIMESTAMPTZ DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT false
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Donations policies
CREATE POLICY "Users can view their own donations"
  ON public.donations FOR SELECT
  USING (donor_user_id = auth.uid() OR is_anonymous = false);

CREATE POLICY "Users can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (donor_user_id = auth.uid() OR donor_user_id IS NULL);

CREATE POLICY "Admins can view all donations"
  ON public.donations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES public.volunteers(id),
  request_id UUID REFERENCES public.victim_requests(id),
  report TEXT NOT NULL,
  report_date TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Reports policies
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Volunteers can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    volunteer_id IN (
      SELECT id FROM public.volunteers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, contact, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update fundraiser raised amount
CREATE OR REPLACE FUNCTION public.update_fundraiser_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.fundraisers
  SET raised_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.donations
    WHERE fundraiser_id = NEW.fundraiser_id
  )
  WHERE id = NEW.fundraiser_id;
  RETURN NEW;
END;
$$;

-- Trigger to update fundraiser amount on donation
CREATE TRIGGER on_donation_created
  AFTER INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_fundraiser_amount();