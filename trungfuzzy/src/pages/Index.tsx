import HtmlBlock from "../components/HtmlBlock";
import html from "../templates/Index.html?raw";

export default function Index() {
  return <HtmlBlock html={html} bodyClassName="auth-body" />;
}
