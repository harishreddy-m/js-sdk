'use strict';

const ManagedType = require('./ManagedType');
const Type = require('./Type');
const binding = require('../binding');

/**
 * @alias metamodel.EmbeddableType
 * @extends metamodel.ManagedType
 *
 * @param {string} ref
 * @param {Class<binding.Entity>=} typeConstructor
 */
class EmbeddableType extends ManagedType {
  /**
   * @inheritDoc
   */
  get persistenceType() {
    return Type.PersistenceType.EMBEDDABLE;
  }

  /**
   * @inheritDoc
   */
  createProxyClass() {
    return this.enhancer.createProxy(binding.Managed);
  }

  /**
   * @inheritDoc
   */
  createObjectFactory(db) {
    return binding.ManagedFactory.create(this, db);
  }

  /**
   * @inheritDoc
   */
  toJsonValue(state, object, options) {
    if (state.root && object instanceof this.typeConstructor && !object._metadata.root) {
      object._metadata.root = state.root;
    }

    return super.toJsonValue(state, object, options);
  }

  /**
   * @inheritDoc
   */
  fromJsonValue(state, jsonObject, currentObject, options) {
    let obj = currentObject;

    if (jsonObject) {
      if (!(obj instanceof this.typeConstructor)) {
        obj = this.create();
      }

      if (state.root && !obj._metadata.root) {
        obj._metadata.root = state.root;
      }
    }

    return super.fromJsonValue(state, jsonObject, obj, options);
  }

  toString() {
    return 'EmbeddableType(' + this.ref + ')';
  }
}

module.exports = EmbeddableType;
