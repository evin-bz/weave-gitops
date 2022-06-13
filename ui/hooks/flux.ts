import { useContext } from "react";
import { useQuery } from "react-query";
import { CoreClientContext } from "../contexts/CoreClientContext";
import { ListFluxRuntimeObjectsResponse } from "../lib/api/core/core.pb";
import {
  GroupVersionKind,
  UnstructuredObject,
} from "../lib/api/core/types.pb";
import { getChildren } from "../lib/graph";
import { DefaultCluster, NoNamespace, RequestError } from "../lib/types";
import { Kind } from "../hooks/objects";

export function useListFluxRuntimeObjects(
  clusterName = DefaultCluster,
  namespace = NoNamespace
) {
  const { api } = useContext(CoreClientContext);

  return useQuery<ListFluxRuntimeObjectsResponse, RequestError>(
    "flux_runtime_objects",
    () => api.ListFluxRuntimeObjects({ namespace, clusterName }),
    { retry: false, refetchInterval: 5000 }
  );
}

export function useGetReconciledObjects(
  name: string,
  namespace: string,
  type: Kind,
  kinds: GroupVersionKind[],
  clusterName = DefaultCluster
) {
  const { api } = useContext(CoreClientContext);

  return useQuery<UnstructuredObject[], RequestError>(
    ["reconciled_objects", { name, namespace, type, kinds }],
    () => getChildren(api, name, namespace, type, kinds, clusterName),
    { retry: false, refetchOnWindowFocus: false, refetchInterval: 5000 }
  );
}
