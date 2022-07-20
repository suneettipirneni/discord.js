import type { TokenDocumentation } from '~/util/parse.server';

export interface HyperlinkedTextProps {
	/**
	 * The tokens to render.
	 */
	tokens: TokenDocumentation[];
}

/**
 * Constructs a hyperlinked html node based on token type references.
 */
export function HyperlinkedText({ tokens }: HyperlinkedTextProps) {
	return (
		<>
			{tokens.map((token) => {
				if (token.path) {
					return (
						<a className="color-blurple" key={token.text} href={token.path}>
							{token.text}
						</a>
					);
				}

				return token.text;
			})}
		</>
	);
}
