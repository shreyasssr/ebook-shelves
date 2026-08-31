import { Helmet } from "react-helmet-async";

export default function RefundPolicy() {
  return (
    <>
      <Helmet><title>Refund Policy | Digisell Books</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-6">Refund Policy</h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            <em>This is placeholder policy text — replace it with your actual
            refund terms before launch. See PROJECT_IDEAS_INPUT_FORMS.md
            §"Refund / cancellation policy" for the questions to answer first.</em>
          </p>
          <p>All books sold on Digisell Books are digital products delivered
          instantly as PDF downloads. Because of the nature of digital
          goods, refunds are generally not available once a file has been
          downloaded.</p>
          <p>If you believe you were charged in error, or experience a
          technical issue preventing you from accessing your purchase,
          contact us and we'll make it right.</p>
        </div>
      </div>
    </>
  );
}
