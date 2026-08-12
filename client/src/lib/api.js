async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export function fetchConfig() {
  return fetch('/api/config').then((r) => r.json());
}

export function generateScene({ face, sceneId }) {
  return postJSON('/api/scene', { face, sceneId });
}

export function generateStory({ answers, sceneId }) {
  return postJSON('/api/story', { answers, sceneId });
}

export function submitJob({ face, answers, sceneId }) {
  return postJSON('/api/jobs', { face, answers, sceneId });
}

export function fetchJob(id) {
  return fetch(`/api/jobs/${id}`).then((r) => {
    if (!r.ok) throw new Error(`Request failed (${r.status})`);
    return r.json();
  });
}

export function fetchJobs() {
  return fetch('/api/jobs').then((r) => {
    if (!r.ok) throw new Error(`Request failed (${r.status})`);
    return r.json();
  });
}

export function completeJob(id, payload) {
  return postJSON(`/api/jobs/${id}/complete`, payload);
}

export function fetchSettings() {
  return fetch('/api/settings').then((r) => {
    if (!r.ok) throw new Error(`Request failed (${r.status})`);
    return r.json();
  });
}

export function updateSettings(payload) {
  return fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => {
    if (!r.ok) throw new Error(`Request failed (${r.status})`);
    return r.json();
  });
}
