import type { CSSProperties } from "react";

type Props = {
	cover: string;
	subtitle: string;
	title: string;
	style?: CSSProperties;
};

export default function AnalysisCard({ cover, subtitle, title, style }: Props) {
	return (
		<div
			className="flex justify-between rounded-2xl py-10 px-8"
			style={{
				...style,
			}}
		>
			<div className="flex flex-col">
				<span className="text-base">{subtitle}</span>
				<span className="text-4xl font-bold mt-2">{title}</span>
			</div>

			<div>
				<img src={cover} alt="" />
			</div>
		</div>
	);
}
