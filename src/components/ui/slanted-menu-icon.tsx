interface SlantedMenuIconProps {
  className?: string;
}

export function SlantedMenuIcon({ className }: SlantedMenuIconProps) {
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
    >
      <rect 
        x="2" 
        y="4" 
        width="20" 
        height="2.5" 
        rx="1.25" 
        fill="currentColor" 
        transform="rotate(5 12 5.25)"
      />
      <rect 
        x="2" 
        y="10.5" 
        width="20" 
        height="2.5" 
        rx="1.25" 
        fill="currentColor" 
        transform="rotate(-2 12 11.75)"
      />
      <rect 
        x="2" 
        y="17" 
        width="14" 
        height="2.5" 
        rx="1.25" 
        fill="currentColor" 
        transform="rotate(3 9 18.25)"
      />
    </svg>
  );
}