import * as React from "react";
import styled from "styled-components";
import { ObjectRef } from "../lib/api/core/types.pb";
import { formatSourceURL } from "../lib/nav";
import Link from "./Link";

type Props = {
  className?: string;
  sourceRef?: ObjectRef;
  clusterName?: string;
  short?: boolean;
};

function SourceLink({ className, sourceRef, short, clusterName }: Props) {
  if (!sourceRef) {
    return <div />;
  }
  return (
    <Link
      className={className}
      to={formatSourceURL(sourceRef.kind, sourceRef.name, sourceRef.namespace, clusterName)}
    >
      {!short && sourceRef.kind + "/"}
      {sourceRef.name}
    </Link>
  );
}

export default styled(SourceLink).attrs({ className: SourceLink.name })``;
