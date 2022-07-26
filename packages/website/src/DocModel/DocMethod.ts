import type { ApiMethod, ApiModel } from '@microsoft/api-extractor-model';
import type { DocComment } from '@microsoft/tsdoc';
import { DocFunction } from './DocFunction';
import { Visibility } from './Visibility';

export class DocMethod extends DocFunction {
	public readonly static: boolean;
	public readonly optional: boolean;
	public readonly visibility: Visibility;
	public readonly tsdocComment: DocComment | undefined;

	public constructor(model: ApiModel, item: ApiMethod) {
		super(model, item);
		this.static = item.isStatic;
		this.optional = item.isOptional;
		this.visibility = item.isProtected ? Visibility.Protected : Visibility.Public;
		this.tsdocComment = item.tsdocComment;
	}

	public override toJSON() {
		return {
			...super.toJSON(),
			static: this.static,
			optional: this.optional,
			visibility: this.visibility,
		};
	}
}
