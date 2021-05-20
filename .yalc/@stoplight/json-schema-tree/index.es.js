import { observable, makeObservable, reaction, action, computed, runInAction } from 'mobx';
import { isLocalRef, pathToPointer, stringify, extractSourceFromRef, extractPointerFromRef, resolveInlineRef } from '@stoplight/json';
import { EventEmitter } from '@stoplight/lifecycle';
import createMagicError from 'magic-error';

class SchemaDialect {
}

function pick(target, keys) {
    const source = {};
    for (const key of keys) {
        if (key in target) {
            source[key] = target[key];
        }
    }
    return source;
}

const ANNOTATIONS = ['description', 'default'];
function getAnnotations(fragment) {
    return pick(fragment, ANNOTATIONS);
}

function isObject(maybeObj) {
    return maybeObj !== void 0 && maybeObj !== null && typeof maybeObj === 'object';
}
function isPrimitive(maybePrimitive) {
    return typeof maybePrimitive !== 'function' && !isObject(maybePrimitive);
}
function isObjectLiteral(maybeObj) {
    if (isPrimitive(maybeObj) === true)
        return false;
    const proto = Object.getPrototypeOf(maybeObj);
    return proto === null || proto === Object.prototype;
}
function isNonNullable(maybeNullable) {
    return maybeNullable !== void 0 && maybeNullable !== null;
}

const isNumber = (value) => typeof value === 'number';
const isString = (value) => typeof value === 'string';
const isBoolean = (value) => typeof value === 'boolean';

const COMMON_VALIDATION_TYPES = [
    {
        key: 'readOnly',
        value: isBoolean,
    },
    {
        key: 'writeOnly',
        value: isBoolean,
    },
];
const VALIDATION_TYPES = {
    string: [
        {
            key: 'minLength',
            value: isNumber,
        },
        {
            key: 'maxLength',
            value: isNumber,
        },
        {
            key: 'pattern',
            value: isString,
        },
    ],
    number: [
        {
            key: 'multipleOf',
            value: isNumber,
        },
        {
            key: 'minimum',
            value: isNumber,
        },
        {
            key: 'maximum',
            value: isNumber,
        },
    ],
    get integer() {
        return this.number;
    },
    object: [
        {
            key: 'additionalProperties',
            value: (value) => isObjectLiteral(value) || isBoolean(value),
        },
        { key: 'minProperties', value: isNumber },
        { key: 'maxProperties', value: isNumber },
        {
            key: 'required',
            value: (value) => Array.isArray(value) && value.every(isString),
        },
    ],
    array: [
        {
            key: 'additionalItems',
            value: (value) => isObjectLiteral(value) || isBoolean(value),
        },
        { key: 'minItems', value: isNumber },
        { key: 'maxItems', value: isNumber },
        { key: 'uniqueItems', value: isBoolean },
    ],
};
function getTypeValidations(types) {
    const extraValidations = [];
    for (const type of types) {
        const value = VALIDATION_TYPES[type];
        if (value !== void 0) {
            extraValidations.push(...value);
        }
    }
    return extraValidations;
}
function getValidations(fragment, types) {
    const availableValidations = [...COMMON_VALIDATION_TYPES, ...(types === null ? [] : getTypeValidations(types))];
    const values = {};
    for (const { key, value } of availableValidations) {
        if (key in fragment && value(fragment[key])) {
            values[key] = fragment[key];
        }
    }
    return values;
}

class SharedSchemaDialect extends SchemaDialect {
    constructor() {
        super(...arguments);
        this.id = 'shared';
    }
    getCombiners(_fragment) {
        return new Set();
    }
    getAnnotations(fragment) {
        return observable.object(getAnnotations(fragment));
    }
    getValidations(fragment, types) {
        return observable(getValidations(fragment, types));
    }
}

function getAnnotations$1(fragment) {
    return {
        ...(Array.isArray(fragment.examples) ? { examples: fragment.examples } : null),
        ...(fragment.deprecated === true ? { deprecated: fragment.deprecated } : null),
    };
}

