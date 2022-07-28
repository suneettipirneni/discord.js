import { FiLink } from 'react-icons/fi';
import { RemarksBlock } from './Comment';
import { HyperlinkedText } from './HyperlinkedText';
import { ParameterTable } from './ParameterTable';
import { Section } from './Section';
import type { DocMethod } from '~/DocModel/DocMethod';
import type { DocMethodSignature } from '~/DocModel/DocMethodSignature';

type MethodResolvable = ReturnType<DocMethod['toJSON']> | ReturnType<DocMethodSignature['toJSON']>;

export interface MethodItemProps {
	data: MethodResolvable;
}

function getShorthandName(data: MethodResolvable) {
	return `${data.name}(${data.parameters.reduce((prev, cur, index) => {
		if (index === 0) {
			return `${prev}${cur.name}`;
		}

		return `${prev}, ${cur.name}`;
	}, '')})`;
}

function onAnchorClick() {
	console.log('anchor clicked');
	// Todo implement jump-to links
}

export function MethodItem({ data }: MethodItemProps) {
	return (
		<div className="flex flex-col">
			{data.remarks && (
				<Section title="Remarks">
					<RemarksBlock node={data.remarks} />
				</Section>
			)}
			<div className="flex">
				<button className="bg-transparent border-none cursor-pointer dark:text-white" onClick={onAnchorClick}>
					<FiLink size={16} />
				</button>

				<div className="flex flex-col">
					<div className="w-full flex flex-row gap-3">
						<h4 className="font-mono m-0 break-all">{`${getShorthandName(data)}`}</h4>
						<h4 className="m-0">:</h4>
						<h4 className="font-mono m-0 break-all">
							<HyperlinkedText tokens={data.returnTypeTokens} />
						</h4>
					</div>
				</div>
			</div>
			<div className="mx-7 mb-5">
				{data.summary && <p className="text-dark-100 dark:text-gray-300">{data.summary}</p>}
				{data.parameters.length ? <ParameterTable data={data.parameters} /> : null}
			</div>
		</div>
	);
}
