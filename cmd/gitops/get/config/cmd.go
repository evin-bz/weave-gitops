package config

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
	cfg "github.com/weaveworks/weave-gitops/cmd/gitops/config"
	clilogger "github.com/weaveworks/weave-gitops/cmd/gitops/logger"

	"github.com/weaveworks/weave-gitops/pkg/config"
)

func ConfigCommand(opts *cfg.Options) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "config",
		Short: "Prints out the CLI configuration for Weave GitOps",
		Example: `
# Prints out the CLI configuration for Weave GitOps
gitops get config`,
		SilenceUsage:      true,
		SilenceErrors:     true,
		RunE:              getConfigCommandRunE(opts),
		DisableAutoGenTag: true,
	}

	return cmd
}

func getConfigCommandRunE(opts *cfg.Options) func(*cobra.Command, []string) error {
	return func(cmd *cobra.Command, args []string) error {
		var err error

		log := clilogger.NewCLILogger(os.Stdout)

		gitopsConfig, err := config.GetConfig(false)
		if err != nil {
			log.Warningf(config.WrongConfigFormatMsg)
			return err
		}

		log.Successf("Your CLI configuration for Weave GitOps:")

		cfgStr, err := gitopsConfig.String()
		if err != nil {
			log.Failuref("Error printing config")
			return err
		}

		fmt.Println(cfgStr)

		return nil
	}
}
