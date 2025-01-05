type Props = {
  size?: number;
};

export function SearchIcon() {
  return (
    <svg width="30" height="24" viewBox="0 0 25 25">
      <path
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-miterlimit="10"
        fill="none"
        d="M23.75 23.75l-9-9"
      />
      <circle
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-miterlimit="10"
        cx="9"
        cy="9"
        r="7.75"
        fill="none"
      />
      <path fill="none" d="M25 25h-25v-25h25z" />
    </svg>
  );
}

export function WallpaperIcon({ size = 24 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 6.3A3.3 3.3 0 0 1 6.3 3H10a1 1 0 1 1 0 2H6.2C5.7 5 5 5.6 5 6.3V10a1 1 0 1 1-2 0V6.2ZM13 4a1 1 0 0 1 1-1h3.8A3.2 3.2 0 0 1 21 6.3V10a1 1 0 0 1-2 0V6.2c0-.6-.6-1.2-1.3-1.2H14a1 1 0 0 1-1-1Zm-9 9a1 1 0 0 1 1 1v3.6L9.5 13a3.5 3.5 0 0 1 5 0l4.5 4.5V14a1 1 0 0 1 2 0v3.8a3.2 3.2 0 0 1-3.3 3.2H14a1 1 0 0 1 0-2h3.6L13 14.5a1.5 1.5 0 0 0-2.2 0L6.4 19H10a1 1 0 0 1 0 2H6.2A3.2 3.2 0 0 1 3 17.7V14a1 1 0 0 1 1-1Zm13.5-4.3a2.3 2.3 0 1 1-4.5 0 2.3 2.3 0 0 1 4.5 0Z"
        fill="currentColor"
      />
    </svg>
  );
}
