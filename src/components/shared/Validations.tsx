import { safeStringify } from '@stoplight/json';
import { Dictionary } from '@stoplight/types';
import { Popover } from '@stoplight/ui-kit';
import cn from 'classnames';
import * as React from 'react';

export interface IValidations {
  required: boolean;
  validations: (Dictionary<unknown> | {}) & { deprecated?: boolean };
}

export const Validations: React.FunctionComponent<IValidations> = ({
  required,
  validations: { deprecated, ...validations },
}) => {
  const validationCount = Object.keys(validations).length;

  const requiredElem = (
    <div className={cn('ml-2', required ? 'font-medium' : 'text-darken-7 dark:text-lighten-6')}>
      {required ? 'required' : 'optional'}
      {validationCount ? `+${validationCount}` : ''}
    </div>
  );

  return (
    <>
      {deprecated ? <span className="ml-2 text-orange-7 dark:text-orange-6">deprecated</span> : null}
      {validationCount ? (
        <Popover
          boundary="window"
          interactionKind="hover"
          content={
            <div className="p-5" style={{ maxHeight: 500, maxWidth: 400 }}>
              {Object.keys(validations).map((key, index) => {
                const validation = validations[key];

                let elem = null;
                if (Array.isArray(validation)) {
                  elem = validation.map((v, i) => (
                    <div key={i} className="mt-1 mr-1 flex items-center">
                      <div className="px-1 bg-gray-2 dark:bg-gray-8 font-bold text-sm rounded">{String(v)}</div>
                      {i < validation.length - 1 ? <div>,</div> : null}
                    </div>
                  ));
                } else if (typeof validation === 'object') {
                  elem = (
                    <div className="m-1 px-1 bg-gray-2 dark:bg-gray-8 font-bold text-sm rounded" key={index}>
                      {'{...}'}
                    </div>
                  );
                } else {
                  elem = (
                    <div className="m-1 px-1 bg-gray-2 dark:bg-gray-8 font-bold text-sm rounded" key={index}>
                      {safeStringify(validation)}
                    </div>
                  );
                }

                return (
                  <div key={index} className="py-1 flex items-baseline">
                    <div className="font-medium pr-2">{key}:</div>
                    <div className="flex-1 flex flex-wrap justify-end">{elem}</div>
                  </div>
                );
              })}
            </div>
          }
          target={requiredElem}
        />
      ) : (
        requiredElem
      )}
    </>
  );
};
