import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <>
      <Helmet><title>Terms of Service | Digisell Books</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-6">Terms of Service</h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            <em>This is placeholder terms text — replace it with your actual
            terms before launch. See PROJECT_IDEAS_INPUT_FORMS.md
            §"Terms of Service &amp; Privacy Policy" for the questions to
            answer first.</em>
          </p>
          <p>By using Digisell Books, you agree to purchase ebooks for your
          personal use only. Redistribution or resale of purchased files is
          not permitted.</p>
        </div>
      </div>
    </>
  );
}
