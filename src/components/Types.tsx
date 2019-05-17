import { Dictionary } from '@stoplight/types';
import cn from 'classnames';
import { JSONSchema4TypeName } from 'json-schema';
import * as React from 'react';

import { ITreeNodeMeta, JSONSchema4CombinerName } from '../types';

/**
 * TYPE
 */
export interface IType {
  type: JSONSchema4TypeName | JSONSchema4CombinerName | 'binary' | '$ref';
  subtype?: ITreeNodeMeta['subtype'];
  className?: string;
}

export const Type: React.FunctionComponent<IType> = ({ className, children, type, subtype }) => {
  return (
    <span className={cn(className, PropertyTypeColors[type])}>
      {type === 'array' && subtype && subtype !== 'array' ? `array[${subtype}]` : type}

      {children}
    </span>
  );
};
Type.displayName = 'JsonSchemaViewer.Type';

/**
 * TYPES
 */
interface ITypes {
  className?: string;
  type?: JSONSchema4TypeName | JSONSchema4TypeName[] | JSONSchema4CombinerName | '$ref';
  subtype?: ITreeNodeMeta['subtype'];
}

export const Types: React.FunctionComponent<ITypes> = ({ className, type, subtype, children }) => {
  if (!type) return null;

  if (!Array.isArray(type)) {
    return <Type className={className} type={type} subtype={subtype} children={children} />;
  }

  return (
    <div className={cn(className, 'overflow-hidden')}>
      <>
        {type.map((name, i, { length }) => (
          <React.Fragment key={i}>
            <Type key={i} type={name} subtype={subtype} />

            {i < length - 1 && (
              <span key={`${i}-sep`} className="text-darken-7 dark:text-lighten-6">
                {' or '}
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    </div>
  );
};
Types.displayName = 'JsonSchemaViewer.Types';

/**
 * HELPERS
 */
export const PropertyTypeColors: Dictionary<string, IType['type']> = {
  object: 'text-blue-6',
  any: 'text-blue-5',
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
