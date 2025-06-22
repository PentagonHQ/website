import {termsOfService} from "../../../data";
import {Metadata} from "next";
import {Fragment} from "react";

export const metadata: Metadata = {
	title: "Terms of Service",
	description:
		"Our terms of service outlines the rules for using our platform.",
};

export default function TermsService() {
	return (
		<Fragment>
			<div className="p-4 sm:p-8">
				<article className="mx-auto max-w-3xl">
					<div className="mb-8 text-center">
						<time className="block mb-2 text-sm text-emerald-400/60">
							{termsOfService.effectiveDate}
						</time>
						<h1 className="text-4xl font-bold text-emerald-400">
							{termsOfService.title}
						</h1>
					</div>

					<div className="text-emerald-400/60 prose prose-invert prose-emerald max-w-none prose-p:text-emerald-400/80 prose-headings:text-emerald-400 prose-strong:text-emerald-400 prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:text-emerald-300 prose-li:text-emerald-400/80 prose-code:text-emerald-400 prose-code:bg-emerald-400/10 prose-code:rounded prose-code:px-1 prose-pre:bg-emerald-400/5 prose-pre:border prose-pre:border-emerald-400/20 [&>*]:mb-3 [&>*:last-child]:mb-0">
						<p>{termsOfService.introduction}</p>

						{termsOfService.sections.map((section) => (
							<div key={section.id} className="mb-8">
								<h2 className="text-2xl font-bold mb-4">
									{section.title}
								</h2>

								{typeof section.content === "string" ? (
									<p>{section.content}</p>
								) : Array.isArray(section.content) ? (
									<ul>
										{section.content.map((item, i) => (
											<li key={i}>{item}</li>
										))}
									</ul>
								) : null}

								{section.restrictions && (
									<ul>
										{section.restrictions.map((item, i) => (
											<li key={i}>{item}</li>
										))}
									</ul>
								)}

								{section.risks && (
									<ul>
										{section.risks.map((item, i) => (
											<li key={i}>{item}</li>
										))}
									</ul>
								)}
							</div>
						))}

						<p>{termsOfService.contact}</p>
					</div>
				</article>
			</div>
			<div className="pointer-events-none fixed inset-0 bg-scanline opacity-5"></div>
		</Fragment>
	);
}
