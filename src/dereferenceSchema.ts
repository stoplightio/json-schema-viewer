import cloneDeep = require('lodash/cloneDeep');
import get = require('lodash/get');
import isArray = require('lodash/isArray');
import isEmpty = require('lodash/isEmpty');
import map = require('lodash/map');
import mapValues = require('lodash/mapValues');
import { IResolvedProp } from './types';

const _dereferenceSchema = (options: any = {}) => {
  const {
    target = {},
    schemas = {},
    previousRefs = [],
    refCache = {},
    allOfParent,
    combinerParent,
    hideInheritedFrom,
    isRoot,
  } = options;

  let schema = target;
  let properties;
  let isCombiner;
  let isAllOf;

  if (isEmpty(schemas)) {
    return schema;
  }

  if (get(schema, '$ref')) {
    schema = _dereferenceSchemaRef({
      target: schema,
      schemas,
      ref: target.$ref,
      previousRefs,
      refCache,
      allOfParent,
      combinerParent,
      hideInheritedFrom,
      isRoot,
    });
  } else if (get(schema, 'properties')) {
    properties = schema.properties;
  } else if (get(schema, 'items')) {
    if (schema.items.$ref) {
      schema.items = _dereferenceSchemaRef({
        target: schema.items,
        schemas,
        ref: schema.items.$ref,
        previousRefs,
        refCache,
        allOfParent,
        combinerParent,
        hideInheritedFrom,
      });
    } else if (schema.items.properties) {
      properties = schema.items.properties;
    } else if (schema.items.allOf) {
      properties = schema.items.allOf;
      isCombiner = true;
    } else if (schema.items.oneOf) {
      properties = schema.items.oneOf;
      isCombiner = true;
    } else if (schema.items.anyOf) {
      properties = schema.items.anyOf;
      isCombiner = true;
    }
  } else if (get(schema, 'allOf')) {
    properties = schema.allOf;
    isCombiner = true;
    isAllOf = true;
  } else if (get(schema, 'oneOf')) {
    properties = schema.oneOf;
    isCombiner = true;
  } else if (get(schema, 'anyOf')) {
    properties = schema.anyOf;
    isCombiner = true;
  } else if (get(schema, 'additionalProperties')) {
    properties = schema.additionalProperties;
  } else if (get(schema, 'patternProperties')) {
    properties = schema.patternProperties;
  } else if (get(schema, 'dependencies')) {
    properties = schema.dependencies;
  }

  if (properties) {
    for (const k in properties) {
      if (properties.hasOwnProperty(k)) {
        properties[k] = _dereferenceSchema({
          target: properties[k],
          schemas,
          previousRefs,
          refCache,
          allOfParent: isAllOf,
          combinerParent: isCombiner,
          hideInheritedFrom,
          isRoot: isRoot && isAllOf,
        });
      }
    }
  }

  return schema;
};

const _dereferenceSchemaRef = (options: any = {}) => {
  const {
    target,
    schemas,
    ref,
    previousRefs = [],
    refCache = {},
    allOfParent,
    combinerParent,
    hideInheritedFrom,
    isRoot,
  } = options;

  if (refCache[ref]) {
    return refCache[ref].resolved;
  }

  if (previousRefs.indexOf(ref) !== -1) {
    const resolved: IResolvedProp = {
      type: '@circular',
    };

    if (!hideInheritedFrom) {
      resolved.__inheritedFrom = { name: ref, ref };
    }

    return resolved;
  }

  const newRefs = previousRefs.concat(ref);

  // defensive clone to protect against mutations :(
  const refPath = ref.replace('#/', '').split('/');
  const schema = cloneDeep(get(schemas, refPath.concat('schema')) || get(schemas, refPath));

  if (schema) {
    let propsInherited: boolean | string = false;
    let isAllOf = allOfParent;

    if (schema.properties) {
      if (combinerParent) {
        propsInherited = 'properties';
      } else if (!hideInheritedFrom) {
        schema.__inheritedFrom = { name: ref, ref };
      }
    } else if (schema.items) {
      if (combinerParent) {
        propsInherited = 'items';
      } else if (!hideInheritedFrom) {
        schema.__inheritedFrom = { name: ref, ref };
      }
    } else if (schema.allOf) {
      propsInherited = 'allOf';
      isAllOf = true;
    } else if (schema.oneOf) {
      propsInherited = 'oneOf';
      isAllOf = false;
    } else if (schema.anyOf) {
      propsInherited = 'anyOf';
      isAllOf = false;
    }

    if (propsInherited) {
      const iterFunc = isArray(schema[propsInherited]) ? map : mapValues;

      // @ts-ignore
      schema[propsInherited] = iterFunc(schema[propsInherited], item => {
        if (item.properties) {
          item.properties = mapValues(item.properties, val => {
            return {
              ...val,
              // Don't show hideInheritedFrom for combiners anymore.
              ...(!isAllOf && !hideInheritedFrom && { ____inheritedFrom: { name: ref, ref } }),
            };
          });

          return item;
        }

        const obj = { ...item };

        // Don't show hideInheritedFrom for combiners anymore.
        if (!isAllOf && !hideInheritedFrom) {
          obj.__inheritedFrom = { name: ref, ref };
        }

        return obj;
      });
    }

    const resolved = _dereferenceSchema({
      target: schema,
      schemas,
      previousRefs: newRefs,
      refCache,
      hideInheritedFrom,
    });

    if (!isRoot && !hideInheritedFrom) {
      resolved.__inheritedFrom = { name: ref, ref };
    }

    refCache[ref] = {
      depth: previousRefs.length,
      resolved,
    };

    return resolved;
  }

  refCache[ref] = {
    depth: previousRefs.length,
    target,
  };

  return target;
};

/**
 * Replace all $ref's with their respective JSON Schema objects
 * @param  {Object} target             - Schema to dereference
 * @param  {Object} schemas            - Schemas that the target may reference. For example a Swagger or {definitions: {}}. This function will use get and .split('/') to find the reference path. #/responses/foo will be in {responses: {foo: {}}}
 * @param  {Boolean} hideInheritedFrom - Don't add the __inheritedFrom property to the dereferenced schema
 * @return {Object}                    - An object with no $refs
 */
export const dereferenceSchema = (target: object, schemas: object, hideInheritedFrom: boolean) => {
  if (!target) {
    return {};
  }

  const schema = cloneDeep(target);

  return _dereferenceSchema({ target: schema, schemas, hideInheritedFrom, isRoot: true });
};
