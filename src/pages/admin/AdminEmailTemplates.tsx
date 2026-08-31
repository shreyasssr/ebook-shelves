import { useState } from "react";
import { EMAIL_TEMPLATES, EmailTemplate } from "@/lib/emailTemplates";
import { Button } from "@/components/ui/button";

export default function AdminEmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

  const renderHighlightedBody = (text: string) => {
    // Wrap placeholders like {{variable_name}} in a <code> tag
    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, i) => 
      part.startsWith("{{") && part.endsWith("}}") ? (
        <code key={i} className="bg-primary/20 text-primary px-1 rounded">{part}</code>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Email Templates</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border border-border rounded-lg bg-card overflow-hidden h-fit">
          <div className="bg-muted p-3 border-b border-border font-semibold text-sm text-muted-foreground">
            Available Templates
          </div>
          <ul className="divide-y divide-border">
            {EMAIL_TEMPLATES.map(tpl => (
              <li 
                key={tpl.id}
                className={`p-3 cursor-pointer transition hover:bg-muted/50 ${selectedTemplate?.id === tpl.id ? 'bg-muted border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                onClick={() => setSelectedTemplate(tpl)}
              >
                <div className="font-medium">{tpl.name}</div>
                <div className="text-xs text-muted-foreground truncate">{tpl.subject}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          {selectedTemplate ? (
            <div className="border border-border rounded-lg bg-card p-6 space-y-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Template Name</label>
                <div className="font-medium">{selectedTemplate.name}</div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Subject</label>
                <div className="p-3 bg-muted rounded border border-border text-sm">
                  {renderHighlightedBody(selectedTemplate.subject)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Body (Plain Text)</label>
                <div className="p-4 bg-muted rounded border border-border text-sm whitespace-pre-wrap font-mono">
                  {renderHighlightedBody(selectedTemplate.body)}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button disabled title="Connect an email provider to enable sending test emails.">
                  Send test email
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Connect an email provider to enable sending test emails. Edit saving is disabled while backend is disconnected.
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-border border-dashed rounded-lg p-12 text-center text-muted-foreground h-full flex items-center justify-center">
              Select a template from the list to preview it.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
