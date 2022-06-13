import * as React from "react";
import { useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../contexts/AppContext";
import { useSyncAutomation } from "../hooks/automations";
import { Automation } from "../hooks/objects";
import Alert from "./Alert";
import DetailTitle from "./DetailTitle";
import EventsTable from "./EventsTable";
import Flex from "./Flex";
import InfoList, { InfoField } from "./InfoList";
import PageStatus from "./PageStatus";
import ReconciledObjectsTable from "./ReconciledObjectsTable";
import ReconciliationGraph from "./ReconciliationGraph";
import SubRouterTabs, { RouterTab } from "./SubRouterTabs";
import SyncButton from "./SyncButton";
import Metadata from "./Metadata";

type Props = {
  automation?: Automation;
  className?: string;
  info: InfoField[];
};

const TabContent = styled(Flex)`
  margin-top: ${(props) => props.theme.spacing.medium};
  width: 100%;
  height: 100%;
`;

function AutomationDetail({ automation, className, info }: Props) {
  const { notifySuccess } = React.useContext(AppContext);
  const { path } = useRouteMatch();

  const sync = useSyncAutomation({
    name: automation?.name(),
    namespace: automation?.namespace(),
    clusterName: automation?.clusterName(),
    kind: automation?.kind(),
  });

  const handleSyncClicked = (opts) => {
    sync.mutateAsync(opts).then(() => {
      notifySuccess("Resource synced successfully");
    });
  };

  return (
    <Flex wide tall column className={className}>
      <DetailTitle name={automation?.name()} type={automation?.kind()} />
      {sync.isError && (
        <Alert
          severity="error"
          message={sync.error.message}
          title="Sync Error"
        />
      )}
      <PageStatus
        conditions={automation?.conditions()}
        suspended={automation?.suspended()}
      />
      <SyncButton
        onClick={handleSyncClicked}
        loading={sync.isLoading}
        disabled={automation?.suspended()}
      />
      <TabContent>
        <SubRouterTabs rootPath={`${path}/details`}>
          <RouterTab name="Details" path={`${path}/details`}>
            <>
              <InfoList items={info} />
              <Metadata metadata={automation.metadata()} />
              <ReconciledObjectsTable
                automationKind={automation?.kind()}
                automationName={automation?.name()}
                namespace={automation?.namespace()}
                kinds={automation?.inventory()}
                clusterName={automation?.clusterName()}
              />
            </>
          </RouterTab>
          <RouterTab name="Events" path={`${path}/events`}>
            <EventsTable
              namespace={automation?.namespace()}
              involvedObject={{
                kind: 'Kind' + automation?.kind(),
                name: automation?.name(),
                namespace: automation?.namespace(),
              }}
            />
          </RouterTab>
          <RouterTab name="Graph" path={`${path}/graph`}>
            <ReconciliationGraph
              automationKind={automation?.kind()}
              automationName={automation?.name()}
              kinds={automation?.inventory()}
              parentObject={{
                name: automation?.name(),
                namespace: automation?.namespace(),
                conditions: automation?.conditions(),
                suspended: automation?.suspended()
              }}
              clusterName={automation?.clusterName()}
              source={automation?.sourceRef()}
            />
          </RouterTab>
          <RouterTab name="Yaml" path={`${path}/yaml`}>
            <pre>{automation.yaml()}</pre>
          </RouterTab>
        </SubRouterTabs>
      </TabContent>
    </Flex>
  );
}

export default styled(AutomationDetail).attrs({
  className: AutomationDetail.name,
})`
  width: 100%;

  ${PageStatus} {
    padding: ${(props) => props.theme.spacing.small} 0px;
  }
`;
