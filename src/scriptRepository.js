const db = require(__dirname + '/database');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('node:fs'));

function getCharacters(scriptId, actorId = -1) {
  const values = [actorId, scriptId];
  const sql = `
      SELECT c.id as id, c.name as name, line_count, speaks_count
      FROM characters c
               JOIN scripts s ON script_id = s.id
      WHERE ($1 = -1 or actor_id = $1)
        AND s.id = $2`;

  return db.query(sql, values).then((result) => {
    return result.rows.map((c) => new Character(c.id, c.name, c.lineCount, c.speaksNum));
  });
}

function getScripts() {
  return db.query('select id, title from scripts').then((result) => {
    return result.rows.map((s) => ({
      id: s.id,
      title: s.title
    }));
  });
}

function getScriptText(id) {
  let title;

  return db
    .query('select title, script_file from scripts where id = $1 limit 1', [id])
    .then((result) => {
      title = result.rows[0].title;
      return fs.readFileAsync(__dirname + '/../playScript/' + result.rows[0].script_file, 'utf8');
    })
    .then((scriptFile) => {
      // Split script on double \n to get individual
      const lineChunks = scriptFile.split('\n\n');
      const fullPlay = [];
      // loop through the script and create character objects
      for (let lineChunk of lineChunks) {
        // get the character name from the first line and remove dot from the end
        let name = lineChunk.split('\n')[0].replace('.', '');

        // check that the name is actually a name and not a different part of the play ex: ACT I
        if (isName(name)) {
          fullPlay.push({character: name, lineChunk: lineChunk});
        } else {
          fullPlay.push({lineChunk: lineChunk});
        }
      }

      return {title, fullPlay};
    });
}

function Character(id, name, lineCount, speaksNum) {
  this.id = id;
  this.name = name;
  this.lineCount = lineCount;
  this.speaksNum = speaksNum;
}

function isUppercase(str) {
  return str === str.toUpperCase();
}

// checks if a name is a valid name
function isName(name) {
  return isUppercase(name) && name.length > 1 && name.length < 15 && !name.match(/(ACT)/);
}

module.exports = { getCharacters, getScripts, getScriptText };
