import * as React from "react";
import styled from "styled-components";
import AutomationsTable from "../../components/AutomationsTable";
import Page from "../../components/Page";
import { useListAutomations } from "../../hooks/objects";

type Props = {
  className?: string;
};

function Automations({ className }: Props) {
  const { data: automations, error, isLoading } = useListAutomations();

  return (
    <Page error={error} loading={isLoading} className={className}>
      <AutomationsTable automations={automations} />
    </Page>
  );
}

export default styled(Automations).attrs({
  className: Automations.name,
})``;
