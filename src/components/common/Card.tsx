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
}

export default function Card({
  title,
  children,
  className = "",
  actions
}: CardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded p-4 shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-base font-medium text-slate-900">{title}</h3>}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
