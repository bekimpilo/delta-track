import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { CommentEntry, parseComments, serializeComments, formatCommentDate } from "@/lib/comments";

interface CommentsEditorProps {
  /** Serialized comments value (JSON array or legacy text). */
  value: string;
  onChange: (serialized: string) => void;
  author?: string;
}

export const CommentsEditor = ({ value, onChange, author }: CommentsEditorProps) => {
  const entries = parseComments(value);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [text, setText] = useState("");

  const commit = (next: CommentEntry[]) => onChange(serializeComments(next));

  const addEntry = () => {
    if (!text.trim()) return;
    commit([
      ...entries,
      { period: date, text: text.trim(), author, createdAt: new Date().toISOString() },
    ]);
    setText("");
  };

  const removeEntry = (index: number) => commit(entries.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        Comments / Updates
      </Label>

      {entries.length > 0 && (
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {entry.period && <Badge variant="secondary">{formatCommentDate(entry.period)}</Badge>}
                  {entry.author && (
                    <span className="text-xs text-muted-foreground">{entry.author}</span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{entry.text}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEntry(index)}
                aria-label="Remove comment"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
        <div className="grid gap-2 sm:grid-cols-[180px_1fr] sm:items-start">
          <div className="space-y-1">
            <Label htmlFor="comment-date" className="text-xs text-muted-foreground">
              Date of update
            </Label>
            <Input
              id="comment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="comment-text" className="text-xs text-muted-foreground">
              Update
            </Label>
            <Textarea
              id="comment-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add an update…"
              rows={2}
            />
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addEntry} disabled={!text.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add comment
        </Button>
      </div>
    </div>
  );
};
