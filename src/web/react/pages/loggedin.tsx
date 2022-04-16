import React from 'react';
import { WebApi } from '../../api/WebApi';

async function logout() {
  await WebApi.fetchLogout();
  location.reload();
}

// Work in progress
export function PageLoggedin(props: {}): JSX.Element {
  return (
    <div className="pagewrapper">
      <div className="content page ">
        <h1>user page</h1>
        <section>
          <h2>Logout</h2>
          <form onSubmit={logout}>
            <button className="large special" type="submit">
              logout
            </button>
          </form>
        </section>
        {/* <section>
          <h2>management accounts</h2>
          <div>
            <table id="userlist_table">
              <tr>
                <th>username</th>
                <th>auth-level</th>
                <th></th>
              </tr>
            </table>
          </div>
          <form id="form-accounts">
            <div>
              <output className="highlight" name="log"></output>
            </div>
          </form>
        </section>
        <section>
          <h2>add a new user account</h2>
          <form id="form-adduser" onSubmit={undefined}>
            <div>
              <input
                type="text"
                name="user"
                spellCheck={false}
                required={true}
                placeholder="username"
                autoComplete="off"
                autoCapitalize="off"
              />
              <select name="level">
                <option value="21" selected>
                  member
                </option>
                <option value="11">manager</option>
              </select>
            </div>
            <div>
              <select name="crypto" onChange={undefined}>
                <option value="pass" selected>
                  pass
                </option>
                <option value="otpauth">otpauth</option>
                <option value="nopass">nopass</option>
              </select>
              <input
                type="password"
                name="pass"
                spellCheck={false}
                placeholder="pass/salt"
                autoComplete="off"
                autoCapitalize="off"
              />
            </div>
            <div>
              <button type="submit" className="special">
                adduser
              </button>
            </div>
            <pre>
              <output className="highlight" name="log"></output>
            </pre>
            <div id="output-adduser"></div>
          </form>
        </section> */}
      </div>
    </div>
  );
}
