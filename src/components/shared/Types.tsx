import { Dictionary, Optional } from '@stoplight/types';
import cn from 'classnames';
import * as React from 'react';

import { JSONSchema, JSONSchemaCombinerName, JSONSchemaTypeName, SchemaKind } from '../../types';

/**
 * TYPE
 */
export interface IType {
  type: JSONSchemaTypeName | JSONSchemaCombinerName | 'binary' | '$ref';
  subtype: JSONSchema['type'] | '$ref';
  className?: string;
  title: Optional<string>;
}

function shouldRenderTitle(type: string): boolean {
  return type === SchemaKind.Array || type === SchemaKind.Object || type === '$ref';
}

function getPrintableArrayType(subtype: IType['subtype'], title: IType['title']): string {
  if (!subtype) return SchemaKind.Array;

  if (Array.isArray(subtype)) {
    return `${SchemaKind.Array}[${subtype.join(',')}]`;
  }

  if (title && shouldRenderTitle(subtype)) {
    return `${title}[]`;
  }

  if (subtype !== SchemaKind.Array && subtype !== '$ref') {
    return `${SchemaKind.Array}[${subtype}]`;
  }

  return SchemaKind.Array;
}

function getPrintableType(type: IType['type'], subtype: IType['subtype'], title: IType['title']): string {
  if (type === SchemaKind.Array) {
    return getPrintableArrayType(subtype, title);
  } else if (title && shouldRenderTitle(type)) {
    return title;
  } else {
    return type;
  }
}

export const Type: React.FunctionComponent<IType> = ({ className, title, type, subtype }) => {
  return (
    <span className={cn(className, PropertyTypeColors[type], 'truncate')}>
      {getPrintableType(type, subtype, title)}
    </span>
  );
};
Type.displayName = 'JsonSchemaViewer.Type';

/**
 * TYPES
 */
interface ITypes {
  className?: string;
  type: Optional<JSONSchemaTypeName | JSONSchemaTypeName[] | JSONSchemaCombinerName | '$ref'>;
  subtype: Optional<JSONSchema['type'] | '$ref'>;
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