var SchemaNodeKind;
(function (SchemaNodeKind) {
    SchemaNodeKind["Any"] = "any";
    SchemaNodeKind["String"] = "string";
    SchemaNodeKind["Number"] = "number";
    SchemaNodeKind["Integer"] = "integer";
    SchemaNodeKind["Boolean"] = "boolean";
    SchemaNodeKind["Null"] = "null";
    SchemaNodeKind["Array"] = "array";
    SchemaNodeKind["Object"] = "object";
})(SchemaNodeKind || (SchemaNodeKind = {}));
var SchemaCombinerName;
(function (SchemaCombinerName) {
    SchemaCombinerName["AllOf"] = "allOf";
    SchemaCombinerName["AnyOf"] = "anyOf";
    SchemaCombinerName["OneOf"] = "oneOf";
})(SchemaCombinerName || (SchemaCombinerName = {}));

function getCombiners(fragment) {
    const combiners = [];
    if (SchemaCombinerName.AnyOf in fragment) {
        combiners.push(SchemaCombinerName.AnyOf);
    }
    if (SchemaCombinerName.OneOf in fragment) {
        combiners.push(SchemaCombinerName.OneOf);
    }
    if (SchemaCombinerName.AllOf in fragment) {
        combiners.push(SchemaCombinerName.AllOf);
    }
    return combiners;
}

function getTypeValidations$1(validations, types) {
    const matchedValidations = [];
    for (const type of types) {
        const value = validations[type];
        if (value !== void 0) {
            matchedValidations.push(...value);
        }
    }
    return matchedValidations;
}
function getMatchingValidations(fragment, validations, types) {
    const availableValidations = getTypeValidations$1(validations, types);
    const values = {};
    for (const { key, value } of availableValidations) {
        if (key in fragment && value(fragment[key])) {
            values[key] = fragment[key];
        }
    }
    return values;
}

const VALIDATION_TYPES$1 = {
    number: [
        {
            key: 'exclusiveMaximum',
            value: isNumber,
        },
        {
            key: 'exclusiveMinimum',
            value: isNumber,
        },
    ],
    get integer() {
        return this.number;
    },
};
function getValidations$1(schema, types) {
    return getMatchingValidations(schema, VALIDATION_TYPES$1, types);
}

class JSONSchemaDraft7Dialect extends SharedSchemaDialect {
    getCombiners(fragment) {
        return observable.set(getCombiners(fragment));
    }
    getAnnotations(fragment) {
        return observable.object({
            ...super.getAnnotations(fragment),
            ...getAnnotations$1(fragment),
        });
    }
    getValidations(fragment, types) {
        return observable({
            ...super.getValidations(fragment, types),
            ...getValidations$1(fragment, types),
        });
    }
}

function getAnnotations$2(fragment) {
    return {
        ...('x-example' in fragment ? fragment['x-example'] : null),
        ...(fragment['x-deprecated'] === true ? { deprecated: true } : null),
    };
}

function getCombiners$1(fragment) {
    const combiners = [];
    if (SchemaCombinerName.AllOf in fragment) {
        combiners.push(SchemaCombinerName.AllOf);
    }
    return observable.set(combiners);
}

const VALIDATION_TYPES$2 = {
    number: [
        {
            key: 'exclusiveMaximum',
            value: isNumber,
        },
        {
            key: 'exclusiveMinimum',
            value: isNumber,
        },
    ],
    get integer() {
        return this.number;
    },
};
function getValidations$2(schema, types) {
    return observable.object(getMatchingValidations(schema, VALIDATION_TYPES$2, types));
}

