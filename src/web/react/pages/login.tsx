import React from 'react';
import LoginForm from '../containers/LoginForm';

export function PageLogin(props: {}): JSX.Element {
  return (
    <div className="pagewrapper-full">
      <div
        className="content"
        style={{
          margin: 'auto',
          height: '18em',
          width: '24em',
        }}
      >
        <h2 className="strong">Login</h2>
        <LoginForm />
      </div>
    </div>
  );
}
