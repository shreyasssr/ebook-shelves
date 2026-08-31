export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "order_confirmation",
    name: "Order Confirmation",
    subject: "Your receipt from Digisell Books [Order {{order_id}}]",
    body: `Hi {{customer_name}},

Thank you for purchasing from Digisell Books! We have successfully processed your order {{order_id}}.

You paid a total of {{total_amount}} for the following books:
{{book_titles}}

Your digital PDF files are ready for you. You can download them instantly at any time by logging into your account and visiting your Dashboard here:
{{dashboard_link}}

If you have any questions or need help accessing your files, just reply to this email.

Happy reading!
The Digisell Books Team`
  },
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to Digisell Books!",
    body: `Hi {{customer_name}},

Welcome to Digisell Books! We're thrilled to have you join our community. 

As a member, you get instant access to over 5,000 PDF ebooks across multiple languages including Hindi, Marathi, English, and more. 

Ready to dive in? Browse our full catalog here:
{{browse_link}}

If you need any help, just reply to this email.

Happy reading!
The Digisell Books Team`
  },
  {
    id: "password_reset",
    name: "Password Reset",
    subject: "Reset your Digisell Books password",
    body: `Hi {{customer_name}},

We received a request to reset the password for your Digisell Books account. 

If you made this request, please click the link below to set a new password:
{{reset_link}}

Please note that this link will expire in 1 hour.

If you didn't ask to reset your password, you can safely ignore this email. Your account is secure.

The Digisell Books Team`
  }
];
