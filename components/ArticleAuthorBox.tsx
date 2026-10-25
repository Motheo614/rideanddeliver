"use client";

import React, { useId, useState } from 'react';
import { Calendar, ChevronDown, Clock } from 'lucide-react';

interface ArticleAuthorBoxProps {
  className?: string;
  publishedLabel?: string;
  readTimeLabel?: string;
  updatedLabel?: string;
}

export default function ArticleAuthorBox({
  className = '',
  publishedLabel,
  readTimeLabel,
  updatedLabel,
}: ArticleAuthorBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bioId = useId();

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm ${className}`.trim()}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={bioId}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="text-lg font-extrabold leading-tight text-gray-900">Written by Marcus Webb</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              {isOpen ? 'Hide Author Bio' : 'Read Author Bio'}
            </p>
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div id={bioId} className="mt-3 border-t border-gray-200 pt-3 text-sm leading-relaxed text-gray-600">
          <p className="font-semibold text-gray-800">A Word from Marcus Webb</p>
          <p className="mt-1">
            Marcus Webb is a food delivery enthusiast focused on the gear, bikes, accessories, and
            tools that make delivery work more practical. He researches products through
            manufacturer documentation, independent reviews, and owner feedback, then translates
            that evidence into clear buying advice for delivery riders.
          </p>
          <p className="mt-2">
            His approach is straightforward: explain what the evidence supports, identify the
            trade-offs, and be honest about what hasn&apos;t been verified. Rider Complex publishes
            research-based assessments rather than claiming hands-on tests that haven&apos;t taken
            place.
          </p>
        </div>
      )}

      {(publishedLabel || readTimeLabel || updatedLabel) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3 text-xs font-medium text-gray-500 sm:text-sm">
          {publishedLabel && (
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} className="text-gray-400" />
              {publishedLabel}
            </span>
          )}
          {publishedLabel && readTimeLabel && <span className="text-gray-300" aria-hidden="true">•</span>}
          {readTimeLabel && (
            <span className="inline-flex items-center gap-1">
              <Clock size={12} className="text-gray-400" />
              {readTimeLabel}
            </span>
          )}
          {(publishedLabel || readTimeLabel) && updatedLabel && <span className="text-gray-300" aria-hidden="true">•</span>}
          {updatedLabel && (
            <span className="inline-flex items-center gap-1">
              Last updated: {updatedLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
