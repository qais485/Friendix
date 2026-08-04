import { Link } from "react-router-dom";

interface ParsedContentProps {
  content: string;
  className?: string;
}

const HASHTAG_REGEX = /#(\w+)/g;

export function ParsedContent({ content, className }: ParsedContentProps) {
  if (!content) return null;

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  HASHTAG_REGEX.lastIndex = 0;
  while ((match = HASHTAG_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <Link
        key={`tag-${match.index}`}
        to={`/hashtags/${match[1]}`}
        className="font-medium text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        #{match[1]}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
