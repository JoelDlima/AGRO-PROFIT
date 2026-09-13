-- SQL to standardize state names in profiles table
-- Run this in Supabase SQL Editor if you need to update any existing profiles

-- Option 1: View all current states to see what needs updating
SELECT DISTINCT state, COUNT(*) as user_count 
FROM profiles 
WHERE state IS NOT NULL 
GROUP BY state 
ORDER BY state;

-- Option 2: Update specific state names if they were misspelled or need standardization
-- Example: If "Delhi" needs to be removed (not in new list)
-- UPDATE profiles SET state = 'Haryana' WHERE state = 'Delhi';

-- Option 3: Set state to NULL for states no longer in the list (optional)
-- UPDATE profiles 
-- SET state = NULL 
-- WHERE state NOT IN (
--   'Maharashtra', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh', 
--   'Karnataka', 'Gujarat', 'Rajasthan', 'Haryana', 'Tamil Nadu', 
--   'Andhra Pradesh', 'Telangana', 'West Bengal', 'Bihar', 
--   'Odisha', 'Kerala', 'Goa'
-- );

-- Option 4: View profiles with states that are not in the new list
SELECT id, full_name, state 
FROM profiles 
WHERE state IS NOT NULL 
AND state NOT IN (
  'Maharashtra', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh', 
  'Karnataka', 'Gujarat', 'Rajasthan', 'Haryana', 'Tamil Nadu', 
  'Andhra Pradesh', 'Telangana', 'West Bengal', 'Bihar', 
  'Odisha', 'Kerala', 'Goa'
);

-- No action needed if no data exists yet or states are already correct!