class OAS2SchemaObjectDialect extends SharedSchemaDialect {
    getCombiners(fragment) {
        return observable.set(getCombiners$1(fragment));
    }
    getAnnotations(fragment) {
        return observable.object({
            ...super.getAnnotations(fragment),
            ...getAnnotations$2(fragment),
        });
    }
    getValidations(fragment, types) {
        return observable({
            ...super.getValidations(fragment, types),
            ...getValidations$2(fragment, types),
        });
    }
}

class BaseNode {
    constructor(fragment) {
        this.fragment = fragment;
        this.parent = null;
        this.id = `json-schema-tree-id-${Math.random().toString(36).slice(2)}`;
        this.subpath = [];
        makeObservable(this, {
            subpath: observable.shallow,
        });
    }
    get path() {
        return this.parent === null ? this.subpath : [...this.parent.path, ...this.subpath];
    }
    get depth() {
        return this.parent === null ? 0 : this.parent.depth + 1;
    }
}

class MirroredReferenceNode extends BaseNode {
    constructor(mirroredNode) {
        super(mirroredNode.fragment);
        this.mirroredNode = mirroredNode;
    }
    toJSON() {
        return this.mirroredNode.fragment;
    }
    get error() {
        return this.mirroredNode.error;
    }
    get value() {
        return this.mirroredNode.value;
    }
    get external() {
        return this.mirroredNode.external;
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

class MirroredRegularNode extends BaseNode {
    constructor(mirroredNode) {
        super(mirroredNode.fragment);
        this.mirroredNode = mirroredNode;
        this.cache = new WeakMap();
        this._this = new Proxy(this, {
            get(target, key) {
                if (key in target) {
                    return target[key];
                }
                if (key in mirroredNode) {
                    return Reflect.get(mirroredNode, key, mirroredNode);
                }
                return;
            },
            has(target, key) {
                return key in target || key in mirroredNode;
            },
        });
        return this._this;
    }
    toJSON() {
        return {
            $ref: this.mirroredNode.$id,
        };
    }
    get children() {
        const referencedChildren = this.mirroredNode.children;
        if (!isNonNullable(referencedChildren)) {
            return referencedChildren;
        }
        if (!this._reaction) {
            console.log('setting up reaction', referencedChildren);
            this._reaction = reaction(() => referencedChildren, action(() => {
                console.log('foo!');
            }));
        }
        if (this._children === void 0) {
            this._children = [];
        }
        else {
            this._children.length = 0;
        }
        const children = this._children;
        for (const child of referencedChildren) {
            const cached = this.cache.get(child);
            if (cached !== void 0) {
                children.push(cached);
                continue;
            }
            const mirroredChild = isRegularNode(child) ? new MirroredRegularNode(child) : new MirroredReferenceNode(child);
            mirroredChild.parent = this._this;
            mirroredChild.subpath = child.subpath;
            this.cache.set(child, mirroredChild);
            children.push(mirroredChild);
        }
        return children;
    }
}
__decorate([
    observable.shallow,
    __metadata("design:type", Array)
], MirroredRegularNode.prototype, "_children", void 0);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], MirroredRegularNode.prototype, "children", null);

function unwrapStringOrNull(value) {
    return typeof value === 'string' ? value : null;
}
function unwrapArrayOrNull(value) {
    return Array.isArray(value) ? value : [];
}

class ReferenceNode extends BaseNode {
    constructor(fragment, error) {
        super(fragment);
        this.error = error;
        this.value = unwrapStringOrNull(fragment.$ref);
    }
    toJSON() {
        return this.fragment;
    }
    get external() {
        return this.value !== null && !isLocalRef(this.value);
    }
    static [Symbol.hasInstance](instance) {
        return isSchemaNode(instance) && isReferenceNode(instance);
    }
}

function getPrimaryType(fragment, types) {
    if (types.size > 0) {
        if (types.has(SchemaNodeKind.Object)) {
            return SchemaNodeKind.Object;
        }
        if (types.has(SchemaNodeKind.Array)) {
            return SchemaNodeKind.Array;
        }
        return types.values().next().value;
    }
    return null;
}

