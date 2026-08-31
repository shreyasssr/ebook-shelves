import { Helmet } from "react-helmet-async";

export default function Privacy() {
  return (
    <>
      <Helmet><title>Privacy Policy | Digisell Books</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-display text-3xl font-semibold mb-6">Privacy Policy</h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <p>
            <em>This is placeholder privacy text — replace it with your
            actual policy before launch. See PROJECT_IDEAS_INPUT_FORMS.md
            §"Terms of Service &amp; Privacy Policy" for the questions to
            answer first.</em>
          </p>
          <p>We collect only the information needed to process your orders
          and give you access to your purchases: your name, email address,
          and order history.</p>
        </div>
      </div>
    </>
  );
}
