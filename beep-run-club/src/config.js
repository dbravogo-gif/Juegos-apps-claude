// Configuración de Firebase del club (proyecto beep-run-club). Sale de la consola de Firebase:
// Configuración del proyecto → Tus apps. No es secreta: va dentro de cualquier app web de Firebase.
// La seguridad la ponen las reglas de Firestore (firestore.rules). Con null, la app va en modo demo.
export const FIREBASE = {
  apiKey: 'AIzaSyBh94Vr75bTFa5XBl-gOW53238g48AWp6M',
  authDomain: 'beep-run-club.firebaseapp.com',
  projectId: 'beep-run-club',
  storageBucket: 'beep-run-club.firebasestorage.app',
  messagingSenderId: '436486033445',
  appId: '1:436486033445:web:c2abe78f7f035be9c7efcc',
};

// Responsable del tratamiento de datos (el club o el entrenador): sale en la información de
// protección de datos. Hay que rellenarlo antes de usar la app con atletas reales.
export const RESPONSABLE = { nombre: null, email: null };
