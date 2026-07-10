import Image from 'next/image';
import Link from 'next/link';

interface BizilotLogoProps {
  /**
   * 'full'  — wide horizontal lockup (Bizilot_Shipment.png) with rounded white bg
   * 'icon'  — just the B mark (Bizilot_ShortLogo.png) with rounded white bg
   */
  variant?: 'full' | 'icon';
  /** Height of the logo container in px. Width scales automatically. Default: 40 */
  height?: number;
  /** Make the logo a link to the home page. Default: true */
  linked?: boolean;
  /** Additional class names for the wrapper */
  className?: string;
}

export function BizilotLogo({
  variant = 'full',
  height = 40,
  linked = true,
  className = '',
}: BizilotLogoProps) {
  const isIcon = variant === 'icon';
  const borderRadius = Math.round(height * 0.22); // proportional rounding
  const padding = Math.round(height * 0.08);

  const content = (
    <div
      className={`flex-shrink-0 bg-white inline-flex items-center justify-center overflow-hidden ${className}`}
      style={{
        height: height,
        borderRadius,
      }}
    >
      <img
        src={isIcon ? '/Bizilot_ShortLogo.png' : '/Bizilot_Shipment.png'}
        alt="Bizilot Shipment"
        style={{ height: '100%', width: 'auto', display: 'block', objectFit: 'cover' }}
      />
    </div>
  );

  if (linked) {
    return (
      <Link href="/" className="inline-flex items-center hover:opacity-85 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
