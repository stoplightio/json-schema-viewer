import { SchemaFragment } from '@stoplight/json-schema-tree';

export type VendorExtensionsList = {
  [keyof: string]: unknown;
};

export type VendorExtensionsResult = [number, VendorExtensionsList];

/**
 * Extract all vendor extensions or properties prefix with 'x-' from the schema definition
 * @param fragment The fragment to extract the vendor extensions from
 * @returns VendorExtensionsResult
 */
export function extractVendorExtensions(fragment: SchemaFragment | boolean): VendorExtensionsResult {
  if (typeof fragment === 'boolean') {
    return [0, {}];
  }

  const extensionKeys = Object.entries(fragment).filter(([key]) => key.startsWith('x-'));
  let vendorExtensions: VendorExtensionsList = {};

  for (const [key, value] of extensionKeys) {
    vendorExtensions[key] = value;
  }

  return [extensionKeys.length, vendorExtensions];
}