const VALID_TYPES = Object.values(SchemaNodeKind);
const isValidType = (maybeType) => typeof maybeType === 'string' && VALID_TYPES.includes(maybeType);

function inferType(fragment) {
    if ('properties' in fragment || 'additionalProperties' in fragment || 'patternProperties' in fragment) {
        return SchemaNodeKind.Object;
    }
    if ('items' in fragment || 'additionalItems' in fragment) {
        return SchemaNodeKind.Array;
    }
    return null;
}

function getTypes(fragment) {
    if ('type' in fragment) {
        if (Array.isArray(fragment.type)) {
            return observable.set(fragment.type.filter(isValidType));
        }
        else if (isValidType(fragment.type)) {
            return observable.set([fragment.type]);
        }
    }
    const inferredType = inferType(fragment);
    if (inferredType !== null) {
        return observable.set([inferredType]);
    }
    return observable.set([]);
}

class RegularNode extends BaseNode {
    constructor(fragment, dialect) {
        var _a;
        super(fragment);
        this.fragment = fragment;
        this.dialect = dialect;
        this.$id = (_a = unwrapStringOrNull(fragment.$id)) !== null && _a !== void 0 ? _a : this.id;
        this.types = getTypes(fragment);
        this.combiners = dialect.getCombiners(fragment);
        this.enum = observable.set('const' in fragment ? [fragment.const] : unwrapArrayOrNull(fragment.enum));
        this.format = unwrapStringOrNull(fragment.format);
        this.title = unwrapStringOrNull(fragment.title);
        this.annotations = dialect.getAnnotations(fragment);
        this.children = void 0;
        makeObservable(this, {
            format: observable,
            title: observable,
        });
    }
    toJSON() {
        var _a;
        const children = (_a = this.children) === null || _a === void 0 ? void 0 : _a.reduce((children, node) => {
            const [entry, key] = node.subpath;
            if (node.subpath.length === 1) {
                children[entry] = node.toJSON();
                return children;
            }
            else if (!(entry in children)) {
                children[entry] = {};
            }
            children[entry][key] = node.toJSON();
            return children;
        }, {});
        return {
            ...this.fragment,
            ...(this.format !== null && { format: this.format }),
            ...(this.title !== null && { title: this.title }),
            $id: this.$id,
            ...children,
        };
    }
    get validations() {
        return this.dialect.getValidations(this.fragment, this.types);
    }
    get primaryType() {
        return getPrimaryType(this.fragment, this.types);
    }
    get simple() {
        return (this.primaryType !== SchemaNodeKind.Array && this.primaryType !== SchemaNodeKind.Object && this.combiners === null);
    }
    get unknown() {
        return (this.types === null &&
            this.combiners === null &&
            this.format === null &&
            this.enum === null &&
            Object.keys(this.annotations).length + Object.keys(this.validations).length === 0);
    }
    static [Symbol.hasInstance](instance) {
        return isSchemaNode(instance) && isRegularNode(instance);
    }
}
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], RegularNode.prototype, "validations", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], RegularNode.prototype, "primaryType", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], RegularNode.prototype, "simple", null);

class RootNode extends BaseNode {
    constructor(fragment) {
        super(fragment);
        this.fragment = fragment;
        this.parent = null;
        this.children = [];
    }
    toJSON() {
        if (this.children.length !== 1) {
            return this.children.map(child => child.toJSON());
        }
        return this.children[0].toJSON();
    }
}

function isSchemaNode(node) {
    const name = Object.getPrototypeOf(node).constructor.name;
    return (name === RootNode.name ||
        name === RegularNode.name ||
        name === MirroredRegularNode.name ||
        name === ReferenceNode.name ||
        name === MirroredReferenceNode.name);
}
function isRootNode(node) {
    return Object.getPrototypeOf(node).constructor.name === 'RootNode';
}
function isRegularNode(node) {
    return 'types' in node && 'primaryType' in node && 'combiners' in node;
}
function isMirroredNode(node) {
    return 'mirroredNode' in node;
}
function isReferenceNode(node) {
    return 'external' in node && 'value' in node;
}

