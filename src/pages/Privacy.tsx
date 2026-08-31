import { Helmet } from "react-helmet-async";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Digisell Books</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p>Last updated: [Date]</p>

        <h2>1. Information We Collect</h2>
        <p>
          We collect information that you provide directly to us when you create an account, make a purchase, or contact us. This may include:
        </p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Purchase history</li>
          <li>Billing information</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Process your transactions and deliver digital goods.</li>
          <li>Send you order confirmations and updates.</li>
          <li>Provide customer support.</li>
          <li>Improve our website and services.</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>
          We do not sell your personal data. We may share your information with third-party service providers (such as payment processors like Razorpay or backend providers like Supabase) strictly for the purpose of operating our business and fulfilling your orders.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, or destruction.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us at <strong>[Your Contact Email]</strong>.
        </p>
      </div>
    </>
  );
}
