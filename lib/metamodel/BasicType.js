'use strict';

const Type = require('./Type');
const GeoPoint = require('../GeoPoint');
const File = require('../binding/File');

/**
 * @alias metamodel.BasicType
 * @extends metamodel.Type
 */
class BasicType extends Type {
  /**
   * @inheritDoc
   */
  get persistenceType() {
    return Type.PersistenceType.BASIC;
  }

  /**
   * Creates a new instance of a native db type
   * @param {string} ref The db ref of this type
   * @param {Class<*>} typeConstructor The javascript class of this type
   * @param {boolean=} noResolving Indicates if this type is not the main type of the constructor
   */
  constructor(ref, typeConstructor, noResolving) {
    const id = ref.indexOf('/db/') === 0 ? ref : '/db/' + ref;

    super(id, typeConstructor);

    /**
     * Indicates if this type is not the main type of the constructor
     * @type {boolean}
     */
    this.noResolving = noResolving;
  }

  /**
   * @inheritDoc
   */
  toJsonValue(state, currentValue) {
    return currentValue === null || currentValue === undefined ? null : this.typeConstructor(currentValue);
  }

  /**
   * @inheritDoc
   */
  fromJsonValue(state, jsonValue) {
    return jsonValue === null || jsonValue === undefined ? null : jsonValue;
  }

  toString() {
    return 'BasicType(' + this.ref + ')';
  }
}

function dateToJson(value) {
  // remove trailing zeros
  return value instanceof Date ? value.toISOString().replace(/\.?0*Z/, 'Z') : null;
}

function jsonToDate(json, currentValue) {
  const date = typeof json === 'string' ? new Date(json) : null;
  if (currentValue && date) {
    // compare normalized date strings instead of plain strings
    return currentValue.toISOString() === date.toISOString() ? currentValue : date;
  }

  return date;
}

Object.assign(BasicType, /** @lends metamodel.BasicType */ {
  Boolean: new class BooleanType extends BasicType {
    fromJsonValue(state, json, currentValue) {
      return typeof json === 'string' ? json !== 'false' : super.fromJsonValue(state, json, currentValue);
    }
  }('Boolean', Boolean),

  Double: new class DoubleType extends BasicType {
    fromJsonValue(state, json, currentValue) {
      return typeof json === 'string' ? parseFloat(json) : super.fromJsonValue(state, json, currentValue);
    }
  }('Double', Number),

  Integer: new class IntegerType extends BasicType {
    fromJsonValue(state, json, currentValue) {
      return typeof json === 'string' ? parseInt(json, 10) : super.fromJsonValue(state, json, currentValue);
    }
  }('Integer', Number),

  String: new class StringType extends BasicType {}('String', String),

  DateTime: new class DateTimeType extends BasicType {
    toJsonValue(state, value) {
      return dateToJson(value);
    }

    fromJsonValue(state, json, currentValue) {
      return jsonToDate(json, currentValue);
    }
  }('DateTime', Date),

  Date: new class DateType extends BasicType {
    toJsonValue(state, value) {
      const json = dateToJson(value);
      return json ? json.substring(0, json.indexOf('T')) : null;
    }

    fromJsonValue(state, json, currentValue) {
      return jsonToDate(json, currentValue);
    }
  }('Date', Date),

  Time: new class TimeType extends BasicType {
    toJsonValue(state, value) {
      const json = dateToJson(value);
      return json ? json.substring(json.indexOf('T') + 1) : null;
    }

    fromJsonValue(state, json, currentValue) {
      return typeof json === 'string' ? jsonToDate('1970-01-01T' + json, currentValue) : json;
    }
  }('Time', Date),

  File: new class FileType extends BasicType {
    toJsonValue(state, value) {
      return value instanceof File ? value.id : null;
    }

    fromJsonValue(state, json, currentValue) {
      if (json) {
        return currentValue && currentValue.id === json ? currentValue : new state.db.File(json);
      }
      return null;
    }
  }('File', File),

  GeoPoint: new class GeoPointType extends BasicType {
    toJsonValue(state, value) {
      return value instanceof GeoPoint ? value : null;
    }

    fromJsonValue(state, json) {
      return json ? new GeoPoint(json) : null;
    }
  }('GeoPoint', GeoPoint),

  JsonArray: new class JsonArrayType extends BasicType {
    toJsonValue(state, value) {
      return Array.isArray(value) ? value : null;
    }

    fromJsonValue(state, json) {
      return Array.isArray(json) ? json : null;
    }
  }('JsonArray', Array),

  JsonObject: new class JsonObjectType extends BasicType {
    toJsonValue(state, value) {
      if (value && value.constructor === Object) {
        return value;
      }

      return null;
    }
  }('JsonObject', Object),
});

module.exports = BasicType;