class ResolvingError extends ReferenceError {
    constructor() {
        super(...arguments);
        this.name = 'ResolvingError';
    }
}
class MergingError extends Error {
    constructor() {
        super(...arguments);
        this.name = 'MergingError';
    }
}

const resolveAllOf = require('@stoplight/json-schema-merge-allof');
const store = new WeakMap();
function _mergeAllOf(fragment, path, resolveRef) {
    return resolveAllOf(fragment, {
        deep: false,
        resolvers: resolveAllOf.stoplightResolvers,
        ...(resolveRef !== null
            ? {
                $refResolver($ref) {
                    if (typeof $ref !== 'string') {
                        return {};
                    }
                    if (pathToPointer(path).startsWith($ref)) {
                        throw new ResolvingError('Circular reference detected');
                    }
                    const allRefs = store.get(resolveRef);
                    let schemaRefs = allRefs.get(fragment);
                    if (schemaRefs === void 0) {
                        schemaRefs = [$ref];
                        allRefs.set(fragment, schemaRefs);
                    }
                    else if (schemaRefs.includes($ref)) {
                        const safelyResolved = JSON.parse(stringify(resolveRef(null, $ref)));
                        return 'allOf' in safelyResolved ? _mergeAllOf(safelyResolved, path, resolveRef) : safelyResolved;
                    }
                    else {
                        schemaRefs.push($ref);
                    }
                    const resolved = resolveRef(null, $ref);
                    if (Array.isArray(resolved.allOf)) {
                        for (const member of resolved.allOf) {
                            if (typeof member.$ref === 'string' && schemaRefs.includes(member.$ref)) {
                                throw new ResolvingError('Circular reference detected');
                            }
                        }
                    }
                    return resolved;
                },
            }
            : null),
    });
}
function mergeAllOf(fragment, path, walkingOptions) {
    if (walkingOptions.resolveRef !== null && !store.has(walkingOptions.resolveRef)) {
        store.set(walkingOptions.resolveRef, new WeakMap());
    }
    return _mergeAllOf(fragment, path, walkingOptions.resolveRef);
}

function mergeOneOrAnyOf(fragment, path, walkingOptions) {
    const combiner = SchemaCombinerName.OneOf in fragment ? SchemaCombinerName.OneOf : SchemaCombinerName.AnyOf;
    const items = fragment[combiner];
    if (!Array.isArray(items))
        return [];
    const merged = [];
    if (Array.isArray(fragment.allOf) && Array.isArray(items)) {
        for (const item of items) {
            merged.push({
                allOf: [...fragment.allOf, item],
            });
        }
        return merged;
    }
    else {
        for (const item of items) {
            const prunedSchema = { ...fragment };
            delete prunedSchema[combiner];
            const resolvedItem = typeof item.$ref === 'string' && walkingOptions.resolveRef !== null
                ? walkingOptions.resolveRef(null, item.$ref)
                : item;
            if (Object.keys(prunedSchema).length === 0) {
                merged.push(resolvedItem);
            }
            else {
                const mergedSchema = {
                    allOf: [prunedSchema, resolvedItem],
                };
                try {
                    merged.push(mergeAllOf(mergedSchema, path, walkingOptions));
                }
                catch (_a) {
                    merged.push(mergedSchema);
                }
            }
        }
    }
    return merged;
}

