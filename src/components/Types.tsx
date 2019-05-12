import cn from 'classnames';
import { JSONSchema4TypeName } from 'json-schema';
import * as React from 'react';
import { ITreeNodeMeta, JSONSchema4CombinerName } from '../types';
import { Type } from './Type';

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
    <div className={cn(className, 'truncate')}>
      <>
        {type.map((name, i, { length }) => (
          <React.Fragment key={i}>
            <Type key={i} type={name} subtype={subtype} />

            {i < length - 1 && (
              <span key={`${i}-sep`} className="text-darken-7">
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
