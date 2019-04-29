import * as cn from 'classnames';
import { JSONSchema4TypeName } from 'json-schema';
import * as React from 'react';
import { ITreeNodeMeta, JSONSchema4CombinerName } from '../types';

export interface IType {
  type: JSONSchema4TypeName | JSONSchema4CombinerName | '$ref';
  subtype?: ITreeNodeMeta['subtype'];
}

export const Type: React.FunctionComponent<IType> = ({ children, type, subtype }) => {
  return (
    <span className={cn(TypeClasses[type])}>
      {type === 'array' && subtype && subtype !== 'array' ? `array[${subtype}]` : type}
      {children}
    </span>
  );
};

const TypeClasses = {
  object: 'text-blue-6',
  array: 'text-green-6',
  allOf: 'text-orange-5',
  oneOf: 'text-orange-5',
  anyOf: 'text-orange-5',
  null: 'text-orange-5',
  integer: 'text-red-7',
  number: 'text-red-7',
  boolean: 'text-red-4',
  binary: 'text-green-4',
  string: 'text-green-7',
  $ref: 'text-purple-6',
};
