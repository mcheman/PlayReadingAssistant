async function getActors() {
  return await apiCall('GET', 'actors');
}

async function deleteActor(id) {
  return await apiCall('DELETE', `actors/${id}`);
};

async function newActor(name) {
  name = JSON.stringify({ name });
  return await apiCall('POST', 'actors', name, { 'Content-Type': 'application/json' });
}

async function getCurrentActorCharacters(actor, currentScript) {
  return await apiCall('GET', `script/${currentScript}/characters?actorId=${actor.id}`);
}

async function getCharacters(currentScript) {
  return await apiCall('GET', `script/${currentScript}/characters`);
}

async function getScript(scriptId) {
  return await apiCall('GET', 'script/' + scriptId);
}

async function getScriptTitles() {
  return await apiCall('GET', 'scripts/title');
}

async function deleteScript(deleteId) {
  return await apiCall('DELETE', `script/${deleteId}`);
}

async function uploadScript(formData) {
  const response = await fetch('/api/script', { method: 'POST', body: formData })
  if (response.ok){
    return {
      success: true,
      data: await response.json()
    }
  } else if (response.status === 409){
    return {
      success: false,
      data: 'Script title already exists'
    }
  } else if (response.status === 452){
    return {
      success: false,
      data: 'Could not find a title, potentially invalid file type'
    }
  } else {
    return {
      success: false,
      data: 'File was not uploaded. Make sure the file name doesn\'t start with an underscore and only uses numbers, letters, and these symbols: \' . _ - '
    }
  }

}

async function postPosition(actorId, scriptId, position) {
  const body = JSON.stringify({ actorId, scriptId, position });
  return await apiCall('POST', 'positions', body, { 'Content-Type': 'application/json' });
}

async function apiCall(method, uri, body = null, headers = {}) {

  try {
    const response = await fetch('/api/' + uri, {
      method: method,
      headers: headers,
      body: body
    });
    // Set data for successful fetch
    if (response.ok) {
      if (method === 'DELETE') {
        return {
          success: true,
          data: 'Deleted'
        };
      } else {
        return {
          success: true,
          data: await response.json()
        };
      }
    }
    // Set errors from an unsuccessful fetch request
    else {
      return {
        success: false,
        data: 'Error: ' + await response.json(),
        status: response.status
      };
    }
  }
    // Set errors from not being able to connect to the server
  catch (error) {
    return {
      success: false,
      data: 'Network error: ' + error.message
    };
  }
}

export {
  getActors,
  getScript,
  getScriptTitles,
  deleteActor,
  getCurrentActorCharacters,
  deleteScript,
  newActor,
  getCharacters,
  postPosition,
  uploadScript
};
