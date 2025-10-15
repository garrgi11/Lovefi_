interface SocialIconProps {
  onClick?: () => void;
  className?: string;
}

export function FacebookIcon({ onClick, className = "" }: SocialIconProps) {
  return (
    <button
      onClick={onClick}
      className={`w-16 h-16 rounded-2xl border border-lovefi-border bg-white flex items-center justify-center transition-colors hover:bg-gray-50 ${className}`}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M28.4544 2H3.54562C2.69214 2.00034 2.00034 2.69214 2 3.54562V28.4544C2.00034 29.3079 2.69214 29.9997 3.54562 30H16V19H12.6531V15H16V11.8125C16 8.19625 18.5081 6.2275 21.7388 6.2275C23.2844 6.2275 24.9469 6.34375 25.3331 6.395V10.1719H22.7594C21.0019 10.1719 20.6669 11.0031 20.6669 12.2281V15H24.8544L24.3075 19H20.6669V30H28.4544C29.3079 29.9997 29.9997 29.3079 30 28.4544V3.54562C29.9997 2.69214 29.3079 2.00034 28.4544 2Z"
          fill="#405FE9"
        />
      </svg>
    </button>
  );
}

export function GoogleIcon({ onClick, className = "" }: SocialIconProps) {
  return (
    <button
      onClick={onClick}
      className={`w-16 h-16 rounded-2xl border border-lovefi-border bg-white flex items-center justify-center transition-colors hover:bg-gray-50 ${className}`}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M29.5725 13.8425L29.4312 13.2431H16.4038V18.7569H24.1875C23.3794 22.5944 19.6294 24.6144 16.5662 24.6144C14.3375 24.6144 11.9881 23.6769 10.4331 22.17C8.77617 20.5387 7.83623 18.3152 7.82062 15.99C7.82062 13.6675 8.86438 11.3444 10.3831 9.81625C11.9019 8.28813 14.1956 7.43313 16.4762 7.43313C19.0881 7.43313 20.96 8.82 21.66 9.4525L25.5781 5.555C24.4287 4.545 21.2712 2 16.35 2C12.5531 2 8.9125 3.45438 6.25125 6.10687C3.625 8.71875 2.26562 12.4956 2.26562 16C2.26562 19.5044 3.55187 23.0925 6.09687 25.725C8.81625 28.5325 12.6675 30 16.6331 30C20.2413 30 23.6612 28.5863 26.0987 26.0212C28.495 23.4963 29.7344 20.0025 29.7344 16.34C29.7344 14.7981 29.5794 13.8825 29.5725 13.8425Z"
          fill="#E94057"
        />
      </svg>
    </button>
  );
}

export function AppleIcon({ onClick, className = "" }: SocialIconProps) {
  return (
    <button
      onClick={onClick}
      className={`w-16 h-16 rounded-2xl border border-lovefi-border bg-white flex items-center justify-center transition-colors hover:bg-gray-50 ${className}`}
    >
      <svg
        width="24"
        height="28"
        viewBox="0 0 25 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17.8771 6.55664C19.7814 6.55664 21.8019 7.59846 23.2394 9.39844C18.53 11.9866 19.2949 18.7374 24.0568 20.5449C23.4068 22.0041 23.0916 22.6517 22.2443 23.9414C21.0668 25.7352 19.4093 27.9732 17.3468 27.9951H17.3097C15.5248 27.9951 15.0372 26.8146 12.6075 26.8145H12.5695C10.1028 26.8283 9.56991 28.002 7.77747 28.002H7.74036C5.67791 27.9801 4.10535 25.9607 2.92786 24.1602C-0.363954 19.1303 -0.709003 13.2259 1.32336 10.0908C2.77082 7.86777 5.05018 6.56258 7.18762 6.5625C9.37123 6.5625 10.7439 7.7557 12.5431 7.75586C14.2981 7.75586 15.3639 6.55371 17.8839 6.55371L17.8771 6.55664ZM17.3282 0C17.5832 1.70558 16.8859 3.36789 15.9659 4.54102C15.0109 5.77352 13.3759 6.73535 11.7784 6.73535H11.6583C11.3585 5.10982 12.1239 3.43364 13.0538 2.30371C14.0788 1.057 15.8284 0.101982 17.3282 0Z"
          fill="black"
        />
      </svg>
    </button>
  );
}

interface SocialLoginProps {
  onFacebookClick?: () => void;
  onGoogleClick?: () => void;
  onAppleClick?: () => void;
  className?: string;
}

export default function SocialLogin({
  onFacebookClick,
  onGoogleClick,
  onAppleClick,
  className = "",
}: SocialLoginProps) {
  return (
    <div className={`flex items-center justify-center gap-6 ${className}`}>
      <FacebookIcon onClick={onFacebookClick} />
      <GoogleIcon onClick={onGoogleClick} />
      <AppleIcon onClick={onAppleClick} />
    </div>
  );
}
