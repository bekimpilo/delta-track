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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      </div>
      <div className="space-y-3">
        {links.map((link, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start gap-2 mb-2">
              {link.source && (
                <Badge variant="secondary" className="text-[11px]">
                  {link.source}
                </Badge>
              )}
              {link.url && (
                <a
                  href={normalizeUrl(link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline break-all font-medium"
                >
                  {link.url}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              )}
            </div>
            {link.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {link.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
