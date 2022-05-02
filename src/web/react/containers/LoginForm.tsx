import React from 'react';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Select from '../components/Select';
import { WebApi } from '../../api/WebApi';
import VerifyUserForm from '../components/VerifyUserForm';
import {
  kPassCryptoList,
  PassCryptoMode,
} from '../../../crypto/PassCryptoProxyWeb';
// import Styles from './style.module.scss';

const passCryptoOptions = kPassCryptoList.map((t) => ({ label: t, value: t }));

type Props = {};

type State = {
  username: string;
  passCryptoMode: PassCryptoMode;
  resultLog: string;
};

// TODO: REFACTORING
async function tryToLogin(
  username,
  pass,
  crypto
): Promise<{ ok: boolean; detail: string }> {
  const res1 = await WebApi.fetchLogin(username, pass, crypto);
  if (400 <= res1.status && res1.status < 500) {
    const json = await res1.json();
    return {
      ok: false,
      detail: json.detail ? json.detail : 'bad request :(',
    };
  } else if (200 <= res1.status && res1.status < 300) {
    return {
      ok: true,
      detail: 'login ok',
    };
  } else {
    console.error(res1);
    return {
      ok: false,
      detail: 'internal error',
    };
  }
}

function transitLoggedIn() {
  const param = new URL(document.location.href).searchParams;
  const refferer_uri = param.get('login');
  if (refferer_uri) {
    // Redirect to previous page.
    param.delete('login');
    location.href =
      location.origin +
      '/' +
      refferer_uri.substring(1) +
      '?' +
      param.toString();
  } else {
    // Redirect to user page.
    location.reload();
  }
}

class LoginForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      passCryptoMode: 'pass',
      resultLog: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private handleSubmit(generated: object) {
    const username = this.state.username;
    const cryptoType = this.state.passCryptoMode;
    (async () => {
      const res = await tryToLogin(username, generated, cryptoType);
      this.setState({ ...this.state, resultLog: res.detail });
      if (res.ok) {
        transitLoggedIn();
      }
    })();
  }

  render(): JSX.Element {
    return (
      <form id="form-login">
        <div>
          <div className="spaced-block">
            <Select
              value={this.state.passCryptoMode}
              options={passCryptoOptions}
              onChange={(t) =>
                this.setState({
                  ...this.state,
                  passCryptoMode: t as PassCryptoMode,
                })
              }
              style={['large']}
            />
          </div>
          <TextInput
            placeholder="username"
            value={this.state.username}
            onChange={(username) => this.setState({ ...this.state, username })}
            style={['large']}
          />
          <VerifyUserForm
            mode={this.state.passCryptoMode}
            username={this.state.username}
            onSubmit={this.handleSubmit}
          />
        </div>
        <hr />
        <div>
          <output className="highlight">{this.state.resultLog}</output>
        </div>
      </form>
    );
  }
}

export default LoginForm;
