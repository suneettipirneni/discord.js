import type { ApiItem, ApiModel } from '@microsoft/api-extractor-model';
import type { DocDeclarationReference, DocLinkTag } from '@microsoft/tsdoc';
import { CommentNode } from './CommentNode';
import { generatePath, resolveName } from '~/util/parse.server';

export function genToken(
	model: ApiModel,
	ref: DocDeclarationReference,
	context: ApiItem | null,
): LinkTagCodeLink | null {
	if (!context) {
		return null;
	}

	const item = model.resolveDeclarationReference(ref, context).resolvedApiItem ?? null;

	if (!item) {
		return null;
	}

	console.log('got here');
	console.log(item);

	return {
		name: resolveName(item),
		kind: item.kind,
		path: generatePath(item.getHierarchy()),
	};
}

export interface LinkTagCodeLink {
	name: string;
	kind: string;
	path: string;
}

export class LinkTagCommentNode extends CommentNode<DocLinkTag> {
	public readonly codeDestination: LinkTagCodeLink | null;

	public constructor(node: DocLinkTag, model: ApiModel, parentItem?: ApiItem) {
		super(node, model, parentItem);
		console.log(node.codeDestination);
		this.codeDestination = node.codeDestination ? genToken(model, node.codeDestination, this.parentItem) : null;
	}

	public override toJSON() {
		return {
			...super.toJSON(),
			codeDestination: this.codeDestination,
		};
	}
}
