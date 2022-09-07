import * as React from "react";
import styled from "styled-components";
import { Automation } from "../hooks/automations";
import { useListObjects } from "../hooks/objects";
import useNavigation from "../hooks/navigation";
import {
  fluxObjectKindToKind,
  FluxObject,
  FluxObjectNode,
  FluxObjectNodePlaceholder,
} from "../lib/objects";
import Button from "./Button";
import Flex from "./Flex";
import Icon, { IconType } from "./Icon";
import DirectedGraph from "./DirectedGraph";
import RequestStateHandler from "./RequestStateHandler";

function Message() {
  const { navigate } = useNavigation();

  return (
    <Flex column align center shadow>
      <h1>No Dependencies</h1>

      <p>
        There are no dependencies set up for your kustomizations or helm
        releases at this time. You can set them up using the dependsOn field on
        the kustomization or helm release object.
      </p>

      <h1>What are depedencies for?</h1>

      <p>
        Dependencies allow you to relate different kustomizations and helm
        releases, as well as specifying an order in which your resources should
        be started. For example, you can wait for a database to report as
        'Ready' before attempting to deploy other services.
      </p>

      <Button
        startIcon={<Icon type={IconType.AddIcon} size="base" />}
        onClick={() =>
          navigate.external(
            "https://fluxcd.io/flux/components/kustomize/kustomization/#kustomization-dependencies"
          )
        }
      >
        Learn More
      </Button>
    </Flex>
  );
}

type Props = {
  className?: string;
  automation?: Automation;
};

function DependenciesView({ className, automation }: Props) {
  const [rootNode, setRootNode] = React.useState<
    FluxObjectNode | FluxObjectNodePlaceholder
  >(null);

  const automationKind = automation?.kind;

  const {
    data,
    isLoading: isLoadingData,
    error,
  } = automation
    ? useListObjects("", fluxObjectKindToKind(automationKind))
    : { data: { objects: [], errors: [] }, error: null, isLoading: false };

  React.useEffect(() => {
    if (isLoadingData) {
      return;
    }

    if (error || data?.errors?.length > 0) {
      const rootNode: FluxObjectNodePlaceholder = {
        children: [],
      };
      setRootNode(rootNode);
      return;
    }

    const objects = data.objects;

    const fluxObject: FluxObject = objects[0] as FluxObject;

    const children: FluxObjectNode[] = objects
      .slice(1)
      .map((o) => new FluxObjectNode(o));

    const rootNode = new FluxObjectNode(fluxObject, children);

    setRootNode(rootNode);
  }, [isLoadingData, data, error]);

  const isLoading = isLoadingData || !rootNode;

  const shouldShowGraph = rootNode?.children?.length > 0;

  return (
    <RequestStateHandler loading={isLoading} error={error}>
      {!isLoading && (
        <>
          {shouldShowGraph ? (
            <DirectedGraph className={className} rootNode={rootNode} />
          ) : (
            <Message />
          )}
        </>
      )}
    </RequestStateHandler>
  );
}

export default styled(DependenciesView).attrs({
  className: DependenciesView.name,
})``;
