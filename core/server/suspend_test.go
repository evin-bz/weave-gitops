package server_test

import (
	"context"
	"testing"

	"github.com/fluxcd/helm-controller/api/v2beta1"
	kustomizev1 "github.com/fluxcd/kustomize-controller/api/v1beta2"
	sourcev1 "github.com/fluxcd/source-controller/api/v1beta2"
	. "github.com/onsi/gomega"
	api "github.com/weaveworks/weave-gitops/pkg/api/core"
	"github.com/weaveworks/weave-gitops/pkg/kube"
	"k8s.io/apimachinery/pkg/types"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func TestSuspend_Suspend(t *testing.T) {
	g := NewGomegaWithT(t)

	ctx := context.Background()

	k, err := client.New(k8sEnv.Rest, client.Options{
		Scheme: kube.CreateScheme(),
	})
	g.Expect(err).NotTo(HaveOccurred())

	c, _ := makeGRPCServer(k8sEnv.Rest, t)

	ns := newNamespace(ctx, k, g)

	tests := []struct {
		kind string
		obj  client.Object
	}{
		{
			kind: "GitRepository",
			obj:  makeGitRepo("git-repo-1", ns),
		},
		{
			kind: "HelmRepository",
			obj:  makeHelmRepo("repo-1", ns),
		},
		{
			kind: "Bucket",
			obj:  makeBucket("bucket-1", ns),
		},
		{
			kind: "Kustomization",
			obj:  makeKustomization("kust-1", ns, makeGitRepo("somerepo", ns)),
		},
		{
			kind: "HelmRelease",
			obj:  makeHelmRelease("hr-1", ns, makeHelmRepo("somerepo", ns), makeHelmChart("somechart", ns)),
		},
	}

	for _, tt := range tests {
		t.Run(tt.kind, func(t *testing.T) {
			g := NewGomegaWithT(t)
			g.Expect(k.Create(ctx, tt.obj)).Should(Succeed())

			req := &api.ToggleSuspendResourceRequest{
				Kind:        tt.kind,
				Name:        tt.obj.GetName(),
				Namespace:   tt.obj.GetNamespace(),
				ClusterName: "Default",
				Suspend:     true,
			}

			_, err := c.ToggleSuspendResource(ctx, req)
			g.Expect(err).NotTo(HaveOccurred())

			name := types.NamespacedName{Name: tt.obj.GetName(), Namespace: ns.Name}

			g.Expect(checkSpec(t, k, name, tt.obj)).To(BeTrue())

			req.Suspend = false
			_, err = c.ToggleSuspendResource(ctx, req)
			g.Expect(err).NotTo(HaveOccurred())

			g.Expect(checkSpec(t, k, name, tt.obj)).To(BeFalse())

		})
	}
}

func checkSpec(t *testing.T, k client.Client, name types.NamespacedName, obj client.Object) bool {
	switch v := obj.(type) {
	case *sourcev1.GitRepository:
		if err := k.Get(context.Background(), name, v); err != nil {
			t.Error(err)
		}

		return v.Spec.Suspend
	case *kustomizev1.Kustomization:
		if err := k.Get(context.Background(), name, v); err != nil {
			t.Error(err)
		}

		return v.Spec.Suspend

	case *v2beta1.HelmRelease:
		if err := k.Get(context.Background(), name, v); err != nil {
			t.Error(err)
		}

		return v.Spec.Suspend

	case *sourcev1.Bucket:
		if err := k.Get(context.Background(), name, v); err != nil {
			t.Error(err)
		}

		return v.Spec.Suspend

	case *sourcev1.HelmRepository:
		if err := k.Get(context.Background(), name, v); err != nil {
			t.Error(err)
		}

		return v.Spec.Suspend
	}

	t.Errorf("unsupported object %T", obj)

	return false
}

func TestSuspend_Resume(t *testing.T) {

}
