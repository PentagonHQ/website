import * as React from 'react';

interface EmailTemplateProps {
    name: string;
    email: string;
    message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    name,
    email,
    message,
}) => (
    <div>
        <h1>Message from: {name}!</h1>
        <p>Email: {email}</p>
        <p>Message:{message}</p>
    </div>
);
