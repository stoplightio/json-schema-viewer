import { Button, Checkbox as UIKitCheckbox, Colors, Icon, Tooltip } from '@stoplight/ui-kit';
import * as React from 'react';
import { Dispatch, SetStateAction, useState } from 'react';

const ICON_SIZE = 12;

interface IMaskGenericControls {
  node: { level: number; metadata: { path: string[] } };
  maskControlsHandler?: (attrs: Array<{ path: string; required: boolean }>) => string[];
  setSelectedProps: Dispatch<SetStateAction<Array<{ path: string; required: number }>>>;
}

interface IMaskControls extends IMaskGenericControls {
  selectedProps: Array<{ path: string; required: boolean }>;
}
interface ICheckbox extends IMaskGenericControls {
  isChecked: boolean;
}

interface IRequired extends IMaskGenericControls {
  idx: number;
  setIdx: Dispatch<SetStateAction<number>>;
}

function addAttr(old: Array<{ path: string; required: number }>, path: string, required: number) {
  const attr = old.find(oldAttr => oldAttr.path === path);

  return attr
    ? old.map(oldAttr => {
        return oldAttr.path === path ? Object.assign({}, oldAttr, { required }) : oldAttr;
      })
    : old.concat(Object.assign({}, { path }, { required }));
}

function updateSelectedAttrs(
  isChecked: boolean,
  oldAttrs: Array<{ path: string; required: number }>,
  path: string,
  idx: number,
): Array<{ path: string; required: number }> {
  return isChecked ? addAttr(oldAttrs, path, idx) : oldAttrs.filter(oldAttr => oldAttr.path !== path);
}

const toRequiredNumForm = (node: { required?: boolean } = {}) => {
  if (node.required === true) {
    return 1;
  } else if (node.required === false) {
    return 2;
  } else {
    return 0;
  }
};

function toMaskAttrsWitReqAsBool(maskAttrs: Array<{ path: string; required: number }>, nodePath: string) {
  return maskAttrs.map(maskAttr => {
    const { path, required } = maskAttr;

    const requiredState = {
      0: {},
      1: { required: true },
      2: { required: false },
    }[required || 0];

    return nodePath === path ? Object.assign({}, { path }, requiredState) : maskAttr;
  });
}

const toNodePath = (node: { metadata: { path: string[] } }) => node.metadata.path.join('/');

function updateMaskAttrs(
  setSelectedProps: Dispatch<SetStateAction<Array<{ path: string; required: number }>>>,
  isChecked: boolean,
  node: { metadata: { path: string[] } },
  idx: number,
  maskControlsHandler?: (attrs: Array<{ path: string; required: boolean }>) => string[],
) {
  setSelectedProps(oldProps => {
    const nodePath = toNodePath(node);

    const maskAttrs = updateSelectedAttrs(isChecked, oldProps, nodePath, idx);
    const maskAttrsWithBools = toMaskAttrsWitReqAsBool(maskAttrs, nodePath);

    if (maskControlsHandler) {
      maskControlsHandler(maskAttrsWithBools);
    }

    return maskAttrsWithBools;
  });
}

const Required = ({ idx, setIdx, setSelectedProps, maskControlsHandler, node }: IRequired) => {
  return (
    <Tooltip boundary="window" position="top">
      <Button
        style={{ paddingRight: '1em' }}
        small
        minimal
        title={['No Change', 'Required', 'Not Required'][idx]}
        icon={<Icon color={[Colors.GRAY1, Colors.RED3, Colors.GREEN2][idx]} iconSize={ICON_SIZE} icon="issue" />}
        onClick={(evt: { stopPropagation: () => void }) => {
          evt.stopPropagation();

          setIdx((prev: number) => {
            return prev >= 2 ? 0 : prev + 1;
          });

          updateMaskAttrs(setSelectedProps, true, node, idx + 1, maskControlsHandler);
        }}
      />
    </Tooltip>
  );
};

const Checkbox = ({ isChecked, setSelectedProps, maskControlsHandler, node }: ICheckbox) => {
  return (
    <UIKitCheckbox
      className="m-0"
      style={{ alignSelf: 'center' }}
      checked={isChecked}
      onChange={(evt: any) => {
        evt.persist();

        updateMaskAttrs(setSelectedProps, evt.target.checked, node, 0, maskControlsHandler);
      }}
    />
  );
};

const MaskControls = ({ node, maskControlsHandler, setSelectedProps, selectedProps }: IMaskControls) => {
  const theNode = selectedProps.find(({ path }: { path: string }) => path === toNodePath(node));
  const isChecked = !!theNode;
  const [idx, setIdx] = useState(toRequiredNumForm(theNode));

  return (
    <div className="flex">
      {node.level && maskControlsHandler ? (
        <>
          <Checkbox
            isChecked={isChecked}
            setSelectedProps={setSelectedProps}
            maskControlsHandler={maskControlsHandler}
            node={node}
          />
          <Required
            idx={idx}
            setIdx={setIdx}
            setSelectedProps={setSelectedProps}
            maskControlsHandler={maskControlsHandler}
            node={node}
          />
        </>
      ) : null}
    </div>
  );
};

export default MaskControls;