class Walker extends EventEmitter {
    constructor(root, walkingOptions) {
        super();
        this.root = root;
        this.walkingOptions = walkingOptions;
        this.schemaDialect = walkingOptions.schemaDialect;
        this.path = [];
        this.depth = -1;
        this.fragment = root.fragment;
        this.schemaNode = root;
        this.processedFragments = new WeakMap();
        this.hooks = {};
    }
    destroy() {
        this.path.length = 0;
        this.depth = -1;
        this.fragment = this.root.fragment;
        this.schemaNode = this.root;
        this.processedFragments = new WeakMap();
    }
    loadSnapshot(snapshot) {
        this.path.splice(0, this.path.length, ...snapshot.path);
        this.depth = snapshot.depth;
        this.fragment = snapshot.fragment;
        this.schemaNode = snapshot.schemaNode;
    }
    saveSnapshot() {
        return {
            depth: this.depth,
            fragment: this.fragment,
            schemaNode: this.schemaNode,
            path: this.path.slice(),
        };
    }
    hookInto(action, handler) {
        this.hooks[action] = handler;
    }
    restoreWalkerAtNode(node) {
        this.processedFragments.delete(node.fragment);
        this.path.splice(0, this.path.length, ...node.path);
        this.depth = node.depth;
        this.fragment = node.fragment;
        this.schemaNode = node;
    }
    walk() {
        var _a, _b, _c, _d;
        const { depth: initialDepth, fragment } = this;
        let { schemaNode: initialSchemaNode } = this;
        if (initialDepth === -1 && Object.keys(fragment).length === 0) {
            return;
        }
        while (isMirroredNode(initialSchemaNode)) {
            if (!isRegularNode(initialSchemaNode.mirroredNode)) {
                return;
            }
            if (initialSchemaNode.mirroredNode.children === void 0) {
                this.restoreWalkerAtNode(initialSchemaNode.mirroredNode);
                initialSchemaNode = this.schemaNode;
                this.depth = initialDepth;
            }
            else {
                return;
            }
        }
        const state = this.dumpInternalWalkerState();
        super.emit('enterFragment', fragment);
        const [schemaNode, initialFragment] = this.processFragment();
        super.emit('enterNode', schemaNode);
        const actualNode = isMirroredNode(schemaNode) ? schemaNode.mirroredNode : schemaNode;
        this.processedFragments.set(schemaNode.fragment, actualNode);
        this.processedFragments.set(initialFragment, actualNode);
        this.fragment = schemaNode.fragment;
        this.depth = initialDepth + 1;
        const isIncluded = (_b = (_a = this.hooks).filter) === null || _b === void 0 ? void 0 : _b.call(_a, schemaNode);
        if (isIncluded === false) {
            super.emit('skipNode', schemaNode);
            return;
        }
        if (!isRootNode(schemaNode)) {
            schemaNode.parent = initialSchemaNode;
            runInAction(() => {
                schemaNode.subpath.push(...this.path.slice(initialSchemaNode.path.length));
            });
        }
        if ('children' in initialSchemaNode && !isRootNode(schemaNode)) {
            if (initialSchemaNode.children === void 0) {
                initialSchemaNode.children = [schemaNode];
                makeObservable(initialSchemaNode, {
                    children: observable,
                });
            }
            else {
                runInAction(() => {
                    initialSchemaNode.children.push(schemaNode);
                });
            }
        }
        super.emit('includeNode', schemaNode);
        if (isRegularNode(schemaNode)) {
            this.schemaNode = schemaNode;
            if (((_d = (_c = this.hooks).stepIn) === null || _d === void 0 ? void 0 : _d.call(_c, schemaNode)) !== false) {
                super.emit('stepInNode', schemaNode);
                this.walkNodeChildren();
                super.emit('stepOutNode', schemaNode);
            }
            else {
                super.emit('stepOverNode', schemaNode);
            }
        }
        super.emit('exitNode', schemaNode);
        this.restoreInternalWalkerState(state);
        super.emit('exitFragment', fragment);
    }
    dumpInternalWalkerState() {
        return {
            depth: this.depth,
            pathLength: this.path.length,
            schemaNode: this.schemaNode,
        };
    }
    restoreInternalWalkerState({ depth, pathLength, schemaNode }) {
        this.depth = depth;
        this.path.length = pathLength;
        this.schemaNode = schemaNode;
    }
    walkNodeChildren() {
        const { fragment, schemaNode } = this;
        if (!isRegularNode(schemaNode))
            return;
        const state = this.dumpInternalWalkerState();
        if (schemaNode.combiners !== null) {
            for (const combiner of schemaNode.combiners) {
                const items = fragment[combiner];
                if (!Array.isArray(items))
                    continue;
                let i = -1;
                for (const item of items) {
                    i++;
                    if (!isObjectLiteral(item))
                        continue;
                    this.fragment = item;
                    this.restoreInternalWalkerState(state);
                    this.path.push(combiner, String(i));
                    this.walk();
                }
            }
        }
        switch (schemaNode.primaryType) {
            case SchemaNodeKind.Array:
                if (Array.isArray(fragment.items)) {
                    let i = -1;
                    for (const item of fragment.items) {
                        i++;
                        if (!isObjectLiteral(item))
                            continue;
                        this.fragment = item;
                        this.restoreInternalWalkerState(state);
                        this.path.push('items', String(i));
                        this.walk();
                    }
                }
                else if (isObjectLiteral(fragment.items)) {
                    this.fragment = fragment.items;
                    this.restoreInternalWalkerState(state);
                    this.path.push('items');
                    this.walk();
                }
                break;
            case SchemaNodeKind.Object:
                if (isObjectLiteral(fragment.properties)) {
                    for (const key of Object.keys(fragment.properties)) {
                        const value = fragment.properties[key];
                        if (!isObjectLiteral(value))
                            continue;
                        this.fragment = value;
                        this.restoreInternalWalkerState(state);
                        this.path.push('properties', key);
                        this.walk();
                    }
                }
                if (isObjectLiteral(fragment.patternProperties)) {
                    for (const key of Object.keys(fragment.patternProperties)) {
                        const value = fragment.patternProperties[key];
                        if (!isObjectLiteral(value))
                            continue;
                        this.fragment = value;
                        this.restoreInternalWalkerState(state);
                        this.path.push('patternProperties', key);
                        this.walk();
                    }
                }
                break;
        }
        this.schemaNode = schemaNode;
    }
    retrieveFromFragment(fragment) {
        const processedSchemaNode = this.processedFragments.get(fragment);
        if (processedSchemaNode !== void 0) {
            if (isRegularNode(processedSchemaNode)) {
                return [new MirroredRegularNode(processedSchemaNode), fragment];
            }
            if (isReferenceNode(processedSchemaNode)) {
                return [new MirroredReferenceNode(processedSchemaNode), fragment];
            }
            throw new TypeError('Cannot mirror the node');
        }
    }
    processFragment() {
        var _a, _b, _c;
        const { walkingOptions, path } = this;
        let { fragment } = this;
        let retrieved = isNonNullable(fragment) ? this.retrieveFromFragment(fragment) : null;
        if (retrieved) {
            return retrieved;
        }
        if ('$ref' in fragment) {
            if (typeof fragment.$ref !== 'string') {
                return [new ReferenceNode(fragment, '$ref is not a string'), fragment];
            }
            else if (walkingOptions.resolveRef !== null) {
                try {
                    fragment = walkingOptions.resolveRef(path, fragment.$ref);
                }
                catch (ex) {
                    super.emit('error', createMagicError(ex));
                    return [new ReferenceNode(fragment, (_a = ex === null || ex === void 0 ? void 0 : ex.message) !== null && _a !== void 0 ? _a : 'Unknown resolving error'), fragment];
                }
            }
            else {
                return [new ReferenceNode(fragment, null), fragment];
            }
        }
        let initialFragment = fragment;
        if (walkingOptions.mergeAllOf && SchemaCombinerName.AllOf in fragment) {
            try {
                if (Array.isArray(fragment.allOf)) {
                    initialFragment = fragment.allOf;
                }
                fragment = mergeAllOf(fragment, path, walkingOptions);
            }
            catch (ex) {
                initialFragment = fragment;
                super.emit('error', createMagicError(new MergingError((_b = ex === null || ex === void 0 ? void 0 : ex.message) !== null && _b !== void 0 ? _b : 'Unknown merging error')));
            }
        }
        if (SchemaCombinerName.OneOf in fragment || SchemaCombinerName.AnyOf in fragment) {
            try {
                const merged = mergeOneOrAnyOf(fragment, path, walkingOptions);
                if (merged.length === 1) {
                    return [new RegularNode(merged[0], this.schemaDialect), initialFragment];
                }
                else {
                    const combiner = SchemaCombinerName.OneOf in fragment ? SchemaCombinerName.OneOf : SchemaCombinerName.AnyOf;
                    return [
                        new RegularNode({
                            [combiner]: merged,
                        }, this.schemaDialect),
                        initialFragment,
                    ];
                }
            }
            catch (ex) {
                super.emit('error', createMagicError(new MergingError((_c = ex === null || ex === void 0 ? void 0 : ex.message) !== null && _c !== void 0 ? _c : 'Unknown merging error')));
            }
        }
        retrieved = isNonNullable(fragment) ? this.retrieveFromFragment(initialFragment) : null;
        if (retrieved) {
            return retrieved;
        }
        return [new RegularNode(fragment, this.schemaDialect), initialFragment];
    }
}

