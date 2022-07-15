import _ from "lodash";
import * as React from "react";
import { useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../contexts/AppContext";
import { useListAutomations, useSyncFluxObject } from "../hooks/automations";
import { useToggleSuspend } from "../hooks/flux";
import { useGetObject } from "../hooks/objects";
import { FluxObjectKind } from "../lib/api/core/types.pb";
import { FluxObject, fluxObjectKindToKind } from "../lib/objects";
import Alert from "./Alert";
import AutomationsTable from "./AutomationsTable";
import Button from "./Button";
import DetailTitle from "./DetailTitle";
import EventsTable from "./EventsTable";
import Flex from "./Flex";
import InfoList, { InfoField } from "./InfoList";
import LoadingPage from "./LoadingPage";
import Metadata from "./Metadata";
import PageStatus from "./PageStatus";
import Spacer from "./Spacer";
import SubRouterTabs, { RouterTab } from "./SubRouterTabs";
import SyncButton from "./SyncButton";
import YamlView from "./YamlView";

type Props<T> = {
  className?: string;
  type: FluxObjectKind;
  name: string;
  namespace: string;
  clusterName: string;
  children?: JSX.Element;
  info: (s: T) => InfoField[];
};

function SourceDetail<T extends FluxObject>({
  className,
  name,
  namespace,
  clusterName,
  info,
  type,
}: Props<T>) {
  const { notifySuccess } = React.useContext(AppContext);
  const { data: automations, isLoading: automationsLoading } =
    useListAutomations();
  const { path } = useRouteMatch();
  const {
    data: source,
    isLoading,
    error,
  } = useGetObject<T>(name, namespace, fluxObjectKindToKind(type), clusterName);
  const [isSuspended, setIsSuspended] = React.useState(false);

  const suspend = useToggleSuspend(
    {
      name,
      namespace,
      clusterName,
      kind: type,
      suspend: !isSuspended,
    },
    "sources"
  );

  const sync = useSyncFluxObject({
    name,
    namespace,
    clusterName,
    kind: type,
  });

  if (isLoading || automationsLoading) {
    return <LoadingPage />;
  }

  if (isSuspended != source.suspended) {
    setIsSuspended(source.suspended);
  }

  const items = info(source);

  const isNameRelevant = (expectedName) => {
    return expectedName == name;
  };

  const isRelevant = (expectedType, expectedName) => {
    return expectedType == source.kind && isNameRelevant(expectedName);
  };

  const relevantAutomations = _.filter(automations, (a) => {
    if (!source) {
      return false;
    }
    if (a.clusterName != clusterName) {
      return false;
    }

    if (
      type == FluxObjectKind.KindHelmChart &&
      isNameRelevant(a?.helmChart?.name)
    ) {
      return true;
    }

    return (
      isRelevant(a?.sourceRef?.kind, a?.sourceRef?.name) ||
      isRelevant(a?.helmChart?.sourceRef?.kind, a?.helmChart?.sourceRef?.name)
    );
  });

  const handleSyncClicked = () => {
    sync.mutateAsync({ withSource: false }).then(() => {
      notifySuccess("Resource synced successfully");
    });
  };

  return (
    <Flex wide tall column className={className}>
      <DetailTitle name={name} type={type} />
      {error ||
        (suspend.error && (
          <Alert
            severity="error"
            title="Error"
            message={error.message || suspend.error.message}
          />
        ))}
      <PageStatus conditions={source.conditions} suspended={source.suspended} />
      <Flex wide start>
        <SyncButton
          onClick={handleSyncClicked}
          loading={sync.isLoading}
          disabled={source?.suspended}
          hideDropdown={true}
        />
        <Spacer padding="xs" />
        <Button
          onClick={() => suspend.mutateAsync()}
          loading={suspend.isLoading}
        >
          {isSuspended ? "Resume" : "Suspend"}
        </Button>
      </Flex>

      <SubRouterTabs rootPath={`${path}/details`}>
        <RouterTab name="Details" path={`${path}/details`}>
          <>
            <InfoList items={items} />
            <Metadata metadata={source?.metadata} />
            <AutomationsTable automations={relevantAutomations} hideSource />
          </>
        </RouterTab>
        <RouterTab name="Events" path={`${path}/events`}>
          <EventsTable
            namespace={source.namespace}
            involvedObject={{
              kind: type,
              name,
              namespace: source.namespace,
            }}
          />
        </RouterTab>
        <RouterTab name="yaml" path={`${path}/yaml`}>
          <YamlView
            yaml={source.yaml}
            object={{
              kind: source?.kind,
              name: source?.name,
              namespace: source?.namespace,
            }}
          />
        </RouterTab>
      </SubRouterTabs>
    </Flex>
  );
}

export default styled(SourceDetail).attrs({ className: SourceDetail.name })`
  ${PageStatus} {
    padding: ${(props) => props.theme.spacing.small} 0px;
  }
  ${SubRouterTabs} {
    margin-top: ${(props) => props.theme.spacing.medium};
  }
`;
