import { Game, BadRequest } from '../models/index.js';

class GameManager {

  /** @type {Array<Game>} */
  #games = [];

  /** @type {Map<String, Game>} */
  #game_map = new Map();

  constructor() {
    this.addGame('d1r10', '1桁10進数', 1, 10);
    this.addGame('d4r10', '1桁10進数', 4, 10);
    this.addGame('d4r16', '1桁10進数', 4, 16);
  }

  /**
   * @return {Array<Game>}
   */
  listGames() {
    return this.#games;
  }

  addGame(id, name, num_digits, radix) {
    if (this.#game_map.has(id)) {
      throw new BadRequest(`id(${id} already exists`);
    }
    const game = new Game(id, name, num_digits, radix);
    this.#games.push(game);
    this.#game_map.set(id, game);
  }

  getGame(id) {
    const game = this.#game_map.get(id);
    if (!game) {
      throw new BadRequest(`game_id: ${id} not found`);
    }
    return game;
  }
}

const instance = new GameManager();

export default instance;