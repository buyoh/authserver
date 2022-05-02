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
import CreateUserForm from '../components/CreateUserForm';
import CreateUserResult from '../components/CreateUserResult';
// import Styles from './style.module.scss';

// TODO: consider the `result` type
async function addUser(
  username: string,
  generated: object,
  authLevel: AuthLevel,
  passCryptoMode: PassCryptoMode
): Promise<
  | { ok: false; details: string }
  | {
      ok: true;
      data: {
        username: string;
        level: AuthLevel;
        crypto: string;
        result: any;
      };
    }
> {
  if (!username) {
    return { ok: false, details: 'username is empty' };
  }
  const res = await WebApi.fetchAddUser(
    username,
    authLevel,
    passCryptoMode,
    generated
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
  return { ok: true, data: res.result.data };
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
  createdUserResult: null | {
    username: string;
    crypto: PassCryptoMode;
    result: object;
  };
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
      createdUserResult: null,
    };
    this.handleAddUser = this.handleAddUser.bind(this);
  }

  private handleAddUser(generated: object, fetchUserList: () => Promise<void>) {
    const pendingAddUser = addUser(
      this.state.username,
      generated,
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

      const result = JSON.stringify(res.data);
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
          <div>
            <UserListContextConsumer>
              {(userList) => (
                <CreateUserForm
                  mode={this.state.passCryptoMode}
                  username={this.state.username}
                  onSubmit={(generated) =>
                    this.handleAddUser(generated, userList.triggerFetch)
                  }
                />
              )}
            </UserListContextConsumer>
          </div>
          {/* <TextInput
            placeholder="pass/salt"
            value={this.state.password}
            onChange={(t) => this.setState({ ...this.state, password: t })}
            required={true}
            password={true}
          /> */}
        </div>
        <pre>
          <output className="highlight">{this.state.resultLog}</output>
        </pre>
        <CreateUserResult mode={'otpauth'} result={undefined} />
      </div>
    );
  }
}

export default AddingUserForm;
