import React from 'react';
import './style.css';
import { createRoot } from 'react-dom/client';

// //@ts-ignore
// if (module.hot) module.hot.accept();

const container = document.getElementById('react');
const root = createRoot(container!);

export function renderPage(element: JSX.Element) {
  root.render(<>{element}</>);
}
