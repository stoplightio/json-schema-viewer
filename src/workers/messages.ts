import { TreeListParentNode } from '@stoplight/tree-list';
import { JSONSchema4 } from 'json-schema';
import { MetadataStore } from '../tree/metadata';

interface WorkerMessageEvent<T> extends Omit<MessageEvent, 'data'> {
  data: T;
}

export type ComputeSchemaMessageData = {
  instanceId: string;
  schema: JSONSchema4;
  mergeAllOf: boolean;
};

export type RenderedSchemaMessageData = RenderedSchemaSuccessMessageData | RenderedSchemaErrorMessageData;

export type RenderedSchemaSuccessMessageData = {
  instanceId: string;
  error: null;
  tree: TreeListParentNode;
  metadata: typeof MetadataStore;
};

export type RenderedSchemaErrorMessageData = {
  instanceId: string;
  error: string;
  tree: null;
  metadata: null;
};

export const isRenderedSchemaMessage = (
  message: MessageEvent,
): message is WorkerMessageEvent<RenderedSchemaMessageData> =>
  message.data && 'instanceId' in message.data && 'nodes' in message.data;

export const isComputeSchemaMessage = (
  message: MessageEvent,
): message is WorkerMessageEvent<ComputeSchemaMessageData> =>
  message.data && 'instanceId' in message.data && 'schema' in message.data;
