import { gfmAutolinkLiteralFromMarkdown } from 'mdast-util-gfm-autolink-literal';
import { gfmStrikethroughFromMarkdown } from 'mdast-util-gfm-strikethrough';
import { gfmAutolinkLiteral } from 'micromark-extension-gfm-autolink-literal';
import { gfmStrikethrough } from 'micromark-extension-gfm-strikethrough';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

const parser = unified()
	.use(remarkParse)
	.use(remarkMath)
	.use(function () {
		const data = this.data();

		const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
		const fromMarkdownExtensions =
			data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);

		micromarkExtensions.push(gfmAutolinkLiteral(), gfmStrikethrough());
		fromMarkdownExtensions.push(gfmAutolinkLiteralFromMarkdown(), gfmStrikethroughFromMarkdown());
	})
	.use(remarkRehype, { allowDangerousHtml: false })
	.use(rehypeKatex)
	.use(rehypeHighlight)
	.use(rehypeExternalLinks, {
		rel: 'nofollow',
		target: '_blank',
	})
	.use(rehypeStringify);

export const messageToHTML = (text: string) => parser.process(text).then((res) => res.toString());
