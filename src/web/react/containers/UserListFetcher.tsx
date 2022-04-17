import React from 'react';
import { WebApi } from '../../api/WebApi';
import { User, validateAuthLevel } from '../../../user_profile/UserProfile';

//
// internal singleton
//

let g_userListCache = null as (User & { me: boolean })[] | null;

async function fetchUserList(): Promise<(User & { me: boolean })[]> {
  const res = await WebApi.fetchGetAllUser();
  if (res.ok === false) {
    console.log('Failed to fetch user list: ', res.response);
    throw new Error('Failed to fetch user list: status=' + res.response.status);
  }
  if (res.result.ok === false) {
    console.log('Failed to request user list: ', res.result.detail);
    throw new Error('Failed to request user list');
  }
  const list = res.result.data;
  g_userListCache = list;
  return list;
}

function useCacheUserList(): (User & { me: boolean })[] | null {
  return g_userListCache;
}

//
// Common
//

type UserWithMe = User & { me: boolean };

type UserListContextProps = {
  users: User[];
  me: User | null;
};

function intoUserListContextProps(
  list: (User & { me: boolean })[]
): UserListContextProps {
  return {
    users: list,
    me: list.find((u) => u.me) ?? null,
  };
}

//
// Context
//

type UserListContextData = UserListContextProps & {
  triggerFetch: () => Promise<void>;
};

const UserListContext = React.createContext<UserListContextData>(
  // default
  { users: [], me: null, triggerFetch: async () => {} }
);

//
// Element(Wrapper)
//

type Props = {
  children?: React.ReactNode;
};
type State = UserListContextProps & {
  initialized: boolean;
};

export class UserListContextProviderWrapper extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    const list = useCacheUserList();
    if (list !== null) {
      this.state = {
        initialized: true,
        ...intoUserListContextProps(list),
      };
    } else {
      this.state = {
        initialized: false,
        users: [],
        me: null,
      };
    }
    this.triggerFetch = this.triggerFetch.bind(this);
  }

  componentDidMount() {
    if (!this.state.initialized) this.triggerFetch();
  }

  private async triggerFetch() {
    const list = await fetchUserList();
    this.setState({ ...this.state, ...intoUserListContextProps(list) });
  }

  render(): JSX.Element {
    return (
      <UserListContext.Provider
        value={{ ...this.state, triggerFetch: this.triggerFetch }}
      >
        {this.props.children}
      </UserListContext.Provider>
    );
  }
}

export const UserListContextConsumer = UserListContext.Consumer;
