package profiles

import (
	"context"
	"os"

	"github.com/spf13/cobra"
	"github.com/weaveworks/weave-gitops/cmd/gitops/cmderrors"
	"github.com/weaveworks/weave-gitops/cmd/gitops/config"
	"github.com/weaveworks/weave-gitops/cmd/gitops/logger"
	"github.com/weaveworks/weave-gitops/pkg/adapters"
	"github.com/weaveworks/weave-gitops/pkg/services/profiles"
	"k8s.io/cli-runtime/pkg/printers"
)

func ProfilesCommand(opts *config.Options) *cobra.Command {
	cmd := &cobra.Command{
		Use:           "profile",
		Aliases:       []string{"profiles"},
		Short:         "Show information about available profiles",
		Args:          cobra.MaximumNArgs(1),
		SilenceUsage:  true,
		SilenceErrors: true,
		Example: `
	# Get all profiles
	gitops get profiles
	`,
		PreRunE: getProfilesCmdPreRunE(&opts.Endpoint),
		RunE:    getProfilesCmdRunE(opts),
	}

	return cmd
}

func getProfilesCmdPreRunE(endpoint *string) func(*cobra.Command, []string) error {
	return func(c *cobra.Command, s []string) error {
		if *endpoint == "" {
			return cmderrors.ErrNoWGEEndpoint
		}

		return nil
	}
}

func getProfilesCmdRunE(opts *config.Options) func(*cobra.Command, []string) error {
	return func(c *cobra.Command, s []string) error {
		client := adapters.NewHTTPClient().EnableCLIAuth()
		err := client.ConfigureClientWithOptions(opts, os.Stdout)
		if err != nil {
			return err
		}

		w := printers.GetNewTabWriter(os.Stdout)

		defer w.Flush()

		return profiles.NewService(logger.NewCLILogger(os.Stdout)).Get(context.Background(), client, w)
	}
}
