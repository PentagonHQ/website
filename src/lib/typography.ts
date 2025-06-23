import { cva } from "class-variance-authority";

export const typography = cva("", {
  variants: {
    variant: {
      h1: "text-4xl font-bold tracking-wider md:text-5xl",
      h2: "text-3xl font-semibold tracking-tight md:text-4xl",
      h3: "text-2xl font-semibold tracking-tight md:text-3xl",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      ul: "my-6 ml-6 list-disc [&>li]:mt-2",
      inlineCode: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground tracking-wider",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});
