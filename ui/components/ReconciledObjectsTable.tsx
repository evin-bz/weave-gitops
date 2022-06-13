import _ from "lodash";
import * as React from "react";
import styled from "styled-components";
import { useGetReconciledObjects } from "../hooks/flux";
import { Kind } from "../hooks/objects";
import {
  GroupVersionKind,
  UnstructuredObject,
} from "../lib/api/core/types.pb";
import { NoNamespace } from "../lib/types";
import { statusSortHelper } from "../lib/utils";
import { SortType } from "./DataTable";
import FilterableTable, {
  filterConfigForStatus,
  filterConfigForString,
} from "./FilterableTable";
import KubeStatusIndicator, { computeMessage } from "./KubeStatusIndicator";
import RequestStateHandler from "./RequestStateHandler";
export interface ReconciledVisualizationProps {
  className?: string;
  automationName: string;
  namespace?: string;
  automationKind: Kind;
  kinds: GroupVersionKind[];
  clusterName: string;
}

function ReconciledObjectsTable({
  className,
  automationName,
  namespace = NoNamespace,
  automationKind,
  kinds,
  clusterName,
}: ReconciledVisualizationProps) {
  const {
    data: objs,
    error,
    isLoading,
  } = useGetReconciledObjects(
    automationName,
    namespace,
    automationKind,
    kinds,
    clusterName
  );

  const initialFilterState = {
    ...filterConfigForString(objs, "namespace"),
    ...filterConfigForStatus(objs),
  };

  return (
    <RequestStateHandler loading={isLoading} error={error}>
      <FilterableTable
        filters={initialFilterState}
        className={className}
        fields={[
          {
            value: "name",
            label: "Name",
            maxWidth: 600,
          },
          {
            label: "Type",
            value: (u: UnstructuredObject) => u.groupVersionKind.kind,
            sortType: SortType.string,
            sortValue: (u: UnstructuredObject) => u.groupVersionKind.kind,
          },
          {
            label: "Namespace",
            value: "namespace",
            sortType: SortType.string,
            sortValue: ({ namespace }) => namespace,
          },
          {
            label: "Status",
            value: (u: UnstructuredObject) =>
              u.conditions.length > 0 ? (
                <KubeStatusIndicator
                  conditions={u.conditions}
                  suspended={u.suspended}
                  short
                />
              ) : null,
            sortType: SortType.number,
            sortValue: statusSortHelper,
          },
          {
            label: "Message",
            value: (u: UnstructuredObject) => _.first(u.conditions)?.message,
            sortType: SortType.string,
            sortValue: ({ conditions }) => computeMessage(conditions),
            maxWidth: 600,
          },
        ]}
        rows={objs}
      />
    </RequestStateHandler>
  );
}

export default styled(ReconciledObjectsTable).attrs({
  className: ReconciledObjectsTable.name,
})``;
