import React from 'react';

import { PageLoggedin } from './pages/loggedin';
import { renderPage } from './ReactPageRenderer';

//@ts-ignore
if (module.hot) module.hot.accept();

renderPage(<PageLoggedin />);
