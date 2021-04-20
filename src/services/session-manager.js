/**
 * ゲーム進行を管理するモジュール
 */

import { v4 as uuidv4 } from 'uuid';

import { Game, BadRequest, ServerError, SessionData } from '../models/index.js';

function createDigits(num_digits, radix) {
  const digits = new Array(num_digits);

  let all_numbers = new Array();
  for (let i = 0; i < radix; i++) {
    all_numbers.push(i);
  }

  // shuffle numbers 3 times.
  for (let i = 0; i < 3; i++) {
    for (let idx = 0; i < radix; i++) {
      const swap_to = Math.floor(Math.random() * radix);
      const tmp = all_numbers[idx];
      all_numbers[idx] = all_numbers[swap_to];
      all_numbers[swap_to] = tmp;
    }
  }

  for (let i = 0; i < num_digits; i++) {
    digits[i] = all_numbers[i];
  }
  return digits;
}

/**
 * 1つのセッションを表すクラス
 */
class Session {

  /** @type {Array<Number>} 正解の数値 */
  #answer;

  /** @type {import('../models').SessionData} */
  #data;

  /**
   * @param {String} id id of this session
   * @param {import('../models').Game} game
   */
  constructor(id, game) {
    this.id = id;
    /** @type {Array<Number>} */
    this.#answer = createDigits(game.num_digits, game.radix);

    this.#data = new SessionData(id, game);
    this.#data.status.code = 0;
    this.#data.status.text = 'in progress';
    this.#data.reply.A = 0;
    this.#data.reply.B = 0;
  }

  /**
   * @param {Array<Number} digits 
   */
  guess(digits) {
    if (!(digits instanceof Array) || digits.length !== this.#answer.length) {
      throw new BadRequest(`bad digits: ${digits}`);
    }

    // digitsの中で重複している数値があればエラー
    for (let i = 0; i < digits.length; i++) {
      let n = digits[i];
      if (typeof(n) !== 'number') {
        throw new BadRequest('your digits must be Array<Number>');
      }
      if (n < 0 || n > this.#data.radix) {
        throw new BadRequest(`Illegal number(${n}) for radix(${this.#data.radix}).`);
      }
      for (let j = i + 1; j < digits.length; j++) {
        if (digits[i] === digits[j]) {
          throw new BadRequest(`your digits has multiple same numbers`);
        }
      }
    }

    let [a, b] = [0, 0];

    for (let i = 0; i < this.#answer.length; i++) {
      let n = this.#answer[i];
      if (digits[i] === n) {
        a++;
      } else if (digits.includes(n)) {
        b++;
      }
    }

    this.#data.reply.A = a;
    this.#data.reply.B = b;

    return a === this.#data.num_digits;
  }


  get data() {
    return this.#data;
  }

  get status() {
    return this.#data.status;
  }
}

/**
 * セッション(ゲームプレイ)を管理するクラス
 */
class SessionManager {

  /** @type {Map<String, Session>} */
  #sessions = new Map();

  constructor() {
  }

  /**
   * @param {import('../model').Game} game
   * @return {Promise<Session>}
   */
  async createSession(game) {
    if (this.#sessions.size > 500) {
      throw new ServerError('too many sessions');
    }

    const session = new Session(uuidv4(), game);
    this.#sessions.set(session.id, session);
    return session;
  }

  /**
   * @param {String} id 
   * @return {Promise<Session>}
   */
   async getSession(id) {
    const session = this.#sessions.get(id);
    if (!session) {
      throw new BadRequest(`session: ${id} not exists.`);
    }
    return session;
  }

  async removeSession(id) {
    this.#sessions.delete(id);
    console.log(`session removed. id=${id}`);
  }

  removeOldSession() {
    const olds = [];
    const now = Date.now();
    for (const [ session_id, session ] of this.#sessions) {
      if (now - session.data.created_at > 60 * 1000) {
        olds.push(session_id);
      }
    }

    for (const old_id of olds) {
      this.removeSession(old_id);
    }
  }
}

const instance = new SessionManager();

// TODO ちゃんとインターバルを管理しろ
setInterval(() => {
  instance.removeOldSession();
}, 30 * 1000);

export default instance;