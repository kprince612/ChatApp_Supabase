// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// // import { initializeApp } from "firebase/app";

// import { createClient } from '@supabase/supabase-js';

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// // const firebaseConfig = {
// //   apiKey: "AIzaSyAfh-9Xv4-YVg2XgEVm1TTc9SlqwtCvDRA",
// //   authDomain: "chatapplication-f075e.firebaseapp.com",
// //   databaseURL: "https://chatapplication-f075e-default-rtdb.firebaseio.com",
// //   projectId: "chatapplication-f075e",
// //   storageBucket: "chatapplication-f075e.firebasestorage.app",
// //   messagingSenderId: "698832275418",
// //   appId: "1:698832275418:web:0ac75af84a63af7de422e3",
// //   measurementId: "G-FB159SCKV4"
// // };

// const SUPABASE_URL = 'https://hxekehgfbxotfcmzxekg.supabase.co';
// const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZWtlaGdmYnhvdGZjbXp4ZWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjgwNjAsImV4cCI6MjA1NTIwNDA2MH0.ypaJXnzCIzT3eYTPrhuIIST5YAbElJY1cFkG2SFz0KA';

// export const supabase = createClient (SUPABASE_URL, SUPABASE_ANON_KEY);

// // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // const analytics = getAnalytics(app);

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   // <React.StrictMode>
//     <App />
//   // </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = 'https://hxekehgfbxotfcmzxekg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZWtlaGdmYnhvdGZjbXp4ZWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MjgwNjAsImV4cCI6MjA1NTIwNDA2MH0.ypaJXnzCIzT3eYTPrhuIIST5YAbElJY1cFkG2SFz0KA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

reportWebVitals();
