import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CommentNode } from '~/DocModel/comment/CommentNode';
import type { CommentNodeContainer } from '~/DocModel/comment/CommentNodeContainer';
import type { LinkTagCommentNode } from '~/DocModel/comment/LinkTagCommentNode';
import type { PlainTextCommentNode } from '~/DocModel/comment/PlainTextCommentNode';

export interface RemarksBlockProps {
	node: ReturnType<CommentNode['toJSON']>;
}

export function RemarksBlock({ node }: RemarksBlockProps): JSX.Element {
	const createNode = (node: ReturnType<CommentNode['toJSON']>): ReactNode => {
		switch (node.kind) {
			case 'PlainText':
				return (node as ReturnType<PlainTextCommentNode['toJSON']>).text;
			case 'Paragraph':
				return (
					<p className="inline">
						{(node as ReturnType<CommentNodeContainer['toJSON']>).nodes.map((node) => createNode(node))}
					</p>
				);
			case 'SoftBreak':
				return <br />;
			case 'LinkTag': {
				console.log(node);
				const linkData = (node as ReturnType<LinkTagCommentNode['toJSON']>).codeDestination;
				if (!linkData) {
					return null;
				}
				return (
					<Link href={linkData.path}>
						<a>{linkData.name}</a>
					</Link>
				);
			}
			default:
				break;
		}

		return null;
	};

	if (node.kind === 'Paragraph' || node.kind === 'Section') {
		return <>{(node as CommentNodeContainer).nodes.map(createNode)}</>;
	}

	return <>{createNode(node)}</>;
}
