import React from 'react';
import LoginForm from '../containers/LoginForm';

export function PageLogin(props: {}): JSX.Element {
  return (
    <div className="pagewrapper-full">
      <div id="form-login-wrap" className="content">
        <h2 className="strong">Login</h2>
        <LoginForm />
      </div>
    </div>
  );
}
