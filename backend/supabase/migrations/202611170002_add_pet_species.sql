ALTER TABLE public.pets
DROP CONSTRAINT IF EXISTS pets_species_check;

ALTER TABLE public.pets
ADD CONSTRAINT pets_species_check
CHECK (
  species IN (
    'cat',
    'dog',
    'bird',
    'hamster',
    'sugar-glider',
    'rabbit',
    'turtle',
    'fish',
    'hedgehog'
  )
);