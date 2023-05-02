import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useState } from 'react';
import UserTypeContext from '../contexts/UserTypeContext';

import './reactCOIServiceWorker';

export default function App({ Component, pageProps }: AppProps) {
  const [userRole, setUserRole] = useState('');
  return ( 
    <UserTypeContext.Provider value={{ userRole, setUserRole }}>
      <Component {...pageProps} />
    </UserTypeContext.Provider>
  );
}
