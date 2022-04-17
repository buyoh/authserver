import React from 'react';
import { UserListContextConsumer } from './UserListFetcher';
import { isEditableAuthLevel, User } from '../../../user_profile/UserProfile';
import Button from '../components/Button';
import { WebApi } from '../../api/WebApi';
// import Styles from './style.module.scss';

async function deleteUser(user: User): Promise<boolean> {
  // TODO: 本来消せないユーザが消せるように見える (恐らく server 側の問題)
  const res = await WebApi.fetchDeleteUser(user.username);

  return res.ok && res.result.ok;
}

function handleDeleteUser(user: User, fetchUserList: () => Promise<void>) {
  (async () => {
    if (await deleteUser(user)) fetchUserList();
  })();
}

type Props = {};

type State = {
  resultLog: string;
};

function UserTableRow(props: {
  user: User;
  me: User | null;
  onDelete: (u: User) => void;
}): JSX.Element {
  const isMe = props.me && props.user.username == props.me.username;
  const isEditable =
    props.me && isEditableAuthLevel(props.me.level, props.user.level);
  return (
    <tr>
      <td>{props.user.username}</td>
      <td>{props.user.level}</td>
      <td>
        {isMe ? (
          '[you]'
        ) : isEditable ? (
          <Button onClick={() => props.onDelete(props.user)}>delete</Button>
        ) : (
          <></>
        )}
      </td>
    </tr>
  );
}

function UserTable(props: {}): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          <th>username</th>
          <th>auth-level</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <UserListContextConsumer>
          {(userList) => (
            <>
              {userList.users.map((user) => (
                <UserTableRow
                  user={user}
                  me={userList.me}
                  key={user.username}
                  onDelete={() => handleDeleteUser(user, userList.triggerFetch)}
                />
              ))}
            </>
          )}
        </UserListContextConsumer>
      </tbody>
    </table>
  );
}

class UserTableForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      resultLog: '',
    };
  }

  render(): JSX.Element {
    return (
      <>
        <div>
          <UserTable />
        </div>

        <div>
          <output className="highlight">{this.state.resultLog}</output>
        </div>
      </>
    );
  }
}

export default UserTableForm;
