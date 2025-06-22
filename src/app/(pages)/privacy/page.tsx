import {privacyPolicy} from "../../../data";
import {Metadata} from "next";
import {Fragment} from "react";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "Our privacy policy outlines how we handle your data.",
};

export default function PrivacyPolicy() {
	return (
		<Fragment>
			<div className="p-4 sm:p-8">
				<article className="mx-auto max-w-3xl">
					<div className="mb-8 text-center">
						<time className="block mb-2 text-sm text-emerald-400/60">
							{privacyPolicy.effectiveDate}
						</time>
						<h1 className="text-4xl font-bold text-emerald-400">
							{privacyPolicy.title}
						</h1>
					</div>

					<div className="text-emerald-400/60 prose prose-invert prose-emerald max-w-none prose-p:text-emerald-400/80 prose-headings:text-emerald-400 prose-strong:text-emerald-400 prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:text-emerald-300 prose-li:text-emerald-400/80 prose-code:text-emerald-400 prose-code:bg-emerald-400/10 prose-code:rounded prose-code:px-1 prose-pre:bg-emerald-400/5 prose-pre:border prose-pre:border-emerald-400/20 [&>*]:mb-3 [&>*:last-child]:mb-0">
						<p>{privacyPolicy.introduction}</p>

						{privacyPolicy.sections.map((section) => (
							<div key={section.id} className="mb-8">
								<h2 className="text-2xl font-bold mb-4">
									{section.title}
								</h2>

								{typeof section.content === "string" ? (
									<p>{section.content}</p>
								) : section.content?.intro ? (
									<>
										<p>{section.content.intro}</p>
										{section.content.terms && (
											<ul>
												{section.content.terms.map(
													(term, i) => (
														<li
															key={i}
															className="mb-2"
														>
															<strong>
																{term.term}
															</strong>
															: {term.definition}
														</li>
													)
												)}
											</ul>
										)}
										{section.content.points && (
											<ul>
												{section.content.points.map(
													(point, i) => (
														<li key={i}>{point}</li>
													)
												)}
											</ul>
										)}
										{section.content.disclaimers && (
											<ul>
												{section.content.disclaimers.map(
													(disclaimer, i) => (
														<li key={i}>
															{disclaimer}
														</li>
													)
												)}
											</ul>
										)}
									</>
								) : Array.isArray(section.content) ? (
									<ul>
										{section.content.map((item, i) => (
											<li key={i}>{item}</li>
										))}
									</ul>
								) : null}

								{section.subsections?.map((subsection, i) => (
									<div key={i} className="mt-4">
										<h3 className="text-xl font-semibold mb-2">
											{subsection.title}
										</h3>
										<ul>
											{subsection.items.map((item, j) => (
												<li key={j}>{item}</li>
											))}
										</ul>
									</div>
								))}

								{typeof section.content === "object" &&
									section.content?.rights && (
										<>
											<p>{section.content.intro}</p>
											<ul>
												{section.content.rights.map(
													(right, i) => (
														<li
															key={i}
															className="mb-2"
														>
															<strong>
																{right.name}
															</strong>
															:{" "}
															{right.description}
														</li>
													)
												)}
											</ul>
											<p>{section.content.contact}</p>
										</>
									)}
							</div>
						))}
					</div>
				</article>
			</div>
			<div className="pointer-events-none fixed inset-0 bg-scanline opacity-5"></div>
		</Fragment>
	);
}
