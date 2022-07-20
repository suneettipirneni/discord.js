import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import logo from '../assets/djs_logo_rainbow_400x400.png';
import { codeSampleText } from '../assets/sample-code';
import * as text from '../text.json';

interface ButtonProps {
	title: string;
}

function Button({ title }: ButtonProps) {
	return (
		<div className="bg-blurple max-h-[70px] rounded-lg px-3 py-4">
			<p className="m-0 font-semibold text-white">{title}</p>
		</div>
	);
}

export default function IndexRoute() {
	return (
		<main className="dark:bg-dark h-full max-h-full w-full max-w-full flex-col overflow-y-auto bg-white">
			<div className="dark:bg-dark sticky top-0 flex h-[65px] justify-center border-b border-slate-300 bg-white px-10">
				<div className="align-center flex w-full max-w-[1100px] items-center justify-between">
					<div className="h-[50px] w-[50px] overflow-hidden rounded-lg">
						<img className="h-[50px] w-[50px]" src={logo} />
					</div>
					<div className="flex flex-row space-x-8">
						<a className="text-blurple font-semibold">Docs</a>
						<a className="text-blurple font-semibold">Guide</a>
					</div>
				</div>
			</div>
			<div className="box-border w-full max-w-full px-10 xl:flex xl:justify-center">
				<div className="mt-10 flex max-w-[1100px] grow flex-col place-items-center space-y-10 pb-10 xl:flex-row xl:space-x-20">
					<div className="lt-xl:items-center flex max-w-[800px] flex-col">
						<h1 className="text-blurple mb-2 text-6xl font-extrabold">{text.heroTitle}</h1>
						<p className="text-dark-100 text-xl dark:text-gray-400">{text.heroDescription}</p>
						<div className="flew-row flex space-x-4">
							<Button title="Read the guide" />
							<Button title="Check out the docs" />
						</div>
					</div>
					<div className="sm:align-center hidden h-full sm:flex sm:shrink sm:grow xl:items-center">
						<SyntaxHighlighter
							className="rounded-3xl shadow-2xl"
							wrapLines
							showLineNumbers
							language="typescript"
							style={vscDarkPlus}
							codeTagProps={{ style: { fontFamily: 'JetBrains Mono', paddingTop: '100px' } }}
						>
							{codeSampleText}
						</SyntaxHighlighter>
					</div>
				</div>
			</div>
		</main>
	);
}
