import React from 'react';

export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <g>
      {/* Head */}
      <rect x="8" y="2" width="8" height="11" rx="4" />
      {/* Holder */}
      <path d="M18.5,12.5c0,2.49-2.91,4.5-6.5,4.5s-6.5-2.01-6.5-4.5V11h1v1.5c0,1.93,2.46,3.5,5.5,3.5s5.5-1.57,5.5-3.5V11h1V12.5z" />
      {/* Stem */}
      <rect x="11" y="16" width="2" height="4" />
      {/* Base */}
      <rect x="7" y="20" width="10" height="2" rx="1" />
      {/* Slits */}
      <rect x="9.5" y="4.5" width="5" height="1" />
      <rect x="9.5" y="6.5" width="5" height="1" />
      <rect x="9.5" y="8.5" width="5" height="1" />
    </g>
  </svg>
);


export const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const CaptionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3.75A2.25 2.25 0 0018 1.5H6A2.25 2.25 0 003.75 3zM12 7.5h.008v.008H12V7.5zm-3 0h.008v.008H9V7.5zm6 0h.008v.008H15V7.5z" />
  </svg>
);

export const UnmuteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

export const MuteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-.95.597.055 1.043.55 1.024 1.148l-.022.383c-.074.254.113.518.384.593.27.075.562-.03.743-.245l.233-.266c.44-.503 1.226-.534 1.706-.053.48.48.507 1.255.053 1.706l-.233.266c-.215.245-.32.573-.245.885.075.312.34.55.632.593h.383c.598.02.996.53.95 1.148-.048.618-.55.996-1.148.95h-.383c-.293-.043-.557.18-.593.456-.036.27.07.562.245.743l.266.233c.503.44 1.255.507 1.706.053.48-.48.534-1.226.053-1.706l-.266-.233c-.245-.215-.573-.32-.885-.245-.312.075-.55.34-.593.632l-.043.383c-.02.598.48.996 1.148.95.618-.048.996-.55.95-1.148l-.043-.383c-.036-.293.18-.557.456-.593.27-.036.562.07.743.245l.233.266c.44.503 1.226-.534 1.706-.053.48-.48.507-1.255.053-1.706l-.233-.266c-.215-.245-.32-.573-.245-.885.075-.312.34-.55.632-.593h.383c.598-.02 1.043-.53 1.024-1.148-.02-.618-.52-.996-1.148-.95h-.383c-.293.043-.557-.18-.593-.456s.07-.562.245-.743l.266-.233c.503-.44.534-1.226.053-1.706-.48-.48-1.255-.507-1.706-.053l-.266.233c-.245.215-.573.32-.885.245-.312-.075-.55-.34-.593-.632l-.022-.383zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
  </svg>
);