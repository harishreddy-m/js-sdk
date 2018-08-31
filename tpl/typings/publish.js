/* eslint-disable no-console,node/no-unsupported-features,no-restricted-syntax */

// eslint-disable-next-line spaced-comment
/// <reference path="jsdoc.d.ts"/>

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

/** @type {Namespace} */
const rootNs = {
  name: '',
  longname: '',
  prefix: '',
  namespaces: {},
  body: [],
};

const typeDefs = {};
const push = Function.prototype.apply.bind(Array.prototype.push);

/**
 * @param {string} name
 * @return {string}
 */
function createSingleType(name) {
  let type = typeDefs[name];
  if (!type) {
    type = name;

    type = type.replace(/function/g, 'Function');
    type = type.replace(/Function\(\)/g, 'Function');
    type = type.replace(/\*/g, 'any');
    type = type.replace(/\.</g, '<');

    type = type.replace(/Object\.?<([^,]+),\s*([^>]+)>/g, '{ [key: $1]: $2 }');
    type = type.replace(/^Array<(.*)>$/, '$1[]');

    typeDefs[name] = type;
  }

  return type;
}

/**
 * @param {TypeSpecification=} typeSpec
 * @return {string[]}
 */
function createType(typeSpec) {
  if (!typeSpec) {
    console.warn('Unknown type spec occured.');
    return ['unknown'];
  }

  return typeSpec.names
    .map(name => createSingleType(name))
    .filter(name => name !== 'object' && name !== 'Object');
}

/**
 * @param {ObjectTypeSpecification} type
 */
function objectType(type) {
  const subParams = Object.entries(type).map(([key, subParam]) => `${key}${subParam.optional ? '?' : ''}: ${joinTypes(subParam.type)}`);
  return `{ ${subParams.join(', ')} }`;
}

/**
 * @param {string[]} types
 * @return {string}
 */
function joinTypes(types) {
  if (!types.length) {
    return 'object';
  }

  return types
    .map(type => (typeof type === 'string' ? type : objectType(type)))
    .join(' | ');
}

/**
 * @param {string[]} types
 * @return {string}
 */
function makeArray(types) {
  if (types.length > 1) {
    return `(${joinTypes(types)})[]`;
  }

  return `${joinTypes(types)}[]`;
}

/**
 * @param {string} str
 * @return {string[]}
 */
function getDescriptionLines(str) {
  const lines = str.split('\n').map(line => line.trim());
  const index = lines.findIndex((line, idx) => idx > 0 && !line && lines[idx + 1].length > 0);
  if (index > -1) {
    return lines.slice(0, index - 1);
  }

  return lines;
}

/**
 * @param {string} longname
 * @return {Namespace}
 */
function getNamespaceOf(longname) {
  const nsIndex = longname.lastIndexOf('.');

  if (nsIndex === -1) {
    return rootNs;
  }

  const ns = longname.substring(0, nsIndex);
  const name = ns.substring(ns.lastIndexOf('.') + 1, nsIndex);

  const parentNamespace = getNamespaceOf(ns);

  const namespace = parentNamespace.namespaces[name];
  if (namespace) {
    return namespace;
  }

  parentNamespace.namespaces[name] = {
    name,
    longname: (parentNamespace.longname ? parentNamespace + '.' : '') + name,
    prefix: parentNamespace.prefix + '  ',
    namespaces: {},
    body: [],
  };

  return parentNamespace.namespaces[name];
}

/**
 * @param {Definition} member
 * @return {string}
 */
function createParams(member) {
  if (!member.params) {
    return '';
  }

  const paramTypes = {};
  const objTypes = {};

  for (const param of member.params) {
    const names = param.name.split('.');
    const [name, property] = names;

    const type = createType(param.type);
    if (!paramTypes[name]) {
      paramTypes[name] = type;
    }

    if (property) {
      let obj = objTypes[name];
      if (typeof obj !== 'object') {
        obj = {};
        objTypes[name] = obj;
        paramTypes[name].push(obj);
      }

      obj[property] = { type, optional: param.optional };
    }
  }

  return member.params
    .filter(param => paramTypes[param.name])
    .map((param) => {
      const paramType = paramTypes[param.name];
      let p = '';
      if (param.variable) {
        p += '...';
      }
      p += param.name;
      if (param.optional) {
        p += '?';
      }
      p += ': ';

      if (param.variable) {
        p += makeArray(paramType);
      } else {
        p += joinTypes(paramType);
      }

      return p;
    })
    .join(', ');
}

