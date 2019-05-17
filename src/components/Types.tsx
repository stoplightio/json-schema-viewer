import { JSONSchema4TypeName } from 'json-schema';
import * as React from 'react';
import { ITreeNodeMeta, JSONSchema4CombinerName } from '../types';
import { MutedText } from './common/MutedText';
import { Type } from './Type';

interface ITypes {
  type?: JSONSchema4TypeName | JSONSchema4TypeName[] | JSONSchema4CombinerName;
  subtype?: ITreeNodeMeta['subtype'];
}

export const Types: React.FunctionComponent<ITypes> = ({ type, subtype }) => {
  if (!type) return null;

  if (!Array.isArray(type)) {
    return <Type type={type} subtype={subtype} />;
  }

  return (
    <div>
      {type.map((name, i, { length }) => (
        <>
          <Type type={name} subtype={subtype} />
          {i < length - 1 && (
            <MutedText as="span" key={`${i}-sep`}>
              {' or '}
            </MutedText>
          )}
        </>
      ))}
    </div>
  );
};
