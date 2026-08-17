import { Badge } from "@/components/ui/badge";
import { ExternalLink, Link2 } from "lucide-react";
import { parseDataLinks, normalizeUrl } from "@/lib/dataLinks";

interface DataLinksListProps {
  value?: string | null;
  title?: string;
}

export const DataLinksList = ({ value, title = "Data Source Links" }: DataLinksListProps) => {
  const links = parseDataLinks(value);
  if (links.length === 0) return null;

  return (
    <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={index} className="rounded-md border border-border bg-card p-3 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {link.source && <Badge variant="secondary">{link.source}</Badge>}
              {link.url && (
                <a
                  href={normalizeUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline inline-flex items-center gap-1 break-all"
                >
                  {link.url}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              )}
            </div>
            {link.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{link.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
