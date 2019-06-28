import { JSONSchema6, JSONSchema6Definition } from 'json-schema';

const formatExamples = {
  string: () => '',
  string_email: () => 'user@example.com',
  'string_date-time': () => new Date().toISOString(),
  string_date: () => new Date().toISOString().substring(0, 10),
  string_uuid: () => '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  string_hostname: () => 'example.com',
  string_ipv4: () => '198.51.100.42',
  string_ipv6: () => '2001:0db8:5b96:0000:0000:426f:8e17:642a',
  number: () => 0,
  number_float: () => 0.0,
  integer: () => 0,
  boolean: (schema) => typeof schema.default === 'boolean' ? schema.default : true,
  null: () => null,
  any: () => null
};

export function examplePrimitive(schema: JSONSchema6) {
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  const formatFunc = formatExamples[`${type}_${schema.format}`] || formatExamples[type];
  if (typeof (formatFunc) === 'function') {
    return formatFunc(schema);
  }
  return `Unknown: ` + type;
}

export function exampleFromSchema(schema: JSONSchema6Definition): any {
  if (schema === true || schema === false) {
    return schema;
  }
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if ('const' in schema) {
    return schema.const;
  }
  if ('default' in schema) {
    return schema.default;
  }
  if ('examples' in schema && schema.examples.length) {
    return schema.examples[0];
  }
  if (schema.enum) {
    return schema.enum[0];
  }
  if (type === 'object') {
    const keys = Object.keys(schema.properties);
    const result = {};
    for (const key of keys) {
      result[key] = exampleFromSchema(schema.properties[key]);
    }
    return result;
  }
  if (type === 'array') {
    const item = Array.isArray(schema.items) ? schema.items[0] : schema.items;
    return [exampleFromSchema(item)];
  }
  return examplePrimitive(schema);
}
