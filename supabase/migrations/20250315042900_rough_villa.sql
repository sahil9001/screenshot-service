/*
  # Create screenshots table and storage

  1. New Tables
    - `screenshots`
      - `id` (uuid, primary key)
      - `url` (text, the website URL)
      - `device` (text, device type used)
      - `width` (integer, viewport width)
      - `height` (integer, viewport height)
      - `storage_path` (text, path in storage bucket)
      - `created_at` (timestamp with timezone)
      - `user_id` (uuid, references auth.users)

  2. Storage
    - Create screenshots bucket for storing images
    
  3. Security
    - Enable RLS on screenshots table
    - Add policies for authenticated users
*/

-- Create screenshots table
CREATE TABLE IF NOT EXISTS screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  device text NOT NULL,
  width integer NOT NULL,
  height integer NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own screenshots"
  ON screenshots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create screenshots"
  ON screenshots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket
INSERT INTO storage.buckets (id, name)
VALUES ('screenshots', 'screenshots')
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can view own screenshots"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload screenshots"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);