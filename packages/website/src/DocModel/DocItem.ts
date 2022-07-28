import type { ApiModel, ApiDeclaredItem } from '@microsoft/api-extractor-model';
import { CommentNodeContainer } from './comment/CommentNodeContainer';
import type { ReferenceData } from '~/util/model.server';
import { resolveName, genReference, resolveDocComment, TokenDocumentation, genToken } from '~/util/parse.server';

export type DocItemConstructor<T = DocItem> = new (...args: any[]) => T;

export class DocItem<T extends ApiDeclaredItem = ApiDeclaredItem> {
	public readonly item: T;
	public readonly name: string;
	public readonly referenceData: ReferenceData;
	public readonly summary: string | null;
	public readonly model: ApiModel;
	public readonly excerpt: string;
	public readonly excerptTokens: TokenDocumentation[] = [];
	public readonly kind: string;
	public readonly remarks: CommentNodeContainer | null;

	public constructor(model: ApiModel, item: T) {
		this.item = item;
		this.kind = item.kind;
		this.model = model;
		this.name = resolveName(item);
		this.referenceData = genReference(item);
		this.summary = resolveDocComment(item);
		this.excerpt = item.excerpt.text;
		this.excerptTokens = item.excerpt.spannedTokens.map((token) => genToken(model, token));
		this.remarks = item.tsdocComment?.remarksBlock
			? new CommentNodeContainer(item.tsdocComment.remarksBlock.content, model, item.parent)
			: null;
	}

	public toJSON() {
		return {
			name: this.name,
			referenceData: this.referenceData,
			summary: this.summary,
			excerpt: this.excerpt,
			excerptTokens: this.excerptTokens,
			kind: this.kind,
			remarks: this.remarks?.toJSON() ?? null,
		};
	}
}
