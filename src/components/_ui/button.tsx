import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1 whitespace-nowrap font-medium tracking-[-0.02em] outline-none transition-[background-color,color,box-shadow,opacity] duration-150 ease-power2-out focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "rounded-[10px] bg-primary text-primary-foreground shadow-[0_0_0_1px_var(--primary)] hover:bg-[#2b2b2b] hover:shadow-[0_0_0_1px_#2b2b2b]",
        secondary:
          "rounded-[10px] bg-white text-muted-foreground shadow-control hover:bg-secondary hover:text-foreground data-[active=true]:bg-secondary data-[active=true]:text-foreground",
        ghost:
          "rounded-lg text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground data-[active=true]:bg-foreground/[0.05] data-[active=true]:text-foreground",
        chip: "rounded-full bg-white text-muted-foreground shadow-ring hover:text-foreground hover:shadow-[0_0_0_1px_#d6d6d6] data-[active=true]:text-foreground data-[active=true]:shadow-[0_0_0_1px_var(--foreground)]",
        danger:
          "rounded-lg text-danger hover:bg-danger/[0.06] data-[active=true]:bg-danger data-[active=true]:text-white",
      },
      size: {
        xs: "size-6 rounded-md",
        sm: "h-7 px-2 text-[13px]",
        md: "h-[30px] px-2 text-[14px]",
        lg: "h-10 px-3.5 text-[14px]",
        icon: "size-[30px]",
      },
    },
  },
);

type ButtonProps = VariantProps<typeof buttonVariants> &
  ComponentProps<"button"> & {
    href?: ComponentProps<typeof Link>["href"];
  };

export default function Button({
  variant,
  size,
  className,
  href,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as Omit<ComponentProps<typeof Link>, "href" | "className">)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
