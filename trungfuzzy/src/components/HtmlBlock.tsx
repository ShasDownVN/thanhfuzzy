import { useEffect } from "react";
import { reloadTemplateScripts } from "../services/templateScripts";

type Props = {
  html: string;
  bodyClassName?: string;
};

function removeExtractedComments(html: string) {
  return html
    .split(/\r?\n/)
    .filter((line) => {
      const value = line.trim().toLowerCase();
      if (!value || value.startsWith("<")) return true;

      return !/(?:\bstart|\bstarts|\bend|\bends|\bjs)$/.test(value);
    })
    .join("\n");
}

export default function HtmlBlock({ html, bodyClassName }: Props) {
  useEffect(() => {
    if (bodyClassName) {
      document.body.classList.add(bodyClassName);
    }

    reloadTemplateScripts();

    return () => {
      if (bodyClassName) {
        document.body.classList.remove(bodyClassName);
      }
    };
  }, [bodyClassName, html]);

  return <div dangerouslySetInnerHTML={{ __html: removeExtractedComments(html) }} />;
}
