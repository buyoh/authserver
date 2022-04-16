import React from 'react';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import Select from '../components/Select';
import { WebApi } from '../../api/WebApi';
// import Styles from './style.module.scss';

type Props = {};

type State = {
  username: string;
  password: string;
  cryptoType: string;
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
      password: '',
      cryptoType: 'pass',
      resultLog: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const username = this.state.username;
    const password = this.state.password;
    const cryptoType = this.state.cryptoType;
    (async () => {
      const res = await tryToLogin(username, password, cryptoType);
      this.setState({ ...this.state, resultLog: res.detail });
      if (res.ok) {
        transitLoggedIn();
      }
    })();
  }

  render(): JSX.Element {
    return (
      <form onSubmit={this.handleSubmit} id="form-login">
        <div>
          <div className="spaced-block">
            <TextInput
              placeholder="username"
              value={this.state.username}
              onChange={(t) => {
                this.setState({ ...this.state, username: t });
              }}
              required={true}
              style={['large']}
            />
            <TextInput
              password={true}
              placeholder="password"
              value={this.state.password}
              onChange={(t) => {
                this.setState({ ...this.state, password: t });
              }}
              required={true}
              style={['large']}
            />
          </div>
          <div className="spaced-block">
            <Select
              value={this.state.cryptoType}
              onChange={(v) => {
                this.setState({ ...this.state, cryptoType: v });
              }}
              options={[
                { label: 'pass', value: 'pass' },
                { label: 'otpauth', value: 'otpauth' },
                { label: 'nopass', value: 'nopass' },
              ]}
              style={['large']}
            />
          </div>
        </div>
        <Button style={['large', 'special']} submit={true}>
          login
        </Button>
        <hr />
        <div>
          <output className="highlight">{this.state.resultLog}</output>
        </div>
      </form>
    );
  }
}

export default LoginForm;
