import { createContext, useContext } from 'react';

export const ToastContext = createContext({
    showToast: () => { },
    hideToast: () => { }
});

export const useToast = () => useContext(ToastContext);
