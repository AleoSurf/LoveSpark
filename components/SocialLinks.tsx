import React from 'react';

const socials = [
  {
    id: 'github',
    href: 'https://github.com/AleoSurf',
    label: 'GitHub',
    iconSrc: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
  },
  {
    id: 'discord',
    href: 'https://discord.gg/GYCqzy5n',
    label: 'Discord',
    iconSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSvQSo64weeAlpUwYBIBKt76KoHjdxDSpEGg&s',
  },
  {
    id: 'x',
    href: 'https://x.com/leo175456',
    label: 'X',
    iconSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB4yaLG6-0uQFk4G6D229SceAtgBbHSdSpwQ&s',
  },
];

const SocialLinks: React.FC = () => {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {socials.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          title={item.label}
          aria-label={item.label}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 border border-blue-100 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <span className="w-[%] h-[%] flex items-center justify-center">
            <img
              src={item.iconSrc}
              alt=""
              className="w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </span>
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
