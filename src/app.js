import fastify from 'fastify';

import session_manager from './services/session-manager.js';
import game_manager from './services/game-manager.js';
import { Game, SessionData, BadRequest, schemas, ServerError } from './models/index.js';

const app = fastify();

/**
 * 数字当てゲームの一覧を返す
 */
app.get('/games',
  { ...schemas.with({ response: [Game] })},
  async(req, res) => {
    return game_manager.listGames();
  }
);

/**
 * 特定のゲーム情報を変えす
 */
app.get('/games/:id', {
    ...schemas.with({ response: Game })
  }, 
  async(req, res) => {
    return game_manager.getGame(req.params['id']);
  }
);

/**
 * 新しくゲームを始める
 */
app.post('/sessions',
  { ...schemas.with({ response: SessionData })},
  async(req, res) => {
    const game_id = req.body?.game_id;
    const game = game_manager.getGame(game_id);

    const session = await session_manager.createSession(game);
    return session.data;
  }
);

app.put('/sessions/:session_id/guess',
  async(req, res) => {
    const session = await session_manager.getSession(req.params.session_id);
    if (session.guess(req.body.numbers)) {
      session.status.code = 1;
      session.status.text = 'correct!';
      session_manager.removeSession(session.id);
    } else {
      session.status.code = 0;
      session.status.text = 'in progress';
    }

    return session.data;
  }
);

app.setErrorHandler(async(err, req, res) => {
  console.error(err);
  if (err instanceof BadRequest) {
    res.status(400);
    return err;
  } else if (err instanceof ServerError) {
    res.status(500);
    return err;
  }

  return new ServerError(err.toString());
});

export default app;