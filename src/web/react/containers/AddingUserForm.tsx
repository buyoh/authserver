import React from 'react';
import { UserListContextConsumer } from './UserListFetcher';
import {
  AuthLevel,
  AuthLevelMember,
  authLevelToString,
  isEditableAuthLevel,
  kManageableAuthLevelList,
  User,
} from '../../../user_profile/UserProfile';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import Select from '../components/Select';
import {
  kPassCryptoList,
  PassCryptoMode,
} from '../../../crypto/PassCryptoProxyWeb';
import { WebApi } from '../../api/WebApi';
// import Styles from './style.module.scss';

// TODO: consider the `result` type
async function addUser(
  username: string,
  password: string,
  authLevel: AuthLevel,
  passCryptoMode: PassCryptoMode
): Promise<{ ok: false; details: string } | { ok: true; result: any }> {
  if (!username) {
    return { ok: false, details: 'username is empty' };
  }
  const res = await WebApi.fetchAddUser(
    username,
    authLevel,
    passCryptoMode,
    password
  );
  if (res.ok === false) {
    console.warn('addUser failed: ', res.response);
    return { ok: false, details: res.response.statusText };
  }
  if (res.result.ok === false) {
    console.warn('addUser failed (bad request): ', res.result);
    return { ok: false, details: res.result.detail };
  }
  if (
    res.result.data.username !== username ||
    res.result.data.level !== authLevel
  ) {
    console.warn('addUser failed: wrong username', res.result);
    return { ok: false, details: 'internal error' };
  }
  return { ok: true, result: res.result };
}

const passCryptoOptions = kPassCryptoList.map((t) => ({ label: t, value: t }));
const authLevelOptions = kManageableAuthLevelList.map((l) => ({
  label: authLevelToString(l),
  value: `${l}`,
}));

type Props = {};

type State = {
  username: string;
  password: string;
  authLevel: AuthLevel;
  passCryptoMode: PassCryptoMode;
  resultLog: string;
};

class AddingUserForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      authLevel: AuthLevelMember,
      passCryptoMode: 'otpauth',
      resultLog: '',
    };
    this.handleAddUser = this.handleAddUser.bind(this);
  }

  private handleAddUser(fetchUserList: () => Promise<void>) {
    const pendingAddUser = addUser(
      this.state.username,
      this.state.password,
      this.state.authLevel,
      this.state.passCryptoMode
    );
    (async () => {
      const res = await pendingAddUser;
      if (res.ok === false) {
        this.setState({
          ...this.state,
          resultLog: 'request error: ' + (res.details ?? ''),
        });
        return;
      }

      const result = JSON.stringify(res.result);
      // TODO: display QRcode
      this.setState({ ...this.state, resultLog: result });

      // await is not needed
      fetchUserList();
    })();
  }

  render(): JSX.Element {
    return (
      <div>
        <div>
          <TextInput
            placeholder="username"
            value={this.state.username}
            onChange={(t) => this.setState({ ...this.state, username: t })}
            required={true}
          />
          <Select
            value={`${this.state.authLevel}`}
            options={authLevelOptions}
            onChange={(t) =>
              this.setState({ ...this.state, authLevel: +t as AuthLevel })
            }
          />
        </div>
        <div>
          <Select
            value={this.state.passCryptoMode}
            options={passCryptoOptions}
            onChange={(t) =>
              this.setState({
                ...this.state,
                passCryptoMode: t as PassCryptoMode,
              })
            }
          />
          <TextInput
            placeholder="pass/salt"
            value={this.state.password}
            onChange={(t) => this.setState({ ...this.state, password: t })}
            required={true}
            password={true}
          />
        </div>
        <div>
          <UserListContextConsumer>
            {(userList) => (
              <Button
                style={['special']}
                onClick={() => this.handleAddUser(userList.triggerFetch)}
              >
                adduser
              </Button>
            )}
          </UserListContextConsumer>
        </div>
        <pre>
          <output className="highlight">{this.state.resultLog}</output>
        </pre>
      </div>
    );
  }
}

export default AddingUserForm;
