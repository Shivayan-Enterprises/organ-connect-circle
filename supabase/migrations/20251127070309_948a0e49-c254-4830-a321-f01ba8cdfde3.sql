-- Allow doctors to update donor approval status
CREATE POLICY "Doctors can approve donors"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  get_user_role(auth.uid()) = 'doctor' 
  AND role = 'donor'
)
WITH CHECK (
  get_user_role(auth.uid()) = 'doctor' 
  AND role = 'donor'
);