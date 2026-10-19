"use client";

/**
 * Contribute modal — opens when a logged-in user clicks "Contribute".
 *
 * Form fields: quote text, author (free-text + new-author toggle), source
 * (citation), topics (comma-separated). On submit, writes a new doc to the
 * `quotes` collection with status="pending" — moderators approve before it
 * shows in the public feed.
 *
 * The login gate is enforced in the Header (Contribute CTA): if the user is
 * logged out, clicking opens the AuthModal instead.
 */

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // shadcn textarea
import { Label } from "@/components/ui/label";
import { X, Loader2, Send } from "lucide-react";
import { submitContribution, slugify } from "@/lib/firestore";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Known author ids+names from the local fallback list — used for the
   *  autocomplete dropdown so contributors can attach to existing authors. */
  knownAuthors: { id: string; name: string }[];
};

export function ContributeModal({ open, onClose, knownAuthors }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [source, setSource] = useState("");
  const [topicsInput, setTopicsInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Reset form whenever the modal closes
  useEffect(() => {
    if (!open) {
      setText("");
      setAuthorId("");
      setSource("");
      setTopicsInput("");
      setBusy(false);
    }
  }, [open]);

  if (!open || !user) return null;

  const topics = topicsInput
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const isValid =
    text.trim().length >= 10 &&
    text.trim().length <= 800 &&
    (authorId.trim().length >= 2 || knownAuthors.some((a) => a.id === authorId)) &&
    source.trim().length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !user) return;
    setBusy(true);
    try {
      // If the user typed a free-text author name, slugify it as the id;
      // otherwise use the selected known author's id.
      const finalAuthorId =
        knownAuthors.find((a) => a.id === authorId)?.id ?? slugify(authorId);
      await submitContribution({
        text: text.trim(),
        authorId: finalAuthorId,
        source: source.trim(),
        topics,
        contributorId: user.uid,
      });
      toast({
        title: "Contribution submitted",
        description:
          "Your quote is now in the moderation queue. It'll appear on the site once approved.",
      });
      onClose();
    } catch (err) {
      console.error("[contribute] submission failed:", err);
      toast({
        title: "Submission failed",
        description:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Contribute a quote"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-border bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-2 rounded-full p-1.5 text-primary-foreground/80 hover:bg-white/20 hover:text-primary-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <h2 className="font-serif text-xl font-bold">Contribute a Quote</h2>
          <p className="mt-1 text-xs text-primary-foreground/85">
            Submissions are reviewed by moderators before publishing.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          <div>
            <Label htmlFor="quote-text" className="text-sm font-semibold">
              Quote text <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="quote-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type the quote exactly as it appears in the source..."
              className="mt-1 min-h-24 resize-none font-serif text-base leading-relaxed"
              maxLength={800}
              required
              autoFocus
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">
              {text.length} / 800
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="quote-author" className="text-sm font-semibold">
                Author <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quote-author"
                list="known-authors"
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                placeholder="e.g. Marcus Aurelius"
                className="mt-1"
                required
              />
              <datalist id="known-authors">
                {knownAuthors.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </datalist>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Pick from the list or type a new author.
              </p>
            </div>

            <div>
              <Label htmlFor="quote-source" className="text-sm font-semibold">
                Source <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quote-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Meditations, Book IV"
                className="mt-1"
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Book, chapter, or work title.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="quote-topics" className="text-sm font-semibold">
              Topics
            </Label>
            <Input
              id="quote-topics"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="wisdom, discipline, resilience"
              className="mt-1"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Comma-separated. Lowercase, single words work best.
            </p>
          </div>

          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <span
                  key={t}
                  className="stoic-topic-pill text-xs"
                  aria-label={`Topic: ${t}`}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid || busy}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            {busy ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
