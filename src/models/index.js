const schemas = {};

class Game {
  /**
   * @param {String} id このゲームのid
   * @param {String} name このゲームのわかりやすい名前
   * @param {Number} num_digits 桁数
   * @param {Number} radix 各桁の基数。10なら10進数
   */
  constructor(id, name, num_digits, radix) {
    this.id = id;
    this.name = name;
    this.num_digits = num_digits;
    this.radix = radix;
  }

  static responseSchema = {
    type: 'object',
    properties: {
      id: { type: 'string'},
      name: { type: 'string'},
      num_digits: { type: 'number' },
      radix: { type: 'number' },
    }
  };
}

/**
 * @typedef SessionStatus
 * @property {Number} code
 * @property {String} text
 */

/**
 * ゲームのセッションを表す.
 */
class SessionData {

  /** @type {Game} */
  #game;

  /**
   * @type {SessionStatus}
    */
  #status;

  /**
   * @param {String} session_id id of this session
   * @param {Game} game
   */
  constructor(session_id, game) {
    this.session_id = session_id;
    this.game_id = game.id;
    this.num_digits = game.num_digits;
    this.radix = game.radix;
    this.created_at = Date.now();
    this.reply = { A: 0, B: 0};

    /** @type {SessionStatus} */
    this.status = {
      code: 0,
      text: 'in progress',
    };
  }

  static responseSchema = {
    type: 'object',
    properties: {
      session_id: { type: 'string'},
      game_id: { type: 'string' },
      num_digits: { type: 'number'},
      radix: { type: 'number'},
      created_at: { type: 'number' },
      status: {
        type: 'object',
        properties: {
          code: { type: 'number' },
          text: {type : 'string' },
        }
      },
      reply: {
        type: 'object',
        properties: {
          A: { type: 'number'},
          B: { type: 'number'},
        }
      },
    }
  }
}

/**
 * 不正なリクエストを表すモデル.
 */
class BadRequest {
  constructor(message) {
    this.error = 'BadRequest';
    this.message = message;
  }

  static responseSchema = {
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' },
    }
  };
}

class ServerError {
  constructor(message) {
    this.error = 'ServerError';
    this.message = message;
  }

  static responseSchema = {
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' },
    }
  }
}


class SchemaBuilder {

  #schema;

  constructor() {
    this.#schema = {};
  }

  withResponse(model) {
    let is_array = false;
    if (model instanceof Array) {
      is_array = true;
      model = model[0];
    }

    this.#schema.response = { 
      '200': is_array ?
        { type: 'array', items: { anyOf: [model.responseSchema] }}
        :
        model.responseSchema
    };
    return this;
  }

  build() {
    if (!this.#schema.response) {
      this.#schema.response = {};
    }
    this.#schema.response['400'] = BadRequest.responseSchema;
    this.#schema.response['500'] = ServerError.responseSchema;
    return {
      schema: this.#schema
    };
  }
}

/**
 * @returns {SchemaBuilder}
 */
schemas.with = (opts) => {
  const builder = new SchemaBuilder(schemas);
  if (opts.response) {
    builder.withResponse(opts.response);
  }
  return builder.build();
};

export {
  Game,
  SessionData,
  BadRequest,
  ServerError,
  schemas,
};