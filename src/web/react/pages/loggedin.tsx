import React from 'react';
import { WebApi } from '../../api/WebApi';
import Button from '../components/Button';
import AddingUserForm from '../containers/AddingUserForm';
import { UserListContextProviderWrapper } from '../containers/UserListFetcher';
import UserTableForm from '../containers/UserTableForm';

async function logout() {
  await WebApi.fetchLogout();
  location.reload();
}

function SectionLogout(props: {}): JSX.Element {
  return (
    <section>
      <h2>Logout</h2>
      <form onSubmit={logout}>
        <Button submit={true} style={['large', 'special']}>
          logout
        </Button>
      </form>
    </section>
  );
}

function SectionManagementAccounts(props: {}): JSX.Element {
  return (
    <section>
      <h2>management accounts</h2>
      <UserTableForm />
    </section>
  );
}

function SectionAddingUserAccounts(props: {}): JSX.Element {
  return (
    <section>
      <h2>add a new user account</h2>
      <AddingUserForm />
    </section>
  );
}

export function PageLoggedin(props: {}): JSX.Element {
  return (
    <div className="pagewrapper">
      <div className="content page ">
        <h1>user page</h1>
        <SectionLogout />
        <UserListContextProviderWrapper>
          <SectionManagementAccounts />
          <SectionAddingUserAccounts />
        </UserListContextProviderWrapper>
      </div>
    </div>
  );
}
