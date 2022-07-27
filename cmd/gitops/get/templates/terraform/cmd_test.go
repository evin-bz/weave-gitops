package terraform_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/weaveworks/weave-gitops/cmd/gitops/root"
)

func TestEndpointNotSet(t *testing.T) {
	cmd := root.RootCmd()
	cmd.SetArgs([]string{
		"get", "templates", "terraform",
	})

	err := cmd.Execute()
	assert.EqualError(t, err, "the Weave GitOps Enterprise HTTP API endpoint flag (--endpoint) has not been set")
}

func TestTemplateNameIsRequired(t *testing.T) {
	cmd := root.RootCmd()
	cmd.SetArgs([]string{
		"get", "template", "terraform",
		"--list-parameters",
		"--endpoint", "http://localhost:8000",
	})

	err := cmd.Execute()
	assert.EqualError(t, err, "terraform template name is required")
}
