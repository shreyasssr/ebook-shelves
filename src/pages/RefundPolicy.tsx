import { Helmet } from "react-helmet-async";

export default function RefundPolicy() {
  return (
    <>
      <Helmet>
        <title>Refund Policy | Digisell Books</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
        <h1>Refund & Cancellation Policy</h1>
        <p>Last updated: [Date]</p>

        <h2>Digital Products</h2>
        <p>
          Due to the nature of digital goods, all sales of ebooks and downloadable content are generally considered final and non-refundable once the download link has been accessed or the file has been downloaded.
        </p>

        <h2>Exceptions</h2>
        <p>
          We may offer a refund or exchange under the following limited circumstances:
        </p>
        <ul>
          <li>The file is corrupted, defective, or cannot be opened.</li>
          <li>You made a duplicate purchase of the same title by accident.</li>
          <li>You have not yet downloaded or accessed the file, and you request a refund within 7 days of purchase.</li>
        </ul>

        <h2>Requesting a Refund</h2>
        <p>
          To request a refund, please contact us at <strong>[Your Contact Email]</strong> with your order number and the reason for the request. We will review your request and process approved refunds within 5-7 business days.
        </p>
      </div>
    </>
  );
}
