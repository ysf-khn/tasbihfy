"use client";


interface PageHeaderProps {
  title?: string;
  rightContent?: React.ReactNode;
  fixed?: boolean;
  glassmorphism?: boolean;
}

export default function PageHeader({ 
  title = "Tasbihfy", 
  rightContent,
  fixed = false,
  glassmorphism = false
}: PageHeaderProps) {
  const baseClasses = "flex justify-between items-center p-4 sm:p-6";
  const positionClasses = fixed ? "sticky top-0 z-40" : "";
  const styleClasses = glassmorphism 
    ? "bg-base-100/80 backdrop-blur-md border-b border-base-200/20" 
    : "bg-base-100 shadow-sm";

  return (
    <div className={`${baseClasses} ${styleClasses} ${positionClasses}`.trim()}>
      <h1 className="text-xl sm:text-2xl font-bold text-base-content">{title}</h1>
      {rightContent}
    </div>
  );
}