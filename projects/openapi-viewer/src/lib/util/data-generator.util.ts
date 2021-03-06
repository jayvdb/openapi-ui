import { SchemaObject } from 'openapi3-ts';

export const formatExampleDate = new Date();
formatExampleDate.setMilliseconds(0);
formatExampleDate.setSeconds(0);

const formatExamples = {
  string: () => '',
  string_email: () => 'user@example.com',
  'string_date-time': () => formatExampleDate.toISOString(),
  string_date: () => formatExampleDate.toISOString().substring(0, 10),
  string_time: () => formatExampleDate.toISOString().substring(11),
  string_uuid: () => '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  string_hostname: () => 'example.com',
  string_ipv4: () => '198.51.100.42',
  string_ipv6: () => '2001:0db8:5b96:0000:0000:426f:8e17:642a',
  number: () => 0,
  number_float: () => 0.0,
  integer: () => 0,
  boolean: schema => (typeof schema.default === 'boolean' ? schema.default : true),
  null: () => null,
  any: () => null
};

export function examplePrimitive(schema: SchemaObject) {
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  const formatFunc = formatExamples[`${type}_${schema.format}`] || formatExamples[type];
  if (typeof formatFunc === 'function') {
    return formatFunc(schema);
  }
  return `Unknown: ` + type;
}

export function exampleFromSchema(schema: SchemaObject): any {
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
  if (type === 'object' || schema.properties) {
    const result = {};
    if ((schema as any).example) {
      return (schema as any).example;
    }
    if (!schema.properties) {
      return result;
    }
    const keys = Object.keys(schema.properties);
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

export function randomHex(len: number): string {
  const preHex = len - 1 === 0 ? 0 : 2 ** (4 * (len - 1));
  const hex = 2 ** (4 * len) - 1;
  return Math.floor(preHex + Math.random() * (hex - preHex)).toString(16);
}

export function getStarMatcher(pattern: string): RegExp {
  const escaped = escapeRegExpNoStar(pattern);
  return new RegExp('^' + escaped.replace(/\*/g, '.{0,50}') + '$');
}

function escapeRegExpNoStar(pattern: string) {
  return pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

export function getJsonString(input: any): string {
  if (typeof input === 'string' && input.match(/^({|\[|"|\d|-\d|null)/)) {
    return input;
  }
  return JSON.stringify(input, null, 2);
}

export function serializeQueryParams(queryParams: Record<string, string>) {
  if (!queryParams) {
    return '';
  }
  return Object.keys(queryParams)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(queryParams[key]))
    .join('&');
}

export function parseQueryString(queryParams: string): Record<string, string> {
  if (typeof queryParams !== 'string' || !queryParams.length) {
    return {};
  }
  const paramsList = queryParams.split('&');
  const params: Record<string, string> = {};
  if (paramsList.length) {
    for (const line of paramsList) {
      const [key, value] = line.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return params;
}
