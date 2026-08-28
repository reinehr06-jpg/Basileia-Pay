export function Card({ children, className = '', title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-border shadow-sm ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-border/50">
          <h3 className="text-[13px] font-black text-ink uppercase tracking-tight">{title}</h3>
        </div>
      )}
      <div className={title ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 py-4 border-b border-border/50 ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-[13px] font-black text-ink uppercase tracking-tight ${className}`}>{children}</h3>;
}
export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 py-4 border-t border-border/50 ${className}`}>{children}</div>;
}
