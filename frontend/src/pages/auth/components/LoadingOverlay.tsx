import React from 'react';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

const LoadingOverlay = ({ visible, message = 'Carregando...' }: LoadingOverlayProps) => {
    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: '#F8FAFC',
                padding: '2rem',
                borderRadius: '1.5rem',
                textAlign: 'center',
                boxShadow: '0 20px 35px rgba(15, 23, 42, 0.2)'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #e2e8f0',
                    borderTopColor: '#059669',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 1rem'
                }} />
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
                <p style={{ color: '#0F172A' }}>{message}</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;