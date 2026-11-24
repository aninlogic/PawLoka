const { createClient } = require('@supabase/supabase-js');
const { pets, shelters } = require('./demo-data');

function matchesSearch(pet, query) {
  if (!query) return true;
  const normalized = query.toLocaleLowerCase('id-ID');
  return [pet.name, pet.breed, pet.species, pet.description]
    .filter(Boolean)
    .some((value) => value.toLocaleLowerCase('id-ID').includes(normalized));
}

function createDemoRepository() {
  return {
    mode: 'demo',
    async listPets(filters = {}) {
      return pets.filter((pet) => {
        if (filters.species && filters.species !== 'all' && pet.species !== filters.species) {
          return false;
        }
        if (filters.status && filters.status !== 'all' && pet.status !== filters.status) {
          return false;
        }
        if (filters.ageMin !== undefined && pet.age_months < Number(filters.ageMin)) return false;
        if (filters.ageMax !== undefined && pet.age_months > Number(filters.ageMax)) return false;
        return matchesSearch(pet, filters.q);
      }).slice(0, filters.limit || 50);
    },
    async getPet(id) {
      const pet = pets.find((item) => item.id === id);
      if (!pet) return null;

      const shelter = shelters.find((item) => item.id === pet.shelter_id);
      return {
        ...pet,
        shelter: shelter
          ? {
              id: shelter.id,
              name: shelter.name,
              location: shelter.location,
              phone: shelter.phone,
            }
          : pet.shelter,
      };
    },
    async listShelters() {
      return shelters.map((shelter) => ({
        ...shelter,
        pets: pets.filter((pet) => pet.shelter_id === shelter.id),
      }));
    },
    async getShelter(id) {
      const shelter = shelters.find((item) => item.id === id);
      if (!shelter) return null;
      return {
        ...shelter,
        pets: pets.filter((pet) => pet.shelter_id === id),
      };
    },
  };
}

function createSupabaseRepository() {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('DATA_MODE=supabase requires Supabase server credentials.');
  }

  const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return {
    mode: 'supabase',
    async verifyAccessToken(token) {
      const { data, error } = await client.auth.getUser(token);
      if (error?.status === 401 || error?.status === 403) return null;
      if (error) throw error;
      return data.user;
    },
    async listPets(filters = {}) {
      let query = client
        .from('pets')
        .select('*, shelter:shelters(id, name, location)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (filters.species && filters.species !== 'all') query = query.eq('species', filters.species);
      if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.ageMin !== undefined) query = query.gte('age_months', Number(filters.ageMin));
      if (filters.ageMax !== undefined) query = query.lte('age_months', Number(filters.ageMax));
      if (filters.q) {
        const safeQuery = filters.q.replace(/[,*()\\.%_]/g, '').trim();
        if (safeQuery) {
          query = query.or(
            `name.ilike.%${safeQuery}%,breed.ilike.%${safeQuery}%,species.ilike.%${safeQuery}%`,
          );
        }
      }
      query = query.limit(filters.limit || 50);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    async getPet(id) {
      const { data, error } = await client
        .from('pets')
        .select('*, shelter:shelters(id, name, location, phone)')
        .eq('id', id)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async listAdminPets() {
      const { data, error } = await client
        .from('pets')
        .select('*, shelter:shelters(id, name, location)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    async listShelters() {
      const { data, error } = await client
        .from('shelters')
        .select('id, name, location, phone, email, description, image_url')
        .eq('is_published', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    async getShelter(id) {
      const { data, error } = await client
        .from('shelters')
        .select('id, name, location, phone, email, description, image_url')
        .eq('id', id)
        .eq('is_published', true)
        .maybeSingle();
      if (error || !data) {
        if (error) throw error;
        return null;
      }

      const { data: relatedPets, error: petsError } = await client
        .from('pets')
        .select('*, shelter:shelters(id, name, location)')
        .eq('shelter_id', id)
        .eq('is_published', true)
        .order('name');
      if (petsError) throw petsError;
      return { ...data, pets: relatedPets };
    },
    async listAdminShelters() {
      const { data, error } = await client
        .from('shelters')
        .select('id, name, location, phone, email, description, image_url, is_published')
        .order('name')
        .limit(100);
      if (error) throw error;
      return data;
    },
    async createApplication(application) {
      const { data, error } = await client
        .from('applications')
        .insert(application)
        .select('id, status, created_at')
        .single();
      if (error) throw error;
      return data;
    },
    async getClaimedApplication(id, accessTokenHash) {
      const { data, error } = await client
        .from('applications')
        .select('id, status, created_at, pet:pets(id, name, species, image_url), shelter:shelters(name)')
        .eq('id', id)
        .eq('access_token_hash', accessTokenHash)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async listApplications() {
      const { data, error } = await client
        .from('applications')
        .select('id, pet_id, shelter_id, applicant_name, email, phone, domicile, adoption_reason, pet_experience, message, consent_at, status, created_at, updated_at, pet:pets(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async updateApplication(id, changes) {
      const { data, error } = await client
        .from('applications')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, status, updated_at')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async deleteApplication(id) {
      const { data, error } = await client
        .from('applications')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async createPet(pet) {
      const { data, error } = await client.from('pets').insert(pet).select().single();
      if (error) throw error;
      return data;
    },
    async updatePet(id, changes) {
      const { data, error } = await client
        .from('pets')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async deletePet(id) {
      const { data, error } = await client.from('pets').delete().eq('id', id).select('id').maybeSingle();
      if (error) throw error;
      return data;
    },
    async createShelter(shelter) {
      const { data, error } = await client.from('shelters').insert(shelter).select().single();
      if (error) throw error;
      return data;
    },
    async updateShelter(id, changes) {
      const { data, error } = await client
        .from('shelters')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    async deleteShelter(id) {
      const { data, error } = await client.from('shelters').delete().eq('id', id).select('id').maybeSingle();
      if (error) throw error;
      return data;
    },
  };
}

function createRepository(mode = process.env.DATA_MODE) {
  if (mode === 'demo') return createDemoRepository();
  if (mode === 'supabase') return createSupabaseRepository();
  throw new Error('Set DATA_MODE explicitly to "demo" or "supabase".');
}

module.exports = { createDemoRepository, createRepository, createSupabaseRepository };
