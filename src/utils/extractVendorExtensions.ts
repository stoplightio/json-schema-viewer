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
export function extractVendorExtensions(fragment: SchemaFragment = {}): VendorExtensionsResult {
  const extensionKeys = Object.keys(fragment).filter(key => key.toLowerCase().startsWith('x-'));
  let vendorExtensions = {};
  extensionKeys.forEach(key => {
    vendorExtensions[key] = fragment[key];
  });

  return [extensionKeys.length, vendorExtensions];
}
