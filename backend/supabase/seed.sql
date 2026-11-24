insert into public.shelters (
  id, name, location, phone, email, description, image_url, is_published
) values
  (
    '20000000-0000-4000-8000-000000000001',
    'Paw Haven',
    'Bandung, Jawa Barat',
    '',
    'halo@pawhaven.example',
    'Shelter komunitas yang mendampingi hewan sampai menemukan keluarga baru.',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=85',
    true
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Rumah Ekor',
    'Jakarta Selatan, DKI Jakarta',
    '',
    'sapa@rumahekor.example',
    'Tempat aman untuk hewan terlantar dan calon adopter yang peduli.',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=85',
    true
  )
on conflict (id) do update set
  name = excluded.name,
  location = excluded.location,
  phone = excluded.phone,
  email = excluded.email,
  description = excluded.description,
  image_url = excluded.image_url,
  is_published = excluded.is_published,
  updated_at = now();

insert into public.pets (
  id, shelter_id, name, species, breed, age_months, sex, description, status, image_url, is_published
) values
  (
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Milo',
    'dog',
    'Golden Retriever Mix',
    18,
    'male',
    'Ramah, aktif, dan suka menemani jalan sore. Milo sudah vaksin dasar.',
    'available',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1000&q=88',
    true
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    'Luna',
    'cat',
    'Domestic Shorthair',
    10,
    'female',
    'Penyayang dan tenang. Luna senang beristirahat dekat jendela.',
    'available',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=88',
    true
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000001',
    'Piko',
    'bird',
    'Lovebird',
    8,
    'male',
    'Burung kecil yang aktif dan terbiasa dengan lingkungan rumah.',
    'available',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1000&q=88',
    true
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000002',
    'Boba',
    'hamster',
    'Syrian',
    5,
    'female',
    'Hamster mungil yang ingin rumah tenang dan kandang yang nyaman.',
    'available',
    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=1000&q=88',
    true
  ),
  (
    '10000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000001',
    'Mochi',
    'sugar-glider',
    'Sugar glider',
    9,
    'female',
    'Sugar glider aktif yang membutuhkan teman dan perawatan khusus.',
    'available',
    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=1000&q=88',
    true
  ),
  (
    '10000000-0000-4000-8000-000000000006',
    '20000000-0000-4000-8000-000000000002',
    'Oreo',
    'rabbit',
    'Holland Lop Mix',
    14,
    'male',
    'Kelinci lembut yang suka menjelajah dan menikmati sayuran segar.',
    'available',
    'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=1000&q=88',
    true
  ),
  (
    '10000000-0000-4000-8000-000000000007',
    '20000000-0000-4000-8000-000000000001',
    'Kura',
    'turtle',
    'Kura-kura Brazil',
    24,
    'female',
    'Kura-kura yang tenang dan membutuhkan akuarium dengan area berjemur.',
    'available',
    '',
    true
  ),
  (
    '10000000-0000-4000-8000-000000000008',
    '20000000-0000-4000-8000-000000000002',
    'Bintang',
    'fish',
    'Ikan mas koki',
    6,
    'male',
    'Ikan hias yang aktif dan membutuhkan akuarium bersih dengan filtrasi baik.',
    'available',
    '',
    true
  ),
  (
    '10000000-0000-4000-8000-000000000009',
    '20000000-0000-4000-8000-000000000001',
    'Pompom',
    'hedgehog',
    'Landak mini Afrika',
    12,
    'female',
    'Landak mini yang perlu rumah tenang dan perawatan suhu yang sesuai.',
    'available',
    '',
    true
  )
on conflict (id) do update set
  shelter_id = excluded.shelter_id,
  name = excluded.name,
  species = excluded.species,
  breed = excluded.breed,
  age_months = excluded.age_months,
  sex = excluded.sex,
  description = excluded.description,
  status = excluded.status,
  image_url = excluded.image_url,
  is_published = excluded.is_published,
  updated_at = now();
