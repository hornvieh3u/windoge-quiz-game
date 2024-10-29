import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from 'react-hot-toast';

import { IdentityKitProvider, IdentityKitTheme } from "@nfid/identitykit/react"
import { NFIDW, InternetIdentity } from "@nfid/identitykit"

import './index.css';
import "@nfid/identitykit/react/styles.css"


ReactDOM.createRoot(document.getElementById('root')).render(
  <IdentityKitProvider
    theme={IdentityKitTheme.LIGHT}
    signers={[NFIDW, InternetIdentity]}
    featuredSigner={InternetIdentity}
  >
    <App />
    <Toaster />
  </IdentityKitProvider>,
);
