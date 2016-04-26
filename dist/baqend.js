/*!
* Baqend JavaScript SDK 2.0.1
* http://baqend.com
*
* Copyright (c) 2015 Baqend GmbH
*
* Includes:
* jahcode - http://jahcode.com/
* Copyright (c) 2011-2013 Florian Buecklers
*
* lie - https://github.com/calvinmetcalf/lie
* Copyright (c) 2014 Calvin Metcalf
*
* node-uuid - http://github.com/broofa/node-uuid
* Copyright (c) 2010-2012 Robert Kieffer
*
* validator - http://github.com/chriso/validator.js
* Copyright (c) 2015 Chris O'Hara <cohara87@gmail.com>
*
* Released under the MIT license
*
* Date: Tue, 26 Apr 2016 15:47:57 GMT
*/
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DB = f()}})(function(){var define,module,exports;var babelHelpers = {};
babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers.defaults = function (obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
};

babelHelpers.inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : babelHelpers.defaults(subClass, superClass);
};

babelHelpers.possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

babelHelpers;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";

var message = _dereq_(32);
var error = _dereq_(31);
var binding = _dereq_(17);
var util = _dereq_(60);

var EntityTransaction = _dereq_(3);
var Query = _dereq_(5);
var Metadata = _dereq_(53);
var Message = _dereq_(22);
var BloomFilter = _dereq_(18);
var StatusCode = Message.StatusCode;

/**
 * @alias baqend.EntityManager
 * @extends baqend.util.Lockable
 */

var EntityManager = function (_util$Lockable) {
  babelHelpers.inherits(EntityManager, _util$Lockable);
  babelHelpers.createClass(EntityManager, [{
    key: 'isOpen',


    /**
     * Determine whether the entity manager is open.
     * true until the entity manager has been closed
     * @type Boolean
     */
    get: function get() {
      return !!this._connector;
    }

    /**
     * The authentication token if the user is logged in currently
     * @type String
     */

  }, {
    key: 'token',
    get: function get() {
      return this.tokenStorage.get(this._connector.origin);
    }

    /**
     * The authentication token if the user is logged in currently
     * @param {String} value
     */
    ,
    set: function set(value) {
      this.tokenStorage.update(this._connector.origin, value);
    }

    /**
     * @param {baqend.EntityManagerFactory} entityManagerFactory The factory which of this entityManager instance
     * @param {baqend.util.TokenStorage} tokenStorage The token storage to persist the authorization token
     */

  }]);

  function EntityManager(entityManagerFactory, tokenStorage) {
    babelHelpers.classCallCheck(this, EntityManager);


    /**
     * Log messages can created by calling log directly as function, with a specific log level or with the helper
     * methods, which a members of the log method.
     *
     * Logs will be filtered by the client logger and the baqend before they persisted. The default log level is
     * 'info' therefore all log messages below the given message aren't persisted.
     *
     * Examples:
     * <pre class="prettyprint">
    // default log level ist info
    db.log('test message %s', 'my string');
    // info: test message my string
    // pass a explicit log level as the first argument, one of ('trace', 'debug', 'info', 'warn', 'error')
    db.log('warn', 'test message %d', 123);
    // warn: test message 123
    // debug log level will not be persisted by default, since the default logging level is info
    db.log('debug', 'test message %j', {number: 123}, {});
    // debug: test message {"number":123}
    // data = {}
    // One additional json object can be provided, which will be persisted together with the log entry
    db.log('info', 'test message %s, %s', 'first', 'second', {number: 123});
    // info: test message first, second
    // data = {number: 123}
    //use the log level helper
    db.log.info('test message', 'first', 'second', {number: 123});
    // info: test message first second
    // data = {number: 123}
    //change the default log level to trace, i.e. all log levels will be persisted, note that the log level can be
    //additionally configured in the baqend
    db.log.level = 'trace';
    //trace will be persisted now
    db.log.trace('test message', 'first', 'second', {number: 123});
    // info: test message first second
    // data = {number: 123}
     * </pre>
     *
     * @type baqend.util.Logger
     */

    var _this = babelHelpers.possibleConstructorReturn(this, _util$Lockable.call(this));

    _this.log = util.Logger.create(_this);

    /**
     * The connector used for baqend requests
     * @type baqend.connector.Connector
     * @private
     */
    _this._connector = null;

    /**
     * All managed and cached entity instances
     * @type WeakMap<String,baqend.binding.Entity>
     */
    _this._entities = null;

    /** @type baqend.EntityManagerFactory */
    _this.entityManagerFactory = entityManagerFactory;

    /** @type baqend.metamodel.Metamodel */
    _this.metamodel = entityManagerFactory.metamodel;

    /** @type baqend.metamodel.Code */
    _this.code = entityManagerFactory.code;

    /** @type baqend.util.Modules */
    _this.modules = null;

    /**
     * The current logged in user object
     * @type baqend.binding.User
     */
    _this.me = null;

    /**
     * Returns true if the device token is already registered, otherwise false.
     * @type boolean
     */
    _this.isDeviceRegistered = false;

    /**
     * Returns the tokenStorage which will be used to authorize all requests.
     * @type {baqend.util.TokenStorage}
     */
    _this.tokenStorage = tokenStorage;
    return _this;
  }

  /**
   * Connects this entityManager, used for synchronous and asynchronous initialization
   * @param {baqend.connector.Connector} connector
   * @param {Object=} connectData
   */


  EntityManager.prototype.connected = function connected(connector, connectData) {
    this._connector = connector;
    this._entities = {};

    this._createObjectFactory(this.metamodel.embeddables);
    this._createObjectFactory(this.metamodel.entities);

    this.transaction = new EntityTransaction(this);
    this.modules = new util.Modules(this, connector);

    if (this.tokenStorage == this.entityManagerFactory.tokenStorage && connectData) {
      this.isDeviceRegistered = !!connectData.device;
      if (connectData.user) this._updateUser(connectData.user, true);
    }
  };

  /**
   * @param {baqend.metamodel.ManagedType[]} types
   * @return {baqend.binding.ManagedFactory}
   * @private
   */


  EntityManager.prototype._createObjectFactory = function _createObjectFactory(types) {
    Object.keys(types).forEach(function (ref) {
      var type = this.metamodel.managedType(ref);
      var name = type.name;

      if (this[name]) {
        type.typeConstructor = this[name];
        Object.defineProperty(this, name, {
          value: type.createObjectFactory(this)
        });
      } else {
        Object.defineProperty(this, name, {
          get: function get() {
            Object.defineProperty(this, name, {
              value: type.createObjectFactory(this)
            });

            return this[name];
          },
          set: function set(typeConstructor) {
            type.typeConstructor = typeConstructor;
          },

          configurable: true
        });
      }
    }, this);
  };

  EntityManager.prototype._sendOverSocket = function _sendOverSocket(message) {
    message.token = this.token;
    this._connector.sendOverSocket(message);
  };

  EntityManager.prototype._subscribe = function _subscribe(topic, cb) {
    this._connector.subscribe(topic, cb);
  };

  EntityManager.prototype._unsubscribe = function _unsubscribe(topic, cb) {
    this._connector.unsubscribe(topic, cb);
  };

  EntityManager.prototype._send = function _send(message) {
    var _this2 = this;

    message.tokenStorage = this.tokenStorage;
    return this._connector.send(message).catch(function (e) {
      if (e.status == StatusCode.BAD_CREDENTIALS) {
        _this2._logout();
      }
      throw e;
    });
  };

  /**
   * Get an instance, whose state may be lazily fetched. If the requested instance does not exist
   * in the database, the EntityNotFoundError is thrown when the instance state is first accessed.
   * The application should not expect that the instance state will be available upon detachment,
   * unless it was accessed by the application while the entity manager was open.
   *
   * @param {(Function|String)} entityClass
   * @param {String=} key
   */


  EntityManager.prototype.getReference = function getReference(entityClass, key) {
    var id, type;
    if (key) {
      type = this.metamodel.entity(entityClass);
      if (key.indexOf('/db/') == 0) {
        id = key;
      } else {
        id = type.ref + '/' + encodeURIComponent(key);
      }
    } else {
      id = entityClass;
      type = this.metamodel.entity(id.substring(0, id.indexOf('/', 4))); //skip /db/
    }

    var entity = this._entities[id];
    if (!entity) {
      entity = type.create();
      var metadata = Metadata.get(entity);
      metadata.id = id;
      metadata.setUnavailable();

      this._attach(entity);
    }

    return entity;
  };

  /**
   * Creates an instance of Query.Builder for query creation and execution. The Query results are instances of the
   * resultClass argument.
   * @param {Function=} resultClass - the type of the query result
   * @return {baqend.Query.Builder} A query builder to create one ore more queries for the specified class
   */


  EntityManager.prototype.createQueryBuilder = function createQueryBuilder(resultClass) {
    return new Query.Builder(this, resultClass);
  };

  /**
   * Clear the persistence context, causing all managed entities to become detached.
   * Changes made to entities that have not been flushed to the database will not be persisted.
   */


  EntityManager.prototype.clear = function clear() {
    this._entities = {};
  };

  /**
   * Close an application-managed entity manager. After the close method has been invoked,
   * all methods on the EntityManager instance and any Query and TypedQuery objects obtained from it
   * will throw the IllegalStateError except for transaction, and isOpen (which will return false).
   * If this method is called when the entity manager is associated with an active transaction,
   * the persistence context remains managed until the transaction completes.
   */


  EntityManager.prototype.close = function close() {
    this._connector = null;

    return this.clear();
  };

  /**
   * Check if the instance is a managed entity instance belonging to the current persistence context.
   * @param {baqend.binding.Entity} entity - entity instance
   * @returns {Boolean} boolean indicating if entity is in persistence context
   */


  EntityManager.prototype.contains = function contains(entity) {
    return !!entity && this._entities[entity.id] === entity;
  };

  /**
   * Check if an object with the id from the given entity is already attached.
   * @param {baqend.binding.Entity} entity - entity instance
   * @returns {Boolean} boolean indicating if entity with same id is attached
   */


  EntityManager.prototype.containsById = function containsById(entity) {
    return !!(entity && this._entities[entity.id]);
  };

  /**
   * Remove the given entity from the persistence context, causing a managed entity to become detached.
   * Unflushed changes made to the entity if any (including removal of the entity),
   * will not be synchronized to the database. Entities which previously referenced the detached entity will continue to reference it.
   * @param {baqend.binding.Entity} entity - entity instance
   */


  EntityManager.prototype.detach = function detach(entity) {
    var _this3 = this;

    var state = Metadata.get(entity);
    return state.withLock(function () {
      _this3.removeReference(entity);
      return Promise.resolve(entity);
    });
  };

  /**
   * Resolve the depth by loading the referenced objects of the given entity.
   *
   * @param {baqend.binding.Entity} entity - entity instance
   * @param {Object} [options] The load options
   * @return {Promise<baqend.binding.Entity>}
   */


  EntityManager.prototype.resolveDepth = function resolveDepth(entity, options) {
    var _this4 = this;

    if (!options || !options.depth) return Promise.resolve(entity);

    options.resolved = options.resolved || [];
    var promises = [];
    var subOptions = Object.assign({}, options, {
      depth: options.depth === true ? true : options.depth - 1
    });
    this.getSubEntities(entity, 1).forEach(function (subEntity) {
      if (subEntity != null && ! ~options.resolved.indexOf(subEntity)) {
        options.resolved.push(subEntity);
        promises.push(_this4.load(subEntity.id, null, subOptions));
      }
    });

    return Promise.all(promises).then(function () {
      return entity;
    });
  };

  /**
   * Loads Object ID. Search for an entity of the specified oid.
   * If the entity instance is contained in the persistence context, it is returned from there.
   * @param {(Function|String)} entityClass - entity class
   * @param {String} oid - Object ID
   * @param {Object} [options] The load options
   * @return {Promise<baqend.binding.Entity>}
   */


  EntityManager.prototype.load = function load(entityClass, oid, options) {
    var _this5 = this;

    options = options || {};
    var entity = this.getReference(entityClass, oid);
    var state = Metadata.get(entity);

    var tid = 0;

    //TODO: implement transactional changed case
    //if (this.transaction.isChanged(ref))
    //  tid = this.transaction.tid;

    var msg = new message.GetObject(state.bucket, state.key);

    //msg.setCacheControl('max-age=0,no-cache');

    if (state.version || options.refresh) {
      // force a refresh with a unused eTag
      msg.setIfNoneMatch(options.refresh ? '' : state.version);
    }

    return this._send(msg).then(function (msg) {
      if (msg.response.status != StatusCode.NOT_MODIFIED) {
        state.setJson(msg.response.entity);
      }

      state.setPersistent();

      return _this5.resolveDepth(entity, options);
    }, function (e) {
      if (e.status == StatusCode.OBJECT_NOT_FOUND) {
        _this5.removeReference(entity);
        state.setRemoved();
        return null;
      } else {
        throw e;
      }
    });
  };

  /**
   * @param {baqend.binding.Entity} entity
   * @param {Object} options
   * @return {Promise<baqend.binding.Entity>}
   */


  EntityManager.prototype.insert = function insert(entity, options) {
    var _this6 = this;

    options = options || {};
    var isNew;

    return this._save(entity, options, function (state, json) {
      if (state.version) throw new error.PersistentError('Existing objects can\'t be inserted.');

      isNew = !state.id;

      return new message.CreateObject(state.bucket, json);
    }).then(function (val) {
      if (isNew) _this6._attach(entity);

      return val;
    });
  };

  /**
   * @param {baqend.binding.Entity} entity
   * @param {Object} options
   * @return {Promise<baqend.binding.Entity>}
   */


  EntityManager.prototype.update = function update(entity, options) {
    options = options || {};

    return this._save(entity, options, function (state, json) {
      if (!state.version) throw new error.PersistentError("New objects can't be inserted.");

      if (options.force) {
        delete json.version;
        var msg = new message.ReplaceObject(state.bucket, state.key, json);
        msg.setIfMatch('*');
        return msg;
      } else {
        msg = new message.ReplaceObject(state.bucket, state.key, json);
        msg.setIfMatch(state.version);
        return msg;
      }
    });
  };

  /**
   * @param {baqend.binding.Entity} entity
   * @param {Object} options The save options
   * @return {Promise<baqend.binding.Entity>}
   */


  EntityManager.prototype.save = function save(entity, options) {
    options = options || {};

    return this._save(entity, options, function (state, json) {
      if (options.force) {
        if (!state.id) throw new error.PersistentError("New special objects can't be forcedly saved.");

        delete json.version;
        return new message.ReplaceObject(state.bucket, state.key, json);
      } else if (state.version) {
        var msg = new message.ReplaceObject(state.bucket, state.key, json);
        msg.setIfMatch(state.version);
        return msg;
      } else {
        return new message.CreateObject(state.bucket, json);
      }
    });
  };

  /**
   * @param {baqend.binding.Entity} entity
   * @param {Function} cb pre-safe callback
   * @return {Promise<baqend.binding.Entity>}
   */


  EntityManager.prototype.optimisticSave = function optimisticSave(entity, cb) {
    var _this7 = this;

    var abort = false;
    var abortFn = function abortFn() {
      abort = true;
    };
    var promise = Promise.resolve(cb(entity, abortFn));

    if (abort) return Promise.resolve(entity);

    return promise.then(function () {
      return entity.save().catch(function (e) {
        if (e.status == 412) {
          return _this7.refresh(entity).then(function () {
            return _this7.optimisticSave(entity, cb);
          });
        } else {
          throw e;
        }
      });
    });
  };

  /**
   * Save the object state
   * @param {baqend.binding.Entity} entity
   * @param {Object} options
   * @param {Function} msgFactory
   * @return {Promise.<baqend.binding.Entity>}
   * @private
   */


  EntityManager.prototype._save = function _save(entity, options, msgFactory) {
    var _this8 = this;

    this.attach(entity);
    var state = Metadata.get(entity);
    return state.withLock(function () {
      var refPromises;

      var json;
      if (state.isAvailable) {
        //getting json will check all collections changes, therefore we must do it before proofing the dirty state
        json = state.getJson();
      }

      if (state.isDirty) {
        if (!options.refresh) {
          state.setPersistent();
        }

        var sendPromise = _this8._send(msgFactory(state, json)).then(function (msg) {
          if (options.refresh) {
            state.setJson(msg.response.entity);
            state.setPersistent();
          } else {
            state.setJsonMetadata(msg.response.entity);
          }
          return entity;
        }, function (e) {
          if (e.status == StatusCode.OBJECT_NOT_FOUND) {
            _this8.removeReference(entity);
            state.setRemoved();
            return null;
          } else {
            state.setDirty();
            throw e;
          }
        });

        refPromises = [sendPromise];
      } else {
        refPromises = [Promise.resolve(entity)];
      }

      var subOptions = Object.assign({}, options);
      subOptions.depth = 0;
      _this8.getSubEntities(entity, options.depth).forEach(function (sub) {
        refPromises.push(_this8._save(sub, subOptions, msgFactory));
      });

      return Promise.all(refPromises).then(function () {
        return entity;
      });
    });
  };

  /**
   * Returns all referenced sub entities for the given depth and root entity
   * @param {baqend.binding.Entity} entity
   * @param {Boolean|Number} depth
   * @param {baqend.binding.Entity[]} [resolved]
   * @param {baqend.binding.Entity=} initialEntity
   * @returns {baqend.binding.Entity[]}
   */


  EntityManager.prototype.getSubEntities = function getSubEntities(entity, depth, resolved, initialEntity) {
    var _this9 = this;

    resolved = resolved || [];
    if (!depth) {
      return resolved;
    }
    initialEntity = initialEntity || entity;

    var state = Metadata.get(entity);
    for (var _iterator = state.type.references(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var value = _ref;

      this.getSubEntitiesByPath(entity, value.path).forEach(function (subEntity) {
        if (! ~resolved.indexOf(subEntity) && subEntity != initialEntity) {
          resolved.push(subEntity);
          resolved = _this9.getSubEntities(subEntity, depth === true ? depth : depth - 1, resolved, initialEntity);
        }
      });
    }

    return resolved;
  };

  /**
   * Returns all referenced one level sub entities for the given path
   * @param {baqend.binding.Entity} entity
   * @param {Array} path
   * @returns {baqend.binding.Entity[]}
   */


  EntityManager.prototype.getSubEntitiesByPath = function getSubEntitiesByPath(entity, path) {
    var _this10 = this;

    var subEntities = [entity];

    path.forEach(function (attributeName) {

      var tmpSubEntities = [];
      subEntities.forEach(function (subEntity) {
        var curEntity = subEntity[attributeName];
        if (!curEntity) return;

        var attribute = _this10.metamodel.managedType(subEntity.constructor).getAttribute(attributeName);
        if (attribute.isCollection) {
          for (var _iterator2 = curEntity.entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray2) {
              if (_i2 >= _iterator2.length) break;
              _ref2 = _iterator2[_i2++];
            } else {
              _i2 = _iterator2.next();
              if (_i2.done) break;
              _ref2 = _i2.value;
            }

            var entry = _ref2;

            tmpSubEntities.push(entry[1]);
            attribute.keyType && attribute.keyType.isEntity && tmpSubEntities.push(entry[0]);
          }
        } else {
          tmpSubEntities.push(curEntity);
        }
      });
      subEntities = tmpSubEntities;
    });

    return subEntities;
  };

  /**
   * Delete the entity instance.
   * @param {baqend.binding.Entity} entity
   * @param {Object} options The delete options
   * @return {Promise<baqend.binding.Entity>}
   */


  EntityManager.prototype['delete'] = function _delete(entity, options) {
    var _this11 = this;

    options = options || {};

    this.attach(entity);
    var state = Metadata.get(entity);

    return state.withLock(function () {
      if (!state.version && !options.force) throw new error.IllegalEntityError(entity);

      var msg = new message.DeleteObject(state.bucket, state.key);

      if (!options.force) msg.setIfMatch(state.version);

      var refPromises = [_this11._send(msg).then(function () {
        _this11.removeReference(entity);
        state.setRemoved();
        return entity;
      })];

      var subOptions = Object.assign({}, options);
      subOptions.depth = 0;
      _this11.getSubEntities(entity, options.depth).forEach(function (sub) {
        refPromises.push(_this11.delete(sub, subOptions));
      });

      return Promise.all(refPromises).then(function () {
        return entity;
      });
    });
  };

  /**
   * Synchronize the persistence context to the underlying database.
   *
   * @returns {Promise}
   */


  EntityManager.prototype.flush = function flush(doneCallback, failCallback) {}
  // TODO: implement this


  /**
   * Make an instance managed and persistent.
   * @param {baqend.binding.Entity} entity - entity instance
   */
  ;

  EntityManager.prototype.persist = function persist(entity) {
    entity.attach(this);
  };

  /**
   * Refresh the state of the instance from the database, overwriting changes made to the entity, if any.
   * @param {baqend.binding.Entity} entity - entity instance
   * @param {Object} options The refresh options
   * @return {Promise<baqend.binding.Entity>}
   */


  EntityManager.prototype.refresh = function refresh(entity, options) {
    options = options || {};
    options.refresh = true;

    return this.load(entity.id, null, options);
  };

  /**
   * Attach the instance to this database context, if it is not already attached
   * @param {baqend.binding.Entity} entity The entity to attach
   */


  EntityManager.prototype.attach = function attach(entity) {
    if (!this.contains(entity)) {
      var type = this.metamodel.entity(entity.constructor);
      if (!type) throw new error.IllegalEntityError(entity);

      if (this.containsById(entity)) throw new error.EntityExistsError(entity);

      this._attach(entity);
    }
  };

  EntityManager.prototype._attach = function _attach(entity) {
    var metadata = Metadata.get(entity);
    if (metadata.isAttached) {
      if (metadata.db != this) {
        throw new error.EntityExistsError(entity);
      }
    } else {
      metadata.db = this;
    }

    if (!metadata.id) {
      if (metadata.type.name != 'User' && metadata.type.name != 'Role' && metadata.type.name != 'logs.AppLog') {
        metadata.id = '/db/' + metadata.type.name + '/' + util.uuid();
      }
    }

    if (metadata.id) {
      this._entities[metadata.id] = entity;
    }
  };

  EntityManager.prototype.removeReference = function removeReference(entity) {
    var state = Metadata.get(entity);
    if (!state) throw new error.IllegalEntityError(entity);

    delete this._entities[state.id];
  };

  EntityManager.prototype.register = function register(user, password, loginOption) {
    var _this12 = this;

    var login = loginOption > binding.UserFactory.LoginOption.NO_LOGIN;

    if (this.me && login) throw new error.PersistentError('User is already logged in.');

    if (loginOption >= binding.UserFactory.LoginOption.PERSIST_LOGIN && !this.token) this.tokenStorage.update(this._connector.origin, "", true);

    return this.withLock(function () {
      var msg = new message.Register({
        user: user,
        password: password,
        login: login
      });
      return _this12._userRequest(msg, login);
    });
  };

  EntityManager.prototype.login = function login(username, password, loginOption) {
    var _this13 = this;

    if (this.me) throw new error.PersistentError('User is already logged in.');

    if (loginOption >= binding.UserFactory.LoginOption.PERSIST_LOGIN && !this.token) this.tokenStorage.update(this._connector.origin, "", true);

    return this.withLock(function () {
      var msg = new message.Login({
        username: username,
        password: password
      });

      return _this13._userRequest(msg, true);
    });
  };

  EntityManager.prototype.logout = function logout() {
    var _this14 = this;

    return this.withLock(function () {
      return _this14._send(new message.Logout()).then(_this14._logout.bind(_this14));
    });
  };

  EntityManager.prototype.loginWithOAuth = function loginWithOAuth(provider, clientID, options) {
    options = Object.assign({
      title: "Login with " + provider,
      timeout: 5 * 60 * 1000,
      state: {},
      loginOption: true
    }, options);

    if (options.loginOption >= binding.UserFactory.LoginOption.PERSIST_LOGIN && !this.token) this.tokenStorage.update(this._connector.origin, "", true);

    var msg;
    if (Message[provider + 'OAuth']) {
      msg = new Message[provider + 'OAuth'](clientID, options.scope, JSON.stringify(options.state));
    } else {
      throw new Error("Provider not supported.");
    }

    var req = this._userRequest(msg, options.loginOption > binding.UserFactory.LoginOption.NO_LOGIN);
    var w = open(msg.request.path, options.title, 'width=' + options.width + ',height=' + options.height);

    return new Promise(function (resolve, reject) {
      var timeout = setTimeout(function () {
        reject(new error.PersistentError('OAuth login timeout.'));
      }, options.timeout);

      req.then(function (result) {
        clearTimeout(timeout);
        resolve(result);
      }, function (e) {
        clearTimeout(timeout);
        reject(e);
      });
    });
  };

  EntityManager.prototype.renew = function renew() {
    var _this15 = this;

    return this.withLock(function () {
      var msg = new message.Me();
      return _this15._userRequest(msg, true);
    });
  };

  EntityManager.prototype.newPassword = function newPassword(username, password, _newPassword) {
    var _this16 = this;

    return this.withLock(function () {
      var msg = new message.NewPassword({
        username: username,
        password: password,
        newPassword: _newPassword
      });

      return _this16._send(msg).then(function () {
        _this16._updateUser(msg.response.entity);
      });
    });
  };

  EntityManager.prototype._updateUser = function _updateUser(obj, updateMe) {
    var user = this.getReference(obj.id);
    var metadata = Metadata.get(user);
    metadata.setJson(obj);
    metadata.setPersistent();

    if (updateMe) this.me = user;

    return user;
  };

  EntityManager.prototype._logout = function _logout() {
    this.me = null;
    this.tokenStorage.update(this._connector.origin, null);
  };

  EntityManager.prototype._userRequest = function _userRequest(msg, updateMe) {
    var _this17 = this;

    return this._send(msg).then(function () {
      if (msg.response.entity) {
        return _this17._updateUser(msg.response.entity, updateMe);
      }
    }, function (e) {
      if (e.status == StatusCode.OBJECT_NOT_FOUND) {
        if (updateMe) {
          _this17._logout();
        }
        return null;
      } else {
        throw e;
      }
    });
  };

  EntityManager.prototype.registerDevice = function registerDevice(os, token, device) {
    var msg = new message.DeviceRegister({
      token: token,
      devicetype: os,
      device: device
    });

    msg.withCredentials = true;
    return this._send(msg);
  };

  EntityManager.prototype.checkDeviceRegistration = function checkDeviceRegistration() {
    var _this18 = this;

    return this._send(new message.DeviceRegistered()).then(function () {
      return _this18.isDeviceRegistered = true;
    }, function (e) {
      if (e.status == StatusCode.OBJECT_NOT_FOUND) {
        return _this18.isDeviceRegistered = false;
      } else {
        throw e;
      }
    });
  };

  EntityManager.prototype.pushDevice = function pushDevice(pushMessage) {
    return this._send(new message.DevicePush(pushMessage));
  };

  /**
   * The given entity will be checked by the validation code of the entity type.
   *
   * @param {baqend.binding.Entity} entity
   * @returns {baqend.util.ValidationResult} result
   */


  EntityManager.prototype.validate = function validate(entity) {
    var type = Metadata.get(entity).type;

    var result = new util.ValidationResult();
    for (var iter = type.attributes(), item; !(item = iter.next()).done;) {
      var validate = new util.Validator(item.value.name, entity);
      result.fields[validate.key] = validate;
    }

    var validationCode = type.validationCode;
    if (validationCode) {
      validationCode(result.fields);
    }

    return result;
  };

  EntityManager.prototype.refreshBloomFilter = function refreshBloomFilter() {
    var msg = new message.GetBloomFilter();
    return this._send(msg).then(function (message) {
      return new BloomFilter(message.response.entity);
    });
  };

  return EntityManager;
}(util.Lockable);

/**
 * Creates a new List collection
 * @function
 * @param {...*} arguments Same arguments can be passed as the Array constructor takes
 * @return {Array<*>} The new created List
 */


EntityManager.prototype.List = Array;

/**
 * Creates a new Set collection
 * @function
 * @param {Iterable<*>=} collection The initial array or collection to initialize the new Set
 * @return {Set} The new created Set
 */
EntityManager.prototype.Set = Set;

/**
 * Creates a new Map collection
 * @function
 * @param {Iterable<*>=} collection The initial array or collection to initialize the new Map
 * @return {Map} The new created Map
 */
EntityManager.prototype.Map = Map;

/**
 * Creates a new GeoPoint
 * @function
 * @param {String|Number|Object|Array=} latitude A coordinate pair (latitude first), a GeoPoint like object or the GeoPoint's latitude
 * @param {Number=} longitude The GeoPoint's longitude
 * @return {baqend.collection.GeoPoint} The new created GeoPoint
 */
EntityManager.prototype.GeoPoint = _dereq_(4);

/**
 * An User factory for user objects.
 * The User factory can be called to create new instances of users or can be used to register/login/logout users.
 * The created instances implements the {@link baqend.binding.User} interface
 * @type baqend.binding.UserFactory
 */
EntityManager.prototype.User = null;

/**
 * An Device factory for user objects.
 * The Device factory can be called to create new instances of devices or can be used to register, push to and
 * check registration status of devices.
 * @type baqend.binding.DeviceFactory
 */
EntityManager.prototype.Device = null;

/**
 * An Object factory for embeddable objects,
 * that can be accessed by the type name of the embeddable type.
 * An object factory can be called to create new instances of the type.
 * The created instances implements the {@link baqend.binding.Managed} interface
 * @name &lt;<i>YourEmbeddableClass</i>&gt;
 * @memberOf baqend.EntityManager.prototype
 * @type {baqend.binding.ManagedFactory}
 */

/**
 * An Object factory for entity objects,
 * that can be accessed by the type name of the entity type.
 * An object factory can be called to create new instances of the type.
 * The created instances implements the {@link baqend.binding.Entity} interface
 * @name &lt;<i>YourEntityClass</i>&gt;
 * @memberOf baqend.EntityManager.prototype
 * @type {baqend.binding.EntityFactory}
 */

/**
 * An Role factory for role objects.
 * The Role factory can be called to create new instances of roles.
 * The created instances implements the {@link baqend.binding.Role} interface
 * @name Role
 * @memberOf baqend.EntityManager.prototype
 * @type baqend.binding.EntityFactory
 */

module.exports = EntityManager;

},{"17":17,"18":18,"22":22,"3":3,"31":31,"32":32,"4":4,"5":5,"53":53,"60":60}],2:[function(_dereq_,module,exports){
"use strict";

var message = _dereq_(32);
var metamodel = _dereq_(48);

var util = _dereq_(60);
var Connector = _dereq_(20);
var EntityManager = _dereq_(1);

/**
 * @alias baqend.EntityManagerFactory
 * @extends baqend.util.Lockable
 */

var EntityManagerFactory = function (_util$Lockable) {
  babelHelpers.inherits(EntityManagerFactory, _util$Lockable);

  EntityManagerFactory.prototype._connected = function _connected() {};

  /**
   * Creates a new EntityManagerFactory connected to the given destination
   * @param {String|Object} [options] The baqend destination to connect with, or an options object
   * @param {String} [options.host] The baqend destination to connect with
   * @param {Number} [options.port=80|443] The optional baqend destination port to connect with
   * @param {Boolean} [options.secure=false] <code>true</code> To use a secure ssl encrypted connection
   * @param {String} [options.basePath="/v1"] The base path of the baqend api
   * @param {Object} [options.schema=null] The serialized schema as json used to initialize the metamodel
   * @param {Boolean} [options.global=false] <code>true</code> To create the emf for the global DB
   */


  function EntityManagerFactory(options) {
    babelHelpers.classCallCheck(this, EntityManagerFactory);

    var _this = babelHelpers.possibleConstructorReturn(this, _util$Lockable.call(this));

    options = Object(options) instanceof String ? { host: options } : options || {};

    /** @type baqend.connector.Connector */
    _this._connector = null;
    /** @type baqend.metamodel.Metamodel */
    _this.metamodel = _this.createMetamodel();
    /** @type baqend.util.Code */
    _this.code = new util.Code(_this.metamodel, _this);
    /** @type baqend.util.TokenStorage */
    _this.tokenStorage = options.tokenStorage || util.TokenStorage.WEB_STORAGE || util.TokenStorage.GLOBAL;

    var isReady = true;
    var ready = new Promise(function (success) {
      _this._connected = success;
    });

    if (options.host) {
      _this.connect(options.host, options.port, options.secure, options.basePath);
    } else {
      isReady = false;
    }

    if (options.schema) {
      _this._connectData = options;
      _this.metamodel.init(options.schema);
    } else {
      isReady = false;
      ready = ready.then(function () {
        var msg = new message.Connect();
        msg.withCredentials = true; //used for registered devices
        return _this.send(msg);
      }).then(function (data) {
        _this._connectData = data.response.entity;

        if (!_this.metamodel.isInitialized) _this.metamodel.init(_this._connectData.schema);

        _this.tokenStorage.update(_this._connector.origin, _this._connectData.token);
      });
    }

    if (!isReady) {
      _this.withLock(function () {
        return ready;
      }, true);
    }
    return _this;
  }

  /**
   * Connects this EntityManager to the given destination
   * @param {String} hostOrApp The host or the app name to connect with
   * @param {Number} [port=80|443] The port to connect to
   * @param {Boolean} [secure=false] <code>true</code> To use a secure connection
   * @param {String} [basePath="/v1"] The base path of the baqend api
   */


  EntityManagerFactory.prototype.connect = function connect(hostOrApp, port, secure, basePath) {
    if (this._connector) throw new Error('The EntityManagerFactory is already connected.');

    if (Object(port) instanceof Boolean) {
      secure = port;
      port = 0;
    }

    this._connector = Connector.create(hostOrApp, port, secure, basePath);

    this._connected();
    return this.ready();
  };

  /**
   * Creates a new Metamodel instance, which is not connected
   * @return {baqend.metamodel.Metamodel} A new Metamodel instance
   */


  EntityManagerFactory.prototype.createMetamodel = function createMetamodel() {
    return new metamodel.Metamodel(this);
  };

  /**
   * Create a new application-managed EntityManager.
   *
   * @param {Boolean|baqend.util.TokenStorage=} tokenStorage The token storage to persist the authorization token, or
   * <code>true</code> To use the the global token storage for authorization tokens.
   * <code>false</code> To not use any token storage.
   *
   * @returns {baqend.EntityManager} a new entityManager
   */


  EntityManagerFactory.prototype.createEntityManager = function createEntityManager(tokenStorage) {
    var _this2 = this;

    var em = new EntityManager(this, tokenStorage === true ? this.tokenStorage : tokenStorage || new util.TokenStorage());

    if (this.isReady) {
      em.connected(this._connector, this._connectData);
    } else {
      em.withLock(function () {
        return _this2.ready().then(function () {
          em.connected(_this2._connector, _this2._connectData);
        });
      }, true);
    }

    return em;
  };

  EntityManagerFactory.prototype.send = function send(message) {
    if (!message.tokenStorage) message.tokenStorage = this.tokenStorage;
    return this._connector.send(message);
  };

  return EntityManagerFactory;
}(util.Lockable);

module.exports = EntityManagerFactory;

},{"1":1,"20":20,"32":32,"48":48,"60":60}],3:[function(_dereq_,module,exports){
"use strict";

var message = _dereq_(32);
var error = _dereq_(31);

/**
 * @alias baqend.EntityTransaction
 */

var EntityTransaction = function () {
	babelHelpers.createClass(EntityTransaction, [{
		key: 'isActive',


		/**
   * Indicate whether a resource transaction is in progress. 
   * @returns {Boolean} indicating whether transaction is in progress 
  	 */
		get: function get() {
			return Boolean(this.tid);
		}

		/**
   * @param {baqend.EntityManager} entityManager
   */

	}]);

	function EntityTransaction(entityManager) {
		babelHelpers.classCallCheck(this, EntityTransaction);

		this._connector = entityManager.connector;
		this.entityManager = entityManager;

		this.tid = null;
		this.rollbackOnly = false;

		this.readSet = null;
		this.changeSet = null;
	}

	/**
  * Start a resource transaction.
  */


	EntityTransaction.prototype.begin = function begin(doneCallback, failCallback) {
		return this.yield().then(function () {
			var result = this.send(new message.PostTransaction()).done(function (msg) {
				this.tid = msg.tid;

				this.rollbackOnly = false;
				this.readSet = {};
				this.changeSet = {};
			});

			return this.wait(result);
		}).then(doneCallback, failCallback);
	};

	/**
  * Commit the current resource transaction, writing any unflushed changes to the database. 
  */


	EntityTransaction.prototype.commit = function commit(doneCallback, failCallback) {
		return this.yield().then(function () {
			if (this.getRollbackOnly()) {
				return this.rollback().then(function () {
					throw new error.RollbackError();
				});
			} else {
				return this.wait(this.entityManager.flush()).then(function () {
					var readSet = [];
					for (var ref in this.readSet) {
						readSet.push({
							"oid": ref,
							"version": this.readSet[ref]
						});
					}

					var result = this.send(new message.PutTransactionCommitted(this.tid, readSet));

					return this.wait(result).then(function (msg) {
						this.tid = null;
						this.readSet = null;
						this.changeSet = null;

						var oids = msg.oids;
						for (var oid in oids) {
							var version = oids[oid];
							var entity = this.entityManager.entities[oid];

							if (entity) {
								var state = util.Metadata.get(entity);
								if (version == 'DELETED' || state.isDeleted) {
									this.entityManager.removeReference(entity);
								} else {
									state.setJsonValue(state.type.version, version);
								}
							}
						}
					});
				});
			}
		}).then(doneCallback, failCallback);
	};

	/**
  * Determine whether the current resource transaction has been marked for rollback. 
  * @returns {Boolean} indicating whether the transaction has been marked for rollback 
  */


	EntityTransaction.prototype.getRollbackOnly = function getRollbackOnly() {
		return this.rollbackOnly;
	};

	/**
  * Roll back the current resource transaction. 
  */


	EntityTransaction.prototype.rollback = function rollback(doneCallback, failCallback) {
		return this.yield().then(function () {
			var result = this.send(new message.PutTransactionAborted(this.tid));

			this.wait(result).then(function () {
				this.tid = null;
				this.readSet = null;
				this.changeSet = null;
				return this.entityManager.clear();
			}, function () {
				return this.entityManager.clear();
			});
		}).then(doneCallback, failCallback);
	};

	/**
  * Mark the current resource transaction so that the only possible outcome of the transaction is for the transaction to be rolled back. 
  */


	EntityTransaction.prototype.setRollbackOnly = function setRollbackOnly(context, onSuccess) {
		return this.yield().done(function () {
			this.rollbackOnly = true;
		});
	};

	EntityTransaction.prototype.isRead = function isRead(identifier) {
		return this.isActive && identifier in this.readSet;
	};

	EntityTransaction.prototype.setRead = function setRead(identifier, version) {
		if (this.isActive && !this.isChanged(identifier)) {
			this.readSet[identifier] = version;
		}
	};

	EntityTransaction.prototype.isChanged = function isChanged(identifier) {
		return this.isActive && identifier in this.changeSet;
	};

	EntityTransaction.prototype.setChanged = function setChanged(identifier) {
		if (this.isActive) {
			delete this.readSet[identifier];
			this.changeSet[identifier] = true;
		}
	};

	return EntityTransaction;
}();

module.exports = EntityTransaction;

},{"31":31,"32":32}],4:[function(_dereq_,module,exports){
"use strict";

/**
 * Creates a new GeoPoint instance
 * From latitude and longitude
 * From a json object
 * Or an tuple of latitude and longitude
 *
 * @alias baqend.GeoPoint
 */

var GeoPoint = function () {

  /**
   * Creates a GeoPoint with the user's current location, if available.
   * @return {Promise<baqend.GeoPoint>} A promise that will be resolved with a GeoPoint
   */

  GeoPoint.current = function current() {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(function (location) {
        resolve(new GeoPoint(location.coords.latitude, location.coords.longitude));
      }, function (error) {
        reject(error);
      });
    });
  };

  /**
   * @param {String|Number|Object|Array=} latitude A coordinate pair (latitude first), a GeoPoint like object or the GeoPoint's latitude
   * @param {Number=} longitude The GeoPoint's longitude
   */


  function GeoPoint(latitude, longitude) {
    babelHelpers.classCallCheck(this, GeoPoint);

    if (Object(latitude) instanceof String) {
      var index = latitude.indexOf(';');
      this.latitude = latitude.substring(0, index);
      this.longitude = latitude.substring(index + 1);
    } else if (Object(latitude) instanceof Number) {
      this.latitude = latitude;
      this.longitude = longitude;
    } else if (Object(latitude) instanceof Array) {
      this.latitude = latitude[0];
      this.longitude = latitude[1];
    } else if (latitude instanceof Object) {
      this.latitude = latitude.latitude;
      this.longitude = latitude.longitude;
    } else {
      this.latitude = 0;
      this.longitude = 0;
    }

    if (this.latitude < -90 || this.latitude > 90) {
      throw new Error("Latitude " + this.latitude + " is not in bound of -90 <= latitude <= 90");
    }

    if (this.longitude < -180 || this.longitude > 180) {
      throw new Error("Longitude " + this.longitude + " is not in bound of -180 <= longitude <= 180");
    }
  }

  /**
   * Returns the distance from this GeoPoint to another in kilometers.
   * @param {baqend.GeoPoint} point another GeoPoint
   * @return {Number} The distance in kilometers
   *
   * @see baqend.GeoPoint#radiansTo
   */


  GeoPoint.prototype.kilometersTo = function kilometersTo(point) {
    return Number((GeoPoint.EARTH_RADIUS_IN_KILOMETERS * this.radiansTo(point)).toFixed(3));
  };

  /**
   * Returns the distance from this GeoPoint to another in miles.
   * @param {baqend.GeoPoint} point another GeoPoint
   * @return {Number} The distance in miles
   *
   * @see baqend.GeoPoint#radiansTo
   */


  GeoPoint.prototype.milesTo = function milesTo(point) {
    return Number((GeoPoint.EARTH_RADIUS_IN_MILES * this.radiansTo(point)).toFixed(3));
  };

  /**
   * Computes the arc, in radian, between two WGS-84 positions.
   *
   * The haversine formula implementation is taken from:
   * {@link http://www.movable-type.co.uk/scripts/latlong.html}
   *
   * Returns the distance from this GeoPoint to another in radians.
   * @param {baqend.GeoPoint} point another GeoPoint
   * @return {Number} the arc, in radian, between two WGS-84 positions
   *
   * @see http://en.wikipedia.org/wiki/Haversine_formula
   */


  GeoPoint.prototype.radiansTo = function radiansTo(point) {
    var from = this,
        to = point;
    var rad1 = from.latitude * GeoPoint.DEG_TO_RAD,
        rad2 = to.latitude * GeoPoint.DEG_TO_RAD,
        dLng = (to.longitude - from.longitude) * GeoPoint.DEG_TO_RAD;

    return Math.acos(Math.sin(rad1) * Math.sin(rad2) + Math.cos(rad1) * Math.cos(rad2) * Math.cos(dLng));
  };

  /**
   * A String representation in latitude, longitude format
   * @return {String} The string representation of this class
   */


  GeoPoint.prototype.toString = function toString() {
    return this.latitude + ';' + this.longitude;
  };

  /**
   * Returns a JSON representation of the GeoPoint
   * @return {Object} A GeoJson object of this GeoPoint
   */


  GeoPoint.prototype.toJSON = function toJSON() {
    return { latitude: this.latitude, longitude: this.longitude };
  };

  return GeoPoint;
}();

GeoPoint.DEG_TO_RAD = Math.PI / 180;

/**
 * The Earth radius in kilometers used by {@link baqend.GeoPoint#kilometersTo}
 * @type {Number}
 */
GeoPoint.EARTH_RADIUS_IN_KILOMETERS = 6371;

/**
 * The Earth radius in miles used by {@link baqend.GeoPoint#milesTo}
 * @type {Number}
 */
GeoPoint.EARTH_RADIUS_IN_MILES = 3956;

module.exports = GeoPoint;

},{}],5:[function(_dereq_,module,exports){
"use strict";

var message = _dereq_(32);
var Metadata = _dereq_(53);
var Entity = _dereq_(10);

/**
 * @alias baqend.Query
 */

var Query = function () {
  function Query(entityManager, resultClass) {
    babelHelpers.classCallCheck(this, Query);

    /**
     * The owning EntityManager of this query
     * @type baqend.EntityManager
     */
    this.entityManager = entityManager;

    /**
     * The result class of this query
     * @type Function
     */
    this.resultClass = resultClass;
  }

  /**
   * Add an ascending sort for the specified field to this query
   * @param field The field to sort
   * @return {baqend.Query} The resulting Query
   */


  Query.prototype.ascending = function ascending(field) {
    return this._addOrder(field, 1);
  };

  /**
   * Add an decending sort for the specified field to this query
   * @param field The field to sort
   * @return {baqend.Query} The resulting Query
   */


  Query.prototype.descending = function descending(field) {
    return this._addOrder(field, -1);
  };

  /**
   * Sets the sort of the query and discard all existing paramaters
   * @param {Object} sort The new sort of the query
   * @return {baqend.Query} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/method/cursor.sort/
   */


  Query.prototype.sort = function sort(_sort) {
    if (!(_sort instanceof Object) || Object.getPrototypeOf(_sort) != Object.prototype) throw new Error('sort must be an object.');

    return this._addOrder(_sort);
  };

  /**
   * Sets the offset of the query, i.e. how many elements should be skipped
   * @param offset The offset of this query
   * @return {baqend.Query} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/method/cursor.skip/
   */


  Query.prototype.offset = function offset(_offset) {
    if (_offset < 0) throw new Error("The offset can't be nagative.");

    return this._addOffset(_offset);
  };

  /**
   * Sets the limit of this query, i.e hox many objects should be returnd
   * @param limit The limit of this query
   * @return {baqend.Query} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/method/cursor.limit/
   */


  Query.prototype.limit = function limit(_limit) {
    if (_limit < 0) throw new Error("The limit can't be nagative.");

    return this._addLimit(_limit);
  };

  /**
   * Execute the query and return the query results as a List.
   * Note: All local unsaved changes on matching objects, will be discarded.
   * @param {Object} [options] The query options
   * @param {Number|Boolean} [options.depth=0] The object depth which will be loaded. Depth 0 load only the found
   * objects, <code>true</code> loads the objects by reachability.
   * @param {Function=} doneCallback Called when the operation succeed.
   * @param {Function=} failCallback Called when the operation failed.
   * @return {Promise<Array<baqend.binding.Entity>>} A promise that will be resolved with the query result as a list
   */


  Query.prototype.resultList = function resultList(options, doneCallback, failCallback) {};

  /**
   * Execute the query that returns a single result.
   * Note: All local unsaved changes on the matched object, will be discarded.
   * @param {Object} [options] The query options
   * @param {Number|Boolean} [options.depth=0] The object depth which will be loaded. Depth 0 load only the found
   * object, <code>true</code> loads the objects by reachability.
   * @param {Function=} doneCallback Called when the operation succeed.
   * @param {Function=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.Entity>} A promise that will be resolved with the query result as a single result
   */


  Query.prototype.singleResult = function singleResult(options, doneCallback, failCallback) {};

  Query.prototype.stream = function stream(fetchQuery) {};

  /**
   * Execute the query that returns the matching objects count.
   * @return {Promise<Number>} The total number of matched objects
   */


  Query.prototype.count = function count(doneCallback, failCallback) {};

  return Query;
}();

Query.MAX_URI_SIZE = 2000;

/**
 * @class baqend.Query.Condition
 */
Query.Condition = /** @lends baqend.Query.Condition.prototype */{

  /**
   * An object, that contains filter rules which will be merged with the current filters of this query.
   * @param {Object} conditions - Additional filters for this query
   * @return {baqend.Query.Condition} The resulting Query
   */

  where: function where(conditions) {
    return this._addFilter(null, null, conditions);
  },


  /**
   * Adds a equal filter to the field. All other other filters on the field will be discarded
   * @param {String} field The field to filter
   * @param {*} value The value used to filter
   * @return {baqend.Query.Condition} The resulting Query
   */
  equal: function equal(field, value) {
    return this._addFilter(field, null, value);
  },


  /**
   * Adds a not equal filter to the field.
   * @param {String} field The field to filter
   * @param {*} value The value used to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/nin/
   */
  notEqual: function notEqual(field, value) {
    return this._addFilter(field, "$ne", value);
  },


  /**
   * Adds a greater than filter to the field.
   * @param {String} field The field to filter
   * @param {Number|String|Date} value The value used to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/gt/
   */
  greaterThan: function greaterThan(field, value) {
    return this._addFilter(field, "$gt", value);
  },


  /**
   * Adds a greater than or equal to filter to the field.
   * @param {String} field The field to filter
   * @param {Number|String|Date} value The value used to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/gte/
   */
  greaterThanOrEqualTo: function greaterThanOrEqualTo(field, value) {
    return this._addFilter(field, "$gte", value);
  },


  /**
   * Adds a less than filter to the field.
   * @param {String} field The field to filter
   * @param {Number|String|Date} value The value used to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/lt/
   */
  lessThan: function lessThan(field, value) {
    return this._addFilter(field, "$lt", value);
  },


  /**
   * Adds a less than or equal to filter to the field.
   * @param {String} field The field to filter
   * @param {Number|String|Date} value The value used to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/lte/
   */
  lessThanOrEqualTo: function lessThanOrEqualTo(field, value) {
    return this._addFilter(field, "$lte", value);
  },


  /**
   * Adds a between filter to the field. This is a shorthand for an less than and greater than filter.
   * @param {String} field The field to filter
   * @param {Number|String|Date} lessValue The field value must be greater than this value
   * @param {Number|String|Date} greaterValue The field value must be less than this value
   * @return {baqend.Query.Condition} The resulting Query
   */
  between: function between(field, lessValue, greaterValue) {
    return this._addFilter(field, "$gt", lessValue)._addFilter(field, "$lt", greaterValue);
  },


  /**
   * Adds a in filter to the field. The field value must be equal to one of the given values
   * @param {String} field The field to filter
   * @param {*|Array<*>} args... The field value or values to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/in/
   */
  'in': function _in(field, args) {
    return this._addFilter(field, "$in", varargs(1, arguments));
  },


  /**
   * Adds a not in filter to the field. The field value must not be equal to any of the given values
   * @param {String} field The field to filter
   * @param {*|Array<*>} args... The field value or values to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/nin/
   */
  notIn: function notIn(field, args) {
    return this._addFilter(field, "$nin", varargs(1, arguments));
  },


  /**
   * Adds a null filter to the field. The field value must be null
   * @param {String} field The field to filter
   * @return {baqend.Query.Condition} The resulting Query
   */
  isNull: function isNull(field) {
    return this.equal(field, null);
  },


  /**
   * Adds a not null filter to the field. The field value must not be null
   * @param {String} field The field to filter
   * @return {baqend.Query.Condition} The resulting Query
   */
  isNotNull: function isNotNull(field) {
    return this._addFilter(field, "$exists", true)._addFilter(field, "$ne", null);
  },


  /**
   * Adds a contains all filter to the collection field. The collection must contain all the given values.
   * @param {String} field The field to filter
   * @param {*|Array<*>} args... The field value or values to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/all/
   */
  containsAll: function containsAll(field, args) {
    return this._addFilter(field, "$all", varargs(1, arguments));
  },


  /**
   * Adds a modulo filter to the field. The field value divided by divisor must be equal to the remainder.
   * @param {String} field The field to filter
   * @param {Number} divisor The divisor of the modulo filter
   * @param {Number} remainder The remainder of the modulo filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/mod/
   */
  mod: function mod(field, divisor, remainder) {
    return this._addFilter(field, "$mod", [divisor, remainder]);
  },


  /**
   * Adds a regular expression filter to the field. The field value must matches the regular expression.
   * <p>Note: Only anchored expressions (Expressions that starts with an ^) and the multiline flag are supported.</p>
   * @param {String} field The field to filter
   * @param {String|RegExp} regExp The regular expression of the filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/regex/
   */
  matches: function matches(field, regExp) {
    if (!(Object(regExp) instanceof RegExp)) {
      regExp = new RegExp(regExp);
    }

    if (regExp.ignoreCase) {
      throw new Error('RegExp.ignoreCase flag is not supported.');
    }

    if (regExp.global) {
      throw new Error('RegExp.global flag is not supported.');
    }

    if (regExp.source.indexOf('^') != 0) {
      throw new Error('regExp must be an anchored expression, i.e. it must be started with a ^.');
    }

    var result = this._addFilter(field, '$regex', regExp.source);
    if (regExp.multiline) {
      result._addFilter(field, '$options', 'm');
    }

    return result;
  },


  /**
   * Adds a size filter to the collection field. The collection must have exactly size members.
   * @param {String} field The field to filter
   * @param {Number} size The collections size to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/size/
   */
  size: function size(field, _size) {
    return this._addFilter(field, "$size", _size);
  },


  /**
   * Adds a geopoint based near filter to the GeoPoint field. The GeoPoint must be within the maximum distance
   * to the given GeoPoint. Returns from nearest to farthest.
   * @param {String} field The field to filter
   * @param {baqend.GeoPoint} geoPoint The GeoPoint to filter
   * @param {Number} maxDistance Tha maximum distance to filter in meters
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/nearSphere/
   */
  near: function near(field, geoPoint, maxDistance) {
    return this._addFilter(field, "$nearSphere", {
      $geometry: {
        type: "Point",
        coordinates: [geoPoint.longitude, geoPoint.latitude]
      },
      $maxDistance: maxDistance
    });
  },


  /**
   * Adds a GeoPoint based polygon filter to the GeoPoint field. The GeoPoint must be contained within the polygon.
   * @param {String} field The field to filter
   * @param {baqend.GeoPoint|Array<baqend.GeoPoint>} geoPoints... The geoPoints that describes the polygon of the filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/geoWithin/
   */
  withinPolygon: function withinPolygon(field, geoPoints) {
    geoPoints = varargs(1, arguments);
    return this._addFilter(field, "$geoWithin", {
      $geometry: {
        type: "Polygon",
        coordinates: [geoPoints.map(function (geoPoint) {
          return [geoPoint.longitude, geoPoint.latitude];
        })]
      }
    });
  }
};

// aliases
Object.assign(Query.Condition, /** @lends baqend.Query.Condition.prototype */{
  /**
   * Adds a less than filter to the field. Shorthand for {@link baqend.Query.Condition#lessThan}.
   * @method
   * @param {String} field The field to filter
   * @param {Number|String|Date} value The value used to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/lt/
   */
  lt: Query.Condition.lessThan,

  /**
   * Adds a less than or equal to filter to the field. Shorthand for {@link baqend.Query.Condition#lessThanOrEqualTo}.
   * @method
   * @param {String} field The field to filter
   * @param {Number|String|Date} value The value used to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/lte/
   */
  le: Query.Condition.lessThanOrEqualTo,

  /**
   * Adds a greater than filter to the field. Shorthand for {@link baqend.Query.Condition#greaterThan}.
   * @method
   * @param {String} field The field to filter
   * @param {Number|String|Date} value The value used to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/gt/
   */
  gt: Query.Condition.greaterThan,

  /**
   * Adds a greater than or equal to filter to the field. Shorthand for {@link baqend.Query.Condition#greaterThanOrEqualTo}.
   * @method
   * @param {String} field The field to filter
   * @param {Number|String|Date} value The value used to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/gte/
   */
  ge: Query.Condition.greaterThanOrEqualTo,

  /**
   * Adds a contains any filter to the collection field. The collection must contains one the given values.
   * Alias for {@link baqend.Query.Condition#in}
   * @method
   * @param {String} field The field to filter
   * @param {*|Array<*>} args... The field value or values to filter
   * @return {baqend.Query.Condition} The resulting Query
   *
   * @see http://docs.mongodb.org/manual/reference/operator/query/in/
   */
  containsAny: Query.Condition.in
});

/**
 * @alias baqend.Query.Node
 * @extends baqend.Query
 */

var Node = function (_Query) {
  babelHelpers.inherits(Node, _Query);


  /**
   * @param {baqend.EntityManager} entityManager The owning entity manager of this query
   * @param {Function} resultClass The query result class
   */

  function Node(entityManager, resultClass) {
    babelHelpers.classCallCheck(this, Node);


    /**
     * The offset how many results should be skipped
     * @type Number
     */

    var _this = babelHelpers.possibleConstructorReturn(this, _Query.call(this, entityManager, resultClass));

    _this.firstResult = 0;

    /**
     * The limit how many objects should be returned
     * @type Number
     */
    _this.maxResults = -1;

    _this._sort = {};
    return _this;
  }

  /**
   * @inheritDoc
   */


  Node.prototype.stream = function stream(fetchQuery) {
    var type = this.resultClass ? this.entityManager.metamodel.entity(this.resultClass) : null;
    if (!type) {
      throw new Error('Only typed queries can be executed.');
    }

    if (fetchQuery === undefined) fetchQuery = true;

    var sort = this._serializeSort();

    return new Query.Stream(this.entityManager, type.name, this._serializeQuery(), fetchQuery, sort, this.maxResults);
  };

  /**
   * @inheritDoc
   */


  Node.prototype.resultList = function resultList(options, doneCallback, failCallback) {
    var _this2 = this;

    if (options instanceof Function) {
      failCallback = doneCallback;
      doneCallback = options;
      options = {};
    }

    var type = this.resultClass ? this.entityManager.metamodel.entity(this.resultClass) : null;

    if (!type) {
      throw new Error('Only typed queries can be executed.');
    }

    var query = this._serializeQuery();
    var sort = this._serializeSort();

    var uriSize = this.entityManager._connector.host.length + query.length;
    var msg;
    if (uriSize > Query.MAX_URI_SIZE) {
      msg = new message.AdhocQueryPOST(type.name, this.firstResult, this.maxResults, sort, query);
    } else {
      msg = new message.AdhocQuery(type.name, query, this.firstResult, this.maxResults, sort);
    }

    return this.entityManager._send(msg).then(function () {
      return _this2._createResultList(msg.response.entity, options);
    }).then(doneCallback, failCallback);
  };

  /**
   * @inheritDoc
   */


  Node.prototype.singleResult = function singleResult(options, doneCallback, failCallback) {
    var _this3 = this;

    if (options instanceof Function) {
      failCallback = doneCallback;
      doneCallback = options;
      options = {};
    }

    var type = this.resultClass ? this.entityManager.metamodel.entity(this.resultClass) : null;

    if (!type) {
      throw new Error('Only typed queries can be executed.');
    }

    var query = this._serializeQuery();
    var sort = this._serializeSort();

    var uriSize = this.entityManager._connector.host.length + query.length;
    var msg;
    if (uriSize > Query.MAX_URI_SIZE) {
      msg = new message.AdhocQueryPOST(type.name, query, this.firstResult, 1, sort, query);
    } else {
      msg = new message.AdhocQuery(type.name, query, this.firstResult, 1, sort);
    }

    return this.entityManager._send(msg).then(function () {
      return _this3._createResultList(msg.response.entity, options);
    }).then(function (list) {
      return list.length ? list[0] : null;
    }).then(doneCallback, failCallback);
  };

  /**
   * @inheritDoc
   */


  Node.prototype.count = function count(doneCallback, failCallback) {
    var type = this.resultClass ? this.entityManager.metamodel.entity(this.resultClass) : null;

    if (!type) {
      throw new Error('Only typed queries can be executed.');
    }

    var query = this._serializeQuery();

    var uriSize = this.entityManager._connector.host.length + query.length;
    var msg;
    if (uriSize > Query.MAX_URI_SIZE) {
      msg = new message.AdhocCountQueryPOST(type.name, query);
    } else {
      msg = new message.AdhocCountQuery(type.name, query);
    }

    return this.entityManager._send(msg).then(function () {
      return msg.response.entity.count;
    }).then(doneCallback, failCallback);
  };

  Node.prototype._serializeQuery = function _serializeQuery() {
    return JSON.stringify(this, function (k, v) {
      var typedValue = this[k];
      if (Object(typedValue) instanceof Date) {
        return { $date: v };
      } else if (typedValue instanceof Entity) {
        return typedValue.id;
      } else {
        return v;
      }
    });
  };

  Node.prototype._serializeSort = function _serializeSort() {
    return JSON.stringify(this._sort);
  };

  Node.prototype._createResultList = function _createResultList(result, options) {
    if (result.length) {
      return Promise.all(result.map(function (el) {
        if (el.id) {
          var entity = this.entityManager.getReference(this.resultClass, el.id);
          var metadata = Metadata.get(entity);
          metadata.setJson(el);
          metadata.setPersistent();
          return this.entityManager.resolveDepth(entity, options);
        } else {
          return this.entityManager.load(Object.keys(el)[0]);
        }
      }, this)).then(function (result) {
        return result.filter(function (val) {
          return !!val;
        });
      });
    } else {
      return Promise.resolve([]);
    }
  };

  Node.prototype._addOrder = function _addOrder(fieldOrSort, order) {
    if (order) {
      this._sort[fieldOrSort] = order;
    } else {
      this._sort = fieldOrSort;
    }
    return this;
  };

  Node.prototype._addOffset = function _addOffset(offset) {
    this.firstResult = offset;
    return this;
  };

  Node.prototype._addLimit = function _addLimit(limit) {
    this.maxResults = limit;
    return this;
  };

  return Node;
}(Query);

Query.Node = Node;

/**
 * @alias baqend.Query.Builder
 * @extends baqend.Query.Condition
 */

var Builder = function (_Query2) {
  babelHelpers.inherits(Builder, _Query2);


  /**
   * @param {baqend.EntityManager} entityManager The owning entity manager of this query
   * @param {Function} resultClass The query result class
   */

  function Builder(entityManager, resultClass) {
    babelHelpers.classCallCheck(this, Builder);
    return babelHelpers.possibleConstructorReturn(this, _Query2.call(this, entityManager, resultClass));
  }

  /**
   * Joins the conditions by an logical AND
   * @param {baqend.Query} args... The query nodes to join
   * @return {baqend.Query} Returns a new query which joins the given queries by a logical AND
   */


  Builder.prototype.and = function and(args) {
    return this._addOperator('$and', varargs(0, arguments));
  };

  /**
   * Joins the conditions by an logical OR
   * @param {baqend.Query} args... The query nodes to join
   * @return {baqend.Query} Returns a new query which joins the given queries by a logical OR
   */


  Builder.prototype.or = function or(args) {
    return this._addOperator('$or', varargs(0, arguments));
  };

  /**
   * Joins the conditions by an logical NOR
   * @param {baqend.Query} args... The query nodes to join
   * @return {baqend.Query} Returns a new query which joins the given queries by a logical NOR
   */


  Builder.prototype.nor = function nor(args) {
    return this._addOperator('$nor', varargs(0, arguments));
  };

  /**
   * @inheritDoc
   */


  Builder.prototype.stream = function stream(fetchQuery) {
    return this.where({}).stream(fetchQuery);
  };

  /**
   * @inheritDoc
   */


  Builder.prototype.resultList = function resultList(options, doneCallback, failCallback) {
    return this.where({}).resultList(options, doneCallback, failCallback);
  };

  /**
   * @inheritDoc
   */


  Builder.prototype.singleResult = function singleResult(options, doneCallback, failCallback) {
    return this.where({}).singleResult(options, doneCallback, failCallback);
  };

  /**
   * @inheritDoc
   */


  Builder.prototype.count = function count(doneCallback, failCallback) {
    return this.where({}).count(doneCallback, failCallback);
  };

  Builder.prototype._addOperator = function _addOperator(operator, args) {
    if (args.length < 2) {
      throw new Error('Only two or more queries can be joined with an ' + operator + ' operator.');
    }

    args.forEach(function (arg, index) {
      if (!(arg instanceof Query)) {
        throw new Error('Argument at index ' + index + ' is not a Query.');
      }
    });

    return new Query.Operator(this.entityManager, this.resultClass, operator, args);
  };

  Builder.prototype._addOrder = function _addOrder(fieldOrSort, order) {
    return new Query.Filter(this.entityManager, this.resultClass)._addOrder(fieldOrSort, order);
  };

  Builder.prototype._addFilter = function _addFilter(field, filter, value) {
    return new Query.Filter(this.entityManager, this.resultClass)._addFilter(field, filter, value);
  };

  Builder.prototype._addOffset = function _addOffset(offset) {
    return new Query.Filter(this.entityManager, this.resultClass)._addOffset(offset);
  };

  Builder.prototype._addLimit = function _addLimit(limit) {
    return new Query.Filter(this.entityManager, this.resultClass)._addLimit(limit);
  };

  return Builder;
}(Query);

Object.assign(Builder.prototype, Query.Condition);

Query.Builder = Builder;

/**
 * @alias baqend.Query.Filter
 * @extends baqend.Query.Node
 * @extends baqend.Query.Condition
 */

var Filter = function (_Query$Node) {
  babelHelpers.inherits(Filter, _Query$Node);


  /**
   * @param {baqend.EntityManager} entityManager The owning entity manager of this query
   * @param {Function} resultClass The query result class
   */

  function Filter(entityManager, resultClass) {
    babelHelpers.classCallCheck(this, Filter);


    /**
     * The actual filters of this node
     * @type Object
     */

    var _this5 = babelHelpers.possibleConstructorReturn(this, _Query$Node.call(this, entityManager, resultClass));

    _this5._filter = {};
    return _this5;
  }

  Filter.prototype._addFilter = function _addFilter(field, filter, value) {
    if (field !== null) {
      if (!(Object(field) instanceof String)) throw new Error('Field must be a string.');

      if (filter) {
        var fieldFilter = this._filter[field];
        if (!(fieldFilter instanceof Object) || Object.getPrototypeOf(fieldFilter) != Object.prototype) {
          this._filter[field] = fieldFilter = {};
        }

        fieldFilter[filter] = value;
      } else {
        this._filter[field] = value;
      }
    } else {
      Object.assign(this._filter, value);
    }

    return this;
  };

  Filter.prototype.toJSON = function toJSON() {
    return this._filter;
  };

  return Filter;
}(Query.Node);

Object.assign(Filter.prototype, Query.Condition);
Query.Filter = Filter;

/**
 * @alias baqend.Query.Operator
 * @extends baqend.Query.Node
 */

var Operator = function (_Query$Node2) {
  babelHelpers.inherits(Operator, _Query$Node2);


  /**
   * @param {baqend.EntityManager} entityManager The owning entity manager of this query
   * @param {Function} resultClass The query result class
   * @param {String} operator The operator used to join the childs
   * @param {Array<baqend.Query.Node>} childs The childs to join
   */

  function Operator(entityManager, resultClass, operator, childs) {
    babelHelpers.classCallCheck(this, Operator);

    /**
     * The operator used to join the child queries
     * @type String
     */

    var _this6 = babelHelpers.possibleConstructorReturn(this, _Query$Node2.call(this, entityManager, resultClass));

    _this6._operator = operator;
    /**
     * The child Node of this query, it is always one
     * @type Array<baqend.Query.Node>
     */
    _this6._childs = childs;
    return _this6;
  }

  Operator.prototype.toJSON = function toJSON() {
    var json = {};
    json[this._operator] = this._childs;
    return json;
  };

  return Operator;
}(Query.Node);

Query.Operator = Operator;

/**
 * @alias baqend.Query.Stream
 */

var Stream = function () {

  /**
   * @param {baqend.EntityManager} entityManager The owning entity manager of this query
   * @param {String} bucket The Bucket on which the streaming query is performed
   * @param {String} query The serialized query
   * @param {Boolean} fetchQuery true if the query result should be fetched
   * @param sort
   * @param limit
   */

  function Stream(entityManager, bucket, query, fetchQuery, sort, limit) {
    babelHelpers.classCallCheck(this, Stream);

    this.entityManager = entityManager;
    this.bucket = bucket;
    this.fetchQuery = fetchQuery;
    this.sort = sort;
    this.limit = limit;
    this.query = query;
    this.callbacks = [];
  }

  Stream.prototype.on = function on(matchType, callback) {
    var topic = [this.bucket, this.query, matchType, "any"].join("/");
    var wrappedCallback = this._wrapQueryCallback(callback);
    this.entityManager._subscribe(topic, wrappedCallback);

    var queryMessage = {
      register: true,
      topic: topic,
      query: {
        bucket: this.bucket,
        matchTypes: [matchType],
        operations: ["any"],
        query: this.query
      }
    };

    if (this.fetchQuery) {
      queryMessage.fromstart = true;
      queryMessage.limit = this.limit;
      queryMessage.sort = this.sort;
    }

    this.entityManager._sendOverSocket(queryMessage);

    this.callbacks.push({
      matchType: matchType,
      callback: callback,
      topic: topic,
      wrappedCallback: wrappedCallback,
      queryMessage: queryMessage
    });
  };

  Stream.prototype.off = function off(matchType, callback) {
    var _this7 = this;

    this.callbacks = this.callbacks.reduce(function (keep, el) {
      if ((!callback || el.callback == callback) && (!matchType || el.matchType == matchType)) {
        _this7.entityManager._unsubscribe(el.topic, el.wrappedCallback);
        el.queryMessage.register = false;
        _this7.entityManager._sendOverSocket(el.queryMessage);
      } else {
        keep.push(el);
      }
      return keep;
    }, []);
  };

  Stream.prototype.once = function once(matchType, callback) {
    var wrapped = function (entity, operation, match) {
      this.off(matchType, wrapped);
      callback(entity, operation, match);
    }.bind(this);
    this.on(matchType, wrapped);
  };

  Stream.prototype._wrapQueryCallback = function _wrapQueryCallback(cb) {
    var receivedResult = false;
    return function (msg) {
      var bucket = msg.query.bucket;
      if (msg.match) {
        //Single Match received
        var operation = msg.match.update.operation;
        //Hollow object for deletes
        var obj = msg.match.update.object ? msg.match.update.object : { id: msg.match.update.id };
        var entity = this._createObject(bucket, operation, obj);
        //Call wrapped callback
        cb({
          type: msg.match.matchtype,
          data: entity,
          operation: operation,
          date: new Date(msg.date),
          target: this,
          initial: false,
          query: this.query
        });
      } else {
        //Initial result received
        if (!receivedResult) {
          msg.result.forEach(function (obj) {
            var operation = 'insert';
            var entity = this._createObject(bucket, operation, obj, obj.id);
            cb({
              type: 'match',
              data: entity,
              operation: operation,
              date: new Date(msg.date),
              target: this,
              initial: true,
              query: this.query
            });
          }, this);
          receivedResult = true;
        }
      }
    }.bind(this);
  };

  Stream.prototype._createObject = function _createObject(bucket, operation, object) {
    var entity = this.entityManager.getReference(bucket, object.id);
    var metadata = Metadata.get(entity);
    metadata.setJson(object);
    metadata.setPersistent();
    return entity;
  };

  return Stream;
}();

Query.Stream = Stream;

module.exports = Query;

function varargs(offset, args) {
  return Array.isArray(args[offset]) ? args[offset] : Array.prototype.slice.call(args, offset);
}

},{"10":10,"32":32,"53":53}],6:[function(_dereq_,module,exports){
'use strict';

_dereq_(139);
_dereq_(140);
_dereq_(141);
_dereq_(142);
_dereq_(138);
_dereq_(136);
_dereq_(137);
_dereq_(143);

/**
 * @namespace baqend
 *
 * @borrows baqend.EntityManager#User
 * @borrows baqend.EntityManager#Role
 * @borrows baqend.EntityManager#Device
 * @borrows baqend.EntityManager#&lt;<i>YourEmbeddableClass</i>&gt;
 * @borrows baqend.EntityManager#&lt;<i>YourEntityClass</i>&gt;
 */
var EntityManagerFactory = _dereq_(2);
var EntityManager = _dereq_(1);

EntityManager.prototype.binding = _dereq_(17);
EntityManager.prototype.connector = _dereq_(25);
EntityManager.prototype.error = _dereq_(31);
EntityManager.prototype.message = _dereq_(32);
EntityManager.prototype.metamodel = _dereq_(48);
EntityManager.prototype.util = _dereq_(60);
EntityManager.prototype.caching = _dereq_(19);

EntityManager.prototype.EntityManager = _dereq_(1);
EntityManager.prototype.EntityManagerFactory = _dereq_(2);
EntityManager.prototype.EntityTransaction = _dereq_(3);
EntityManager.prototype.Query = _dereq_(5);

var emf = new EntityManagerFactory();
exports = module.exports = emf.createEntityManager(true);

/**
 * Connects the DB with the baqend server and calls the callback on success
 * @param {String} hostOrApp The host or the app name to connect with
 * @param {Boolean} [secure=false] <code>true</code> To use a secure connection
 * @param {baqend.util.Lockable~callback=} doneCallback The callback, called when a connection is established and the
 * SDK is ready to use
 * @param {baqend.util.Lockable~callback=} failCallback When an error occurred while initializing the SDK
 * @function
 * @alias baqend#connect
 */
exports.connect = function (hostOrApp, secure, doneCallback, failCallback) {
  if (secure instanceof Function) {
    failCallback = doneCallback;
    doneCallback = secure;
    secure = false;
  }

  emf.connect(hostOrApp, secure);
  return this.ready(doneCallback, failCallback);
};

},{"1":1,"136":136,"137":137,"138":138,"139":139,"140":140,"141":141,"142":142,"143":143,"17":17,"19":19,"2":2,"25":25,"3":3,"31":31,"32":32,"48":48,"5":5,"60":60}],7:[function(_dereq_,module,exports){
"use strict";

/**
 * @alias baqend.binding.Accessor
 */

var Accessor = function () {
	function Accessor() {
		babelHelpers.classCallCheck(this, Accessor);
	}

	/**
  * @param {Object} object
  * @param {baqend.metamodel.Attribute} attribute
  * @returns {*}
  */

	Accessor.prototype.getValue = function getValue(object, attribute) {
		return object[attribute.name];
	};

	/**
  * @param {Object} object
  * @param {baqend.metamodel.Attribute} attribute
  * @param {*} value
  */


	Accessor.prototype.setValue = function setValue(object, attribute, value) {
		object[attribute.name] = value;
	};

	return Accessor;
}();

module.exports = Accessor;

},{}],8:[function(_dereq_,module,exports){
"use strict";

var EntityFactory = _dereq_(11);

/**
 * @class baqend.binding.DeviceFactory
 * @extends baqend.binding.EntityFactory
 *
 * @param {Object=} properties initial properties to set on the instance
 * @param {...*} arguments Additional constructor params passed through the type constructor
 * @return {baqend.binding.Entity} The new managed instance
 */
var DeviceFactory = EntityFactory.extend( /** @lends baqend.binding.DeviceFactory.prototype */{

  /**
   * Returns true if the devices is already registered, otherwise false.
   * @returns {boolean} Status of the device registration
   */
  get isRegistered() {
    return this._db.isDeviceRegistered;
  },

  /**
   * Register a new device with the given device token and OS.
   * @param {String} os The OS of the device (IOS/Android)
   * @param {String} token The GCM or APNS device token
   * @param {baqend.binding.Entity=} device A optional device entity to set custom field values
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.Entity>} The registered device object, for the registered device.
   */
  register: function register(os, token, device, doneCallback, failCallback) {
    if (device instanceof Function) {
      failCallback = doneCallback;
      doneCallback = device;
      device = null;
    }

    return this._db.registerDevice(os, token, device).then(doneCallback, failCallback);
  },


  /**
   * Uses the info from the given {baqend.util.PushMessage} message to send an push notification.
   * @param {baqend.util.PushMessage} pushMessage to send an push notification.
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise}
   */
  push: function push(pushMessage, doneCallback, failCallback) {
    return this._db.pushDevice(pushMessage).then(doneCallback, failCallback);
  }
});

DeviceFactory.PushMessage = _dereq_(56);

module.exports = DeviceFactory;

},{"11":11,"56":56}],9:[function(_dereq_,module,exports){
"use strict";

var Metadata = _dereq_(53);
var Lockable = _dereq_(51);

/**
 * @alias baqend.binding.Enhancer
 */

var Enhancer = function () {
  function Enhancer() {
    babelHelpers.classCallCheck(this, Enhancer);
  }

  /**
   * @param {Class<?>} superClass
   * @returns {Function} typeConstructor
   */

  Enhancer.prototype.createProxy = function createProxy(superClass) {
    return function (_superClass) {
      babelHelpers.inherits(Proxy, _superClass);

      function Proxy() {
        babelHelpers.classCallCheck(this, Proxy);
        return babelHelpers.possibleConstructorReturn(this, _superClass.apply(this, arguments));
      }

      return Proxy;
    }(superClass);
  };

  /**
   * @param {Function} typeConstructor
   * @returns {String}
   */


  Enhancer.prototype.getIdentifier = function getIdentifier(typeConstructor) {
    return typeConstructor.__baqendId__;
  };

  /**
   * @param {Function} typeConstructor
   * @param {String} identifier
   */


  Enhancer.prototype.setIdentifier = function setIdentifier(typeConstructor, identifier) {
    Object.defineProperty(typeConstructor, '__baqendId__', {
      value: identifier
    });
  };

  /**
   * @param {baqend.metamodel.ManagedType} type
   * @param {Function} typeConstructor
   */


  Enhancer.prototype.enhance = function enhance(type, typeConstructor) {
    if (typeConstructor.__baqendType__ == type) return;

    if (typeConstructor.hasOwnProperty('__baqendType__')) throw new Error('Type is already used by a different manager');

    Object.defineProperty(typeConstructor, '__baqendType__', {
      value: type
    });

    this.setIdentifier(typeConstructor, type.ref);
    this.enhancePrototype(typeConstructor.prototype, type);
  };

  /**
   * Enhance the prototype of the type
   * @param {Object} proto
   * @param {baqend.metamodel.ManagedType} type
   */


  Enhancer.prototype.enhancePrototype = function enhancePrototype(proto, type) {
    if (proto.toString === Object.prototype.toString) {
      // implements a better convenience toString method
      Object.defineProperty(proto, 'toString', {
        value: function toString() {
          return this._metadata.id || this._metadata.bucket;
        },
        enumerable: false
      });
    }

    // enhance all persistent object properties
    if (type.superType && type.superType.name == 'Object') {
      for (var _iterator = type.superType.declaredAttributes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var attr = _ref;

        if (!attr.isMetadata) this.enhanceProperty(proto, attr);
      }
    }

    // enhance all persistent properties
    for (var _iterator2 = type.declaredAttributes, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var _attr = _ref2;

      this.enhanceProperty(proto, _attr);
    }
  };

  /**
   * @param {Object} proto
   * @param {baqend.metamodel.Attribute} attribute
   */


  Enhancer.prototype.enhanceProperty = function enhanceProperty(proto, attribute) {
    var name = '$' + attribute.name;
    Object.defineProperty(proto, attribute.name, {
      get: function get() {
        var metadata = this._metadata;
        metadata.readAccess();
        return metadata[name];
      },
      set: function set(value) {
        var metadata = this._metadata;
        metadata.writeAccess();
        metadata[name] = value;
      },

      configurable: true,
      enumerable: true
    });
  };

  Enhancer.prototype.enhanceMap = function enhanceMap(mapConstructor) {};

  return Enhancer;
}();

module.exports = Enhancer;

},{"51":51,"53":53}],10:[function(_dereq_,module,exports){
"use strict";

var Managed = _dereq_(12);

/**
 * @alias baqend.binding.Entity
 * @extends baqend.binding.Managed
 */

var Entity = function (_Managed) {
  babelHelpers.inherits(Entity, _Managed);

  /**
   * The default constructor, copy all given properties to this object
   * @param {Object=} properties - The optional properties to copy
   */

  function Entity(properties) {
    babelHelpers.classCallCheck(this, Entity);
    return babelHelpers.possibleConstructorReturn(this, _Managed.call(this, properties));
  }

  return Entity;
}(Managed);

Object.defineProperties(Entity.prototype, /** @lends baqend.binding.Entity.prototype */{
  /**
   * The unique id of this object
   *
   * Sets the unique id of this object, if the id is not formatted as an valid id,
   * it will be used as the key component of the id has the same affect as setting the key
   *
   * @type string
   */
  id: {
    get: function get() {
      return this._metadata.id;
    },
    set: function set(value) {
      if (this._metadata.id) throw new Error('The id can\'t be set twice: ' + value);

      value += '';
      if (value.indexOf('/db/' + this._metadata.bucket + '/') == 0) {
        this._metadata.id = value;
      } else {
        this.key = value;
      }
    },

    enumerable: true
  },

  /**
   * The unique key part of the id
   * When the key of the unique id is set an error will be thrown if an id is already set.
   * @type string
   */
  key: {
    get: function get() {
      return this._metadata.key;
    },
    set: function set(value) {
      this._metadata.key = value;
    }
  },

  /**
   * The version of this object
   * @type Number
   */
  version: {
    get: function get() {
      return this._metadata.version;
    },

    enumerable: true
  },

  /**
   * The object read/write permissions
   * @type baqend.util.Acl
   */
  acl: {
    get: function get() {
      return this._metadata.acl;
    },

    enumerable: true
  },

  /**
   * Waits on the previously requested operation and calls the doneCallback if the operation is fulfilled
   * @param {baqend.util.Lockable~callback=} doneCallback The callback which will be invoked when the previously
   * operations on this object is completed.
   * @return {Promise<baqend.binding.Entity>} A promise which completes successfully, when the previously requested
   * operation completes
   * @method
   */
  ready: {
    value: function ready(doneCallback) {
      return this._metadata.ready(doneCallback);
    }
  },

  /**
   * Attach this object to the given db
   * @param {baqend.EntityManager} db The db which will be used for future crud operations
   * @method
   */
  attach: {
    value: function attach(db) {
      db.attach(this);
    }
  },

  /**
   * Saves the object. Inserts the object if it doesn't exists and updates the object if the object exist.
   * @param {Object} [options] The save options
   * @param {Boolean} [options.force=false] Force the save operation, the version will not be validated.
   * @param {Number|Boolean} [options.depth=0] The object depth which will be saved. Depth 0 save this object only,
   * <code>true</code> saves the objects by reachability.
   * @param {Boolean} [options.refresh=false] Refresh the local object state from remote.
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.Entity>} A Promise that will be fulfilled when the asynchronous operation completes.
   * @method
   */
  save: {
    value: function save(options, doneCallback, failCallback) {
      if (options instanceof Function) {
        failCallback = doneCallback;
        doneCallback = options;
        options = {};
      }

      return this._metadata.db.save(this, options).then(doneCallback, failCallback);
    }
  },

  /**
   * Inserts a new object. Inserts the object if it doesn't exists and raise an error if the object already exist.
   * @param {Object} [options] The insertion options
   * @param {Number|Boolean} [options.depth=0] The object depth which will be inserted. Depth 0 insert this object only,
   * <code>true</code> inserts objects by reachability.
   * @param {Boolean} [options.refresh=false] Refresh the local object state from remote.
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.Entity>} A Promise that will be fulfilled when the asynchronous operation completes.
   * @method
   */
  insert: {
    value: function insert(options, doneCallback, failCallback) {
      if (options instanceof Function) {
        failCallback = doneCallback;
        doneCallback = options;
        options = {};
      }

      return this._metadata.db.insert(this, options).then(doneCallback, failCallback);
    }
  },

  /**
   * Updates an existing object.
   * Updates the object if it exists and raise an error if the object doesn't exist.
   * @param {Object} [options] The update options
   * @param {Boolean} [options.force=false] Force the update operation, the version will not be validated, only existence will be checked.
   * @param {Number|Boolean} [options.depth=0] The object depth which will be updated. Depth 0 updates this object only,
   * <code>true</code> updates objects by reachability.
   * @param {Boolean} [options.refresh=false] Refresh the local object state from remote.
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.Entity>} A Promise that will be fulfilled when the asynchronous operation completes.
   * @method
   */
  update: {
    value: function update(options, doneCallback, failCallback) {
      if (options instanceof Function) {
        failCallback = doneCallback;
        doneCallback = options;
        options = {};
      }

      return this._metadata.db.update(this, options).then(doneCallback, failCallback);
    }
  },

  /**
   * Loads the referenced objects
   * Removed objects will be marked as removed.
   * @param {Object} [options] The load options
   * @param {Number|Boolean} [options.depth=1] The object depth which will be loaded. Depth set to <code>true</code>
   * loads objects by reachability.
   * @param {Boolean} [options.refresh=false] Refresh the local object state from remote.
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.Entity>} A Promise that will be fulfilled when the asynchronous operation completes.
   * @method
   */
  load: {
    value: function load(options, doneCallback, failCallback) {
      if (options instanceof Function) {
        failCallback = doneCallback;
        doneCallback = options;
        options = {
          depth: 1
        };
      }

      return this._metadata.db.load(this.id, null, options).then(doneCallback, failCallback);
    }
  },

  /**
   * Delete an existing object.
   * @param {Object} [options] The remove options
   * @param {Boolean} [options.force=false] Force the remove operation, the version will not be validated.
   * @param {Number|Boolean} [options.depth=0] The object depth which will be removed. Depth 0 removes this object only,
   * <code>true</code> removes objects by reachability.
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.Entity>} A Promise that will be fulfilled when the asynchronous operation completes.
   * @method
   */
  'delete': {
    value: function value(options, doneCallback, failCallback) {
      if (options instanceof Function) {
        failCallback = doneCallback;
        doneCallback = options;
        options = {};
      }

      return this._metadata.db.delete(this, options).then(doneCallback, failCallback);
    }
  },

  /**
   * Saves the object and repeats the operation if the object is out of date.
   * In each pass the callback will be called. Ths first parameter of the callback is the entity and the second one
   * is a function to abort the process.
   *
   * @param {Function} cb Will be called in each pass
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.Entity>} A Promise that will be fulfilled when the asynchronous operation completes.
   * @method
   */
  optimisticSave: {
    value: function optimisticSave(cb, doneCallback, failCallback) {
      return this._metadata.db.optimisticSave(this, cb).then(doneCallback, failCallback);
    }
  },

  attr: {
    value: function attr() {
      throw new Error("Attr is not yet implemented.");
    }
  },

  /**
   * Validates the entity by using the validation code of the entity type
   *
   * @returns {baqend.util.ValidationResult} Contains the result of the Validation
   * @method
   */
  validate: {
    value: function validate() {
      return this._metadata.db.validate(this);
    }
  },

  /**
   * Converts the entity to an JSON-Object.
   * @param {Boolean} excludeMetadata Indicates if the metadata i.e. id, version and acls should not be included into the json
   * @return {Object} JSON-Object
   * @method
   */
  toJSON: {
    value: function toJSON(excludeMetadata) {
      return this._metadata.getJson(excludeMetadata);
    }
  }
});

module.exports = Entity;

/**
 * The done callback is called, when the asynchronous operation completes successfully
 * @callback baqend.binding.Entity~doneCallback
 * @param {baqend.binding.Entity} entity This entity
 * @return {Promise<*>|*|undefined} A Promise, result or undefined
 */

/**
 * The fail callback is called, when the asynchronous operation is rejected by an error
 * @callback baqend.binding.Entity~failCallback
 * @param {baqend.error.PersistentError} error The error which reject the operation
 * @return {Promise<*>|*|undefined} A Promise, result or undefined
 */

},{"12":12}],11:[function(_dereq_,module,exports){
"use strict";

var ManagedFactory = _dereq_(13);

/**
 * @class baqend.binding.EntityFactory
 * @extends baqend.binding.ManagedFactory
 *
 * @param {Object=} properties initial properties to set on the instance
 * @param {...*} arguments Additional constructor params passed through the type constructor
 * @return {baqend.binding.Entity} The new managed instance
 */
var EntityFactory = ManagedFactory.extend( /** @lends baqend.binding.EntityFactory.prototype */{
  /**
   * Loads the instance for the given id, or null if the id does not exists.
   * @param {String} id The id to query
   * @param {Object} [options] The load options
   * @param {Number|Boolean} [options.depth=0] The object depth which will be saved. Depth 0 saves only this object,
   * <code>true</code> saves the objects by reachability.
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.Entity>} A Promise that will be fulfilled when the asynchronous operation completes.
   */

  load: function load(id, options, doneCallback, failCallback) {
    if (options instanceof Function) {
      failCallback = doneCallback;
      doneCallback = options;
      options = {};
    }

    return this._db.load(this._managedType.typeConstructor, id, options).then(doneCallback, failCallback);
  },


  /**
   * Creates a new instance and sets the DatabaseObject to the given json
   * @param {Object} json
   * @returns {baqend.binding.Entity} instance
   */
  fromJSON: function fromJSON(json) {
    var instance = json.id ? this._db.getReference(this._managedType.typeConstructor, json.id) : this.newInstance();
    var metadata = instance._metadata;
    metadata.setJson(json);
    metadata.setDirty();
    return instance;
  },


  /**
   * Creates a new query for this class
   * @return {baqend.Query.Builder} The query builder
   */
  find: function find() {
    return this._db.createQueryBuilder(this._managedType.typeConstructor);
  },
  partialUpdate: function partialUpdate() {
    throw new Error("partialUpdate is not yet implemented.");
  }
});

module.exports = EntityFactory;

},{"13":13}],12:[function(_dereq_,module,exports){
"use strict";

var util = _dereq_(60);

/**
 * @alias baqend.binding.Managed
 */

var Managed = function () {

  /**
   * Initialize the given instance
   * @param instance The managed instance to initialize
   * @param {Object=} properties The optional properties to set on the instance
   */

  Managed.init = function init(instance, properties) {
    var type = instance.constructor.__baqendType__;
    if (type) {
      Object.defineProperty(instance, '_metadata', {
        value: util.Metadata.create(type, instance),
        configurable: true
      });
    }

    if (properties) Object.assign(instance, properties);
  };

  /**
   * Creates a subclass of this class
   * @param {Class<*>} childClass
   * @return {Class<*>} The extended child class
   */


  Managed.extend = function extend(childClass) {
    childClass.prototype = Object.create(this.prototype, {
      constructor: {
        value: childClass,
        configurable: true,
        writable: true
      }
    });
    childClass.extend = Managed.extend;
    return childClass;
  };

  /**
   * The default constructor, copy all given properties to this object
   * @param {Object=} properties - The optional properties to copy
   */


  function Managed(properties) {
    babelHelpers.classCallCheck(this, Managed);

    Managed.init(this, properties);
  }

  return Managed;
}();

Object.defineProperties(Managed.prototype, /** @lends baqend.binding.Managed.prototype */{
  /**
   * Converts the managed object to an JSON-Object.
   * @return {Object} JSON-Object
   * @method
   */
  toJSON: {
    value: function toJSON() {
      return this._metadata.type.toJsonValue(this._metadata, this);
    }
  }
});

module.exports = Managed;

},{"60":60}],13:[function(_dereq_,module,exports){
"use strict";

/**
 * @class baqend.binding.ManagedFactory
 *
 * @param {Object=} properties initial properties to set on the instance
 * @param {...*} arguments Additional constructor params passed through the type constructor
 * @return {baqend.binding.Managed} The new managed instance
 */

var ManagedFactory = _extend( /** @lends baqend.binding.ManagedFactory.prototype */{

  /**
   * Creates a child factory of this factory
   * @param {Object} properties additional properties applied to the child factory
   * @returns {Object} The new created child Factory
   * @static
   */

  extend: function extend(properties) {
    //copy all factory methods to the child factory
    return _extend({}, this, properties);
  },


  /**
   * Creates a new ManagedFactory for the given type
   * @param {baqend.metamodel.ManagedType} managedType The metadata of type T
   * @param {baqend.EntityManager} db
   * @return {baqend.binding.ManagedFactory} A new object factory to created instances of T
   * @static
   */
  create: function create(managedType, db) {
    var factory = function Factory(properties) {
      return factory.newInstance(arguments);
    };

    _extend(factory, this);

    //lets instanceof work properly
    factory.prototype = managedType.typeConstructor.prototype;
    factory.methods = factory.prototype;

    factory._managedType = managedType;
    factory._db = db;

    return factory;
  },


  /**
   * Creates a new instance of the factory type
   * @param {Array<*>=} args Constructor arguments used for instantiation, the constructor will not be called
   * when no arguments are passed
   * @return {baqend.binding.Managed} A new created instance of T
   */
  newInstance: function newInstance(args) {
    var typeInstance = this._managedType.create(args);
    typeInstance._metadata.db = this._db;
    return typeInstance;
  },


  /**
   * Creates a new instance and sets the Managed Object to the given json
   * @param {Object} json
   * @returns {baqend.binding.Managed} instance
   */
  fromJSON: function fromJSON(json) {
    var instance = this.newInstance();
    var metadata = instance._metadata;
    this._managedType.fromJsonValue(metadata, json, instance);
    return instance;
  },


  /**
   * Adds methods to instances of this factories type
   * @param {object} methods The methods to add
   */
  addMethods: function addMethods(methods) {
    Object.assign(this.methods, methods);
  },


  /**
   * Add a method to instances of this factories type
   * @param {string} name The method name to add
   * @param {function} fn The Method to add
   */
  addMethod: function addMethod(name, fn) {
    this.methods[name] = fn;
  }

  /**
   * Methods that are added to object instances
   * This property is an alias for this factory type prototype
   * @name methods
   * @type object
   * @memberOf baqend.binding.ManagedFactory.prototype
   */

  /**
   * The managed type of this factory
   * @name _managedType
   * @type baqend.metamodel.ManagedType
   * @protected
   * @memberOf baqend.binding.ManagedFactory.prototype
   */

  /**
   * The owning EntityManager where this factory belongs to
   * @name _db
   * @type baqend.EntityManager
   * @protected
   * @memberOf baqend.binding.ManagedFactory.prototype
   */

});

function _extend(target) {
  for (var i = 1, source; source = arguments[i]; ++i) {
    for (var _iterator = Object.getOwnPropertyNames(source), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var prop = _ref;

      Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
    }
  }return target;
}

module.exports = ManagedFactory;

},{}],14:[function(_dereq_,module,exports){
"use strict";

var Entity = _dereq_(10);
var User = _dereq_(15);

/**
 * @alias baqend.binding.Role
 * @extends baqend.binding.Entity
 */

var Role = function (_Entity) {
  babelHelpers.inherits(Role, _Entity);

  /**
   * The default constructor, copy all given properties to this object
   * @param {Object=} properties - The optional properties to copy
   */

  function Role(properties) {
    babelHelpers.classCallCheck(this, Role);
    return babelHelpers.possibleConstructorReturn(this, _Entity.call(this, properties));
  }

  return Role;
}(Entity);

Object.defineProperties(Role.prototype, /** @lends baqend.binding.Role.prototype */{
  /**
   * Test if the given user has this role
   * @return {Boolean} <code>true</code> if the given user has this role,
   * otherwise <code>false</code>
   */
  hasUser: {
    value: function hasUser(user) {
      return this.users && this.users.has(user);
    }
  },

  /**
   * Add the given user to this role
   * @param {baqend.binding.User} user The user to add
   */
  addUser: {
    value: function addUser(user) {
      if (user instanceof User) {
        if (!this.users) this.users = new Set();

        this.users.add(user);
      } else {
        throw new Error('Only user instances can be added to a role.');
      }
    }
  },

  /**
   * Remove the given user from this role
   * @param {baqend.binding.User} user The user to remove
   */
  removeUser: {
    value: function removeUser(user) {
      if (user instanceof User) {
        if (this.users) this.users.delete(user);
      } else {
        throw new Error('Only user instances can be removed from a role.');
      }
    }
  }

  /**
   * A set of users which have this role
   * @type Set<User>
   * @name users
   */

  /**
   * The name of the role
   * @type String
   * @name name
   */
});

module.exports = Role;

},{"10":10,"15":15}],15:[function(_dereq_,module,exports){
"use strict";

var Entity = _dereq_(10);

/**
 * @alias baqend.binding.User
 * @extends baqend.binding.Entity
 */

var User = function (_Entity) {
  babelHelpers.inherits(User, _Entity);

  /**
   * The default constructor, copy all given properties to this object
   * @param {Object=} properties - The optional properties to copy
   */

  function User(properties) {
    babelHelpers.classCallCheck(this, User);
    return babelHelpers.possibleConstructorReturn(this, _Entity.call(this, properties));
  }

  /**
   * The name of the user
   * @type String
   * @name username
   */


  return User;
}(Entity);

Object.defineProperties(User.prototype, {

  /**
   * Change the password of the given user
   *
   * @param {String} currentPassword Current password of the user
   * @param {String} password New password of the user
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.User>}
   */
  newPassword: {
    value: function newPassword(currentPassword, password, doneCallback, failCallback) {
      return this._metadata.db.newPassword(this.username, currentPassword, password).then(doneCallback, failCallback);
    }
  }
});

module.exports = User;

},{"10":10}],16:[function(_dereq_,module,exports){
"use strict";

var EntityFactory = _dereq_(11);

/**
 * @class baqend.binding.UserFactory
 * @extends baqend.binding.EntityFactory
 *
 * Creates a new instance of the managed type of this factory
 * @param {Object=} properties initial properties to set on the instance
 * @param {...*} arguments Additional constructor params passed through the type constructor
 * @return {baqend.binding.User} The new managed instance
 */
var UserFactory = EntityFactory.extend( /** @lends baqend.binding.UserFactory.prototype */{
  /**
   * The current logged in user, or <code>null</code> if the user is not logged in
   * @type baqend.binding.User
   */
  get me() {
    return this._db.me;
  },

  /**
   * Register a new user with the given username and password, if the username is not used by an another user.
   * @param {String|baqend.binding.User} user The username as a string or a <baqend.binding.User> Object, which must contain the username.
   * @param {String} password The password for the given user
   * @param {Boolean|baqend.binding.UserFactory.LoginOption} [loginOption=true] The default logs the user in after a successful registration and keeps the user logged in over multiple sessions
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.User>} The created user object, for the new registered user.
   */
  register: function register(user, password, loginOption, doneCallback, failCallback) {
    if (loginOption instanceof Function) {
      failCallback = doneCallback;
      doneCallback = loginOption;
      loginOption = true;
    }

    user = Object(user) instanceof String ? this.fromJSON({ username: user }) : user;
    return this._db.register(user, password, loginOption === undefined ? true : loginOption).then(doneCallback, failCallback);
  },


  /**
   * Log in the user with the given username and password and starts a user session
   * @param {String} username The username of the user
   * @param {String} password The password of the user
   * @param {Boolean|baqend.binding.UserFactory.LoginOption} [loginOption=true] The default keeps the user logged in over multiple sessions
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.User>}
   */
  login: function login(username, password, loginOption, doneCallback, failCallback) {
    if (loginOption instanceof Function) {
      failCallback = doneCallback;
      doneCallback = loginOption;
      loginOption = true;
    }

    return this._db.login(username, password, loginOption === undefined ? true : loginOption).then(doneCallback, failCallback);
  },


  /**
   * Log out the current logged in user and ends the active user session
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<null>}
   */
  logout: function logout(doneCallback, failCallback) {
    return this._db.logout().then(doneCallback, failCallback);
  },


  /**
   * Change the password of the given user
   *
   * @param {String} username Username to identify the user
   * @param {String} password Current password of the user
   * @param {String} newPassword New password of the user
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.User>}
   */
  newPassword: function newPassword(username, password, _newPassword, doneCallback, failCallback) {
    return this._db.newPassword(username, password, _newPassword).then(doneCallback, failCallback);
  }

  /**
   * Prompts the user for the Google login in a new window. Before using OAuth you need to setup your application
   * on the provider website, add the redirect uri: <code>https://example.net/db/User/OAuth/google</code> and copy the client id
   * and the client secret to your Baqend dashboard settings. When the returned promise succeeds the user is logged in.
   *
   * @param {String} clientID
   * @param {Object=} options
   * @param {Boolean|baqend.binding.UserFactory.LoginOption} [loginOption=true] The default keeps the user logged in over multiple sessions
   * @param {String} [options.title="Login"] sets the title of the popup window
   * @param {Number} [options.width=585] defines the width of the popup window
   * @param {Number} [options.height=545] defines the height of the popup window
   * @param {String} [options.scope="email"] the range of rights requested from the user
   * @param {Object} [options.state={}]
   * @param {Number} [options.timeout=5 * 60 * 1000]
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.User>}
   *
   * @function
   * @name loginWithGoogle
   * @memberOf baqend.binding.UserFactory.prototype
   */

  /**
   * Prompts the user for the Facebook login in a new window. Before using OAuth you need to setup your application
   * on the provider website, add the redirect uri: https://example.net/db/User/OAuth/facebook and copy the client id
   * and the client secret to your Baqend dashboard settings. When the returned promise succeeds the user is logged in.
   *
   * @param {String} clientID
   * @param {Object=} options
   * @param {Boolean|baqend.binding.UserFactory.LoginOption} [loginOption=true] The default keeps the user logged in over multiple sessions
   * @param {String} [options.title="Login"] sets the title of the popup window
   * @param {Number} [options.width=1140] defines the width of the popup window
   * @param {Number} [options.height=640] defines the height of the popup window
   * @param {String} [options.scope="email"] the range of rights requested from the user
   * @param {Object} [options.state={}]
   * @param {Number} [options.timeout=5 * 60 * 1000]
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.User>}
   *
   * @function
   * @name loginWithFacebook
   * @memberOf baqend.binding.UserFactory.prototype
   */

  /**
   * Prompts the user for the GitHub login in a new window. Before using OAuth you need to setup your application
   * on the provider website, add the redirect uri: https://example.net/db/User/OAuth/github and copy the client id
   * and the client secret to your Baqend dashboard settings. When the returned promise succeeds the user is logged in.
   *
   * @param {String} clientID
   * @param {Object=} options
   * @param {Boolean|baqend.binding.UserFactory.LoginOption} [loginOption=true] The default keeps the user logged in over multiple sessions
   * @param {String} [options.title="Login"] sets the title of the popup window
   * @param {Number} [options.width=1040] defines the width of the popup window
   * @param {Number} [options.height=580] defines the height of the popup window
   * @param {String} [options.scope="user:email"] the range of rights requested from the user
   * @param {Object} [options.state={}]
   * @param {Number} [options.timeout=5 * 60 * 1000]
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.User>}
   *
   * @function
   * @name loginWithGitHub
   * @memberOf baqend.binding.UserFactory.prototype
   */

  /**
   * Prompts the user for the Twitter login in a new window. Before using OAuth you need to setup your application
   * on the provider website, add the redirect uri: https://example.net/db/User/OAuth/twitter and copy the client id
   * and the client secret to your Baqend dashboard settings. When the returned promise succeeds the user is logged in.
   *
   * @param {String} clientID
   * @param {Object=} options
   * @param {Boolean|baqend.binding.UserFactory.LoginOption} [loginOption=true] The default keeps the user logged in over multiple sessions
   * @param {String} [options.title="Login"] sets the title of the popup window
   * @param {Number} [options.width=740] defines the width of the popup window
   * @param {Number} [options.height=730] defines the height of the popup window
   * @param {Number} [options.timeout=5 * 60 * 1000]
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.User>}
   *
   * @function
   * @name loginWithTwitter
   * @memberOf baqend.binding.UserFactory.prototype
   */

  /**
   * Prompts the user for the LinkedIn login in a new window. Before using OAuth you need to setup your application
   * on the provider website, add the redirect uri: https://example.net/db/User/OAuth/linkedin and copy the client id
   * and the client secret to your Baqend dashboard settings. When the returned promise succeeds the user is logged in.
   *
   * @param {String} clientID
   * @param {Object=} options
   * @param {Boolean|baqend.binding.UserFactory.LoginOption} [loginOption=true] The default keeps the user logged in over multiple sessions
   * @param {String} [options.title="Login"] sets the title of the popup window
   * @param {Number} [options.width=630] defines the width of the popup window
   * @param {Number} [options.height=530] defines the height of the popup window
   * @param {String} [options.scope=""] the range of rights requested from the user
   * @param {Object} [options.state={}]
   * @param {Number} [options.timeout=5 * 60 * 1000]
   * @param {baqend.binding.Entity~doneCallback=} doneCallback Called when the operation succeed.
   * @param {baqend.binding.Entity~failCallback=} failCallback Called when the operation failed.
   * @return {Promise<baqend.binding.User>}
   *
   * @function
   * @name loginWithLinkedIn
   * @memberOf baqend.binding.UserFactory.prototype
   */

});

/**
 * @memberOf baqend.binding.UserFactory
 * @enum {number}
 */
UserFactory.LoginOption = {
  /**
   * Do not login the user after a successful registration
   */
  NO_LOGIN: -1,
  /**
   * Login in after a successful registration and keep the token in a nonpermanent storage, i.e SessionStorage
   */
  SESSION_LOGIN: 0,
  /**
   * Login in after a successful registration and keep the token in a persistent storage, i.e LocalStorage
   */
  PERSIST_LOGIN: 1
};

/**
 * @memberOf baqend.binding.UserFactory
 * @enum {object}
 */
UserFactory.defaultOptions = {
  google: {
    width: 585,
    height: 545,
    scope: 'email'
  },
  facebook: {
    width: 1140,
    height: 640,
    scope: 'email'
  },
  github: {
    width: 1040,
    height: 580,
    scope: 'user:email'
  },
  twitter: {
    width: 740,
    height: 730
  },
  linkedin: {
    width: 630,
    height: 530,
    scope: ''
  }
};

["Google", "Facebook", "GitHub", "Twitter", "LinkedIn"].forEach(function (name) {
  UserFactory["loginWith" + name] = function (clientID, options, doneCallback, failCallback) {
    //noinspection JSPotentiallyInvalidUsageOfThis
    if (options instanceof Function) {
      failCallback = doneCallback;
      doneCallback = options;
      options = {};
    }

    options = Object.assign({}, UserFactory.defaultOptions[name.toLowerCase()], options || {});

    return this._db.loginWithOAuth(name, clientID, options).then(doneCallback, failCallback);
  };
});

module.exports = UserFactory;

},{"11":11}],17:[function(_dereq_,module,exports){
'use strict';

/**
 * @namespace baqend.binding
 */

exports.Accessor = _dereq_(7);
exports.Enhancer = _dereq_(9);
exports.ManagedFactory = _dereq_(13);
exports.EntityFactory = _dereq_(11);
exports.UserFactory = _dereq_(16);
exports.DeviceFactory = _dereq_(8);
exports.Managed = _dereq_(12);
exports.Entity = _dereq_(10);
exports.Role = _dereq_(14);
exports.User = _dereq_(15);

},{"10":10,"11":11,"12":12,"13":13,"14":14,"15":15,"16":16,"7":7,"8":8,"9":9}],18:[function(_dereq_,module,exports){
"use strict";

var atob = _dereq_(60).atob;

/**
 * @alias baqend.caching.BloomFilter
 */

var BloomFilter = function () {
  function BloomFilter(rawBF) {
    babelHelpers.classCallCheck(this, BloomFilter);

    this.bytes = atob(rawBF.b);
    this.bits = rawBF.m;
    this.hashes = rawBF.h;
  }

  BloomFilter.prototype.contains = function contains(element) {
    for (var _iterator = BloomFilter._getHashes(element, this.bits, this.hashes), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var hash = _ref;

      if (!this._isSet(hash)) {
        return false;
      }
    }
    return true;
  };

  BloomFilter.prototype._isSet = function _isSet(index) {
    var pos = Math.floor(index / 8);
    var bit = 1 << index % 8;
    //Extract byte as int or NaN if out of range
    var byte = this.bytes.charCodeAt(pos);
    //Bit-wise AND should be non-zero (NaN always yields false)
    return (byte & bit) != 0;
  };

  BloomFilter._getHashes = function _getHashes(element, bits, hashes) {
    var hashValues = new Array(this.hashes);
    var hash1 = BloomFilter._murmur3(0, element);
    var hash2 = BloomFilter._murmur3(hash1, element);
    for (var i = 0; i < hashes; i++) {
      hashValues[i] = (hash1 + i * hash2) % bits;
    }
    return hashValues;
  };

  BloomFilter._murmur3 = function _murmur3(seed, key) {
    var remainder, bytes, h1, h1b, c1, c2, k1, i;
    remainder = key.length & 3;
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;

    while (i < bytes) {
      k1 = key.charCodeAt(i) & 0xff | (key.charCodeAt(++i) & 0xff) << 8 | (key.charCodeAt(++i) & 0xff) << 16 | (key.charCodeAt(++i) & 0xff) << 24;
      ++i;

      k1 = (k1 & 0xffff) * c1 + (((k1 >>> 16) * c1 & 0xffff) << 16) & 0xffffffff;
      k1 = k1 << 15 | k1 >>> 17;
      k1 = (k1 & 0xffff) * c2 + (((k1 >>> 16) * c2 & 0xffff) << 16) & 0xffffffff;

      h1 ^= k1;
      h1 = h1 << 13 | h1 >>> 19;
      h1b = (h1 & 0xffff) * 5 + (((h1 >>> 16) * 5 & 0xffff) << 16) & 0xffffffff;
      h1 = (h1b & 0xffff) + 0x6b64 + (((h1b >>> 16) + 0xe654 & 0xffff) << 16);
    }

    k1 = 0;

    switch (remainder) {
      case 3:
        k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
      case 2:
        k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
      case 1:
        k1 ^= key.charCodeAt(i) & 0xff;

        k1 = (k1 & 0xffff) * c1 + (((k1 >>> 16) * c1 & 0xffff) << 16) & 0xffffffff;
        k1 = k1 << 15 | k1 >>> 17;
        k1 = (k1 & 0xffff) * c2 + (((k1 >>> 16) * c2 & 0xffff) << 16) & 0xffffffff;
        h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = (h1 & 0xffff) * 0x85ebca6b + (((h1 >>> 16) * 0x85ebca6b & 0xffff) << 16) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = (h1 & 0xffff) * 0xc2b2ae35 + (((h1 >>> 16) * 0xc2b2ae35 & 0xffff) << 16) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
  };

  return BloomFilter;
}();

module.exports = BloomFilter;

},{"60":60}],19:[function(_dereq_,module,exports){
'use strict';

/**
 * @namespace baqend.caching
 */
exports.BloomFilter = _dereq_(18);

},{"18":18}],20:[function(_dereq_,module,exports){
"use strict";

var PersistentError = _dereq_(29);

/**
 * @alias baqend.connector.Connector
 */

var Connector = function () {

  /**
   * @param {String} host or location
   * @param {number=} port
   * @param {boolean=} secure <code>true</code> for an secure connection
   * @param {String} [basePath=] The basepath of the api
   * @return {baqend.connector.Connector}
   */

  Connector.create = function create(host, port, secure, basePath) {
    if (!host && typeof window !== 'undefined') {
      host = window.location.hostname;
      port = Number(window.location.port);
      secure = window.location.protocol == 'https:';
    }

    if (basePath === undefined) basePath = Connector.DEFAULT_BASE_PATH;

    if (host.indexOf('/') != -1) {
      var matches = /^(https?):\/\/([^\/:]+|\[[^\]]+])(:(\d*))?(\/\w+)?\/?$/.exec(host);
      if (matches) {
        secure = matches[1] == 'https';
        host = matches[2].replace(/(\[|])/g, '');
        port = matches[4];
        basePath = matches[5] || '';
      } else {
        throw new Error('The connection uri host ' + host + ' seems not to be valid');
      }
    } else if (host != 'localhost' && /^[a-z0-9-]*$/.test(host)) {
      //handle app names as hostname
      host += secure ? Connector.SSL_DOMAIN : Connector.HTTP_DOMAIN;
    }

    if (!port) port = secure ? 443 : 80;

    var url = Connector.toUri(host, port, secure, basePath);
    var connection = this.connections[url];

    if (!connection) {
      for (var name in this.connectors) {
        var connector = this.connectors[name];
        if (connector.isUsable && connector.isUsable(host, port, secure, basePath)) {
          connection = new connector(host, port, secure, basePath);
          break;
        }
      }

      if (!connection) throw new Error('No connector is usable for the requested connection.');

      this.connections[url] = connection;
    }

    return connection;
  };

  Connector.toUri = function toUri(host, port, secure, basePath) {
    var uri = (secure ? 'https://' : 'http://') + (host.indexOf(':') != -1 ? '[' + host + ']' : host);
    uri += secure && port != 443 || !secure && port != 80 ? ':' + port : '';
    uri += basePath;
    return uri;
  };

  /**
   * @param {String} host
   * @param {number} port
   * @param {boolean} secure
   * @param {String} basePath
   */


  function Connector(host, port, secure, basePath) {
    babelHelpers.classCallCheck(this, Connector);

    this.host = host;
    this.port = port;
    this.secure = secure;
    this.basePath = basePath;
    this.socket = null;
    this.listeners = {};

    //the origin do not contains the basepath
    this.origin = Connector.toUri(host, port, secure, "");
  }

  /**
   * @param {baqend.connector.Message} message
   * @returns {Promise<baqend.connector.Message>}
   */


  Connector.prototype.send = function send(message) {
    var _this = this;

    if (message.request.method == 'OAUTH') {
      message.addRedirectOrigin(this.origin + this.basePath);
    }

    return new Promise(function (resolve, reject) {
      _this.prepareRequestEntity(message);
      _this.doSend(message, message.request, _this.receive.bind(_this, message, resolve, reject));
    }).catch(function (e) {
      throw PersistentError.of(e);
    });
  };

  /**
   * @param {baqend.connector.Message} message
   * @param {Function} resolve
   * @param {Function} reject
   * @param {Object} response
   */


  Connector.prototype.receive = function receive(message, resolve, reject, response) {
    message.response = response;
    try {
      // IE9 returns status code 1223 instead of 204
      message.response.status = message.response.status == 1223 ? 204 : message.response.status;

      this.prepareResponseEntity(message);
      message.doReceive();
      resolve(message);
    } catch (e) {
      e = PersistentError.of(e);
      message.response.entity = null;
      reject(e);
    }
  };

  /**
   * Handle the actual message send
   * @param {baqend.connector.Message} message
   * @param {baqend.connector.Message.request} request
   * @param {Function} receive
   * @abstract
   */


  Connector.prototype.doSend = function doSend(message, request, receive) {};

  /**
   * Registers a handler for a topic.
   * @param {String|Object} topic
   * @param {Function} cb
   */


  Connector.prototype.subscribe = function subscribe(topic, cb) {
    topic = Object(topic) instanceof String ? topic : JSON.stringify(topic);
    if (!this.listeners[topic]) {
      this.listeners[topic] = [cb];
    } else if (this.listeners[topic].indexOf(cb) == -1) {
      this.listeners[topic].push(cb);
    }
  };

  /**
   * Deregisters a handler.
   * @param {String|Object}  topic
   * @param {Function} cb
   */


  Connector.prototype.unsubscribe = function unsubscribe(topic, cb) {
    topic = Object(topic) instanceof String ? topic : JSON.stringify(topic);
    if (this.listeners[topic]) {
      var index = this.listeners[topic].indexOf(cb);
      if (index != -1) {
        this.listeners[topic].splice(index, 1);
      }
    }
  };

  Connector.prototype.socketListener = function socketListener(event) {
    var message = JSON.parse(event.data);
    var topic = message.topic;
    topic = Object(topic) instanceof String ? topic : JSON.stringify(topic);
    if (this.listeners[topic]) {
      this.listeners[topic].forEach(function (listener) {
        listener(message);
      });
    }
  };

  /**
   * Sends a websocket message over a lazily initialized websocket connection.
   * @param {Object} message
   * @param {String} message.topic
   * @param {String} message.token
   */


  Connector.prototype.sendOverSocket = function sendOverSocket(message) {
    var _this2 = this;

    //Lazy socket initialization
    if (this.socket === null) {
      this.socket = this.createWebSocket((this.secure ? 'wss://' : 'ws://') + this.host + ':' + this.port + this.basePath + '/events');
      this.socket.onmessage = this.socketListener.bind(this);

      //Resolve Promise on connect
      this.socketOpen = new Promise(function (resolve, reject) {
        _this2.socket.onopen = resolve;
        _this2.socket.onerror = reject;
      });

      //Reset socket on close
      this.socket.onclose = function () {
        _this2.socket = null;
        _this2.socketOpen = null;
      };
    }

    var jsonMessage = JSON.stringify(message);
    this.socketOpen.then(function () {
      _this2.socket.send(jsonMessage);
    });
  };

  /**
   * Creates a new web socket connection for the given destination
   * @param {String} destination The destination to connect to
   * @return {WebSocket} a new WebSocket instance
   * @abstract
   */


  Connector.prototype.createWebSocket = function createWebSocket(destination) {
    var WebSocket = _dereq_(60).WebSocket;

    if (!WebSocket) console.warn('optional websocket module is not installed, therefore realtime communication is not available.');

    return new WebSocket(destination);
  };

  /**
   * @param {baqend.connector.Message} message
   */


  Connector.prototype.prepareRequestEntity = function prepareRequestEntity(message) {
    if (message.request.entity) {
      if (Object(message.request.entity) instanceof String) {
        message.request.headers['Content-Type'] = 'text/plain;charset=utf-8';
      } else {
        message.request.headers['Content-Type'] = 'application/json;charset=utf-8';
        message.request.entity = JSON.stringify(message.request.entity);
      }
    }

    if (this.gzip) {
      if (message.request.headers['If-None-Match'] && message.request.headers['If-None-Match'] != '*') {
        message.request.headers['If-None-Match'] = message.request.headers['If-None-Match'].slice(0, -1) + '--gzip"';
      }
    }

    if (message.tokenStorage) {
      var token = message.tokenStorage.get(this.origin);
      if (token) message.request.headers['Authorization'] = 'BAT ' + token;
    }
  };

  /**
   * @param {baqend.connector.Message} message
   * @param {Object} data
   */


  Connector.prototype.prepareResponseEntity = function prepareResponseEntity(message) {
    var entity = message.response.entity;
    if (entity && entity.length > 0) {
      var contentType = message.response.headers['Content-Type'] || message.response.headers['content-type'];
      if (contentType && contentType.indexOf("application/json") > -1) {
        entity = JSON.parse(entity);
      }

      if (message.request.path.indexOf('/connect') > -1) {
        this.gzip = !!entity.gzip;
      }
    } else {
      entity = null;
    }

    message.response.entity = entity;

    if (message.tokenStorage) {
      var headers = message.response.headers || {};
      var token = headers['Baqend-Authorization-Token'] || headers['baqend-authorization-token'];
      if (token) {
        message.tokenStorage.update(this.origin, token);
      }
    }
  };

  return Connector;
}();

Object.assign(Connector, {
  DEFAULT_BASE_PATH: '/v1',
  HTTP_DOMAIN: '.app.baqend.com',
  SSL_DOMAIN: '-bq.global.ssl.fastly.net',

  /**
   * An array of all exposed response headers
   * @type String[]
   */
  RESPONSE_HEADERS: ['Baqend-Authorization-Token', 'Content-Type'],

  /**
   * Array of all available connector implementations
   * @type baqend.connector.Connector[]
   */
  connectors: [],

  /**
   * Array of all created connections
   * @type Object<string,baqend.connector.Connector>
   */
  connections: {},

  /**
   * The connector will detect if gzip is supports.
   * Returns true if supported otherwise false.
   * @returns {boolean} gzip
   */
  gzip: false
});

module.exports = Connector;

},{"29":29,"60":60}],21:[function(_dereq_,module,exports){
"use strict";

var Connector = _dereq_(20);

/**
 * @alias baqend.connector.IFrameConnector
 * @extends baqend.connector.Connector
 */

var IFrameConnector = function (_Connector) {
  babelHelpers.inherits(IFrameConnector, _Connector);

  /**
   * Indicates if this connector implementation is usable for the given host and port
   * @param {String} host
   * @param {number} port
   * @param {boolean} secure
   * @returns {boolean}
   */

  IFrameConnector.isUsable = function isUsable(host, port, secure) {
    return typeof window != 'undefined' && (window.location.hostname != host || window.location.port != port);
  };

  function IFrameConnector(host, port, secure, basePath) {
    babelHelpers.classCallCheck(this, IFrameConnector);

    var _this = babelHelpers.possibleConstructorReturn(this, _Connector.call(this, host, port, secure, basePath));

    _this.mid = 0;
    _this.messages = {};
    _this.doReceive = _this.doReceive.bind(_this);

    addEventListener('message', _this.doReceive, false);
    return _this;
  }

  IFrameConnector.prototype.load = function load(tokenStorage) {
    var path = this.basePath + '/connect';
    var src = this.origin + path;

    var token = tokenStorage ? tokenStorage.createResourceToken(this.origin, path) : '';
    this.iframe = document.createElement('iframe');
    this.iframe.src = src + (token ? '?BAT=' + token : '');
    this.iframe.setAttribute("style", IFrameConnector.style);
    document.body.appendChild(this.iframe);

    this.queue = [];
    this.iframe.addEventListener('load', this.onLoad.bind(this), false);
  };

  IFrameConnector.prototype.onLoad = function onLoad() {
    var queue = this.queue;

    for (var i = 0; i < queue.length; ++i) {
      this.postMessage(queue[i]);
    }

    this.queue = null;
  };

  /**
   * @inheritDoc
   */


  IFrameConnector.prototype.doSend = function doSend(message, request, receive) {
    var _this2 = this;

    if (!this.iframe) {
      this.load(message.tokenStorage);
    }

    var msg = {
      mid: ++this.mid,
      method: request.method,
      path: request.path,
      headers: request.headers,
      entity: request.entity,
      responseHeaders: Connector.RESPONSE_HEADERS
    };

    this.messages[msg.mid] = receive;

    var strMsg = JSON.stringify(msg);
    if (this.queue) {
      this.queue.push(strMsg);
    } else {
      this.postMessage(strMsg);
    }

    if (!this.connected) {
      setTimeout(function () {
        if (_this2.messages[msg.mid]) {
          delete _this2.messages[msg.mid];
          receive({
            status: 0,
            error: new Error('Connection refused.')
          });
        }
      }, 10000);
    }
  };

  IFrameConnector.prototype.postMessage = function postMessage(msg) {
    this.iframe.contentWindow.postMessage(msg, this.origin);
  };

  IFrameConnector.prototype.doReceive = function doReceive(event) {
    if (event.origin !== this.origin || event.data[0] != '{') {
      return;
    }

    var msg = JSON.parse(event.data);

    var receive = this.messages[msg.mid];
    if (receive) {
      delete this.messages[msg.mid];
      this.connected = true;

      receive({
        status: msg.status,
        headers: msg.headers,
        entity: msg.entity
      });
    }
  };

  return IFrameConnector;
}(Connector);

IFrameConnector.style = 'width:1px;height:1px;position:absolute;top:-10px;left:-10px;';

Connector.connectors.push(IFrameConnector);

module.exports = IFrameConnector;

},{"20":20}],22:[function(_dereq_,module,exports){
"use strict";

var CommunicationError = _dereq_(26);

/**
 * @alias baqend.connector.Message
 */

var Message = function () {
  /**
   * Creates a new message class with the given message specification
   * @param {object} specification
   * @return {Function}
   */

  Message.create = function create(specification) {
    var parts = specification.path.split('?');
    var path = parts[0].split(/:\w*/);
    var query = [];
    if (parts[1]) {
      parts[1].split('&').forEach(function (arg) {
        var part = arg.split('=');
        query.push(part[0]);
      });
    }

    specification.path = path;
    specification.query = query;

    return function (_Message) {
      babelHelpers.inherits(_class, _Message);

      function _class() {
        babelHelpers.classCallCheck(this, _class);
        return babelHelpers.possibleConstructorReturn(this, _Message.apply(this, arguments));
      }

      babelHelpers.createClass(_class, [{
        key: 'spec',
        get: function get() {
          return specification;
        }
      }]);
      return _class;
    }(Message);
  };

  /**
   * Creates a new message class with the given message specification and a full path
   * @param {object} specification
   * @return {Function}
   */


  Message.createExternal = function createExternal(specification, query) {
    specification.path = [specification.path];

    return function (_Message2) {
      babelHelpers.inherits(_class2, _Message2);

      function _class2() {
        babelHelpers.classCallCheck(this, _class2);
        return babelHelpers.possibleConstructorReturn(this, _Message2.apply(this, arguments));
      }

      babelHelpers.createClass(_class2, [{
        key: 'spec',
        get: function get() {
          return specification;
        }
      }]);
      return _class2;
    }(Message);
  };

  /**
   * @param {String} arguments... The path arguments
   */


  function Message() {
    babelHelpers.classCallCheck(this, Message);

    /** @type boolean */
    this.withCredentials = false;

    /** @type baqend.util.TokenStorage */
    this.tokenStorage = null;

    var args = arguments;
    var index = 0;
    var path = this.spec.path;
    if (Object(path) instanceof Array) {
      path = this.spec.path[0];
      for (var i = 1; i < this.spec.path.length; ++i) {
        path += encodeURIComponent(args[index++]) + this.spec.path[i];
      }
    }

    var query = "";
    for (var i = 0; i < this.spec.query.length; ++i) {
      var arg = args[index++];
      if (arg !== undefined && arg !== null) {
        query += query || ~path.indexOf("?") ? "&" : "?";
        query += this.spec.query[i] + '=' + encodeURIComponent(arg);
      }
    }

    this.request = {
      method: this.spec.method,
      path: path + query,
      headers: {
        'accept': 'application/json, text/*;q=0.1'
      },
      entity: args[index] || null
    };

    this.response = {
      status: 0,
      headers: {},
      entity: null
    };
  }

  Message.prototype.setIfMatch = function setIfMatch(value) {
    if (value != '*') value = '"' + value + '"';

    this.request.headers['If-Match'] = value;
  };

  Message.prototype.setIfNoneMatch = function setIfNoneMatch(value) {
    if (value != '*') value = '"' + value + '"';

    this.request.headers['If-None-Match'] = value;
  };

  Message.prototype.setCacheControl = function setCacheControl(value) {
    this.request.headers['Cache-Control'] = value;
  };

  /**
   * Adds the given String to the request path.
   * If the parameter is an object the query string will be created.
   *
   * @param {String|Object} query which will added to the request path
   */


  Message.prototype.addQueryString = function addQueryString(query) {
    var _this3 = this;

    if (Object(query) instanceof String) {
      this.request.path += query;
    } else if (query) {
      var sep = ~this.request.path.indexOf("?") ? "&" : "?";
      Object.keys(query).forEach(function (key, i) {
        _this3.request.path += sep + key + "=" + encodeURIComponent(query[key]);
        if (i == 0) {
          sep = "&";
        }
      });
    }
  };

  /**
   * Handle the receive
   */


  Message.prototype.doReceive = function doReceive() {
    if (this.spec.status.indexOf(this.response.status) == -1) {
      throw new CommunicationError(this);
    }
  };

  return Message;
}();

/**
 * The message specification
 * @name spec
 * @memberOf baqend.connector.Message.prototype
 * @type {Object}
 */


Message.prototype.spec = null;

/**
 * @enum {number}
 */
Message.StatusCode = {
  NOT_MODIFIED: 304,
  BAD_CREDENTIALS: 460,
  BUCKET_NOT_FOUND: 461,
  INVALID_PERMISSION_MODIFICATION: 462,
  INVALID_TYPE_VALUE: 463,
  OBJECT_NOT_FOUND: 404,
  OBJECT_OUT_OF_DATE: 412,
  PERMISSION_DENIED: 466,
  QUERY_DISPOSED: 467,
  QUERY_NOT_SUPPORTED: 468,
  SCHEMA_NOT_COMPATIBLE: 469,
  SCHEMA_STILL_EXISTS: 470,
  SYNTAX_ERROR: 471,
  TRANSACTION_INACTIVE: 472,
  TYPE_ALREADY_EXISTS: 473,
  TYPE_STILL_REFERENCED: 474,
  SCRIPT_ABORTION: 475
};

Message.GoogleOAuth = Message.createExternal({
  method: 'OAUTH',
  path: 'https://accounts.google.com/o/oauth2/auth?response_type=code&access_type=online',
  query: ["client_id", "scope", "state"],
  status: [200]
});

Message.GoogleOAuth.prototype.addRedirectOrigin = function (baseUri) {
  this.addQueryString({
    redirect_uri: baseUri + '/db/User/OAuth/google'
  });
};

Message.FacebookOAuth = Message.createExternal({
  method: 'OAUTH',
  path: 'https://www.facebook.com/dialog/oauth?response_type=code',
  query: ["client_id", "scope", "state"],
  status: [200]
});

Message.FacebookOAuth.prototype.addRedirectOrigin = function (baseUri) {
  this.addQueryString({
    redirect_uri: baseUri + '/db/User/OAuth/facebook'
  });
};

Message.GitHubOAuth = Message.createExternal({
  method: 'OAUTH',
  path: 'https://github.com/login/oauth/authorize?response_type=code&access_type=online',
  query: ["client_id", "scope", "state"],
  status: [200]
});

Message.GitHubOAuth.prototype.addRedirectOrigin = function (baseUri) {
  this.addQueryString({
    redirect_uri: baseUri + '/db/User/OAuth/github'
  });
};

Message.LinkedInOAuth = Message.createExternal({
  method: 'OAUTH',
  path: 'https://www.linkedin.com/uas/oauth2/authorization?response_type=code&access_type=online',
  query: ["client_id", "scope", "state"],
  status: [200]
});

Message.LinkedInOAuth.prototype.addRedirectOrigin = function (baseUri) {
  this.addQueryString({
    redirect_uri: baseUri + '/db/User/OAuth/linkedin'
  });
};

Message.TwitterOAuth = Message.createExternal({
  method: 'OAUTH',
  path: '',
  query: [],
  status: [200]
});

Message.TwitterOAuth.prototype.addRedirectOrigin = function (baseUri) {
  this.request.path = baseUri + '/db/User/OAuth1/twitter';
};

module.exports = Message;

},{"26":26}],23:[function(_dereq_,module,exports){
"use strict";

var Connector = _dereq_(20);

/**
 * @alias baqend.connector.NodeConnector
 * @extends baqend.connector.Connector
 */

var NodeConnector = function (_Connector) {
  babelHelpers.inherits(NodeConnector, _Connector);

  NodeConnector.isUsable = function isUsable(host, port, secure) {
    if (!this.prototype.http) {
      try {
        var http;
        if (secure) {
          http = _dereq_('https');
        } else {
          http = _dereq_('http');
        }

        if (http.request && http.Server) {
          this.prototype.http = http;
        }
      } catch (e) {}
    }
    return Boolean(this.prototype.http);
  };

  function NodeConnector(host, port, secure, basePath) {
    babelHelpers.classCallCheck(this, NodeConnector);

    var _this = babelHelpers.possibleConstructorReturn(this, _Connector.call(this, host, port, secure, basePath));

    _this.cookie = null;
    return _this;
  }

  /**
   * @inheritDoc
   */


  NodeConnector.prototype.doSend = function doSend(message, request, receive) {
    request.host = this.host;
    request.port = this.port;
    request.path = this.basePath + request.path;

    var self = this;
    var entity = request.entity;

    if (this.cookie && message.withCredentials) request.headers['Cookie'] = this.cookie;

    var req = this.http.request(request, function (res) {
      var data = '';

      res.setEncoding('utf-8');
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        var cookie = res.headers['set-cookie'];
        if (cookie) {
          // cookie may be an array, convert it to a string
          self.cookie = self.parseCookie(cookie + '');
        }

        receive({
          status: res.statusCode,
          headers: res.headers,
          entity: data
        });
      });
    });

    req.on('error', function (e) {
      receive({
        status: 0,
        error: e
      });
    });

    if (entity) req.end(entity, 'utf8');else req.end();
  };

  /**
   * Parse the cookie header
   * @param {String} header
   */


  NodeConnector.prototype.parseCookie = function parseCookie(header) {
    var parts = header.split(';');

    for (var i = 0, part; part = parts[i]; ++i) {
      if (part.indexOf('Expires=') == 0) {
        var date = Date.parse(part.substring(8));
        if (date < Date.now()) {
          return null;
        }
      }
    }

    return parts[0];
  };

  return NodeConnector;
}(Connector);

Connector.connectors.push(NodeConnector);

module.exports = NodeConnector;

},{"20":20,"undefined":undefined}],24:[function(_dereq_,module,exports){
"use strict";

var Connector = _dereq_(20);

/**
 * @alias baqend.connector.XMLHttpConnector
 * @extends baqend.connector.Connector
 */

var XMLHttpConnector = function (_Connector) {
  babelHelpers.inherits(XMLHttpConnector, _Connector);

  function XMLHttpConnector() {
    babelHelpers.classCallCheck(this, XMLHttpConnector);
    return babelHelpers.possibleConstructorReturn(this, _Connector.apply(this, arguments));
  }

  /**
   * Indicates if this connector implementation is usable for the given host and port
   * @param {String} host
   * @param {number} port
   * @param {boolean} secure
   * @returns {boolean}
   */

  XMLHttpConnector.isUsable = function isUsable(host, port, secure) {
    return window != 'undefined' && window.location.hostname == host && window.location.port == port && window.location.protocol == (secure ? 'https:' : 'http:') && typeof XMLHttpRequest != 'undefined';
  };

  /**
   * @inheritDoc
   */


  XMLHttpConnector.prototype.doSend = function doSend(message, request, receive) {
    if (request.method == 'OAUTH') {
      addEventListener("storage", function handle(event) {
        if (event.key == 'oauth-response') {
          receive(JSON.parse(event.newValue));
          localStorage.removeItem('oauth-response');
          removeEventListener("storage", handle, false);
        }
      }, false);
      return;
    }

    var xhr = new XMLHttpRequest();

    var url = this.origin + this.basePath + request.path;

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var response = {
          headers: {},
          status: xhr.status,
          entity: xhr.response || xhr.responseText
        };

        Connector.RESPONSE_HEADERS.forEach(function (name) {
          response.headers[name] = xhr.getResponseHeader(name);
        });

        receive(response);
      }
    };

    xhr.open(request.method, url, true);

    var entity = request.entity;
    var headers = request.headers;
    for (var name in headers) {
      xhr.setRequestHeader(name, headers[name]);
    }xhr.withCredentials = message.withCredentials;

    xhr.send(entity);
  };

  return XMLHttpConnector;
}(Connector);

Connector.connectors.push(XMLHttpConnector);

module.exports = XMLHttpConnector;

},{"20":20}],25:[function(_dereq_,module,exports){
'use strict';

/**
 * @namespace baqend.connector
 */

exports.Message = _dereq_(22);
exports.Connector = _dereq_(20);
exports.NodeConnector = _dereq_(23);
exports.XMLHttpConnector = _dereq_(24);
exports.IFrameConnector = _dereq_(21);

},{"20":20,"21":21,"22":22,"23":23,"24":24}],26:[function(_dereq_,module,exports){
"use strict";

var PersistentError = _dereq_(29);

/**
 * @alias baqend.error.CommunicationError
 * @extends baqend.error.PersistentError
 */

var CommunicationError = function (_PersistentError) {
	babelHelpers.inherits(CommunicationError, _PersistentError);


	/**
  * @param {baqend.connector.Message} httpMessage
   */

	function CommunicationError(httpMessage) {
		babelHelpers.classCallCheck(this, CommunicationError);

		var response = httpMessage.response.entity || {};
		var state = httpMessage.response.status == 0 ? 'Request' : 'Response';
		var message = response.message || 'Handling the ' + state + ' for ' + httpMessage.request.method + ' ' + httpMessage.request.path;

		var _this = babelHelpers.possibleConstructorReturn(this, _PersistentError.call(this, message, response));

		_this.name = response.className || 'CommunicationError';
		_this.reason = response.reason || 'Communication failed';
		_this.status = httpMessage.response.status;

		if (response.data) _this.data = response.data;

		var cause = response;
		while (cause && cause.stackTrace) {
			_this.stack += '\nServerside Caused by: ' + cause.className + ' ' + cause.message;

			var stackTrace = cause.stackTrace;
			for (var i = 0; i < stackTrace.length; ++i) {
				var el = stackTrace[i];

				_this.stack += '\n    at ' + el.className + '.' + el.methodName;
				_this.stack += ' (' + el.fileName + ':' + el.lineNumber + ')';
			}

			cause = cause.cause;
		}
		return _this;
	}

	return CommunicationError;
}(PersistentError);

module.exports = CommunicationError;

},{"29":29}],27:[function(_dereq_,module,exports){
"use strict";

var PersistentError = _dereq_(29);

/**
 * @alias baqend.error.EntityExistsError
 * @extends baqend.error.PersistentError
 */

var EntityExistsError = function (_PersistentError) {
  babelHelpers.inherits(EntityExistsError, _PersistentError);

  /**
   * @param {String} entity
   */

  function EntityExistsError(entity) {
    babelHelpers.classCallCheck(this, EntityExistsError);

    var _this = babelHelpers.possibleConstructorReturn(this, _PersistentError.call(this, 'The entity ' + entity + ' is managed by a different db.'));

    _this.entity = entity;
    return _this;
  }

  return EntityExistsError;
}(PersistentError);

module.exports = EntityExistsError;

},{"29":29}],28:[function(_dereq_,module,exports){
"use strict";

var PersistentError = _dereq_(29);

/**
 * @alias baqend.error.IllegalEntityError
 * @extends baqend.error.PersistentError
 */

var IllegalEntityError = function (_PersistentError) {
	babelHelpers.inherits(IllegalEntityError, _PersistentError);

	/**
  * @param {baqend.binding.Entity} entity
  */

	function IllegalEntityError(entity) {
		babelHelpers.classCallCheck(this, IllegalEntityError);

		var _this = babelHelpers.possibleConstructorReturn(this, _PersistentError.call(this, 'Entity ' + entity + ' is not a valid entity'));

		_this.entity = entity;
		return _this;
	}

	return IllegalEntityError;
}(PersistentError);

module.exports = IllegalEntityError;

},{"29":29}],29:[function(_dereq_,module,exports){
"use strict";
/**
 * @class baqend.error.PersistentError
 * @extends Error
 *
 * @param {String} message
 * @param {Error=} cause
 */

//do not use class here, since we can't change the class prototype

function PersistentError(message, cause) {
  message = message ? message : 'An unexpected persistent error occured.';

  if (Error.hasOwnProperty('captureStackTrace')) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }

  this.message = message;
  this.name = this.constructor.name;

  if (cause) {
    this.cause = cause;
    if (cause.stack) {
      this.stack += '\nCaused By: ' + cause.stack;
    }
  }
}

PersistentError.of = function of(error) {
  if (error instanceof PersistentError) {
    return error;
  } else {
    return new PersistentError(null, error);
  }
};

//custom errors must be manually extended for babel, otherwise the super call destroys the origin 'this' reference
PersistentError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: PersistentError,
    enumerable: false,
    configurable: true
  }
});

module.exports = PersistentError;

},{}],30:[function(_dereq_,module,exports){
"use strict";

var PersistentError = _dereq_(29);

/**
 * @alias baqend.error.RollbackError
 * @extends baqend.error.PersistentError
 */

var RollbackError = function (_PersistentError) {
  babelHelpers.inherits(RollbackError, _PersistentError);

  /**
   * @param {Error} cause
   */

  function RollbackError(cause) {
    babelHelpers.classCallCheck(this, RollbackError);
    return babelHelpers.possibleConstructorReturn(this, _PersistentError.call(this, 'The transaction has been rollbacked', cause));
  }

  return RollbackError;
}(PersistentError);

module.exports = RollbackError;

},{"29":29}],31:[function(_dereq_,module,exports){
'use strict';

/**
 * @namespace baqend.error
 */

exports.CommunicationError = _dereq_(26);
exports.IllegalEntityError = _dereq_(28);
exports.EntityExistsError = _dereq_(27);
exports.PersistentError = _dereq_(29);
exports.RollbackError = _dereq_(30);

},{"26":26,"27":27,"28":28,"29":29,"30":30}],32:[function(_dereq_,module,exports){
'use strict';

var Message = _dereq_(22);

/**
 * Get the list of all available subresources
 * 
 * @class baqend.message.ListAllResources
 * @extends baqend.connector.Message
 *
 */
exports.ListAllResources = Message.create({
  method: 'GET',
  path: '/',
  status: [200]
});

/**
 * Get the API version of the Orestes-Server
 * 
 * @class baqend.message.ApiVersion
 * @extends baqend.connector.Message
 *
 */
exports.ApiVersion = Message.create({
  method: 'GET',
  path: '/version',
  status: [200]
});

/**
 * The Swagger specification of the Orestes-Server
 * 
 * @class baqend.message.Specification
 * @extends baqend.connector.Message
 *
 */
exports.Specification = Message.create({
  method: 'GET',
  path: '/spec',
  status: [200]
});

/**
 * Returns all changed objects
 * 
 * @class baqend.message.GetBloomFilter
 * @extends baqend.connector.Message
 *
 */
exports.GetBloomFilter = Message.create({
  method: 'GET',
  path: '/replication',
  status: [200]
});

/**
 * Get the current Orestes config
 * 
 * @class baqend.message.GetOrestesConfig
 * @extends baqend.connector.Message
 *
 */
exports.GetOrestesConfig = Message.create({
  method: 'GET',
  path: '/config',
  status: [200]
});

/**
 * Updates the current Orestes config
 * 
 * @class baqend.message.UpdateOrestesConfig
 * @extends baqend.connector.Message
 *
 * @param body {object} The massage Content
 */
exports.UpdateOrestesConfig = Message.create({
  method: 'PUT',
  path: '/config',
  status: [200, 202]
});

/**
 * Connects a browser to this server
 * 
 * @class baqend.message.Connect
 * @extends baqend.connector.Message
 *
 */
exports.Connect = Message.create({
  method: 'GET',
  path: '/connect',
  status: [200]
});

/**
 * Gets the status of the server health
 * 
 * @class baqend.message.Status
 * @extends baqend.connector.Message
 *
 */
exports.Status = Message.create({
  method: 'GET',
  path: '/status',
  status: [200]
});

/**
 * Determines whether the IP has exceeded its rate limit
 * 
 * @class baqend.message.BannedIp
 * @extends baqend.connector.Message
 *
 * @param ip {Object} The ip to test
 */
exports.BannedIp = Message.create({
  method: 'GET',
  path: '/banned/:ip',
  status: [204]
});

/**
 * Always returns banned status for proper CDN handling
 * 
 * @class baqend.message.Banned
 * @extends baqend.connector.Message
 *
 */
exports.Banned = Message.create({
  method: 'GET',
  path: '/banned',
  status: []
});

/**
 * Clears all rate-limiting information for all IPs
 * 
 * @class baqend.message.Unban
 * @extends baqend.connector.Message
 *
 */
exports.Unban = Message.create({
  method: 'DELETE',
  path: '/banned',
  status: [204]
});

/**
 * Clears rate-limiting information for given IPs
 * 
 * @class baqend.message.UnbanIp
 * @extends baqend.connector.Message
 *
 * @param ip {Object} The ip to reset
 */
exports.UnbanIp = Message.create({
  method: 'DELETE',
  path: '/banned/:ip',
  status: [204]
});

/**
 * List all available bucket names
 * List all bucket
 * 
 * @class baqend.message.GetBucketNames
 * @extends baqend.connector.Message
 *
 */
exports.GetBucketNames = Message.create({
  method: 'GET',
  path: '/db',
  status: [200]
});

/**
 * List all bucket objects
 * List all object ids of the bucket
 * 
 * @class baqend.message.GetBucketIds
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param start {Object} The offset to skip
 * @param count {Object} The upper limit to return
 */
exports.GetBucketIds = Message.create({
  method: 'GET',
  path: '/db/:bucket/ids?start=0&count=-1',
  status: [200]
});

/**
 * Dumps all objects of the bucket
 * Exports the complete Bucket content
 * 
 * @class baqend.message.ExportBucket
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param bat {Object} The baqend authorization token
 */
exports.ExportBucket = Message.create({
  method: 'GET',
  path: '/db/:bucket?bat=',
  status: [200]
});

/**
 * Upload all objects to the bucket
 * Imports the complete Bucket content
 * 
 * @class baqend.message.ImportBucket
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param bat {Object} The baqend authorization token
 * @param body {object} The massage Content
 */
exports.ImportBucket = Message.create({
  method: 'PUT',
  path: '/db/:bucket?bat=',
  status: [200]
});

/**
 * Deletes all objects of the bucket
 * Deletes all objects of the bucket
 * 
 * @class baqend.message.TruncateBucket
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param bat {Object} The baqend authorization token
 */
exports.TruncateBucket = Message.create({
  method: 'DELETE',
  path: '/db/:bucket?bat=',
  status: [200]
});

/**
 * Create object
 * Create the given Object.
 * The object will be created and gets a unique oid.
 * 
 * @class baqend.message.CreateObject
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param body {object} The massage Content
 */
exports.CreateObject = Message.create({
  method: 'POST',
  path: '/db/:bucket',
  status: [201, 202]
});

/**
 * Get object
 * Returns the specified object. Each object has one unique identifier and therefore only one location.
 * 
 * @class baqend.message.GetObject
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param oid {Object} The unique object identifier
 */
exports.GetObject = Message.create({
  method: 'GET',
  path: '/db/:bucket/:oid',
  status: [200, 304]
});

/**
 * Replace object
 * Replace the current object with the updated one.
 * To update a specific version of the object a version Number can be provided in the If-Match header.
 * The update will only be accepted, if the current version matches the provided one, otherwise the update
 * will be rejected.
 * You can use the * wildcard to match any existing object, but prevents a insertion if the object doesn't exists.
 * 
 * @class baqend.message.ReplaceObject
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param oid {Object} The unique object identifier
 * @param body {object} The massage Content
 */
exports.ReplaceObject = Message.create({
  method: 'PUT',
  path: '/db/:bucket/:oid',
  status: [200, 202]
});

/**
 * Deletes the object
 * Deletes the object. The If-Match Header can be used to specify an expected version. The object will
 * only be deleted if the version matches the provided one. The * wildcard can be used to match any existing
 * version but results in an error if the object doesn't exists.
 * 
 * @class baqend.message.DeleteObject
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param oid {Object} The unique object identifier
 */
exports.DeleteObject = Message.create({
  method: 'DELETE',
  path: '/db/:bucket/:oid',
  status: [202, 204]
});

/**
 * Get all available class schemas
 * Gets the complete schema
 * 
 * @class baqend.message.GetAllSchemas
 * @extends baqend.connector.Message
 *
 */
exports.GetAllSchemas = Message.create({
  method: 'GET',
  path: '/schema',
  status: [200]
});

/**
 * Create new class schemas and update existing class schemas
 * Updates the complete schema, merge all changes, reject the schema update if the schema changes aren't compatible
 * 
 * @class baqend.message.UpdateAllSchemas
 * @extends baqend.connector.Message
 *
 * @param body {object} The massage Content
 */
exports.UpdateAllSchemas = Message.create({
  method: 'POST',
  path: '/schema',
  status: [200]
});

/**
 * Replace all currently created schemas with the new ones
 * Replace the complete schema, with the new one.
 * 
 * @class baqend.message.ReplaceAllSchemas
 * @extends baqend.connector.Message
 *
 * @param body {object} The massage Content
 */
exports.ReplaceAllSchemas = Message.create({
  method: 'PUT',
  path: '/schema',
  status: [200]
});

/**
 * Get the class schema
 * Returns the schema definition of the class
 * The class definition contains a link to its parent class and all persistable fields with there types of the class
 * 
 * @class baqend.message.GetSchema
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 */
exports.GetSchema = Message.create({
  method: 'GET',
  path: '/schema/:bucket',
  status: [200]
});

/**
 * Update the class schema
 * Modify the schema definition of the class by adding all missing fields
 * 
 * @class baqend.message.UpdateSchema
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param body {object} The massage Content
 */
exports.UpdateSchema = Message.create({
  method: 'POST',
  path: '/schema/:bucket',
  status: [200]
});

/**
 * Replace the class schema
 * Replace the schema definition of the class
 * 
 * @class baqend.message.ReplaceSchema
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param body {object} The massage Content
 */
exports.ReplaceSchema = Message.create({
  method: 'PUT',
  path: '/schema/:bucket',
  status: [200]
});

/**
 * Delete the class schema
 * Delete the schema definition of the class
 * 
 * @class baqend.message.DeleteSchema
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 */
exports.DeleteSchema = Message.create({
  method: 'DELETE',
  path: '/schema/:bucket',
  status: [204]
});

/**
 * Executes a basic ad-hoc query
 * Executes the given query and returns a list of matching objects.
 * 
 * @class baqend.message.AdhocQuery
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param q {Object} The query
 * @param eager {Object} indicates if the query result should be send back as ids or as objects
 * @param start {Object} The offset to start from
 * @param count {Object} The number of objects to list
 * @param sort {Object} The sort object
 */
exports.AdhocQuery = Message.create({
  method: 'GET',
  path: '/db/:bucket/query?q&start=0&count=-1&sort=&eager=',
  status: [200]
});

/**
 * Executes a basic ad-hoc query
 * Executes the given query and returns a list of matching objects.
 * 
 * @class baqend.message.AdhocQueryPOST
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param start {Object} The offset to start from
 * @param count {Object} The number of objects to list
 * @param sort {Object} The sort object
 * @param body {object} The massage Content
 */
exports.AdhocQueryPOST = Message.create({
  method: 'POST',
  path: '/db/:bucket/query?start=0&count=-1&sort=',
  status: [200]
});

/**
 * Executes a count query
 * Executes the given query and returns the number of objects that match the query
 * 
 * @class baqend.message.AdhocCountQuery
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param q {Object} The query
 */
exports.AdhocCountQuery = Message.create({
  method: 'GET',
  path: '/db/:bucket/count?q',
  status: [200]
});

/**
 * Executes a count query
 * Executes the given query and returns the number of objects that match the query
 * 
 * @class baqend.message.AdhocCountQueryPOST
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param body {object} The massage Content
 */
exports.AdhocCountQueryPOST = Message.create({
  method: 'POST',
  path: '/db/:bucket/count',
  status: [200]
});

/**
 * List all Query subresources
 * 
 * @class baqend.message.ListQueryResources
 * @extends baqend.connector.Message
 *
 */
exports.ListQueryResources = Message.create({
  method: 'GET',
  path: '/query',
  status: [200]
});

/**
 * Creates a prepared query
 * 
 * @class baqend.message.CreateQuery
 * @extends baqend.connector.Message
 *
 * @param body {object} The massage Content
 */
exports.CreateQuery = Message.create({
  method: 'POST',
  path: '/query',
  status: [201]
});

/**
 * List all subresources of a query
 * 
 * @class baqend.message.ListThisQueryResources
 * @extends baqend.connector.Message
 *
 * @param qid {Object} The query id
 */
exports.ListThisQueryResources = Message.create({
  method: 'GET',
  path: '/query/:qid',
  status: [200]
});

/**
 * Get the query string
 * 
 * @class baqend.message.GetQueryCode
 * @extends baqend.connector.Message
 *
 * @param qid {Object} The query id
 */
exports.GetQueryCode = Message.create({
  method: 'GET',
  path: '/query/:qid/source',
  status: [200]
});

/**
 * Executes a prepared query
 * 
 * @class baqend.message.RunQuery
 * @extends baqend.connector.Message
 *
 * @param start {Object} The offset from where to start from
 * @param count {Object} The number of objects to enlist
 * @param qid {Object} The query id
 */
exports.RunQuery = Message.create({
  method: 'GET',
  path: '/query/:qid/result?start=0&count=-1',
  status: [200]
});

/**
 * Get the declared query parameters
 * 
 * @class baqend.message.GetQueryParameters
 * @extends baqend.connector.Message
 *
 * @param qid {Object} The query id
 */
exports.GetQueryParameters = Message.create({
  method: 'GET',
  path: '/query/:qid/parameters',
  status: [200]
});

/**
 * Starts a new Transaction
 * 
 * @class baqend.message.NewTransaction
 * @extends baqend.connector.Message
 *
 */
exports.NewTransaction = Message.create({
  method: 'POST',
  path: '/transaction',
  status: [201]
});

/**
 * Commits the transaction
 * If the transaction can be completed a list of all changed objects with their updated versions are returned.
 * 
 * @class baqend.message.CommitTransaction
 * @extends baqend.connector.Message
 *
 * @param tid {Object} The transaction id
 * @param body {object} The massage Content
 */
exports.CommitTransaction = Message.create({
  method: 'PUT',
  path: '/transaction/:tid/committed',
  status: [200]
});

/**
 * Returns the object in the given version or the newest version if the given does not exist.
 * 
 * @class baqend.message.GetObjectInExplicitVersion
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param oid {Object} The unique object identifier
 * @param version {Object} The version to load
 */
exports.GetObjectInExplicitVersion = Message.create({
  method: 'GET',
  path: '/db/:bucket/:oid/:version',
  status: [200]
});

/**
 * Update the object
 * Executes the partial updates on the object.
 * To update an object an explicit version must be provided in the If-Match header.
 * If the version is not equal to the current object version the update will be aborted.
 * The version identifier Any (*) can be used to skip the version validation and therefore
 * the update will always be applied.
 * 
 * @class baqend.message.UpdatePartially
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param oid {Object} The unique object identifier
 * @param body {object} The massage Content
 */
exports.UpdatePartially = Message.create({
  method: 'POST',
  path: '/db/:bucket/:oid',
  status: [204]
});

/**
 * Update the object field
 * Executes the partial update on a object field.
 * To update an object an explicit version must be provided in the If-Match header.
 * If the version is not equal to the current object version the update will be aborted.
 * The version identifier Any (*) can be used to skip the version validation and therefore
 * the update will always be applied.
 * 
 * @class baqend.message.UpdateField
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param field {Object} The field name
 * @param oid {Object} The unique object identifier
 * @param body {object} The massage Content
 */
exports.UpdateField = Message.create({
  method: 'POST',
  path: '/db/:bucket/:oid/:field',
  status: [204]
});

/**
 * Method to login a user
 * Log in a user by it's credentials
 * 
 * @class baqend.message.Login
 * @extends baqend.connector.Message
 *
 * @param body {object} The massage Content
 */
exports.Login = Message.create({
  method: 'POST',
  path: '/db/User/login',
  status: [200]
});

/**
 * Method to register a user
 * Register and creates a new user
 * 
 * @class baqend.message.Register
 * @extends baqend.connector.Message
 *
 * @param body {object} The massage Content
 */
exports.Register = Message.create({
  method: 'POST',
  path: '/db/User/register',
  status: [200, 204]
});

/**
 * Method to load the current user object
 * Gets the user object of the currently logged in user
 * 
 * @class baqend.message.Me
 * @extends baqend.connector.Message
 *
 */
exports.Me = Message.create({
  method: 'GET',
  path: '/db/User/me',
  status: [200]
});

/**
 * Method to validate a user token
 * Validates if a given token is still valid
 * 
 * @class baqend.message.ValidateUser
 * @extends baqend.connector.Message
 *
 */
exports.ValidateUser = Message.create({
  method: 'GET',
  path: '/db/User/validate',
  status: [200]
});

/**
 * Method to remove token cookie
 * Log out a user by removing the cookie token
 * 
 * @class baqend.message.Logout
 * @extends baqend.connector.Message
 *
 */
exports.Logout = Message.create({
  method: 'GET',
  path: '/db/User/logout',
  status: [204]
});

/**
 * Method to change the password
 * 
 * @class baqend.message.NewPassword
 * @extends baqend.connector.Message
 *
 * @param body {object} The massage Content
 */
exports.NewPassword = Message.create({
  method: 'POST',
  path: '/db/User/password',
  status: [200]
});

/**
 * Method to verify user by a given token
 * 
 * @class baqend.message.Verify
 * @extends baqend.connector.Message
 *
 * @param token {Object} Token to verify the user
 */
exports.Verify = Message.create({
  method: 'GET',
  path: '/db/User/verify?token=',
  status: [204]
});

/**
 * Method to register or login using an OAuth provider.
 * This resource is invoked by the provider with a redirect after the user granted permission.
 * 
 * @class baqend.message.OAuth2
 * @extends baqend.connector.Message
 *
 * @param oauth_verifier {Object} OAuth 1.0 code
 * @param code {Object} The code written by the provider
 * @param provider {Object} The OAuth provider
 * @param oauth_token {Object} OAuth 1.0 identifier
 * @param state {Object} On true a token will be returned
 */
exports.OAuth2 = Message.create({
  method: 'GET',
  path: '/db/User/OAuth/:provider?state=&code=&oauth_verifier=&oauth_token=',
  status: [200]
});

/**
 * Method to invoke a OAuth-1.0 login/register
 * The resource requests a request-token and redirects the user to the provider page to log-in and grant permission for
 * your application.
 * 
 * @class baqend.message.OAuth1
 * @extends baqend.connector.Message
 *
 * @param provider {Object} The OAuth provider
 */
exports.OAuth1 = Message.create({
  method: 'GET',
  path: '/db/User/OAuth1/:provider',
  status: [200]
});

/**
 * Gets the code of the the given bucket and type
 * 
 * @class baqend.message.GetBaqendCode
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param type {Object} The type of the script
 */
exports.GetBaqendCode = Message.create({
  method: 'GET',
  path: '/code/:bucket/:type',
  status: [200]
});

/**
 * Sets the code of the bucket and type
 * 
 * @class baqend.message.SetBaqendCode
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param type {Object} The type of the script
 * @param body {object} The massage Content
 */
exports.SetBaqendCode = Message.create({
  method: 'PUT',
  path: '/code/:bucket/:type',
  status: [200, 202]
});

/**
 * Delete the code of the given bucket and type
 * 
 * @class baqend.message.DeleteBaqendCode
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param type {Object} The type of the script
 */
exports.DeleteBaqendCode = Message.create({
  method: 'DELETE',
  path: '/code/:bucket/:type',
  status: [202, 204]
});

/**
 * Calls the module of the specific bucket
 * 
 * @class baqend.message.PostBaqendModule
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The method name
 */
exports.PostBaqendModule = Message.create({
  method: 'POST',
  path: '/code/:bucket',
  status: [200, 204]
});

/**
 * Calls the module of the specific bucket
 * 
 * @class baqend.message.GetBaqendModule
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The module name
 */
exports.GetBaqendModule = Message.create({
  method: 'GET',
  path: '/code/:bucket',
  status: [200, 204]
});

/**
 * List all available modules
 * 
 * @class baqend.message.GetAllModules
 * @extends baqend.connector.Message
 *
 */
exports.GetAllModules = Message.create({
  method: 'GET',
  path: '/code',
  status: [200]
});

/**
 * Get all file ID's   File-Bucket
 * retrieve meta-information about all accessible Files in a specific Bucket.
 * 
 * @class baqend.message.ListFiles
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param start {Object} The unique object identifier
 * @param count {Object} The upper limit to return.
 */
exports.ListFiles = Message.create({
  method: 'GET',
  path: '/file/:bucket/ids?start=&count=-1',
  status: [200]
});

/**
 * Retrieves the bucket ACL's
 * The bucket metadata object contains the bucketAcl
 * 
 * @class baqend.message.GetFileBucketAcls
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 */
exports.GetFileBucketAcls = Message.create({
  method: 'GET',
  path: '/file/:bucket',
  status: [200]
});

/**
 * Sets the Bucket ACL
 * Creates or replaces the bucket ACL's to control permission access to all included Files.
 * 
 * @class baqend.message.SetFileBucketAcls
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param body {object} The massage Content
 */
exports.SetFileBucketAcls = Message.create({
  method: 'PUT',
  path: '/file/:bucket',
  status: [204]
});

/**
 * deletes all files of a file Bucket
 * Deletes the bucket and all its content
 * 
 * @class baqend.message.DeleteFileBucket
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 */
exports.DeleteFileBucket = Message.create({
  method: 'DELETE',
  path: '/file/:bucket',
  status: [204]
});

/**
 * Creates a new file with a UUID
 * Creates a File with a random ID, only Insert permissions are required
 * 
 * @class baqend.message.CreateFile
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 */
exports.CreateFile = Message.create({
  method: 'POST',
  path: '/file/:bucket',
  status: [200]
});

/**
 * Download a file  File-Bucket-OID
 * Download a chunk of Data.
 * 
 * @class baqend.message.GetFile
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param oid {Object} The unique object identifier
 */
exports.GetFile = Message.create({
  method: 'GET',
  path: '/file/:bucket/:oid',
  status: [200, 304]
});

/**
 * replaces File ACL
 * replaces File Access control listing  Files.
 * 
 * @class baqend.message.SetFileAcl
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param oid {Object} The unique object identifier
 * @param body {object} The massage Content
 */
exports.SetFileAcl = Message.create({
  method: 'POST',
  path: '/file/:bucket/:oid',
  status: [204]
});

/**
 * Replace a file
 * Replace an File with some other file.
 * Like objects, you can specify an explicit version in the
 * If-Match Header or use * to replace any version but error if the File dose not exist.
 * 
 * @class baqend.message.ReplaceFile
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param oid {Object} The unique object identifier
 */
exports.ReplaceFile = Message.create({
  method: 'PUT',
  path: '/file/:bucket/:oid',
  status: [200]
});

/**
 * Delete a file
 * Deletes a file.
 * Like objects, you can specify an explicit version in the
 * If-Match Header or use * to replace any version but error if the File dose not exist.
 * 
 * @class baqend.message.DeleteFile
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param oid {Object} The unique object identifier
 */
exports.DeleteFile = Message.create({
  method: 'DELETE',
  path: '/file/:bucket/:oid',
  status: [203]
});

/**
 * List bucket indexes
 * List all indexes of the given bucket
 * 
 * @class baqend.message.ListIndexes
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 */
exports.ListIndexes = Message.create({
  method: 'GET',
  path: '/index/:bucket',
  status: [200]
});

/**
 * Create or drop bucket index
 * Create or drop a index for the given bucket
 * 
 * @class baqend.message.CreateDropIndex
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 * @param body {object} The massage Content
 */
exports.CreateDropIndex = Message.create({
  method: 'POST',
  path: '/index/:bucket',
  status: [202]
});

/**
 * Drop all indexes
 * Drop all indexes on the given bucket
 * 
 * @class baqend.message.DropAllIndexes
 * @extends baqend.connector.Message
 *
 * @param bucket {Object} The bucket name
 */
exports.DropAllIndexes = Message.create({
  method: 'DELETE',
  path: '/index/:bucket',
  status: [202]
});

/**
 * Method to register a new device
 * Registers a new devices
 * 
 * @class baqend.message.DeviceRegister
 * @extends baqend.connector.Message
 *
 * @param body {object} The massage Content
 */
exports.DeviceRegister = Message.create({
  method: 'POST',
  path: '/db/Device/register',
  status: [204]
});

/**
 * Method to push a message to devices
 * Pushes a message to devices
 * 
 * @class baqend.message.DevicePush
 * @extends baqend.connector.Message
 *
 * @param body {object} The massage Content
 */
exports.DevicePush = Message.create({
  method: 'POST',
  path: '/db/Device/push',
  status: [204]
});

/**
 * Check if device is registered
 * Checks if the device is already registered
 * 
 * @class baqend.message.DeviceRegistered
 * @extends baqend.connector.Message
 *
 */
exports.DeviceRegistered = Message.create({
  method: 'GET',
  path: '/db/Device/registered',
  status: [200]
});

/**
 * Upload APNS certificate
 * Upload APNS certificate
 * 
 * @class baqend.message.UploadAPNSCertificate
 * @extends baqend.connector.Message
 *
 */
exports.UploadAPNSCertificate = Message.create({
  method: 'POST',
  path: '/config/APNSCert',
  status: [204]
});

/**
 * Set GCM-API-Key
 * Sets the GCM-API-Key
 * 
 * @class baqend.message.GCMAKey
 * @extends baqend.connector.Message
 *
 * @param body {object} The massage Content
 */
exports.GCMAKey = Message.create({
  method: 'POST',
  path: '/config/GCMKey',
  status: [204]
});

},{"22":22}],33:[function(_dereq_,module,exports){
"use strict";

var Accessor = _dereq_(7);

/**
 * @alias baqend.metamodel.Attribute
 */

var Attribute = function () {
  babelHelpers.createClass(Attribute, [{
    key: 'persistentAttributeType',

    /**
     * @type Number
     */
    get: function get() {
      return -1;
    }

    /**
     * @type Boolean
     */

  }, {
    key: 'isAssociation',
    get: function get() {
      return this.persistentAttributeType > Attribute.PersistentAttributeType.EMBEDDED;
    }

    /**
     * @type Boolean
     */

  }, {
    key: 'isCollection',
    get: function get() {
      return this.persistentAttributeType == Attribute.PersistentAttributeType.ELEMENT_COLLECTION;
    }

    /**
     * @param {String} name The attribute name
     * @param {Boolean=} isMetadata <code>true</code> if the attribute is an metadata attribute
     */

  }]);

  function Attribute(name, isMetadata) {
    babelHelpers.classCallCheck(this, Attribute);

    /** @type Boolean */
    this.isMetadata = !!isMetadata;
    /** @type Boolean */
    this.isId = false;
    /** @type Boolean */
    this.isVersion = false;
    /** @type Boolean */
    this.isAcl = false;

    /** @type String */
    this.name = name;
    /** @type Number */
    this.order = null;
    /** @type baqend.binding.Accessor */
    this.accessor = null;
    /** @type baqend.metamodel.ManagedType */
    this.declaringType = null;
  }

  /**
   * @param {baqend.metamodel.ManagedType} declaringType The type that owns this attribute
   * @param {Number} order Position of the attribute
   */


  Attribute.prototype.init = function init(declaringType, order) {
    if (this.declaringType) throw new Error('The attribute is already initialized.');

    this.order = order;
    this.accessor = new Accessor();
    this.declaringType = declaringType;
  };

  /**
   * @param {Object} entity
   * @returns {*}
   */


  Attribute.prototype.getValue = function getValue(entity) {
    return this.accessor.getValue(entity, this);
  };

  /**
   * @param {Object} entity
   * @param {*} value
   */


  Attribute.prototype.setValue = function setValue(entity, value) {
    this.accessor.setValue(entity, this, value);
  };

  /**
   * Gets this attribute value form the object as json
   * @param {baqend.util.Metadata} state The root object state
   * @param {*} object The object which contains the value of this attribute
   * @return {*} The converted json value
   * @abstract
   */


  Attribute.prototype.getJsonValue = function getJsonValue(state, object) {};

  /**
   * Sets this attribute value from json to the object
   * @param {baqend.util.Metadata} state The root state
   * @param {*} object The object which contains the attribute
   * @param {*} jsonValue The json value to convert an set
   * @abstract
   */


  Attribute.prototype.setJsonValue = function setJsonValue(state, object, jsonValue) {};

  /**
   * Converts this attribute field to json
   * @abstract
   * @returns {Object} The attribute description as json
   */


  Attribute.prototype.toJSON = function toJSON() {};

  return Attribute;
}();

/**
 * @enum {number}
 */


Attribute.PersistentAttributeType = {
  BASIC: 0,
  ELEMENT_COLLECTION: 1,
  EMBEDDED: 2,
  MANY_TO_MANY: 3,
  MANY_TO_ONE: 4,
  ONE_TO_MANY: 5,
  ONE_TO_ONE: 6
};

module.exports = Attribute;

},{"7":7}],34:[function(_dereq_,module,exports){
"use strict";

var Type = _dereq_(47);
var GeoPoint = _dereq_(4);

/**
 * @alias baqend.metamodel.BasicType
 * @extends baqend.metamodel.Type
 */

var BasicType = function (_Type) {
  babelHelpers.inherits(BasicType, _Type);
  babelHelpers.createClass(BasicType, [{
    key: 'persistenceType',


    /**
     * The persistent type of this type
     * @type Number
     */
    get: function get() {
      return Type.PersistenceType.BASIC;
    }

    /**
     * Creates a new instance of a native db type
     * @param {String} ref The db ref of this type
     * @param {Function} typeConstructor The javascript class of this type
     * @param {Boolean=} noResolving Indicates if this type is not the main type of the constructor
     */

  }]);

  function BasicType(ref, typeConstructor, noResolving) {
    babelHelpers.classCallCheck(this, BasicType);

    if (ref.indexOf('/db/') != 0) ref = '/db/' + ref;

    /**
     * Indicates if this type is not the main type of the constructor
     * @type {Boolean}
     */

    var _this = babelHelpers.possibleConstructorReturn(this, _Type.call(this, ref, typeConstructor));

    _this.noResolving = noResolving;
    return _this;
  }

  /**
   * @inheritDoc
   */


  BasicType.prototype.toJsonValue = function toJsonValue(state, currentValue) {
    return currentValue === null || currentValue === undefined ? null : this.typeConstructor(currentValue);
  };

  /**
   * @inheritDoc
   */


  BasicType.prototype.fromJsonValue = function fromJsonValue(state, jsonValue, currentValue) {
    return jsonValue === null || jsonValue === undefined ? null : jsonValue;
  };

  BasicType.prototype.toString = function toString() {
    return "BasicType(" + this.ref + ")";
  };

  return BasicType;
}(Type);

function dateToJson(value) {
  //remove trailing zeros
  return value instanceof Date ? value.toISOString().replace(/\.?0*Z/, 'Z') : null;
}

function jsonToDate(json, currentValue) {
  var date = typeof json === 'string' ? new Date(json) : null;
  if (currentValue && date) {
    //compare normalized date strings instead of plain strings
    return currentValue.toISOString() == date.toISOString() ? currentValue : date;
  } else {
    return date;
  }
}

Object.assign(BasicType, /** @lends baqend.metamodel.BasicType */{
  Boolean: new (function (_BasicType) {
    babelHelpers.inherits(BooleanType, _BasicType);

    function BooleanType() {
      babelHelpers.classCallCheck(this, BooleanType);
      return babelHelpers.possibleConstructorReturn(this, _BasicType.apply(this, arguments));
    }

    BooleanType.prototype.fromJsonValue = function fromJsonValue(state, json, currentValue) {
      return typeof json === 'string' ? json !== "false" : _BasicType.prototype.fromJsonValue.call(this, state, json, currentValue);
    };

    return BooleanType;
  }(BasicType))('Boolean', Boolean),

  Double: new (function (_BasicType2) {
    babelHelpers.inherits(DoubleType, _BasicType2);

    function DoubleType() {
      babelHelpers.classCallCheck(this, DoubleType);
      return babelHelpers.possibleConstructorReturn(this, _BasicType2.apply(this, arguments));
    }

    DoubleType.prototype.fromJsonValue = function fromJsonValue(state, json, currentValue) {
      return typeof json === 'string' ? parseFloat(json) : _BasicType2.prototype.fromJsonValue.call(this, state, json, currentValue);
    };

    return DoubleType;
  }(BasicType))('Double', Number),

  Integer: new (function (_BasicType3) {
    babelHelpers.inherits(IntegerType, _BasicType3);

    function IntegerType() {
      babelHelpers.classCallCheck(this, IntegerType);
      return babelHelpers.possibleConstructorReturn(this, _BasicType3.apply(this, arguments));
    }

    IntegerType.prototype.fromJsonValue = function fromJsonValue(state, json, currentValue) {
      return typeof json === 'string' ? parseInt(json) : _BasicType3.prototype.fromJsonValue.call(this, state, json, currentValue);
    };

    return IntegerType;
  }(BasicType))('Integer', Number),

  String: new (function (_BasicType4) {
    babelHelpers.inherits(StringType, _BasicType4);

    function StringType() {
      babelHelpers.classCallCheck(this, StringType);
      return babelHelpers.possibleConstructorReturn(this, _BasicType4.apply(this, arguments));
    }

    return StringType;
  }(BasicType))('String', String),

  DateTime: new (function (_BasicType5) {
    babelHelpers.inherits(DateTimeType, _BasicType5);

    function DateTimeType() {
      babelHelpers.classCallCheck(this, DateTimeType);
      return babelHelpers.possibleConstructorReturn(this, _BasicType5.apply(this, arguments));
    }

    DateTimeType.prototype.toJsonValue = function toJsonValue(state, value) {
      return dateToJson(value);
    };

    DateTimeType.prototype.fromJsonValue = function fromJsonValue(state, json, currentValue) {
      return jsonToDate(json, currentValue);
    };

    return DateTimeType;
  }(BasicType))('DateTime', Date),

  Date: new (function (_BasicType6) {
    babelHelpers.inherits(DateType, _BasicType6);

    function DateType() {
      babelHelpers.classCallCheck(this, DateType);
      return babelHelpers.possibleConstructorReturn(this, _BasicType6.apply(this, arguments));
    }

    DateType.prototype.toJsonValue = function toJsonValue(state, value) {
      var json = dateToJson(value);
      return json ? json.substring(0, json.indexOf('T')) : null;
    };

    DateType.prototype.fromJsonValue = function fromJsonValue(state, json, currentValue) {
      return jsonToDate(json, currentValue);
    };

    return DateType;
  }(BasicType))('Date', Date),

  Time: new (function (_BasicType7) {
    babelHelpers.inherits(TimeType, _BasicType7);

    function TimeType() {
      babelHelpers.classCallCheck(this, TimeType);
      return babelHelpers.possibleConstructorReturn(this, _BasicType7.apply(this, arguments));
    }

    TimeType.prototype.toJsonValue = function toJsonValue(state, value) {
      var json = dateToJson(value);
      return json ? json.substring(json.indexOf('T') + 1) : null;
    };

    TimeType.prototype.fromJsonValue = function fromJsonValue(state, json, currentValue) {
      return typeof json === 'string' ? jsonToDate('1970-01-01T' + json, currentValue) : json;
    };

    return TimeType;
  }(BasicType))('Time', Date),

  GeoPoint: new (function (_BasicType8) {
    babelHelpers.inherits(GeoPointType, _BasicType8);

    function GeoPointType() {
      babelHelpers.classCallCheck(this, GeoPointType);
      return babelHelpers.possibleConstructorReturn(this, _BasicType8.apply(this, arguments));
    }

    GeoPointType.prototype.toJsonValue = function toJsonValue(state, value) {
      return value instanceof GeoPoint ? value : null;
    };

    GeoPointType.prototype.fromJsonValue = function fromJsonValue(state, json) {
      return json ? new GeoPoint(json) : null;
    };

    return GeoPointType;
  }(BasicType))('GeoPoint', GeoPoint),

  JsonArray: new (function (_BasicType9) {
    babelHelpers.inherits(JsonArrayType, _BasicType9);

    function JsonArrayType() {
      babelHelpers.classCallCheck(this, JsonArrayType);
      return babelHelpers.possibleConstructorReturn(this, _BasicType9.apply(this, arguments));
    }

    JsonArrayType.prototype.init = function init(classFactory) {
      //do not manipulate array properties
      this._enhancer = classFactory;
    };

    JsonArrayType.prototype.toJsonValue = function toJsonValue(state, value) {
      return Array.isArray(value) ? value : null;
    };

    JsonArrayType.prototype.fromJsonValue = function fromJsonValue(state, json) {
      return Array.isArray(json) ? json : null;
    };

    return JsonArrayType;
  }(BasicType))('JsonArray', Array),

  JsonObject: new (function (_BasicType10) {
    babelHelpers.inherits(JsonObjectType, _BasicType10);

    function JsonObjectType() {
      babelHelpers.classCallCheck(this, JsonObjectType);
      return babelHelpers.possibleConstructorReturn(this, _BasicType10.apply(this, arguments));
    }

    JsonObjectType.prototype.init = function init(classFactory) {
      //do not manipulate object properties
      this._enhancer = classFactory;
    };

    JsonObjectType.prototype.toJsonValue = function toJsonValue(state, value) {
      if (value && value.constructor == Object) {
        return value;
      }

      return null;
    };

    return JsonObjectType;
  }(BasicType))('JsonObject', Object)
});

module.exports = BasicType;

},{"4":4,"47":47}],35:[function(_dereq_,module,exports){
"use strict";

var PluralAttribute = _dereq_(44);

/**
 * @alias baqend.metamodel.CollectionAttribute
 * @extends baqend.metamodel.PluralAttribute
 */

var CollectionAttribute = function (_PluralAttribute) {
  babelHelpers.inherits(CollectionAttribute, _PluralAttribute);
  babelHelpers.createClass(CollectionAttribute, [{
    key: "collectionType",
    get: function get() {
      PluralAttribute.CollectionType.COLLECTION;
    }

    /**
     * @param {String} name
     * @param {baqend.metamodel.Type} elementType
     */

  }]);

  function CollectionAttribute(name, elementType) {
    babelHelpers.classCallCheck(this, CollectionAttribute);

    var _this = babelHelpers.possibleConstructorReturn(this, _PluralAttribute.call(this, name, elementType));

    _this.typeConstructor = null;
    return _this;
  }

  return CollectionAttribute;
}(PluralAttribute);

module.exports = CollectionAttribute;

},{"44":44}],36:[function(_dereq_,module,exports){
"use strict";
/**
 * Creates a new index instance which is needed to create an
 * database index.
 *
 * @alias baqend.metamodel.DbIndex
 */

var DbIndex = function () {

  /**
   * @param {String|Object|Array} keys The name of the field which will be used for the index,
   * an object of an field and index type combination or
   * an array of objects to create an compound index
   * @param {Boolean=} unique Indicates if the index will be unique
   */

  function DbIndex(keys, unique) {
    babelHelpers.classCallCheck(this, DbIndex);

    if (Object(keys) instanceof String) {
      var key = {};
      key[keys] = DbIndex.ASC;
      this.keys = [key];
    } else if (Object(keys) instanceof Array) {
      this.keys = keys;
    } else if (keys) {
      this.keys = [keys];
    } else {
      throw new Error("The keys parameter must be an String, Object or Array.");
    }

    /** @type Boolean */
    this.drop = false;
    this.unique = unique === true;
  }

  DbIndex.prototype.hasKey = function hasKey(name) {
    for (var i = 0; i < this.keys.length; i++) {
      if (this.keys[i][name]) {
        return true;
      }
    }
    return false;
  };

  /**
   * Returns a JSON representation of the Index object
   *
   * @return {Object} A Json of this Index object
   */

  DbIndex.prototype.toJSON = function toJSON() {
    return {
      unique: this.unique,
      keys: this.keys,
      drop: this.drop
    };
  };

  babelHelpers.createClass(DbIndex, [{
    key: "isCompound",
    get: function get() {
      return this.keys.length > 1;
    }
  }, {
    key: "isUnique",
    get: function get() {
      return this.unique;
    }
  }]);
  return DbIndex;
}();

Object.assign(DbIndex, {
  /**
   * @type String
   */
  ASC: 'asc',

  /**
   * @type String
   */
  DESC: 'desc',

  /**
   * @type String
   */
  GEO: 'geo',

  /**
   * Returns DbIndex Object created from the given JSON
   */
  fromJSON: function fromJSON(json) {
    return new DbIndex(json.keys, json.unique);
  }
});

module.exports = DbIndex;

},{}],37:[function(_dereq_,module,exports){
"use strict";

var ManagedType = _dereq_(40);
var Type = _dereq_(47);
var binding = _dereq_(17);

/**
 * @alias baqend.metamodel.EmbeddableType
 * @extends baqend.metamodel.ManagedType
 */

var EmbeddableType = function (_ManagedType) {
  babelHelpers.inherits(EmbeddableType, _ManagedType);
  babelHelpers.createClass(EmbeddableType, [{
    key: 'persistenceType',
    get: function get() {
      return Type.PersistenceType.EMBEDDABLE;
    }
  }]);

  function EmbeddableType(name, typeConstructor) {
    babelHelpers.classCallCheck(this, EmbeddableType);
    return babelHelpers.possibleConstructorReturn(this, _ManagedType.call(this, name, typeConstructor));
  }

  /**
   * {@inheritDoc}
   */


  EmbeddableType.prototype.createProxyClass = function createProxyClass() {
    return this._enhancer.createProxy(binding.Managed);
  };

  /**
   * {@inheritDoc}
   * @param {baqend.EntityManager} db {@inheritDoc}
   * @return {baqend.binding.ManagedFactory} A factory which creates embeddable objects
   */


  EmbeddableType.prototype.createObjectFactory = function createObjectFactory(db) {
    return binding.ManagedFactory.create(this, db);
  };

  /**
   * @inheritDoc
   */


  EmbeddableType.prototype.toJsonValue = function toJsonValue(state, object) {
    if (state._root && object instanceof this.typeConstructor && !object._metadata._root) {
      object._metadata._root = state._root;
    }

    return _ManagedType.prototype.toJsonValue.call(this, state, object);
  };

  /**
   * @inheritDoc
   */


  EmbeddableType.prototype.fromJsonValue = function fromJsonValue(state, jsonObject, currentObject) {
    if (jsonObject) {
      if (!(currentObject instanceof this.typeConstructor)) currentObject = this.create();

      if (state._root && !currentObject._metadata._root) currentObject._metadata._root = state._root;
    }

    return _ManagedType.prototype.fromJsonValue.call(this, state, jsonObject, currentObject);
  };

  EmbeddableType.prototype.toString = function toString() {
    return "EmbeddableType(" + this.ref + ")";
  };

  return EmbeddableType;
}(ManagedType);

module.exports = EmbeddableType;

},{"17":17,"40":40,"47":47}],38:[function(_dereq_,module,exports){
"use strict";

var binding = _dereq_(17);

var SingularAttribute = _dereq_(46);
var BasicType = _dereq_(34);
var Type = _dereq_(47);
var ManagedType = _dereq_(40);
var util = _dereq_(60);

/**
 * @alias baqend.metamodel.EntityType
 * @extends baqend.metamodel.ManagedType
 */

var EntityType = function (_ManagedType) {
  babelHelpers.inherits(EntityType, _ManagedType);
  babelHelpers.createClass(EntityType, [{
    key: 'persistenceType',
    get: function get() {
      return Type.PersistenceType.ENTITY;
    }

    /**
     * @type baqend.metamodel.SingularAttribute
     */

  }, {
    key: 'id',
    get: function get() {
      return this.declaredId || this.superType.id;
    }

    /**
     * @type baqend.metamodel.SingularAttribute
     */

  }, {
    key: 'version',
    get: function get() {
      return this.declaredVersion || this.superType.version;
    }

    /**
     * @type baqend.metamodel.SingularAttribute
     */

  }, {
    key: 'acl',
    get: function get() {
      return this.declaredAcl || this.superType.acl;
    }

    /**
     * @param {String} ref
     * @param {baqend.metamodel.EntityType} superType
     * @param {Function} typeConstructor
     */

  }]);

  function EntityType(ref, superType, typeConstructor) {
    babelHelpers.classCallCheck(this, EntityType);


    /** @type baqend.metamodel.SingularAttribute */

    var _this = babelHelpers.possibleConstructorReturn(this, _ManagedType.call(this, ref, typeConstructor));

    _this.declaredId = null;
    /** @type baqend.metamodel.SingularAttribute */
    _this.declaredVersion = null;
    /** @type baqend.metamodel.SingularAttribute */
    _this.declaredAcl = null;
    /** @type baqend.metamodel.EntityType */
    _this.superType = superType;

    /** @type baqend.util.Permission */
    _this.loadPermission = new util.Permission();
    /** @type baqend.util.Permission */
    _this.updatePermission = new util.Permission();
    /** @type baqend.util.Permission */
    _this.deletePermission = new util.Permission();
    /** @type baqend.util.Permission */
    _this.queryPermission = new util.Permission();
    /** @type baqend.util.Permission */
    _this.schemaSubclassPermission = new util.Permission();
    /** @type baqend.util.Permission */
    _this.insertPermission = new util.Permission();
    return _this;
  }

  /**
   * {@inheritDoc}
   */


  EntityType.prototype.createProxyClass = function createProxyClass() {
    var Class = this.superType.typeConstructor;
    if (Class === Object) {
      switch (this.name) {
        case 'User':
          Class = binding.User;
          break;
        case 'Role':
          Class = binding.Role;
          break;
        default:
          Class = binding.Entity;
          break;
      }
    }

    return this._enhancer.createProxy(Class);
  };

  /**
   * {@inheritDoc}
   * Creates an ObjectFactory for this type and the given EntityManager
   * @return {baqend.binding.EntityFactory} A factory which creates entity objects
   */


  EntityType.prototype.createObjectFactory = function createObjectFactory(db) {
    switch (this.name) {
      case 'User':
        return binding.UserFactory.create(this, db);
      case 'Device':
        return binding.DeviceFactory.create(this, db);
      case 'Object':
        return undefined;
    }

    return binding.EntityFactory.create(this, db);
  };

  /**
   * @inheritDoc
   */


  EntityType.prototype.fromJsonValue = function fromJsonValue(state, jsonObject, currentObject, isRoot) {
    if (isRoot) {
      return _ManagedType.prototype.fromJsonValue.call(this, state, jsonObject, currentObject);
    } else if (jsonObject) {
      return state.db.getReference(jsonObject);
    } else {
      return null;
    }
  };

  /**
   * @inheritDoc
   */


  EntityType.prototype.toJsonValue = function toJsonValue(state, object, isRoot) {
    if (isRoot) {
      return _ManagedType.prototype.toJsonValue.call(this, state, object);
    } else if (object instanceof this.typeConstructor) {
      object.attach(state.db);
      return object.id;
    } else {
      return null;
    }
  };

  EntityType.prototype.toString = function toString() {
    return "EntityType(" + this.ref + ")";
  };

  EntityType.prototype.toJSON = function toJSON() {
    var json = _ManagedType.prototype.toJSON.call(this);

    json.acl.schemaSubclass = this.schemaSubclassPermission;
    json.acl.insert = this.insertPermission;
    json.acl.update = this.updatePermission;
    json.acl.delete = this.deletePermission;
    json.acl.query = this.queryPermission;

    return json;
  };

  return EntityType;
}(ManagedType);

/**
 * @class baqend.metamodel.EntityType.Object
 * @extends baqend.metamodel.EntityType
 */


EntityType.Object = function (_EntityType) {
  babelHelpers.inherits(ObjectType, _EntityType);
  babelHelpers.createClass(ObjectType, null, [{
    key: 'ref',
    get: function get() {
      return '/db/Object';
    }
  }]);

  function ObjectType() {
    babelHelpers.classCallCheck(this, ObjectType);

    var _this2 = babelHelpers.possibleConstructorReturn(this, _EntityType.call(this, EntityType.Object.ref, null, Object));

    _this2.declaredId = new SingularAttribute('id', BasicType.String, true);
    _this2.declaredId.init(_this2, 0);
    _this2.declaredId.isId = true;
    _this2.declaredVersion = new SingularAttribute('version', BasicType.Double, true);
    _this2.declaredVersion.init(_this2, 1);
    _this2.declaredVersion.isVersion = true;
    _this2.declaredAcl = new SingularAttribute('acl', BasicType.JsonObject, true);
    _this2.declaredAcl.init(_this2, 2);
    _this2.declaredAcl.isAcl = true;

    _this2.declaredAttributes = [_this2.declaredId, _this2.declaredVersion, _this2.declaredAcl];
    return _this2;
  }

  return ObjectType;
}(EntityType);

module.exports = EntityType;

},{"17":17,"34":34,"40":40,"46":46,"47":47,"60":60}],39:[function(_dereq_,module,exports){
"use strict";

var PluralAttribute = _dereq_(44);

/**
 * @alias baqend.metamodel.ListAttribute
 * @extends baqend.metamodel.PluralAttribute
 */

var ListAttribute = function (_PluralAttribute) {
  babelHelpers.inherits(ListAttribute, _PluralAttribute);
  babelHelpers.createClass(ListAttribute, [{
    key: 'collectionType',
    get: function get() {
      return PluralAttribute.CollectionType.LIST;
    }

    /**
     * @param {String} name
     * @param {baqend.metamodel.Type} elementType
     */

  }], [{
    key: 'ref',
    get: function get() {
      return '/db/collection.List';
    }
  }]);

  function ListAttribute(name, elementType) {
    babelHelpers.classCallCheck(this, ListAttribute);

    var _this = babelHelpers.possibleConstructorReturn(this, _PluralAttribute.call(this, name, elementType));

    _this.typeConstructor = Array;
    return _this;
  }

  /**
   * @inheritDoc
   */


  ListAttribute.prototype.getJsonValue = function getJsonValue(state, object) {
    var value = this.getValue(object);

    if (value instanceof this.typeConstructor) {
      var len = value.length;
      var persisting = new Array(len),
          persistedState = value.__persistedState__ || [];
      var changed = persistedState.length != len;

      var json = new Array(len);
      for (var i = 0; i < len; ++i) {
        var el = value[i];
        json[i] = this.elementType.toJsonValue(state, el);
        persisting[i] = el;

        changed |= persistedState[i] !== el;
      }

      if (!state.isReady) {
        Object.defineProperty(value, '__persistedState__', { value: persisting, configurable: true });

        if (state.isPersistent && changed) state.setDirty();
      }

      return json;
    } else {
      return null;
    }
  };

  /**
   * {@inheritDoc}
   */


  ListAttribute.prototype.setJsonValue = function setJsonValue(state, obj, json) {
    var value = null;

    if (json) {
      value = this.getValue(obj);

      var len = json.length;
      if (!(value instanceof this.typeConstructor)) {
        value = new this.typeConstructor(len);
      }

      var persisting = new Array(len),
          persistedState = value.__persistedState__ || [];

      //clear additional items
      if (len < value.length) value.splice(len, value.length - len);

      for (var i = 0; i < len; ++i) {
        var el = this.elementType.fromJsonValue(state, json[i], persistedState[i]);
        persisting[i] = value[i] = el;
      }

      if (!state.isReady) {
        Object.defineProperty(value, '__persistedState__', { value: persisting, configurable: true });
      }
    }

    this.setValue(obj, value);
  };

  /**
   * {@inheritDoc}
   * @returns {Object} {@inheritDoc}
   */


  ListAttribute.prototype.toJSON = function toJSON() {
    return {
      name: this.name,
      type: ListAttribute.ref + '[' + this.elementType.ref + ']',
      order: this.order
    };
  };

  return ListAttribute;
}(PluralAttribute);

module.exports = ListAttribute;

},{"44":44}],40:[function(_dereq_,module,exports){
"use strict";

var Type = _dereq_(47);
var Permission = _dereq_(55);
var Validator = _dereq_(59);
var binding = _dereq_(17);

/**
 * @alias baqend.metamodel.ManagedType
 * @extends baqend.metamodel.Type
 */

var ManagedType = function (_Type) {
  babelHelpers.inherits(ManagedType, _Type);
  babelHelpers.createClass(ManagedType, [{
    key: 'validationCode',


    /**
     * @type Function
     */
    get: function get() {
      return this._validationCode;
    },
    set: function set(code) {
      if (!code) {
        this._validationCode = null;
      } else {
        this._validationCode = Validator.compile(this, code);
      }
    }

    /**
     * The Managed class
     * @type Class<baqend.binding.Managed>
     */

  }, {
    key: 'typeConstructor',
    get: function get() {
      if (!this._typeConstructor) {
        this.typeConstructor = this.createProxyClass();
      }
      return this._typeConstructor;
    },
    set: function set(typeConstructor) {
      if (this._typeConstructor) {
        throw new Error("Type constructor has already been set.");
      }

      var isEntity = typeConstructor.prototype instanceof binding.Entity;
      if (this.isEntity) {
        if (!isEntity) throw new TypeError("Entity classes must extends the Entity class.");
      } else {
        if (!(typeConstructor.prototype instanceof binding.Managed) || isEntity) throw new TypeError("Embeddable classes must extends the Managed class.");
      }

      this._enhancer.enhance(this, typeConstructor);
      this._typeConstructor = typeConstructor;
    }

    /**
     * @param {String} ref or full class name
     * @param {Function} typeConstructor
     */

  }]);

  function ManagedType(ref, typeConstructor) {
    babelHelpers.classCallCheck(this, ManagedType);


    /** @type baqend.binding.Enhancer */

    var _this = babelHelpers.possibleConstructorReturn(this, _Type.call(this, ref.indexOf('/db/') != 0 ? '/db/' + ref : ref, typeConstructor));

    _this._enhancer = null;
    /** @type {baqend.metamodel.Attribute[]} */
    _this.declaredAttributes = [];

    /** @type baqend.util.Permission */
    _this.schemaAddPermission = new Permission();
    /** @type baqend.util.Permission */
    _this.schemaReplacePermission = new Permission();
    return _this;
  }

  /**
   * Initialize this type
   * @param {baqend.binding.Enhancer} enhancer The class enhancer
   * used to enhance and instantiate instance of this managed class
   */


  ManagedType.prototype.init = function init(enhancer) {
    this._enhancer = enhancer;

    if (this._typeConstructor && !this._enhancer.getIdentifier(this._typeConstructor)) this._enhancer.setIdentifier(this._typeConstructor, this.ref);
  };

  /**
   * Creates an ProxyClass for this type
   * @return {Class<baqend.binding.Managed>} the crated proxy class for this type
   * @abstract
   */


  ManagedType.prototype.createProxyClass = function createProxyClass() {};

  /**
   * Creates an ObjectFactory for this type and the given EntityManager
   * @param {baqend.EntityManager} db The created instances will be attached to this EntityManager
   * @return {baqend.binding.ManagedFactory} the crated object factory for the given EntityManager
   * @abstract
   */


  ManagedType.prototype.createObjectFactory = function createObjectFactory(db) {};

  /**
   * Creates a new instance of the managed type, without invoking any constructors
   * This method is used to create object instances which are loaded form the backend
   * @param {Array<*>=} a If provided, calls the constructor by creating the instance,
   * otherwise instance will be created without invoking the constructor
   * @returns {Object} The created instance
   * @abstract
   */


  ManagedType.prototype.create = function create(a) {
    var instance;
    if (!a) {
      instance = Object.create(this.typeConstructor.prototype);
      binding.Managed.init(instance);
    } else if (a.length == 0) {
      instance = new this.typeConstructor();
    } else {
      //es6 constructors can't be called, therfore we must provide all arguments separately
      //TODO: uggly! replace this with the spread operator if node support it
      instance = new this.typeConstructor(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]);
    }

    return instance;
  };

  /**
   * An iterator which returns all attributes declared by this type and inherited form all super types
   * @return {Iterator<baqend.metamodel.Attribute>}
   */


  ManagedType.prototype.attributes = function attributes() {
    var _ref;

    var iter = void 0,
        index = 0,
        type = this;
    if (this.superType) {
      iter = this.superType.attributes();
    }

    return _ref = {}, _ref[Symbol.iterator] = function () {
      return this;
    }, _ref.next = function next() {
      if (iter) {
        var item = iter.next();
        if (item.done) {
          iter = null;
        } else {
          return item;
        }
      }

      if (index < type.declaredAttributes.length) {
        return {
          value: type.declaredAttributes[index++],
          done: false
        };
      } else {
        return { done: true };
      }
    }, _ref;
  };

  /**
   * Adds an attribute to this type
   * @param {baqend.metamodel.Attribute} attr The attribute to add
   * @param {Number=} order Position of the attribute
   */


  ManagedType.prototype.addAttribute = function addAttribute(attr, order) {
    if (this.getAttribute(attr.name)) throw new Error("An attribute with the name " + attr.name + " is already declared.");

    if (attr.order == null) {
      order = typeof order == 'undefined' ? this.declaredAttributes.length : order;
    } else {
      order = attr.order;
    }
    attr.init(this, order);

    this.declaredAttributes.push(attr);
    if (this._typeConstructor && this.name != 'Object') this._enhancer.enhanceProperty(this._typeConstructor, attr);
  };

  /**
   * Removes an attribute from this type
   * @param {String} name The Name of the attribute which will be removed
   */


  ManagedType.prototype.removeAttribute = function removeAttribute(name) {
    var length = this.declaredAttributes.length;
    this.declaredAttributes = this.declaredAttributes.filter(function (val) {
      return val.name != name;
    });

    if (length == this.declaredAttributes.length) throw new Error("An Attribute with the name " + name + " is not declared.");
  };

  /**
   * @param {!String} name
   * @returns {baqend.metamodel.Attribute}
   */


  ManagedType.prototype.getAttribute = function getAttribute(name) {
    var attr = this.getDeclaredAttribute(name);

    if (!attr && this.superType) {
      attr = this.superType.getAttribute(name);
    }

    return attr;
  };

  /**
   * @param {String|Number} val Name or order of the attribute
   * @returns {baqend.metamodel.Attribute}
   */


  ManagedType.prototype.getDeclaredAttribute = function getDeclaredAttribute(val) {
    for (var _iterator = this.declaredAttributes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref2 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref2 = _i.value;
      }

      var attr = _ref2;

      if (attr.name === val || attr.order === val) {
        return attr;
      }
    }

    return null;
  };

  /**
   * @inheritDoc
   */


  ManagedType.prototype.fromJsonValue = function fromJsonValue(state, jsonObject, currentObject) {
    if (jsonObject) {
      for (var _iterator2 = this.attributes(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
        var _ref3;

        if (_isArray2) {
          if (_i2 >= _iterator2.length) break;
          _ref3 = _iterator2[_i2++];
        } else {
          _i2 = _iterator2.next();
          if (_i2.done) break;
          _ref3 = _i2.value;
        }

        var attribute = _ref3;

        if (!attribute.isMetadata) attribute.setJsonValue(state, currentObject, jsonObject[attribute.name]);
      }
    } else {
      currentObject = null;
    }

    return currentObject;
  };

  /**
   * @inheritDoc
   */


  ManagedType.prototype.toJsonValue = function toJsonValue(state, object) {
    var value = null;

    if (object instanceof this.typeConstructor) {
      value = {};
      for (var _iterator3 = this.attributes(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
        var _ref4;

        if (_isArray3) {
          if (_i3 >= _iterator3.length) break;
          _ref4 = _iterator3[_i3++];
        } else {
          _i3 = _iterator3.next();
          if (_i3.done) break;
          _ref4 = _i3.value;
        }

        var attribute = _ref4;

        if (!attribute.isMetadata) value[attribute.name] = attribute.getJsonValue(state, object);
      }
    }

    return value;
  };

  /**
   * Converts ths type schema to json
   * @returns {Object}
   */


  ManagedType.prototype.toJSON = function toJSON() {
    var json = {};
    json['class'] = this.ref;

    if (this.superType) json['superClass'] = this.superType.ref;

    if (this.isEmbeddable) json['embedded'] = true;

    json['acl'] = {
      load: this.loadPermission,
      schemaAdd: this.schemaAddPermission,
      schemaReplace: this.schemaReplacePermission
    };

    var fields = json['fields'] = {};
    for (var _iterator4 = this.declaredAttributes, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
      var _ref5;

      if (_isArray4) {
        if (_i4 >= _iterator4.length) break;
        _ref5 = _iterator4[_i4++];
      } else {
        _i4 = _iterator4.next();
        if (_i4.done) break;
        _ref5 = _i4.value;
      }

      var attribute = _ref5;

      if (!attribute.isMetadata) fields[attribute.name] = attribute;
    }

    return json;
  };

  /**
   * Returns iterator to get all referenced entities
   * @return {Iterator<EntityType>}
   */


  ManagedType.prototype.references = function references() {
    var _ref8;

    var attributes = this.attributes();
    var embedded = [];

    return _ref8 = {}, _ref8[Symbol.iterator] = function () {
      return this;
    }, _ref8.next = function next() {
      for (var _iterator5 = attributes, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
        var _ref6;

        if (_isArray5) {
          if (_i5 >= _iterator5.length) break;
          _ref6 = _iterator5[_i5++];
        } else {
          _i5 = _iterator5.next();
          if (_i5.done) break;
          _ref6 = _i5.value;
        }

        var attribute = _ref6;

        var type = attribute.isCollection ? attribute.elementType : attribute.type;
        if (type.isEntity) {
          return { done: false, value: { path: [attribute.name] } };
        } else if (type.isEmbeddable) {
          for (var _iterator6 = type.references(), _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : _iterator6[Symbol.iterator]();;) {
            var _ref7;

            if (_isArray6) {
              if (_i6 >= _iterator6.length) break;
              _ref7 = _iterator6[_i6++];
            } else {
              _i6 = _iterator6.next();
              if (_i6.done) break;
              _ref7 = _i6.value;
            }

            var emItem = _ref7;

            embedded.push({ done: false, value: { path: [attribute.name].concat(emItem.path) } });
          }
        }
      }

      return embedded.length ? embedded.pop() : { done: true };
    }, _ref8;
  };

  return ManagedType;
}(Type);

module.exports = ManagedType;

},{"17":17,"47":47,"55":55,"59":59}],41:[function(_dereq_,module,exports){
"use strict";

var PluralAttribute = _dereq_(44);
var PersistentError = _dereq_(29);

/**
 * @alias baqend.metamodel.MapAttribute
 * @extends baqend.metamodel.PluralAttribute
 */

var MapAttribute = function (_PluralAttribute) {
  babelHelpers.inherits(MapAttribute, _PluralAttribute);
  babelHelpers.createClass(MapAttribute, [{
    key: 'collectionType',
    get: function get() {
      return PluralAttribute.CollectionType.MAP;
    }

    /**
     * @param {String} name
     * @param {baqend.metamodel.Type} keyType
     * @param {baqend.metamodel.Type} elementType
     */

  }], [{
    key: 'ref',
    get: function get() {
      return '/db/collection.Map';
    }
  }]);

  function MapAttribute(name, keyType, elementType) {
    babelHelpers.classCallCheck(this, MapAttribute);

    /** @type baqend.metamodel.Type */

    var _this = babelHelpers.possibleConstructorReturn(this, _PluralAttribute.call(this, name, elementType));

    _this.keyType = keyType;
    _this.typeConstructor = Map;
    return _this;
  }

  /**
   * @inheritDoc
   */


  MapAttribute.prototype.getJsonValue = function getJsonValue(state, object) {
    var value = this.getValue(object);

    if (value instanceof this.typeConstructor) {
      var persisting = {},
          persistedState = value.__persistedState__ || {};
      var changed = value.__persistedSize__ !== value.size;

      var json = {};
      for (var _iterator = value.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var entry = _ref;

        if (entry[0] === null || entry[0] === undefined) throw new PersistentError('Map keys can\'t be null nor undefined.');

        var jsonKey = this.keyType.toJsonValue(state, entry[0]);
        json[jsonKey] = this.elementType.toJsonValue(state, entry[1]);

        persisting[jsonKey] = [entry[0], entry[1]];
        changed |= (persistedState[jsonKey] || [])[1] !== entry[1];
      }

      if (!state.isReady) {
        Object.defineProperties(value, {
          '__persistedState__': { value: persisting, configurable: true },
          '__persistedSize__': { value: value.size, configurable: true }
        });

        if (state.isPersistent && changed) state.setDirty();
      }

      return json;
    } else {
      return null;
    }
  };

  /**
   * @inheritDoc
   */


  MapAttribute.prototype.setJsonValue = function setJsonValue(state, obj, json) {
    var value = null;
    if (json) {
      value = this.getValue(obj);

      if (!(value instanceof this.typeConstructor)) {
        value = new this.typeConstructor();
      }

      var persisting = {},
          persistedState = value.__persistedState__ || {};

      value.clear();
      for (var jsonKey in json) {
        var persistedEntry = persistedState[jsonKey] || [];
        // ensure that "false" keys will be converted to false
        var key = this.keyType.fromJsonValue(state, jsonKey, persistedEntry[0]);
        var val = this.elementType.fromJsonValue(state, json[jsonKey], persistedEntry[1]);

        persisting[jsonKey] = [key, value];
        value.set(key, val);
      }

      if (!state.isReady) {
        Object.defineProperties(value, {
          '__persistedState__': { value: persisting, configurable: true },
          '__persistedSize__': { value: value.size, configurable: true }
        });
      }
    }

    this.setValue(obj, value);
  };

  /**
   * {@inheritDoc}
   * @returns {Object} {@inheritDoc}
   */


  MapAttribute.prototype.toJSON = function toJSON() {
    return {
      name: this.name,
      type: MapAttribute.ref + '[' + this.keyType.ref + ',' + this.elementType.ref + ']',
      order: this.order
    };
  };

  return MapAttribute;
}(PluralAttribute);

module.exports = MapAttribute;

},{"29":29,"44":44}],42:[function(_dereq_,module,exports){
"use strict";

var BasicType = _dereq_(34);
var ManagedType = _dereq_(40);
var EntityType = _dereq_(38);
var Enhancer = _dereq_(9);
var ModelBuilder = _dereq_(43);
var DbIndex = _dereq_(36);
var Lockable = _dereq_(51);
var StatusCode = _dereq_(22).StatusCode;

var message = _dereq_(32);

/**
 * @alias baqend.metamodel.Metamodel
 * @extends baqend.util.Lockable
 */

var Metamodel = function (_Lockable) {
  babelHelpers.inherits(Metamodel, _Lockable);

  function Metamodel(entityManagerFactory) {
    babelHelpers.classCallCheck(this, Metamodel);


    /**
     * Defines if the Metamodel has been finalized
     * @type Boolean
     */

    var _this = babelHelpers.possibleConstructorReturn(this, _Lockable.call(this));

    _this.isInitialized = false;

    /**
     * @type baqend.EntityManagerFactory
     */
    _this.entityManagerFactory = entityManagerFactory;

    /**
     * @type Array.<baqend.metamodel.EntityType>
     */
    _this.entities = null;

    /**
     * @type Array.<baqend.metamodel.EmbeddableType>
     */
    _this.embeddables = null;

    /**
     * @type Array.<baqend.metamodel.BasicType>
     */
    _this.baseTypes = null;

    _this._enhancer = new Enhancer();
    return _this;
  }

  /**
   * Prepare the Metamodel for custom schema creation
   * @param {Object=} jsonMetamodel initialize the metamodel with the serialized json schema
   */


  Metamodel.prototype.init = function init(jsonMetamodel) {
    if (this.isInitialized) {
      throw new Error('Metamodel is already initialized.');
    }

    this.fromJSON(jsonMetamodel || []);
    this.isInitialized = true;
  };

  /**
   * @param {(Function|String)} arg
   * @return {String}
   */


  Metamodel.prototype._getRef = function _getRef(arg) {
    var ref;
    if (Object(arg) instanceof String) {
      ref = arg;

      if (ref.indexOf('/db/') != 0) {
        ref = '/db/' + arg;
      }
    } else {
      ref = this._enhancer.getIdentifier(arg);
    }

    return ref;
  };

  /**
   * Return the metamodel entity type representing the entity.
   *
   * @param {(Function|String)} typeConstructor - the type of the represented entity
   * @returns {baqend.metamodel.EntityType} the metamodel entity type
   */


  Metamodel.prototype.entity = function entity(typeConstructor) {
    var ref = this._getRef(typeConstructor);
    return ref ? this.entities[ref] : null;
  };

  /**
   * Return the metamodel basic type representing the native class.
   * @param {(Function|String)} typeConstructor - the type of the represented native class
   * @returns {baqend.metamodel.BasicType} the metamodel basic type
   */


  Metamodel.prototype.baseType = function baseType(typeConstructor) {
    var ref = null;
    if (Object(typeConstructor) instanceof String) {
      ref = this._getRef(typeConstructor);
    } else {
      for (var name in this.baseTypes) {
        var type = this.baseTypes[name];
        if (!type.noResolving && type.typeConstructor == typeConstructor) {
          ref = name;
          break;
        }
      }
    }

    return ref ? this.baseTypes[ref] : null;
  };

  /**
   * Return the metamodel embeddable type representing the embeddable class.
   * @param {(Function|String)} typeConstructor - the type of the represented embeddable class
   * @returns {baqend.metamodel.EmbeddableType} the metamodel embeddable type
   */


  Metamodel.prototype.embeddable = function embeddable(typeConstructor) {
    var ref = this._getRef(typeConstructor);
    return ref ? this.embeddables[ref] : null;
  };

  /**
   * Return the metamodel managed type representing the entity, mapped superclass, or embeddable class.
   *
   * @param {(Function|String)} typeConstructor - the type of the represented managed class
   * @returns {baqend.metamodel.Type} the metamodel managed type
   */


  Metamodel.prototype.managedType = function managedType(typeConstructor) {
    return this.baseType(typeConstructor) || this.entity(typeConstructor) || this.embeddable(typeConstructor);
  };

  /**
   * @param {baqend.metamodel.Type} type
   * @return the added type
   */


  Metamodel.prototype.addType = function addType(type) {
    var types;

    if (type.isBasic) {
      types = this.baseTypes;
    } else if (type.isEmbeddable) {
      type.init(this._enhancer);
      types = this.embeddables;
    } else if (type.isEntity) {
      type.init(this._enhancer);
      types = this.entities;

      if (type.superType == null && type.ref != EntityType.Object.ref) {
        type.superType = this.entity(EntityType.Object.ref);
      }
    }

    if (types[type.ref]) {
      throw new Error("The type " + type.ref + " is already declared.");
    }

    return types[type.ref] = type;
  };

  /**
   * Load all schema data from the server
   * @returns {Promise<baqend.metamodel.Metamodel>}
   */


  Metamodel.prototype.load = function load() {
    var _this2 = this;

    if (!this.isInitialized) {
      return this.withLock(function () {
        var msg = new message.GetAllSchemas();

        return _this2.entityManagerFactory.send(msg).then(function (message) {
          _this2.init(message.response.entity);
          return _this2;
        });
      });
    } else {
      throw new Error("Metamodel is already initialized.");
    }
  };

  /**
   * Store all local schema data on the server, or the provided one
   *
   * Note: The schema must be initialized, by init or load
   *
   * @param {baqend.metamodel.ManagedType=} managedType The specific type to persist, if omitted the complete schema will be updated
   * @returns {Promise<baqend.metamodel.Metamodel>}
   */


  Metamodel.prototype.save = function save(managedType) {
    var _this3 = this;

    return this._send(managedType || this.toJSON()).then(function () {
      return _this3;
    });
  };

  /**
   * The provided options object will be forwarded to the UpdateAllSchemas resource.
   * The underlying schema of this Metamodel object will be replaced by the result.
   *
   * @param {Object} data The JSON which will be send to the UpdateAllSchemas resource.
   * @returns {Promise<baqend.metamodel.Metamodel>}
   */


  Metamodel.prototype.update = function update(data) {
    var _this4 = this;

    return this._send(data).then(function (message) {
      _this4.fromJSON(message.response.entity);
      return _this4;
    });
  };

  Metamodel.prototype._send = function _send(data) {
    var _this5 = this;

    if (!this.isInitialized) throw new Error("Metamodel is not initialized.");

    return this.withLock(function () {
      var msg;
      if (data instanceof ManagedType) {
        msg = new message.UpdateSchema(data.name, data.toJSON());
      } else {
        msg = new message.UpdateAllSchemas(data);
      }

      return _this5.entityManagerFactory.send(msg);
    });
  };

  /**
   * Get the current schema types as json
   * @returns {object} the json data
   */


  Metamodel.prototype.toJSON = function toJSON() {
    var json = [];

    for (var ref in this.entities) {
      json.push(this.entities[ref]);
    }

    for (ref in this.embeddables) {
      json.push(this.embeddables[ref]);
    }

    return json;
  };

  /**
   * Replace the current schema by the provided one in json
   * @param json The json schema data
   */


  Metamodel.prototype.fromJSON = function fromJSON(json) {
    var builder = new ModelBuilder();
    var models = builder.buildModels(json);

    this.baseTypes = {};
    this.embeddables = {};
    this.entities = {};

    for (var ref in models) {
      var type = models[ref];
      this.addType(type);
    }
  };

  /**
   * Creates an index
   *
   * @param {String} bucket Name of the Bucket
   * @param {baqend.metamodel.DbIndex} index Will be applied for the given bucket
   * @return {Promise}
   */


  Metamodel.prototype.createIndex = function createIndex(bucket, index) {
    index.drop = false;
    var msg = new message.CreateDropIndex(bucket, index.toJSON());
    return this.entityManagerFactory.send(msg);
  };

  /**
   * Drops an index
   *
   * @param {String} bucket Name of the Bucket
   * @param {baqend.metamodel.DbIndex} index Will be dropped for the given bucket
   * @return {Promise}
   */


  Metamodel.prototype.dropIndex = function dropIndex(bucket, index) {
    index.drop = true;
    var msg = new message.CreateDropIndex(bucket, index.toJSON());
    return this.entityManagerFactory.send(msg);
  };

  /**
   * Drops all indexes
   *
   * @param bucket Indexes will be dropped for the given bucket
   * @returns {Promise}
   */


  Metamodel.prototype.dropAllIndexes = function dropAllIndexes(bucket) {
    var msg = new message.DropAllIndexes(bucket);
    return this.entityManagerFactory.send(msg);
  };

  /**
   * Loads all indexes for the given bucket
   *
   * @param bucket Current indexes will be loaded for the given bucket
   * @returns {Promise<Array<baqend.metamodel.DbIndex>>}
   */


  Metamodel.prototype.getIndexes = function getIndexes(bucket) {
    var msg = new message.ListIndexes(bucket);
    return this.entityManagerFactory.send(msg).then(function (data) {
      return data.response.entity.map(function (el) {
        return new DbIndex(el.keys, el.unique);
      });
    }, function (e) {
      if (e.status == StatusCode.BUCKET_NOT_FOUND || e.status == StatusCode.OBJECT_NOT_FOUND) {
        return null;
      } else {
        throw e;
      }
    });
  };

  return Metamodel;
}(Lockable);

module.exports = Metamodel;

},{"22":22,"32":32,"34":34,"36":36,"38":38,"40":40,"43":43,"51":51,"9":9}],43:[function(_dereq_,module,exports){
"use strict";

var BasicType = _dereq_(34);
var EntityType = _dereq_(38);
var EmbeddableType = _dereq_(37);

var ListAttribute = _dereq_(39);
var MapAttribute = _dereq_(41);
var SetAttribute = _dereq_(45);
var SingularAttribute = _dereq_(46);

var PersistentError = _dereq_(29);

/**
 * @alias baqend.metamodel.ModelBuilder
 */

var ModelBuilder = function () {
  /**
   * @param {baqend.metamodel.Metamodel} metamodel
   */

  function ModelBuilder() {
    babelHelpers.classCallCheck(this, ModelBuilder);

    /** @type Object<string,baqend.metamodel.ManagedType> */
    this.models = {};

    /** @type Object<string,Object> */
    this.modelDescriptors = null;

    for (var _iterator = Object.keys(BasicType), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var typeName = _ref;

      var basicType = BasicType[typeName];
      if (basicType instanceof BasicType) {
        this.models[basicType.ref] = basicType;
      }
    }
  }

  /**
   * @param {String} ref
   * @returns {baqend.metamodel.ManagedType}
   */


  ModelBuilder.prototype.getModel = function getModel(ref) {
    if (ref in this.models) {
      return this.models[ref];
    } else {
      return this.models[ref] = this.buildModel(ref);
    }
  };

  /**
   * @param {Object[]} modelDescriptors
   * @returns {Object<string,baqend.metamodel.ManagedType>}
   */


  ModelBuilder.prototype.buildModels = function buildModels(modelDescriptors) {
    this.modelDescriptors = {};
    for (var i = 0, modelDescriptor; modelDescriptor = modelDescriptors[i]; ++i) {
      this.modelDescriptors[modelDescriptor['class']] = modelDescriptor;
    }

    for (var ref in this.modelDescriptors) {
      try {
        var model = this.getModel(ref);
        this.buildAttributes(model);
      } catch (e) {
        throw new PersistentError('Can\'t create model for entity class ' + ref, e);
      }
    }

    //ensure at least an object entity
    this.getModel(EntityType.Object.ref);

    return this.models;
  };

  /**
   * @param {String} ref
   * @returns {baqend.metamodel.ManagedType}
   */


  ModelBuilder.prototype.buildModel = function buildModel(ref) {
    var modelDescriptor = this.modelDescriptors[ref];
    var type;
    if (ref == EntityType.Object.ref) {
      type = new EntityType.Object();
    } else if (modelDescriptor) {
      if (modelDescriptor.embedded) {
        type = new EmbeddableType(ref);
      } else {
        var superTypeIdentifier = modelDescriptor['superClass'] || EntityType.Object.ref;
        type = new EntityType(ref, this.getModel(superTypeIdentifier));
      }
    } else {
      throw new TypeError('No model available for ' + ref);
    }

    if (modelDescriptor) {
      var permissions = modelDescriptor['acl'];
      for (var permission in permissions) {
        type[permission + 'Permission'].fromJSON(permissions[permission]);
      }
    }

    return type;
  };

  /**
   * @param {baqend.metamodel.EntityType} model
   */


  ModelBuilder.prototype.buildAttributes = function buildAttributes(model) {
    var modelDescriptor = this.modelDescriptors[model.ref];
    var fields = modelDescriptor['fields'];

    for (var name in fields) {
      var field = fields[name];
      if (!model.getAttribute(name)) //skip predefined attributes
        model.addAttribute(this.buildAttribute(field.name, field.type), field.order);
    }

    if (modelDescriptor.validationCode) {
      model.validationCode = modelDescriptor.validationCode;
    }
  };

  /**
   * @param {baqend.metamodel.EntityType} model
   * @param {String} name
   * @param {String} ref
   * @returns {baqend.metamodel.Attribute}
   */


  ModelBuilder.prototype.buildAttribute = function buildAttribute(name, ref) {
    if (ref.indexOf('/db/collection.') == 0) {
      var collectionType = ref.substring(0, ref.indexOf('['));

      var elementType = ref.substring(ref.indexOf('[') + 1, ref.indexOf(']')).trim();
      switch (collectionType) {
        case ListAttribute.ref:
          return new ListAttribute(name, this.getModel(elementType));
        case SetAttribute.ref:
          return new SetAttribute(name, this.getModel(elementType));
        case MapAttribute.ref:
          var keyType = elementType.substring(0, elementType.indexOf(',')).trim();
          elementType = elementType.substring(elementType.indexOf(',') + 1).trim();

          return new MapAttribute(name, this.getModel(keyType), this.getModel(elementType));
        default:
          throw new TypeError('No collection available for ' + ref);
      }
    } else {
      return new SingularAttribute(name, this.getModel(ref));
    }
  };

  return ModelBuilder;
}();

module.exports = ModelBuilder;

},{"29":29,"34":34,"37":37,"38":38,"39":39,"41":41,"45":45,"46":46}],44:[function(_dereq_,module,exports){
"use strict";

var Attribute = _dereq_(33);

/**
 * @alias baqend.metamodel.PluralAttribute
 * @extends baqend.metamodel.Attribute
 */

var PluralAttribute = function (_Attribute) {
  babelHelpers.inherits(PluralAttribute, _Attribute);
  babelHelpers.createClass(PluralAttribute, [{
    key: "persistentAttributeType",
    get: function get() {
      return Attribute.PersistentAttributeType.ELEMENT_COLLECTION;
    }

    /**
     * @param {String} name
     * @param {baqend.metamodel.Type} elementType
     */

  }]);

  function PluralAttribute(name, elementType) {
    babelHelpers.classCallCheck(this, PluralAttribute);

    /** @type baqend.metamodel.Type */

    var _this = babelHelpers.possibleConstructorReturn(this, _Attribute.call(this, name));

    _this.elementType = elementType;
    /** @type Function */
    _this.typeConstructor = null;
    return _this;
  }

  return PluralAttribute;
}(Attribute);

/**
 * @enum {number}
 */


PluralAttribute.CollectionType = {
  COLLECTION: 0,
  LIST: 1,
  MAP: 2,
  SET: 3
};

module.exports = PluralAttribute;

},{"33":33}],45:[function(_dereq_,module,exports){
"use strict";

var PluralAttribute = _dereq_(44);

/**
 * @alias baqend.metamodel.SetAttribute
 * @extends baqend.metamodel.PluralAttribute
 */

var SetAttribute = function (_PluralAttribute) {
  babelHelpers.inherits(SetAttribute, _PluralAttribute);
  babelHelpers.createClass(SetAttribute, [{
    key: 'collectionType',
    get: function get() {
      return PluralAttribute.CollectionType.SET;
    }

    /**
     * @param {String} name
     * @param {baqend.metamodel.Type} elementType
     */

  }], [{
    key: 'ref',
    get: function get() {
      return '/db/collection.Set';
    }
  }]);

  function SetAttribute(name, elementType) {
    babelHelpers.classCallCheck(this, SetAttribute);

    var _this = babelHelpers.possibleConstructorReturn(this, _PluralAttribute.call(this, name, elementType));

    _this.typeConstructor = Set;
    return _this;
  }

  /**
   * @inheritDoc
   */


  SetAttribute.prototype.getJsonValue = function getJsonValue(state, object) {
    var value = this.getValue(object);

    if (value instanceof this.typeConstructor) {
      var persisting = {},
          persistedState = value.__persistedState__ || {};
      var changed = value.__persistedSize__ !== value.size;

      var json = [];
      for (var _iterator = value, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var el = _ref;

        var jsonValue = this.elementType.toJsonValue(state, el);
        json.push(jsonValue);

        persisting[jsonValue] = el;
        changed |= persistedState[jsonValue] !== el;
      }

      if (!state.isReady) {
        Object.defineProperties(value, {
          '__persistedState__': { value: persisting, configurable: true },
          '__persistedSize__': { value: value.size, configurable: true }
        });

        if (state.isPersistent && changed) state.setDirty();
      }

      return json;
    } else {
      return null;
    }
  };

  /**
   * {@inheritDoc}
   */


  SetAttribute.prototype.setJsonValue = function setJsonValue(state, obj, json) {
    var value = null;

    if (json) {
      value = this.getValue(obj);

      if (!(value instanceof this.typeConstructor)) {
        value = new this.typeConstructor();
      }

      var persisting = {},
          persistedState = value.__persistedState__ || {};

      value.clear();
      for (var i = 0, len = json.length; i < len; ++i) {
        var jsonValue = json[i];
        var el = this.elementType.fromJsonValue(state, jsonValue, persistedState[jsonValue]);
        value.add(el);

        persisting[jsonValue] = el;
      }

      if (!state.isReady) {
        Object.defineProperties(value, {
          '__persistedState__': { value: persisting, configurable: true },
          '__persistedSize__': { value: value.size, configurable: true }
        });
      }
    }

    this.setValue(obj, value);
  };

  /**
   * {@inheritDoc}
   * @returns {Object} {@inheritDoc}
   */


  SetAttribute.prototype.toJSON = function toJSON() {
    return {
      name: this.name,
      type: SetAttribute.ref + '[' + this.elementType.ref + ']',
      order: this.order
    };
  };

  return SetAttribute;
}(PluralAttribute);

module.exports = SetAttribute;

},{"44":44}],46:[function(_dereq_,module,exports){
"use strict";

var Attribute = _dereq_(33);
var Type = _dereq_(47);

/**
 * @alias baqend.metamodel.SingularAttribute
 * @extends baqend.metamodel.Attribute
 */

var SingularAttribute = function (_Attribute) {
  babelHelpers.inherits(SingularAttribute, _Attribute);
  babelHelpers.createClass(SingularAttribute, [{
    key: 'typeConstructor',
    get: function get() {
      return this.type.typeConstructor;
    }
  }, {
    key: 'persistentAttributeType',
    get: function get() {
      switch (this.type.persistenceType) {
        case Type.PersistenceType.BASIC:
          return Attribute.PersistentAttributeType.BASIC;
        case Type.PersistenceType.EMBEDDABLE:
          return Attribute.PersistentAttributeType.EMBEDDED;
        case Type.PersistenceType.ENTITY:
          return Attribute.PersistentAttributeType.ONE_TO_MANY;
      }
    }

    /**
     * @param {String} name
     * @param {baqend.metamodel.Type} type
     * @param {Boolean=} isMetadata
     */

  }]);

  function SingularAttribute(name, type, isMetadata) {
    babelHelpers.classCallCheck(this, SingularAttribute);


    /** @type baqend.metamodel.Type */

    var _this = babelHelpers.possibleConstructorReturn(this, _Attribute.call(this, name, isMetadata));

    _this.type = type;
    return _this;
  }

  /**
   * @inheritDoc
   */


  SingularAttribute.prototype.getJsonValue = function getJsonValue(state, object) {
    return this.type.toJsonValue(state, this.getValue(object));
  };

  /**
   * @inheritDoc
   */


  SingularAttribute.prototype.setJsonValue = function setJsonValue(state, object, jsonValue) {
    this.setValue(object, this.type.fromJsonValue(state, jsonValue, this.getValue(object)));
  };

  /**
   * @inheritDoc
   */


  SingularAttribute.prototype.toJSON = function toJSON() {
    return {
      name: this.name,
      type: this.type.ref,
      order: this.order
    };
  };

  return SingularAttribute;
}(Attribute);

module.exports = SingularAttribute;

},{"33":33,"47":47}],47:[function(_dereq_,module,exports){
"use strict";

/**
 * @alias baqend.metamodel.Type
 */

var Type = function () {
  babelHelpers.createClass(Type, [{
    key: "persistenceType",

    /**
     * The persistent type of this type
     * @type Number
     * @abstract
     */
    get: function get() {
      return -1;
    }

    /**
     * @type Boolean
     */

  }, {
    key: "isBasic",
    get: function get() {
      return this.persistenceType == Type.PersistenceType.BASIC;
    }

    /**
     * @type Boolean
     */

  }, {
    key: "isEmbeddable",
    get: function get() {
      return this.persistenceType == Type.PersistenceType.EMBEDDABLE;
    }

    /**
     * @type Boolean
     */

  }, {
    key: "isEntity",
    get: function get() {
      return this.persistenceType == Type.PersistenceType.ENTITY;
    }

    /**
     * @type Boolean
     */

  }, {
    key: "isMappedSuperclass",
    get: function get() {
      return this.persistenceType == Type.PersistenceType.MAPPED_SUPERCLASS;
    }

    /**
     * @return {Function}
     */

  }, {
    key: "typeConstructor",
    get: function get() {
      return this._typeConstructor;
    }

    /**
     * @param {Function} typeConstructor
     */
    ,
    set: function set(typeConstructor) {
      if (this._typeConstructor) {
        throw new Error("typeConstructor has already been set.");
      }
      this._typeConstructor = typeConstructor;
    }

    /**
     * @param {String} ref
     * @param {Function} typeConstructor
     */

  }]);

  function Type(ref, typeConstructor) {
    babelHelpers.classCallCheck(this, Type);

    if (ref.indexOf("/db/") != 0) {
      throw new SyntaxError("Type ref " + ref + " is invalid.");
    }

    /** @type String */
    this.ref = ref;
    /** @type String */
    this.name = ref.substring(4);
    this._typeConstructor = typeConstructor;
  }

  /**
   * Merge the json data into the current object instance and returns the merged object
   * @param {baqend.util.Metadata} state The root object state
   * @param {Object} jsonValue The json data to merge
   * @param {*=} currentValue The object where the jsonObject will be merged into, if the current object is null,
   *  a new instance will be created
   * @return {*} The merged object instance
   * @abstract
   */


  Type.prototype.fromJsonValue = function fromJsonValue(state, jsonValue, currentValue) {};

  /**
   * Converts the given object to json
   * @param {baqend.util.Metadata} state The root object state
   * @param {*} object The object to convert
   * @return {Object} The converted object as json
   * @abstract
   */


  Type.prototype.toJsonValue = function toJsonValue(state, object) {};

  return Type;
}();

/**
 * @enum {number}
 */


Type.PersistenceType = {
  BASIC: 0,
  EMBEDDABLE: 1,
  ENTITY: 2,
  MAPPED_SUPERCLASS: 3
};

module.exports = Type;

},{}],48:[function(_dereq_,module,exports){
'use strict';

/**
 * @namespace baqend.metamodel
 */

var Metamodel = _dereq_(42);

Metamodel.prototype.Attribute = _dereq_(33);
Metamodel.prototype.BasicType = _dereq_(34);
Metamodel.prototype.CollectionAttribute = _dereq_(35);
Metamodel.prototype.EmbeddableType = _dereq_(37);
Metamodel.prototype.EntityType = _dereq_(38);
Metamodel.prototype.ListAttribute = _dereq_(39);
Metamodel.prototype.ManagedType = _dereq_(40);
Metamodel.prototype.MapAttribute = _dereq_(41);
Metamodel.prototype.Metamodel = _dereq_(42);
Metamodel.prototype.ModelBuilder = _dereq_(43);
Metamodel.prototype.PluralAttribute = _dereq_(44);
Metamodel.prototype.SetAttribute = _dereq_(45);
Metamodel.prototype.SingularAttribute = _dereq_(46);
Metamodel.prototype.Type = _dereq_(47);
Metamodel.prototype.DbIndex = _dereq_(36);

exports = module.exports = new Metamodel();

},{"33":33,"34":34,"35":35,"36":36,"37":37,"38":38,"39":39,"40":40,"41":41,"42":42,"43":43,"44":44,"45":45,"46":46,"47":47}],49:[function(_dereq_,module,exports){
"use strict";

var Permission = _dereq_(55);

/**
 * Creates a new Acl object, with an empty rule set for an object
 *
 * @alias baqend.util.Acl
 */

var Acl = function () {

  /**
   * @param {baqend.util.Metadata} metadata the metadata of the object
   */

  function Acl(metadata) {
    babelHelpers.classCallCheck(this, Acl);

    /**
     * The read permission of the object
     * @type baqend.util.Permission
     */
    this.read = new Permission(metadata);
    /**
     * The write permission of the object
     * @type baqend.util.Permission
     */
    this.write = new Permission(metadata);
  }

  /**
   * Removes all acl rules, read and write access is public afterwards
   */


  Acl.prototype.clear = function clear() {
    this.read.clear();
    this.write.clear();
  };

  /**
   * Gets whenever all users and roles have the permission to read the object
   * @return {boolean} <code>true</code> If public access is allowed
   */


  Acl.prototype.isPublicReadAllowed = function isPublicReadAllowed() {
    return this.read.isPublicAllowed();
  };

  /**
   * Sets whenever all users and roles should have the permission to read the object.
   * Note: All other allow read rules will be removed.
   */


  Acl.prototype.setPublicReadAllowed = function setPublicReadAllowed() {
    return this.read.setPublicAllowed();
  };

  /**
   * Checks whenever the user or role is explicit allowed to read the object.
   *
   * @param {baqend.binding.User|baqend.binding.Role|String} userOrRole The user or role to check for
   */


  Acl.prototype.isReadAllowed = function isReadAllowed(userOrRole) {
    return this.read.isAllowed(userOrRole);
  };

  /**
   * Checks whenever the user or role is explicit denied to read the object
   *
   * @param {baqend.binding.User|baqend.binding.Role|String} userOrRole The user or role to check for
   */


  Acl.prototype.isReadDenied = function isReadDenied(userOrRole) {
    return this.read.isDenied(userOrRole);
  };

  /**
   * Allows the given user or rule to read the object
   * @param {baqend.binding.User|baqend.binding.Role|String} userOrRole The user or role to allow
   * @return {baqend.Acl} this acl object
   */


  Acl.prototype.allowReadAccess = function allowReadAccess(userOrRole) {
    this.read.allowAccess(userOrRole);
    return this;
  };

  /**
   * Denies the given user or rule to read the object
   * @param {baqend.binding.User|baqend.binding.Role|String} userOrRole The user or role to deny
   * @return {baqend.Acl} this acl object
   */


  Acl.prototype.denyReadAccess = function denyReadAccess(userOrRole) {
    this.read.denyAccess(userOrRole);
    return this;
  };

  /**
   * Deletes any read allow/deny rule for the given user or role
   * @param {baqend.binding.User|baqend.binding.Role|String} userOrRole The user or role
   * @return {baqend.Acl} this acl object
   */


  Acl.prototype.deleteReadAccess = function deleteReadAccess(userOrRole) {
    this.read.deleteAccess(userOrRole);
    return this;
  };

  /**
   * Gets whenever all users and roles have the permission to write the object
   * @return {boolean} <code>true</code> If public access is allowed
   */


  Acl.prototype.isPublicWriteAllowed = function isPublicWriteAllowed() {
    return this.write.isPublicAllowed();
  };

  /**
   * Sets whenever all users and roles should have the permission to write the object.
   * Note: All other allow write rules will be removed.
   */


  Acl.prototype.setPublicWriteAllowed = function setPublicWriteAllowed() {
    return this.write.setPublicAllowed();
  };

  /**
   * Checks whenever the user or role is explicit allowed to write the object.
   *
   * @param {baqend.binding.User|baqend.binding.Role|String} userOrRole The user or role to check for
   */


  Acl.prototype.isWriteAllowed = function isWriteAllowed(userOrRole) {
    return this.write.isAllowed(userOrRole);
  };

  /**
   * Checks whenever the user or role is explicit denied to write the object
   *
   * @param {baqend.binding.User|baqend.binding.Role|String} userOrRole The user or role to check for
   */


  Acl.prototype.isWriteDenied = function isWriteDenied(userOrRole) {
    return this.write.isDenied(userOrRole);
  };

  /**
   * Allows the given user or rule to write the object
   * @param {baqend.binding.User|baqend.binding.Role|String} userOrRole The user or role to allow
   * @return {baqend.Acl} this acl object
   */


  Acl.prototype.allowWriteAccess = function allowWriteAccess(userOrRole) {
    this.write.allowAccess(userOrRole);
    return this;
  };

  /**
   * Denies the given user or rule to write the object
   * @param {baqend.binding.User|baqend.binding.Role|String} userOrRole The user or role to deny
   * @return {baqend.Acl} this acl object
   */


  Acl.prototype.denyWriteAccess = function denyWriteAccess(userOrRole) {
    this.write.denyAccess(userOrRole);
    return this;
  };

  /**
   * Deletes any write allow/deny rule for the given user or role
   * @param {baqend.binding.User|baqend.binding.Role|String} userOrRole The user or role
   * @return {baqend.Acl} this acl object
   */


  Acl.prototype.deleteWriteAccess = function deleteWriteAccess(userOrRole) {
    this.write.deleteAccess(userOrRole);
    return this;
  };

  /**
   * A Json representation of the set of rules
   * @return {object}
   */


  Acl.prototype.toJSON = function toJSON() {
    return {
      read: this.read,
      write: this.write
    };
  };

  /**
   * Sets the acl rules form json
   * @param {object} json The json encoded acls
   */


  Acl.prototype.fromJSON = function fromJSON(json) {
    this.read.fromJSON(json.read || {});
    this.write.fromJSON(json.write || {});
  };

  return Acl;
}();

module.exports = Acl;

},{"55":55}],50:[function(_dereq_,module,exports){
"use strict";

var message = _dereq_(32);
var StatusCode = _dereq_(22).StatusCode;

/**
 * @alias baqend.util.Code
 * @param {baqend.metamodel.Metamodel} metamodel
 */

var Code = function () {
  function Code(metamodel, entityManagerFactory) {
    babelHelpers.classCallCheck(this, Code);

    /** @type baqend.metamodel.Metamodel */
    this._metamodel = metamodel;
    /** @type baqend.EntityManagerFactory */
    this.entityManagerFactory = entityManagerFactory;
  }

  /**
   * Converts the given function to a string
   * @param {Function} fn The JavaScript function to serialize
   * @return {String} The serialized function
   */


  Code.prototype.functionToString = function functionToString(fn) {
    if (!fn) return "";

    var str = fn.toString();
    str = str.substring(str.indexOf("{") + 1, str.lastIndexOf("}"));
    if (str.charAt(0) == '\n') str = str.substring(1);

    if (str.charAt(str.length - 1) == '\n') str = str.substring(0, str.length - 1);

    return str;
  };

  /**
   * Converts the given string to a module wrapper function
   * @param {Array<String>} signature The expected parameters of the function
   * @param {String} code The JavaScript function to deserialize
   * @return {Function} The deserialized function
   */


  Code.prototype.stringToFunction = function stringToFunction(signature, code) {
    return new Function(signature, code);
  };

  /**
   * Loads a list of all available baqend modules
   * Does not include handlers
   *
   * @returns {Promise<Array<String>>}
   */


  Code.prototype.loadModules = function loadModules() {
    var msg = new message.GetAllModules();
    return this.entityManagerFactory.send(msg).then(function (data) {
      return data.response.entity;
    });
  };

  /**
   * Loads Baqend code which will be identified by the given bucket and code codeType
   *
   * @param {baqend.metamodel.ManagedType|String} type The entity type for the baqend handler or the Name of the
   * Baqend code
   * @param {String} codeType The type of the code
   * @param {boolean} [asFunction=false] set it to <code>true</code>, to parse the code as a function and return it
   * instead of a string
   * @returns {Promise<Function|String>} The baqend code as string or as a parsed function
   */


  Code.prototype.loadCode = function loadCode(type, codeType, asFunction) {
    var _this = this;

    var bucket = Object(type) instanceof String ? type : type.name;
    var msg = new message.GetBaqendCode(bucket, codeType);

    return this.entityManagerFactory.send(msg).then(function (msg) {
      return _this._parseCode(bucket, codeType, asFunction, msg.response.entity);
    }, function (e) {
      if (e.status == StatusCode.OBJECT_NOT_FOUND) return null;

      throw e;
    });
  };

  /**
   * Saves Baqend code which will be identified by the given bucket and code type
   *
   * @param {baqend.metamodel.ManagedType|String} type The entity type for the baqend handler or the Name of the
   * Baqend code
   * @param {String} codeType The type of the code
   * @param {String|Function} fn Baqend code as a string or function
   * @returns {Promise<Function|String>} The stored baqend code as a string or as a parsed function
   */


  Code.prototype.saveCode = function saveCode(type, codeType, fn) {
    var _this2 = this;

    var bucket = Object(type) instanceof String ? type : type.name;
    var asFunction = fn instanceof Function;

    var msg = new message.SetBaqendCode(bucket, codeType, asFunction ? this.functionToString(fn) : fn);
    return this.entityManagerFactory.send(msg).then(function (msg) {
      return _this2._parseCode(bucket, codeType, asFunction, msg.response.entity);
    });
  };

  /**
   * Deletes Baqend code identified by the given bucket and code type
   *
   * @param {baqend.metamodel.ManagedType|String} type The entity type for the baqend handler or the Name of the
   * Baqend code
   * @param {String} codeType The type of the code
   * @returns {Promise<void>} succeed if the code was deleted
   */


  Code.prototype.deleteCode = function deleteCode(type, codeType) {
    var _this3 = this;

    var bucket = Object(type) instanceof String ? type : type.name;
    var msg = new message.DeleteBaqendCode(bucket, codeType);
    return this.entityManagerFactory.send(msg).then(function () {
      return _this3._parseCode(bucket, codeType, false, null);
    });
  };

  Code.prototype._parseCode = function _parseCode(bucket, codeType, asFunction, code) {
    if (codeType == 'validate') {
      var type = this._metamodel.entity(bucket);
      type.validationCode = code;
      return asFunction ? type.validationCode : code;
    } else {
      return asFunction ? this.stringToFunction(['module', 'exports'], code) : code;
    }
  };

  return Code;
}();

module.exports = Code;

},{"22":22,"32":32}],51:[function(_dereq_,module,exports){
"use strict";

/**
 * This base class provides an lock interface to execute exclusive operations
 * @alias baqend.util.Lockable
 */

var Lockable = function () {
  function Lockable() {
    babelHelpers.classCallCheck(this, Lockable);

    /**
     * Indicates if there is currently an onging exclusive operation
     * @type Boolean
     * @private
     */
    this._isLocked = false;

    /**
     * A promise which represents the state of the least exclusive operation
     * @type Promise
     * @private
     */
    this._readyPromise = Promise.resolve(null);

    /**
     * A deferred used to explicit lock and unlock this instance
     * @private
     */
    this._deferred = null;
  }

  /**
   * Indicates if there is currently no exclusive operation executed
   * <code>true</code> If no exclusive lock is hold
   * @type {Boolean}
   */


  /**
   * Waits on the previously requested operation and calls the doneCallback if the operation is fulfilled
   * @param {baqend.util.Lockable~callback=} doneCallback The callback which will be invoked when the previously
   * operations on this object is completed.
   * @param {baqend.util.Lockable~callback=} failCallback When the lock can't be released caused by a none
   * recoverable error
   * @return {Promise<baqend.util.Lockable>} A promise which completes successfully, when the previously requested
   * operation completes
   */

  Lockable.prototype.ready = function ready(doneCallback, failCallback) {
    return this._readyPromise.then(doneCallback, failCallback);
  };

  /**
   * Try to aquire an exclusive lock and executes the given callback.
   * @param {baqend.util.Lockable~callback} callback The exclusive operation to execute
   * @param {Boolean} [critical=false] Indicates if the operation is critical. If the operation is critical and the
   * operation fails, then the lock will not be released
   * @return {Promise<baqend.util.Lockable>} A promise
   * @throws {Error} If the lock can't be aquired
   * @protected
   */


  Lockable.prototype.withLock = function withLock(callback, critical) {
    if (this._isLocked) throw new Error('Current operation has not been finished.');

    var self = this;
    try {
      this._isLocked = true;
      var result = callback().then(function (result) {
        self._isLocked = false;
        return result;
      }, function (e) {
        if (!critical) self._isLocked = false;
        throw e;
      });

      this._readyPromise = result.then(function () {
        return self;
      }, function (e) {
        if (!critical) return self;
        throw e;
      });

      return result;
    } catch (e) {
      if (critical) {
        this._readyPromise = Promise.reject(e);
      } else {
        this._isLocked = false;
      }
      throw e;
    }
  };

  babelHelpers.createClass(Lockable, [{
    key: "isReady",
    get: function get() {
      return !this._isLocked;
    }
  }]);
  return Lockable;
}();

module.exports = Lockable;

/**
 * The operation callback is used by the {@link baqend.util.Lockable#withLock} method,
 * to perform an exclusive operation on the baqend.
 * @callback baqend.util.Lockable~callback
 * @return {Promise<*>} A Promise, which reflects the result of the operation
 */

},{}],52:[function(_dereq_,module,exports){
"use strict";

var message = _dereq_(32);
var StatusCode = _dereq_(22).StatusCode;

/**
 * @alias baqend.util.Logger
 */

var Logger = function () {
  function Logger() {
    babelHelpers.classCallCheck(this, Logger);
  }

  Logger.create = function create(entityManager) {
    var proto = this.prototype;

    function Logger() {
      proto.log.apply(Logger, arguments);
    }

    for (var _iterator = Object.getOwnPropertyNames(proto), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var key = _ref;

      Object.defineProperty(Logger, key, Object.getOwnPropertyDescriptor(proto, key));
    }Logger._init(entityManager);

    return Logger;
  };

  /**
   * The log level which will be logged
   *
   * The log level can be one of 'trace', 'debug', 'info', 'warn', 'error'
   * @type string
   */


  /**
   * Logs a message with the given log level
   * @param {String} [level='info'] The level used to log the message
   * @param {String} message The message to log, the message string can be interpolated like the node util.format method
   * @param {*} args... The arguments used to interpolated the message string
   * @param {Object} [data=null] An optional object which will be included in the log entry
   *
   * @see https://nodejs.org/api/util.html#util_util_format_format
   */

  Logger.prototype.log = function log(level, message, data) {
    var args = Array.prototype.slice.call(arguments);

    if (Logger.LEVELS.indexOf(args[0]) == -1) {
      level = 'info';
    } else {
      level = args.shift();
    }

    if (this.levelIndex > Logger.LEVELS.indexOf(level)) return;

    message = this._format(args.shift(), args);
    data = null;
    if (args.length && babelHelpers.typeof(args[args.length - 1]) === 'object') {
      data = args.pop();
    }

    if (args.length) {
      message += ", " + args.join(", ");
    }

    return this._log({
      date: new Date(),
      message: message,
      level: level,
      user: this.entityManager.me && this.entityManager.me.id,
      data: data
    });
  };

  Logger.prototype._format = function _format(f, args) {
    if (args.length == 0) return f;

    var str = String(f).replace(Logger.FORMAT_REGEXP, function (x) {
      if (x === '%%') return '%';
      if (!args.length) return x;
      switch (x) {
        case '%s':
          return String(args.shift());
        case '%d':
          return Number(args.shift());
        case '%j':
          try {
            return JSON.stringify(args.shift());
          } catch (_) {
            return '[Circular]';
          }
        default:
          return x;
      }
    });

    return str;
  };

  Logger.prototype._init = function _init(entityManager) {
    var _this = this;

    /** @type baqend.EntityManager */
    this.entityManager = entityManager;
    this.levelIndex = 2;

    Logger.LEVELS.forEach(function (level) {
      _this[level] = _this.log.bind(_this, level);
    });
  };

  Logger.prototype._log = function _log(json) {
    if (!this.entityManager.isReady) {
      return this.entityManager.ready(this._log.bind(this, json));
    } else {
      return this.entityManager._send(new message.CreateObject('logs.AppLog', json));
    }
  };

  /**
   * Log message at trace level
   * @param {String} message The message to log, the message string can be interpolated like the node util.format method
   * @param {*} args... The arguments used to interpolated the message string
   * @param {Object} [data=null] An optional object which will be included in the log entry
   * @function trace
   * @memberOf baqend.util.Logger.prototype
   *
   * @see https://nodejs.org/api/util.html#util_util_format_format
   */

  /**
   * Log message at debug level
   * @param {String} message The message to log, the message string can be interpolated like the node util.format method
   * @param {*} args... The arguments used to interpolated the message string
   * @param {Object} [data=null] An optional object which will be included in the log entry
   * @function debug
   * @memberOf baqend.util.Logger.prototype
   *
   * @see https://nodejs.org/api/util.html#util_util_format_format
   */

  /**
   * Log message at info level
   * @param {String} message The message to log, the message string can be interpolated like the node util.format method
   * @param {*} args... The arguments used to interpolated the message string
   * @param {Object} [data=null] An optional object which will be included in the log entry
   * @function info
   * @memberOf baqend.util.Logger.prototype
   *
   * @see https://nodejs.org/api/util.html#util_util_format_format
   */

  /**
   * Log message at warn level
   * @param {String} message The message to log, the message string can be interpolated like the node util.format method
   * @param {*} args... The arguments used to interpolated the message string
   * @param {Object} [data=null] An optional object which will be included in the log entry
   * @function warn
   * @memberOf baqend.util.Logger.prototype
   *
   * @see https://nodejs.org/api/util.html#util_util_format_format
   */

  /**
   * Log message at error level
   * @param {String} message The message to log, the message string can be interpolated like the node util.format method
   * @param {*} args... The arguments used to interpolated the message string
   * @param {Object} [data=null] An optional object which will be included in the log entry
   * @function error
   * @memberOf baqend.util.Logger.prototype
   *
   * @see https://nodejs.org/api/util.html#util_util_format_format
   */


  babelHelpers.createClass(Logger, [{
    key: 'level',
    get: function get() {
      return Logger.LEVELS[this.levelIndex];
    },
    set: function set(value) {
      var index = Logger.LEVELS.indexOf(value);
      if (index == -1) throw new Error("Unknown logging level " + value);

      this.levelIndex = index;
    }
  }]);
  return Logger;
}();

Object.assign(Logger, {
  LEVELS: ['trace', 'debug', 'info', 'warn', 'error'],
  FORMAT_REGEXP: /%[sdj%]/g
});

module.exports = Logger;

},{"22":22,"32":32}],53:[function(_dereq_,module,exports){
"use strict";

var error = _dereq_(31);
var Acl = _dereq_(49);
var Lockable = _dereq_(51);
var binding = _dereq_(17);

/**
 * @alias baqend.util.Metadata
 * @extends baqend.util.Lockable
 */

var Metadata = function (_Lockable) {
  babelHelpers.inherits(Metadata, _Lockable);

  Metadata.create = function create(type, object) {
    var metadata;
    if (type.isEntity) {
      metadata = new Metadata(object, type);
    } else if (type.isEmbeddable) {
      metadata = {
        type: type,
        readAccess: function readAccess() {
          var metadata = this._root && this._root._metadata;
          if (metadata) metadata.readAccess();
        },
        writeAccess: function writeAccess() {
          var metadata = this._root && this._root._metadata;
          if (metadata) metadata.writeAccess();
        }
      };
    } else {
      throw new Error('Illegal type ' + type);
    }

    return metadata;
  };

  /**
   * @param {baqend.binding.Entity} entity
   * @return {baqend.util.Metadata}
   */


  Metadata.get = function get(entity) {
    //if (!(entity instanceof binding.Entity))
    //  throw new error.IllegalEntityError(entity);

    return entity._metadata;
  };

  /**
   * @type baqend.EntityManager
   */


  babelHelpers.createClass(Metadata, [{
    key: 'db',
    get: function get() {
      if (this._db) return this._db;

      return this._db = _dereq_(6);
    }

    /**
     * @param db {baqend.EntityManager}
     */
    ,
    set: function set(db) {
      if (!this._db) {
        this._db = db;
      } else {
        throw new Error("DB has already been set.");
      }
    }

    /**
     * @type String
     */

  }, {
    key: 'bucket',
    get: function get() {
      return this.type.name;
    }

    /**
     * @type String
     */

  }, {
    key: 'key',
    get: function get() {
      if (!this._key && this.id) {
        var index = this.id.lastIndexOf('/');
        this._key = decodeURIComponent(this.id.substring(index + 1));
      }
      return this._key;
    }

    /**
     * @param {String} value
     */
    ,
    set: function set(value) {
      value += '';

      if (this.id) throw new Error('The id can\'t be set twice.');

      this.id = '/db/' + this.bucket + '/' + encodeURIComponent(value);
      this._key = value;
    }

    /**
     * @type Boolean
     */

  }, {
    key: 'isAttached',
    get: function get() {
      return !!this._db;
    }

    /**
     * @type Boolean
     */

  }, {
    key: 'isAvailable',
    get: function get() {
      return this._state > Metadata.Type.UNAVAILABLE;
    }

    /**
     * @type Boolean
     */

  }, {
    key: 'isPersistent',
    get: function get() {
      return this._state == Metadata.Type.PERSISTENT;
    }

    /**
     * @type Boolean
     */

  }, {
    key: 'isDirty',
    get: function get() {
      return this._state == Metadata.Type.DIRTY;
    }

    /**
     * @param {baqend.binding.Entity} entity
     * @param {baqend.binding.ManagedType} type
     */

  }]);

  function Metadata(entity, type) {
    babelHelpers.classCallCheck(this, Metadata);


    /**
     * @type baqend.binding.Entity
     * @private
     */

    var _this = babelHelpers.possibleConstructorReturn(this, _Lockable.call(this));

    _this._root = entity;
    _this._state = Metadata.Type.DIRTY;
    _this._enabled = true;
    /** @type String */
    _this.id = null;
    /** @type Number */
    _this.version = null;
    /** @type baqend.metamodel.ManagedType */
    _this.type = type;
    /** @type baqend.util.Acl */
    _this.acl = new Acl(_this);
    return _this;
  }

  Metadata.prototype.readAccess = function readAccess() {
    if (this._enabled) {
      if (!this.isAvailable) {
        throw new error.PersistentError('This object ' + this.id + ' is not available.');
      }
    }
  };

  Metadata.prototype.writeAccess = function writeAccess() {
    if (this._enabled) {
      if (!this.isAvailable) {
        throw new error.PersistentError('This object ' + this.id + ' is not available.');
      }

      this.setDirty();
    }
  };

  /**
   * Indicates that the associated object isn't available
   */


  Metadata.prototype.setUnavailable = function setUnavailable() {
    this._state = Metadata.Type.UNAVAILABLE;
  };

  /**
   * Indicates that the associated object isn't stale, i.e.
   * the object correlate the database state and is not modified by the user
   */


  Metadata.prototype.setPersistent = function setPersistent() {
    this._state = Metadata.Type.PERSISTENT;
  };

  /**
   * Indicates the the object is modified by the user
   */


  Metadata.prototype.setDirty = function setDirty() {
    this._state = Metadata.Type.DIRTY;
  };

  /**
   * Indicates the the object is removed
   */


  Metadata.prototype.setRemoved = function setRemoved() {
    //mark the object only as dirty if it was already available
    if (this.isAvailable) {
      this.setDirty();
      this.version = null;
    }
  };

  Metadata.prototype.getJsonMetadata = function getJsonMetadata() {
    var info = {};

    if (this.id) {
      info.id = this.id;
    }

    if (this.version) {
      info.version = this.version;
    }

    info.acl = this.acl;

    return info;
  };

  /**
   * Sets the object metadata from the object
   * @param {Object} json
   */


  Metadata.prototype.setJsonMetadata = function setJsonMetadata(json) {
    if (!this.id) {
      this.id = json.id;
    }

    if (json.version) this.version = json.version;

    this.acl.fromJSON(json.acl || {});
  };

  /**
   * Converts the object to an JSON-Object
   * @param {Boolean} [excludeMetadata=false]
   * @returns {Object} JSON-Object
   */


  Metadata.prototype.getJson = function getJson(excludeMetadata) {
    this._enabled = false;
    var json = this.type.toJsonValue(this, this._root, true);
    this._enabled = true;

    if (this.isAttached && !excludeMetadata) {
      Object.assign(json, this.getJsonMetadata());
    }

    return json;
  };

  Metadata.prototype.setJson = function setJson(json) {
    if (json.id || json.version || json.acl) {
      this.setJsonMetadata(json);
    }

    this._enabled = false;
    this.type.fromJsonValue(this, json, this._root, true);
    this._enabled = true;
  };

  return Metadata;
}(Lockable);

/**
 * @enum {number}
 */


Metadata.Type = {
  UNAVAILABLE: -1,
  PERSISTENT: 0,
  DIRTY: 1
};

module.exports = Metadata;

},{"17":17,"31":31,"49":49,"51":51,"6":6}],54:[function(_dereq_,module,exports){
"use strict";

var message = _dereq_(32);

/**
 * @alias baqend.util.Modules
 */

var Modules = function () {

  /**
   * @param {baqend.EntityManager} entityManager
   * @param {baqend.connector.Connector} connector
   */

  function Modules(entityManager, connector) {
    babelHelpers.classCallCheck(this, Modules);

    /**
     * @type baqend.EntityManager
     */
    this._entityManager = entityManager;
    /**
     * The connector used for baqend requests
     * @type baqend.connector.Connector
     */
    this._connector = connector;
  }

  /**
   * Calls the baqend module, which is identified by the given bucket.
   * The optional query parameter will be attached as GET-parameters.
   *
   * @param {String} bucket Name of the baqend module
   * @param {Object|String=} query GET-Parameter as key-value-pairs or query string
   * @param {Function=} doneCallback
   * @param {Function=} failCallback
   * @returns {Promise<Object>}
   */


  Modules.prototype.get = function get(bucket, query, doneCallback, failCallback) {
    if (query instanceof Function) {
      failCallback = doneCallback;
      doneCallback = query;
      query = null;
    }

    var msg = new message.GetBaqendModule(bucket);
    msg.addQueryString(query);

    return this._send(msg, doneCallback, failCallback);
  };

  /**
   * Calls the baqend module, which is identified by the given bucket.
   *
   * @param {String} bucket Name of the baqend module
   * @param {Object|String} body Body of the POST-request
   * @param {Function=} doneCallback
   * @param {Function=} failCallback
   * @returns {Promise<Object>}
   */


  Modules.prototype.post = function post(bucket, body, doneCallback, failCallback) {
    var msg = new message.PostBaqendModule(bucket, body);

    return this._send(msg, doneCallback, failCallback);
  };

  Modules.prototype._send = function _send(msg, doneCallback, failCallback) {
    return this._entityManager._send(msg).then(function (code) {
      return code.response.entity;
    }).then(doneCallback, failCallback);
  };

  return Modules;
}();

module.exports = Modules;

},{"32":32}],55:[function(_dereq_,module,exports){
"use strict";

/**
 * @alias baqend.util.Permission
 */

var Permission = function () {

  /**
   * Creates a new Permission object, with an empty rule set
   * @param {baqend.util.Metadata} metadata The metadata of the object
   */

  function Permission(metadata) {
    babelHelpers.classCallCheck(this, Permission);

    /** @type object */
    this._rules = {};
    /** @type baqend.util.Metadata */
    this._metadata = metadata;
  }

  /**
   * Returns a list of user and role references of all rules
   * @return {String[]} a list of references
   */


  Permission.prototype.allRules = function allRules() {
    return Object.keys(this._rules);
  };

  /**
   * Removes all rules from this permission object
   */


  Permission.prototype.clear = function clear() {
    this._metadata && this._metadata.writeAccess();
    this._rules = {};
  };

  /**
   * Gets whenever all users and roles have the permission to perform the operation
   * @return {boolean} <code>true</code> If public access is allowed
   */


  Permission.prototype.isPublicAllowed = function isPublicAllowed() {
    if ('*' in this._rules) return false;

    for (var ref in this._rules) {
      if (this._rules[ref] == 'allow') {
        return false;
      }
    }

    return true;
  };

  /**
   * Sets whenever all users and roles should have the permission to perform the operation.
   * Note: All other allow rules will be removed.
   */


  Permission.prototype.setPublicAllowed = function setPublicAllowed() {
    this._metadata && this._metadata.writeAccess();
    for (var ref in this._rules) {
      if (this._rules[ref] == 'allow') {
        delete this._rules[ref];
      }
    }
  };

  /**
   * Returns the actual rule of the given user or role.
   * @param userOrRole The user or role to check for
   * @return {String|undefined} The actual access rule
   */


  Permission.prototype.getRule = function getRule(userOrRole) {
    return this._rules[this._getRef(userOrRole)];
  };

  /**
   * Checks whenever the user or role is explicit allowed to perform the operation.
   *
   * @param userOrRole The user or role to check for
   */


  Permission.prototype.isAllowed = function isAllowed(userOrRole) {
    return this._rules[this._getRef(userOrRole)] == 'allow';
  };

  /**
   * Checks whenever the user or role is explicit denied to perform the operation.
   *
   * @param userOrRole The user or role to check for
   */


  Permission.prototype.isDenied = function isDenied(userOrRole) {
    return this._rules[this._getRef(userOrRole)] == 'deny';
  };

  /**
   * Allows the given user or rule to perform the operation
   * @param userOrRole The user or role to allow
   * @return {baqend.util.Permission} this permission object
   */


  Permission.prototype.allowAccess = function allowAccess(userOrRole) {
    this._metadata && this._metadata.writeAccess();
    this._rules[this._getRef(userOrRole)] = 'allow';
    return this;
  };

  /**
   * Denies the given user or rule to perform the operation
   * @param userOrRole The user or role to deny
   * @return {baqend.util.Permission} this permission object
   */


  Permission.prototype.denyAccess = function denyAccess(userOrRole) {
    this._metadata && this._metadata.writeAccess();
    this._rules[this._getRef(userOrRole)] = 'deny';
    return this;
  };

  /**
   * Deletes any allow/deny rule for the given user or role
   * @param userOrRole The user or role
   * @return {baqend.util.Permission} this permission object
   */


  Permission.prototype.deleteAccess = function deleteAccess(userOrRole) {
    this._metadata && this._metadata.writeAccess();
    delete this._rules[this._getRef(userOrRole)];
    return this;
  };

  /**
   * A Json representation of the set of rules
   * @return {object}
   */


  Permission.prototype.toJSON = function toJSON() {
    return this._rules;
  };

  /**
   * Sets the permission rules from json
   * @param {object} json The permission json representation
   */


  Permission.prototype.fromJSON = function fromJSON(json) {
    this._rules = json;
  };

  /**
   * Resolves user and role references and validate given references
   * @param userOrRole The user, role or reference
   * @return {String} The resolved and validated reference
   * @private
   */


  Permission.prototype._getRef = function _getRef(userOrRole) {
    if (!(Object(userOrRole) instanceof String)) {
      userOrRole = userOrRole._metadata.id;
    }

    if (userOrRole.indexOf('/db/User/') == 0 || userOrRole.indexOf('/db/Role/') == 0) {
      return userOrRole;
    }

    throw new TypeError('The given object isn\'t a user, role or a valid reference.');
  };

  return Permission;
}();

module.exports = Permission;

},{}],56:[function(_dereq_,module,exports){
"use strict";

var Entity = _dereq_(10);

/**
 * @alias baqend.util.PushMessage
 */

var PushMessage = function () {

  /**
   * Push message will be used to send a push notification to a set of devices
   *
   * @param {Set<baqend.binding.Entity>|List<baqend.binding.Entity>|Array=} devices The Set of device references which
   * will receive this push notification.
   * @param {String=} message The message of the push notification.
   * @param {String=} subject The subject of the push notification.
   * @param {String=} sound The file reference of the sound file as a string. The device uses this file as the
   * notification sound.
   * @param {Number=} badge The badge count.
   * @param {Object=} data The data object which can contain additional information.
   * @constructor
   */

  function PushMessage(devices, message, subject, sound, badge, data) {
    babelHelpers.classCallCheck(this, PushMessage);

    /**
     * Set of devices
     * @type Set<baqend.binding.Entity>
     */
    this.devices = null;

    if (devices instanceof Set) {
      this.devices = devices;
    } else if (!devices || devices[Symbol.iterator]) {
      this.devices = new Set(devices);
    } else if (devices instanceof Entity) {
      this.devices = new Set();
      this.devices.add(devices);
    } else {
      throw new Error("Only Sets, Lists and Arrays can be used as devices.");
    }

    /**
     * push notification message
     * @type String
     */
    this.message = message;

    /**
     * push notification subject
     * @type String
     */
    this.subject = subject;

    /**
     * push notification sound
     * @type String
     */
    this.sound = sound;

    /**
     * badge count
     * @type Number
     */
    this.badge = badge;

    /**
     * data object
     * @type Object
     */
    this.data = data;
  }

  /**
   * Adds a new object to the set of devices
   *
   * @param {baqend.binding.Entity} device will be added to the device set to receive the push notification
   */


  PushMessage.prototype.addDevice = function addDevice(device) {
    if (!this.devices) {
      this.devices = new Set();
    }

    this.devices.add(device);
  };

  PushMessage.prototype.toJSON = function toJSON() {
    if (!this.devices || !this.devices.size) throw new Error("Set of devices is empty.");

    return Object.assign({}, this, {
      devices: Array.from(this.devices, function (device) {
        return device.id;
      })
    });
  };

  return PushMessage;
}();

module.exports = PushMessage;

},{"10":10}],57:[function(_dereq_,module,exports){
"use strict";

var hmac = _dereq_(61).hmac;

/**
 * @alias baqend.util.TokenStorage
 */

var TokenStorage = function () {
  function TokenStorage() {
    babelHelpers.classCallCheck(this, TokenStorage);

    /**
     * The actual token storage
     * @type Object<String,String>
     */
    this.tokens = {};
  }

  /**
   * Get the stored token for the given origin
   * @param {string} origin The origin of the token
   * @returns {string} The token or undefined, if no token is available for the origin
   */


  TokenStorage.prototype.get = function get(origin) {
    return this.tokens[origin] || null;
  };

  /**
   * Update the token for the givin origin
   * @param {string} origin The origin of the token
   * @param {string|null} token The token to store, <code>null</code> to remove the token
   */


  TokenStorage.prototype.update = function update(origin, token) {
    if (token) {
      this.tokens[origin] = token;
    } else {
      delete this.tokens[origin];
    }
  };

  /**
   * Derived a resource token from the the stored origin token for the resource
   * @param {string} origin The origin of the token which is used to drive the resource token from
   * @param {string} resource The resource which will be accessible with the returned token
   * @returns {String} A resource token which can only be used to access the specified resource
   */


  TokenStorage.prototype.createResourceToken = function createResourceToken(origin, resource) {
    var token = this.get(origin);
    if (token) {
      var data = token.substring(0, token.length - 40);
      var sig = token.substring(data.length);
      return data + hmac(resource + data, sig);
    }
    return null;
  };

  return TokenStorage;
}();

TokenStorage.GLOBAL = new TokenStorage();

try {
  if (typeof localStorage != "undefined") {
    TokenStorage.WEB_STORAGE = new (function (_TokenStorage) {
      babelHelpers.inherits(WebStorage, _TokenStorage);

      function WebStorage() {
        babelHelpers.classCallCheck(this, WebStorage);
        return babelHelpers.possibleConstructorReturn(this, _TokenStorage.apply(this, arguments));
      }

      WebStorage.prototype.get = function get(origin) {
        return sessionStorage.getItem('BAT:' + origin) || localStorage.getItem('BAT:' + origin);
      };

      WebStorage.prototype.update = function update(origin, token, useLocalStorage) {
        if (useLocalStorage === undefined) useLocalStorage = typeof localStorage.getItem('BAT:' + origin) == "string";

        var webStorage = useLocalStorage ? localStorage : sessionStorage;
        if (typeof token === "string") {
          webStorage.setItem('BAT:' + origin, token);
        } else {
          webStorage.removeItem('BAT:' + origin);
        }
      };

      return WebStorage;
    }(TokenStorage))();
  }
} catch (e) {
  //firefox throws an exception if we try to access the localStorage while cookies are disallowed
}

module.exports = TokenStorage;

},{"61":61}],58:[function(_dereq_,module,exports){
"use strict";

/**
 * @alias baqend.util.ValidationResult
 */

var ValidationResult = function () {
  babelHelpers.createClass(ValidationResult, [{
    key: "isValid",
    get: function get() {
      for (var key in this.fields) {
        if (!this.fields[key].isValid) {
          return false;
        }
      }
      return true;
    }
  }]);

  function ValidationResult() {
    babelHelpers.classCallCheck(this, ValidationResult);

    this.fields = {};
  }

  ValidationResult.prototype.toJSON = function toJSON() {
    var json = {};
    for (var key in this.fields) {
      json[key] = this.fields[key].toJSON();
    }
    return json;
  };

  return ValidationResult;
}();

module.exports = ValidationResult;

},{}],59:[function(_dereq_,module,exports){
"use strict";

var valLib = _dereq_(150);
var ValidationResult = _dereq_(58);

/**
 * @alias baqend.util.Validator
 */

var Validator = function () {

  /**
   * Compiles the given validation code for the managedType
   * @param {baqend.metamodel.ManagedType} managedType The managedType of the code
   * @param {String} validationCode The validation code
   */

  Validator.compile = function compile(managedType, validationCode) {
    var keys = [];
    for (var _iterator = managedType.attributes(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var attr = _ref;

      keys.push(attr.name);
    }

    var fn = new Function(keys, validationCode);
    return function onValidate(argObj) {
      var args = keys.map(function (name) {
        return argObj[name];
      });

      return fn.apply({}, args);
    };
  };

  /**
   * Gets the value of the attribute
   * @return {*} Value
   */


  /**
   * Executes the given validation function to validate the value.
   *
   * The value will be passed as the first parameter to the validation function and
   * the library {@link https://github.com/chriso/validator.js} as the second one.
   * If the function returns true the value is valid, otherwise it's invalid.
   *
   * @param {String=} error The error message which will be used if the value is invalid
   * @param {Function} fn will be used to validate the value
   * @returns {baqend.util.Validator}
   */

  Validator.prototype.is = function is(error, fn) {
    if (error instanceof Function) {
      fn = error;
      error = 'is';
    }
    if (fn(this.value, valLib) === false) {
      this.errors.push(error);
    }
    return this;
  };

  babelHelpers.createClass(Validator, [{
    key: 'value',
    get: function get() {
      return this._entity[this.key];
    }

    /**
     * Checks if the attribute is valid
     * @return {Boolean}
     */

  }, {
    key: 'isValid',
    get: function get() {
      return this.errors.length == 0;
    }
  }]);

  function Validator(key, entity) {
    babelHelpers.classCallCheck(this, Validator);

    /**
     * Name of the attribute
     * @type String
     */
    this.key = key;

    /**
     * Entity to get the value of the attribute
     * @type {baqend.binding.Entity}
     * @private
     */
    this._entity = entity;

    /**
     * Entity to get the value of the attribute
     * @type {baqend.binding.Entity}
     * @private
     */
    this.errors = [];
  }

  Validator.prototype._callMethod = function _callMethod(method, error, args) {
    args = args || [];
    args.unshift(this.value);
    if (valLib[method].apply(this, args) === false) {
      this.errors.push(error);
    }
    return this;
  };

  Validator.prototype.toString = function toString() {
    return this.value;
  };

  Validator.prototype.toJSON = function toJSON() {
    return {
      isValid: this.isValid,
      errors: this.errors
    };
  };

  return Validator;
}();

Object.keys(valLib).forEach(function (name) {
  if (typeof valLib[name] == 'function' && name !== 'toString' && name !== 'toDate' && name !== 'extend' && name !== 'init') {

    Validator.prototype[name] = function (error) {
      //noinspection JSPotentiallyInvalidUsageOfThis
      return this._callMethod(name, error || name, Array.prototype.slice.call(arguments, error ? 1 : 0));
    };
  }
});

module.exports = Validator;

},{"150":150,"58":58}],60:[function(_dereq_,module,exports){
'use strict';

/**
 * @namespace baqend.util
 */
module.exports = exports = _dereq_(61);
exports.Metadata = _dereq_(53);
exports.Permission = _dereq_(55);
exports.Acl = _dereq_(49);
exports.Validator = _dereq_(59);
exports.ValidationResult = _dereq_(58);
exports.Code = _dereq_(50);
exports.Modules = _dereq_(54);
exports.Lockable = _dereq_(51);
exports.Logger = _dereq_(52);
exports.uuid = _dereq_(148).v4;
exports.PushMessage = _dereq_(56);
exports.TokenStorage = _dereq_(57);

},{"148":148,"49":49,"50":50,"51":51,"52":52,"53":53,"54":54,"55":55,"56":56,"57":57,"58":58,"59":59,"61":61}],61:[function(_dereq_,module,exports){
'use strict';

exports.hmac = _dereq_(145);
exports.atob = window.atob;
exports.WebSocket = window.WebSocket;

},{"145":145}],62:[function(_dereq_,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],63:[function(_dereq_,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = _dereq_(134)('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)_dereq_(84)(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"134":134,"84":84}],64:[function(_dereq_,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],65:[function(_dereq_,module,exports){
var isObject = _dereq_(92);
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"92":92}],66:[function(_dereq_,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = _dereq_(127)
  , toLength  = _dereq_(128)
  , toIndex   = _dereq_(125);
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"125":125,"127":127,"128":128}],67:[function(_dereq_,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = _dereq_(68)
  , TAG = _dereq_(134)('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"134":134,"68":68}],68:[function(_dereq_,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],69:[function(_dereq_,module,exports){
'use strict';
var dP          = _dereq_(105).f
  , create      = _dereq_(104)
  , hide        = _dereq_(84)
  , redefineAll = _dereq_(116)
  , ctx         = _dereq_(73)
  , anInstance  = _dereq_(64)
  , defined     = _dereq_(74)
  , forOf       = _dereq_(81)
  , $iterDefine = _dereq_(95)
  , step        = _dereq_(97)
  , setSpecies  = _dereq_(119)
  , DESCRIPTORS = _dereq_(75)
  , fastKey     = _dereq_(101).fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"101":101,"104":104,"105":105,"116":116,"119":119,"64":64,"73":73,"74":74,"75":75,"81":81,"84":84,"95":95,"97":97}],70:[function(_dereq_,module,exports){
'use strict';
var global            = _dereq_(82)
  , $export           = _dereq_(79)
  , redefine          = _dereq_(117)
  , redefineAll       = _dereq_(116)
  , meta              = _dereq_(101)
  , forOf             = _dereq_(81)
  , anInstance        = _dereq_(64)
  , isObject          = _dereq_(92)
  , fails             = _dereq_(80)
  , $iterDetect       = _dereq_(96)
  , setToStringTag    = _dereq_(120)
  , inheritIfRequired = _dereq_(87);

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  var fixMethod = function(KEY){
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a){
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if(typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance             = new C
      // early implementations not supports chaining
      , HASNT_CHAINING       = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance
      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
      , THROWS_ON_PRIMITIVES = fails(function(){ instance.has(1); })
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      , ACCEPT_ITERABLES     = $iterDetect(function(iter){ new C(iter); }) // eslint-disable-line no-new
      // for early implementations -0 and +0 not the same
      , BUGGY_ZERO = !IS_WEAK && fails(function(){
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new C()
          , index     = 5;
        while(index--)$instance[ADDER](index, index);
        return !$instance.has(-0);
      });
    if(!ACCEPT_ITERABLES){ 
      C = wrapper(function(target, iterable){
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base, target, C);
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if(THROWS_ON_PRIMITIVES || BUGGY_ZERO){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if(BUGGY_ZERO || HASNT_CHAINING)fixMethod(ADDER);
    // weak collections should not contains .clear method
    if(IS_WEAK && proto.clear)delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"101":101,"116":116,"117":117,"120":120,"64":64,"79":79,"80":80,"81":81,"82":82,"87":87,"92":92,"96":96}],71:[function(_dereq_,module,exports){
var core = module.exports = {version: '2.3.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],72:[function(_dereq_,module,exports){
'use strict';
var $defineProperty = _dereq_(105)
  , createDesc      = _dereq_(115);

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"105":105,"115":115}],73:[function(_dereq_,module,exports){
// optional / simple context binding
var aFunction = _dereq_(62);
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"62":62}],74:[function(_dereq_,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],75:[function(_dereq_,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !_dereq_(80)(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"80":80}],76:[function(_dereq_,module,exports){
var isObject = _dereq_(92)
  , document = _dereq_(82).document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"82":82,"92":92}],77:[function(_dereq_,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],78:[function(_dereq_,module,exports){
// all enumerable object keys, includes symbols
var getKeys = _dereq_(113)
  , gOPS    = _dereq_(110)
  , pIE     = _dereq_(114);
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"110":110,"113":113,"114":114}],79:[function(_dereq_,module,exports){
var global    = _dereq_(82)
  , core      = _dereq_(71)
  , hide      = _dereq_(84)
  , redefine  = _dereq_(117)
  , ctx       = _dereq_(73)
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target)redefine(target, key, out, type & $export.U);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"117":117,"71":71,"73":73,"82":82,"84":84}],80:[function(_dereq_,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],81:[function(_dereq_,module,exports){
var ctx         = _dereq_(73)
  , call        = _dereq_(93)
  , isArrayIter = _dereq_(90)
  , anObject    = _dereq_(65)
  , toLength    = _dereq_(128)
  , getIterFn   = _dereq_(135);
module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    call(iterator, f, step.value, entries);
  }
};
},{"128":128,"135":135,"65":65,"73":73,"90":90,"93":93}],82:[function(_dereq_,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],83:[function(_dereq_,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],84:[function(_dereq_,module,exports){
var dP         = _dereq_(105)
  , createDesc = _dereq_(115);
module.exports = _dereq_(75) ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"105":105,"115":115,"75":75}],85:[function(_dereq_,module,exports){
module.exports = _dereq_(82).document && document.documentElement;
},{"82":82}],86:[function(_dereq_,module,exports){
module.exports = !_dereq_(75) && !_dereq_(80)(function(){
  return Object.defineProperty(_dereq_(76)('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"75":75,"76":76,"80":80}],87:[function(_dereq_,module,exports){
var isObject       = _dereq_(92)
  , setPrototypeOf = _dereq_(118).set;
module.exports = function(that, target, C){
  var P, S = target.constructor;
  if(S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf){
    setPrototypeOf(that, P);
  } return that;
};
},{"118":118,"92":92}],88:[function(_dereq_,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],89:[function(_dereq_,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = _dereq_(68);
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"68":68}],90:[function(_dereq_,module,exports){
// check on default Array iterator
var Iterators  = _dereq_(98)
  , ITERATOR   = _dereq_(134)('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"134":134,"98":98}],91:[function(_dereq_,module,exports){
// 7.2.2 IsArray(argument)
var cof = _dereq_(68);
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"68":68}],92:[function(_dereq_,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],93:[function(_dereq_,module,exports){
// call something on iterator step with safe closing on error
var anObject = _dereq_(65);
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"65":65}],94:[function(_dereq_,module,exports){
'use strict';
var create         = _dereq_(104)
  , descriptor     = _dereq_(115)
  , setToStringTag = _dereq_(120)
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
_dereq_(84)(IteratorPrototype, _dereq_(134)('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"104":104,"115":115,"120":120,"134":134,"84":84}],95:[function(_dereq_,module,exports){
'use strict';
var LIBRARY        = _dereq_(100)
  , $export        = _dereq_(79)
  , redefine       = _dereq_(117)
  , hide           = _dereq_(84)
  , has            = _dereq_(83)
  , Iterators      = _dereq_(98)
  , $iterCreate    = _dereq_(94)
  , setToStringTag = _dereq_(120)
  , getPrototypeOf = _dereq_(111)
  , ITERATOR       = _dereq_(134)('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"100":100,"111":111,"117":117,"120":120,"134":134,"79":79,"83":83,"84":84,"94":94,"98":98}],96:[function(_dereq_,module,exports){
var ITERATOR     = _dereq_(134)('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"134":134}],97:[function(_dereq_,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],98:[function(_dereq_,module,exports){
module.exports = {};
},{}],99:[function(_dereq_,module,exports){
var getKeys   = _dereq_(113)
  , toIObject = _dereq_(127);
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"113":113,"127":127}],100:[function(_dereq_,module,exports){
module.exports = false;
},{}],101:[function(_dereq_,module,exports){
var META     = _dereq_(131)('meta')
  , isObject = _dereq_(92)
  , has      = _dereq_(83)
  , setDesc  = _dereq_(105).f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !_dereq_(80)(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"105":105,"131":131,"80":80,"83":83,"92":92}],102:[function(_dereq_,module,exports){
var global    = _dereq_(82)
  , macrotask = _dereq_(124).set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = _dereq_(68)(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if(parent)parent.enter();
  };

  // Node.js
  if(isNode){
    notify = function(){
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if(Observer){
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function(){
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"124":124,"68":68,"82":82}],103:[function(_dereq_,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = _dereq_(113)
  , gOPS     = _dereq_(110)
  , pIE      = _dereq_(114)
  , toObject = _dereq_(129)
  , IObject  = _dereq_(89)
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || _dereq_(80)(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"110":110,"113":113,"114":114,"129":129,"80":80,"89":89}],104:[function(_dereq_,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = _dereq_(65)
  , dPs         = _dereq_(106)
  , enumBugKeys = _dereq_(77)
  , IE_PROTO    = _dereq_(121)('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _dereq_(76)('iframe')
    , i      = enumBugKeys.length
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  _dereq_(85).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};
},{"106":106,"121":121,"65":65,"76":76,"77":77,"85":85}],105:[function(_dereq_,module,exports){
var anObject       = _dereq_(65)
  , IE8_DOM_DEFINE = _dereq_(86)
  , toPrimitive    = _dereq_(130)
  , dP             = Object.defineProperty;

exports.f = _dereq_(75) ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"130":130,"65":65,"75":75,"86":86}],106:[function(_dereq_,module,exports){
var dP       = _dereq_(105)
  , anObject = _dereq_(65)
  , getKeys  = _dereq_(113);

module.exports = _dereq_(75) ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"105":105,"113":113,"65":65,"75":75}],107:[function(_dereq_,module,exports){
var pIE            = _dereq_(114)
  , createDesc     = _dereq_(115)
  , toIObject      = _dereq_(127)
  , toPrimitive    = _dereq_(130)
  , has            = _dereq_(83)
  , IE8_DOM_DEFINE = _dereq_(86)
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = _dereq_(75) ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"114":114,"115":115,"127":127,"130":130,"75":75,"83":83,"86":86}],108:[function(_dereq_,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = _dereq_(127)
  , gOPN      = _dereq_(109).f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"109":109,"127":127}],109:[function(_dereq_,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = _dereq_(112)
  , hiddenKeys = _dereq_(77).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"112":112,"77":77}],110:[function(_dereq_,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],111:[function(_dereq_,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = _dereq_(83)
  , toObject    = _dereq_(129)
  , IE_PROTO    = _dereq_(121)('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"121":121,"129":129,"83":83}],112:[function(_dereq_,module,exports){
var has          = _dereq_(83)
  , toIObject    = _dereq_(127)
  , arrayIndexOf = _dereq_(66)(false)
  , IE_PROTO     = _dereq_(121)('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"121":121,"127":127,"66":66,"83":83}],113:[function(_dereq_,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = _dereq_(112)
  , enumBugKeys = _dereq_(77);

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"112":112,"77":77}],114:[function(_dereq_,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],115:[function(_dereq_,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],116:[function(_dereq_,module,exports){
var redefine = _dereq_(117);
module.exports = function(target, src, safe){
  for(var key in src)redefine(target, key, src[key], safe);
  return target;
};
},{"117":117}],117:[function(_dereq_,module,exports){
var global    = _dereq_(82)
  , hide      = _dereq_(84)
  , has       = _dereq_(83)
  , SRC       = _dereq_(131)('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

_dereq_(71).inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  var isFunction = typeof val == 'function';
  if(isFunction)has(val, 'name') || hide(val, 'name', key);
  if(O[key] === val)return;
  if(isFunction)has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if(O === global){
    O[key] = val;
  } else {
    if(!safe){
      delete O[key];
      hide(O, key, val);
    } else {
      if(O[key])O[key] = val;
      else hide(O, key, val);
    }
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"131":131,"71":71,"82":82,"83":83,"84":84}],118:[function(_dereq_,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = _dereq_(92)
  , anObject = _dereq_(65);
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = _dereq_(73)(Function.call, _dereq_(107).f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"107":107,"65":65,"73":73,"92":92}],119:[function(_dereq_,module,exports){
'use strict';
var global      = _dereq_(82)
  , dP          = _dereq_(105)
  , DESCRIPTORS = _dereq_(75)
  , SPECIES     = _dereq_(134)('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"105":105,"134":134,"75":75,"82":82}],120:[function(_dereq_,module,exports){
var def = _dereq_(105).f
  , has = _dereq_(83)
  , TAG = _dereq_(134)('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"105":105,"134":134,"83":83}],121:[function(_dereq_,module,exports){
var shared = _dereq_(122)('keys')
  , uid    = _dereq_(131);
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"122":122,"131":131}],122:[function(_dereq_,module,exports){
var global = _dereq_(82)
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"82":82}],123:[function(_dereq_,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = _dereq_(65)
  , aFunction = _dereq_(62)
  , SPECIES   = _dereq_(134)('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"134":134,"62":62,"65":65}],124:[function(_dereq_,module,exports){
var ctx                = _dereq_(73)
  , invoke             = _dereq_(88)
  , html               = _dereq_(85)
  , cel                = _dereq_(76)
  , global             = _dereq_(82)
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(_dereq_(68)(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"68":68,"73":73,"76":76,"82":82,"85":85,"88":88}],125:[function(_dereq_,module,exports){
var toInteger = _dereq_(126)
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"126":126}],126:[function(_dereq_,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],127:[function(_dereq_,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = _dereq_(89)
  , defined = _dereq_(74);
module.exports = function(it){
  return IObject(defined(it));
};
},{"74":74,"89":89}],128:[function(_dereq_,module,exports){
// 7.1.15 ToLength
var toInteger = _dereq_(126)
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"126":126}],129:[function(_dereq_,module,exports){
// 7.1.13 ToObject(argument)
var defined = _dereq_(74);
module.exports = function(it){
  return Object(defined(it));
};
},{"74":74}],130:[function(_dereq_,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = _dereq_(92);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"92":92}],131:[function(_dereq_,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],132:[function(_dereq_,module,exports){
var global         = _dereq_(82)
  , core           = _dereq_(71)
  , LIBRARY        = _dereq_(100)
  , wksExt         = _dereq_(133)
  , defineProperty = _dereq_(105).f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"100":100,"105":105,"133":133,"71":71,"82":82}],133:[function(_dereq_,module,exports){
exports.f = _dereq_(134);
},{"134":134}],134:[function(_dereq_,module,exports){
var store      = _dereq_(122)('wks')
  , uid        = _dereq_(131)
  , Symbol     = _dereq_(82).Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"122":122,"131":131,"82":82}],135:[function(_dereq_,module,exports){
var classof   = _dereq_(67)
  , ITERATOR  = _dereq_(134)('iterator')
  , Iterators = _dereq_(98);
module.exports = _dereq_(71).getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"134":134,"67":67,"71":71,"98":98}],136:[function(_dereq_,module,exports){
'use strict';
var ctx            = _dereq_(73)
  , $export        = _dereq_(79)
  , toObject       = _dereq_(129)
  , call           = _dereq_(93)
  , isArrayIter    = _dereq_(90)
  , toLength       = _dereq_(128)
  , createProperty = _dereq_(72)
  , getIterFn      = _dereq_(135);

$export($export.S + $export.F * !_dereq_(96)(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"128":128,"129":129,"135":135,"72":72,"73":73,"79":79,"90":90,"93":93,"96":96}],137:[function(_dereq_,module,exports){
'use strict';
var addToUnscopables = _dereq_(63)
  , step             = _dereq_(97)
  , Iterators        = _dereq_(98)
  , toIObject        = _dereq_(127);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = _dereq_(95)(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"127":127,"63":63,"95":95,"97":97,"98":98}],138:[function(_dereq_,module,exports){
'use strict';
var strong = _dereq_(69);

// 23.1 Map Objects
module.exports = _dereq_(70)('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"69":69,"70":70}],139:[function(_dereq_,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = _dereq_(79);

$export($export.S + $export.F, 'Object', {assign: _dereq_(103)});
},{"103":103,"79":79}],140:[function(_dereq_,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = _dereq_(79);
$export($export.S, 'Object', {setPrototypeOf: _dereq_(118).set});
},{"118":118,"79":79}],141:[function(_dereq_,module,exports){
'use strict';
var LIBRARY            = _dereq_(100)
  , global             = _dereq_(82)
  , ctx                = _dereq_(73)
  , classof            = _dereq_(67)
  , $export            = _dereq_(79)
  , isObject           = _dereq_(92)
  , anObject           = _dereq_(65)
  , aFunction          = _dereq_(62)
  , anInstance         = _dereq_(64)
  , forOf              = _dereq_(81)
  , setProto           = _dereq_(118).set
  , speciesConstructor = _dereq_(123)
  , task               = _dereq_(124).set
  , microtask          = _dereq_(102)()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[_dereq_(134)('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = _dereq_(116)($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
_dereq_(120)($Promise, PROMISE);
_dereq_(119)(PROMISE);
Wrapper = _dereq_(71)[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && _dereq_(96)(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"100":100,"102":102,"116":116,"118":118,"119":119,"120":120,"123":123,"124":124,"134":134,"62":62,"64":64,"65":65,"67":67,"71":71,"73":73,"79":79,"81":81,"82":82,"92":92,"96":96}],142:[function(_dereq_,module,exports){
'use strict';
var strong = _dereq_(69);

// 23.2 Set Objects
module.exports = _dereq_(70)('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"69":69,"70":70}],143:[function(_dereq_,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = _dereq_(82)
  , has            = _dereq_(83)
  , DESCRIPTORS    = _dereq_(75)
  , $export        = _dereq_(79)
  , redefine       = _dereq_(117)
  , META           = _dereq_(101).KEY
  , $fails         = _dereq_(80)
  , shared         = _dereq_(122)
  , setToStringTag = _dereq_(120)
  , uid            = _dereq_(131)
  , wks            = _dereq_(134)
  , wksExt         = _dereq_(133)
  , wksDefine      = _dereq_(132)
  , keyOf          = _dereq_(99)
  , enumKeys       = _dereq_(78)
  , isArray        = _dereq_(91)
  , anObject       = _dereq_(65)
  , toIObject      = _dereq_(127)
  , toPrimitive    = _dereq_(130)
  , createDesc     = _dereq_(115)
  , _create        = _dereq_(104)
  , gOPNExt        = _dereq_(108)
  , $GOPD          = _dereq_(107)
  , $DP            = _dereq_(105)
  , $keys          = _dereq_(113)
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  var D = gOPD(it = toIObject(it), key = toPrimitive(key, true));
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
      configurable: true,
      set: function(value){
        if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
        setSymbolDesc(this, tag, createDesc(1, value));
      }
    });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  _dereq_(109).f = gOPNExt.f = $getOwnPropertyNames;
  _dereq_(114).f  = $propertyIsEnumerable;
  _dereq_(110).f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !_dereq_(100)){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || _dereq_(84)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"100":100,"101":101,"104":104,"105":105,"107":107,"108":108,"109":109,"110":110,"113":113,"114":114,"115":115,"117":117,"120":120,"122":122,"127":127,"130":130,"131":131,"132":132,"133":133,"134":134,"65":65,"75":75,"78":78,"79":79,"80":80,"82":82,"83":83,"84":84,"91":91,"99":99}],144:[function(_dereq_,module,exports){
;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory();
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define([], factory);
	}
	else {
		// Global (browser)
		root.CryptoJS = factory();
	}
}(this, function () {

	/**
	 * CryptoJS core components.
	 */
	var CryptoJS = CryptoJS || (function (Math, undefined) {
	    /**
	     * CryptoJS namespace.
	     */
	    var C = {};

	    /**
	     * Library namespace.
	     */
	    var C_lib = C.lib = {};

	    /**
	     * Base object for prototypal inheritance.
	     */
	    var Base = C_lib.Base = (function () {
	        function F() {}

	        return {
	            /**
	             * Creates a new object that inherits from this object.
	             *
	             * @param {Object} overrides Properties to copy into the new object.
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         field: 'value',
	             *
	             *         method: function () {
	             *         }
	             *     });
	             */
	            extend: function (overrides) {
	                // Spawn
	                F.prototype = this;
	                var subtype = new F();

	                // Augment
	                if (overrides) {
	                    subtype.mixIn(overrides);
	                }

	                // Create default initializer
	                if (!subtype.hasOwnProperty('init')) {
	                    subtype.init = function () {
	                        subtype.$super.init.apply(this, arguments);
	                    };
	                }

	                // Initializer's prototype is the subtype object
	                subtype.init.prototype = subtype;

	                // Reference supertype
	                subtype.$super = this;

	                return subtype;
	            },

	            /**
	             * Extends this object and runs the init method.
	             * Arguments to create() will be passed to init().
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var instance = MyType.create();
	             */
	            create: function () {
	                var instance = this.extend();
	                instance.init.apply(instance, arguments);

	                return instance;
	            },

	            /**
	             * Initializes a newly created object.
	             * Override this method to add some logic when your objects are created.
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         init: function () {
	             *             // ...
	             *         }
	             *     });
	             */
	            init: function () {
	            },

	            /**
	             * Copies properties into this object.
	             *
	             * @param {Object} properties The properties to mix in.
	             *
	             * @example
	             *
	             *     MyType.mixIn({
	             *         field: 'value'
	             *     });
	             */
	            mixIn: function (properties) {
	                for (var propertyName in properties) {
	                    if (properties.hasOwnProperty(propertyName)) {
	                        this[propertyName] = properties[propertyName];
	                    }
	                }

	                // IE won't copy toString using the loop above
	                if (properties.hasOwnProperty('toString')) {
	                    this.toString = properties.toString;
	                }
	            },

	            /**
	             * Creates a copy of this object.
	             *
	             * @return {Object} The clone.
	             *
	             * @example
	             *
	             *     var clone = instance.clone();
	             */
	            clone: function () {
	                return this.init.prototype.extend(this);
	            }
	        };
	    }());

	    /**
	     * An array of 32-bit words.
	     *
	     * @property {Array} words The array of 32-bit words.
	     * @property {number} sigBytes The number of significant bytes in this word array.
	     */
	    var WordArray = C_lib.WordArray = Base.extend({
	        /**
	         * Initializes a newly created word array.
	         *
	         * @param {Array} words (Optional) An array of 32-bit words.
	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.create();
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
	         */
	        init: function (words, sigBytes) {
	            words = this.words = words || [];

	            if (sigBytes != undefined) {
	                this.sigBytes = sigBytes;
	            } else {
	                this.sigBytes = words.length * 4;
	            }
	        },

	        /**
	         * Converts this word array to a string.
	         *
	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
	         *
	         * @return {string} The stringified word array.
	         *
	         * @example
	         *
	         *     var string = wordArray + '';
	         *     var string = wordArray.toString();
	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
	         */
	        toString: function (encoder) {
	            return (encoder || Hex).stringify(this);
	        },

	        /**
	         * Concatenates a word array to this word array.
	         *
	         * @param {WordArray} wordArray The word array to append.
	         *
	         * @return {WordArray} This word array.
	         *
	         * @example
	         *
	         *     wordArray1.concat(wordArray2);
	         */
	        concat: function (wordArray) {
	            // Shortcuts
	            var thisWords = this.words;
	            var thatWords = wordArray.words;
	            var thisSigBytes = this.sigBytes;
	            var thatSigBytes = wordArray.sigBytes;

	            // Clamp excess bits
	            this.clamp();

	            // Concat
	            if (thisSigBytes % 4) {
	                // Copy one byte at a time
	                for (var i = 0; i < thatSigBytes; i++) {
	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
	                }
	            } else {
	                // Copy one word at a time
	                for (var i = 0; i < thatSigBytes; i += 4) {
	                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
	                }
	            }
	            this.sigBytes += thatSigBytes;

	            // Chainable
	            return this;
	        },

	        /**
	         * Removes insignificant bits.
	         *
	         * @example
	         *
	         *     wordArray.clamp();
	         */
	        clamp: function () {
	            // Shortcuts
	            var words = this.words;
	            var sigBytes = this.sigBytes;

	            // Clamp
	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
	            words.length = Math.ceil(sigBytes / 4);
	        },

	        /**
	         * Creates a copy of this word array.
	         *
	         * @return {WordArray} The clone.
	         *
	         * @example
	         *
	         *     var clone = wordArray.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone.words = this.words.slice(0);

	            return clone;
	        },

	        /**
	         * Creates a word array filled with random bytes.
	         *
	         * @param {number} nBytes The number of random bytes to generate.
	         *
	         * @return {WordArray} The random word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
	         */
	        random: function (nBytes) {
	            var words = [];

	            var r = (function (m_w) {
	                var m_w = m_w;
	                var m_z = 0x3ade68b1;
	                var mask = 0xffffffff;

	                return function () {
	                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
	                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
	                    var result = ((m_z << 0x10) + m_w) & mask;
	                    result /= 0x100000000;
	                    result += 0.5;
	                    return result * (Math.random() > .5 ? 1 : -1);
	                }
	            });

	            for (var i = 0, rcache; i < nBytes; i += 4) {
	                var _r = r((rcache || Math.random()) * 0x100000000);

	                rcache = _r() * 0x3ade67b7;
	                words.push((_r() * 0x100000000) | 0);
	            }

	            return new WordArray.init(words, nBytes);
	        }
	    });

	    /**
	     * Encoder namespace.
	     */
	    var C_enc = C.enc = {};

	    /**
	     * Hex encoding strategy.
	     */
	    var Hex = C_enc.Hex = {
	        /**
	         * Converts a word array to a hex string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The hex string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var hexChars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                hexChars.push((bite >>> 4).toString(16));
	                hexChars.push((bite & 0x0f).toString(16));
	            }

	            return hexChars.join('');
	        },

	        /**
	         * Converts a hex string to a word array.
	         *
	         * @param {string} hexStr The hex string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
	         */
	        parse: function (hexStr) {
	            // Shortcut
	            var hexStrLength = hexStr.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < hexStrLength; i += 2) {
	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
	            }

	            return new WordArray.init(words, hexStrLength / 2);
	        }
	    };

	    /**
	     * Latin1 encoding strategy.
	     */
	    var Latin1 = C_enc.Latin1 = {
	        /**
	         * Converts a word array to a Latin1 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The Latin1 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var latin1Chars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                latin1Chars.push(String.fromCharCode(bite));
	            }

	            return latin1Chars.join('');
	        },

	        /**
	         * Converts a Latin1 string to a word array.
	         *
	         * @param {string} latin1Str The Latin1 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
	         */
	        parse: function (latin1Str) {
	            // Shortcut
	            var latin1StrLength = latin1Str.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < latin1StrLength; i++) {
	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
	            }

	            return new WordArray.init(words, latin1StrLength);
	        }
	    };

	    /**
	     * UTF-8 encoding strategy.
	     */
	    var Utf8 = C_enc.Utf8 = {
	        /**
	         * Converts a word array to a UTF-8 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The UTF-8 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            try {
	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
	            } catch (e) {
	                throw new Error('Malformed UTF-8 data');
	            }
	        },

	        /**
	         * Converts a UTF-8 string to a word array.
	         *
	         * @param {string} utf8Str The UTF-8 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
	         */
	        parse: function (utf8Str) {
	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
	        }
	    };

	    /**
	     * Abstract buffered block algorithm template.
	     *
	     * The property blockSize must be implemented in a concrete subtype.
	     *
	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
	     */
	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
	        /**
	         * Resets this block algorithm's data buffer to its initial state.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm.reset();
	         */
	        reset: function () {
	            // Initial values
	            this._data = new WordArray.init();
	            this._nDataBytes = 0;
	        },

	        /**
	         * Adds new data to this block algorithm's buffer.
	         *
	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm._append('data');
	         *     bufferedBlockAlgorithm._append(wordArray);
	         */
	        _append: function (data) {
	            // Convert string to WordArray, else assume WordArray already
	            if (typeof data == 'string') {
	                data = Utf8.parse(data);
	            }

	            // Append
	            this._data.concat(data);
	            this._nDataBytes += data.sigBytes;
	        },

	        /**
	         * Processes available data blocks.
	         *
	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
	         *
	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
	         *
	         * @return {WordArray} The processed data.
	         *
	         * @example
	         *
	         *     var processedData = bufferedBlockAlgorithm._process();
	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
	         */
	        _process: function (doFlush) {
	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;
	            var dataSigBytes = data.sigBytes;
	            var blockSize = this.blockSize;
	            var blockSizeBytes = blockSize * 4;

	            // Count blocks ready
	            var nBlocksReady = dataSigBytes / blockSizeBytes;
	            if (doFlush) {
	                // Round up to include partial blocks
	                nBlocksReady = Math.ceil(nBlocksReady);
	            } else {
	                // Round down to include only full blocks,
	                // less the number of blocks that must remain in the buffer
	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
	            }

	            // Count words ready
	            var nWordsReady = nBlocksReady * blockSize;

	            // Count bytes ready
	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

	            // Process blocks
	            if (nWordsReady) {
	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
	                    // Perform concrete-algorithm logic
	                    this._doProcessBlock(dataWords, offset);
	                }

	                // Remove processed words
	                var processedWords = dataWords.splice(0, nWordsReady);
	                data.sigBytes -= nBytesReady;
	            }

	            // Return processed words
	            return new WordArray.init(processedWords, nBytesReady);
	        },

	        /**
	         * Creates a copy of this object.
	         *
	         * @return {Object} The clone.
	         *
	         * @example
	         *
	         *     var clone = bufferedBlockAlgorithm.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone._data = this._data.clone();

	            return clone;
	        },

	        _minBufferSize: 0
	    });

	    /**
	     * Abstract hasher template.
	     *
	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
	     */
	    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
	        /**
	         * Configuration options.
	         */
	        cfg: Base.extend(),

	        /**
	         * Initializes a newly created hasher.
	         *
	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
	         *
	         * @example
	         *
	         *     var hasher = CryptoJS.algo.SHA256.create();
	         */
	        init: function (cfg) {
	            // Apply config defaults
	            this.cfg = this.cfg.extend(cfg);

	            // Set initial values
	            this.reset();
	        },

	        /**
	         * Resets this hasher to its initial state.
	         *
	         * @example
	         *
	         *     hasher.reset();
	         */
	        reset: function () {
	            // Reset data buffer
	            BufferedBlockAlgorithm.reset.call(this);

	            // Perform concrete-hasher logic
	            this._doReset();
	        },

	        /**
	         * Updates this hasher with a message.
	         *
	         * @param {WordArray|string} messageUpdate The message to append.
	         *
	         * @return {Hasher} This hasher.
	         *
	         * @example
	         *
	         *     hasher.update('message');
	         *     hasher.update(wordArray);
	         */
	        update: function (messageUpdate) {
	            // Append
	            this._append(messageUpdate);

	            // Update the hash
	            this._process();

	            // Chainable
	            return this;
	        },

	        /**
	         * Finalizes the hash computation.
	         * Note that the finalize operation is effectively a destructive, read-once operation.
	         *
	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
	         *
	         * @return {WordArray} The hash.
	         *
	         * @example
	         *
	         *     var hash = hasher.finalize();
	         *     var hash = hasher.finalize('message');
	         *     var hash = hasher.finalize(wordArray);
	         */
	        finalize: function (messageUpdate) {
	            // Final message update
	            if (messageUpdate) {
	                this._append(messageUpdate);
	            }

	            // Perform concrete-hasher logic
	            var hash = this._doFinalize();

	            return hash;
	        },

	        blockSize: 512/32,

	        /**
	         * Creates a shortcut function to a hasher's object interface.
	         *
	         * @param {Hasher} hasher The hasher to create a helper for.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
	         */
	        _createHelper: function (hasher) {
	            return function (message, cfg) {
	                return new hasher.init(cfg).finalize(message);
	            };
	        },

	        /**
	         * Creates a shortcut function to the HMAC's object interface.
	         *
	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
	         */
	        _createHmacHelper: function (hasher) {
	            return function (message, key) {
	                return new C_algo.HMAC.init(hasher, key).finalize(message);
	            };
	        }
	    });

	    /**
	     * Algorithm namespace.
	     */
	    var C_algo = C.algo = {};

	    return C;
	}(Math));


	return CryptoJS;

}));
},{}],145:[function(_dereq_,module,exports){
;(function (root, factory, undef) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(_dereq_(144), _dereq_(147), _dereq_(146));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define(["./core", "./sha1", "./hmac"], factory);
	}
	else {
		// Global (browser)
		factory(root.CryptoJS);
	}
}(this, function (CryptoJS) {

	return CryptoJS.HmacSHA1;

}));
},{"144":144,"146":146,"147":147}],146:[function(_dereq_,module,exports){
;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(_dereq_(144));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define(["./core"], factory);
	}
	else {
		// Global (browser)
		factory(root.CryptoJS);
	}
}(this, function (CryptoJS) {

	(function () {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var Base = C_lib.Base;
	    var C_enc = C.enc;
	    var Utf8 = C_enc.Utf8;
	    var C_algo = C.algo;

	    /**
	     * HMAC algorithm.
	     */
	    var HMAC = C_algo.HMAC = Base.extend({
	        /**
	         * Initializes a newly created HMAC.
	         *
	         * @param {Hasher} hasher The hash algorithm to use.
	         * @param {WordArray|string} key The secret key.
	         *
	         * @example
	         *
	         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
	         */
	        init: function (hasher, key) {
	            // Init hasher
	            hasher = this._hasher = new hasher.init();

	            // Convert string to WordArray, else assume WordArray already
	            if (typeof key == 'string') {
	                key = Utf8.parse(key);
	            }

	            // Shortcuts
	            var hasherBlockSize = hasher.blockSize;
	            var hasherBlockSizeBytes = hasherBlockSize * 4;

	            // Allow arbitrary length keys
	            if (key.sigBytes > hasherBlockSizeBytes) {
	                key = hasher.finalize(key);
	            }

	            // Clamp excess bits
	            key.clamp();

	            // Clone key for inner and outer pads
	            var oKey = this._oKey = key.clone();
	            var iKey = this._iKey = key.clone();

	            // Shortcuts
	            var oKeyWords = oKey.words;
	            var iKeyWords = iKey.words;

	            // XOR keys with pad constants
	            for (var i = 0; i < hasherBlockSize; i++) {
	                oKeyWords[i] ^= 0x5c5c5c5c;
	                iKeyWords[i] ^= 0x36363636;
	            }
	            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

	            // Set initial values
	            this.reset();
	        },

	        /**
	         * Resets this HMAC to its initial state.
	         *
	         * @example
	         *
	         *     hmacHasher.reset();
	         */
	        reset: function () {
	            // Shortcut
	            var hasher = this._hasher;

	            // Reset
	            hasher.reset();
	            hasher.update(this._iKey);
	        },

	        /**
	         * Updates this HMAC with a message.
	         *
	         * @param {WordArray|string} messageUpdate The message to append.
	         *
	         * @return {HMAC} This HMAC instance.
	         *
	         * @example
	         *
	         *     hmacHasher.update('message');
	         *     hmacHasher.update(wordArray);
	         */
	        update: function (messageUpdate) {
	            this._hasher.update(messageUpdate);

	            // Chainable
	            return this;
	        },

	        /**
	         * Finalizes the HMAC computation.
	         * Note that the finalize operation is effectively a destructive, read-once operation.
	         *
	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
	         *
	         * @return {WordArray} The HMAC.
	         *
	         * @example
	         *
	         *     var hmac = hmacHasher.finalize();
	         *     var hmac = hmacHasher.finalize('message');
	         *     var hmac = hmacHasher.finalize(wordArray);
	         */
	        finalize: function (messageUpdate) {
	            // Shortcut
	            var hasher = this._hasher;

	            // Compute HMAC
	            var innerHash = hasher.finalize(messageUpdate);
	            hasher.reset();
	            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

	            return hmac;
	        }
	    });
	}());


}));
},{"144":144}],147:[function(_dereq_,module,exports){
;(function (root, factory) {
	if (typeof exports === "object") {
		// CommonJS
		module.exports = exports = factory(_dereq_(144));
	}
	else if (typeof define === "function" && define.amd) {
		// AMD
		define(["./core"], factory);
	}
	else {
		// Global (browser)
		factory(root.CryptoJS);
	}
}(this, function (CryptoJS) {

	(function () {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var WordArray = C_lib.WordArray;
	    var Hasher = C_lib.Hasher;
	    var C_algo = C.algo;

	    // Reusable object
	    var W = [];

	    /**
	     * SHA-1 hash algorithm.
	     */
	    var SHA1 = C_algo.SHA1 = Hasher.extend({
	        _doReset: function () {
	            this._hash = new WordArray.init([
	                0x67452301, 0xefcdab89,
	                0x98badcfe, 0x10325476,
	                0xc3d2e1f0
	            ]);
	        },

	        _doProcessBlock: function (M, offset) {
	            // Shortcut
	            var H = this._hash.words;

	            // Working variables
	            var a = H[0];
	            var b = H[1];
	            var c = H[2];
	            var d = H[3];
	            var e = H[4];

	            // Computation
	            for (var i = 0; i < 80; i++) {
	                if (i < 16) {
	                    W[i] = M[offset + i] | 0;
	                } else {
	                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
	                    W[i] = (n << 1) | (n >>> 31);
	                }

	                var t = ((a << 5) | (a >>> 27)) + e + W[i];
	                if (i < 20) {
	                    t += ((b & c) | (~b & d)) + 0x5a827999;
	                } else if (i < 40) {
	                    t += (b ^ c ^ d) + 0x6ed9eba1;
	                } else if (i < 60) {
	                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
	                } else /* if (i < 80) */ {
	                    t += (b ^ c ^ d) - 0x359d3e2a;
	                }

	                e = d;
	                d = c;
	                c = (b << 30) | (b >>> 2);
	                b = a;
	                a = t;
	            }

	            // Intermediate hash value
	            H[0] = (H[0] + a) | 0;
	            H[1] = (H[1] + b) | 0;
	            H[2] = (H[2] + c) | 0;
	            H[3] = (H[3] + d) | 0;
	            H[4] = (H[4] + e) | 0;
	        },

	        _doFinalize: function () {
	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;

	            var nBitsTotal = this._nDataBytes * 8;
	            var nBitsLeft = data.sigBytes * 8;

	            // Add padding
	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
	            data.sigBytes = dataWords.length * 4;

	            // Hash final blocks
	            this._process();

	            // Return final computed hash
	            return this._hash;
	        },

	        clone: function () {
	            var clone = Hasher.clone.call(this);
	            clone._hash = this._hash.clone();

	            return clone;
	        }
	    });

	    /**
	     * Shortcut function to the hasher's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     *
	     * @return {WordArray} The hash.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hash = CryptoJS.SHA1('message');
	     *     var hash = CryptoJS.SHA1(wordArray);
	     */
	    C.SHA1 = Hasher._createHelper(SHA1);

	    /**
	     * Shortcut function to the HMAC's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     * @param {WordArray|string} key The secret key.
	     *
	     * @return {WordArray} The HMAC.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hmac = CryptoJS.HmacSHA1(message, key);
	     */
	    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
	}());


	return CryptoJS.SHA1;

}));
},{"144":144}],148:[function(_dereq_,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

/*global window, require, define */
(function(_window) {
  'use strict';

  // Unique ID creation requires a high quality random # generator.  We feature
  // detect to determine the best RNG source, normalizing to a function that
  // returns 128-bits of randomness, since that's what's usually required
  var _rng, _mathRNG, _nodeRNG, _whatwgRNG, _previousRoot;

  function setupBrowser() {
    // Allow for MSIE11 msCrypto
    var _crypto = _window.crypto || _window.msCrypto;

    if (!_rng && _crypto && _crypto.getRandomValues) {
      // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
      //
      // Moderately fast, high quality
      try {
        var _rnds8 = new Uint8Array(16);
        _whatwgRNG = _rng = function whatwgRNG() {
          _crypto.getRandomValues(_rnds8);
          return _rnds8;
        };
        _rng();
      } catch(e) {}
    }

    if (!_rng) {
      // Math.random()-based (RNG)
      //
      // If all else fails, use Math.random().  It's fast, but is of unspecified
      // quality.
      var  _rnds = new Array(16);
      _mathRNG = _rng = function() {
        for (var i = 0, r; i < 16; i++) {
          if ((i & 0x03) === 0) { r = Math.random() * 0x100000000; }
          _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        return _rnds;
      };
      if ('undefined' !== typeof console && console.warn) {
        console.warn("[SECURITY] node-uuid: crypto not usable, falling back to insecure Math.random()");
      }
    }
  }

  function setupNode() {
    // Node.js crypto-based RNG - http://nodejs.org/docs/v0.6.2/api/crypto.html
    //
    // Moderately fast, high quality
    if ('function' === typeof _dereq_) {
      try {
        var _rb = _dereq_('crypto').randomBytes;
        _nodeRNG = _rng = _rb && function() {return _rb(16);};
        _rng();
      } catch(e) {}
    }
  }

  if (_window) {
    setupBrowser();
  } else {
    setupNode();
  }

  // Buffer class to use
  var BufferClass = ('function' === typeof Buffer) ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v1()` - Generate time-based UUID**
  //
  // Inspired by https://github.com/LiosK/UUID.js
  // and http://docs.python.org/library/uuid.html

  // random #'s we need to init node and clockseq
  var _seedBytes = _rng();

  // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
  var _nodeId = [
    _seedBytes[0] | 0x01,
    _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
  ];

  // Per 4.2.2, randomize (14 bit) clockseq
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

  // Previous uuid creation time
  var _lastMSecs = 0, _lastNSecs = 0;

  // See https://github.com/broofa/node-uuid for API details
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];

    options = options || {};

    var clockseq = (options.clockseq != null) ? options.clockseq : _clockseq;

    // UUID timestamps are 100 nano-second units since the Gregorian epoch,
    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
    var msecs = (options.msecs != null) ? options.msecs : new Date().getTime();

    // Per 4.2.1.2, use count of uuid's generated during the current clock
    // cycle to simulate higher resolution clock
    var nsecs = (options.nsecs != null) ? options.nsecs : _lastNSecs + 1;

    // Time since last uuid creation (in msecs)
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

    // Per 4.2.1.2, Bump clockseq on clock regression
    if (dt < 0 && options.clockseq == null) {
      clockseq = clockseq + 1 & 0x3fff;
    }

    // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
    // time interval
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs == null) {
      nsecs = 0;
    }

    // Per 4.2.1.2 Throw error if too many uuids are requested
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }

    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;

    // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
    msecs += 12219292800000;

    // `time_low`
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;

    // `time_mid`
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;

    // `time_high_and_version`
    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
    b[i++] = tmh >>> 16 & 0xff;

    // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
    b[i++] = clockseq >>> 8 | 0x80;

    // `clock_seq_low`
    b[i++] = clockseq & 0xff;

    // `node`
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; n++) {
      b[i + n] = node[n];
    }

    return buf ? buf : unparse(b);
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) === 'string') {
      buf = (options === 'binary') ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;
  uuid._rng = _rng;
  uuid._mathRNG = _mathRNG;
  uuid._nodeRNG = _nodeRNG;
  uuid._whatwgRNG = _whatwgRNG;

  if (('undefined' !== typeof module) && module.exports) {
    // Publish as node.js module
    module.exports = uuid;
  } else if (typeof define === 'function' && define.amd) {
    // Publish as AMD module
    define(function() {return uuid;});


  } else {
    // Publish as global (in browsers)
    _previousRoot = _window.uuid;

    // **`noConflict()` - (browser only) to reset global 'uuid' var**
    uuid.noConflict = function() {
      _window.uuid = _previousRoot;
      return uuid;
    };

    _window.uuid = uuid;
  }
})('undefined' !== typeof window ? window : null);

},{"undefined":undefined}],149:[function(_dereq_,module,exports){
/*!
 * depd
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module exports.
 * @public
 */

module.exports = depd

/**
 * Create deprecate for namespace in caller.
 */

function depd(namespace) {
  if (!namespace) {
    throw new TypeError('argument namespace is required')
  }

  function deprecate(message) {
    // no-op in browser
  }

  deprecate._file = undefined
  deprecate._ignored = true
  deprecate._namespace = namespace
  deprecate._traced = false
  deprecate._warned = Object.create(null)

  deprecate.function = wrapfunction
  deprecate.property = wrapproperty

  return deprecate
}

/**
 * Return a wrapped function in a deprecation message.
 *
 * This is a no-op version of the wrapper, which does nothing but call
 * validation.
 */

function wrapfunction(fn, message) {
  if (typeof fn !== 'function') {
    throw new TypeError('argument fn must be a function')
  }

  return fn
}

/**
 * Wrap property in a deprecation message.
 *
 * This is a no-op version of the wrapper, which does nothing but call
 * validation.
 */

function wrapproperty(obj, prop, message) {
  if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
    throw new TypeError('argument obj must be object')
  }

  var descriptor = Object.getOwnPropertyDescriptor(obj, prop)

  if (!descriptor) {
    throw new TypeError('must call property on owner object')
  }

  if (!descriptor.configurable) {
    throw new TypeError('property must be configurable')
  }

  return
}

},{}],150:[function(_dereq_,module,exports){
/*!
 * Copyright (c) 2015 Chris O'Hara <cohara87@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function (name, definition) {
    if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
        define(definition);
    } else if (typeof define === 'function' && typeof define.petal === 'object') {
        define(name, [], definition);
    } else {
        this[name] = definition();
    }
})('validator', function (validator) {

    'use strict';

    validator = { version: '4.9.0', coerce: true };

    var emailUserPart = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i;
    var quotedEmailUser = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i;

    var emailUserUtf8Part = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
    var quotedEmailUserUtf8 = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;

    var displayName = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\.\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\.\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF\s]*<(.+)>$/i;

    var creditCard = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;

    var isin = /^[A-Z]{2}[0-9A-Z]{9}[0-9]$/;

    var isbn10Maybe = /^(?:[0-9]{9}X|[0-9]{10})$/
      , isbn13Maybe = /^(?:[0-9]{13})$/;

    var macAddress = /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/;

    var ipv4Maybe = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
      , ipv6Block = /^[0-9A-F]{1,4}$/i;

    var uuid = {
        '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i
      , '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      , '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      , all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    };

    var alpha = {
        'en-US': /^[A-Z]+$/i,
        'de-DE': /^[A-ZÄÖÜß]+$/i,
        'es-ES': /^[A-ZÁÉÍÑÓÚÜ]+$/i,
        'fr-FR': /^[A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i,
        'nl-NL': /^[A-ZÉËÏÓÖÜ]+$/i,
        'pt-PT': /^[A-ZÃÁÀÂÇÉÊÍÕÓÔÚÜ]+$/i,
        'ru-RU': /^[А-ЯЁа-яё]+$/i
      }
      , alphanumeric = {
        'en-US': /^[0-9A-Z]+$/i,
        'de-DE': /^[0-9A-ZÄÖÜß]+$/i,
        'es-ES': /^[0-9A-ZÁÉÍÑÓÚÜ]+$/i,
        'fr-FR': /^[0-9A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i,
        'nl-NL': /^[0-9A-ZÉËÏÓÖÜ]+$/i,
        'pt-PT': /^[0-9A-ZÃÁÀÂÇÉÊÍÕÓÔÚÜ]+$/i,
        'ru-RU': /^[0-9А-ЯЁа-яё]+$/i
      };

    var englishLocales = ['AU', 'GB', 'HK', 'IN', 'NZ', 'ZA', 'ZM'];
    for (var locale, i = 0; i < englishLocales.length; i++) {
        locale = 'en-' + englishLocales[i];
        alpha[locale] = alpha['en-US'];
        alphanumeric[locale] = alphanumeric['en-US'];
    }

    var numeric = /^[-+]?[0-9]+$/
      , int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/
      , float = /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/
      , hexadecimal = /^[0-9A-F]+$/i
      , decimal = /^[-+]?([0-9]+|\.[0-9]+|[0-9]+\.[0-9]+)$/
      , hexcolor = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;

    var ascii = /^[\x00-\x7F]+$/
      , multibyte = /[^\x00-\x7F]/
      , fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/
      , halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;

    var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

    var base64 = /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;

    var phones = {
      'en-US': /^(\+?1)?[2-9]\d{2}[2-9](?!11)\d{6}$/,
      'de-DE': /^(\+?49[ \.\-])?([\(]{1}[0-9]{1,6}[\)])?([0-9 \.\-\/]{3,20})((x|ext|extension)[ ]?[0-9]{1,4})?$/,
      'el-GR': /^(\+?30)?(69\d{8})$/,
      'en-AU': /^(\+?61|0)4\d{8}$/,
      'en-GB': /^(\+?44|0)7\d{9}$/,
      'en-HK': /^(\+?852\-?)?[569]\d{3}\-?\d{4}$/,
      'en-IN': /^(\+?91|0)?[789]\d{9}$/,
      'en-NZ': /^(\+?64|0)2\d{7,9}$/,
      'en-ZA': /^(\+?27|0)\d{9}$/,
      'en-ZM': /^(\+?26)?09[567]\d{7}$/,
      'es-ES': /^(\+?34)?(6\d{1}|7[1234])\d{7}$/,
      'fi-FI': /^(\+?358|0)\s?(4(0|1|2|4|5)?|50)\s?(\d\s?){4,8}\d$/,
      'fr-FR': /^(\+?33|0)[67]\d{8}$/,
      'nb-NO': /^(\+?47)?[49]\d{7}$/,
      'nn-NO': /^(\+?47)?[49]\d{7}$/,
      'pt-BR': /^(\+?55|0)\-?[1-9]{2}\-?[2-9]{1}\d{3,4}\-?\d{4}$/,
      'pt-PT': /^(\+?351)?9[1236]\d{7}$/,
      'ru-RU': /^(\+?7|8)?9\d{9}$/,
      'vi-VN': /^(\+?84|0)?((1(2([0-9])|6([2-9])|88|99))|(9((?!5)[0-9])))([0-9]{7})$/,
      'zh-CN': /^(\+?0?86\-?)?((13\d|14[57]|15[^4,\D]|17[678]|18\d)\d{8}|170[059]\d{7})$/,
      'zh-TW': /^(\+?886\-?|0)?9\d{8}$/
    };

    // from http://goo.gl/0ejHHW
    var iso8601 = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

    validator.extend = function (name, fn) {
        validator[name] = function () {
            var args = Array.prototype.slice.call(arguments);
            args[0] = validator.toString(args[0]);
            return fn.apply(validator, args);
        };
    };

    //Right before exporting the validator object, pass each of the builtins
    //through extend() so that their first argument is coerced to a string
    validator.init = function () {
        for (var name in validator) {
            if (typeof validator[name] !== 'function' || name === 'toString' ||
                    name === 'toDate' || name === 'extend' || name === 'init' ||
                    name === 'isServerSide') {
                continue;
            }
            validator.extend(name, validator[name]);
        }
    };

    validator.isServerSide = function () {
        return typeof module === 'object' && module &&
            typeof module.exports === 'object' &&
            typeof process === 'object' &&
            typeof _dereq_ === 'function';
    };

    var depd = null;
    validator.deprecation = function (msg) {
        if (depd === null) {
            if (!validator.isServerSide()) {
                return;
            }
            depd = _dereq_(149)('validator');
        }
        depd(msg);
    };

    validator.toString = function (input) {
        if (typeof input !== 'string') {
            // The library validates strings only. Currently it coerces all input to a string, but this
            // will go away in an upcoming major version change. Print a deprecation notice for now
            if (!validator.coerce) {
                throw new Error('this library validates strings only');
            }
            validator.deprecation('you tried to validate a ' + typeof input + ' but this library ' +
                    '(validator.js) validates strings only. Please update your code as this will ' +
                    'be an error soon.');
        }
        if (typeof input === 'object' && input !== null) {
            if (typeof input.toString === 'function') {
                input = input.toString();
            } else {
                input = '[object Object]';
            }
        } else if (input === null || typeof input === 'undefined' || (isNaN(input) && !input.length)) {
            input = '';
        }
        return '' + input;
    };

    validator.toDate = function (date) {
        if (Object.prototype.toString.call(date) === '[object Date]') {
            return date;
        }
        date = Date.parse(date);
        return !isNaN(date) ? new Date(date) : null;
    };

    validator.toFloat = function (str) {
        return parseFloat(str);
    };

    validator.toInt = function (str, radix) {
        return parseInt(str, radix || 10);
    };

    validator.toBoolean = function (str, strict) {
        if (strict) {
            return str === '1' || str === 'true';
        }
        return str !== '0' && str !== 'false' && str !== '';
    };

    validator.equals = function (str, comparison) {
        return str === validator.toString(comparison);
    };

    validator.contains = function (str, elem) {
        return str.indexOf(validator.toString(elem)) >= 0;
    };

    validator.matches = function (str, pattern, modifiers) {
        if (Object.prototype.toString.call(pattern) !== '[object RegExp]') {
            pattern = new RegExp(pattern, modifiers);
        }
        return pattern.test(str);
    };

    var default_email_options = {
        allow_display_name: false,
        allow_utf8_local_part: true,
        require_tld: true
    };

    validator.isEmail = function (str, options) {
        options = merge(options, default_email_options);

        if (options.allow_display_name) {
            var display_email = str.match(displayName);
            if (display_email) {
                str = display_email[1];
            }
        }

        var parts = str.split('@')
          , domain = parts.pop()
          , user = parts.join('@');

        var lower_domain = domain.toLowerCase();
        if (lower_domain === 'gmail.com' || lower_domain === 'googlemail.com') {
            user = user.replace(/\./g, '').toLowerCase();
        }

        if (!validator.isByteLength(user, {max: 64}) ||
                !validator.isByteLength(domain, {max: 256})) {
            return false;
        }

        if (!validator.isFQDN(domain, {require_tld: options.require_tld})) {
            return false;
        }

        if (user[0] === '"') {
            user = user.slice(1, user.length - 1);
            return options.allow_utf8_local_part ?
                quotedEmailUserUtf8.test(user) :
                quotedEmailUser.test(user);
        }

        var pattern = options.allow_utf8_local_part ?
            emailUserUtf8Part : emailUserPart;

        var user_parts = user.split('.');
        for (var i = 0; i < user_parts.length; i++) {
            if (!pattern.test(user_parts[i])) {
                return false;
            }
        }

        return true;
    };

    var default_url_options = {
        protocols: [ 'http', 'https', 'ftp' ]
      , require_tld: true
      , require_protocol: false
      , require_valid_protocol: true
      , allow_underscores: false
      , allow_trailing_dot: false
      , allow_protocol_relative_urls: false
    };

    validator.isURL = function (url, options) {
        if (!url || url.length >= 2083 || /\s/.test(url)) {
            return false;
        }
        if (url.indexOf('mailto:') === 0) {
            return false;
        }
        options = merge(options, default_url_options);
        var protocol, auth, host, hostname, port,
            port_str, split;
        split = url.split('://');
        if (split.length > 1) {
            protocol = split.shift();
            if (options.require_valid_protocol && options.protocols.indexOf(protocol) === -1) {
                return false;
            }
        } else if (options.require_protocol) {
            return false;
        }  else if (options.allow_protocol_relative_urls && url.substr(0, 2) === '//') {
            split[0] = url.substr(2);
        }
        url = split.join('://');
        split = url.split('#');
        url = split.shift();

        split = url.split('?');
        url = split.shift();

        split = url.split('/');
        url = split.shift();
        split = url.split('@');
        if (split.length > 1) {
            auth = split.shift();
            if (auth.indexOf(':') >= 0 && auth.split(':').length > 2) {
                return false;
            }
        }
        hostname = split.join('@');
        split = hostname.split(':');
        host = split.shift();
        if (split.length) {
            port_str = split.join(':');
            port = parseInt(port_str, 10);
            if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
                return false;
            }
        }
        if (!validator.isIP(host) && !validator.isFQDN(host, options) &&
                host !== 'localhost') {
            return false;
        }
        if (options.host_whitelist &&
                options.host_whitelist.indexOf(host) === -1) {
            return false;
        }
        if (options.host_blacklist &&
                options.host_blacklist.indexOf(host) !== -1) {
            return false;
        }
        return true;
    };

    validator.isMACAddress = function (str) {
        return macAddress.test(str);
    };

    validator.isIP = function (str, version) {
        version = version ? version + '' : '';
        if (!version) {
            return validator.isIP(str, 4) || validator.isIP(str, 6);
        } else if (version === '4') {
            if (!ipv4Maybe.test(str)) {
                return false;
            }
            var parts = str.split('.').sort(function (a, b) {
                return a - b;
            });
            return parts[3] <= 255;
        } else if (version === '6') {
            var blocks = str.split(':');
            var foundOmissionBlock = false; // marker to indicate ::

            // At least some OS accept the last 32 bits of an IPv6 address
            // (i.e. 2 of the blocks) in IPv4 notation, and RFC 3493 says
            // that '::ffff:a.b.c.d' is valid for IPv4-mapped IPv6 addresses,
            // and '::a.b.c.d' is deprecated, but also valid.
            var foundIPv4TransitionBlock = validator.isIP(blocks[blocks.length - 1], 4);
            var expectedNumberOfBlocks = foundIPv4TransitionBlock ? 7 : 8;

            if (blocks.length > expectedNumberOfBlocks)
                return false;

            // initial or final ::
            if (str === '::') {
                return true;
            } else if (str.substr(0, 2) === '::') {
                blocks.shift();
                blocks.shift();
                foundOmissionBlock = true;
            } else if (str.substr(str.length - 2) === '::') {
                blocks.pop();
                blocks.pop();
                foundOmissionBlock = true;
            }

            for (var i = 0; i < blocks.length; ++i) {
                // test for a :: which can not be at the string start/end
                // since those cases have been handled above
                if (blocks[i] === '' && i > 0 && i < blocks.length -1) {
                    if (foundOmissionBlock)
                        return false; // multiple :: in address
                    foundOmissionBlock = true;
                } else if (foundIPv4TransitionBlock && i == blocks.length - 1) {
                    // it has been checked before that the last
                    // block is a valid IPv4 address
                } else if (!ipv6Block.test(blocks[i])) {
                    return false;
                }
            }

            if (foundOmissionBlock) {
                return blocks.length >= 1;
            } else {
                return blocks.length === expectedNumberOfBlocks;
            }
        }
        return false;
    };

    var default_fqdn_options = {
        require_tld: true
      , allow_underscores: false
      , allow_trailing_dot: false
    };

    validator.isFQDN = function (str, options) {
        options = merge(options, default_fqdn_options);

        /* Remove the optional trailing dot before checking validity */
        if (options.allow_trailing_dot && str[str.length - 1] === '.') {
            str = str.substring(0, str.length - 1);
        }
        var parts = str.split('.');
        if (options.require_tld) {
            var tld = parts.pop();
            if (!parts.length || !/^([a-z\u00a1-\uffff]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
                return false;
            }
        }
        for (var part, i = 0; i < parts.length; i++) {
            part = parts[i];
            if (options.allow_underscores) {
                if (part.indexOf('__') >= 0) {
                    return false;
                }
                part = part.replace(/_/g, '');
            }
            if (!/^[a-z\u00a1-\uffff0-9-]+$/i.test(part)) {
                return false;
            }
            if (/[\uff01-\uff5e]/.test(part)) {
                // disallow full-width chars
                return false;
            }
            if (part[0] === '-' || part[part.length - 1] === '-') {
                return false;
            }
        }
        return true;
    };

    validator.isBoolean = function(str) {
        return (['true', 'false', '1', '0'].indexOf(str) >= 0);
    };

    validator.isAlpha = function (str, locale) {
        locale = locale || 'en-US';
        if (locale in alpha) {
            return alpha[locale].test(str);
        }
        throw new Error('Invalid locale \'' + locale + '\'');
    };

    validator.isAlphanumeric = function (str, locale) {
        locale = locale || 'en-US';
        if (locale in alphanumeric) {
            return alphanumeric[locale].test(str);
        }
        throw new Error('Invalid locale \'' + locale + '\'');
    };

    validator.isNumeric = function (str) {
        return numeric.test(str);
    };

    validator.isDecimal = function (str) {
        return str !== '' && decimal.test(str);
    };

    validator.isHexadecimal = function (str) {
        return hexadecimal.test(str);
    };

    validator.isHexColor = function (str) {
        return hexcolor.test(str);
    };

    validator.isLowercase = function (str) {
        return str === str.toLowerCase();
    };

    validator.isUppercase = function (str) {
        return str === str.toUpperCase();
    };

    validator.isInt = function (str, options) {
        options = options || {};
        return int.test(str) && (!options.hasOwnProperty('min') || str >= options.min) && (!options.hasOwnProperty('max') || str <= options.max);
    };

    validator.isFloat = function (str, options) {
        options = options || {};
        if (str === '' || str === '.') {
            return false;
        }
        return float.test(str) && (!options.hasOwnProperty('min') || str >= options.min) && (!options.hasOwnProperty('max') || str <= options.max);
    };

    validator.isDivisibleBy = function (str, num) {
        return validator.toFloat(str) % parseInt(num, 10) === 0;
    };

    validator.isNull = function (str) {
        return str.length === 0;
    };

    validator.isLength = function (str, options) {
        var min, max;
        if (typeof(options) === 'object') {
            min = options.min || 0;
            max = options.max;
        } else { // backwards compatibility: isLength(str, min [, max])
            min = arguments[1];
            max = arguments[2];
        }
        var surrogatePairs = str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || [];
        var len = str.length - surrogatePairs.length;
        return len >= min && (typeof max === 'undefined' || len <= max);
    };
    validator.isByteLength = function (str, options) {
        var min, max;
        if (typeof(options) === 'object') {
            min = options.min || 0;
            max = options.max;
        } else { // backwards compatibility: isByteLength(str, min [, max])
            min = arguments[1];
            max = arguments[2];
        }
        var len = encodeURI(str).split(/%..|./).length - 1;
        return len >= min && (typeof max === 'undefined' || len <= max);
    };

    validator.isUUID = function (str, version) {
        var pattern = uuid[version ? version : 'all'];
        return pattern && pattern.test(str);
    };

    function getTimezoneOffset(str) {
        var iso8601Parts = str.match(iso8601)
          , timezone, sign, hours, minutes;
        if (!iso8601Parts) {
            str = str.toLowerCase();
            timezone = str.match(/(?:\s|gmt\s*)(-|\+)(\d{1,4})(\s|$)/);
            if (!timezone) {
                return str.indexOf('gmt') !== -1 ? 0 : null;
            }
            sign = timezone[1];
            var offset = timezone[2];
            if (offset.length === 3) {
                offset = '0' + offset;
            }
            if (offset.length <= 2) {
                hours = 0;
                minutes = parseInt(offset);
            } else {
                hours = parseInt(offset.slice(0, 2));
                minutes = parseInt(offset.slice(2, 4));
            }
        } else {
            timezone = iso8601Parts[21];
            if (!timezone) {
                // if no hour/minute was provided, the date is GMT
                return !iso8601Parts[12] ? 0 : null;
            }
            if (timezone === 'z' || timezone === 'Z') {
                return 0;
            }
            sign = iso8601Parts[22];
            if (timezone.indexOf(':') !== -1) {
                hours = parseInt(iso8601Parts[23]);
                minutes = parseInt(iso8601Parts[24]);
            } else {
                hours = 0;
                minutes = parseInt(iso8601Parts[23]);
            }
        }
        return (hours * 60 + minutes) * (sign === '-' ? 1 : -1);
    }

    validator.isDate = function (str) {
        var normalizedDate = new Date(Date.parse(str));
        if (isNaN(normalizedDate)) {
            return false;
        }

        // normalizedDate is in the user's timezone. Apply the input
        // timezone offset to the date so that the year and day match
        // the input
        var timezoneOffset = getTimezoneOffset(str);
        if (timezoneOffset !== null) {
            var timezoneDifference = normalizedDate.getTimezoneOffset() -
                timezoneOffset;
            normalizedDate = new Date(normalizedDate.getTime() +
                60000 * timezoneDifference);
        }

        var day = String(normalizedDate.getDate());
        var dayOrYear, dayOrYearMatches, year;
        //check for valid double digits that could be late days
        //check for all matches since a string like '12/23' is a valid date
        //ignore everything with nearby colons
        dayOrYearMatches = str.match(/(^|[^:\d])[23]\d([^:\d]|$)/g);
        if (!dayOrYearMatches) {
            return true;
        }
        dayOrYear = dayOrYearMatches.map(function(digitString) {
            return digitString.match(/\d+/g)[0];
        }).join('/');

        year = String(normalizedDate.getFullYear()).slice(-2);
        if (dayOrYear === day || dayOrYear === year) {
            return true;
        } else if ((dayOrYear === (day + '/' + year)) || (dayOrYear === (year + '/' + day))) {
            return true;
        }
        return false;
    };

    validator.isAfter = function (str, date) {
        var comparison = validator.toDate(date || new Date())
          , original = validator.toDate(str);
        return !!(original && comparison && original > comparison);
    };

    validator.isBefore = function (str, date) {
        var comparison = validator.toDate(date || new Date())
          , original = validator.toDate(str);
        return !!(original && comparison && original < comparison);
    };

    validator.isIn = function (str, options) {
        var i;
        if (Object.prototype.toString.call(options) === '[object Array]') {
            var array = [];
            for (i in options) {
                array[i] = validator.toString(options[i]);
            }
            return array.indexOf(str) >= 0;
        } else if (typeof options === 'object') {
            return options.hasOwnProperty(str);
        } else if (options && typeof options.indexOf === 'function') {
            return options.indexOf(str) >= 0;
        }
        return false;
    };

    validator.isWhitelisted = function (str, chars) {
        for (var i = str.length - 1; i >= 0; i--) {
            if (chars.indexOf(str[i]) === -1) {
                return false;
            }
        }

        return true;
    };

    validator.isCreditCard = function (str) {
        var sanitized = str.replace(/[^0-9]+/g, '');
        if (!creditCard.test(sanitized)) {
            return false;
        }
        var sum = 0, digit, tmpNum, shouldDouble;
        for (var i = sanitized.length - 1; i >= 0; i--) {
            digit = sanitized.substring(i, (i + 1));
            tmpNum = parseInt(digit, 10);
            if (shouldDouble) {
                tmpNum *= 2;
                if (tmpNum >= 10) {
                    sum += ((tmpNum % 10) + 1);
                } else {
                    sum += tmpNum;
                }
            } else {
                sum += tmpNum;
            }
            shouldDouble = !shouldDouble;
        }
        return !!((sum % 10) === 0 ? sanitized : false);
    };

    validator.isISIN = function (str) {
        if (!isin.test(str)) {
            return false;
        }

        var checksumStr = str.replace(/[A-Z]/g, function(character) {
            return parseInt(character, 36);
        });

        var sum = 0, digit, tmpNum, shouldDouble = true;
        for (var i = checksumStr.length - 2; i >= 0; i--) {
            digit = checksumStr.substring(i, (i + 1));
            tmpNum = parseInt(digit, 10);
            if (shouldDouble) {
                tmpNum *= 2;
                if (tmpNum >= 10) {
                    sum += tmpNum + 1;
                } else {
                    sum += tmpNum;
                }
            } else {
                sum += tmpNum;
            }
            shouldDouble = !shouldDouble;
        }

        return parseInt(str.substr(str.length - 1), 10) === (10000 - sum) % 10;
    };

    validator.isISBN = function (str, version) {
        version = version ? version + '' : '';
        if (!version) {
            return validator.isISBN(str, 10) || validator.isISBN(str, 13);
        }
        var sanitized = str.replace(/[\s-]+/g, '')
          , checksum = 0, i;
        if (version === '10') {
            if (!isbn10Maybe.test(sanitized)) {
                return false;
            }
            for (i = 0; i < 9; i++) {
                checksum += (i + 1) * sanitized.charAt(i);
            }
            if (sanitized.charAt(9) === 'X') {
                checksum += 10 * 10;
            } else {
                checksum += 10 * sanitized.charAt(9);
            }
            if ((checksum % 11) === 0) {
                return !!sanitized;
            }
        } else  if (version === '13') {
            if (!isbn13Maybe.test(sanitized)) {
                return false;
            }
            var factor = [ 1, 3 ];
            for (i = 0; i < 12; i++) {
                checksum += factor[i % 2] * sanitized.charAt(i);
            }
            if (sanitized.charAt(12) - ((10 - (checksum % 10)) % 10) === 0) {
                return !!sanitized;
            }
        }
        return false;
    };

    validator.isMobilePhone = function(str, locale) {
        if (locale in phones) {
            return phones[locale].test(str);
        }
        return false;
    };

    var default_currency_options = {
        symbol: '$'
      , require_symbol: false
      , allow_space_after_symbol: false
      , symbol_after_digits: false
      , allow_negatives: true
      , parens_for_negatives: false
      , negative_sign_before_digits: false
      , negative_sign_after_digits: false
      , allow_negative_sign_placeholder: false
      , thousands_separator: ','
      , decimal_separator: '.'
      , allow_space_after_digits: false
    };

    validator.isCurrency = function (str, options) {
        options = merge(options, default_currency_options);

        return currencyRegex(options).test(str);
    };

    validator.isJSON = function (str) {
        try {
            var obj = JSON.parse(str);
            return !!obj && typeof obj === 'object';
        } catch (e) {}
        return false;
    };

    validator.isMultibyte = function (str) {
        return multibyte.test(str);
    };

    validator.isAscii = function (str) {
        return ascii.test(str);
    };

    validator.isFullWidth = function (str) {
        return fullWidth.test(str);
    };

    validator.isHalfWidth = function (str) {
        return halfWidth.test(str);
    };

    validator.isVariableWidth = function (str) {
        return fullWidth.test(str) && halfWidth.test(str);
    };

    validator.isSurrogatePair = function (str) {
        return surrogatePair.test(str);
    };

    validator.isBase64 = function (str) {
        return base64.test(str);
    };

    validator.isMongoId = function (str) {
        return validator.isHexadecimal(str) && str.length === 24;
    };

    validator.isISO8601 = function (str) {
        return iso8601.test(str);
    };

    validator.ltrim = function (str, chars) {
        var pattern = chars ? new RegExp('^[' + chars + ']+', 'g') : /^\s+/g;
        return str.replace(pattern, '');
    };

    validator.rtrim = function (str, chars) {
        var pattern = chars ? new RegExp('[' + chars + ']+$', 'g') : /\s+$/g;
        return str.replace(pattern, '');
    };

    validator.trim = function (str, chars) {
        var pattern = chars ? new RegExp('^[' + chars + ']+|[' + chars + ']+$', 'g') : /^\s+|\s+$/g;
        return str.replace(pattern, '');
    };

    validator.escape = function (str) {
        return (str.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\//g, '&#x2F;')
            .replace(/\`/g, '&#96;'));
    };

    validator.stripLow = function (str, keep_new_lines) {
        var chars = keep_new_lines ? '\\x00-\\x09\\x0B\\x0C\\x0E-\\x1F\\x7F' : '\\x00-\\x1F\\x7F';
        return validator.blacklist(str, chars);
    };

    validator.whitelist = function (str, chars) {
        return str.replace(new RegExp('[^' + chars + ']+', 'g'), '');
    };

    validator.blacklist = function (str, chars) {
        return str.replace(new RegExp('[' + chars + ']+', 'g'), '');
    };

    var default_normalize_email_options = {
        lowercase: true,
        remove_dots: true,
        remove_extension: true
    };

    validator.normalizeEmail = function (email, options) {
        options = merge(options, default_normalize_email_options);
        if (!validator.isEmail(email)) {
            return false;
        }
        var parts = email.split('@', 2);
        parts[1] = parts[1].toLowerCase();
        if (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com') {
            if (options.remove_extension) {
                parts[0] = parts[0].split('+')[0];
            }
            if (options.remove_dots) {
                parts[0] = parts[0].replace(/\./g, '');
            }
            if (!parts[0].length) {
                return false;
            }
            parts[0] = parts[0].toLowerCase();
            parts[1] = 'gmail.com';
        } else if (options.lowercase) {
            parts[0] = parts[0].toLowerCase();
        }
        return parts.join('@');
    };

    function merge(obj, defaults) {
        obj = obj || {};
        for (var key in defaults) {
            if (typeof obj[key] === 'undefined') {
                obj[key] = defaults[key];
            }
        }
        return obj;
    }

    function currencyRegex(options) {
        var symbol = '(\\' + options.symbol.replace(/\./g, '\\.') + ')' + (options.require_symbol ? '' : '?')
            , negative = '-?'
            , whole_dollar_amount_without_sep = '[1-9]\\d*'
            , whole_dollar_amount_with_sep = '[1-9]\\d{0,2}(\\' + options.thousands_separator + '\\d{3})*'
            , valid_whole_dollar_amounts = ['0', whole_dollar_amount_without_sep, whole_dollar_amount_with_sep]
            , whole_dollar_amount = '(' + valid_whole_dollar_amounts.join('|') + ')?'
            , decimal_amount = '(\\' + options.decimal_separator + '\\d{2})?';
        var pattern = whole_dollar_amount + decimal_amount;
        // default is negative sign before symbol, but there are two other options (besides parens)
        if (options.allow_negatives && !options.parens_for_negatives) {
            if (options.negative_sign_after_digits) {
                pattern += negative;
            }
            else if (options.negative_sign_before_digits) {
                pattern = negative + pattern;
            }
        }
        // South African Rand, for example, uses R 123 (space) and R-123 (no space)
        if (options.allow_negative_sign_placeholder) {
            pattern = '( (?!\\-))?' + pattern;
        }
        else if (options.allow_space_after_symbol) {
            pattern = ' ?' + pattern;
        }
        else if (options.allow_space_after_digits) {
            pattern += '( (?!$))?';
        }
        if (options.symbol_after_digits) {
            pattern += symbol;
        } else {
            pattern = symbol + pattern;
        }
        if (options.allow_negatives) {
            if (options.parens_for_negatives) {
                pattern = '(\\(' + pattern + '\\)|' + pattern + ')';
            }
            else if (!(options.negative_sign_before_digits || options.negative_sign_after_digits)) {
                pattern = negative + pattern;
            }
        }
        return new RegExp(
            '^' +
            // ensure there's a dollar and/or decimal amount, and that it doesn't start with a space or a negative sign followed by a space
            '(?!-? )(?=.*\\d)' +
            pattern +
            '$'
        );
    }

    validator.init();

    return validator;

});

},{"149":149}]},{},[6])(6)
});