import type { ApiItem, ApiModel } from '@microsoft/api-extractor-model';
import type { DocLinkTag, DocNodeContainer, DocParagraph, DocPlainText } from '@microsoft/tsdoc';
import { CommentNode } from './CommentNode';
import { LinkTagCommentNode } from './LinkTagCommentNode';
import { PlainTextCommentNode } from './PlainTextCommentNode';

export class CommentNodeContainer<T extends DocNodeContainer = DocNodeContainer> extends CommentNode<DocNodeContainer> {
	public readonly nodes: CommentNode[];

	public constructor(container: T, model: ApiModel, parentItem?: ApiItem) {
		super(container, model, parentItem);
		this.nodes = container.nodes.map((node) => {
			switch (node.kind) {
				case 'PlainText':
					return new PlainTextCommentNode(node as DocPlainText, model, parentItem);
				case 'LinkTag':
					return new LinkTagCommentNode(node as DocLinkTag, model, parentItem);
				case 'Paragraph':
					return new CommentNodeContainer(node as DocParagraph, model, parentItem);
				default:
					return new CommentNode(node, model, parentItem);
			}
		});
	}

	public override toJSON() {
		return {
			...super.toJSON(),
			nodes: this.nodes.map((node) => node.toJSON()),
		};
	}
}