/**
 * @param {Definition} member
 * @return {string}
 */
function createReturn(member) {
  const { returns = [], longname } = member;
  if (returns.length > 0) {
    return joinTypes(createType(returns[0].type));
  }

  console.warn(`No return type for ${longname}.`);
  return 'any';
}

/**
 * @param {Taffy} data
 * @param {string} prefix
 * @param {string} fullClassName
 * @param {boolean=} exportIt
 * @return {Array}
 */
function createMembers(data, prefix, fullClassName, exportIt) {
  const name = fullClassName.substring(fullClassName.lastIndexOf('.') + 1);

  const lines = [];
  const members = data({ memberof: fullClassName }).get() || [];
  const hiddenMembers = data({ memberof: fullClassName + '.' + name }).get() || [];

  const allMembers = hiddenMembers.concat(members);

  for (const member of allMembers) {
    if (!member.inherited && !member.ignore && !member.isEnum && member.access !== 'private' && !member.undocumented) {
      switch (member.kind) {
        case 'member': {
          let line = prefix + '  ';
          if (member.scope === 'static') {
            line += 'static ';
          }

          // Skip setter
          if (!member.type) {
            break;
          }

          if (exportIt) {
            line += 'export const ';
          } else if (member.readonly) {
            line += 'readonly ';
          }

          line += member.name;
          if (member.nullable) {
            line += '?';
          }

          line += ': ' + joinTypes(createType(member.type)) + ';';
          lines.push(line);

          break;
        }
        case 'function': {
          let line = prefix;
          if (exportIt) {
            lines.push('');
            if (member.description) {
              lines.push(`${prefix}/**`);
              lines.push(`${prefix} * ${member.description}`);
              lines.push(`${prefix} */`);
            }
            // Exported function
            line += 'export function ';
          } else {
            // Method
            if (member.deprecated) {
              lines.push(`${prefix}  /**`);
              lines.push(`${prefix}   * @deprecated${typeof member.deprecated === 'string' ? ' ' + member.deprecated : ''}`);
              lines.push(`${prefix}   */`);
            }

            line += '  ';
            if (member.scope === 'static') {
              line += 'static ';
            }
          }

          line += member.name;
          line += '(';
          line += createParams(member);
          line += '): ' + createReturn(member) + ';';
          lines.push(line);

          break;
        }
        default: {
          // no-op
        }
      }
    }
  }

  return lines;
}

/**
 * @param {Taffy} data
 * @param {Namespace} namespace
 * @return {string[]}
 */
function createNs(data, namespace) {
  /** @type {string[]} */
  const lines = [];
  const prefix = namespace.prefix;

  lines.push(...namespace.body);

  for (const ns of Object.values(namespace.namespaces)) {
    lines.push('');
    if (ns.name) {
      lines.push(prefix + 'export namespace ' + ns.name + ' {');
    }

    const isClassNameSpace = data({ kind: ['class', 'interface'], longname: ns.longname }).get().length;
    if (!isClassNameSpace) {
      push(lines, createMembers(data, ns.prefix, ns.longname, true));
    }

    push(lines, createNs(data, ns));

    if (ns.name) {
      lines.push(prefix + '}');
    }
  }

  return lines;
}

/**
 * @param {Definition} cls
 * @return {boolean}
 */
function isFactory(cls) {
  const { longname = '' } = cls;
  return longname.startsWith('binding') && longname.includes('Factory');
}

/**
 * @param {Taffy} data
 * @param {Definition} cls
 * @param {Namespace} ns
 * @return {string[]}
 */
