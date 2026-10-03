import { useState } from "react";
import { Building2 } from "lucide-react";
import type { Entity } from "@govpeep/contracts";

export function EntityLogo({
  entity,
}: {
  entity: Pick<Entity, "name" | "logoPath">;
}) {
  const [failedPath, setFailedPath] = useState<string | null>(null);
  const path = entity.logoPath;
  return (
    <div className="entity-icon entity-logo">
      {path && path !== failedPath ? (
        <img
          src={path}
          alt={`${entity.name} logo`}
          loading="lazy"
          width="32"
          height="32"
          onError={() => setFailedPath(path)}
        />
      ) : (
        <Building2 size={22} aria-hidden="true" />
      )}
    </div>
  );
}
