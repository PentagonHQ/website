"use server";

import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const contactFormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  country: z.string(),
  projectDetails: z.string().optional(),
});

export async function sendContactEmail(formData: unknown) {
  const parsedData = contactFormSchema.parse(formData);

  const { firstName, lastName, email, phone, jobTitle, company, country, projectDetails } = parsedData;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "arvin@usepentagon.com",
      subject: "New Contact Form Submission",
      html: `
        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Job Title:</strong> ${jobTitle}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Project Details:</strong> ${projectDetails}</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email." };
  }
}
