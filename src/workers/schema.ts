import { populateTree } from '../tree/populateTree';
import { MetadataStore } from '../tree/metadata';
import { mergeAllOf } from '../utils/mergeAllOf';
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
      tree: populateTree(shouldMergeAllOf ? mergeAllOf(schema) : schema, null, 0, [], null),
      metadata: MetadataStore,
    } as RenderedSchemaSuccessMessageData);
  } catch (ex) {
    self.postMessage({
      instanceId,
      error: ex.message,
      tree: null,
      metadata: null,
    } as RenderedSchemaErrorMessageData);
  }
});