function createClass(data, cls, ns) {
  /** @type {string[]} */
  const lines = [];
  const { longname = '', augments = [], implements: interfaces = [] } = cls;
  const isInterface = cls.kind === 'interface' || isFactory(cls);

  // Print out class description
  const description = cls.classdesc || cls.description;
  if (description) {
    lines.push(`${ns.prefix}/**`);
    for (const descriptionLine of getDescriptionLines(description)) {
      lines.push(`${ns.prefix} * ${descriptionLine}`);
    }
    lines.push(`${ns.prefix} */`);
  }

  // Create class declaration
  let classLine = ns.prefix + 'export ';
  if (isInterface) {
    classLine += 'interface ' + cls.name;
  } else {
    classLine += 'class ' + cls.name;
  }

  if (augments.length || interfaces.length) {
    if (isInterface) {
      classLine += ' extends ';
      classLine += augments.concat(interfaces).join(', ');
    } else {
      if (augments.length) {
        classLine += ' extends ' + augments[0];
      }

      if (interfaces.length) {
        classLine += ' implements ' + interfaces.join(', ');
      }
    }
  }

  classLine += ' {';
  lines.push(classLine);

  // Create constructor
  if (!isInterface) {
    lines.push(ns.prefix + '  constructor(' + createParams(cls) + ');');
  }

  // Create class members
  push(lines, createMembers(data, ns.prefix, longname));
  if (!isInterface && augments.length > 1) {
    for (let i = 1, len = augments.length; i < len; i += 1) {
      push(lines, createMembers(data, ns.prefix, augments[i]));
    }
  }

  if (lines.length === 1) {
    return [classLine + '}'];
  }

  lines.push(ns.prefix + '}');
  return lines;
}

/**
 * @param {*} value
 * @return {string}
 */
function stringify(value) {
  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'string') {
    return `'${value}'`;
  }

  throw new Error('Cannot handle ' + value);
}

/**
 * @param {Definition} enumeration
 * @param {Namespace} ns
 * @return {string[]}
 */
function createEnum(enumeration, ns) {
  const lines = [];
  if (enumeration.description) {
    lines.push(`${ns.prefix}/**`);
    lines.push(`${ns.prefix} * ${enumeration.description}`);
    lines.push(`${ns.prefix} */`);
  }
  lines.push(`${ns.prefix}export enum ${enumeration.name} {`);

  if (enumeration.properties) {
    for (const prop of enumeration.properties) {
      const line = `${ns.prefix}  ${prop.name} = ${stringify(prop.defaultvalue)},`;
      lines.push(line);
    }
  }

  lines.push(`${ns.prefix}}`);
  return lines;
}

/**
 @param {Taffy} data See <http://taffydb.com/>.
 @param {object} opts
 */
function publish(data, opts) {
  // Process all callback definitions
  const types = data({ kind: 'typedef' }).get();
  for (const type of types) {
    if (type.longname) {
      if (type.params) {
        typeDefs[type.longname] = '(' + createParams(type) + ') => ' + createReturn(type);
      } else {
        typeDefs[type.longname] = joinTypes(createType(type.type));
      }
    }
  }

  // Process all classes and interfaces
  const classes = data({ kind: ['class', 'interface'] }).get();
  for (const cls of classes) {
    const { ignore, undocumented, longname } = cls;
    // Skipping classes like EntityManager.EntityManager
    if (!ignore && !undocumented && longname && longname.indexOf(cls.name) === longname.length - cls.name.length) {
      const ns = getNamespaceOf(longname);
      const lines = createClass(data, cls, ns);

      ns.body.push('');
      ns.body.push(...lines);
    }
  }

  // Process all enumerations
  const enums = data({ isEnum: true }).get();
  for (const enumeration of enums) {
    const { ignore, longname } = enumeration;
    // Skipping classes like EntityManager.EntityManager
    if (!ignore && longname && longname.indexOf(enumeration.name) === longname.length - enumeration.name.length) {
      const ns = getNamespaceOf(longname);

      const lines = createEnum(enumeration, ns);

      ns.body.push('');
      ns.body.push(...lines);
    }
  }

  // Load template for file header
  let text = fs.readFileSync(path.resolve(__dirname, opts.destination.replace('.ts', '.tpl')), 'utf8');

  text += createNs(data, rootNs).join(os.EOL);

  fs.writeFileSync(opts.destination, text);
  // fs.writeFileSync('doc.json', JSON.stringify(data().get(), null, '  '));

  return null;
}

exports.publish = publish;
