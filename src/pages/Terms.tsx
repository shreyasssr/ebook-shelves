import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Digisell Books</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
        <h1>Terms of Service</h1>
        <p>Last updated: [Date]</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using [Your Business Name] ("Digisell Books"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
        </p>

        <h2>2. Digital Goods License</h2>
        <p>
          When you purchase an ebook or digital download from our store, you are purchasing a non-exclusive, non-transferable license to consume the content for personal use only. You may not resell, redistribute, or share the digital files.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
        </p>

        <h2>4. Pricing and Payments</h2>
        <p>
          All prices are listed in [Your Currency, e.g., INR]. We reserve the right to modify prices at any time. Payments are processed securely via our third-party payment providers (e.g., Razorpay).
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, [Your Business Name] shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at <strong>[Your Contact Email]</strong>.
        </p>
      </div>
    </>
  );
}
