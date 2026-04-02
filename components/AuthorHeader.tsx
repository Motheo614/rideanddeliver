import React from 'react';
import Image from 'next/image';

interface AuthorHeaderProps {
  name?: string;
  bio?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  badges?: string[];
}

export default function AuthorHeader({
  name = 'Marcus Webb',
  bio = 'Brooklyn-based motorcycle delivery rider since 2019',
  avatarSrc = '/Assets/MarcusWebb.png',
  avatarAlt = 'Marcus Webb - Rider Complex founder',
  badges = [
    '4,000+ Hours Delivered',
    'DoorDash · Uber Eats · Grubhub',
    'Honda CB500F Rider',
  ],
}: AuthorHeaderProps) {
  return (
    <section className="flex flex-col items-center gap-5 md:flex-row md:items-center md:gap-8">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full md:h-[120px] md:w-[120px]">
        <Image
          src={avatarSrc}
          alt={avatarAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 80px, 120px"
          priority
        />
      </div>

      <div className="flex w-full flex-col items-center text-center md:items-start md:text-left">
        <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">{name}</h2>
        <p className="mt-2 text-sm text-gray-600 md:text-base">{bio}</p>

        <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
