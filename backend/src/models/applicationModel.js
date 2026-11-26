function createApplicationModel(repository) {
  return {
    getPet(id) {
      return repository.getPet(id);
    },

    canCreate() {
      return typeof repository.createApplication === 'function';
    },

    create(data) {
      return repository.createApplication(data);
    },

    canGetClaimed() {
      return typeof repository.getClaimedApplication === 'function';
    },

    getClaimed(id, tokenHash) {
      return repository.getClaimedApplication(id, tokenHash);
    },

    listAdmin() {
      return repository.listApplications();
    },

    update(id, changes) {
      return repository.updateApplication(id, changes);
    },

    remove(id) {
      return repository.deleteApplication(id);
    },
  };
}

module.exports = { createApplicationModel };