class SchemaTree {
    constructor(schema, opts) {
        var _a, _b;
        this.schema = schema;
        this.opts = opts;
        this.resolveRef = (path, $ref) => {
            const seenRefs = [];
            let cur$ref = $ref;
            let resolvedValue;
            while (typeof cur$ref === 'string') {
                if (seenRefs.includes(cur$ref)) {
                    break;
                }
                seenRefs.push(cur$ref);
                resolvedValue = this._resolveRef(path, cur$ref);
                cur$ref = resolvedValue.$ref;
            }
            return resolvedValue;
        };
        this._resolveRef = (path, $ref) => {
            var _a;
            const source = extractSourceFromRef($ref);
            const pointer = extractPointerFromRef($ref);
            const refResolver = (_a = this.opts) === null || _a === void 0 ? void 0 : _a.refResolver;
            if (typeof refResolver === 'function') {
                return refResolver({ source, pointer }, path, this.schema);
            }
            else if (source !== null) {
                throw new ResolvingError('Cannot dereference external references');
            }
            else if (pointer === null) {
                throw new ResolvingError('The pointer is empty');
            }
            else if (isObjectLiteral(this.schema)) {
                const value = resolveInlineRef(this.schema, pointer);
                if (!isObjectLiteral(value)) {
                    throw new ResolvingError('Invalid value');
                }
                return value;
            }
            else {
                throw new ResolvingError('Unexpected input');
            }
        };
        this.root = new RootNode(schema);
        this.walker = new Walker(this.root, {
            mergeAllOf: ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.mergeAllOf) !== false,
            resolveRef: (opts === null || opts === void 0 ? void 0 : opts.refResolver) === null ? null : this.resolveRef,
            schemaDialect: (_b = opts === null || opts === void 0 ? void 0 : opts.dialect) !== null && _b !== void 0 ? _b : new SharedSchemaDialect(),
        });
    }
    toJSON() {
        return this.root.toJSON();
    }
    destroy() {
        this.root.children.length = 0;
        this.walker.destroy();
    }
    populate() {
        this.invokeWalker(this.walker);
    }
    invokeWalker(walker) {
        walker.walk();
    }
}

export { BaseNode, JSONSchemaDraft7Dialect, MirroredReferenceNode, MirroredRegularNode, OAS2SchemaObjectDialect, ReferenceNode, RegularNode, RootNode, SchemaCombinerName, SchemaDialect, SchemaNodeKind, SchemaTree, isMirroredNode, isReferenceNode, isRegularNode, isRootNode, isSchemaNode };
//# sourceMappingURL=index.es.js.map
