const SchemaWorkerMock = jest.fn();

SchemaWorkerMock.prototype.addEventListener = jest.fn();
SchemaWorkerMock.prototype.terminate = jest.fn();
SchemaWorkerMock.prototype.postMessage = jest.fn();

module.exports.default = SchemaWorkerMock;
