import _ from "lodash";
import * as React from "react";
import styled from "styled-components";
import { Automation } from "../hooks/automations";
import { FluxObjectKind, HelmRelease } from "../lib/api/core/types.pb";
import { formatURL } from "../lib/nav";
import { V2Routes } from "../lib/types";
import { statusSortHelper, removeKind } from "../lib/utils";
import { Field, SortType } from "./DataTable";
import { filterConfig, filterByStatusCallback } from "./FilterableTable";
import KubeStatusIndicator, { computeMessage } from "./KubeStatusIndicator";
import Link from "./Link";
import SourceLink from "./SourceLink";
import Timestamp from "./Timestamp";
import URLAddressableTable from "./URLAddressableTable";

type Props = {
  className?: string;
  automations?: Automation[];
  appName?: string;
  hideSource?: boolean;
};

function AutomationsTable({ className, automations, hideSource }: Props) {
  automations = automations.map((a) => {
    return { ...a, type: removeKind(a.kind) };
  });
  const initialFilterState = {
    ...filterConfig(automations, "type"),
    ...filterConfig(automations, "namespace"),
    ...filterConfig(automations, "clusterName"),
    ...filterConfig(automations, "status", filterByStatusCallback),
  };

  let fields: Field[] = [
    {
      label: "Name",
      value: (k) => {
        const route =
          k.kind === FluxObjectKind.KindKustomization
            ? V2Routes.Kustomization
            : V2Routes.HelmRelease;
        return (
          <Link
            to={formatURL(route, {
              name: k.name,
              namespace: k.namespace,
              clusterName: k.clusterName,
            })}
          >
            {k.name}
          </Link>
        );
      },
      sortValue: ({ name }) => name,
      textSearchable: true,
      maxWidth: 600,
    },
    {
      label: "Type",
      value: "type",
    },
    {
      label: "Namespace",
      value: "namespace",
    },
    {
      label: "Cluster",
      value: "clusterName",
    },
    {
      label: "Source",
      value: (a: Automation) => {
        let sourceKind: FluxObjectKind;
        let sourceName: string;
        let sourceNamespace: string;

        if (a.kind === FluxObjectKind.KindKustomization) {
          sourceKind = a.sourceRef?.kind;
          sourceName = a.sourceRef?.name;
          sourceNamespace = a.sourceRef?.namespace;
        } else {
          const hr = a as HelmRelease;
          sourceKind = FluxObjectKind.KindHelmChart;
          sourceName = hr.helmChart.name;
          sourceNamespace = hr.helmChart.namespace;
        }

        return (
          <SourceLink
            short
            sourceRef={{
              kind: sourceKind,
              name: sourceName,
              namespace: sourceNamespace,
            }}
            clusterName={a.clusterName}
          />
        );
      },
      sortValue: (a: Automation) => a.sourceRef?.name,
    },
    {
      label: "Status",
      value: (a: Automation) =>
        a.conditions.length > 0 ? (
          <KubeStatusIndicator
            short
            conditions={a.conditions}
            suspended={a.suspended}
          />
        ) : null,
      sortType: SortType.number,
      sortValue: statusSortHelper,
    },
    {
      label: "Message",
      value: (a: Automation) => computeMessage(a.conditions),
      sortValue: ({ conditions }) => computeMessage(conditions),
      maxWidth: 600,
    },
    {
      label: "Revision",
      value: "lastAttemptedRevision",
    },
    {
      label: "Last Updated",
      value: (a: Automation) => (
        <Timestamp
          time={_.get(_.find(a.conditions, { type: "Ready" }), "timestamp")}
        />
      ),
    },
  ];

  if (hideSource) fields = _.filter(fields, (f) => f.label !== "Source");

  return (
    <URLAddressableTable
      fields={fields}
      filters={initialFilterState}
      rows={automations}
      className={className}
    />
  );
}

export default styled(AutomationsTable).attrs({
  className: AutomationsTable.name,
})`
  td:nth-child(7) {
    white-space: pre-wrap;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
`;
