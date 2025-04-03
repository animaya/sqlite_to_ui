/**
 * Card Component
 * 
 * A container component for grouping related content.
 */

import { JSX } from "preact";

interface CardProps {
  title?: string;
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
  actions?: JSX.Element | JSX.Element[];
  headerClassName?: string;
  bodyClassName?: string;
}

export default function Card({
  title,
  children,
  className = "",
  actions,
  headerClassName = "",
  bodyClassName = ""
}: CardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded shadow-sm ${className}`}>
      {(title || actions) && (
        <div className={`flex justify-between items-center px-4 py-3 border-b border-slate-200 ${headerClassName}`}>
          {title && <h3 className="text-base font-medium text-slate-900">{title}</h3>}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

/**
 * Card.Header component
 */
export function CardHeader({ 
  children, 
  className = "" 
}: { 
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}) {
  return (
    <div className={`flex justify-between items-center px-4 py-3 border-b border-slate-200 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card.Body component
 */
export function CardBody({ 
  children, 
  className = "" 
}: { 
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card.Footer component
 */
export function CardFooter({ 
  children, 
  className = "" 
}: { 
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}) {
  return (
    <div className={`px-4 py-3 border-t border-slate-200 ${className}`}>
      {children}
    </div>
  );
}

// Attach subcomponents to Card
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
