import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);

    // Esta comprobación es una mejora de calidad de vida.
    // Si intentas usar este hook fuera de un componente que está dentro de AuthProvider,
    // te dará un error claro en lugar de fallar silenciosamente.
    if (context === undefined) {
        throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
    }

    return context;
};