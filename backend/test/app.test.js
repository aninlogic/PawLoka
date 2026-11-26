const assert = require('node:assert/strict');
const { after, test } = require('node:test');
const request = require('supertest');
const { createApp } = require('../src/appFactory');
const { createDemoRepository } = require('../src/data/repository');

const app = createApp({ repository: createDemoRepository() });
const PET_ID = '10000000-0000-4000-8000-000000000001';
const SHELTER_ID = '20000000-0000-4000-8000-000000000001';

function createTestRepository() {
  const pet = {
    id: PET_ID,
    shelter_id: SHELTER_ID,
    name: 'Milo',
    species: 'dog',
    breed: 'Mix',
    age_months: 18,
    sex: 'male',
    description: 'Ramah.',
    status: 'available',
    image_url: '',
    shelter: {
      id: SHELTER_ID,
      name: 'Paw Haven',
      location: 'Bandung',
      phone: '+62 812-3456-7890',
    },
  };
  let savedApplication;

  return {
    pet,
    getSavedApplication: () => savedApplication,
    repository: {
      listPets: async () => [pet],
      getPet: async (id) => (id === PET_ID ? pet : null),
      listShelters: async () => [],
      getShelter: async () => null,
      createApplication: async (application) => {
        savedApplication = application;
        return {
          id: '30000000-0000-4000-8000-000000000001',
          status: application.status,
          created_at: '2026-11-17T12:00:00.000Z',
        };
      },
      getClaimedApplication: async (id, tokenHash) => (
        savedApplication
        && id === '30000000-0000-4000-8000-000000000001'
        && tokenHash === savedApplication.access_token_hash
          ? {
              id,
              status: savedApplication.status,
              created_at: '2026-11-17T12:00:00.000Z',
              pet: { id: PET_ID, name: pet.name, species: pet.species, image_url: pet.image_url },
              shelter: { name: 'Paw Haven' },
            }
          : null
      ),
      createPet: async (createdPet) => createdPet,
      verifyAccessToken: async (token) => {
        if (token === 'valid-admin') return { id: 'admin-1' };
        if (token === 'valid-other') return { id: 'user-2' };
        return null;
      },
      listApplications: async () => [{ id: 'application-1', applicant_name: 'Contoh' }],
    },
  };
}

after(() => {
  delete process.env.CORS_ORIGIN;
});

test('health endpoint reports API status', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { data: { status: 'ok' } });
});

test('pet list supports search and species filters', async () => {
  const response = await request(app).get('/api/pets?species=cat&q=luna');

  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].name, 'Luna');
});

