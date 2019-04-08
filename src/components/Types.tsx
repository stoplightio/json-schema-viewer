import { JSONSchema4TypeName } from 'json-schema';
import * as React from 'react';
import { MutedText } from '../common/MutedText';
import { JSONSchema4CombinerName } from '../renderers/types';
import { Type } from './Type';

interface ITypes {
  type: JSONSchema4TypeName | JSONSchema4TypeName[] | JSONSchema4CombinerName;
  subtype?: JSONSchema4TypeName | JSONSchema4TypeName[];
  $ref: boolean;
}

export const Types: React.FunctionComponent<ITypes> = ({ $ref, type, subtype }) => {
  if ($ref) {
    return <Type type="$ref">{`{${$ref}}`}</Type>;
  }

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
