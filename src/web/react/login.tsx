import React from 'react';

import { PageLogin } from './pages/login';
import { renderPage } from './ReactPageRenderer';

//@ts-ignore
if (module.hot) module.hot.accept();

renderPage(<PageLogin />);
