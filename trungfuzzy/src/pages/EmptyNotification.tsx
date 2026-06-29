import HtmlBlock from "../components/HtmlBlock";
import html from "../templates/EmptyNotification.html?raw";

export default function EmptyNotification() {
  return <HtmlBlock html={html} />;
}
