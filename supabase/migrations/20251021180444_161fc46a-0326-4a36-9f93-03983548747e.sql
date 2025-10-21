-- Drop existing insert policy
DROP POLICY IF EXISTS "Volunteers can create reports" ON public.reports;

-- Create simplified insert policy for users
CREATE POLICY "Users can create reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create delete policy for admins
CREATE POLICY "Admins can delete reports"
ON public.reports
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));