-- Allow patients to view all donors (not just approved ones)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own profile
  auth.uid() = id
  OR
  -- Doctors can see all profiles
  get_user_role(auth.uid()) = 'doctor'
  OR
  -- Patients can see other patients
  (role = 'patient' AND get_user_role(auth.uid()) = 'patient')
  OR
  -- Patients can see ALL donors (removed approved_by_doctor check)
  (role = 'donor' AND get_user_role(auth.uid()) = 'patient')
  OR
  -- Donors can see patients
  (get_user_role(auth.uid()) = 'donor' AND role = 'patient')
  OR
  -- Donors can see other approved donors
  (get_user_role(auth.uid()) = 'donor' AND role = 'donor' AND approved_by_doctor = true)
);