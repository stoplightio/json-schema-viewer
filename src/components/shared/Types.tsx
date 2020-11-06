import { Dictionary, Optional } from '@stoplight/types';
import cn from 'classnames';
import { JSONSchema4TypeName } from 'json-schema';
import * as React from 'react';
import { useSchemaNode } from '../../hooks/useSchemaNode';
import { RegularNode } from '../../tree/walker/nodes';
import { SchemaNodeKind } from '../../tree/walker/nodes/types';


/**
 * TYPE
 */
export interface IType {
  className?: string;
  type: JSONSchema4TypeName | JSONSchema4CombinerName | '$ref';
  subtype: Optional<JSONSchema4TypeName | JSONSchema4TypeName[]> | '$ref';
  title: string | null;
}

function shouldRenderTitle(type: string): boolean {
  return type === SchemaNodeKind.Array || type === SchemaNodeKind.Object || type === '$ref';
}

function getPrintableArrayType(subtype: IType['subtype'], title: IType['title']): string {
  if (!subtype) return SchemaNodeKind.Array;

  if (Array.isArray(subtype)) {
    return `${SchemaNodeKind.Array}[${subtype.join(',')}]`;
  }

  if (title && shouldRenderTitle(subtype)) {
    return `${title}[]`;
  }

  if (subtype !== SchemaNodeKind.Array && subtype !== '$ref') {
    return `${SchemaNodeKind.Array}[${subtype}]`;
  }

  return SchemaNodeKind.Array;
}

function getPrintableType(type: IType['type'], subtype: IType['subtype'], title: IType['title']): string {
  if (type === SchemaNodeKind.Array) {
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
}

export const Types: React.FunctionComponent<ITypes> = ({ className }) => {
  const schemaNode = useSchemaNode();
  if (!(schemaNode instanceof RegularNode) || schemaNode.type === null) return null;

  return (
    <div className={cn(className, 'truncate')}>
      <>
        {schemaNode.type.map((name, i, { length }) => (
          <React.Fragment key={i}>
            <Type type={name} subtype={subtype} title={schemaNode.title} />

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
