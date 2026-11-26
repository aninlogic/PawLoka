function createShelterModel(repository) {
  return {
    list() {
      return repository.listShelters();
    },

    getById(id) {
      return repository.getShelter(id);
    },

    listAdmin() {
      return repository.listAdminShelters();
    },

    create(data) {
      return repository.createShelter(data);
    },

    update(id, data) {
      return repository.updateShelter(id, data);
    },

    remove(id) {
      return repository.deleteShelter(id);
    },
  };
}

module.exports = { createShelterModel };