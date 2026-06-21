"use client";

import React, { useId, useState } from 'react';
import Image from 'next/image';
import { Calendar, ChevronDown, Clock } from 'lucide-react';

interface ArticleAuthorBoxProps {
  className?: string;
  publishedLabel?: string;
  readTimeLabel?: string;
}

export default function ArticleAuthorBox({
  className = '',
  publishedLabel,
  readTimeLabel,
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
          <Image
            src="/Assets/MarcusWebb.png"
            alt="Marcus Webb - Rider Complex founder"
            width={60}
            height={60}
            className="h-[60px] w-[60px] rounded-full object-cover"
          />
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
            I&apos;ve spent years exploring the gig economy from the rider&apos;s side, testing different
            setups, vehicles, and tools to figure out what actually works on the road.
          </p>
          <p className="mt-2">
            From motorcycles and e-bikes to rental options and delivery gear, the focus is always
            the same: what holds up during long shifts and what keeps riders efficient without
            burning through money they just earned.
          </p>
          <p className="mt-2">
            My writing is centered around that idea. Practical insights, smarter decisions, and
            setups that support consistent earnings on the road.
          </p>
        </div>
      )}

      {(publishedLabel || readTimeLabel) && (
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
        </div>
      )}
    </div>
  );
}
