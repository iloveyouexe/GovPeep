import { Link } from "react-router-dom";
import { ScanEye } from "lucide-react";
import { brand } from "@govpeep/contracts";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="brand" aria-label={`${brand.name} home`}>
      <span className="brand-icon">
        <ScanEye size={23} />
      </span>
      {brand.name}
      <span className="brand-dot">.</span>
    </Link>
  );
}
