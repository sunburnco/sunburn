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
	// TODO why was this true?
	.use(remarkRehype, { allowDangerousHtml: false })
	.use(rehypeKatex)
	.use(rehypeHighlight)
	.use(rehypeStringify);

export const messageToHTML = (text: string) => parser.process(text).then((res) => res.toString());
