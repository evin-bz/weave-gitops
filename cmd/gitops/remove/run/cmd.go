package run

import (
	"github.com/spf13/cobra"
	"github.com/weaveworks/weave-gitops/cmd/gitops/config"
)

func RunCommand(opts *config.Options) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "run",
		Short: "Remove a GitOps Run session",
		RunE:  removeRunRunE(opts),
	}

	return cmd
}

func removeRunRunE(opts *config.Options) func(cmd *cobra.Command, args []string) error {

}
