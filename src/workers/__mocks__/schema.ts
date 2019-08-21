const SchemaWorker = jest.fn();

SchemaWorker.prototype.addEventListener = jest.fn();
SchemaWorker.prototype.terminate = jest.fn();
SchemaWorker.prototype.postMessage = jest.fn();

module.exports.default = SchemaWorker;
