function myfetch(uri, method, json) {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
  };
  const body = Object.entries(json)
    .map((kv) => kv[0] + '=' + encodeURIComponent(kv[1]))
    .join('&');
  return fetch(uri, { method, body, headers });
}

function fetchLogin(username, pass) {
  return myfetch('/auth-portal/login', 'POST', { username, pass });
}

function fetchLogout() {
  return myfetch('/auth-portal/login', 'POST', {});
}

function fetchGetAllUser() {
  return fetch('/auth-portal/user');
}

function fetchAddUser(username, level) {
  return myfetch('/auth-portal/user', 'POST', { username, level });
}

function fetchDeleteUser(username) {
  return myfetch('/auth-portal/user/' + username, 'DELETE', {});
}

function contentLoaded(func) {
  document.addEventListener('DOMContentLoaded', func);
}

function authLevelToString(level) {
  return level === 1
    ? 'admin'
    : level === 11
    ? 'manager'
    : level === 21
    ? 'member'
    : '#' + level;
}
