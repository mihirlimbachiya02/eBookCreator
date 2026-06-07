import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter } from 'react-router-dom';
import { Toaster} from 'react-hot-toast';
import { AuthProvider } from "./context/AuthProvider";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <App />
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    containerStyle={{
                        top: 80, // pushes it below the browser bookmark bar
                    }}
                    toastOptions={{
                        duration: 5000,
                        error: {
                            duration: 6000,
                        },
                    }}
                />
            </BrowserRouter>
        </AuthProvider>
    </StrictMode>,
);
