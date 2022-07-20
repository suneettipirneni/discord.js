import type { ReactNode } from 'react';
import { HyperlinkedText } from './HyperlinkedText';
import type { TokenDocumentation } from '~/util/parse.server';

export enum CodeListingSeparatorType {
	Type = ':',
	Value = '=',
}

export interface CodeListingProps {
	name: string;
	summary?: string | null;
	typeTokens: TokenDocumentation[];
	separator?: CodeListingSeparatorType;
	children?: ReactNode;
	className?: string | undefined;
}

export function CodeListing({
	name,
	className,
	separator = CodeListingSeparatorType.Type,
	summary,
	typeTokens,
	children,
}: CodeListingProps) {
	return (
		<div className={className}>
			<div key={name} className="ml-3 flex flex-col">
				<div className="flex w-full flex-row">
					<h4 className="my-0 font-mono dark:text-white">{`${name}`}</h4>
					<h4 className="mx-3 my-0 dark:text-white">{separator}</h4>
					<h4 className="my-0 font-mono text-blue-800 dark:text-blue-400">
						<HyperlinkedText tokens={typeTokens} />
					</h4>
				</div>
				{summary && <p className="text-dark-100 mt-2 mb-0 dark:text-gray-400">{summary}</p>}
				{children}
			</div>
		</div>
	);
}
