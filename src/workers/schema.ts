import { mergeAllOf } from '../utils/mergeAllOf';
import { renderSchema } from '../utils/renderSchema';
import { isComputeSchemaMessage, RenderedSchemaErrorMessageData, RenderedSchemaSuccessMessageData } from './messages';

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener('message', e => {
  if (!isComputeSchemaMessage(e)) return;
  const {
    data: { instanceId, schema, mergeAllOf: shouldMergeAllOf },
  } = e;

  try {
    self.postMessage({
      instanceId,
      error: null,
      nodes: Array.from(renderSchema(shouldMergeAllOf ? mergeAllOf(schema) : schema)),
    } as RenderedSchemaSuccessMessageData);
  } catch (ex) {
    self.postMessage({
      instanceId,
      error: ex.message,
      nodes: null,
    } as RenderedSchemaErrorMessageData);
  }
});
