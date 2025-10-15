interface LovefiLogoProps {
  size?: number;
  className?: string;
}

export default function LovefiLogo({
  size = 275,
  className = "",
}: LovefiLogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo Icon */}
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F8c18a9488b6848ba863d1cffa2cdf555%2F48432ed087254ac697ebf59cd465f8be?format=webp&width=800"
        alt="LoveFi Logo"
        width={size}
        height={size}
        className="w-full h-auto"
      />

      {/* LoveFi Text */}
      <h1 className="text-3xl sm:text-4xl font-alata font-normal mt-4 bg-gradient-to-r from-lovefi-purple to-lovefi-purple-pink bg-clip-text text-transparent">
        LoveFi
      </h1>
    </div>
  );
}
