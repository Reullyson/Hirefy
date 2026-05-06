import React, { useEffect, useState } from 'react';

interface AlertProps {
    message: string;
    type?: 'error' | 'success' | 'info';
    duration?: number;
    onClose?: () => void;
}

const Alert = ({ message, type = 'error', duration = 5000, onClose }: AlertProps) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) setTimeout(onClose, 300);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!visible) return null;

    const colors = {
        error: { bg: '#fef2f2', border: '#ef4444', text: '#dc2626', icon: '⚠️' },
        success: { bg: '#f0fdf4', border: '#4CAF50', text: '#059669', icon: '✅' },
        info: { bg: '#eff6ff', border: '#3b82f6', text: '#2563eb', icon: 'ℹ️' }
    };

    const style = colors[type] || colors.error;

    return (
        <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: style.bg,
            borderLeft: `4px solid ${style.border}`,
            color: style.text
        }}>
            <span>{style.icon}</span>
            <span>{message}</span>
        </div>
    );
};

export default Alert;