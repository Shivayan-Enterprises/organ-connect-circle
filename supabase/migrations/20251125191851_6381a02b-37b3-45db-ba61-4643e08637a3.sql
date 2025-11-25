-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'donor');

-- Create enum for blood types
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Create enum for organ types
CREATE TYPE organ_type AS ENUM ('kidney', 'liver', 'heart', 'lung', 'pancreas', 'cornea');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  blood_type blood_type,
  age INTEGER,
  location TEXT,
  medical_history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create organ requirements table (for patients)
CREATE TABLE organ_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organ_type organ_type NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('critical', 'urgent', 'moderate')),
  blood_type_required blood_type NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on organ requirements
ALTER TABLE organ_requirements ENABLE ROW LEVEL SECURITY;

-- Organ requirements policies
CREATE POLICY "Anyone authenticated can view organ requirements"
  ON organ_requirements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Patients can insert their own requirements"
  ON organ_requirements FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = patient_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'patient'
    )
  );

CREATE POLICY "Patients can update their own requirements"
  ON organ_requirements FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete their own requirements"
  ON organ_requirements FOR DELETE
  TO authenticated
  USING (auth.uid() = patient_id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    (NEW.raw_user_meta_data->>'role')::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organ_requirements_updated_at
  BEFORE UPDATE ON organ_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();