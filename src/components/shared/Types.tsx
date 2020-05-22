import { Dictionary, Optional } from '@stoplight/types';
import cn from 'classnames';
import { JSONSchema4TypeName } from 'json-schema';
import * as React from 'react';

import { JSONSchema4CombinerName, SchemaKind } from '../../types';

/**
 * TYPE
 */
export interface IType {
  type: JSONSchema4TypeName | JSONSchema4CombinerName | 'binary' | '$ref';
  subtype: Optional<JSONSchema4TypeName | JSONSchema4TypeName[]> | '$ref';
  className?: string;
  title: Optional<string>;
}

function shouldRenderTitle(type: string): boolean {
  return type === SchemaKind.Array || type === SchemaKind.Object || type === '$ref';
}

export const Type: React.FunctionComponent<IType> = ({ className, title, type, subtype }) => {
  const shouldRenderArraySubtype =
    type === SchemaKind.Array && subtype && subtype !== SchemaKind.Array && subtype !== '$ref';

  return (
    <span className={cn(className, PropertyTypeColors[type], 'truncate')}>
      {shouldRenderArraySubtype
        ? `array[${(!Array.isArray(subtype) && shouldRenderTitle(subtype!) && title) || subtype}]`
        : `${type}${shouldRenderTitle(type) && title ? `[${title}]` : ''}`}
    </span>
  );
};
Type.displayName = 'JsonSchemaViewer.Type';

/**
 * TYPES
 */
interface ITypes {
  className?: string;
  type: Optional<JSONSchema4TypeName | JSONSchema4TypeName[] | JSONSchema4CombinerName | '$ref'>;
  subtype: Optional<JSONSchema4TypeName | JSONSchema4TypeName[] | '$ref'>;
  title: Optional<string>;
}

export const Types: React.FunctionComponent<ITypes> = ({ className, title, type, subtype }) => {
  if (type === void 0) return null;

  if (!Array.isArray(type)) {
    return <Type className={className} type={type} subtype={subtype} title={title} />;
  }

  return (
    <div className={cn(className, 'truncate')}>
      <>
        {type.map((name, i, { length }) => (
          <React.Fragment key={i}>
            <Type key={i} type={name} subtype={subtype} title={title} />

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
  object: 'text-blue-6 dark:text-blue-4',
  any: 'text-blue-5',
  array: 'text-green-6 dark:text-green-4',
  allOf: 'text-orange-5',
  anyOf: 'text-orange-5',
  oneOf: 'text-orange-5',
  null: 'text-orange-5',
  integer: 'text-red-7 dark:text-red-6',
  number: 'text-red-7 dark:text-red-6',
  boolean: 'text-red-4',
  binary: 'text-green-4',
  string: 'text-green-7 dark:text-green-5',
  $ref: 'text-purple-6 dark:text-purple-4',
};
