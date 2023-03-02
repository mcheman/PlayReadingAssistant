const express = require('express');
const cors = require('cors');
const consolidate = require('consolidate');
const actorRepo = require('./src/actorRepository');
const scriptRepo = require('./src/scriptRepository');
const app = express();

const PORT = 3000;

app.use(cors());

// assign the mustache engine to .mustache files
app.engine('mustache', consolidate.mustache);

// set .mustache as the default extension
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// parse the request body
app.use(express.urlencoded());

// handle requests for static files
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res, next) => {
  Promise.all([
    scriptRepo.getScripts(),
    actorRepo.getActors()
  ])
    .then((promise) => {
      return res.render('base', {
        partials: {
          content: 'home',
        },
        scripts: promise[0],
        actors: promise[1],
      });
    })
    .catch((error) => {
      return next({
        log: `error: ${error} occurred in /`,
        message: 'error in /',
      });
    });
});

app.get('/script/:scriptId', (req, res, next) => {
  const { scriptId } = req.params;

  Promise.all([
    scriptRepo.getScripts(),
    actorRepo.getActors(),
    scriptRepo.getCharacters(scriptId)
  ])
    .then((promise) => {
      return res.render('base', {
        partials: {
          content: 'home',
        },
        scripts: promise[0],
        actors: promise[1],
        characters: promise[2],
        currentScriptId: scriptId,
      });
    })
    .catch((error) => {
      return next({
        log: `error: ${error} occurred in /script`,
        message: 'error in /script',
      });
    });
});

app.get('/script/:scriptId/reading/:actorId?', (req, res, next) => {
    const { scriptId, actorId } = req.params;

    Promise.all([
      scriptRepo.getScriptText(scriptId),
      actorRepo.getActors(),
      scriptRepo.getCharacters(scriptId, actorId)
    ])
      .then((promise) => {
        const scriptText = promise[0];
        const actors = promise[1];
        const characters = promise[2];

        let characterNames = characters.map(c => c.name);
        if (!actorId) {
          characterNames = [];
        }

        currentActor = {};
        for (const actor of actors) {
          if (actorId == actor.id) {
            currentActor = actor;
          }
        }

        for (let line of scriptText.fullPlay) {
          if (characterNames.includes(line.character)) {
            line.isCurrentActor = true;
          }
        }

        return res.render('base', {
          partials: {
            content: 'script',
            scriptNav: 'scriptNav',
          },
          lines: scriptText.fullPlay,
          actors: actors,
          currentActor: currentActor,
          scriptBaseUrl: `/script/${scriptId}/reading`
        });
      })
      .catch((error) => {
        return next({
          log: `error: ${error} occurred in /script/reading`,
          message: 'error in /script/reading',
        });
      });
});

// add a new actor to the db
app.post('/actors', (req, res, next) => {
  const { name } = req.body;

  actorRepo.newActor(name)
    .then(() => {
      return res.redirect(req.headers.referer); // refresh the current page to see the new actor
    })
    .catch((error) => {
      return next({
        log: `error: ${error} occured when adding actor to the db`,
        message: 'error in /actors',
      });
    });
});

// unknown route handler
app.use((req, res) => res.sendStatus(404));

// middleware error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: { err: `An error occurred: ${err}` },
    status: 500,
    message: 'Express error handler caught unknown middleware error'  ,
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;
