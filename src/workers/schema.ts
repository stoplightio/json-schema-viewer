import { renderSchema } from '../utils';
import { ComputeSchemaMessage } from './messages';

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener('message', e => {
  const msg = e.data;
  if (typeof msg !== 'object' || msg === null || !('schema' in msg) || !('instanceId' in msg)) return;

  self.postMessage({
    instanceId: (msg as ComputeSchemaMessage).instanceId,
    nodes: Array.from(renderSchema((msg as ComputeSchemaMessage).schema, 0)),
  });
});
