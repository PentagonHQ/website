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
            from: 'Website Contact <noreply@usepentagon.com>',
            to: "Pentagon <arvin@usepentagon.com>",
            subject: `Website contact from ${name}`,
            react: await EmailTemplate({ name, email, message }),
        });
        console.log(data)
        return data;
    } catch (error) {
        console.log(error)
    }
}

export async function sendResearchInquiry() {
    try {
        const data = await resend.emails.send({
            from: 'Website Inquiry <noreply@usepentagon.com>',
            to: "Pentagon <arvin@usepentagon.com>",
            subject: "Website Inquiry: 'Explore the research' button clicked",
            react: await EmailTemplate({
                name: "Automated System",
                email: "system@usepentagon.com",
                message: "This is an automated notification that a user clicked the 'Explore the research' button on the hero section."
            }),
        });
        return data;
    } catch (error) {
        console.log(error)
    }
}
