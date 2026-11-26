function createPetModel(repository) {
  return {
    list(filters) {
      return repository.listPets(filters);
    },

    getById(id) {
      return repository.getPet(id);
    },

    listAdmin() {
      return repository.listAdminPets({ limit: 100 });
    },

    create(data) {
      return repository.createPet(data);
    },

    update(id, data) {
      return repository.updatePet(id, data);
    },

    remove(id) {
      return repository.deletePet(id);
    },
  };
}

module.exports = { createPetModel };