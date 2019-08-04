import { renderSchema } from '../utils';
import { mergeAllOf } from '../utils/mergeAllOf';
import { ComputeSchemaMessage } from './messages';

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener('message', e => {
  const msg = e.data;
  if (typeof msg !== 'object' || msg === null || !('schema' in msg) || !('instanceId' in msg)) return;

  const schema = (msg as ComputeSchemaMessage).schema;

  self.postMessage({
    instanceId: (msg as ComputeSchemaMessage).instanceId,
    nodes: Array.from(renderSchema((msg as ComputeSchemaMessage).mergeAllOf ? mergeAllOf(schema) : schema)),
  });
});
