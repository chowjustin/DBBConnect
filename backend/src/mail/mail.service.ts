import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    const info = await this.transporter.sendMail({
      from: `"Tutor App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent:', info.messageId);
  }

  // 🔵 1. Student applies → notify student
  async sendStudentPendingEmail(studentEmail: string, tutorName: string) {
    return this.sendEmail(
      studentEmail,
      'Your Application is Pending',
      `Your application to ${tutorName} is now pending.`,
      `
        <h2>Application Pending</h2>
        <p>You applied to <strong>${tutorName}</strong>.</p>
        <p>The tutor will review your application soon.</p>
      `,
    );
  }

  // 🟢 2. Student applies → notify tutor
  async sendTutorNewApplicationEmail(tutorEmail: string, studentName: string) {
    return this.sendEmail(
      tutorEmail,
      'New Student Application Received',
      `${studentName} has applied to your tutoring service.`,
      `
        <h2>New Application</h2>
        <p><strong>${studentName}</strong> has sent you an application.</p>
        <p>Please review the application in your dashboard.</p>
      `,
    );
  }

  // 🟣 3. Tutor updates status → notify student
  async sendStudentStatusUpdateEmail(
    studentEmail: string,
    status: ApplicationStatus,
    tutorName: string,
  ) {
    const statusText =
      status === 'ACCEPTED'
        ? 'accepted ✅'
        : 'rejected ❌';

    return this.sendEmail(
      studentEmail,
      `Your Application to ${tutorName} Was ${status}`,
      `Your application to ${tutorName} was ${statusText}.`,
      `
        <h2>Application Update</h2>
        <p>Your application to <strong>${tutorName}</strong> has been <strong>${status.toLowerCase()}</strong>.</p>
      `,
    );
  }
}
