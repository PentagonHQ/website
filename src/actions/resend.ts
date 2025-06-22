"use server";

import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email/template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactForm(formData: FormData) {
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const message = formData.get("message")?.toString();

    if (!name || !email || !message) {
        return { error: "Invalid form data" };
    }

    try {
        const data = await resend.emails.send({
            from: 'Website contact <noreply@mail.coin.fi>',
            to: "CoinFi <simon@coin.fi>",
            subject: `Website contact from ${name}`,
            react: await EmailTemplate({ name, email, message }),
        });
        console.log(data)
        return data;
    } catch (error) {
        console.log(error)
    }
}