test('pet list accepts the new species identifiers and rejects unknown species', async () => {
  for (const [species, name] of [
    ['turtle', 'Kura'],
    ['fish', 'Bintang'],
    ['hedgehog', 'Pompom'],
  ]) {
    const response = await request(app).get(`/api/pets?species=${species}&q=${name}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].species, species);
  }

  const invalidResponse = await request(app).get('/api/pets?species=ferret');
  assert.equal(invalidResponse.status, 400);
  assert.equal(invalidResponse.body.error.code, 'INVALID_INPUT');
});

test('admin pet creation accepts the new species identifiers', async () => {
  const testRepository = createTestRepository();
  const testApp = createApp({ repository: testRepository.repository, adminId: 'admin-1' });

  for (const species of ['turtle', 'fish', 'hedgehog']) {
    const response = await request(testApp)
      .post('/api/admin/pets')
      .set('Authorization', 'Bearer valid-admin')
      .send({
        shelter_id: SHELTER_ID,
        name: 'Contoh',
        species,
        breed: 'Ras contoh',
        age_months: 12,
        sex: 'female',
        description: 'Data contoh untuk validasi.',
        status: 'available',
        image_url: 'https://example.test/pet.jpg',
        is_published: true,
      });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.species, species);
  }
});

test('pet detail returns the related shelter and unknown ids return 404', async () => {
  const petResponse = await request(app).get(`/api/pets/${PET_ID}`);
  const missingResponse = await request(app)
    .get('/api/pets/10000000-0000-4000-8000-000000000099');

  assert.equal(petResponse.status, 200);
  assert.equal(petResponse.body.data.shelter.name, 'Paw Haven');
  assert.equal(petResponse.body.data.shelter.phone, '');
  assert.equal(missingResponse.status, 404);
  assert.equal(missingResponse.body.error.code, 'PET_NOT_FOUND');
});

test('shelter directory and detail include linked pets', async () => {
  const directory = await request(app).get('/api/shelters');
  const detail = await request(app).get('/api/shelters/20000000-0000-4000-8000-000000000001');

  assert.equal(directory.status, 200);
  assert.equal(directory.body.data.length, 2);
  assert.equal(directory.body.data[0].pets.length, 5);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.data.name, 'Paw Haven');
  assert.equal(detail.body.data.pets[0].shelter.name, 'Paw Haven');
});

test('invalid pet filters are rejected at the API boundary', async () => {
  const response = await request(app).get('/api/pets?ageMin=24&ageMax=12');

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_INPUT');
});

test('development API errors log message and stack while redacting credentials', async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const originalConsoleError = console.error;
  const secret = 'test-service-role-secret';
  const testRepository = createTestRepository();
  const testApp = createApp({ repository: testRepository.repository });
  const loggedErrors = [];
  const requestError = new Error(`Supabase request failed: ${secret}`);
  requestError.details = `Caused by: network error (${secret}) (ENOTFOUND)\n    at request (repository.js:1:1)`;
  requestError.hint = `Check password=${secret}`;

  process.env.NODE_ENV = 'development';
  process.env.SUPABASE_SERVICE_ROLE_KEY = secret;
  testRepository.repository.listPets = async () => { throw requestError; };
  console.error = (...args) => loggedErrors.push(args);

  try {
    const response = await request(testApp).get('/api/pets?status=available');
    const loggedDetails = loggedErrors[0][1];
    const serializedLog = JSON.stringify(loggedDetails);

    assert.equal(response.status, 500);
    assert.equal(loggedDetails.errorCode, 'ENOTFOUND');
    assert.match(loggedDetails.errorMessage, /Supabase request failed/);
    assert.match(loggedDetails.errorStack, /Error: Supabase request failed/);
    assert.match(loggedDetails.errorDetails, /Caused by: network error/);
    assert.match(loggedDetails.errorHint, /Check password=\[REDACTED\]/);
    assert.match(serializedLog, /\[REDACTED\]/);
    assert.equal(serializedLog.includes(secret), false);
  } finally {
    console.error = originalConsoleError;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalServiceRoleKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
  }
});

test('application submissions reject applicant phone input and still require consent', async () => {
  const testRepository = createTestRepository();
  const testApp = createApp({ repository: testRepository.repository });
  const withApplicantPhone = await request(testApp)
    .post('/api/applications')
    .send({
      pet_id: PET_ID,
      applicant_name: 'Nadia',
      phone: '+62 812-0000-0000',
      domicile: 'Bandung',
      adoption_reason: 'Saya ingin merawat hewan.',
      pet_experience: 'Pernah merawat kucing.',
      consent: true,
    });
  const missingConsent = await request(testApp)
    .post('/api/applications')
    .send({
      pet_id: PET_ID,
      applicant_name: 'Nadia',
      domicile: 'Bandung',
      adoption_reason: 'Saya ingin merawat hewan.',
      pet_experience: 'Pernah merawat kucing.',
      consent: false,
    });

  assert.equal(withApplicantPhone.status, 400);
  assert.equal(withApplicantPhone.body.error.code, 'INVALID_INPUT');
  assert.equal(missingConsent.status, 400);
  assert.equal(missingConsent.body.error.code, 'INVALID_INPUT');
  assert.equal(testRepository.getSavedApplication(), undefined);
});

test('valid application without applicant phone stores adopter details and returns a one-time history token only', async () => {
  const testRepository = createTestRepository();
  const testApp = createApp({ repository: testRepository.repository });
  const response = await request(testApp)
    .post('/api/applications')
    .send({
      pet_id: PET_ID,
      applicant_name: 'Nadia',
      domicile: 'Bandung',
      adoption_reason: 'Saya ingin merawat hewan yang membutuhkan rumah.',
      pet_experience: 'Pernah merawat kucing di rumah.',
      message: 'Saya ingin mengenal Milo.',
      consent: true,
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.data.id, '30000000-0000-4000-8000-000000000001');
  assert.equal(response.body.data.status, 'pending');
  assert.equal(response.body.data.created_at, '2026-11-17T12:00:00.000Z');
  assert.match(response.body.data.access_token, /^[a-f0-9]{64}$/);
  assert.equal(testRepository.getSavedApplication().shelter_id, SHELTER_ID);
  assert.equal(testRepository.getSavedApplication().phone, null);
  assert.equal(testRepository.getSavedApplication().domicile, 'Bandung');
  assert.equal(testRepository.getSavedApplication().adoption_reason, 'Saya ingin merawat hewan yang membutuhkan rumah.');
  assert.equal(testRepository.getSavedApplication().pet_experience, 'Pernah merawat kucing di rumah.');
  assert.equal(testRepository.getSavedApplication().access_token_hash.length, 64);
  assert.notEqual(testRepository.getSavedApplication().access_token_hash, response.body.data.access_token);
  assert.ok(testRepository.getSavedApplication().consent_at);
  assert.equal(response.body.data.applicant_name, undefined);

  const historyResponse = await request(testApp)
    .get(`/api/applications/${response.body.data.id}`)
    .set('X-Application-Access-Token', response.body.data.access_token);
  const invalidTokenResponse = await request(testApp)
    .get(`/api/applications/${response.body.data.id}`)
    .set('X-Application-Access-Token', '0'.repeat(64));
  const publicListResponse = await request(testApp).get('/api/applications');

  assert.equal(historyResponse.status, 200);
  assert.equal(historyResponse.body.data.pet.name, 'Milo');
  assert.equal(historyResponse.body.data.shelter.name, 'Paw Haven');
  assert.equal(historyResponse.body.data.applicant_name, undefined);
  assert.equal(historyResponse.headers['cache-control'], 'no-store');
  assert.equal(invalidTokenResponse.status, 404);
  assert.equal(invalidTokenResponse.headers['cache-control'], 'no-store');
  assert.equal(publicListResponse.status, 404);
  assert.equal(publicListResponse.body.error.code, 'APPLICATION_LIST_UNAVAILABLE');
});

test('application history token header is allowed by the local CORS preflight', async () => {
  const response = await request(app)
    .options(`/api/applications/${PET_ID}`)
    .set('Origin', 'http://localhost:5173')
    .set('Access-Control-Request-Method', 'GET')
    .set('Access-Control-Request-Headers', 'x-application-access-token');

  assert.equal(response.status, 204);
  assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173');
  assert.match(response.headers['access-control-allow-headers'], /x-application-access-token/i);
});

test('the local Vite origin is allowed only outside production', async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalCorsOrigin = process.env.CORS_ORIGIN;
  const originalVercel = process.env.VERCEL;
  let developmentApp;
  let productionApp;

  try {
    process.env.CORS_ORIGIN = 'http://localhost:5173';
    process.env.NODE_ENV = 'development';
    delete process.env.VERCEL;
    developmentApp = createApp({ repository: createDemoRepository() });

    process.env.NODE_ENV = 'production';
    productionApp = createApp({ repository: createDemoRepository() });
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalCorsOrigin === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = originalCorsOrigin;
    if (originalVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = originalVercel;
  }

  const developmentResponse = await request(developmentApp)
    .post('/api/applications')
    .set('Origin', 'http://127.0.0.1:5174')
    .send({});
  const productionResponse = await request(productionApp)
    .post('/api/applications')
    .set('Origin', 'http://127.0.0.1:5174')
    .send({});

  assert.equal(developmentResponse.status, 400);
  assert.equal(developmentResponse.body.error.code, 'INVALID_INPUT');
  assert.equal(productionResponse.status, 403);
  assert.equal(productionResponse.body.error.code, 'ORIGIN_NOT_ALLOWED');
});

test('admin applications are denied without admin identity and allowed for the configured admin', async () => {
  const testRepository = createTestRepository();
  const testApp = createApp({ repository: testRepository.repository, adminId: 'admin-1' });
  const loggedOut = await request(testApp).get('/api/admin/applications');
  const otherUser = await request(testApp)
    .get('/api/admin/applications')
    .set('Authorization', 'Bearer valid-other');
  const admin = await request(testApp)
    .get('/api/admin/applications')
    .set('Authorization', 'Bearer valid-admin');

  assert.equal(loggedOut.status, 401);
  assert.equal(loggedOut.body.error.code, 'AUTH_REQUIRED');
  assert.equal(otherUser.status, 403);
  assert.equal(otherUser.body.error.code, 'ADMIN_ONLY');
  assert.equal(admin.status, 200);
  assert.equal(admin.body.data[0].applicant_name, 'Contoh');
});

test('demo mode rejects admin reads instead of pretending they are configured', async () => {
  const response = await request(app).get('/api/admin/applications');

  assert.equal(response.status, 503);
  assert.equal(response.body.error.code, 'ADMIN_NOT_CONFIGURED');
});
